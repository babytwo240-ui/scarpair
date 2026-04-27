import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Color tokens – 70% White + 30% Green (matching LandingPage) ── */
const C = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#4CAF50',
  bg: '#FFFFFF',
  bgDeep: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceHigh: '#F9FAFB',
  cardHover: '#F1F5F9',
  text: '#1F2937',
  textLight: '#4B5563',
  textLighter: '#9CA3AF',
  border: '#E5E7EB',
  borderHover: '#2E7D32',
  glowLight: 'rgba(46,125,50,0.08)',
  glowStrong: 'rgba(46,125,50,0.2)',
};

/* ─── Inline keyframes (same as LandingPage) ──────────────────────── */
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #FFFFFF; }

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
  @keyframes pulseRing {
    0%   { transform: scale(0.9); opacity: 1; }
    70%  { transform: scale(1.4); opacity: 0; }
    100% { transform: scale(0.9); opacity: 0; }
  }
  .gold-shimmer {
    background: linear-gradient(90deg, #2E7D32 0%, #4CAF50 40%, #2E7D32 60%, #1B5E20 100%);
    background-size: 800px 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F1F5F9; }
  ::-webkit-scrollbar-thumb { background: rgba(46,125,50,0.3); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(46,125,50,0.6); }
`;

/* ─── Ambient orb background (green tint) ───────────────── */
function AmbientOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '-15%', right: '-10%',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,125,50,0.06) 0%, transparent 65%)',
        animation: 'floatA 14s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '-8%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,125,50,0.04) 0%, transparent 65%)',
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
        background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(248,250,252,0.6) 100%)',
      }} />
    </div>
  );
}

/* ─── Logo Mark (green gradient) ────────────────────────────── */
function LogoMark({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 4px 16px rgba(46,125,50,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`,
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)',
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

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [buttonHover, setButtonHover] = useState(null);

  useEffect(() => {
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc);
    return () => window.removeEventListener('scroll', sc);
  }, []);

  const roles = [
    {
      id: 'business',
      title: 'Business Owner',
      desc: 'Post recyclable materials and connect with verified recyclers',
      icon: '◈',
      route: '/business/login',
      details: ['Post scrap materials', 'Track pickups', 'Get compliance reports'],
    },
    {
      id: 'recycler',
      title: 'Recycler',
      desc: 'Find and manage materials for recycling operations',
      icon: '◎',
      route: '/recycler/login',
      details: ['Discover materials', 'Manage collections', 'Grow your business'],
    },
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

      {/* ══════════ NAVBAR (sticky, glass, matching LandingPage) ══════════ */}
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
          <button
            onClick={() => navigate('/')}
            className="cta-btn"
            style={{
              padding: '10px 26px',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              borderRadius: 4,
              border: `1px solid ${C.primary}`,
              background: 'transparent',
              color: C.primary,
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = C.primary;
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 8px 20px rgba(46,125,50,0.3)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = C.primary;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Back to home
          </button>
        </div>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <section style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
        maxWidth: 1320,
        margin: '0 auto',
        padding: '60px 40px 100px',
      }}>
        {/* Header with green accents */}
        <div style={{ textAlign: 'center', marginBottom: 72, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.primary }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>
              Get started
            </span>
            <div style={{ width: 40, height: 1, background: C.primary }} />
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-2px',
            margin: '0 0 20px',
            color: C.text,
          }}>
            Select your<br />
            <span className="gold-shimmer">role</span>
          </h1>
          <p style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: C.textLight,
            maxWidth: 520,
            margin: '0 auto',
          }}>
            Join the circular economy. Choose your role to get started.
          </p>
        </div>

        {/* Role Cards Grid – same hover effects as LandingPage feature/role cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 28,
          marginBottom: 60,
        }}>
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => navigate(role.route)}
              onMouseEnter={() => setButtonHover(role.id)}
              onMouseLeave={() => setButtonHover(null)}
              className="role-card"
              style={{
                background: C.surface,
                border: `1px solid ${buttonHover === role.id ? C.borderHover : C.border}`,
                borderRadius: 6,
                padding: '40px 36px',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: buttonHover === role.id ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow: buttonHover === role.id
                  ? `0 30px 60px rgba(0,0,0,0.08), 0 0 0 1px ${C.borderHover}`
                  : 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Green line on hover (like role-card::after) */}
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${C.primary}, transparent)`,
                transform: buttonHover === role.id ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform 0.4s ease',
              }} />

              {/* Icon container with green gradient accent */}
              <div style={{
                width: 72,
                height: 72,
                background: C.surfaceHigh,
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                color: C.primary,
                marginBottom: 28,
                transition: 'all 0.25s ease',
                transform: buttonHover === role.id ? 'scale(1.05)' : 'scale(1)',
              }}>
                {role.icon}
              </div>

              <div>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 30,
                  fontWeight: 600,
                  letterSpacing: '-0.5px',
                  color: C.text,
                  margin: '0 0 12px',
                }}>
                  {role.title}
                </h2>
                <p style={{
                  fontSize: 15,
                  color: C.textLight,
                  lineHeight: 1.6,
                  margin: '0 0 24px',
                }}>
                  {role.desc}
                </p>

                {/* Details as bullet list with green dots */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {role.details.map((detail, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: C.primary,
                      }} />
                      <span style={{ fontSize: 14, color: C.textLight }}>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue arrow with slide effect */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 32,
                color: C.primary,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transition: 'all 0.25s ease',
                transform: buttonHover === role.id ? 'translateX(6px)' : 'translateX(0)',
              }}>
                <span>Continue</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA – card style matching LandingPage final CTA but smaller */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          padding: '40px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.25s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHover}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
        >
          {/* Subtle corner accents */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 100, height: 100, background: `linear-gradient(135deg, ${C.glowLight} 0%, transparent 70%)` }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 100, height: 100, background: `linear-gradient(225deg, ${C.glowLight} 0%, transparent 70%)` }} />

          <p style={{ fontSize: 14, color: C.textLight, margin: '0 0 16px' }}>
            New to scrapair?
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 32px',
                fontSize: 13,
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
              onMouseEnter={e => {
                e.target.style.borderColor = C.primary;
                e.target.style.color = C.primary;
                e.target.style.background = C.glowLight;
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = C.border;
                e.target.style.color = C.textLight;
                e.target.style.background = 'transparent';
              }}
            >
              ← Back home
            </button>
            <span style={{ color: C.textLighter, fontSize: 13, letterSpacing: '0.04em' }}>Learn more before choosing</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoleSelectionPage;