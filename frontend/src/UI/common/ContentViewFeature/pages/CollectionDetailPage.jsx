import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import collectionService from '../../../../services/collectionService';
import messageService from '../../../../services/messageService';
import FeedbackForm from '../../../../components/FeedbackForm';
import RatingDisplay from '../../../../components/RatingDisplay';
import { formatManila, formatManilaInput } from '../../../../utils/manilaTimeFormatter';

// Helper function to display datetime in Manila timezone (for server timestamps)
const formatLocalDateTime = (isoString) => {
  return formatManila(isoString);
};

// Helper function to display user-input datetime (scheduledDate, etc)
const formatScheduledDateTime = (isoString) => {
  return formatManilaInput(isoString);
};

const CollectionDetailPage = () => {
  const { collectionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCollectionDetails();
  }, [collectionId]);

  const loadCollectionDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await collectionService.getCollectionDetails(collectionId);
      const collectionData = response.data || response;
      setCollection(collectionData);
    } catch (err) {
      setError(err.message || 'Failed to load collection details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this collection request?')) {
      return;
    }

    try {
      setActionLoading(true);
      await collectionService.approveCollection(collectionId);
      setSuccess('✅ Collection approved!');
      setTimeout(() => {
        loadCollectionDetails();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to approve collection.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSchedule = () => {
    navigate(`/collection/schedule/${collectionId}`);
  };

  const handleConfirm = async () => {
    if (!window.confirm('Confirm that the collection has been completed?')) {
      return;
    }

    try {
      setActionLoading(true);
      await collectionService.confirmCollection(collectionId);
      setSuccess('✅ Collection confirmed!');
      setTimeout(() => {
        loadCollectionDetails();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to confirm collection.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptMaterials = async () => {
    if (!window.confirm('Accept materials? This will complete the collection.')) {
      return;
    }

    try {
      setActionLoading(true);
      await collectionService.acceptMaterials(collectionId);
      setSuccess('✅ Materials accepted! Collection completed.');
      setTimeout(() => {
        loadCollectionDetails();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to accept materials.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      if (!collection.post || !collection.business || !collection.recycler) {
        setError('Cannot start conversation: missing information');
        return;
      }

      const otherUserId = user.type === 'business' ? collection.recycler.id : collection.business.id;
      const response = await messageService.startConversation(otherUserId, collection.post.id);
      const conversationId = response.data?.id || response.id;

      if (conversationId) {
        navigate(`/messages/${conversationId}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to open conversation.');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this collection?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await collectionService.cancelCollection(collectionId);
      setSuccess('✅ Collection cancelled successfully.');
      setTimeout(() => {
        loadCollectionDetails();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to cancel collection.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#fff3cd';
      case 'approved':
        return '#d1ecf1';
      case 'scheduled':
        return '#cfe2ff';
      case 'completed':
        return '#d4edda';
      case 'confirmed':
        return '#90EE90';
      default:
        return '#f5f5f5';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'pending':
        return '#856404';
      case 'approved':
        return '#0c5460';
      case 'scheduled':
        return '#084298';
      case 'completed':
        return '#155724';
      case 'confirmed':
        return '#155724';
      default:
        return '#333';
    }
  };

  if (loading) {
    return <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading collection details...</div>;
  }

  if (!collection) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>Collection not found</h2>
        <button
          onClick={() => navigate('/collections')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Back to Collections
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <h1 style={{ margin: 0 }}>Collection #{collection.id}</h1>
        <div></div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '4px', color: '#c33', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#efe', padding: '15px', borderRadius: '4px', color: '#3c3', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Left: Main Information */}
        <div>
          {/* Status */}
          <div
            style={{
              backgroundColor: getStatusColor(collection.status),
              color: getStatusTextColor(collection.status),
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '16px',
              textTransform: 'uppercase',
            }}
          >
            Status: {collection.status}
          </div>

          {/* Material Details */}
          {collection.post && (
            <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>📦 Material Details</h3>
              <p style={{ margin: '8px 0' }}>
                <strong>Title:</strong> {collection.post.title}
              </p>
              <p style={{ margin: '8px 0' }}>
                <strong>Type:</strong> {collection.post.wasteType}
              </p>
              <p style={{ margin: '8px 0' }}>
                <strong>Quantity:</strong> {collection.post.quantity} {collection.post.unit}
              </p>
              <p style={{ margin: '8px 0' }}>
                <strong>Condition:</strong> {collection.post.condition}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>📅 Timeline</h3>
            <p style={{ margin: '8px 0', fontSize: '14px' }}>
              <strong>Requested:</strong> {formatLocalDateTime(collection.requestDate)}
            </p>
            {collection.scheduledDate && (
              <p style={{ margin: '8px 0', fontSize: '14px', color: '#28a745', fontWeight: 'bold' }}>
                ⏰ <strong>Proposed Pickup:</strong> {formatScheduledDateTime(collection.scheduledDate)}
              </p>
            )}
            {collection.completeDate && (
              <p style={{ margin: '8px 0', fontSize: '14px' }}>
                <strong>Confirmed:</strong> {formatLocalDateTime(collection.completeDate)}
              </p>
            )}
            {collection.createdAt && (
              <p style={{ margin: '8px 0', fontSize: '12px', color: '#666' }}>
                <strong>Created:</strong> {formatLocalDateTime(collection.createdAt)}
              </p>
            )}
          </div>
        </div>

        {/* Right: Party Information */}
        <div>
          {/* Recycler Info */}
          {collection.recycler && (
            <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #90caf9' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>♻️ Recycler Information</h3>
              <p style={{ margin: '8px 0' }}>
                <strong>Name:</strong> {collection.recycler.companyName || collection.recycler.businessName}
              </p>
              <p style={{ margin: '8px 0' }}>
                <strong>Email:</strong> {collection.recycler.email}
              </p>
              {collection.recycler.phone && (
                <p style={{ margin: '8px 0' }}>
                  <strong>Phone:</strong> {collection.recycler.phone}
                </p>
              )}
            </div>
          )}

          {/* Business Info */}
          {collection.business && (
            <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #add8e6' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>🏢 Business Information</h3>
              <p style={{ margin: '8px 0' }}>
                <strong>Name:</strong> {collection.business.businessName || collection.business.companyName}
              </p>
              <p style={{ margin: '8px 0' }}>
                <strong>Email:</strong> {collection.business.email}
              </p>
              {collection.business.phone && (
                <p style={{ margin: '8px 0' }}>
                  <strong>Phone:</strong> {collection.business.phone}
                </p>
              )}
            </div>
          )}

          {/* Collection Deadline */}
          {collection.pickupDeadline && (
            <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #ffc107' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>⏱️ Pickup Deadline</h3>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#856404' }}>
                {formatLocalDateTime(collection.pickupDeadline)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      {collection.notes && (
        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px', marginBottom: '30px' }}>
          <h3>📝 Notes</h3>
          <p style={{ color: '#333' }}>{collection.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '30px' }}>
        {/* Message Button - Always Available */}
        <button
          onClick={handleMessage}
          disabled={actionLoading}
          style={{
            padding: '12px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: actionLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: actionLoading ? 0.7 : 1,
          }}
        >
          💬 Message
        </button>

        {/* Business Actions */}
        {user.type === 'business' && collection.status === 'pending' && (
          <>
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              style={{
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: actionLoading ? 0.7 : 1,
              }}
            >
              ✅ Approve
            </button>
            <button
              onClick={handleSchedule}
              disabled={actionLoading}
              style={{
                padding: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: actionLoading ? 0.7 : 1,
              }}
            >
              📅 Schedule
            </button>
          </>
        )}

        {/* Scheduled Status - Confirm Button */}
        {collection.status === 'scheduled' && (
          <button
            onClick={handleConfirm}
            disabled={actionLoading}
            style={{
              padding: '12px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            ✓ Confirm Completion
          </button>
        )}

        {/* Completed Status - Accept Materials (Recycler Only) */}
        {collection.status === 'completed' && user.type === 'recycler' && (
          <button
            onClick={handleAcceptMaterials}
            disabled={actionLoading}
            style={{
              padding: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            🎯 Accept Materials
          </button>
        )}

        {/* Cancel Button - Recycler can cancel pending/approved/scheduled collections */}
        {user.type === 'recycler' && (collection.status === 'pending' || collection.status === 'approved' || collection.status === 'scheduled') && (
          <button
            onClick={handleCancel}
            disabled={actionLoading || (collection.cancellationCount >= 3)}
            title={collection.cancellationCount >= 3 ? 'You have used your 3 allowed cancellations for this post.' : ''}
            style={{
              padding: '12px',
              backgroundColor: collection.cancellationCount >= 3 ? '#ccc' : '#dc3545',
              color: collection.cancellationCount >= 3 ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (actionLoading || collection.cancellationCount >= 3) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            {collection.cancellationCount >= 3 ? '🔒 Cancel Locked' : '❌ Cancel Collection'}
          </button>
        )}
      </div>

      {/* Info Box */}
      <div style={{ backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '4px', border: '1px solid #b3d9ff' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#004085' }}>
          💡 <strong>Tip:</strong> Use the Message button to communicate with the other party about pickup details, questions, or issues.
        </p>
      </div>

      {/* Rating Display */}
      {collection && (
        <div style={{ marginTop: '30px' }}>
          <h3>Ratings & Feedback</h3>
          {collection.business && (
            <div style={{ marginBottom: '20px' }}>
              <h4>Business Rating</h4>
              <RatingDisplay userId={collection.business.id} type="user" />
            </div>
          )}
          {collection.recycler && (
            <div style={{ marginBottom: '20px' }}>
              <h4>Recycler Rating</h4>
              <RatingDisplay userId={collection.recycler.id} type="user" />
            </div>
          )}
        </div>
      )}

      {/* Feedback Form */}
      {collection && collection.status === 'confirmed' && (
        <div style={{ marginTop: '30px' }}>
          <h3>Submit Feedback</h3>
          <FeedbackForm 
            collectionId={collection.id}
            business={collection.business}
            recycler={collection.recycler}
            onSubmitSuccess={loadCollectionDetails}
          />
        </div>
      )}
    </div>
  );
};

export default CollectionDetailPage;

