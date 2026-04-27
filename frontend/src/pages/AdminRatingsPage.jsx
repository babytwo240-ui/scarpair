import React, { useState, useEffect } from 'react';
import ratingService from '../services/ratingService';
import '../styles/AdminPages.css';

/* ─── Color tokens – 70% White / 30% Green Palette ────────────────── */
const C = {
  // Primary green (30%)
  primary: '#2e7d32',
  primaryDark: '#1b5e20',
  primaryLight: '#4caf50',
  // Backgrounds (70% white/light tones)
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceHigh: '#f1f5f9',
  // Text
  text: '#0f172a',
  textLight: '#475569',
  textLighter: '#94a3b8',
  // Borders
  border: 'rgba(0,0,0,0.08)',
  borderHover: 'rgba(46,125,50,0.25)',
  // Status colors
  error: '#dc2626',
  errorBg: 'rgba(220,38,38,0.08)',
  errorBorder: 'rgba(220,38,38,0.25)',
  warning: '#d97706',
  warningBg: 'rgba(217,119,6,0.08)',
  warningBorder: 'rgba(217,119,6,0.25)',
  success: '#2e7d32',
  successBg: 'rgba(46,125,50,0.08)',
  // Rating colors
  starGold: '#fbbf24',
  starGray: '#e2e8f0',
  // Glows
  glowLight: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

const AdminRatingsPage = () => {
  const [userRatings, setUserRatings] = useState([]);
  const [postRatings, setPostRatings] = useState([]);
  const [view, setView] = useState('users'); // 'users' or 'posts'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('rating-low'); // 'rating-low', 'rating-high', 'feedback-count'

  useEffect(() => {
    if (view === 'users') {
      fetchUserRatings();
    } else {
      fetchPostRatings();
    }
  }, [view, sortBy]);

  const fetchUserRatings = async () => {
    try {
      setLoading(true);
      setError('');
      const ratings = (await ratingService.getAllUserRatings(1, 100) || []).sort((a, b) => {
        if (sortBy === 'rating-low') return a.averageRating - b.averageRating;
        if (sortBy === 'rating-high') return b.averageRating - a.averageRating;
        if (sortBy === 'feedback-count') return b.totalFeedback - a.totalFeedback;
        return 0;
      });
      setUserRatings(ratings);
    } catch (err) {
      setError(err.message || 'Failed to fetch user ratings');
    } finally {
      setLoading(false);
    }
  };

  const fetchPostRatings = async () => {
    try {
      setLoading(true);
      setError('');
      const ratings = (await ratingService.getAllPostRatings(1, 100) || []).sort((a, b) => {
        if (sortBy === 'rating-low') return a.averageRating - b.averageRating;
        if (sortBy === 'rating-high') return b.averageRating - a.averageRating;
        if (sortBy === 'feedback-count') return b.totalFeedback - a.totalFeedback;
        return 0;
      });
      setPostRatings(ratings);
    } catch (err) {
      setError(err.message || 'Failed to fetch post ratings');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <span key={i} style={{ color: C.starGold, fontSize: '18px' }}>★</span>;
          } else if (i === fullStars && hasHalfStar) {
            return <span key={i} style={{ color: C.starGold, fontSize: '18px' }}>½</span>;
          } else {
            return <span key={i} style={{ color: C.starGray, fontSize: '18px' }}>★</span>;
          }
        })}
      </div>
    );
  };

  const getRatingCategory = (rating) => {
    if (rating < 2) return { label: 'Poor', color: C.error };
    if (rating < 3) return { label: 'Fair', color: C.warning };
    if (rating < 4) return { label: 'Good', color: C.primaryLight };
    if (rating < 4.5) return { label: 'Very Good', color: C.primary };
    return { label: 'Excellent', color: C.primaryDark };
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.primary, animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 14, color: C.textLight }}>Loading ratings...</div>
      </div>
    </div>
  );

  const ratings = view === 'users' ? userRatings : postRatings;
  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.averageRating, 0) / ratings.length).toFixed(2)
    : 0;
  const totalFeedback = ratings.reduce((sum, r) => sum + r.totalFeedback, 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      fontFamily: "'Outfit', sans-serif",
      color: C.text,
      padding: '40px',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.primary }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>Management</span>
            <div style={{ width: 40, height: 1, background: C.primary }} />
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 48,
            fontWeight: 600,
            letterSpacing: '-1.5px',
            margin: '0 0 12px',
            color: C.text
          }}>
            Ratings Management
          </h1>
          <p style={{ fontSize: 15, color: C.textLight, margin: 0 }}>Monitor user and post ratings across the platform</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: C.errorBg,
            border: `1px solid ${C.errorBorder}`,
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2" />
              <path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 13, color: C.error, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
          marginBottom: 32
        }}>
          {[
            { label: `Total ${view === 'users' ? 'Rated Users' : 'Rated Posts'}`, value: ratings.length, icon: view === 'users' ? '👥' : '📋' },
            { label: 'Average Rating', value: `${avgRating} ★`, icon: '⭐' },
            { label: 'Total Feedback', value: totalFeedback, icon: '💬' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{stat.icon}</div>
              <p style={{ fontSize: 12, color: C.textLight, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: C.text, margin: '8px 0 0' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* View Tabs */}
        <div style={{
          display: 'flex',
          gap: 12,
          marginBottom: 24,
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: 12,
        }}>
          <button
            onClick={() => setView('users')}
            style={{
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              background: view === 'users' ? C.primary : 'transparent',
              color: view === 'users' ? '#ffffff' : C.textLight,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (view !== 'users') { e.target.style.color = C.primary; } }}
            onMouseLeave={e => { if (view !== 'users') { e.target.style.color = C.textLight; } }}
          >
            User Ratings ({userRatings.length})
          </button>
          <button
            onClick={() => setView('posts')}
            style={{
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              background: view === 'posts' ? C.primary : 'transparent',
              color: view === 'posts' ? '#ffffff' : C.textLight,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (view !== 'posts') { e.target.style.color = C.primary; } }}
            onMouseLeave={e => { if (view !== 'posts') { e.target.style.color = C.textLight; } }}
          >
            Post Ratings ({postRatings.length})
          </button>
        </div>

        {/* Sort Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          justifyContent: 'flex-end',
        }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 16px',
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              color: C.text,
              fontSize: 13,
              fontFamily: "'Outfit', sans-serif",
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="rating-low">Lowest Rating</option>
            <option value="rating-high">Highest Rating</option>
            <option value="feedback-count">Most Feedback</option>
          </select>
        </div>

        {/* Ratings List */}
        <div>
          {ratings.length === 0 ? (
            <div style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 60,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
              <p style={{ fontSize: 15, color: C.textLight }}>No ratings found.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20
            }}>
              {ratings.map((rating, index) => {
                const ratingCategory = getRatingCategory(rating.averageRating);
                const isLowRating = rating.averageRating < 3;

                return (
                  <div
                    key={rating.id || rating.userId || rating.postId}
                    style={{
                      background: C.surface,
                      border: `1px solid ${isLowRating ? C.warningBorder : C.border}`,
                      borderRadius: 16,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      animation: `fadeUp 0.4s ease ${index * 0.05}s both`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 12px 24px -12px rgba(0,0,0,0.15)`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                    }}
                  >
                    {/* Header */}
                    <div style={{
                      padding: '20px 20px 16px',
                      borderBottom: `1px solid ${C.border}`,
                      background: C.surfaceHigh,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{
                            fontSize: 16,
                            fontWeight: 700,
                            fontFamily: "'Cormorant Garamond', serif",
                            color: C.text,
                            margin: 0
                          }}>
                            {view === 'users' ? `User #${rating.userId}` : `Post #${rating.postId}`}
                          </h4>
                          <p style={{ fontSize: 11, color: C.textLight, margin: '4px 0 0' }}>
                            {view === 'users' ? 'User Rating' : 'Post Rating'}
                          </p>
                        </div>
                        {isLowRating && (
                          <div style={{
                            background: C.warningBg,
                            padding: '4px 8px',
                            borderRadius: 8,
                            fontSize: 10,
                            fontWeight: 700,
                            color: C.warning,
                          }}>
                            ⚠️ Low Rating
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating Display */}
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <div style={{ marginBottom: 12 }}>
                        {renderStars(rating.averageRating)}
                      </div>
                      <p style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: ratingCategory.color,
                        margin: '8px 0 4px'
                      }}>
                        {rating.averageRating.toFixed(2)}
                      </p>
                      <p style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: ratingCategory.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: 0
                      }}>
                        {ratingCategory.label}
                      </p>
                    </div>

                    {/* Stats */}
                    <div style={{
                      padding: '16px 20px',
                      borderTop: `1px solid ${C.border}`,
                      background: C.surfaceHigh,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                      <div>
                        <p style={{ fontSize: 11, color: C.textLight, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Ratings</p>
                        <p style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: '4px 0 0' }}>{rating.totalRatings}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: C.textLight, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Feedback</p>
                        <p style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: '4px 0 0' }}>{rating.totalFeedback}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rating Guide */}
        <div style={{
          marginTop: 48,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "'Cormorant Garamond', serif",
            color: C.text,
            margin: '0 0 16px'
          }}>
            Rating Scale
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12
          }}>
            {[
              { range: '4.5 - 5.0', label: 'Excellent', desc: 'High quality, reliable', color: C.primaryDark },
              { range: '4.0 - 4.4', label: 'Very Good', desc: 'Good experience', color: C.primary },
              { range: '3.0 - 3.9', label: 'Good', desc: 'Acceptable, some room for improvement', color: C.primaryLight },
              { range: '2.0 - 2.9', label: 'Fair', desc: 'Below expectations', color: C.warning },
              { range: '0.0 - 1.9', label: 'Poor', desc: 'Significantly below expectations', color: C.error },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 4,
                  height: 40,
                  background: item.color,
                  borderRadius: 4
                }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: item.color, margin: 0 }}>
                    {item.range} ★
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: 11, color: C.textLight, margin: '2px 0 0' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRatingsPage;