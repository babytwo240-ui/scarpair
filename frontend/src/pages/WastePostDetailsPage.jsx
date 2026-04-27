import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import wastePostService from '../services/wastePostService';
import messageService from '../services/messageService';
import FeedbackForm from '../components/FeedbackForm';

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
  textLight: '#475569',     // Slate 600 (alias for consistency)
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

const WastePostDetailsPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);

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
    loadPostDetails();
  }, [postId]);

  const loadPostDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wastePostService.getWastePostById(postId);
      const postData = response.data || response;
      setPost(postData);

      if (postData.collectionId) {
        try {
          const collectionResponse = await fetch(`/api/collections/${postData.collectionId}`);
          if (collectionResponse.ok) {
            const collData = await collectionResponse.json();
            setCollection(collData.data || collData);
          }
        } catch (collErr) { }
      }
    } catch (err) {
      setError(err.message || 'Failed to load waste post details');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageBusiness = async () => {
    if (!user) {
      navigate('/role-selection');
      return;
    }

    if (!post || !post.businessId) {
      setError('Business information not available');
      return;
    }

    try {
      setMessageLoading(true);
      const response = await messageService.startConversation(post.businessId, post.id);
      const conversationId = response.data?.id || response.id;

      if (conversationId) {
        navigate(`/messages/${conversationId}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to open conversation with business');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleRequestCollection = () => {
    if (!user) {
      navigate('/role-selection');
      return;
    }
    navigate(`/collection/request/${postId}`);
  };

  const getStatusBadge = (status) => {
    if (status === 'in-collection') return { label: '📦 In Collection', color: C.info };
    if (status === 'collected') return { label: '✅ Collected', color: C.bright };
    return { label: '✨ Available', color: C.bright };
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, marginBottom: 12 }}>Loading post...</div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.bright, animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: '0 0 16px' }}>Post not found</h2>
          <button onClick={() => navigate('/recycler/dashboard')} style={{ padding: '12px 28px', fontSize: 13, fontWeight: 700, borderRadius: 8, border: 'none', background: C.bright, color: '#ffffff', cursor: 'pointer', boxShadow: `0 2px 8px ${C.glowStrong}` }} onMouseEnter={e => { e.target.style.boxShadow = `0 4px 16px ${C.glowStrong}`; e.target.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.target.style.boxShadow = `0 2px 8px ${C.glowStrong}`; e.target.style.transform = 'translateY(0)'; }}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge(post.status);
  const images = post.images && post.images.length > 0 ? post.images : [post.imageUrl].filter(Boolean);

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

      <section style={{ maxWidth: 1300, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>
        {error && <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2" /><path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round" /></svg><span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span></div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start', marginBottom: 60 }}>
          {/* Left: Images */}
          <div>
            {images.length > 0 ? (
              <>
                <div style={{ marginBottom: 20, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}`, background: C.surfaceHigh, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <img src={images[selectedImage]} alt={post.title} style={{ width: '100%', height: 400, objectFit: 'cover' }} />
                </div>
                {images.length > 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12 }}>
                    {images.map((img, idx) => (
                      <div key={idx} onClick={() => setSelectedImage(idx)} style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', border: `2px solid ${selectedImage === idx ? C.bright : C.border}`, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHover} onMouseLeave={e => e.currentTarget.style.borderColor = selectedImage === idx ? C.bright : C.border}>
                        <img src={img} alt={`${post.title} ${idx + 1}`} style={{ width: '100%', height: 80, objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ width: '100%', height: 400, borderRadius: 16, background: C.surfaceHigh, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 48 }}>📷</span>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div style={{ animation: 'fadeUp 0.5s ease both' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>{post.title}</h1>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 14px', borderRadius: 100, background: C.glowLight, color: badge.color, border: `1px solid ${badge.color}` }}>
                  {badge.label}
                </div>
              </div>
              <p style={{ fontSize: 15, color: C.textMid, margin: 0 }}>Posted by <strong style={{ color: C.bright }}>{post.business?.businessName || 'Business'}</strong></p>
            </div>

            {/* Specs Grid */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Waste Type</p>
                  <p style={{ fontSize: 14, color: C.bright, fontWeight: 600, margin: 0 }}>{post.wasteType}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Quantity</p>
                  <p style={{ fontSize: 14, color: C.bright, fontWeight: 600, margin: 0 }}>{post.quantity} {post.unit}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Condition</p>
                  <p style={{ fontSize: 14, color: C.text, fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{post.condition}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Posted</p>
                  <p style={{ fontSize: 14, color: C.text, fontWeight: 600, margin: 0 }}>{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>📍 Location</p>
              <p style={{ fontSize: 14, color: C.text, fontWeight: 600, margin: '0 0 4px' }}>{post.address}</p>
              <p style={{ fontSize: 13, color: C.textMid, margin: 0 }}>{post.city}</p>
              {post.latitude && post.longitude && (
                <p style={{ fontSize: 12, color: C.textLow, margin: '8px 0 0' }}>📌 {parseFloat(post.latitude).toFixed(4)}, {parseFloat(post.longitude).toFixed(4)}</p>
              )}
            </div>

            {/* Business Rating */}
            {post.business && post.business.id && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>⭐ Business Rating</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 24, color: C.bright }}>⭐⭐⭐⭐</div>
                  <div>
                    <p style={{ fontSize: 20, fontWeight: 800, color: C.bright, margin: 0 }}>4.0</p>
                    <p style={{ fontSize: 12, color: C.textLow, margin: '4px 0 0' }}>Based on collections</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={handleMessageBusiness} disabled={messageLoading} style={{ padding: '14px 24px', fontSize: 14, fontWeight: 700, letterSpacing: '0.05em', borderRadius: 8, border: 'none', background: C.bright, color: '#ffffff', cursor: messageLoading ? 'not-allowed' : 'pointer', transition: 'all 0.25s ease', opacity: messageLoading ? 0.6 : 1, boxShadow: `0 2px 8px ${C.glowStrong}` }} onMouseEnter={e => { if (!messageLoading) { e.target.style.background = C.brightDark; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `0 6px 16px ${C.glowStrong}`; } }} onMouseLeave={e => { if (!messageLoading) { e.target.style.background = C.bright; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 2px 8px ${C.glowStrong}`; } }}>
                {messageLoading ? '...' : '💬 Message'}
              </button>
              <button onClick={handleRequestCollection} disabled={post.status === 'in-collection' || post.status === 'collected'} style={{ padding: '14px 24px', fontSize: 14, fontWeight: 700, letterSpacing: '0.05em', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: post.status === 'in-collection' || post.status === 'collected' ? C.textLow : C.bright, cursor: post.status === 'in-collection' || post.status === 'collected' ? 'not-allowed' : 'pointer', opacity: post.status === 'in-collection' || post.status === 'collected' ? 0.5 : 1, transition: 'all 0.25s ease' }} onMouseEnter={e => { if (post.status !== 'in-collection' && post.status !== 'collected') { e.target.style.borderColor = C.bright; e.target.style.background = C.glowLight; e.target.style.transform = 'translateY(-2px)'; } }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; e.target.style.transform = 'translateY(0)'; }}>
                {post.status === 'in-collection' ? '📦 In Progress' : post.status === 'collected' ? '✅ Collected' : '🚚 Request Collection'}
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, marginBottom: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>Description</p>
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8, margin: 0 }}>{post.description}</p>
        </div>

        {/* Post Rating */}
        {post && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, marginBottom: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 20px' }}>⭐ Post Rating</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 32, color: C.bright }}>⭐⭐⭐⭐⭐</div>
              <div>
                <p style={{ fontSize: 24, fontWeight: 800, color: C.bright, margin: 0 }}>5.0</p>
                <p style={{ fontSize: 13, color: C.textLow, margin: '6px 0 0' }}>Excellent waste material quality</p>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Form */}
        {post && collection && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 20px' }}>📝 Feedback</p>
            <FeedbackForm collectionId={collection.id} business={collection.business} recycler={collection.recycler} onSubmitSuccess={loadPostDetails} />
          </div>
        )}

        {post && !collection && post.collectionId && (
          <div style={{ background: C.infoBg, border: `1px solid ${C.infoBorder}`, borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 14, color: C.info, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>ℹ️</span>
              Feedback form available after collection details are loaded.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default WastePostDetailsPage;