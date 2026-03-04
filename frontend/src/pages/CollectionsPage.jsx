import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import collectionService from '../services/collectionService';
import { formatManila } from '../utils/manilaTimeFormatter';

// Helper function to display datetime in Manila timezone
const formatLocalDateTime = (isoString) => {
  return formatManila(isoString);
};

const CollectionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, completed

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let response;
      if (user?.type === 'business') {
        response = await collectionService.getAllCollections();
      } else {
        response = await collectionService.getUserCollections();
      }
      // Backend returns: { message, pagination, data: [...] }
      // Extract the data array from response
      const collectionsData = Array.isArray(response) ? response : (response.data || []);
      setCollections(collectionsData);
    } catch (err) {
      setError(err.message || 'Failed to load collections.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (collectionId) => {
    if (!window.confirm('Are you sure you want to approve this collection request?')) {
      return;
    }

    try {
      await collectionService.approveCollection(collectionId);
      loadCollections();
    } catch (err) {
      setError(err.message || 'Failed to approve collection.');
    }
  };

  const handleSchedule = (collectionId) => {
    navigate(`/collection/schedule/${collectionId}`);
  };

  const handleConfirmCollection = async (collectionId) => {
    if (!window.confirm('Confirm that the collection has been completed?')) {
      return;
    }

    try {
      await collectionService.confirmCollection(collectionId);
      setSuccess('Collection confirmed successfully!');
      setTimeout(() => {
        loadCollections();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to confirm collection.');
    }
  };

  const handleAcceptMaterials = async (collectionId) => {
    if (!window.confirm('Accept materials? This will complete the collection and close the chat.')) {
      return;
    }

    try {
      await collectionService.acceptMaterials(collectionId);
      setSuccess('Materials accepted! Collection completed.');
      setTimeout(() => {
        loadCollections();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to accept materials.');
    }
  };

  const handleCancelCollection = async (collectionId) => {
    if (!window.confirm('Are you sure you want to cancel this collection? The waste post will be returned to the marketplace.')) {
      return;
    }

    try {
      const result = await collectionService.cancelCollection(collectionId);
      setSuccess('Collection cancelled successfully!');
      setError('');
      
      // Force immediate reload without delay
      await loadCollections();
    } catch (err) {
      setError(err.message || 'Failed to cancel collection.');
      setSuccess('');
    }
  };

  const getFilteredCollections = () => {
    return collections.filter((c) => {
      if (activeTab === 'pending') return c.status === 'pending';
      if (activeTab === 'approved') return c.status === 'approved';
      if (activeTab === 'scheduled') return c.status === 'scheduled';
      if (activeTab === 'completed') return c.status === 'completed';
      if (activeTab === 'confirmed') return c.status === 'confirmed';
      if (activeTab === 'cancelled') return c.status === 'cancelled';
      if (activeTab === 'rejected') return c.status === 'rejected';
      return true;
    });
  };

  const filteredCollections = getFilteredCollections();

  if (loading) {
    return <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading collections...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Please login to view collections.</p>
      </div>
    );
  }

  // BUSINESS VIEW - Show redirect message instead of collections list
  if (user.type === 'business') {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2>Collections Management</h2>
        
        <div style={{
          backgroundColor: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '4px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#004085' }}>Your collection workflow is organized in two places:</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#004085' }}>1. New Requests (1-Hour Workflow)</h4>
            <p style={{ margin: '0 0 10px 0', color: '#004085', fontSize: '14px' }}>
              Review and approve new collection requests from recyclers. Once approved, recyclers have 1 hour to pick up.
            </p>
            <button
              onClick={() => navigate('/business/collection-requests')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Go to New Requests
            </button>
          </div>

          <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#004085' }}>2. Pending Recycler Approvals</h4>
            <p style={{ margin: '0 0 10px 0', color: '#004085', fontSize: '14px' }}>
              Manage recyclers you've approved. View their pickup status and cancel if needed.
            </p>
            <button
              onClick={() => navigate('/business/pending-approvals')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Go to Pending Approvals
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RECYCLER VIEW - Show full collections dashboard
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>My Collections</h2>

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '10px', borderRadius: '4px', color: '#c33', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#efe', padding: '10px', borderRadius: '4px', color: '#3c3', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      {/* Tabs for filtering */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', flexWrap: 'wrap' }}>
        {['pending', 'approved', 'scheduled', 'completed', 'confirmed', 'cancelled', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === tab ? '#007bff' : 'transparent',
              color: activeTab === tab ? 'white' : '#007bff',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #007bff' : 'none',
              textTransform: 'capitalize',
            }}
          >
            {tab} ({collections.filter((c) => c.status === tab).length})
          </button>
        ))}
      </div>

      {filteredCollections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <p>No {activeTab} collections found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {filteredCollections.map((collection) => (
            <div
              key={collection.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '15px',
                backgroundColor: 'white',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px 0' }}>
                    Collection #{collection.id}
                    {collection.transactionCode && (
                      <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                        ({collection.transactionCode})
                      </span>
                    )}
                  </h4>

                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                    <p style={{ margin: '3px 0' }}>
                      <strong>Status:</strong>{' '}
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          backgroundColor:
                            collection.status === 'confirmed'
                              ? '#90EE90'
                              : collection.status === 'completed'
                              ? '#d4edda'
                              : collection.status === 'scheduled'
                              ? '#cfe2ff'
                              : collection.status === 'approved'
                              ? '#d1ecf1'
                              : collection.status === 'cancelled'
                              ? '#f8d7da'
                              : '#fff3cd',
                          color:
                            collection.status === 'confirmed'
                              ? '#155724'
                              : collection.status === 'completed'
                              ? '#155724'
                              : collection.status === 'scheduled'
                              ? '#084298'
                              : collection.status === 'approved'
                              ? '#0c5460'
                              : collection.status === 'cancelled'
                              ? '#721c24'
                              : '#856404',
                        }}
                      >
                        {collection.status}
                      </span>
                    </p>

                    {collection.post && (
                      <>
                        <p style={{ margin: '3px 0' }}>
                          <strong>Material:</strong> {collection.post.title}
                        </p>
                        <p style={{ margin: '3px 0' }}>
                          <strong>Quantity:</strong> {collection.post.quantity} {collection.post.unit}
                        </p>
                      </>
                    )}

                    {collection.recycler && (
                      <p style={{ margin: '3px 0' }}>
                        <strong>Recycler:</strong> {collection.recycler.businessName || collection.recycler.companyName}
                      </p>
                    )}

                    {collection.business && (
                      <p style={{ margin: '3px 0' }}>
                        <strong>Business:</strong> {collection.business.businessName || collection.business.companyName}
                      </p>
                    )}

                    {collection.scheduledDate && (
                      <p style={{ margin: '3px 0' }}>
                        <strong>Scheduled:</strong> {formatLocalDateTime(collection.scheduledDate)}
                      </p>
                    )}

                    {collection.notes && (
                      <p style={{ margin: '3px 0' }}>
                        <strong>Notes:</strong> {collection.notes}
                      </p>
                    )}

                    {user.type === 'recycler' && collection.cancellationCount && collection.cancellationCount > 0 && (
                      <p style={{ margin: '3px 0', color: '#dc3545' }}>
                        <strong>âš ï¸ Cancellations Used:</strong> {collection.cancellationCount}/3
                      </p>
                    )}

                    {collection.status === 'cancelled' && collection.cancellationReason && (
                      <p style={{ margin: '3px 0', backgroundColor: '#f8d7da', padding: '6px', borderRadius: '3px' }}>
                        <strong>Cancellation Reason:</strong> {collection.cancellationReason.replace(/_/g, ' ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => navigate(`/collection/${collection.id}`)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ðŸ“‹ View Details
                  </button>

                  {user.type === 'business' && collection.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(collection.id)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleSchedule(collection.id)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Set Schedule
                      </button>
                    </>
                  )}

                  {collection.status === 'scheduled' && (user.type === 'business' || user.type === 'recycler') && (
                    <button
                      onClick={() => handleConfirmCollection(collection.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Confirm Completion
                    </button>
                  )}

                  {collection.status === 'completed' && user.type === 'recycler' && (
                    <button
                      onClick={() => handleAcceptMaterials(collection.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Accept Materials
                    </button>
                  )}

                  {(collection.status === 'approved' || collection.status === 'scheduled') && (user.type === 'business' || user.type === 'recycler') && (
                    <button
                      onClick={() => handleCancelCollection(collection.id)}
                      disabled={user.type === 'recycler' && collection.cancellationCount >= 3}
                      title={user.type === 'recycler' && collection.cancellationCount >= 3 ? 'You\'ve used 3 cancellations. Must comply with pickup.' : ''}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: user.type === 'recycler' && collection.cancellationCount >= 3 ? '#ccc' : '#dc3545',
                        color: user.type === 'recycler' && collection.cancellationCount >= 3 ? '#999' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: user.type === 'recycler' && collection.cancellationCount >= 3 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      {user.type === 'recycler' && collection.cancellationCount >= 3 ? 'Cancel Locked' : 'Cancel Collection'}
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/collection/${collection.id}`)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;

