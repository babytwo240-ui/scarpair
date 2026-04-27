import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext.jsx';

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
  success: '#2e7d32',
  successBg: 'rgba(46,125,50,0.08)',
  error: '#dc2626',
  errorBg: 'rgba(220,38,38,0.08)',
  info: '#2563eb',
  infoBg: 'rgba(37,99,235,0.08)',
  // Glows
  glowLight: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = searchParams.get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.verifyEmail(email, code);
      // Redirect based on user type
      if (user?.type === 'business') {
        navigate('/business/dashboard');
      } else if (user?.type === 'recycler') {
        navigate('/recycler/dashboard');
      } else {
        navigate('/role-selection');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('Resend verification is not available. Please check your email for the verification code.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      fontFamily: "'Outfit', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: C.surface,
        borderRadius: '20px',
        border: `1px solid ${C.border}`,
        padding: '40px',
        boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)',
        animation: 'fadeUp 0.5s ease both',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 20px',
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 20px ${C.glowStrong}`,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: C.text,
            margin: '0 0 8px',
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '-0.5px',
          }}>
            Verify Email
          </h1>
          <p style={{
            fontSize: '14px',
            color: C.textLight,
            margin: 0,
            lineHeight: 1.5,
          }}>
            We've sent a verification code to
          </p>
          <p style={{
            fontSize: '15px',
            fontWeight: 600,
            color: C.primary,
            margin: '4px 0 0',
          }}>
            {email || 'your email address'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: C.errorBg,
            border: `1px solid ${C.error}33`,
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2" />
              <path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: '13px', color: C.error, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {resendSuccess && (
          <div style={{
            background: C.successBg,
            border: `1px solid ${C.success}33`,
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-10.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fill={C.success} />
            </svg>
            <span style={{ fontSize: '13px', color: C.success, fontWeight: 500 }}>{resendSuccess}</span>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: C.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px',
            }}>
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              maxLength="6"
              required
              style={{
                width: '100%',
                padding: '16px',
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                background: C.surfaceHigh,
                fontSize: '28px',
                fontWeight: 600,
                letterSpacing: '8px',
                textAlign: 'center',
                color: C.text,
                fontFamily: "'DM Mono', monospace",
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = C.borderHover;
                e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = C.border;
                e.target.style.boxShadow = 'none';
              }}
            />
            <p style={{
              fontSize: '11px',
              color: C.textLighter,
              marginTop: '8px',
              textAlign: 'center',
            }}>
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: C.primary,
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              boxShadow: `0 2px 8px ${C.glowStrong}`,
              marginBottom: '12px',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = C.primaryDark;
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = `0 4px 12px ${C.glowStrong}`;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = C.primary;
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 2px 8px ${C.glowStrong}`;
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ width: '16px', height: '16px', border: `2px solid #ffffff`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Verifying...
              </span>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={resendLoading}
          style={{
            width: '100%',
            padding: '12px 20px',
            background: 'transparent',
            color: C.textLight,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: resendLoading ? 'not-allowed' : 'pointer',
            opacity: resendLoading ? 0.6 : 1,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!resendLoading) {
              e.target.style.borderColor = C.primary;
              e.target.style.color = C.primary;
              e.target.style.background = C.glowLight;
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = C.border;
            e.target.style.color = C.textLight;
            e.target.style.background = 'transparent';
          }}
        >
          {resendLoading ? 'Sending...' : 'Resend Code'}
        </button>

        {/* Footer Note */}
        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: `1px solid ${C.border}`,
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '11px',
            color: C.textLighter,
            margin: 0,
          }}>
            Didn't receive the code? Check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;