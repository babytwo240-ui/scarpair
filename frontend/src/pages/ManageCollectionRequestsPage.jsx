import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import collectionService from '../services/collectionService';
import wastePostService from '../services/wastePostService';
import { formatManila, formatManilaInput } from '../utils/manilaTimeFormatter';

const ManageCollectionRequestsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    fetchCollectionRequests();
  }, []);

  const fetchCollectionRequests = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      console.log('Fetching collection requests...');
      const response = await collectionService.getAllCollections();
      console.log('Collection requests fetched:', response);
      const collectionsData = Array.isArray(response) ? response : (response.data || response);
      // Filter for pending requests only
      const pendingCollections = collectionsData.filter(
        (c) => c.status === 'PENDING' || c.status === 'pending'
      );
      setCollections(pendingCollections);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError('❌ Error fetching user collections: ' + (err.message || 'Unknown error'));
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithNewWorkflow = async (collectionId, collection) => {
    if (!window.confirm('Approve this collection request? The post will enter the new 1-hour pickup workflow.')) {
      return;
    }

    try {
      setApproving(collectionId);

      // Step 1: Approve the recycler using the new workflow
      if (collection.postId && collection.recyclerId) {
        await wastePostService.approveRecycler(collection.postId, collection.recyclerId);
      }

      // Step 2: Also approve the collection record if the backend supports it
      try {
        await collectionService.approveCollection(collectionId);
      } catch (collErr) {
        console.log('Note: Old collection approval may not be needed with new workflow');
      }

      setSuccess('✅ Collection approved! Recycler has 1 hour to pick up.');
      setTimeout(() => {
        fetchCollectionRequests();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError('❌ Error: ' + (err.message || 'Failed to approve collection'));
    } finally {
      setApproving(null);
    }
  };

  const handleRejectRequest = async (collectionId, rejectionCount) => {
    // Check if rejection limit reached
    if (rejectionCount >= 4) {
      setError('⚠️ You have already rejected this recycler 4 times. The next request will be auto-approved. You must continue or choose another recycler.');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this collection request?')) {
      return;
    }

    try {
      setApproving(collectionId);
      // Call the reject API to update status in database
      await collectionService.rejectCollection(collectionId);
      setSuccess('✅ Collection request rejected');
      setTimeout(() => {
        fetchCollectionRequests();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError('❌ Error: ' + (err.message || 'Failed to reject request'));
    } finally {
      setApproving(null);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Please login to manage collection requests.</p>
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

  if (user.type !== 'business') {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Only business owners can manage collection requests.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>📬 Collection Requests</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Review and approve collection requests from recyclers. Approved recyclers will have 1 hour to pick up materials.
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

      {success && (
        <div
          style={{
            backgroundColor: '#efe',
            padding: '15px',
            borderRadius: '4px',
            color: '#3c3',
            marginBottom: '20px',
          }}
        >
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading collection requests...</p>
        </div>
      ) : collections.length === 0 ? (
        <div
          style={{
            backgroundColor: '#f9f9f9',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <p>📭 No pending collection requests at the moment.</p>
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
          {collections.map((collection) => (
            <div
              key={collection.id}
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '2px solid #ffc107',
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
                  <h3 style={{ margin: '0 0 5px 0' }}>
                    {collection.postTitle || collection.post?.title || 'Waste Post'}
                  </h3>
                  <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                    Transaction Code: {collection.transactionCode || `Collection #${collection.id}`}
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: '#ffc107',
                    color: '#333',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {collection.status || 'PENDING'}
                </div>
              </div>

              {/* Recycler Information */}
              <div
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '4px',
                  marginBottom: '15px',
                }}
              >
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                  👤 Recycler Information:
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Name:</strong> {collection.recyclerName || collection.recycler?.name || 'Unknown'}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Email:</strong> {collection.recyclerEmail || collection.recycler?.email || 'N/A'}
                </p>
                {(collection.recyclerPhone || collection.recycler?.phone) && (
                  <p style={{ margin: '5px 0' }}>
                    <strong>Phone:</strong> {collection.recyclerPhone || collection.recycler?.phone}
                  </p>
                )}
              </div>

              {/* Post Details */}
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
                  📦 Material Details:
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Type:</strong> {collection.postWasteType || collection.post?.wasteType || 'N/A'}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Quantity:</strong> {collection.postQuantity || collection.post?.quantity || 'N/A'} {collection.postUnit || collection.post?.unit || ''}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Condition:</strong> {collection.postCondition || collection.post?.condition || 'N/A'}
                </p>
              </div>

              {/* Request Date */}
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                <p style={{ margin: '5px 0' }}>
                  📅 Requested on: {collection.requestDate ? formatManila(collection.requestDate) : 'N/A'}
                </p>
                {collection.scheduledDate && (
                  <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#28a745' }}>
                    ⏰ Proposed Pickup: {formatManilaInput(collection.scheduledDate)}
                  </p>
                )}
                {collection.rejectionCount !== undefined && (
                  <p style={{ 
                    margin: '8px 0 0 0', 
                    fontWeight: 'bold',
                    color: collection.rejectionCount >= 4 ? '#dc3545' : '#ffc107'
                  }}>
                    ⚠️ Rejection Count: {collection.rejectionCount}/4
                    {collection.rejectionCount >= 4 && ' - NEXT REQUEST WILL BE AUTO-APPROVED'}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => handleApproveWithNewWorkflow(collection.id, collection)}
                  disabled={approving === collection.id}
                  style={{
                    padding: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: approving === collection.id ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    opacity: approving === collection.id ? 0.7 : 1,
                  }}
                >
                  {approving === collection.id ? '⏳ Approving...' : '✅ Approve (1-Hour Pickup)'}
                </button>

                <button
                  onClick={() => handleRejectRequest(collection.id, collection.rejectionCount || 0)}
                  disabled={approving === collection.id || (collection.rejectionCount !== undefined && collection.rejectionCount >= 4)}
                  title={collection.rejectionCount >= 4 ? 'You have already rejected this recycler 4 times. Next request will be auto-approved.' : ''}
                  style={{
                    padding: '12px',
                    backgroundColor: (collection.rejectionCount !== undefined && collection.rejectionCount >= 4) ? '#ccc' : '#dc3545',
                    color: (collection.rejectionCount !== undefined && collection.rejectionCount >= 4) ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: (approving === collection.id || (collection.rejectionCount !== undefined && collection.rejectionCount >= 4)) ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    opacity: approving === collection.id ? 0.7 : 1,
                  }}
                >
                  {collection.rejectionCount >= 4 ? '🔒 Reject Locked' : '❌ Reject Request'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
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
        <button
          onClick={() => navigate('/business/pending-approvals')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          View Approved Collections
        </button>
      </div>
    </div>
  );
};

export default ManageCollectionRequestsPage;
