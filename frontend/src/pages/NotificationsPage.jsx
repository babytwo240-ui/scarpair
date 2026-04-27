import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import messageService from '../services/messageService';

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

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [hoveredNotif, setHoveredNotif] = useState(null);
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
      loadNotifications();
      intervalRef.current = setInterval(loadNotifications, 30000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPageVisible, page]);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await messageService.getNotifications(page, 20);
      let notificationsArray = [];
      if (Array.isArray(response.data)) {
        notificationsArray = response.data;
      } else if (Array.isArray(response.data?.data)) {
        notificationsArray = response.data.data;
      } else if (response.data?.notifications && Array.isArray(response.data.notifications)) {
        notificationsArray = response.data.notifications;
      }
      if (page === 1) {
        setNotifications(notificationsArray);
      } else {
        setNotifications((prev) => [...prev, ...notificationsArray]);
      }
      setHasMore(notificationsArray.length === 20);
    } catch (err) {
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await messageService.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) { }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await messageService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError('Failed to mark all as read.');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await messageService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      setError('Failed to delete notification.');
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, marginBottom: 12 }}>Loading notifications...</div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.bright, animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: C.error }}>Please login to view notifications</p>
          <button onClick={() => navigate('/role-selection')} style={{ padding: '10px 24px', background: C.bright, border: 'none', borderRadius: 8, color: '#ffffff', fontWeight: 700, cursor: 'pointer', marginTop: 16, transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.background = C.brightDark; e.target.style.transform = 'scale(1.02)'; }} onMouseLeave={e => { e.target.style.background = C.bright; e.target.style.transform = 'scale(1)'; }}>Login</button>
        </div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent', color: C.textLight, cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.color = C.bright; e.target.style.background = C.glowLight; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textLight; e.target.style.background = 'transparent'; }}>← Back</button>
          </div>
        </div>
      </nav>

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: 60, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.bright }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.bright }}>Updates</span>
            <div style={{ width: 40, height: 1, background: C.bright }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 600, letterSpacing: '-1.5px', margin: '0 0 16px', color: C.text, lineHeight: 1.1 }}>Notifications</h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: C.textMid, maxWidth: 520, margin: 0 }}>Stay updated with collection requests and system alerts</p>
        </div>

        {error && <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2" /><path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round" /></svg><span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span></div>}

        {notifications.length === 0 ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 60, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: C.text, margin: '0 0 8px' }}>All caught up!</h3>
            <p style={{ fontSize: 14, color: C.textMid, margin: 0 }}>You have no new notifications</p>
          </div>
        ) : (
          <>
            {notifications.some((n) => !n.read) && (
              <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleMarkAllAsRead} style={{ padding: '10px 24px', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.bright, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.background = C.glowLight; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}>✓ Mark all as read</button>
              </div>
            )}
            <div style={{ display: 'grid', gap: 16 }}>
              {notifications.map((notification, index) => {
                const isHovered = hoveredNotif === notification.id;
                const isUnread = !notification.read;

                return (
                  <div
                    key={notification.id}
                    onMouseEnter={() => setHoveredNotif(notification.id)}
                    onMouseLeave={() => setHoveredNotif(null)}
                    style={{
                      background: isUnread ? C.glowLight : C.surface,
                      border: `1px solid ${isHovered ? C.borderHover : C.border}`,
                      borderRadius: 12,
                      padding: 24,
                      transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: isHovered ? `0 8px 20px rgba(0,0,0,0.08)` : '0 1px 3px rgba(0,0,0,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 20,
                      animation: `fadeUp 0.4s ease ${index * 0.05}s both`,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.bright, margin: 0, fontFamily: "'Outfit', sans-serif" }}>{notification.title}</h3>
                        {isUnread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.bright, boxShadow: `0 0 6px ${C.bright}` }} />}
                      </div>
                      <p style={{ fontSize: 14, color: C.textMid, margin: '0 0 10px', lineHeight: 1.6 }}>{notification.message}</p>
                      <p style={{ fontSize: 12, color: C.textLow, margin: 0, fontFamily: "'DM Mono', monospace" }}>{new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {isUnread && (
                        <button onClick={() => handleMarkAsRead(notification.id)} style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.bright, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.background = C.glowLight; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}>✓ Mark Read</button>
                      )}
                      <button onClick={() => handleDelete(notification.id)} style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: `1px solid ${C.errorBorder}`, background: 'transparent', color: C.error, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.borderColor = C.error; e.target.style.background = C.errorBg; }} onMouseLeave={e => { e.target.style.borderColor = C.errorBorder; e.target.style.background = 'transparent'; }}>✕ Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <button onClick={() => setPage((prev) => prev + 1)} disabled={loading} style={{ width: '100%', marginTop: 40, padding: '14px 24px', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.bright, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'all 0.2s' }} onMouseEnter={e => { if (!loading) { e.target.style.borderColor = C.bright; e.target.style.background = C.glowLight; } }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}>{loading ? 'Loading...' : 'Load more notifications'}</button>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default NotificationsPage;