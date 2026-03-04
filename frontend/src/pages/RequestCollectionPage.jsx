import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import collectionService from '../services/collectionService';
import wastePostService from '../services/wastePostService';
import { convertBrowserLocalToManilaTime } from '../utils/datetimeLocalConverter';

const RequestCollectionPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await wastePostService.getWastePostById(postId);
      setPost(response);
    } catch (err) {
      setError(err.message || 'Failed to load waste post.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    // Not used - removed form fields
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate basic input
    if (!user) {
      setError('You must be logged in to request a collection.');
      return;
    }

    setSubmitting(true);

    try {
      // Convert datetime-local (browser's local time) to Manila time before sending to backend
      let manilaScheduledDate = scheduledDate;
      if (scheduledDate) {
        manilaScheduledDate = convertBrowserLocalToManilaTime(scheduledDate);
      }

      const response = await collectionService.requestCollection(parseInt(postId), manilaScheduledDate);
      
      // Check if this is a forced approval or if cancel is locked
      if (response.data?.forceApproved) {
        setSuccess('âœ… Collection request submitted and auto-approved! The business has already rejected similar requests.');
      } else if (response.data?.cancelLocked) {
        setSuccess('âš ï¸ Collection request submitted. Note: You have used 3 cancellations before. This request cannot be cancelled.');
      } else {
        setSuccess('Collection request submitted successfully! Redirecting...');
      }
      setTimeout(() => {
        navigate('/collections');
      }, 2000);
    } catch (err) {
      // Check for specific error codes
      if (err.cause?.code === 'MAX_REQUESTS_EXCEEDED') {
        setError('âŒ You have already requested this post 4 times. You cannot request it again.');
      } else {
        setError(err.message || 'Failed to submit collection request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading waste post details...</div>;
  }

  if (!post) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Waste post not found.</p>
      </div>
    );
  }

  if (!user || user.type !== 'recycler') {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Only recyclers can request collections. Please login as a recycler.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Request Collection</h2>

      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '4px',
          marginBottom: '20px',
        }}
      >
        <h3>{post.title}</h3>
        <p style={{ color: '#666' }}>{post.description}</p>

        <div style={{ fontSize: '14px', color: '#666', marginTop: '15px' }}>
          <p>
            <strong>Material Type:</strong> {post.wasteType}
          </p>
          <p>
            <strong>Condition:</strong> {post.condition}
          </p>
          <p>
            <strong>Quantity:</strong> {post.quantity} {post.unit}
          </p>
          {post.city && (
            <p>
              <strong>Location:</strong> {post.city}
            </p>
          )}
        </div>
      </div>

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

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Proposed Pickup Date & Time (Optional)
          </label>
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            ðŸ’¡ Suggest when you'd like to pick up these materials. The business owner can approve or adjust this.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Collection Request'}
        </button>
      </form>
    </div>
  );
};

export default RequestCollectionPage;

