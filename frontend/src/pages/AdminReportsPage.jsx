import React, { useState, useEffect } from 'react';
import reportService from '../services/reportService';
import '../styles/AdminPages.css';

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
  successBorder: 'rgba(46,125,50,0.25)',
  error: '#dc2626',
  errorBg: 'rgba(220,38,38,0.08)',
  errorBorder: 'rgba(220,38,38,0.25)',
  warning: '#d97706',
  warningBg: 'rgba(217,119,6,0.08)',
  warningBorder: 'rgba(217,119,6,0.25)',
  info: '#2563eb',
  infoBg: 'rgba(37,99,235,0.08)',
  infoBorder: 'rgba(37,99,235,0.2)',
  // Glows
  glowLight: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [view, setView] = useState('pending'); // 'pending' or 'all'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchReports();
  }, [view]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');

      let data;
      if (view === 'pending') {
        data = await reportService.getPendingReports(1, 50);
      } else {
        data = await reportService.getAllReports(1, 50);
      }

      setReports(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reportId) => {
    if (actionInProgress) return;

    try {
      setActionInProgress(reportId);
      setError('');
      await reportService.approveReport(reportId);

      setSelectedReport(null);
      await fetchReports();
    } catch (err) {
      setError(err.message || 'Failed to approve report');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (reportId) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    if (actionInProgress) return;

    try {
      setActionInProgress(reportId);
      setError('');
      await reportService.rejectReport(reportId, rejectionReason.trim());

      setSelectedReport(null);
      setRejectionReason('');
      await fetchReports();
    } catch (err) {
      setError(err.message || 'Failed to reject report');
    } finally {
      setActionInProgress(null);
    }
  };

  const getReasonLabel = (reason) => {
    const map = {
      poor_quality: 'Poor Quality',
      late_pickup: 'Late Pickup',
      damaged_materials: 'Damaged Materials',
      incomplete_delivery: 'Incomplete Delivery',
      bad_behavior: 'Bad Behavior',
      other: 'Other'
    };
    return map[reason] || reason;
  };

  const getStatusBadgeColor = (status) => {
    if (status === 'approved') return C.success;
    if (status === 'rejected') return C.error;
    if (status === 'pending') return C.warning;
    return C.textLighter;
  };

  const getStatusBadgeBg = (status) => {
    if (status === 'approved') return C.successBg;
    if (status === 'rejected') return C.errorBg;
    if (status === 'pending') return C.warningBg;
    return 'transparent';
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.primary, animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 14, color: C.textLight }}>Loading reports...</div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      fontFamily: "'Outfit', sans-serif",
      color: C.text,
      padding: '40px',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.primary }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>Management</span>
            <div style={{ width: 40, height: 1, background: C.primary }} />
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 48,
            fontWeight: 600,
            letterSpacing: '-1.5px',
            margin: '0 0 12px',
            color: C.text
          }}>
            User Reports
          </h1>
          <p style={{ fontSize: 15, color: C.textLight, margin: 0 }}>Review and manage user-submitted reports</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: C.errorBg,
            border: `1px solid ${C.errorBorder}`,
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2" />
              <path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 13, color: C.error, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* View Tabs */}
        <div style={{
          display: 'flex',
          gap: 12,
          marginBottom: 32,
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: 12,
        }}>
          <button
            onClick={() => setView('pending')}
            style={{
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              background: view === 'pending' ? C.primary : 'transparent',
              color: view === 'pending' ? '#ffffff' : C.textLight,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (view !== 'pending') { e.target.style.color = C.primary; } }}
            onMouseLeave={e => { if (view !== 'pending') { e.target.style.color = C.textLight; } }}
          >
            Pending Reports ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setView('all')}
            style={{
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              background: view === 'all' ? C.primary : 'transparent',
              color: view === 'all' ? '#ffffff' : C.textLight,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (view !== 'all') { e.target.style.color = C.primary; } }}
            onMouseLeave={e => { if (view !== 'all') { e.target.style.color = C.textLight; } }}
          >
            All Reports ({reports.length})
          </button>
        </div>

        {selectedReport ? (
          /* Report Detail View */
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <button
              onClick={() => setSelectedReport(null)}
              style={{
                padding: '10px 20px',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.06em',
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: 'transparent',
                color: C.textLight,
                cursor: 'pointer',
                marginBottom: 24,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = C.primary; e.target.style.color = C.primary; e.target.style.background = C.glowLight; }}
              onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textLight; e.target.style.background = 'transparent'; }}
            >
              ← Back to List
            </button>

            <div style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: C.text, margin: 0 }}>
                  Report #{selectedReport.id}
                </h3>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  background: getStatusBadgeBg(selectedReport.status),
                  color: getStatusBadgeColor(selectedReport.status),
                  border: `1px solid ${getStatusBadgeColor(selectedReport.status)}33`,
                }}>
                  {selectedReport.status}
                </span>
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 11, color: C.textLighter, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Reason</p>
                    <p style={{ fontSize: 14, color: C.text, fontWeight: 500, margin: '4px 0 0' }}>{getReasonLabel(selectedReport.reason)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: C.textLighter, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Reporter</p>
                    <p style={{ fontSize: 14, color: C.text, fontWeight: 500, margin: '4px 0 0' }}>{selectedReport.reporter?.email}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: C.textLighter, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Reported User</p>
                    <p style={{ fontSize: 14, color: C.text, fontWeight: 500, margin: '4px 0 0' }}>{selectedReport.reportedUser?.email}</p>
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: 11, color: C.textLighter, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Validity Score</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <div style={{ flex: 1, height: 8, background: C.surfaceHigh, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${(selectedReport.validityScore * 100)}%`, height: '100%', background: C.primary, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>{(selectedReport.validityScore * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: 11, color: C.textLighter, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Submitted</p>
                  <p style={{ fontSize: 14, color: C.text, fontWeight: 500, margin: '4px 0 0' }}>{new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <p style={{ fontSize: 11, color: C.textLighter, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Description</p>
                  <div style={{
                    background: C.surfaceHigh,
                    padding: 16,
                    borderRadius: 12,
                    marginTop: 8,
                  }}>
                    <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6, margin: 0 }}>{selectedReport.description}</p>
                  </div>
                </div>

                {selectedReport.status === 'pending' ? (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ marginBottom: 16 }}>
                      <button
                        onClick={() => handleApprove(selectedReport.id)}
                        disabled={actionInProgress}
                        style={{
                          width: '100%',
                          padding: '12px 20px',
                          background: C.success,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          letterSpacing: '0.06em',
                          cursor: actionInProgress ? 'not-allowed' : 'pointer',
                          opacity: actionInProgress ? 0.6 : 1,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (!actionInProgress) { e.target.style.background = C.primaryDark; } }}
                        onMouseLeave={e => { if (!actionInProgress) { e.target.style.background = C.success; } }}
                      >
                        {actionInProgress === selectedReport.id ? 'Approving...' : '✓ Approve Report'}
                      </button>
                    </div>

                    <div>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Reason for rejection (required)..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: C.surfaceHigh,
                          border: `1px solid ${C.border}`,
                          borderRadius: 8,
                          color: C.text,
                          fontSize: 13,
                          fontFamily: "'Outfit', sans-serif",
                          resize: 'vertical',
                          outline: 'none',
                          transition: 'all 0.2s',
                          marginBottom: 12,
                          boxSizing: 'border-box',
                        }}
                        onFocus={e => e.target.style.borderColor = C.primary}
                        onBlur={e => e.target.style.borderColor = C.border}
                      />
                      <button
                        onClick={() => handleReject(selectedReport.id)}
                        disabled={actionInProgress || !rejectionReason.trim()}
                        style={{
                          width: '100%',
                          padding: '12px 20px',
                          background: C.error,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          letterSpacing: '0.06em',
                          cursor: (actionInProgress || !rejectionReason.trim()) ? 'not-allowed' : 'pointer',
                          opacity: (actionInProgress || !rejectionReason.trim()) ? 0.6 : 1,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (!actionInProgress && rejectionReason.trim()) { e.target.style.background = '#b91c1c'; } }}
                        onMouseLeave={e => { if (!actionInProgress && rejectionReason.trim()) { e.target.style.background = C.error; } }}
                      >
                        {actionInProgress === selectedReport.id ? 'Rejecting...' : '✗ Reject Report'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: selectedReport.status === 'approved' ? C.successBg : C.errorBg,
                    border: `1px solid ${selectedReport.status === 'approved' ? C.successBorder : C.errorBorder}`,
                    borderRadius: 12,
                    padding: 16,
                    marginTop: 16,
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: selectedReport.status === 'approved' ? C.success : C.error, margin: 0 }}>
                      {selectedReport.status === 'approved' ? '✓ Report Approved' : '✗ Report Rejected'}
                    </p>
                    {selectedReport.rejectionReason && (
                      <p style={{ fontSize: 12, color: C.textLight, margin: '8px 0 0' }}>
                        <strong>Rejection Reason:</strong> {selectedReport.rejectionReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Reports List View */
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            {reports.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: C.textLight }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <p>No reports found.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {['ID', 'Reporter', 'Reported User', 'Reason', 'Validity Score', 'Status', 'Action'].map((h) => (
                        <th key={h} style={{
                          textAlign: 'left',
                          padding: '16px 20px',
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: C.textLighter,
                          background: C.surfaceHigh,
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report, index) => (
                      <tr key={report.id} style={{
                        borderBottom: `1px solid ${C.border}`,
                        transition: 'background 0.2s',
                        animation: `fadeUp 0.3s ease ${index * 0.03}s both`,
                      }} onMouseEnter={e => e.currentTarget.style.background = C.glowLight} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '16px 20px', fontWeight: 500, color: C.text }}>#{report.id}</td>
                        <td style={{ padding: '16px 20px', color: C.textLight }}>{report.reporter?.email}</td>
                        <td style={{ padding: '16px 20px', color: C.textLight }}>{report.reportedUser?.email}</td>
                        <td style={{ padding: '16px 20px', color: C.textLight }}>{getReasonLabel(report.reason)}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 60, height: 6, background: C.surfaceHigh, borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${report.validityScore * 100}%`, height: '100%', background: C.primary, borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.primary }}>{(report.validityScore * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 100,
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            background: getStatusBadgeBg(report.status),
                            color: getStatusBadgeColor(report.status),
                            border: `1px solid ${getStatusBadgeColor(report.status)}33`,
                          }}>
                            {report.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <button
                            onClick={() => setSelectedReport(report)}
                            style={{
                              padding: '6px 14px',
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: 6,
                              border: `1px solid ${C.border}`,
                              background: 'transparent',
                              color: C.info,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.target.style.borderColor = C.info; e.target.style.background = C.infoBg; }}
                            onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;