import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/adminApi.jsx';

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
  // Glows
  glow: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [focusedInput, setFocusedInput] = useState(null);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!username || !password) {
        setError('Username and password are required');
        setLoading(false);
        return;
      }

      const response = await adminAPI.login(username, password);

      if (response.token) {
        localStorage.setItem('adminToken', response.token);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.darker,
      fontFamily: "'Outfit', sans-serif",
      overflowX: 'hidden',
      color: C.text,
      position: 'relative',
    }}>
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
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(241,245,249,0.6) 100%)',
        }} />
      </div>

      {/* Ambient cursor glow */}
      <div style={{
        position: 'fixed',
        top: mouse.y - 320,
        left: mouse.x - 320,
        width: 640,
        height: 640,
        background: `radial-gradient(circle, ${C.glow} 0%, transparent 65%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'top 0.35s ease, left 0.35s ease'
      }} />

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrollY > 60 ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: scrollY > 60 ? 'blur(24px) saturate(1.5)' : 'none',
        borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)'
      }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: 'rgba(46,125,50,0.08)',
              border: '1px solid rgba(46,125,50,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4zM3.444 11H9v5.472A6.002 6.002 0 0 1 3.444 11zm6.556 5.472V11h5.556A6.002 6.002 0 0 1 10 16.472z" fill={C.bright} />
              </svg>
            </div>
            <div>
              <span style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '-0.5px',
                fontFamily: "'Cormorant Garamond', serif",
                color: C.text
              }}>scrapair</span>
              <div style={{ height: 1.5, background: `linear-gradient(90deg, ${C.bright}, transparent)`, marginTop: 1, width: '100%' }} />
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.06em',
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              background: 'transparent',
              color: C.textLight,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.color = C.bright; e.target.style.background = C.glow; }}
            onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textLight; e.target.style.background = 'transparent'; }}
          >← Back</button>
        </div>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
        padding: '60px 40px'
      }}>

        <div style={{ maxWidth: 520, margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ marginBottom: 48, animation: 'fadeUp 0.7s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 1, background: C.bright }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.bright }}>
                🔐 Admin Portal
              </span>
              <div style={{ width: 40, height: 1, background: C.bright }} />
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 52,
              fontWeight: 600,
              letterSpacing: '-1.5px',
              margin: '0 0 16px',
              color: C.text,
              lineHeight: 1.1,
            }}>
              Secure Access
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: C.textMid, margin: 0 }}>
              Enter your admin credentials to access the ScraPair management dashboard.
            </p>
          </div>

          {/* Form Container */}
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: 40,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            animation: 'fadeUp 0.7s ease 0.1s both',
          }}>

            {/* Error Message */}
            {error && (
              <div style={{
                background: C.errorBg,
                border: `1px solid ${C.errorBorder}`,
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 28,
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

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Username Input */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.primary,
                  marginBottom: 8,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput(null)}
                  disabled={loading}
                  required
                  placeholder="admin"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${focusedInput === 'username' ? C.borderHover : C.border}`,
                    borderRadius: 8,
                    background: C.surfaceHigh,
                    color: C.text,
                    fontSize: 14,
                    fontFamily: "'Outfit', sans-serif",
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxShadow: focusedInput === 'username' ? `0 0 0 3px ${C.glow}` : 'none',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              {/* Password Input */}
              <div>
                <label style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.primary,
                  marginBottom: 8,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'block'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  disabled={loading}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${focusedInput === 'password' ? C.borderHover : C.border}`,
                    borderRadius: 8,
                    background: C.surfaceHigh,
                    color: C.text,
                    fontSize: 14,
                    fontFamily: "'Outfit', sans-serif",
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxShadow: focusedInput === 'password' ? `0 0 0 3px ${C.glow}` : 'none',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'text',
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
                  marginTop: 8,
                  background: loading ? C.textLow : C.bright,
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: 'none',
                  borderRadius: 8,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: loading ? 'none' : `0 2px 8px ${C.glowStrong}`,
                  transform: loading ? 'scale(0.98)' : 'scale(1)',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.target.style.background = C.brightDark;
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = `0 4px 12px ${C.glowStrong}`;
                  }
                }}
                onMouseLeave={e => {
                  if (!loading) {
                    e.target.style.background = C.bright;
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = `0 2px 8px ${C.glowStrong}`;
                  }
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #ffffff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '32px 0' }}>
              <div style={{ flex: 1, height: '1px', background: C.border }} />
              <span style={{ color: C.textLow, fontSize: 11, letterSpacing: '0.05em' }}>secure access</span>
              <div style={{ flex: 1, height: '1px', background: C.border }} />
            </div>

            {/* Info Box */}
            <div style={{
              background: C.glow,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: '16px 20px',
            }}>
              <p style={{ margin: 0, fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>
                <span style={{ color: C.bright, fontWeight: 700 }}>ℹ️ Admin credentials</span> are securely configured. Contact your administrator if you need access to the portal.
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <p style={{ fontSize: 12, color: C.textLow, margin: 0 }}>
              Need help? Contact the system administrator
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;