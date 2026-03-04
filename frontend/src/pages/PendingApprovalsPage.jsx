import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import wastePostService from '../services/wastePostService';
import { formatManila } from '../utils/manilaTimeFormatter';

const PendingApprovalsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [canceling, setCanceling] = useState(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, [page]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch all user's waste posts and filter by approved status
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
      alert('✅ Approval cancelled! Post returned to marketplace.');
      fetchPendingApprovals();
    } catch (err) {
      alert('❌ Error: ' + (err.message || 'Failed to cancel approval'));
    } finally {
      setCanceling(null);
    }
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineTime = new Date(deadline);
    const diff = deadlineTime - now;

    if (diff <= 0) {
      return 'EXPIRED';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const getWarningStatus = (deadline) => {
    const now = new Date();
    const deadlineTime = new Date(deadline);
    const diff = deadlineTime - now;

    if (diff <= 0) {
      return 'expired';
    }
    if (diff <= 5 * 60 * 1000) {
      // Less than 5 minutes
      return 'warning';
    }
    return 'ok';
  };

  if (!user) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Please login to view pending approvals.</p>
        <button
          onClick={() => navigate('/business/login')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>📋 Pending Recycler Approvals</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Manage recyclers you've approved for collection. Recyclers have 1 hour to pick up from the time of approval.
      </p>

      {error && (
        <div
          style={{
            backgroundColor: '#fee',
            padding: '15px',
            borderRadius: '4px',
            color: '#c33',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading pending approvals...</p>
        </div>
      ) : approvals.length === 0 ? (
        <div
          style={{
            backgroundColor: '#f9f9f9',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <p>No pending approvals at the moment.</p>
          <button
            onClick={() => navigate('/business/posts')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            View My Posts
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {approvals.map((approval) => {
            const warningStatus = getWarningStatus(approval.pickupDeadline);
            const borderColor =
              warningStatus === 'expired'
                ? '#d32f2f'
                : warningStatus === 'warning'
                ? '#ff9800'
                : '#ffc107';

            return (
              <div
                key={approval.id}
                style={{
                  backgroundColor: '#fff',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: `3px solid ${borderColor}`,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '15px',
                  }}
                >
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{approval.title}</h3>
                    <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                      {approval.wasteType} • {approval.quantity} {approval.unit}
                    </p>
                  </div>
                  <div
                    style={{
                      backgroundColor:
                        warningStatus === 'expired'
                          ? '#d32f2f'
                          : warningStatus === 'warning'
                          ? '#ff9800'
                          : '#ffc107',
                      color: warningStatus === 'warning' || warningStatus === 'expired' ? 'white' : '#333',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}
                  >
                    {warningStatus === 'expired'
                      ? '🚨 EXPIRED'
                      : warningStatus === 'warning'
                      ? '⚠️ URGENT'
                      : '📍 ACTIVE'}
                  </div>
                </div>

                {/* Recycler Information */}
                <div
                  style={{
                    backgroundColor: '#e3f2fd',
                    padding: '15px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    border: '1px solid #bbdefb',
                  }}
                >
                  <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                    👤 Approved Recycler:
                  </p>
                  <p style={{ margin: 0 }}>
                    {approval.approvedRecycler?.name || 'Unknown Recycler'} •{' '}
                    {approval.approvedRecycler?.email}
                  </p>
                </div>

                {/* Pickup Deadline Countdown */}
                {approval.pickupDeadline && (
                  <div
                    style={{
                      backgroundColor:
                        warningStatus === 'expired'
                          ? '#ffebee'
                          : warningStatus === 'warning'
                          ? '#fff3e0'
                          : '#fffde7',
                      padding: '15px',
                      borderRadius: '4px',
                      marginBottom: '15px',
                      border:
                        warningStatus === 'expired'
                          ? '1px solid #ef5350'
                          : warningStatus === 'warning'
                          ? '1px solid #ffb74d'
                          : '1px solid #fbc02d',
                    }}
                  >
                    <p
                      style={{
                        margin: '0 0 10px 0',
                        fontWeight: 'bold',
                        color:
                          warningStatus === 'expired'
                            ? '#d32f2f'
                            : warningStatus === 'warning'
                            ? '#e65100'
                            : '#f57f17',
                      }}
                    >
                      ⏱️ Time Remaining for Pickup:
                    </p>
                    <CountdownTimer
                      deadline={approval.pickupDeadline}
                      warningStatus={warningStatus}
                    />
                  </div>
                )}

                {/* Pickup Status */}
                {approval.pickedUpAt && (
                  <div
                    style={{
                      backgroundColor: '#d4edda',
                      padding: '12px',
                      borderRadius: '4px',
                      marginBottom: '15px',
                      color: '#155724',
                      textAlign: 'center',
                    }}
                  >
                    ✅ Picked up on {formatManila(approval.pickedUpAt)}
                  </div>
                )}

                {/* Post Details */}
                <div
                  style={{
                    backgroundColor: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                  }}
                >
                  <p>
                    <strong>Condition:</strong> {approval.condition}
                  </p>
                  <p>
                    <strong>Location:</strong> {approval.address}, {approval.city}
                  </p>
                  <p>
                    <strong>Description:</strong> {approval.description}
                  </p>
                </div>

                {/* Actions */}
                {approval.collectionStatus === 'APPROVED' && !approval.pickedUpAt && (
                  <button
                    onClick={() => handleCancelApproval(approval.id)}
                    disabled={canceling === approval.id}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: canceling === approval.id ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      opacity: canceling === approval.id ? 0.7 : 1,
                    }}
                  >
                    {canceling === approval.id ? '⏳ Cancelling...' : '❌ Cancel Approval'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Button */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
        <button
          onClick={() => navigate('/business/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Dashboard
        </button>
      </div>
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
        setTimeLeft('🚨 EXPIRED');
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
    <div
      style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color:
          warningStatus === 'expired'
            ? '#d32f2f'
            : warningStatus === 'warning'
            ? '#e65100'
            : '#f57f17',
        fontFamily: 'monospace',
        letterSpacing: '2px',
      }}
    >
      {timeLeft}
    </div>
  );
}

export default PendingApprovalsPage;
