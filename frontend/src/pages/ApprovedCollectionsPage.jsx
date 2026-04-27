import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import wastePostService from '../services/wastePostService';
import { formatManila, formatManilaInput } from '../utils/manilaTimeFormatter';

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

const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const deadlineTime = new Date(deadline);
      const diff = deadlineTime - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <span style={{
      fontSize: 18,
      fontWeight: 800,
      color: timeLeft === 'EXPIRED' ? C.error : C.bright,
      fontFamily: "'DM Mono', monospace",
    }}>
      {timeLeft || '⏱'}
    </span>
  );
};

const ApprovedCollectionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
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
    if (!isPageVisible) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    fetchApprovedCollections();
    intervalRef.current = setInterval(fetchApprovedCollections, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPageVisible, page]);

  const fetchApprovedCollections = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wastePostService.getMyApprovedCollections(page, 20);
      setCollections(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load approved collections');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPickedUp = async (postId) => {
    if (!window.confirm('Are you ready to mark this waste as picked up? This action cannot be undone.')) {
      return;
    }

    try {
      await wastePostService.markAsPickedUp(postId);
      alert('✅ Waste marked as picked up! Collection completed.');
      fetchApprovedCollections();
    } catch (err) {
      alert('❌ Error: ' + (err.message || 'Failed to mark as picked up'));
    }
  };

  if (loading && collections.length === 0) {
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
          <p style={{ fontSize: 16, color: C.error }}>Please login to view approved collections</p>
          <button onClick={() => navigate('/role-selection')} style={{ padding: '10px 24px', background: C.bright, border: 'none', borderRadius: 8, color: '#ffffff', fontWeight: 700, cursor: 'pointer', marginTop: 16 }} onMouseEnter={e => e.target.style.background = C.brightDark} onMouseLeave={e => e.target.style.background = C.bright}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'Outfit', sans-serif", overflowX: 'hidden', color: C.text, position: 'relative' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-2deg); }
        }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,125,50,0.04) 0%, transparent 65%)',
          animation: 'floatA 14s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '-8%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,125,50,0.03) 0%, transparent 65%)',
          animation: 'floatB 18s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(46,125,50,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,125,50,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }} />
      </div>

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
        <div style={{ marginBottom: 60, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.bright }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.bright }}>Pickups</span>
            <div style={{ width: 40, height: 1, background: C.bright }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 600, letterSpacing: '-1.5px', margin: '0 0 12px', color: C.text, lineHeight: 1.1 }}>
            Approved Collections
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: C.textMid, margin: 0, maxWidth: 600 }}>
            You have 1 hour to pick up after approval. Confirm pickup below.
          </p>
        </div>

        {error && <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2" /><path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round" /></svg><span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span></div>}

        {collections.length === 0 ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 60, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h3 style={{ fontSize: 22, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif", color: C.text, margin: '0 0 8px' }}>No approved collections</h3>
            <p style={{ fontSize: 14, color: C.textMid, margin: '0 0 24px' }}>No waste awaiting pickup at the moment</p>
            <button onClick={() => navigate('/recycler/dashboard')} style={{ padding: '12px 28px', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', borderRadius: 8, border: 'none', background: C.bright, color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 2px 8px ${C.glowStrong}` }} onMouseEnter={e => { e.target.style.background = C.brightDark; e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = `0 6px 16px ${C.glowStrong}`; }} onMouseLeave={e => { e.target.style.background = C.bright; e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = `0 2px 8px ${C.glowStrong}`; }}>Browse Marketplace</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {collections.map((collection, index) => {
              const isHovered = hoveredCollection === collection.id;
              const isExpired = collection.pickupDeadline && new Date(collection.pickupDeadline) < new Date();

              return (
                <div
                  key={collection.id}
                  onMouseEnter={() => setHoveredCollection(collection.id)}
                  onMouseLeave={() => setHoveredCollection(null)}
                  style={{
                    background: C.surface,
                    border: `1px solid ${isHovered ? C.borderHover : C.border}`,
                    borderRadius: 16,
                    padding: 28,
                    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: isHovered ? `0 12px 24px -12px rgba(0,0,0,0.12)` : '0 1px 3px rgba(0,0,0,0.05)',
                    animation: `fadeUp 0.4s ease ${index * 0.05}s both`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: C.bright, margin: '0 0 4px' }}>{collection.title}</h3>
                      <p style={{ fontSize: 13, color: C.textLow, margin: 0 }}>{collection.wasteType} • {collection.quantity} {collection.unit}</p>
                    </div>
                    <div style={{ background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: 12, padding: '8px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: C.textLow, fontWeight: 600, marginBottom: 4, letterSpacing: '0.05em' }}>TIME REMAINING</div>
                      <CountdownTimer deadline={collection.pickupDeadline} />
                    </div>
                  </div>

                  <div style={{ background: C.surfaceHigh, borderRadius: 12, padding: 20, marginBottom: 24, border: `1px solid ${C.border}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                      <div>
                        <p style={{ fontSize: 10, color: C.textLow, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Location</p>
                        <p style={{ fontSize: 14, color: C.text, fontWeight: 600, margin: 0 }}>{collection.address}</p>
                        <p style={{ fontSize: 13, color: C.textMid, margin: '2px 0 0' }}>{collection.city}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: C.textLow, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Business</p>
                        <p style={{ fontSize: 14, color: C.text, fontWeight: 600, margin: 0 }}>{collection.business?.businessName}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: C.textLow, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Proposed Pickup</p>
                        <p style={{ fontSize: 14, color: C.text, fontWeight: 600, margin: 0 }}>{collection.scheduledDate ? formatManilaInput(collection.scheduledDate) : '—'}</p>
                      </div>
                    </div>
                    {collection.description && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 10, color: C.textLow, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Details</p>
                        <p style={{ fontSize: 13, color: C.textMid, margin: 0, lineHeight: 1.5 }}>{collection.description}</p>
                      </div>
                    )}
                  </div>

                  {collection.collectionStatus === 'APPROVED' && (
                    <button
                      onClick={() => handleMarkAsPickedUp(collection.id)}
                      style={{
                        width: '100%',
                        padding: '14px 24px',
                        fontSize: 14,
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        borderRadius: 8,
                        border: 'none',
                        background: isExpired ? C.error : C.bright,
                        color: '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isExpired ? 'none' : `0 2px 8px ${C.glowStrong}`,
                      }}
                      onMouseEnter={e => {
                        if (!isExpired) {
                          e.target.style.background = C.brightDark;
                          e.target.style.transform = 'scale(1.01)';
                          e.target.style.boxShadow = `0 4px 12px ${C.glowStrong}`;
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isExpired) {
                          e.target.style.background = C.bright;
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = `0 2px 8px ${C.glowStrong}`;
                        }
                      }}
                    >
                      {isExpired ? '⏰ PICKUP EXPIRED' : '✓ Confirm Pickup'}
                    </button>
                  )}

                  {(collection.collectionStatus === 'PICKED_UP' || collection.collectionStatus === 'COMPLETED') && (
                    <div style={{ background: C.successBg, border: `1px solid ${C.bright}33`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                      <p style={{ fontSize: 13, color: C.bright, fontWeight: 600, margin: 0 }}>✅ Picked up on {formatManila(collection.pickedUpAt)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ApprovedCollectionsPage;