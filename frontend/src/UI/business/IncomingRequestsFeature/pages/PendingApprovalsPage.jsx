import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import wastePostService from '../../../../services/wastePostService';
import { formatManila } from '../../../../utils/manilaTimeFormatter';

/* ─── Color tokens (matching LandingPage & BusinessDashboard) ────────────────
   bright  : #64ff43  (electric lime-green – CTA, glows, accents)
   deep    : #124d05  (forest dark – surfaces, cards)
   darker  : #0a2e03  (near-black base)
   surface : #0d3806  (card backgrounds)
   text    : #e6ffe0  (off-white tinted green)
──────────────────────────────────────────────────────────────────────────── */
const C = {
  bright:      '#64ff43',
  deep:        '#124d05',
  darker:      '#0a2e03',
  surface:     '#0d3806',
  border:      'rgba(100,255,67,0.18)',
  borderHover: 'rgba(100,255,67,0.45)',
  text:        '#e6ffe0',
  textMid:     'rgba(230,255,224,0.55)',
  textLow:     'rgba(230,255,224,0.3)',
  glow:        'rgba(100,255,67,0.22)',
  glowStrong:  'rgba(100,255,67,0.45)',
  error:       '#ff6b6b',
  errorBg:     'rgba(255,107,107,0.1)',
  errorBorder: 'rgba(255,107,107,0.3)',
  warning:     '#fbbf24',
  warningBg:   'rgba(251,191,36,0.1)',
  warningBorder: 'rgba(251,191,36,0.3)',
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
      <div style={{ minHeight: '100vh', background: C.darker, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, marginBottom: 20 }}>Please login to view pending approvals.</p>
          <button
            onClick={() => navigate('/business/login')}
            style={{
              padding: '12px 28px',
              background: `linear-gradient(135deg, ${C.bright}, #4de029)`,
              color: '#062400',
              border: 'none',
              borderRadius: 100,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden', color: C.text }}>

      {/* Grain overlay */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(10,46,3,0.93)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(28px)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.35s ease' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/business/dashboard')}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(100,255,67,0.12)', border: `1px solid ${C.borderHover}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4zM3.444 11H9v5.472A6.002 6.002 0 0 1 3.444 11zm6.556 5.472V11h5.556A6.002 6.002 0 0 1 10 16.472z" fill={C.bright}/>
              </svg>
            </div>
            <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.5px', color: C.text }}>ScraPair</span>
          </div>
          <button
            onClick={() => navigate('/business/dashboard')}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 100,
              border: `1px solid ${C.border}`,
              background: 'transparent',
              color: C.text,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = C.borderHover; e.target.style.background = 'rgba(100,255,67,0.05)'; }}
            onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '80px 40px 60px', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Approvals</div>
          <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-1.8px', color: C.text, margin: 0, lineHeight: 1.1, marginBottom: 12 }}>
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
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2"/>
              <path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 16, color: C.textMid }}>Loading pending approvals...</div>
          </div>
        ) : approvals.length === 0 ? (
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 24,
            padding: '80px 40px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>📭</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: '0 0 12px' }}>
              No pending approvals
            </h2>
            <p style={{ fontSize: 16, color: C.textMid, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
              You don't have any pending approvals at the moment.
            </p>
            <button
              onClick={() => navigate('/business/posts')}
              style={{
                padding: '12px 28px',
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 100,
                border: `1px solid ${C.border}`,
                background: 'rgba(100,255,67,0.08)',
                color: C.bright,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = C.borderHover; e.target.style.background = 'rgba(100,255,67,0.15)'; }}
              onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'rgba(100,255,67,0.08)'; }}
            >
              View My Posts
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {approvals.map((approval) => {
              const warningStatus = getWarningStatus(approval.pickupDeadline);

              return (
                <div
                  key={approval.id}
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 20,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = C.borderHover;
                    e.currentTarget.style.transform = 'translateY(-8px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Status Header */}
                  <div style={{
                    background: warningStatus === 'expired' 
                      ? 'rgba(255,107,107,0.12)' 
                      : warningStatus === 'warning'
                      ? 'rgba(251,191,36,0.12)'
                      : 'rgba(100,255,67,0.08)',
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
                        fontWeight: 800,
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
                        ? '#ff6b6b'
                        : warningStatus === 'warning'
                        ? '#fbbf24'
                        : C.bright,
                      color: warningStatus === 'warning' ? '#333' : '#062400',
                      padding: '6px 12px',
                      borderRadius: 100,
                      fontSize: 11,
                      fontWeight: 800,
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
                      <div style={{ fontSize: 11, color: C.textLow, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Approved Recycler</div>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 12, color: C.textMid }}>Name</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                            {approval.approvedRecycler?.name || 'Unknown Recycler'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: C.textMid }}>Email</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.bright, wordBreak: 'break-all' }}>
                            {approval.approvedRecycler?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pickup Countdown */}
                    {approval.pickupDeadline && (
                      <div>
                        <div style={{ fontSize: 11, color: C.textLow, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Time Remaining</div>
                        <CountdownTimer
                          deadline={approval.pickupDeadline}
                          warningStatus={warningStatus}
                        />
                      </div>
                    )}

                    {/* Pickup Status */}
                    {approval.pickedUpAt && (
                      <div style={{
                        background: 'rgba(134,239,172,0.12)',
                        border: '1px solid rgba(134,239,172,0.3)',
                        borderRadius: 12,
                        padding: '12px 16px',
                      }}>
                        <div style={{ fontSize: 11, color: C.textLow, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>Picked Up</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#86efac' }}>
                          {formatManila(approval.pickedUpAt)}
                        </div>
                      </div>
                    )}

                    {/* Material Details */}
                    <div>
                      <div style={{ fontSize: 11, color: C.textLow, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Material Details</div>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 12, color: C.textMid }}>Condition</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{approval.condition}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: C.textMid }}>Location</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{approval.address}, {approval.city}</div>
                        </div>
                        {approval.description && (
                          <div>
                            <div style={{ fontSize: 12, color: C.textMid }}>Description</div>
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
                          fontSize: 13,
                          fontWeight: 700,
                          borderRadius: 100,
                          border: 'none',
                          background: `linear-gradient(135deg, rgba(255,107,107,0.8), rgba(255,80,80,0.8))`,
                          color: '#fff',
                          cursor: canceling === approval.id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.22s',
                          marginTop: 'auto',
                          opacity: canceling === approval.id ? 0.6 : 1,
                          boxShadow: '0 0 12px rgba(255,107,107,0.25)',
                        }}
                        onMouseEnter={e => {
                          if (canceling !== approval.id) {
                            e.target.style.transform = 'translateY(-1px) scale(1.01)';
                            e.target.style.boxShadow = '0 0 20px rgba(255,107,107,0.4), 0 4px 16px rgba(255,107,107,0.35)';
                          }
                        }}
                        onMouseLeave={e => {
                          e.target.style.transform = 'translateY(0) scale(1)';
                          e.target.style.boxShadow = '0 0 12px rgba(255,107,107,0.25)';
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
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '48px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', textAlign: 'center', color: C.textLow, fontSize: 14 }}>
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
        ? 'rgba(255,107,107,0.12)' 
        : warningStatus === 'warning'
        ? 'rgba(251,191,36,0.12)'
        : 'rgba(100,255,67,0.12)',
      border: warningStatus === 'expired'
        ? '1px solid rgba(255,107,107,0.3)'
        : warningStatus === 'warning'
        ? '1px solid rgba(251,191,36,0.3)'
        : `1px solid rgba(100,255,67,0.3)`,
      borderRadius: 12,
      padding: '12px 16px',
      fontSize: 16,
      fontWeight: 800,
      color: warningStatus === 'expired'
        ? '#ff6b6b'
        : warningStatus === 'warning'
        ? '#fbbf24'
        : '#64ff43',
      fontFamily: 'monospace',
      letterSpacing: '1px',
      textAlign: 'center',
    }}>
      {timeLeft || 'Loading...'}
    </div>
  );
}

export default PendingApprovalsPage;
