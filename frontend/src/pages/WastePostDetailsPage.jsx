import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import wastePostService from '../services/wastePostService';
import messageService from '../services/messageService';
import RatingDisplay from '../components/RatingDisplay';
import FeedbackForm from '../components/FeedbackForm';

const WastePostDetailsPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    loadPostDetails();
  }, [postId]);

  const loadPostDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wastePostService.getWastePostById(postId);
      const postData = response.data || response;
      setPost(postData);
      
      // Load collection if post has collectionId
      if (postData.collectionId) {
        try {
          // Fetch collection details to get business and recycler info
          const collectionResponse = await fetch(`/api/collections/${postData.collectionId}`);
          if (collectionResponse.ok) {
            const collData = await collectionResponse.json();
            setCollection(collData.data || collData);
          }
        } catch (collErr) {
          // This is non-critical, continue without collection
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load waste post details');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageBusiness = async () => {
    if (!user) {
      navigate('/role-selection');
      return;
    }

    if (!post || !post.businessId) {
      setError('Business information not available');
      return;
    }

    try {
      setMessageLoading(true);
      // Start conversation with the business
      const response = await messageService.startConversation(post.businessId, post.id);
      const conversationId = response.data?.id || response.id;
      
      if (conversationId) {
        navigate(`/messages/${conversationId}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to open conversation with business');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleRequestCollection = () => {
    if (!user) {
      navigate('/role-selection');
      return;
    }
    navigate(`/collection/request/${postId}`);
  };

  if (loading) {
    return <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading post details...</div>;
  }

  if (!post) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>Post not found</h2>
        <button
          onClick={() => navigate('/recycler/dashboard')}
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
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        â† Back
      </button>

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '4px', color: '#c33', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Left: Images */}
        <div>
          {post.images && post.images.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <img
                src={post.images[0]}
                alt={post.title}
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  backgroundColor: '#f0f0f0',
                }}
              />
              {post.images.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px' }}>
                  {post.images.slice(1, 4).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${post.title} ${idx + 2}`}
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div>
          <h1 style={{ margin: '0 0 10px 0' }}>{post.title}</h1>
          {/* Status Badge */}
          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Posted by:</strong> {post.business?.businessName || 'Business'}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Posted on:</strong> {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Status:</strong> 
              <span style={{ 
                color: post.status === 'in-collection' ? '#ffc107' : post.status === 'collected' ? '#28a745' : '#007bff',
                fontWeight: 'bold',
                marginLeft: '8px'
              }}>
                {post.status === 'in-collection' 
                  ? 'ðŸ”„ IN COLLECTION' 
                  : post.status === 'collected'
                  ? 'âœ… COLLECTED'
                  : 'âœ¨ AVAILABLE'}
              </span>
            </p>
            {post.business && post.business.id && (
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Business Rating:</strong>
                </p>
                <RatingDisplay userId={post.business.id} type="user" variant="compact" />
              </div>
            )}
          </div>

          <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Details</h3>
          <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
            <p style={{ margin: '8px 0' }}><strong>Waste Type:</strong> {post.wasteType}</p>
            <p style={{ margin: '8px 0' }}><strong>Quantity:</strong> {post.quantity} {post.unit}</p>
            <p style={{ margin: '8px 0' }}><strong>Condition:</strong> {post.condition}</p>
            {post.price && <p style={{ margin: '8px 0' }}><strong>Price:</strong> ${post.price}</p>}
          </div>

          <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Location</h3>
          <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
            <p style={{ margin: '8px 0' }}><strong>Address:</strong> {post.address}</p>
            <p style={{ margin: '8px 0' }}><strong>City:</strong> {post.city}</p>
            <p style={{ margin: '8px 0' }}><strong>Coordinates:</strong> {post.latitude}, {post.longitude}</p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '30px' }}>
            <button
              onClick={handleMessageBusiness}
              disabled={messageLoading}
              style={{
                padding: '12px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: messageLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                opacity: messageLoading ? 0.7 : 1,
              }}
            >
              {messageLoading ? 'Opening...' : 'ðŸ’¬ Message Business'}
            </button>
            <button
              onClick={handleRequestCollection}
              disabled={post.status === 'in-collection' || post.status === 'collected'}
              title={post.status === 'in-collection' ? 'This material is already being collected by another recycler' : post.status === 'collected' ? 'This material has already been collected' : 'Request collection for this material'}
              style={{
                padding: '12px',
                backgroundColor: post.status === 'in-collection' || post.status === 'collected' ? '#ccc' : '#28a745',
                color: post.status === 'in-collection' || post.status === 'collected' ? '#666' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: post.status === 'in-collection' || post.status === 'collected' ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {post.status === 'in-collection' 
                ? 'ðŸ”„ In Collection' 
                : post.status === 'collected'
                ? 'âœ… Already Collected'
                : 'ðŸšš Request Collection'}
            </button>
          </div>
        </div>
      </div>

      {/* Full Description */}
      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
        <h3>Description</h3>
        <p style={{ color: '#333', lineHeight: '1.6' }}>{post.description}</p>
      </div>

      {/* Rating Display */}
      {post && (
        <div style={{ marginTop: '30px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h3>Post Rating</h3>
          <RatingDisplay postId={post.id} type="post" />
        </div>
      )}

      {/* Feedback Form */}
      {post && collection && (
        <div style={{ marginTop: '30px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h3>Submit Feedback</h3>
          <FeedbackForm 
            collectionId={collection.id}
            business={collection.business}
            recycler={collection.recycler}
            onSubmitSuccess={loadPostDetails}
          />
        </div>
      )}
      
      {post && !collection && post.collectionId && (
        <div style={{ marginTop: '30px', backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
          <p style={{ color: '#856404', margin: 0 }}>â„¹ï¸ Feedback form available after collection details are loaded.</p>
        </div>
      )}
    </div>
  );
};

export default WastePostDetailsPage;

