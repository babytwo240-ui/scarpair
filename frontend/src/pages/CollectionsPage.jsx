import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import collectionService from '../services/collectionService';
import { formatManila } from '../utils/manilaTimeFormatter';

/* ─── Color tokens – 70% White / 30% Green Palette ────────────────── */
const C = {
  // Primary green (30%)
  bright: '#2e7d32',        // Deep green for primary actions
  brightDark: '#1b5e20',    // Darker green for hover
  brightLight: '#4caf50',   // Lighter green for accents
  // Backgrounds (70% white/light tones)
  darker: '#f8fafc',        // Light grey-white background
  surface: '#ffffff',       // Pure white surfaces
  surfaceHigh: '#f1f5f9',   // Light grey for subtle contrast
  // Borders
  border: 'rgba(0,0,0,0.08)',
  borderHover: 'rgba(46,125,50,0.25)',
  // Text (Dark grey for high contrast on white)
  text: '#0f172a',          // Slate 900
  textMid: '#475569',       // Slate 600
  textLow: '#94a3b8',       // Slate 400
  // Status colors
  error: '#dc2626',
  errorBg: 'rgba(220,38,38,0.08)',
  errorBorder: 'rgba(220,38,38,0.25)',
  info: '#2563eb',
  infoBg: 'rgba(37,99,235,0.08)',
  infoBorder: 'rgba(37,99,235,0.2)',
  glowLight: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

const formatLocalDateTime = (isoString) => {
  return formatManila(isoString);
};

const CollectionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [hoveredCollection, setHoveredCollection] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const handleVisibilityChange = () => setIsPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const mm = (e) => setMouse({ x: e.clientX, y: e.clientY });
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', mm);
    window.addEventListener('scroll', sc);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('scroll', sc);
    };
  }, []);

  useEffect(() => {
    if (isPageVisible) {
      loadCollections();
      intervalRef.current = setInterval(loadCollections, 30000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPageVisible]);

  const loadCollections = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let response;
      if (user?.type === 'business') {
        response = await collectionService.getAllCollections();
      } else {
        response = await collectionService.getUserCollections();
      }
      const collectionsData = Array.isArray(response) ? response : (response.data || []);
      setCollections(collectionsData);
    } catch (err) {
      setError(err.message || 'Failed to load collections.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (collectionId) => {
    if (!window.confirm('Are you sure you want to approve this collection request?')) {
      return;
    }
    try {
      await collectionService.approveCollection(collectionId);
      loadCollections();
    } catch (err) {
      setError(err.message || 'Failed to approve collection.');
    }
  };

  const handleSchedule = (collectionId) => {
    navigate(`/collection/schedule/${collectionId}`);
  };

  const handleConfirmCollection = async (collectionId) => {
    if (!window.confirm('Confirm that the collection has been completed?')) {
      return;
    }
    try {
      await collectionService.confirmCollection(collectionId);
      setSuccess('Collection confirmed successfully!');
      setTimeout(() => {
        loadCollections();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to confirm collection.');
    }
  };

  const handleAcceptMaterials = async (collectionId) => {
    if (!window.confirm('Accept materials? This will complete the collection and close the chat.')) {
      return;
    }
    try {
      await collectionService.acceptMaterials(collectionId);
      setSuccess('Materials accepted! Collection completed.');
      setTimeout(() => {
        loadCollections();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to accept materials.');
    }
  };

  const handleCancelCollection = async (collectionId) => {
    if (!window.confirm('Are you sure you want to cancel this collection? The waste post will be returned to the marketplace.')) {
      return;
    }
    try {
      await collectionService.cancelCollection(collectionId);
      setSuccess('Collection cancelled successfully!');
      setError('');
      await loadCollections();
    } catch (err) {
      setError(err.message || 'Failed to cancel collection.');
      setSuccess('');
    }
  };

  const getFilteredCollections = () => {
    return collections.filter((c) => {
      if (activeTab === 'pending') return c.status === 'pending';
      if (activeTab === 'approved') return c.status === 'approved';
      if (activeTab === 'scheduled') return c.status === 'scheduled';
      if (activeTab === 'completed') return c.status === 'completed';
      if (activeTab === 'confirmed') return c.status === 'confirmed';
      if (activeTab === 'cancelled') return c.status === 'cancelled';
      if (activeTab === 'rejected') return c.status === 'rejected';
      return true;
    });
  };

  const filteredCollections = getFilteredCollections();
  const tabCounts = {
    pending: collections.filter((c) => c.status === 'pending').length,
    approved: collections.filter((c) => c.status === 'approved').length,
    scheduled: collections.filter((c) => c.status === 'scheduled').length,
    completed: collections.filter((c) => c.status === 'completed').length,
    confirmed: collections.filter((c) => c.status === 'confirmed').length,
    cancelled: collections.filter((c) => c.status === 'cancelled').length,
    rejected: collections.filter((c) => c.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, marginBottom: 12 }}>Loading collections...</div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.bright, animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: C.error }}>Please login to view collections</p>
          <button onClick={() => navigate('/role-selection')} style={{ padding: '10px 24px', background: C.bright, border: 'none', borderRadius: 8, color: '#ffffff', fontWeight: 700, cursor: 'pointer', marginTop: 16 }} onMouseEnter={e => e.target.style.background = C.brightDark} onMouseLeave={e => e.target.style.background = C.bright}>Login</button>
        </div>
      </div>
    );
  }

  if (user.type === 'business') {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'Outfit', sans-serif", overflowX: 'hidden', color: C.text, position: 'relative' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }`}</style>

        {/* Ambient orbs */}
        <div style={{ position: 'fixed', top: mouse.y - 320, left: mouse.x - 320, width: 640, height: 640, background: `radial-gradient(circle, ${C.glowLight} 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'top 0.35s ease, left 0.35s ease' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.015'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

        <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(255,255,255,0.92)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(24px) saturate(1.5)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
          <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(46,125,50,0.08)', border: `1px solid rgba(46,125,50,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4zM3.444 11H9v5.472A6.002 6.002 0 0 1 3.444 11zm6.556 5.472V11h5.556A6.002 6.002 0 0 1 10 16.472z" fill={C.bright} />
                </svg>
              </div>
              <div>
                <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', fontFamily: "'Cormorant Garamond', serif", color: C.text }}>scrapair</span>
                <div style={{ height: 1.5, background: `linear-gradient(90deg, ${C.bright}, transparent)`, marginTop: 1, width: '100%' }} />
              </div>
            </div>
            <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent', color: C.textLight, cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.color = C.bright; e.target.style.background = C.glowLight; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textLight; e.target.style.background = 'transparent'; }}>← Back</button>
          </div>
        </nav>

        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>
          <div style={{ marginBottom: 60, textAlign: 'center', animation: 'fadeUp 0.7s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 1, background: C.bright }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.bright }}>Management</span>
              <div style={{ width: 40, height: 1, background: C.bright }} />
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 600, letterSpacing: '-1.5px', margin: '0 0 32px', color: C.text, lineHeight: 1.1 }}>Collections Management</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, transition: 'all 0.3s ease', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 40px -12px rgba(0,0,0,0.12)`; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }} onClick={() => navigate('/business/collection-requests')}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>📋</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.bright, margin: '0 0 8px', fontFamily: "'Outfit', sans-serif" }}>New Requests</h3>
                <p style={{ fontSize: 13, color: C.textMid, margin: '0 0 16px', lineHeight: 1.5 }}>Review and approve new collection requests from recyclers. Once approved, recyclers have 1 hour to pick up.</p>
                <div style={{ fontSize: 11, color: C.textLow, fontWeight: 600 }}>1-Hour Workflow →</div>
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, transition: 'all 0.3s ease', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 40px -12px rgba(0,0,0,0.12)`; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }} onClick={() => navigate('/business/pending-approvals')}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.bright, margin: '0 0 8px', fontFamily: "'Outfit', sans-serif" }}>Pending Approvals</h3>
                <p style={{ fontSize: 13, color: C.textMid, margin: '0 0 16px', lineHeight: 1.5 }}>Manage recyclers you've approved. View their pickup status and cancel if needed.</p>
                <div style={{ fontSize: 11, color: C.textLow, fontWeight: 600 }}>Track Progress →</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'Outfit', sans-serif", overflowX: 'hidden', color: C.text, position: 'relative' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }`}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: mouse.y - 320, left: mouse.x - 320, width: 640, height: 640, background: `radial-gradient(circle, ${C.glowLight} 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'top 0.35s ease, left 0.35s ease' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.015'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(255,255,255,0.92)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(24px) saturate(1.5)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(46,125,50,0.08)', border: `1px solid rgba(46,125,50,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4zM3.444 11H9v5.472A6.002 6.002 0 0 1 3.444 11zm6.556 5.472V11h5.556A6.002 6.002 0 0 1 10 16.472z" fill={C.bright} />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', fontFamily: "'Cormorant Garamond', serif", color: C.text }}>scrapair</span>
              <div style={{ height: 1.5, background: `linear-gradient(90deg, ${C.bright}, transparent)`, marginTop: 1, width: '100%' }} />
            </div>
          </div>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent', color: C.textLight, cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.color = C.bright; e.target.style.background = C.glowLight; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textLight; e.target.style.background = 'transparent'; }}>← Back</button>
        </div>
      </nav>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: 48, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.bright }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.bright }}>Tracking</span>
            <div style={{ width: 40, height: 1, background: C.bright }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 600, letterSpacing: '-1.5px', margin: '0 0 16px', color: C.text, lineHeight: 1.1 }}>My Collections</h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: C.textMid, maxWidth: 520, margin: 0 }}>Track all your collection requests and their status</p>
        </div>

        {error && <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2" /><path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round" /></svg><span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span></div>}
        {success && <div style={{ background: C.infoBg, border: `1px solid ${C.infoBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-10.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fill={C.info} /></svg><span style={{ fontSize: 14, color: C.info, fontWeight: 500 }}>{success}</span></div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: 40, overflowX: 'auto', paddingBottom: 8, flexWrap: 'wrap' }}>
          {['pending', 'approved', 'scheduled', 'completed', 'confirmed', 'cancelled', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 18px',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.05em',
                borderRadius: 100,
                border: `1px solid ${activeTab === tab ? 'transparent' : C.border}`,
                background: activeTab === tab ? C.bright : 'transparent',
                color: activeTab === tab ? '#ffffff' : C.bright,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (activeTab !== tab) {
                  e.target.style.borderColor = C.bright;
                  e.target.style.background = C.glowLight;
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== tab) {
                  e.target.style.borderColor = C.border;
                  e.target.style.background = 'transparent';
                }
              }}
            >
              {tab} <span style={{ marginLeft: 6, opacity: 0.7 }}>({tabCounts[tab]})</span>
            </button>
          ))}
        </div>

        {filteredCollections.length === 0 ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 60, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <h3 style={{ fontSize: 22, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif", color: C.text, margin: '0 0 8px' }}>No {activeTab} collections</h3>
            <p style={{ fontSize: 14, color: C.textMid, margin: 0 }}>You haven't made any collection requests with this status</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {filteredCollections.map((collection, index) => {
              const isHovered = hoveredCollection === collection.id;

              return (
                <div
                  key={collection.id}
                  onMouseEnter={() => setHoveredCollection(collection.id)}
                  onMouseLeave={() => setHoveredCollection(null)}
                  style={{
                    background: C.surface,
                    border: `1px solid ${isHovered ? C.borderHover : C.border}`,
                    borderRadius: 12,
                    padding: 24,
                    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: isHovered ? `0 8px 20px rgba(0,0,0,0.08)` : '0 1px 3px rgba(0,0,0,0.05)',
                    animation: `fadeUp 0.4s ease ${index * 0.05}s both`,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: C.bright, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                          {collection.post?.title || 'Collection #' + collection.id}
                        </h4>
                        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 12px', borderRadius: 100, background: collection.status === 'confirmed' || collection.status === 'completed' ? C.glowLight : collection.status === 'approved' ? C.infoBg : collection.status === 'scheduled' ? C.glowLight : collection.status === 'cancelled' ? C.errorBg : C.surfaceHigh, color: collection.status === 'confirmed' || collection.status === 'completed' ? C.bright : collection.status === 'approved' ? C.info : collection.status === 'scheduled' ? C.bright : collection.status === 'cancelled' ? C.error : C.textMid, border: `1px solid ${collection.status === 'confirmed' || collection.status === 'completed' ? C.bright + '33' : collection.status === 'approved' ? C.info + '33' : collection.status === 'scheduled' ? C.bright + '33' : collection.status === 'cancelled' ? C.error + '33' : C.border}` }}>
                          {collection.status}
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
                        {collection.post && (
                          <>
                            <div>
                              <p style={{ fontSize: 11, color: C.textLow, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Material</p>
                              <p style={{ fontSize: 13, color: C.text, fontWeight: 500, margin: 0 }}>{collection.post.title}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: 11, color: C.textLow, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Quantity</p>
                              <p style={{ fontSize: 13, color: C.text, fontWeight: 500, margin: 0 }}>{collection.post.quantity} {collection.post.unit}</p>
                            </div>
                          </>
                        )}
                        {collection.recycler && (
                          <div>
                            <p style={{ fontSize: 11, color: C.textLow, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Recycler</p>
                            <p style={{ fontSize: 13, color: C.text, fontWeight: 500, margin: 0 }}>{collection.recycler.businessName || collection.recycler.companyName}</p>
                          </div>
                        )}
                        {collection.scheduledDate && (
                          <div>
                            <p style={{ fontSize: 11, color: C.textLow, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Scheduled</p>
                            <p style={{ fontSize: 13, color: C.text, fontWeight: 500, margin: 0 }}>{formatLocalDateTime(collection.scheduledDate)}</p>
                          </div>
                        )}
                      </div>
                      {collection.notes && (
                        <p style={{ fontSize: 12, color: C.textMid, margin: 0, paddingTop: 12, borderTop: `1px solid ${C.border}`, marginTop: 12 }}><strong>Notes:</strong> {collection.notes}</p>
                      )}
                      {collection.cancellationReason && (
                        <p style={{ fontSize: 12, color: C.error, margin: 0, paddingTop: 12, borderTop: `1px solid ${C.errorBorder}`, marginTop: 12, background: C.errorBg, padding: 12, borderRadius: 8 }}><strong>Reason:</strong> {collection.cancellationReason.replace(/_/g, ' ')}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexDirection: 'column' }}>
                      {collection.status === 'pending' && (
                        <button onClick={() => handleApprove(collection.id)} style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: 'none', background: C.bright, color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', boxShadow: `0 2px 4px ${C.glowStrong}` }} onMouseEnter={e => { e.target.style.background = C.brightDark; e.target.style.transform = 'scale(1.02)'; }} onMouseLeave={e => { e.target.style.background = C.bright; e.target.style.transform = 'scale(1)'; }}>✓ Approve</button>
                      )}
                      {collection.status === 'approved' && (
                        <>
                          <button onClick={() => handleSchedule(collection.id)} style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.bright, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }} onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.background = C.glowLight; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}>📅 Schedule</button>
                          <button onClick={() => handleCancelCollection(collection.id)} style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: `1px solid ${C.errorBorder}`, background: 'transparent', color: C.error, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }} onMouseEnter={e => { e.target.style.borderColor = C.error; e.target.style.background = C.errorBg; }} onMouseLeave={e => { e.target.style.borderColor = C.errorBorder; e.target.style.background = 'transparent'; }}>✕ Cancel</button>
                        </>
                      )}
                      {collection.status === 'scheduled' && (
                        <button onClick={() => handleConfirmCollection(collection.id)} style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: 'none', background: C.bright, color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', boxShadow: `0 2px 4px ${C.glowStrong}` }} onMouseEnter={e => { e.target.style.background = C.brightDark; e.target.style.transform = 'scale(1.02)'; }} onMouseLeave={e => { e.target.style.background = C.bright; e.target.style.transform = 'scale(1)'; }}>✓ Confirm</button>
                      )}
                      {collection.status === 'confirmed' && (
                        <button onClick={() => handleAcceptMaterials(collection.id)} style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: 'none', background: C.bright, color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', boxShadow: `0 2px 4px ${C.glowStrong}` }} onMouseEnter={e => { e.target.style.background = C.brightDark; e.target.style.transform = 'scale(1.02)'; }} onMouseLeave={e => { e.target.style.background = C.bright; e.target.style.transform = 'scale(1)'; }}>✓ Accept</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default CollectionsPage;