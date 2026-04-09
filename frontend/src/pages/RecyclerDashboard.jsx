import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import wastePostService from '../services/wastePostService';
import messageService from '../services/messageService';

/* ─── Color tokens ────────────────────────────────────────────
   bright  : #64ff43  (electric lime-green – CTA, glows, accents)
   deep    : #124d05  (forest dark – surfaces, cards)
   darker  : #0a2e03  (near-black base)
   surface : #0d3806  (card backgrounds)
   text    : #e6ffe0  (off-white tinted green)
──────────────────────────────────────────────────────────── */
const C = {
  bright:      '#64ff43',
  deep:        '#124d05',
  darker:      '#0a2e03',
  surface:     '#0d3806',
  border:      'rgba(100,255,67,0.18)',
  borderHover: 'rgba(100,255,67,0.45)',
  text:        '#e6ffe0',
  textMid:     'rgba(230,255,224,0.55)',
  textLow:     'rgba(230,255,224,0.3)',
  glow:        'rgba(100,255,67,0.22)',
  glowStrong:  'rgba(100,255,67,0.45)',
  error:       '#ff6b6b',
  errorBg:     'rgba(255,107,107,0.1)',
  errorBorder: 'rgba(255,107,107,0.3)',
};

const RecyclerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [filters, setFilters] = useState({
    wasteType: '',
    city: '',
    searchQuery: '',
  });

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
    fetchCategories();
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
    { icon: '💬', title: 'Messages', desc: 'Chat with businesses about materials', route: '/messages', color: C.bright },
    { icon: '🔔', title: 'Notifications', desc: 'View collection updates and alerts', route: '/notifications', color: '#7dd3fc' },
    { icon: '🎯', title: 'Approved Collections', desc: 'Manage your approved pickups', route: '/recycler/approved-collections', color: '#86efac' },
    { icon: '📦', title: 'My Collections', desc: 'Track all your collection requests', route: '/collections', color: '#fbbf24' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden', color: C.text }}>

      {/* Ambient cursor glow */}
      <div style={{ position: 'fixed', top: mouse.y - 320, left: mouse.x - 320, width: 640, height: 640, background: 'radial-gradient(circle, rgba(100,255,67,0.055) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'top 0.35s ease, left 0.35s ease' }} />

      {/* Grain overlay */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(10,46,3,0.93)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(28px)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.35s ease' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(100,255,67,0.12)', border: '1px solid rgba(100,255,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4zM3.444 11H9v5.472A6.002 6.002 0 0 1 3.444 11zm6.556 5.472V11h5.556A6.002 6.002 0 0 1 10 16.472z" fill={C.bright}/>
              </svg>
            </div>
            <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.5px', color: C.text }}>ScraPair</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => navigate('/edit-profile')}
              style={{ padding: '10px 24px', fontSize: 13, fontWeight: 700, borderRadius: 100, border: `1px solid ${C.border}`, background: 'transparent', color: C.bright, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.background = 'rgba(100,255,67,0.1)'; e.target.style.borderColor = C.borderHover; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = C.border; }}
            >
              ⚙️ Profile
            </button>
            <button
              onClick={handleLogout}
              style={{ padding: '10px 24px', fontSize: 13, fontWeight: 700, borderRadius: 100, border: 'none', background: C.error, color: 'white', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 16px rgba(255,107,107,0.25)' }}
              onMouseEnter={e => { e.target.style.boxShadow = '0 0 24px rgba(255,107,107,0.4)'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.boxShadow = '0 0 16px rgba(255,107,107,0.25)'; e.target.style.transform = 'translateY(0)'; }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>

        {/* Header */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Dashboard</div>
          <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 12px', color: C.text }}>
            Welcome back, {user?.businessName || 'Recycler'}
          </h1>
          <p style={{ fontSize: 16, color: C.textMid, margin: 0 }}>Find and manage waste materials from verified businesses</p>
        </div>

        {/* Quick Action Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 80 }}>
          {quickActions.map((action, i) => (
            <div
              key={i}
              onClick={() => navigate(action.route)}
              onMouseEnter={() => setHoveredCard(action.title)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: C.surface,
                border: `1px solid ${hoveredCard === action.title ? C.borderHover : C.border}`,
                borderRadius: 24,
                padding: 32,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                transform: hoveredCard === action.title ? 'translateY(-8px)' : 'translateY(0)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ fontSize: 40 }}>{action.icon}</div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.4px', color: C.text, margin: '0 0 8px' }}>
                  {action.title}
                </h3>
                <p style={{ fontSize: 14, color: C.textMid, margin: 0, lineHeight: 1.6 }}>
                  {action.desc}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.bright, fontSize: 13, fontWeight: 700, marginTop: 'auto', transition: 'all 0.3s', transform: hoveredCard === action.title ? 'translateX(4px)' : 'translateX(0)' }}>
                <span>View</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h12M9 3l5 5-5 5" stroke={C.bright} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Section */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 28, padding: 40, marginBottom: 60 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.6px', color: C.text, margin: '0 0 24px' }}>
            Discover Materials
          </h2>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Search</label>
              <input
                type="text"
                name="searchQuery"
                placeholder="Search by title or description"
                value={filters.searchQuery}
                onChange={handleFilterChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  background: 'rgba(100,255,67,0.03)',
                  color: C.text,
                  fontSize: 14,
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = '0 0 0 3px rgba(100,255,67,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Waste Type</label>
              <select
                name="wasteType"
                value={filters.wasteType}
                onChange={handleFilterChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  background: 'rgba(100,255,67,0.03)',
                  color: C.text,
                  fontSize: 14,
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
              >
                <option value="" style={{ background: C.darker }}>All Waste Types</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name.toLowerCase()} style={{ background: C.darker }}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>City</label>
              <input
                type="text"
                name="city"
                placeholder="Filter by city"
                value={filters.city}
                onChange={handleFilterChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  background: 'rgba(100,255,67,0.03)',
                  color: C.text,
                  fontSize: 14,
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = '0 0 0 3px rgba(100,255,67,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={fetchMaterials}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: `linear-gradient(135deg, ${C.bright}, #4de029)`,
                  color: '#062400',
                  fontSize: 14,
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'all 0.22s',
                  boxShadow: '0 0 0 0px transparent, 0 8px 24px rgba(100,255,67,0.35)',
                }}
                onMouseEnter={e => { e.target.style.boxShadow = '0 0 0 5px rgba(100,255,67,0.15), 0 12px 36px rgba(100,255,67,0.5)'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.target.style.boxShadow = '0 0 0 0px transparent, 0 8px 24px rgba(100,255,67,0.35)'; e.target.style.transform = 'translateY(0)'; }}
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
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2"/>
              <path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Materials Section */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 16, color: C.textMid }}>Loading materials...</div>
            </div>
          ) : materials.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: C.surface, borderRadius: 24, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ fontSize: 16, color: C.textMid }}>No waste materials available at the moment.</p>
              <p style={{ fontSize: 14, color: C.textLow }}>Try adjusting your filters or check back later.</p>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                          <div style={{ fontSize: 24 }}>✅</div>
                          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', color: C.text, margin: 0 }}>
                            Available Materials ({activeMaterials.length})
                          </h2>
                        </div>
                        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', marginBottom: 80 }}>
                          {activeMaterials.map((material) => (
                            <div
                              key={material.id}
                              style={{
                                background: C.surface,
                                border: `1px solid ${C.border}`,
                                borderRadius: 20,
                                overflow: 'hidden',
                                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = C.borderHover;
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 16px 40px rgba(100,255,67,0.15)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = C.border;
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              {/* Image */}
                              {material.imageUrl && (
                                <img
                                  src={material.imageUrl}
                                  alt={material.title}
                                  style={{
                                    width: '100%',
                                    height: 200,
                                    objectFit: 'cover',
                                  }}
                                />
                              )}

                              {/* Content */}
                              <div style={{ padding: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px', color: C.text, margin: '0 0 12px' }}>
                                  {material.title}
                                </h3>
                                <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, margin: '0 0 16px' }}>
                                  {material.description.substring(0, 80)}...
                                </p>

                                {/* Details */}
                                <div style={{ display: 'grid', gap: 8, marginBottom: 20, fontSize: 13 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textMid }}>
                                    <span>Type:</span>
                                    <span style={{ color: C.bright, fontWeight: 700 }}>{material.wasteType}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textMid }}>
                                    <span>Quantity:</span>
                                    <span style={{ color: C.text }}>{material.quantity} {material.unit}</span>
                                  </div>
                                  {material.city && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textMid }}>
                                      <span>Location:</span>
                                      <span style={{ color: C.text }}>{material.city}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                  <button
                                    onClick={() => navigate(`/waste-post/${material.id}`)}
                                    style={{
                                      padding: '10px 16px',
                                      background: 'transparent',
                                      border: `1px solid ${C.border}`,
                                      borderRadius: 10,
                                      color: C.bright,
                                      fontSize: 12,
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.target.style.borderColor = C.borderHover; e.target.style.background = 'rgba(100,255,67,0.08)'; }}
                                    onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}
                                  >
                                    📋 Details
                                  </button>
                                  <button
                                    onClick={() => handleRequestCollection(material.id)}
                                    style={{
                                      padding: '10px 16px',
                                      background: `linear-gradient(135deg, ${C.bright}, #4de029)`,
                                      border: 'none',
                                      borderRadius: 10,
                                      color: '#062400',
                                      fontSize: 12,
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      boxShadow: '0 0 12px rgba(100,255,67,0.3)',
                                    }}
                                    onMouseEnter={e => { e.target.style.boxShadow = '0 0 20px rgba(100,255,67,0.5)'; e.target.style.transform = 'scale(1.02)'; }}
                                    onMouseLeave={e => { e.target.style.boxShadow = '0 0 12px rgba(100,255,67,0.3)'; e.target.style.transform = 'scale(1)'; }}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                          <div style={{ fontSize: 24 }}>📦</div>
                          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', color: C.text, margin: 0 }}>
                            In Collection ({inCollectionMaterials.length})
                          </h2>
                        </div>
                        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                          {inCollectionMaterials.map((material) => (
                            <div
                              key={material.id}
                              style={{
                                background: C.surface,
                                border: `1px solid rgba(100,255,67,0.08)`,
                                borderRadius: 20,
                                overflow: 'hidden',
                                opacity: 0.6,
                                transition: 'all 0.3s',
                              }}
                            >
                              {material.imageUrl && (
                                <img
                                  src={material.imageUrl}
                                  alt={material.title}
                                  style={{
                                    width: '100%',
                                    height: 200,
                                    objectFit: 'cover',
                                    filter: 'grayscale(60%)',
                                  }}
                                />
                              )}
                              <div style={{ padding: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px', color: C.textLow, margin: '0 0 12px' }}>
                                  {material.title}
                                </h3>
                                <p style={{ fontSize: 13, color: C.textLow, lineHeight: 1.6, margin: '0 0 16px' }}>
                                  {material.description.substring(0, 80)}...
                                </p>
                                <div style={{ background: 'rgba(100,255,67,0.08)', color: C.bright, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RecyclerDashboard;

