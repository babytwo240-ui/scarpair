import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import wastePostService from '../services/wastePostService';

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
  glowLight: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

const MyPostsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc);
    return () => window.removeEventListener('scroll', sc);
  }, []);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await wastePostService.getUserWastePosts(1, 100);
      setPosts(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    setDeletingId(postId);
    try {
      await wastePostService.deleteWastePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      setError(err.message || 'Failed to delete post.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (postId) => {
    navigate(`/waste-post/edit/${postId}`);
  };

  const handleViewDetails = (postId) => {
    navigate(`/waste-post/${postId}`);
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, marginBottom: 20 }}>Please login to view your posts.</p>
          <Link to="/role-selection" style={{ padding: '12px 28px', background: C.bright, color: '#ffffff', textDecoration: 'none', borderRadius: 8, fontWeight: 700, display: 'inline-block', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.background = C.brightDark; e.target.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.target.style.background = C.bright; e.target.style.transform = 'translateY(0)'; }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'Outfit', sans-serif", overflowX: 'hidden', color: C.text, position: 'relative' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
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

      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-2deg); }
        }
      `}</style>

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(255,255,255,0.92)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(24px) saturate(1.5)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/business/dashboard')}>
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
          <button
            onClick={() => navigate('/waste-post/create')}
            style={{
              padding: '12px 28px',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.06em',
              borderRadius: 8,
              border: 'none',
              background: C.bright,
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: `0 2px 8px ${C.glowStrong}`,
            }}
            onMouseEnter={e => {
              e.target.style.background = C.brightDark;
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = `0 4px 12px ${C.glowStrong}`;
            }}
            onMouseLeave={e => {
              e.target.style.background = C.bright;
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 2px 8px ${C.glowStrong}`;
            }}
          >
            + Create Post
          </button>
        </div>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '80px 40px 60px', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ marginBottom: 72, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.bright }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.bright }}>Inventory</span>
            <div style={{ width: 40, height: 1, background: C.bright }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 600, letterSpacing: '-1.5px', color: C.text, margin: 0, lineHeight: 1.1, marginBottom: 12 }}>
            My Waste Posts
          </h1>
          <p style={{ fontSize: 16, color: C.textMid, maxWidth: 500, lineHeight: 1.7, margin: 0 }}>
            View and manage all your posted materials. Monitor status, edit details, or create new listings.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: C.errorBg,
            border: `1px solid ${C.errorBorder}`,
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2" />
              <path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.bright, animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <div style={{ fontSize: 16, color: C.textMid }}>Loading your posts...</div>
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: '80px 40px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>📭</div>
            <h2 style={{ fontSize: 24, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif", color: C.text, margin: '0 0 12px' }}>
              No posts yet
            </h2>
            <p style={{ fontSize: 16, color: C.textMid, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
              You haven't created any waste posts. Start by listing your first material and connect with recyclers.
            </p>
            <button
              onClick={() => navigate('/waste-post/create')}
              style={{
                padding: '14px 40px',
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.06em',
                borderRadius: 8,
                border: 'none',
                background: C.bright,
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: `0 2px 8px ${C.glowStrong}`,
              }}
              onMouseEnter={e => {
                e.target.style.background = C.brightDark;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 6px 16px ${C.glowStrong}`;
              }}
              onMouseLeave={e => {
                e.target.style.background = C.bright;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = `0 2px 8px ${C.glowStrong}`;
              }}
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {posts.map((post, index) => (
              <div
                key={post.id}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  animation: `fadeUp 0.4s ease ${index * 0.05}s both`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = C.borderHover;
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 20px 40px -12px rgba(0,0,0,0.12)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                }}
              >
                {/* Image */}
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    style={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                    }}
                  />
                )}

                {/* Content */}
                <div style={{ padding: '28px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Status Badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 16,
                    width: 'fit-content',
                  }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: post.status === 'active' ? C.bright : '#d97706',
                    }} />
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: post.status === 'active' ? C.bright : '#d97706',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      {post.status || 'Inactive'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: 20,
                    fontWeight: 700,
                    fontFamily: "'Cormorant Garamond', serif",
                    color: C.text,
                    margin: '0 0 12px',
                    letterSpacing: '-0.3px',
                  }}>
                    {post.title}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: 14,
                    color: C.textMid,
                    lineHeight: 1.6,
                    margin: '0 0 20px',
                    flex: 1,
                  }}>
                    {post.description?.substring(0, 100)}{post.description?.length > 100 ? '...' : ''}
                  </p>

                  {/* Meta Info */}
                  <div style={{
                    display: 'grid',
                    gap: 10,
                    marginBottom: 24,
                    fontSize: 13,
                    color: C.textLow,
                  }}>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.textLow, marginBottom: 4 }}>Type</div>
                        <div style={{ fontWeight: 600, color: C.text }}>{post.wasteType}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.textLow, marginBottom: 4 }}>Condition</div>
                        <div style={{ fontWeight: 600, color: C.text }}>{post.condition}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.textLow, marginBottom: 4 }}>Quantity</div>
                        <div style={{ fontWeight: 600, color: C.text }}>{post.quantity} {post.unit}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
                    <button
                      onClick={() => handleViewDetails(post.id)}
                      style={{
                        padding: '10px 16px',
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 8,
                        border: `1px solid ${C.border}`,
                        background: 'transparent',
                        color: C.text,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.background = C.glowLight; e.target.style.color = C.bright; }}
                      onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; e.target.style.color = C.text; }}
                    >
                      👁 View
                    </button>

                    <button
                      onClick={() => handleEdit(post.id)}
                      style={{
                        padding: '10px 16px',
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 8,
                        border: `1px solid ${C.border}`,
                        background: C.glowLight,
                        color: C.bright,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.background = C.glowLight; e.target.style.color = C.brightDark; }}
                      onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = C.glowLight; e.target.style.color = C.bright; }}
                    >
                      ✎ Edit
                    </button>

                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      style={{
                        padding: '10px 16px',
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 8,
                        border: 'none',
                        background: C.error,
                        color: '#ffffff',
                        cursor: deletingId === post.id ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        gridColumn: '1 / -1',
                        opacity: deletingId === post.id ? 0.6 : 1,
                      }}
                      onMouseEnter={e => {
                        if (deletingId !== post.id) {
                          e.target.style.background = '#b91c1c';
                          e.target.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={e => {
                        e.target.style.background = C.error;
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      {deletingId === post.id ? '🗑 Deleting...' : '🗑 Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '48px 40px', position: 'relative', zIndex: 2, background: C.surface }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', textAlign: 'center', color: C.textLow, fontSize: 13 }}>
          <p style={{ margin: 0 }}>© 2026 ScraPair. Managing waste, building sustainability.</p>
        </div>
      </footer>
    </div>
  );
};

export default MyPostsPage;