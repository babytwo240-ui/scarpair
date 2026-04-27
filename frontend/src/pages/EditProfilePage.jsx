import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import DeleteAccountModal from '../components/DeleteAccountModal';

/* ─── Color tokens – 70% White / 30% Green Palette ────────────────── */
const C = {
  // Primary green (30%)
  primary: '#2e7d32',
  primaryDark: '#1b5e20',
  primaryLight: '#4caf50',
  // Backgrounds (70% white/light tones)
  bg: '#f8fafc',
  bgDeep: '#f1f5f9',
  surface: '#ffffff',
  surfaceHigh: '#f8fafc',
  cardHover: '#f1f5f9',
  // Text
  text: '#0f172a',
  textLight: '#475569',
  textLighter: '#94a3b8',
  // Borders
  border: 'rgba(0,0,0,0.08)',
  borderHover: 'rgba(46,125,50,0.25)',
  // Status colors
  danger: '#dc2626',
  dangerDark: '#b91c1c',
  dangerBg: 'rgba(220,38,38,0.08)',
  dangerBorder: 'rgba(220,38,38,0.25)',
  error: '#dc2626',
  errorBg: 'rgba(220,38,38,0.08)',
  errorBorder: 'rgba(220,38,38,0.25)',
  success: '#2e7d32',
  successBg: 'rgba(46,125,50,0.08)',
  successBorder: 'rgba(46,125,50,0.25)',
  // Glows
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

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [focusedField, setFocusedField] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    businessName: '',
    companyName: '',
    specialization: '',
  });

  useEffect(() => {
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc);
    return () => window.removeEventListener('scroll', sc);
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getProfile();
      const profileData = response.user || response.data;
      setFormData({
        email: profileData.email || '',
        phone: profileData.phone || '',
        businessName: profileData.businessName || '',
        companyName: profileData.companyName || '',
        specialization: profileData.specialization || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const updateData = { phone: formData.phone };
      if (user?.type === 'business') {
        updateData.businessName = formData.businessName;
      } else if (user?.type === 'recycler') {
        updateData.companyName = formData.companyName;
        updateData.specialization = formData.specialization;
      }

      await userService.updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate(user?.type === 'business' ? '/business/dashboard' : '/recycler/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowChangePassword(false), 1500);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccountSuccess = () => {
    setShowDeleteModal(false);
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.primary, animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 14, color: C.textLight }}>Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", color: C.text }}>
        <p>Please login to edit your profile.</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      fontFamily: "'Outfit', sans-serif",
      overflowX: 'hidden',
      color: C.text,
      position: 'relative',
    }}>
      <style>{KEYFRAMES}</style>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate(-1)}>
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
            onClick={() => navigate(-1)}
            className="cta-btn"
            style={{
              padding: '10px 26px',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              background: 'transparent',
              color: C.textLight,
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = C.primary;
              e.currentTarget.style.color = C.primary;
              e.currentTarget.style.background = C.glowLight;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.textLight;
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ← Back
          </button>
        </div>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '60px 32px 100px', position: 'relative', zIndex: 2 }}>
        {/* Header with green accent */}
        <div style={{ marginBottom: 48, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.primary }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>
              Settings
            </span>
            <div style={{ width: 40, height: 1, background: C.primary }} />
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 52,
            fontWeight: 600,
            letterSpacing: '-1.5px',
            margin: '0 0 12px',
            color: C.text,
          }}>
            Edit Profile
          </h1>
          <p style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: C.textLight,
            margin: 0,
          }}>
            {user.type === 'business' ? '👔 Business Account' : '♻️ Recycler Account'}
          </p>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div style={{
            background: C.errorBg,
            border: `1px solid ${C.errorBorder}`,
            borderRadius: 8,
            padding: '14px 18px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'fadeUp 0.4s ease both',
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="1.5" />
              <path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 13, color: C.error, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            background: C.successBg,
            border: `1px solid ${C.successBorder}`,
            borderRadius: 8,
            padding: '14px 18px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'fadeUp 0.4s ease both',
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" fill={C.success} />
            </svg>
            <span style={{ fontSize: 13, color: C.success, fontWeight: 500 }}>{success}</span>
          </div>
        )}

        {/* Profile Form Card */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 32,
            display: 'grid',
            gap: 24,
            marginBottom: 32,
            animation: 'fadeUp 0.7s ease 0.1s both',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            {/* Email (disabled) */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8, letterSpacing: '0.04em' }}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: C.bgDeep,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.textLighter,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  boxSizing: 'border-box',
                  cursor: 'not-allowed',
                }}
              />
              <small style={{ display: 'block', marginTop: 6, color: C.textLighter, fontSize: 11, letterSpacing: '0.03em' }}>
                Email cannot be changed
              </small>
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8, letterSpacing: '0.04em' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                required
                placeholder="+1 234 567 8900"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: C.bgDeep,
                  border: `1px solid ${focusedField === 'phone' ? C.primary : C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxShadow: focusedField === 'phone' ? `0 0 0 3px ${C.glowLight}` : 'none',
                }}
              />
            </div>

            {/* Business-specific fields */}
            {user.type === 'business' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8, letterSpacing: '0.04em' }}>
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('businessName')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Your business name"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: C.bgDeep,
                    border: `1px solid ${focusedField === 'businessName' ? C.primary : C.border}`,
                    borderRadius: 8,
                    color: C.text,
                    fontSize: 14,
                    fontFamily: "'Outfit', sans-serif",
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxShadow: focusedField === 'businessName' ? `0 0 0 3px ${C.glowLight}` : 'none',
                  }}
                />
              </div>
            )}

            {/* Recycler-specific fields */}
            {user.type === 'recycler' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8, letterSpacing: '0.04em' }}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('companyName')}
                    onBlur={() => setFocusedField(null)}
                    required
                    placeholder="Your company name"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: C.bgDeep,
                      border: `1px solid ${focusedField === 'companyName' ? C.primary : C.border}`,
                      borderRadius: 8,
                      color: C.text,
                      fontSize: 14,
                      fontFamily: "'Outfit', sans-serif",
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxShadow: focusedField === 'companyName' ? `0 0 0 3px ${C.glowLight}` : 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8, letterSpacing: '0.04em' }}>
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('specialization')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Plastic, Metal, Electronics"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: C.bgDeep,
                      border: `1px solid ${focusedField === 'specialization' ? C.primary : C.border}`,
                      borderRadius: 8,
                      color: C.text,
                      fontSize: 14,
                      fontFamily: "'Outfit', sans-serif",
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxShadow: focusedField === 'specialization' ? `0 0 0 3px ${C.glowLight}` : 'none',
                    }}
                  />
                  <small style={{ display: 'block', marginTop: 6, color: C.textLighter, fontSize: 11, letterSpacing: '0.03em' }}>
                    What materials do you specialize in?
                  </small>
                </div>
              </>
            )}
          </div>

          {/* Form Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 48 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                color: C.textLight,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 20px',
                background: saving ? C.textLighter : C.primary,
                border: 'none',
                borderRadius: 8,
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: saving ? 'none' : `0 2px 8px ${C.glowStrong}`,
              }}
              onMouseEnter={e => {
                if (!saving) {
                  e.target.style.background = C.primaryDark;
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = `0 4px 12px ${C.glowStrong}`;
                }
              }}
              onMouseLeave={e => {
                if (!saving) {
                  e.target.style.background = C.primary;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 2px 8px ${C.glowStrong}`;
                }
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Password Management Card */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 32,
          marginBottom: 32,
          animation: 'fadeUp 0.7s ease 0.15s both',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '-0.5px',
            color: C.text,
            margin: '0 0 20px',
          }}>
            🔐 Password Management
          </h2>

          {!showChangePassword ? (
            <button
              type="button"
              onClick={() => setShowChangePassword(true)}
              style={{
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
                fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.2s ease',
                boxShadow: `0 2px 6px ${C.glowStrong}`,
              }}
              onMouseEnter={e => {
                e.target.style.background = C.primaryDark;
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={e => {
                e.target.style.background = C.primary;
                e.target.style.transform = 'scale(1)';
              }}
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: 20 }}>
              {passwordError && (
                <div style={{
                  background: C.errorBg,
                  border: `1px solid ${C.errorBorder}`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span style={{ fontSize: 12, color: C.error, fontWeight: 500 }}>{passwordError}</span>
                </div>
              )}
              {passwordSuccess && (
                <div style={{
                  background: C.successBg,
                  border: `1px solid ${C.successBorder}`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span style={{ fontSize: 12, color: C.success, fontWeight: 500 }}>{passwordSuccess}</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8, letterSpacing: '0.04em' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: C.bgDeep,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    color: C.text,
                    fontSize: 14,
                    fontFamily: "'Outfit', sans-serif",
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = C.primary}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8, letterSpacing: '0.04em' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: C.bgDeep,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    color: C.text,
                    fontSize: 14,
                    fontFamily: "'Outfit', sans-serif",
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = C.primary}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
                <small style={{ fontSize: 11, color: C.textLighter, marginTop: 4, display: 'block', letterSpacing: '0.03em' }}>
                  Minimum 8 characters
                </small>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8, letterSpacing: '0.04em' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: C.bgDeep,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    color: C.text,
                    fontSize: 14,
                    fontFamily: "'Outfit', sans-serif",
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = C.primary}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    color: C.textLight,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.target.style.borderColor = C.primary;
                    e.target.style.color = C.primary;
                  }}
                  onMouseLeave={e => {
                    e.target.style.borderColor = C.border;
                    e.target.style.color = C.textLight;
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  style={{
                    padding: '10px 16px',
                    background: changingPassword ? C.textLighter : C.primary,
                    border: 'none',
                    borderRadius: 8,
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: changingPassword ? 'not-allowed' : 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                    transition: 'all 0.2s',
                  }}
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Danger Zone Card */}
        <div style={{
          background: C.dangerBg,
          border: `1px solid ${C.dangerBorder}`,
          borderRadius: 12,
          padding: 32,
          animation: 'fadeUp 0.7s ease 0.2s both',
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '-0.5px',
            color: C.danger,
            margin: '0 0 16px',
          }}>
            ⚠️ Danger Zone
          </h2>
          <p style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: C.textLight,
            marginBottom: 20,
          }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              padding: '10px 20px',
              background: C.danger,
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.target.style.background = C.dangerDark;
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={e => {
              e.target.style.background = C.danger;
              e.target.style.transform = 'scale(1)';
            }}
          >
            Delete Account
          </button>
        </div>
      </section>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleDeleteAccountSuccess}
      />
    </div>
  );
};

export default EditProfilePage;