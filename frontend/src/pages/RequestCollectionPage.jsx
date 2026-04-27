import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import collectionService from '../services/collectionService';
import wastePostService from '../services/wastePostService';
import { convertBrowserLocalToManilaTime } from '../utils/datetimeLocalConverter';

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
  success: '#2e7d32',
  successBg: 'rgba(46,125,50,0.08)',
  successBorder: 'rgba(46,125,50,0.25)',
  // Glows
  glow: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

const RequestCollectionPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [post, setPost] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState(null);

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
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await wastePostService.getWastePostById(postId);
      setPost(response);
    } catch (err) {
      setError(err.message || 'Failed to load waste post.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('You must be logged in to request a collection.');
      return;
    }

    setSubmitting(true);

    try {
      let manilaScheduledDate = scheduledDate;
      if (scheduledDate) {
        manilaScheduledDate = convertBrowserLocalToManilaTime(scheduledDate);
      }

      const response = await collectionService.requestCollection(parseInt(postId), manilaScheduledDate);

      if (response.data?.forceApproved) {
        setSuccess('✅ Collection request submitted and auto-approved!');
      } else if (response.data?.cancelLocked) {
        setSuccess('⚠️ Collection request submitted. This request cannot be cancelled.');
      } else {
        setSuccess('Collection request submitted successfully! Redirecting...');
      }
      setTimeout(() => {
        navigate('/collections');
      }, 2000);
    } catch (err) {
      if (err.cause?.code === 'MAX_REQUESTS_EXCEEDED') {
        setError('❌ You have already requested this post 4 times. You cannot request it again.');
      } else {
        setError(err.message || 'Failed to submit collection request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, marginBottom: 12 }}>Loading waste post details...</div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.bright, animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!post || !user || user.type !== 'recycler') {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: C.error, marginBottom: 24 }}>{!post ? 'Post not found' : 'Only recyclers can request collections'}</p>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', background: C.bright, border: 'none', borderRadius: 8, color: '#ffffff', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.background = C.brightDark} onMouseLeave={e => e.target.style.background = C.bright}>Back</button>
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

      {/* Mouse-following green glow */}
      <div style={{ position: 'fixed', top: mouse.y - 320, left: mouse.x - 320, width: 640, height: 640, background: `radial-gradient(circle, ${C.glow} 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'top 0.35s ease, left 0.35s ease' }} />

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
          <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent', color: C.textLight, cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.color = C.bright; e.target.style.background = C.glow; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textLight; e.target.style.background = 'transparent'; }}>← Back</button>
        </div>
      </nav>

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: 60, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.bright }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.bright }}>Collection Request</span>
            <div style={{ width: 40, height: 1, background: C.bright }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 600, letterSpacing: '-1.5px', margin: '0 0 12px', color: C.text, lineHeight: 1.1 }}>
            Request Collection
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: C.textMid, margin: 0, maxWidth: 500 }}>
            Submit your collection request for this waste material
          </p>
        </div>

        {error && (
          <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2" />
              <path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" fill={C.success} />
            </svg>
            <span style={{ fontSize: 14, color: C.success, fontWeight: 500 }}>{success}</span>
          </div>
        )}

        {/* Waste Material Details Card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, marginBottom: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: C.bright, margin: '0 0 24px' }}>📋 Waste Material Details</h2>
          <div style={{ display: 'grid', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textLow, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Material Type</label>
              <p style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: 0 }}>{post.wasteType || 'N/A'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textLow, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Quantity</label>
                <p style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: 0 }}>{post.quantity} {post.unit || 'units'}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textLow, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Condition</label>
                <p style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: 0, textTransform: 'capitalize' }}>{post.condition || 'N/A'}</p>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textLow, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Description</label>
              <p style={{ fontSize: 14, color: C.textMid, margin: 0, lineHeight: 1.6 }}>{post.description || 'No description provided'}</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textLow, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Location</label>
              <p style={{ fontSize: 14, color: C.text, margin: 0, fontWeight: 500 }}>{post.location || post.city || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmit} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: C.bright, margin: '0 0 28px' }}>📅 Proposed Pickup</h2>
          <div style={{ display: 'grid', gap: 24, marginBottom: 32 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Proposed Date & Time (Optional)</label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                onFocus={() => setFocusedField('datetime')}
                onBlur={() => setFocusedField(null)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${focusedField === 'datetime' ? C.borderHover : C.border}`,
                  borderRadius: 8,
                  background: C.surfaceHigh,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxShadow: focusedField === 'datetime' ? `0 0 0 3px ${C.glow}` : 'none',
                  cursor: 'pointer'
                }}
              />
              <small style={{ display: 'block', marginTop: 8, color: C.textLow, fontSize: 12 }}>💡 Suggest when you'd like to pick up these materials. The business owner can approve or adjust this.</small>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                color: C.bright,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.background = C.glow; }}
              onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '12px 24px',
                background: submitting ? C.textLow : C.bright,
                border: 'none',
                borderRadius: 8,
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: submitting ? 'none' : `0 2px 8px ${C.glowStrong}`,
                opacity: submitting ? 0.6 : 1
              }}
              onMouseEnter={e => {
                if (!submitting) {
                  e.target.style.background = C.brightDark;
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = `0 4px 12px ${C.glowStrong}`;
                }
              }}
              onMouseLeave={e => {
                if (!submitting) {
                  e.target.style.background = C.bright;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 2px 8px ${C.glowStrong}`;
                }
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Collection Request'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default RequestCollectionPage; 