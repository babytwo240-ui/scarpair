import React, { useState, useEffect } from 'react';
import reportService from '../services/reportService';
import '../styles/AdminPages.css';

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
    if (status === 'approved') return 'badge-success';
    if (status === 'rejected') return 'badge-danger';
    if (status === 'pending') return 'badge-warning';
    return 'badge-secondary';
  };

  if (loading) return <div className="admin-page">Loading reports...</div>;

  return (
    <div className="admin-page admin-reports">
      <h2>User Reports Management</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="view-tabs">
        <button
          onClick={() => setView('pending')}
          className={`tab ${view === 'pending' ? 'active' : ''}`}
        >
          Pending Reports ({reports.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setView('all')}
          className={`tab ${view === 'all' ? 'active' : ''}`}
        >
          All Reports ({reports.length})
        </button>
      </div>

      {selectedReport ? (
        <div className="report-detail">
          <button onClick={() => setSelectedReport(null)} className="btn btn-secondary">
            ← Back to List
          </button>

          <h3>Report #{selectedReport.id}</h3>

          <div className="report-info">
            <p><strong>Status:</strong> <span className={`badge ${getStatusBadgeColor(selectedReport.status)}`}>{selectedReport.status}</span></p>
            <p><strong>Reason:</strong> {getReasonLabel(selectedReport.reason)}</p>
            <p><strong>Reporter:</strong> {selectedReport.reporter?.email}</p>
            <p><strong>Reported User:</strong> {selectedReport.reportedUser?.email}</p>
            {selectedReport.collection && <p><strong>Collection ID:</strong> {selectedReport.collectionId}</p>}
            {selectedReport.post && <p><strong>Post ID:</strong> {selectedReport.postId}</p>}
            <p><strong>Validity Score:</strong> {(selectedReport.validityScore * 100).toFixed(1)}%</p>
            <p><strong>Submitted:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
            
            <div className="description-section">
              <h4>Description:</h4>
              <p>{selectedReport.description}</p>
            </div>

            {selectedReport.status === 'pending' ? (
              <div className="report-actions">
                <div className="action-group">
                  <button
                    onClick={() => handleApprove(selectedReport.id)}
                    disabled={actionInProgress}
                    className="btn btn-success"
                  >
                    {actionInProgress === selectedReport.id ? 'Approving...' : '✓ Approve Report'}
                  </button>
                </div>

                <div className="action-group">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (required)..."
                    rows={3}
                  />
                  <button
                    onClick={() => handleReject(selectedReport.id)}
                    disabled={actionInProgress || !rejectionReason.trim()}
                    className="btn btn-danger"
                  >
                    {actionInProgress === selectedReport.id ? 'Rejecting...' : '✗ Reject Report'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="report-result">
                <p>
                  <strong>Final Status:</strong> {selectedReport.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                </p>
                {selectedReport.approvedBy && (
                  <p><strong>Processed by:</strong> Admin (ID: {selectedReport.approvedBy})</p>
                )}
                {selectedReport.rejectionReason && (
                  <p><strong>Rejection Reason:</strong> {selectedReport.rejectionReason}</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="reports-list">
          {reports.length === 0 ? (
            <p>No reports found.</p>
          ) : (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reporter</th>
                  <th>Reported User</th>
                  <th>Reason</th>
                  <th>Validity Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>#{report.id}</td>
                    <td>{report.reporter?.email}</td>
                    <td>{report.reportedUser?.email}</td>
                    <td>{getReasonLabel(report.reason)}</td>
                    <td>
                      <div className="validity">
                        <div className="bar">
                          <div 
                            className="fill" 
                            style={{ width: `${report.validityScore * 100}%` }}
                          ></div>
                        </div>
                        <span>{(report.validityScore * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="btn btn-sm btn-info"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
