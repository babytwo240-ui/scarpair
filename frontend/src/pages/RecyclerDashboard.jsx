import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import wastePostService from '../services/wastePostService';
import messageService from '../services/messageService';

/* ─── Color tokens – 70% White / 30% Green Palette ────────────────── */
const C = {
  // Primary green (30%)
  primary: '#2e7d32',        // Deep green for primary actions
  primaryDark: '#1b5e20',    // Darker green for hover
  primaryLight: '#4caf50',   // Lighter green for accents
  // Backgrounds (70% white/light tones)
  bg: '#f8fafc',              // Light grey-white background
  bgDeep: '#f1f5f9',          // Slightly deeper light background
  surface: '#ffffff',         // Pure white surfaces
  surfaceHigh: '#f8fafc',     // Light surfaces
  cardHover: '#f1f5f9',       // Hover state
  // Text (Dark grey for high contrast on white)
  text: '#0f172a',            // Slate 900
  textLight: '#475569',       // Slate 600
  textLighter: '#94a3b8',     // Slate 400
  // Borders and accents
  border: 'rgba(0,0,0,0.08)',
  borderHover: 'rgba(46,125,50,0.25)',
  danger: '#dc2626',
  dangerDark: '#b91c1c',
  dangerBg: 'rgba(220,38,38,0.08)',
  error: '#dc2626',
  errorBg: 'rgba(220,38,38,0.08)',
  errorBorder: 'rgba(220,38,38,0.25)',
  glowLight: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

/* ─── Inline keyframes ─────────────────────────────────────────────── */
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes floatA {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-18px) rotate(3deg); }
  }
  @keyframes floatB {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-12px) rotate(-2deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .green-shimmer {
    background: linear-gradient(90deg, #2e7d32 0%, #4caf50 40%, #2e7d32 60%, #1b5e20 100%);
    background-size: 800px 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #e2e8f0; }
  ::-webkit-scrollbar-thumb { background: rgba(46,125,50,0.3); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(46,125,50,0.6); }
`;

/* ─── Ambient orb background (soft green for light theme) ──────────── */
function AmbientOrbs() {
  return (
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
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(241,245,249,0.6) 100%)',
      }} />
    </div>
  );
}

/* ─── Logo Mark (green gradient) ───────────────────────────────────── */
function LogoMark({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 4px 12px rgba(46,125,50,0.2), inset 0 1px 0 rgba(255,255,255,0.2)`,
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
        borderRadius: `${size * 0.28}px ${size * 0.28}px 0 0`,
      }} />
      <svg width={size * 0.48} height={size * 0.48} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8L12 3L20 8L12 13L4 8Z" />
        <path d="M4 14L12 19L20 14" />
        <path d="M4 11L12 16L20 11" />
      </svg>
    </div>
  );
}

const RecyclerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [filters, setFilters] = useState({
    wasteType: '',
    city: '',
    searchQuery: '',
  });

  useEffect(() => {
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc);
    return () => window.removeEventListener('scroll', sc);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wastePostService.getMarketplace({
        wasteType: filters.wasteType,
        city: filters.city,
        searchQuery: filters.searchQuery,
      });
      setMaterials(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const fetchCategories = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/waste-posts/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setCategories([]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRequestCollection = (postId) => {
    if (!user) {
      navigate('/role-selection');
      return;
    }
    navigate(`/collection/request/${postId}`);
  };

  const handleMessageBusiness = async (businessId, postId) => {
    if (!user) {
      navigate('/role-selection');
      return;
    }
    try {
      const response = await messageService.startConversation(businessId, postId);
      const conversationId = response.data?.id || response.id;
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      alert('Failed to message business: ' + err.message);
    }
  };

  const quickActions = [
    { icon: '💬', title: 'Messages', desc: 'Chat with businesses about materials', route: '/messages' },
    { icon: '🔔', title: 'Notifications', desc: 'View collection updates and alerts', route: '/notifications' },
    { icon: '✓', title: 'Approved Collections', desc: 'Manage your approved pickups', route: '/recycler/approved-collections' },
    { icon: '📦', title: 'My Collections', desc: 'Track all your collection requests', route: '/collections' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      fontFamily: "'Outfit', system-ui, sans-serif",
      overflowX: 'hidden',
      color: C.text,
      position: 'relative',
    }}>
      <style>{KEYFRAMES}</style>
      <AmbientOrbs />

      {/* ══════════ NAVBAR (sticky, glass, light theme) ════════════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrollY > 30
          ? 'rgba(255,255,255,0.92)'
          : 'transparent',
        backdropFilter: scrollY > 30 ? 'blur(24px) saturate(1.5)' : 'none',
        borderBottom: scrollY > 30 ? `1px solid ${C.border}` : '1px solid transparent',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <LogoMark size={38} />
            <div>
              <span style={{
                fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px',
                fontFamily: "'Cormorant Garamond', serif",
                color: C.text,
              }}>scrapair</span>
              <div style={{ height: 1.5, background: `linear-gradient(90deg, ${C.primary}, transparent)`, marginTop: 1, width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => navigate('/edit-profile')}
              style={{
                padding: '8px 18px',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                background: 'transparent',
                color: C.textLight,
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.target.style.borderColor = C.primary; e.target.style.color = C.primary; e.target.style.background = C.glowLight; }}
              onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textLight; e.target.style.background = 'transparent'; }}
            >
              ⚙️ Profile
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 18px',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderRadius: 6,
                border: 'none',
                background: C.danger,
                color: 'white',
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.target.style.background = C.dangerDark; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.background = C.danger; e.target.style.transform = 'translateY(0)'; }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '60px 40px 100px', position: 'relative', zIndex: 2 }}>

        {/* Header with green accent */}
        <div style={{ marginBottom: 56, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.primary }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>
              Dashboard
            </span>
            <div style={{ width: 40, height: 1, background: C.primary }} />
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 56,
            fontWeight: 600,
            letterSpacing: '-1.5px',
            margin: '0 0 16px',
            color: C.text,
            lineHeight: 1.1,
          }}>
            Welcome back, {user?.companyName || 'Recycler'}
          </h1>
          <p style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: C.textLight,
            margin: 0,
          }}>
            Find and manage waste materials from verified businesses
          </p>
        </div>

        {/* Quick Action Cards – white cards with green accents */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 60 }}>
          {quickActions.map((action, i) => (
            <div
              key={i}
              onClick={() => navigate(action.route)}
              onMouseEnter={() => setHoveredCard(action.title)}
              onMouseLeave={() => setHoveredCard(null)}
              className="role-card"
              style={{
                background: C.surface,
                border: `1px solid ${hoveredCard === action.title ? C.borderHover : C.border}`,
                borderRadius: 12,
                padding: 28,
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: hoveredCard === action.title ? 'translateY(-6px)' : 'translateY(0)',
                boxShadow: hoveredCard === action.title
                  ? `0 20px 40px -12px rgba(0,0,0,0.12), 0 0 0 1px ${C.borderHover}`
                  : '0 1px 3px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: 3,
                background: `linear-gradient(90deg, transparent, ${C.primary}, transparent)`,
                transform: hoveredCard === action.title ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform 0.4s ease',
              }} />
              <div style={{ fontSize: 36, marginBottom: 16 }}>{action.icon}</div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                fontFamily: "'Cormorant Garamond', serif",
                color: C.text,
                margin: '0 0 8px',
                letterSpacing: '-0.3px',
              }}>{action.title}</h3>
              <p style={{ fontSize: 13, color: C.textLight, margin: 0, lineHeight: 1.6 }}>{action.desc}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter Section */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 32,
          marginBottom: 48,
          transition: 'all 0.25s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '-0.5px',
            color: C.text,
            margin: '0 0 24px',
          }}>Discover Materials</h2>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8, letterSpacing: '0.04em' }}>
                Search
              </label>
              <input
                type="text"
                name="searchQuery"
                placeholder="Search by title or description"
                value={filters.searchQuery}
                onChange={handleFilterChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: C.bgDeep,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8, letterSpacing: '0.04em' }}>
                Waste Type
              </label>
              <select
                name="wasteType"
                value={filters.wasteType}
                onChange={handleFilterChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: C.bgDeep,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
              >
                <option value="">All Waste Types</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name.toLowerCase()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8, letterSpacing: '0.04em' }}>
                City
              </label>
              <input
                type="text"
                name="city"
                placeholder="Filter by city"
                value={filters.city}
                onChange={handleFilterChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: C.bgDeep,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={fetchMaterials}
                style={{
                  width: '100%',
                  padding: '10px 20px',
                  background: C.primary,
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: `0 2px 6px ${C.glowStrong}`,
                }}
                onMouseEnter={e => { e.target.style.background = C.primaryDark; e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 4px 12px ${C.glowStrong}`; }}
                onMouseLeave={e => { e.target.style.background = C.primary; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 2px 6px ${C.glowStrong}`; }}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: C.errorBg,
            border: `1px solid ${C.errorBorder}`,
            borderRadius: 8,
            padding: '14px 18px',
            marginBottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="1.5" />
              <path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 13, color: C.error, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Materials Section */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.primary, animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <div style={{ fontSize: 14, color: C.textLight }}>Loading materials...</div>
            </div>
          ) : materials.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: C.surface,
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ fontSize: 15, color: C.textLight }}>No waste materials available at the moment.</p>
              <p style={{ fontSize: 13, color: C.textLighter }}>Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <>
              {(() => {
                const activeMaterials = materials.filter((m) => m.status === 'active');
                const inCollectionMaterials = materials.filter((m) => m.status === 'in-collection');

                return (
                  <>
                    {/* ACTIVE MATERIALS */}
                    {activeMaterials.length > 0 && (
                      <>
                        <div style={{ marginBottom: 28 }}>
                          <h2 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 28,
                            fontWeight: 600,
                            letterSpacing: '-0.5px',
                            color: C.text,
                            margin: 0,
                          }}>
                            Available Materials ({activeMaterials.length})
                          </h2>
                        </div>
                        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', marginBottom: 60 }}>
                          {activeMaterials.map((material) => (
                            <div
                              key={material.id}
                              className="feature-card"
                              style={{
                                background: C.surface,
                                border: `1px solid ${C.border}`,
                                borderRadius: 12,
                                overflow: 'hidden',
                                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                                position: 'relative',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = C.borderHover;
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = `0 20px 40px -12px rgba(0,0,0,0.15), 0 0 0 1px ${C.borderHover}`;
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = C.border;
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                              }}
                            >
                              {material.imageUrl && (
                                <img
                                  src={material.imageUrl}
                                  alt={material.title}
                                  style={{
                                    width: '100%',
                                    height: 180,
                                    objectFit: 'cover',
                                  }}
                                />
                              )}
                              <div style={{ padding: 24 }}>
                                <h3 style={{
                                  fontSize: 20,
                                  fontWeight: 600,
                                  fontFamily: "'Cormorant Garamond', serif",
                                  color: C.text,
                                  margin: '0 0 12px',
                                  letterSpacing: '-0.3px',
                                }}>
                                  {material.title}
                                </h3>
                                <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.65, margin: '0 0 20px' }}>
                                  {material.description?.substring(0, 80)}...
                                </p>
                                <div style={{ display: 'grid', gap: 8, marginBottom: 20, fontSize: 13 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textLight }}>
                                    <span>Type:</span>
                                    <span style={{ color: C.primary, fontWeight: 600 }}>{material.wasteType}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textLight }}>
                                    <span>Quantity:</span>
                                    <span>{material.quantity} {material.unit}</span>
                                  </div>
                                  {material.city && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textLight }}>
                                      <span>Location:</span>
                                      <span>{material.city}</span>
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                  <button
                                    onClick={() => navigate(`/waste-post/${material.id}`)}
                                    style={{
                                      padding: '10px 12px',
                                      background: 'transparent',
                                      border: `1px solid ${C.border}`,
                                      borderRadius: 8,
                                      color: C.textLight,
                                      fontSize: 12,
                                      fontWeight: 600,
                                      letterSpacing: '0.06em',
                                      textTransform: 'uppercase',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      fontFamily: "'Outfit', sans-serif",
                                    }}
                                    onMouseEnter={e => { e.target.style.borderColor = C.primary; e.target.style.color = C.primary; }}
                                    onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textLight; }}
                                  >
                                    📋 Details
                                  </button>
                                  <button
                                    onClick={() => handleRequestCollection(material.id)}
                                    style={{
                                      padding: '10px 12px',
                                      background: C.primary,
                                      border: 'none',
                                      borderRadius: 8,
                                      color: '#ffffff',
                                      fontSize: 12,
                                      fontWeight: 600,
                                      letterSpacing: '0.06em',
                                      textTransform: 'uppercase',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      fontFamily: "'Outfit', sans-serif",
                                      boxShadow: `0 2px 6px ${C.glowStrong}`,
                                    }}
                                    onMouseEnter={e => {
                                      e.target.style.background = C.primaryDark;
                                      e.target.style.transform = 'scale(1.02)';
                                      e.target.style.boxShadow = `0 4px 12px ${C.glowStrong}`;
                                    }}
                                    onMouseLeave={e => {
                                      e.target.style.background = C.primary;
                                      e.target.style.transform = 'scale(1)';
                                      e.target.style.boxShadow = `0 2px 6px ${C.glowStrong}`;
                                    }}
                                  >
                                    🚚 Collect
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* IN-COLLECTION MATERIALS */}
                    {inCollectionMaterials.length > 0 && (
                      <>
                        <div style={{ marginBottom: 28 }}>
                          <h2 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 24,
                            fontWeight: 500,
                            letterSpacing: '-0.3px',
                            color: C.textLighter,
                            margin: 0,
                          }}>
                            In Collection ({inCollectionMaterials.length})
                          </h2>
                        </div>
                        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
                          {inCollectionMaterials.map((material) => (
                            <div
                              key={material.id}
                              style={{
                                background: C.surface,
                                border: `1px solid ${C.border}`,
                                borderRadius: 12,
                                overflow: 'hidden',
                                opacity: 0.75,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              }}
                            >
                              {material.imageUrl && (
                                <img
                                  src={material.imageUrl}
                                  alt={material.title}
                                  style={{
                                    width: '100%',
                                    height: 180,
                                    objectFit: 'cover',
                                    filter: 'grayscale(60%)',
                                  }}
                                />
                              )}
                              <div style={{ padding: 24 }}>
                                <h3 style={{
                                  fontSize: 18,
                                  fontWeight: 500,
                                  fontFamily: "'Cormorant Garamond', serif",
                                  color: C.textLighter,
                                  margin: '0 0 12px',
                                }}>
                                  {material.title}
                                </h3>
                                <p style={{ fontSize: 13, color: C.textLighter, lineHeight: 1.65, margin: '0 0 20px' }}>
                                  {material.description?.substring(0, 80)}...
                                </p>
                                <div style={{
                                  background: C.bgDeep,
                                  color: C.textLight,
                                  padding: '10px 12px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  letterSpacing: '0.06em',
                                  textTransform: 'uppercase',
                                  textAlign: 'center',
                                }}>
                                  📦 In Collection
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: '32px 40px',
        position: 'relative',
        zIndex: 2,
        background: C.surface,
        marginTop: 40,
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', textAlign: 'center', color: C.textLighter, fontSize: 12, letterSpacing: '0.04em' }}>
          <p style={{ margin: 0 }}>© 2026 scrapair. Building a circular economy, one pickup at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default RecyclerDashboard;