import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

/* ─── Color tokens – 70% White / 30% Green Palette ────────────────── */
const C = {
  // Primary green (30%)
  primary: '#2e7d32',        // Deep green for primary actions
  primaryDark: '#1b5e20',     // Darker green for hover states
  primaryLight: '#4caf50',    // Lighter green for accents
  // Backgrounds (70% white/light tones)
  bg: '#f8fafc',              // Light grey-white background
  bgDeep: '#f1f5f9',          // Slightly deeper light background
  surface: '#ffffff',         // Pure white surfaces
  surfaceHigh: '#f8fafc',     // Light surfaces for cards
  cardHover: '#f1f5f9',       // Hover state for cards
  // Text (Dark grey for high contrast on white)
  text: '#0f172a',            // Slate 900
  textLight: '#475569',       // Slate 600
  textLighter: '#94a3b8',     // Slate 400
  // Borders and accents
  border: 'rgba(0,0,0,0.08)',
  borderHover: 'rgba(46,125,50,0.25)',
  danger: '#dc2626',          // Red for danger actions
  dangerDark: '#b91c1c',
  dangerBg: 'rgba(220,38,38,0.08)',
  glowLight: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

/* ─── Inline keyframes (updated for light theme) ──────────────────── */
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #f8fafc; }

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
  .gold-shimmer {
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

/* ─── Ambient orb background (soft green/white glow for light theme) ─ */
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

const BusinessDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc);
    return () => window.removeEventListener('scroll', sc);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cardConfig = [
    { icon: '♻️', title: 'Post Waste Materials', desc: 'Create a new waste post to list your recyclable materials on the marketplace.', action: '/waste-post/create', label: 'Create Post' },
    { icon: '📋', title: 'View My Posts', desc: 'View, edit, or manage your posted waste materials.', action: '/business/posts', label: 'View Posts' },
    { icon: '🚛', title: 'Collection Requests', desc: 'Manage collection requests from recyclers.', action: '/collections', label: 'View Requests' },
    { icon: '⏰', title: 'New Requests (1-Hour)', desc: 'Approve collection requests with the new 1-hour pickup window.', action: '/business/collection-requests', label: 'Manage Requests' },
    { icon: '💬', title: 'Messages', desc: 'Communicate with recyclers about your materials.', action: '/messages', label: 'Open Messages' },
    { icon: '🔔', title: 'Notifications', desc: 'View collection requests and system alerts.', action: '/notifications', label: 'View Alerts' },
    { icon: '✓', title: 'Pending Approvals', desc: 'Manage approved recyclers and their pickup windows.', action: '/business/pending-approvals', label: 'View Approvals' },
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
            <div style={{ fontSize: 13, color: C.textLight, letterSpacing: '0.03em' }}>
              Welcome, <span style={{ color: C.primary, fontWeight: 600 }}>{user?.businessName || 'Business'}</span>
            </div>
            <button
              onClick={() => navigate('/edit-profile')}
              style={{
                padding: '8px 18px',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderRadius: 4,
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
              ⚙️ Edit Profile
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 18px',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderRadius: 4,
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
      <main style={{ maxWidth: 1320, margin: '0 auto', padding: '60px 40px 100px', position: 'relative', zIndex: 2 }}>
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
            Manage Your<br />Waste Operations
          </h1>
          <p style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: C.textLight,
            maxWidth: 520,
            margin: 0,
          }}>
            Post materials, track collections, and connect with verified recyclers — all in one place.
          </p>
        </div>

        {/* Grid Cards – white cards with green accents */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {cardConfig.map((card, i) => (
            <div
              key={i}
              className="feature-card"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '32px 28px',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = C.borderHover;
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = `0 20px 40px -12px rgba(0,0,0,0.12), 0 0 0 1px ${C.borderHover}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Shine overlay on hover */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(135deg, ${C.glowLight} 0%, transparent 60%)`,
                opacity: 0,
                transition: 'opacity 0.35s ease',
                pointerEvents: 'none',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              />

              {/* Icon with green border */}
              <div style={{
                width: 52,
                height: 52,
                background: C.surfaceHigh,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                marginBottom: 24,
              }}>
                {card.icon}
              </div>

              {/* Content */}
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                fontFamily: "'Cormorant Garamond', serif",
                color: C.text,
                margin: '0 0 12px',
                letterSpacing: '-0.3px',
              }}>
                {card.title}
              </h3>
              <p style={{
                fontSize: 14,
                color: C.textLight,
                lineHeight: 1.65,
                margin: '0 0 28px',
              }}>
                {card.desc}
              </p>

              {/* Green button */}
              <button
                onClick={() => navigate(card.action)}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderRadius: 6,
                  border: 'none',
                  background: C.primary,
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: `0 2px 6px ${C.glowStrong}`,
                }}
                onMouseEnter={e => {
                  e.target.style.background = C.primaryDark;
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 6px 14px ${C.glowStrong}`;
                }}
                onMouseLeave={e => {
                  e.target.style.background = C.primary;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 2px 6px ${C.glowStrong}`;
                }}
              >
                {card.label} →
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: '32px 40px',
        position: 'relative',
        zIndex: 2,
        background: C.surface,
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', textAlign: 'center', color: C.textLighter, fontSize: 12, letterSpacing: '0.04em' }}>
          <p style={{ margin: 0 }}>© 2026 scrapair. Building a circular economy, one pickup at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default BusinessDashboard;