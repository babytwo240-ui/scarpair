import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import collectionService from '../services/collectionService';
import wastePostService from '../services/wastePostService';
import { formatManila, formatManilaInput } from '../utils/manilaTimeFormatter';

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
  success:     '#86efac',
  successBg:   'rgba(134,239,172,0.1)',
  successBorder: 'rgba(134,239,172,0.3)',
};

const ManageCollectionRequestsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [approving, setApproving] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc);
    return () => window.removeEventListener('scroll', sc);
  }, []);

  useEffect(() => {
    fetchCollectionRequests();
  }, []);

  const fetchCollectionRequests = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const response = await collectionService.getAllCollections();
      const collectionsData = Array.isArray(response) ? response : (response.data || response);
      const pendingCollections = collectionsData.filter(
        (c) => c.status === 'PENDING' || c.status === 'pending'
      );
      setCollections(pendingCollections);
    } catch (err) {
      setError('Error fetching collection requests: ' + (err.message || 'Unknown error'));
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithNewWorkflow = async (collectionId, collection) => {
    if (!window.confirm('Approve this collection request? The recycler will have 1 hour to pick up.')) {
      return;
    }

    try {
      setApproving(collectionId);

      if (collection.postId && collection.recyclerId) {
        await wastePostService.approveRecycler(collection.postId, collection.recyclerId);
      }

      try {
        await collectionService.approveCollection(collectionId);
      } catch (collErr) {
      }

      setSuccess('Collection approved! Recycler has 1 hour to pick up.');
      setTimeout(() => {
        fetchCollectionRequests();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError('Error: ' + (err.message || 'Failed to approve collection'));
    } finally {
      setApproving(null);
    }
  };

  const handleRejectRequest = async (collectionId, rejectionCount) => {
    if (rejectionCount >= 4) {
      setError('You have already rejected this recycler 4 times. The next request will be auto-approved. You must continue or choose another recycler.');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this collection request?')) {
      return;
    }

    try {
      setApproving(collectionId);
      await collectionService.rejectCollection(collectionId);
      setSuccess('Collection request rejected');
      setTimeout(() => {
        fetchCollectionRequests();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError('Error: ' + (err.message || 'Failed to reject request'));
    } finally {
      setApproving(null);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, marginBottom: 20 }}>Please login to manage collection requests.</p>
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

  if (user.type !== 'business') {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18 }}>Only business owners can manage collection requests.</p>
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
          <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Requests</div>
          <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-1.8px', color: C.text, margin: 0, lineHeight: 1.1, marginBottom: 12 }}>
            Collection Requests
          </h1>
          <p style={{ fontSize: 16, color: C.textMid, maxWidth: 600, lineHeight: 1.7, margin: 0 }}>
            Review and approve collection requests from recyclers. Approved recyclers will have 1 hour to pick up materials.
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

        {/* Success Message */}
        {success && (
          <div style={{
            background: C.successBg,
            border: `1px solid ${C.successBorder}`,
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="9" stroke={C.success} strokeWidth="2"/>
              <path d="M7 10l2 2 4-4" stroke={C.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 14, color: C.success, fontWeight: 500 }}>{success}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 16, color: C.textMid }}>Loading collection requests...</div>
          </div>
        ) : collections.length === 0 ? (
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 24,
            padding: '80px 40px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>📭</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: '0 0 12px' }}>
              No pending requests
            </h2>
            <p style={{ fontSize: 16, color: C.textMid, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
              You don't have any pending collection requests at the moment.
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
            {collections.map((collection) => (
              <div
                key={collection.id}
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
                  background: 'rgba(100,255,67,0.08)',
                  borderBottom: `1px solid ${C.border}`,
                  padding: '16px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: C.text,
                    margin: 0,
                    letterSpacing: '-0.3px',
                  }}>
                    {collection.postTitle || collection.post?.title || 'Unnamed Post'}
                  </h3>
                  <div style={{
                    background: `linear-gradient(135deg, ${C.bright}, #4de029)`,
                    color: '#062400',
                    padding: '6px 12px',
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>
                    {collection.status || 'PENDING'}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Transaction Code */}
                  <div style={{
                    background: 'rgba(100,255,67,0.04)',
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: '12px 16px',
                  }}>
                    <div style={{ fontSize: 11, color: C.textLow, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Transaction Code</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.bright }}>
                      {collection.transactionCode || `Collection #${collection.id}`}
                    </div>
                  </div>

                  {/* Recycler Information */}
                  <div>
                    <div style={{ fontSize: 11, color: C.textLow, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Recycler</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 12, color: C.textMid }}>Name</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                          {collection.recyclerName || collection.recycler?.name || 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: C.textMid }}>Email</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.bright, wordBreak: 'break-all' }}>
                          {collection.recyclerEmail || collection.recycler?.email || 'N/A'}
                        </div>
                      </div>
                      {(collection.recyclerPhone || collection.recycler?.phone) && (
                        <div>
                          <div style={{ fontSize: 12, color: C.textMid }}>Phone</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                            {collection.recyclerPhone || collection.recycler?.phone}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Material Details */}
                  <div>
                    <div style={{ fontSize: 11, color: C.textLow, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Material</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 12, color: C.textMid }}>Type</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                            {collection.postWasteType || collection.post?.wasteType || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: C.textMid }}>Condition</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                            {collection.postCondition || collection.post?.condition || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: C.textMid }}>Quantity</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.bright }}>
                          {collection.postQuantity || collection.post?.quantity || 'N/A'} {collection.postUnit || collection.post?.unit || ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date & Rejection Info */}
                  <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
                    <div>
                      <div style={{ color: C.textLow, marginBottom: 4 }}>Requested</div>
                      <div style={{ color: C.text, fontWeight: 600 }}>
                        {collection.requestDate ? formatManila(collection.requestDate) : 'N/A'}
                      </div>
                    </div>
                    {collection.scheduledDate && (
                      <div>
                        <div style={{ color: C.bright, marginBottom: 4, fontWeight: 700 }}>Proposed Pickup</div>
                        <div style={{ color: C.bright, fontWeight: 700 }}>
                          {formatManilaInput(collection.scheduledDate)}
                        </div>
                      </div>
                    )}
                    {collection.rejectionCount !== undefined && (
                      <div style={{
                        background: collection.rejectionCount >= 4 ? 'rgba(255,107,107,0.12)' : 'rgba(251,191,36,0.12)',
                        border: `1px solid ${collection.rejectionCount >= 4 ? 'rgba(255,107,107,0.3)' : 'rgba(251,191,36,0.3)'}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                        color: collection.rejectionCount >= 4 ? '#ff6b6b' : '#fbbf24',
                        fontWeight: 700,
                        fontSize: 11,
                      }}>
                        ⚠️ Rejections: {collection.rejectionCount}/4
                        {collection.rejectionCount >= 4 && ' — NEXT WILL AUTO-APPROVE'}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr', marginTop: 'auto' }}>
                    <button
                      onClick={() => handleApproveWithNewWorkflow(collection.id, collection)}
                      disabled={approving === collection.id}
                      style={{
                        padding: '12px 16px',
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: 100,
                        border: 'none',
                        background: `linear-gradient(135deg, ${C.bright}, #4de029)`,
                        color: '#062400',
                        cursor: approving === collection.id ? 'not-allowed' : 'pointer',
                        transition: 'all 0.22s',
                        gridColumn: '1 / -1',
                        opacity: approving === collection.id ? 0.6 : 1,
                        boxShadow: `0 0 12px ${C.glowStrong}`,
                      }}
                      onMouseEnter={e => {
                        if (approving !== collection.id) {
                          e.target.style.transform = 'translateY(-1px) scale(1.01)';
                          e.target.style.boxShadow = `0 0 20px ${C.glowStrong}, 0 4px 16px rgba(100,255,67,0.35)`;
                        }
                      }}
                      onMouseLeave={e => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = `0 0 12px ${C.glowStrong}`;
                      }}
                    >
                      {approving === collection.id ? '⏳ Approving...' : '✅ Approve'}
                    </button>

                    <button
                      onClick={() => handleRejectRequest(collection.id, collection.rejectionCount || 0)}
                      disabled={approving === collection.id || (collection.rejectionCount !== undefined && collection.rejectionCount >= 4)}
                      title={collection.rejectionCount >= 4 ? 'Rejection limit reached' : ''}
                      style={{
                        padding: '12px 16px',
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: 100,
                        border: (collection.rejectionCount !== undefined && collection.rejectionCount >= 4) ? `1px solid ${C.textLow}` : 'none',
                        background: (collection.rejectionCount !== undefined && collection.rejectionCount >= 4) 
                          ? 'transparent'
                          : `linear-gradient(135deg, rgba(255,107,107,0.8), rgba(255,80,80,0.8))`,
                        color: (collection.rejectionCount !== undefined && collection.rejectionCount >= 4) ? C.textLow : '#fff',
                        cursor: (approving === collection.id || (collection.rejectionCount !== undefined && collection.rejectionCount >= 4)) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.22s',
                        boxShadow: (collection.rejectionCount !== undefined && collection.rejectionCount >= 4) ? 'none' : '0 0 12px rgba(255,107,107,0.25)',
                      }}
                      onMouseEnter={e => {
                        if (approving !== collection.id && !(collection.rejectionCount >= 4)) {
                          e.target.style.transform = 'translateY(-1px) scale(1.01)';
                          e.target.style.boxShadow = '0 0 20px rgba(255,107,107,0.4), 0 4px 16px rgba(255,107,107,0.35)';
                        }
                      }}
                      onMouseLeave={e => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        if (!(collection.rejectionCount >= 4)) {
                          e.target.style.boxShadow = '0 0 12px rgba(255,107,107,0.25)';
                        }
                      }}
                    >
                      {collection.rejectionCount >= 4 ? '🔒 Locked' : '❌ Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

export default ManageCollectionRequestsPage;
