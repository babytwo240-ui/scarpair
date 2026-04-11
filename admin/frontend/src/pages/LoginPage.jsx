import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/adminApi.jsx';

const C = {
  bright: '#64ff43',
  darker: '#0a2e03',
  surface: '#0d3806',
  border: 'rgba(100,255,67,0.18)',
  borderHover: 'rgba(100,255,67,0.45)',
  text: '#e6ffe0',
  textMid: 'rgba(230,255,224,0.55)',
  textLow: 'rgba(230,255,224,0.3)',
  glow: 'rgba(100,255,67,0.22)',
  glowStrong: 'rgba(100,255,67,0.45)',
  error: '#ff6b6b',
  errorBg: 'rgba(255,107,107,0.1)',
  errorBorder: 'rgba(255,107,107,0.3)',
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
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden', color: C.text }}>

      {/* Ambient cursor glow */}
      <div style={{ position: 'fixed', top: mouse.y - 320, left: mouse.x - 320, width: 640, height: 640, background: 'radial-gradient(circle, rgba(100,255,67,0.055) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'top 0.35s ease, left 0.35s ease' }} />

      {/* Grain overlay */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      {/* ══════════ MAIN CONTENT ══════════ */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2, padding: '60px 40px', boxSizing: 'border-box', overflowY: 'hidden' }}>

        {/* Decorative background elements */}
        <div style={{ position: 'fixed', top: '5%', right: '-8%', width: 500, height: 500, border: '1px solid rgba(100,255,67,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '10%', left: '-10%', width: 400, height: 400, border: '1px solid rgba(100,255,67,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 520, margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'left', marginBottom: 60 }}>
            <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>🔐 Admin Portal</div>
            <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 16px', color: C.text }}>
              Secure Access
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: C.textMid, margin: 0 }}>
              Enter your admin credentials to access the ScraPair management dashboard.
            </p>
          </div>

          {/* Form Container */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 28, padding: 48 }}>

            {/* Error Message */}
            {error && (
              <div style={{
                background: C.errorBg,
                border: `1px solid ${C.errorBorder}`,
                borderRadius: 16,
                padding: '16px 20px',
                marginBottom: 32,
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
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Username</label>
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
                    padding: '14px 16px',
                    border: `1px solid ${focusedInput === 'username' ? C.borderHover : C.border}`,
                    borderRadius: 14,
                    background: 'rgba(100,255,67,0.03)',
                    color: C.text,
                    fontSize: 14,
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxShadow: focusedInput === 'username' ? `0 0 0 3px rgba(100,255,67,0.1)` : 'none',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              {/* Password Input */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block' }}>Password</label>
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
                    padding: '14px 16px',
                    border: `1px solid ${focusedInput === 'password' ? C.borderHover : C.border}`,
                    borderRadius: 14,
                    background: 'rgba(100,255,67,0.03)',
                    color: C.text,
                    fontSize: 14,
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxShadow: focusedInput === 'password' ? `0 0 0 3px rgba(100,255,67,0.1)` : 'none',
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
                  padding: '16px 24px',
                  marginTop: 16,
                  background: loading
                    ? 'linear-gradient(135deg, rgba(100,255,67,0.4), rgba(100,255,67,0.3))'
                    : 'linear-gradient(135deg, #64ff43, #4de029)',
                  color: '#062400',
                  fontSize: 15,
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: loading
                    ? '0 0 0 0px transparent, 0 4px 16px rgba(100,255,67,0.2)'
                    : '0 0 0 0px transparent, 0 8px 24px rgba(100,255,67,0.35)',
                  transform: loading ? 'scale(0.98)' : 'scale(1)',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.target.style.boxShadow = '0 0 0 5px rgba(100,255,67,0.15), 0 12px 36px rgba(100,255,67,0.5)';
                    e.target.style.transform = 'translateY(-2px) scale(1.01)';
                  }
                }}
                onMouseLeave={e => {
                  if (!loading) {
                    e.target.style.boxShadow = '0 0 0 0px transparent, 0 8px 24px rgba(100,255,67,0.35)';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(6,36,0,0.2)', borderTop: '2px solid #062400', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
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
              <span style={{ color: C.textLow, fontSize: 12 }}>secure access</span>
              <div style={{ flex: 1, height: '1px', background: C.border }} />
            </div>

            {/* Info Box */}
            <div style={{
              background: 'rgba(100,255,67,0.08)',
              border: `1px solid ${C.border}`,
              borderRadius: 16,
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
