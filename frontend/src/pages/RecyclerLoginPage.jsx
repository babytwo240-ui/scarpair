import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

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
  error: '#ef4444',
  errorBg: 'rgba(239,68,68,0.08)',
  errorBorder: 'rgba(239,68,68,0.2)',
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
  @keyframes spin {
    to { transform: rotate(360deg); }
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

const RecyclerLoginPage = () => {
  const navigate = useNavigate();
  const { recyclerLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc);
    return () => window.removeEventListener('scroll', sc);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedEmail = email.trim();

    try {
      await recyclerLogin(trimmedEmail, password);
      navigate('/recycler/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => navigate('/role-selection')}
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
            ← Back
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
        padding: '60px 32px',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
          {/* Header with green accent */}
          <div style={{ marginBottom: 48, animation: 'fadeUp 0.7s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 1, background: C.primary }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>
                Recycler
              </span>
              <div style={{ width: 40, height: 1, background: C.primary }} />
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 48,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              margin: '0 0 12px',
              color: C.text,
            }}>
              Welcome back
            </h1>
            <p style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: C.textLight,
              margin: 0,
            }}>
              Sign in to your account and discover new recycling opportunities.
            </p>
          </div>

          {/* Form Card */}
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            padding: 40,
            transition: 'all 0.25s ease',
            animation: 'fadeUp 0.7s ease 0.1s both',
          }}>
            {/* Error Message */}
            {error && (
              <div style={{
                background: C.errorBg,
                border: `1px solid ${C.errorBorder}`,
                borderRadius: 4,
                padding: '14px 18px',
                marginBottom: 28,
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* Email Input */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textLight, marginBottom: 8, letterSpacing: '0.04em' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  required
                  placeholder="you@recycler.com"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: C.bgDeep,
                    border: `1px solid ${focusedInput === 'email' ? C.primary : C.border}`,
                    borderRadius: 4,
                    color: C.text,
                    fontSize: 14,
                    fontFamily: "'Outfit', sans-serif",
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxShadow: focusedInput === 'email' ? `0 0 0 2px ${C.glowStrong}` : 'none',
                  }}
                />
              </div>

              {/* Password Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.textLight, letterSpacing: '0.04em' }}>
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: 12, color: C.primary, fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.target.style.textDecoration = 'none'}
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: C.bgDeep,
                    border: `1px solid ${focusedInput === 'password' ? C.primary : C.border}`,
                    borderRadius: 4,
                    color: C.text,
                    fontSize: 14,
                    fontFamily: "'Outfit', sans-serif",
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxShadow: focusedInput === 'password' ? `0 0 0 2px ${C.glowStrong}` : 'none',
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  marginTop: 12,
                  background: loading ? C.textLighter : C.primary,
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: 'none',
                  borderRadius: 4,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: loading ? 'none' : `0 4px 12px ${C.glowStrong}`,
                  transform: loading ? 'scale(0.98)' : 'scale(1)',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.background = C.primaryDark;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 8px 20px ${C.glowStrong}`;
                  }
                }}
                onMouseLeave={e => {
                  if (!loading) {
                    e.currentTarget.style.background = C.primary;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${C.glowStrong}`;
                  }
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <div style={{
                      width: 14,
                      height: 14,
                      border: `2px solid white`,
                      borderTop: `2px solid transparent`,
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }} />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '32px 0 28px' }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ color: C.textLighter, fontSize: 12, letterSpacing: '0.04em' }}>or</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            {/* Sign Up Link */}
            <p style={{ textAlign: 'center', fontSize: 14, color: C.textLight, margin: 0 }}>
              Don't have an account?{' '}
              <Link
                to="/recycler/signup"
                style={{ color: C.primary, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                onMouseLeave={e => e.target.style.textDecoration = 'none'}
              >
                Sign up here
              </Link>
            </p>
          </div>

          {/* Footer Info */}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <p style={{ fontSize: 13, color: C.textLighter, margin: 0 }}>
              <Link
                to="/role-selection"
                style={{ color: C.primary, textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                onMouseLeave={e => e.target.style.textDecoration = 'none'}
              >
                Looking for business owner login?
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RecyclerLoginPage;