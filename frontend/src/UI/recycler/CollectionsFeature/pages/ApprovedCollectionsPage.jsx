import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import wastePostService from '../../../../services/wastePostService';
import { formatManila, formatManilaInput } from '../../../../utils/manilaTimeFormatter';

const C = {
  bright: '#64ff43',
  darker: '#0a2e03',
  surface: '#0d3806',
  border: 'rgba(100,255,67,0.18)',
  borderHover: 'rgba(100,255,67,0.45)',
  text: '#e6ffe0',
  textMid: 'rgba(230,255,224,0.55)',
  textLow: 'rgba(230,255,224,0.3)',
  error: '#ff6b6b',
  errorBg: 'rgba(255,107,107,0.1)',
  errorBorder: 'rgba(255,107,107,0.3)',
  info: '#7dd3fc',
  infoBg: 'rgba(125,211,252,0.1)',
  infoBorder: 'rgba(125,211,252,0.3)',
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

  return <span style={{ fontSize: 18, fontWeight: 800, color: timeLeft === 'EXPIRED' ? C.error : C.bright }}>{timeLeft || '⏱'}</span>;
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
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, marginBottom: 12 }}>Loading collections...</div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.bright, animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: C.error }}>Please login to view approved collections</p>
          <button onClick={() => navigate('/role-selection')} style={{ padding: '10px 24px', background: C.bright, border: 'none', borderRadius: 12, color: '#062400', fontWeight: 700, cursor: 'pointer', marginTop: 16 }}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden', color: C.text }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ position: 'fixed', top: mouse.y - 320, left: mouse.x - 320, width: 640, height: 640, background: 'radial-gradient(circle, rgba(100,255,67,0.055) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'top 0.35s ease, left 0.35s ease' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />
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
          <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 16px rgba(100,255,67,0.35)' }} onMouseEnter={e => { e.target.style.boxShadow = '0 0 28px rgba(100,255,67,0.6)'; e.target.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.target.style.boxShadow = '0 0 16px rgba(100,255,67,0.35)'; e.target.style.transform = 'translateY(0)'; }}>← Back</button>
        </div>
      </nav>
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: 60 }}>
          <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Pickups</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 12px', color: C.text }}>Approved Collections</h1>
          <p style={{ fontSize: 16, color: C.textMid, margin: 0 }}>You have 1 hour to pick up after approval. Confirm pickup below.</p>
        </div>

        {error && <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 16, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2"/><path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round"/></svg><span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span></div>}

        {collections.length === 0 ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24, padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: '0 0 8px' }}>No approved collections</h3>
            <p style={{ fontSize: 14, color: C.textMid, margin: '0 0 24px' }}>No waste awaiting pickup at the moment</p>
            <button onClick={() => navigate('/recycler/dashboard')} style={{ padding: '12px 28px', fontSize: 13, fontWeight: 700, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 16px rgba(100,255,67,0.35)' }} onMouseEnter={e => { e.target.style.boxShadow = '0 0 28px rgba(100,255,67,0.6)'; e.target.style.transform = 'scale(1.05)'; }} onMouseLeave={e => { e.target.style.boxShadow = '0 0 16px rgba(100,255,67,0.35)'; e.target.style.transform = 'scale(1)'; }}>Browse Marketplace</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {collections.map((collection) => {
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
                    borderRadius: 20,
                    padding: 32,
                    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                    transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                    boxShadow: isHovered ? '0 16px 40px rgba(100,255,67,0.2)' : '0 0 0 transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 20 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 20, fontWeight: 800, color: C.bright, margin: '0 0 4px' }}>{collection.title}</h3>
                      <p style={{ fontSize: 13, color: C.textLow, margin: 0 }}>{collection.wasteType} • {collection.quantity} {collection.unit}</p>
                    </div>
                    <div style={{ background: 'rgba(100,255,67,0.15)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '8px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: C.textLow, fontWeight: 600, marginBottom: 4 }}>TIME REMAINING</div>
                      <CountdownTimer deadline={collection.pickupDeadline} />
                    </div>
                  </div>

                  <div style={{ background: 'rgba(100,255,67,0.08)', borderRadius: 16, padding: 20, marginBottom: 24, border: `1px solid ${C.border}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                      <div>
                        <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Location</p>
                        <p style={{ fontSize: 14, color: C.text, fontWeight: 600, margin: 0 }}>{collection.address}</p>
                        <p style={{ fontSize: 13, color: C.textMid, margin: '2px 0 0' }}>{collection.city}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Business</p>
                        <p style={{ fontSize: 14, color: C.text, fontWeight: 600, margin: 0 }}>{collection.business?.businessName}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Proposed Pickup</p>
                        <p style={{ fontSize: 14, color: C.text, fontWeight: 600, margin: 0 }}>{collection.scheduledDate ? formatManilaInput(collection.scheduledDate) : '—'}</p>
                      </div>
                    </div>
                    {collection.description && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Details</p>
                        <p style={{ fontSize: 13, color: C.textMid, margin: 0, lineHeight: 1.5 }}>{collection.description}</p>
                      </div>
                    )}
                  </div>

                  {collection.collectionStatus === 'APPROVED' && (
                    <button
                      onClick={() => handleMarkAsPickedUp(collection.id)}
                      style={{
                        width: '100%',
                        padding: '16px 24px',
                        fontSize: 14,
                        fontWeight: 800,
                        borderRadius: 100,
                        border: 'none',
                        background: isExpired ? C.error : C.bright,
                        color: isExpired ? 'white' : '#082800',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isExpired ? 'none' : `0 0 20px rgba(100,255,67,0.4)`,
                      }}
                      onMouseEnter={e => {
                        if (!isExpired) {
                          e.target.style.boxShadow = '0 0 32px rgba(100,255,67,0.6)';
                          e.target.style.transform = 'scale(1.02)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isExpired) {
                          e.target.style.boxShadow = '0 0 20px rgba(100,255,67,0.4)';
                          e.target.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {isExpired ? '⏰ PICKUP EXPIRED' : '✓ Confirm Pickup'}
                    </button>
                  )}

                  {(collection.collectionStatus === 'PICKED_UP' || collection.collectionStatus === 'COMPLETED') && (
                    <div style={{ background: 'rgba(100, 255, 67, 0.15)', border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, textAlign: 'center' }}>
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
