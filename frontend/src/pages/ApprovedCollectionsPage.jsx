import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import wastePostService from '../services/wastePostService';
import { formatManila, formatManilaInput } from '../utils/manilaTimeFormatter';

const ApprovedCollectionsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchApprovedCollections();
  }, [page]);

  const fetchApprovedCollections = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wastePostService.getMyApprovedCollections(page, 20);
      setCollections(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load approved collections');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPickedUp = async (postId) => {
    if (!window.confirm('Are you ready to mark this waste as picked up? This action cannot be undone.')) {
      return;
    }

    try {
      await wastePostService.markAsPickedUp(postId);
      alert('✅ Waste marked as picked up! Collection completed.');
      fetchApprovedCollections();
    } catch (err) {
      alert('❌ Error: ' + (err.message || 'Failed to mark as picked up'));
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return '#ff9800';
      case 'PICKED_UP':
        return '#4caf50';
      case 'COMPLETED':
        return '#2196f3';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Pending Pickup';
      case 'PICKED_UP':
        return 'Picked Up';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Please login to view your approved collections.</p>
        <button
          onClick={() => navigate('/recycler/login')}
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
      <h2>🎯 Your Approved Collections</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        View and manage your approved waste collections. You have 1 hour to pick up after approval.
      </p>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          padding: '15px',
          borderRadius: '4px',
          color: '#c33',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading collections...</p>
        </div>
      ) : collections.length === 0 ? (
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p>No approved collections at the moment.</p>
          <button
            onClick={() => navigate('/recycler/dashboard')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {collections.map((collection) => (
            <div
              key={collection.id}
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `2px solid ${getStatusColor(collection.collectionStatus)}`
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{collection.title}</h3>
                  <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                    {collection.wasteType} • {collection.quantity} {collection.unit}
                  </p>
                </div>
                <div style={{
                  backgroundColor: getStatusColor(collection.collectionStatus),
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {getStatusLabel(collection.collectionStatus)}
                </div>
              </div>

              {/* Details */}
              <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
                <p><strong>Business:</strong> {collection.business?.businessName}</p>
                <p><strong>Location:</strong> {collection.address}, {collection.city}</p>
                <p><strong>Condition:</strong> {collection.condition}</p>
                <p><strong>Description:</strong> {collection.description}</p>
                {collection.scheduledDate && (
                  <p><strong>Proposed Pickup:</strong> {formatManilaInput(collection.scheduledDate)}</p>
                )}
              </div>

              {/* Countdown Timer (if APPROVED) */}
              {collection.collectionStatus === 'APPROVED' && collection.pickupDeadline && (
                <div style={{
                  backgroundColor: '#fff3cd',
                  padding: '15px',
                  borderRadius: '4px',
                  marginBottom: '15px',
                  border: '1px solid #ffc107'
                }}>
                  <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#856404' }}>
                    ⏱️ Time remaining to pick up:
                  </p>
                  <CountdownTimer deadline={collection.pickupDeadline} />
                </div>
              )}

              {/* Pickup Confirmation */}
              {collection.collectionStatus === 'APPROVED' && (
                <button
                  onClick={() => handleMarkAsPickedUp(collection.id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  ✓ Confirm Pickup
                </button>
              )}

              {/* Completed/Picked Up State */}
              {(collection.collectionStatus === 'PICKED_UP' || collection.collectionStatus === 'COMPLETED') && collection.pickedUpAt && (
                <div style={{
                  backgroundColor: '#d4edda',
                  padding: '12px',
                  borderRadius: '4px',
                  color: '#155724',
                  textAlign: 'center'
                }}>
                  ✅ Picked up on {formatManila(collection.pickedUpAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
        <button
          onClick={() => navigate('/recycler/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Marketplace
        </button>
      </div>
    </div>
  );
};

/**
 * Countdown Timer Component
 */
function CountdownTimer({ deadline }) {
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
      fontSize: '24px',
      fontWeight: 'bold',
      color: timeLeft === 'EXPIRED' ? '#d32f2f' : '#ff6f00',
      fontFamily: 'monospace',
      letterSpacing: '2px'
    }}>
      {timeLeft}
    </div>
  );
}

export default ApprovedCollectionsPage;
