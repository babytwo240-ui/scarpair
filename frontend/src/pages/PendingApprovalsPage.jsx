import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import wastePostService from '../services/wastePostService';
import { formatManila } from '../utils/manilaTimeFormatter';

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
  warning: '#d97706',
  warningBg: 'rgba(217,119,6,0.08)',
  warningBorder: 'rgba(217,119,6,0.25)',
  success: '#2e7d32',
  successBg: 'rgba(46,125,50,0.08)',
  glowLight: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

const PendingApprovalsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [canceling, setCanceling] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc);
    return () => window.removeEventListener('scroll', sc);
  }, []);

  useEffect(() => {
    fetchPendingApprovals();
  }, [page]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wastePostService.getUserWastePosts(page, 20);
      const approvedPosts = (response.data || []).filter(
        post => post.collectionStatus === 'APPROVED'
      );
      setApprovals(approvedPosts);
    } catch (err) {
      setError(err.message || 'Failed to load pending approvals');
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelApproval = async (postId) => {
    if (!window.confirm('Are you sure you want to cancel this approval? The post will return to the marketplace.')) {
      return;
    }

    try {
      setCanceling(postId);
      await wastePostService.cancelApproval(postId);
      setError('');
      fetchPendingApprovals();
    } catch (err) {
      setError('Error: ' + (err.message || 'Failed to cancel approval'));
    } finally {
      setCanceling(null);
    }
  };

  const getWarningStatus = (deadline) => {
    const now = new Date();
    const deadlineTime = new Date(deadline);
    const diff = deadlineTime - now;

    if (diff <= 0) {
      return 'expired';
    }
    if (diff <= 5 * 60 * 1000) {
      return 'warning';
    }
    return 'ok';
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, marginBottom: 20 }}>Please login to view pending approvals.</p>
          <button
            onClick={() => navigate('/business/login')}
            style={{
              padding: '12px 28px',
              background: C.bright,
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'Outfit', sans-serif", overflowX: 'hidden', color: C.text, position: 'relative' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
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
      </div>

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(255,255,255,0.92)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(24px) saturate(1.5)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/business/dashboard')}>
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
          <button
            onClick={() => navigate('/business/dashboard')}
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
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.color = C.bright; e.target.style.background = C.glowLight; }}
            onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textLight; e.target.style.background = 'transparent'; }}
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '80px 40px 60px', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ marginBottom: 72, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.bright }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.bright }}>Approvals</span>
            <div style={{ width: 40, height: 1, background: C.bright }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 600, letterSpacing: '-1.5px', color: C.text, margin: 0, lineHeight: 1.1, marginBottom: 12 }}>
            Pending Approvals
          </h1>
          <p style={{ fontSize: 16, color: C.textMid, maxWidth: 600, lineHeight: 1.7, margin: 0 }}>
            Manage recyclers you've approved for collection. Recyclers have 1 hour to pick up from approval time.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: C.errorBg,
            border: `1px solid ${C.errorBorder}`,
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 40,
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

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.bright, animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <div style={{ fontSize: 16, color: C.textMid }}>Loading pending approvals...</div>
          </div>
        ) : approvals.length === 0 ? (
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: '80px 40px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>📭</div>
            <h2 style={{ fontSize: 24, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif", color: C.text, margin: '0 0 12px' }}>
              No pending approvals
            </h2>
            <p style={{ fontSize: 16, color: C.textMid, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
              You don't have any pending approvals at the moment.
            </p>
            <button
              onClick={() => navigate('/business/posts')}
              style={{
                padding: '12px 28px',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.06em',
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.glowLight,
                color: C.bright,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.background = C.glowLight; e.target.style.color = C.brightDark; }}
              onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = C.glowLight; e.target.style.color = C.bright; }}
            >
              View My Posts
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
            {approvals.map((approval, index) => {
              const warningStatus = getWarningStatus(approval.pickupDeadline);

              return (
                <div
                  key={approval.id}
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    animation: `fadeUp 0.4s ease ${index * 0.05}s both`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = C.borderHover;
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = `0 20px 40px -12px rgba(0,0,0,0.12)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                  }}
                >
                  {/* Status Header */}
                  <div style={{
                    background: warningStatus === 'expired'
                      ? C.errorBg
                      : warningStatus === 'warning'
                        ? C.warningBg
                        : C.successBg,
                    borderBottom: `1px solid ${C.border}`,
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    gap: 12,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: 18,
                        fontWeight: 700,
                        fontFamily: "'Cormorant Garamond', serif",
                        color: C.text,
                        margin: 0,
                        letterSpacing: '-0.3px',
                        wordBreak: 'break-word',
                      }}>
                        {approval.title}
                      </h3>
                      <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
                        {approval.wasteType} • {approval.quantity} {approval.unit}
                      </div>
                    </div>
                    <div style={{
                      background: warningStatus === 'expired'
                        ? C.error
                        : warningStatus === 'warning'
                          ? C.warning
                          : C.bright,
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: 100,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {warningStatus === 'expired' ? '🚨 EXPIRED' : warningStatus === 'warning' ? '⚠️ URGENT' : '✅ ACTIVE'}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Approved Recycler */}
                    <div>
                      <div style={{ fontSize: 10, color: C.textLow, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Approved Recycler</div>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 11, color: C.textMid }}>Name</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                            {approval.approvedRecycler?.name || 'Unknown Recycler'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: C.textMid }}>Email</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.bright, wordBreak: 'break-all' }}>
                            {approval.approvedRecycler?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pickup Countdown */}
                    {approval.pickupDeadline && (
                      <div>
                        <div style={{ fontSize: 10, color: C.textLow, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Time Remaining</div>
                        <CountdownTimer
                          deadline={approval.pickupDeadline}
                          warningStatus={warningStatus}
                        />
                      </div>
                    )}

                    {/* Pickup Status */}
                    {approval.pickedUpAt && (
                      <div style={{
                        background: C.successBg,
                        border: `1px solid ${C.bright}33`,
                        borderRadius: 12,
                        padding: '12px 16px',
                      }}>
                        <div style={{ fontSize: 10, color: C.textLow, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>Picked Up</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.bright }}>
                          {formatManila(approval.pickedUpAt)}
                        </div>
                      </div>
                    )}

                    {/* Material Details */}
                    <div>
                      <div style={{ fontSize: 10, color: C.textLow, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Material Details</div>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 11, color: C.textMid }}>Condition</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{approval.condition}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: C.textMid }}>Location</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{approval.address}, {approval.city}</div>
                        </div>
                        {approval.description && (
                          <div>
                            <div style={{ fontSize: 11, color: C.textMid }}>Description</div>
                            <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.5 }}>
                              {approval.description.substring(0, 100)}{approval.description.length > 100 ? '...' : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cancel Button */}
                    {approval.collectionStatus === 'APPROVED' && !approval.pickedUpAt && (
                      <button
                        onClick={() => handleCancelApproval(approval.id)}
                        disabled={canceling === approval.id}
                        style={{
                          padding: '12px 16px',
                          fontSize: 12,
                          fontWeight: 600,
                          borderRadius: 8,
                          border: 'none',
                          background: C.error,
                          color: '#ffffff',
                          cursor: canceling === approval.id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          marginTop: 'auto',
                          opacity: canceling === approval.id ? 0.6 : 1,
                        }}
                        onMouseEnter={e => {
                          if (canceling !== approval.id) {
                            e.target.style.background = '#b91c1c';
                            e.target.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={e => {
                          e.target.style.background = C.error;
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        {canceling === approval.id ? '⏳ Cancelling...' : '❌ Cancel Approval'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '48px 40px', position: 'relative', zIndex: 2, background: C.surface }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', textAlign: 'center', color: C.textLow, fontSize: 13 }}>
          <p style={{ margin: 0 }}>© 2026 ScraPair. Connecting waste with purpose.</p>
        </div>
      </footer>
    </div>
  );
};

/**
 * Countdown Timer Component
 */
function CountdownTimer({ deadline, warningStatus }) {
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

  return (
    <div style={{
      background: warningStatus === 'expired'
        ? C.errorBg
        : warningStatus === 'warning'
          ? C.warningBg
          : C.successBg,
      border: warningStatus === 'expired'
        ? `1px solid ${C.errorBorder}`
        : warningStatus === 'warning'
          ? `1px solid ${C.warningBorder}`
          : `1px solid ${C.bright}33`,
      borderRadius: 12,
      padding: '12px 16px',
      fontSize: 16,
      fontWeight: 700,
      fontFamily: "'DM Mono', monospace",
      color: warningStatus === 'expired'
        ? C.error
        : warningStatus === 'warning'
          ? C.warning
          : C.bright,
      letterSpacing: '1px',
      textAlign: 'center',
    }}>
      {timeLeft || 'Loading...'}
    </div>
  );
}

export default PendingApprovalsPage;