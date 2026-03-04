import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import wastePostService from '../services/wastePostService';

const MyPostsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      // Get user's own waste posts (all statuses)
      const response = await wastePostService.getUserWastePosts(1, 100);
      setPosts(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setDeletingId(postId);
    try {
      await wastePostService.deleteWastePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete post.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (postId) => {
    navigate(`/waste-post/edit/${postId}`);
  };

  const handleActivate = async (postId) => {
    setError('Post activation is not available - posts are automatically created as active.');
  };

  const handleViewDetails = (postId) => {
    navigate(`/waste-post/${postId}`);
  };

  if (!user) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Please login to view your posts.</p>
        <Link to="/role-selection" style={{ color: '#007bff' }}>Go to Login</Link>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading your posts...</div>;
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>My Waste Posts</h2>
        <Link
          to="/waste-post/create"
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          + Create New Post
        </Link>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '10px', borderRadius: '4px', color: '#c33', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <p>You haven't created any waste posts yet.</p>
          <Link
            to="/waste-post/create"
            style={{
              display: 'inline-block',
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '15px',
                backgroundColor: 'white',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '15px',
                alignItems: 'start',
              }}
            >
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
              )}

              <div>
                <h4 style={{ margin: '0 0 10px 0' }}>{post.title}</h4>
                <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                  {post.description.substring(0, 100)}...
                </p>

                <div style={{ fontSize: '13px', color: '#666', margin: '10px 0' }}>
                  <p style={{ margin: '3px 0' }}>
                    <strong>Type:</strong> {post.wasteType} | <strong>Condition:</strong> {post.condition}
                  </p>
                  <p style={{ margin: '3px 0' }}>
                    <strong>Quantity:</strong> {post.quantity} {post.unit}
                  </p>
                  <p style={{ margin: '3px 0' }}>
                    <strong>Status:</strong>{' '}
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: post.status === 'active' ? '#d4edda' : '#fff3cd',
                      color: post.status === 'active' ? '#155724' : '#856404',
                    }}>
                      {post.status || 'inactive'}
                    </span>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleViewDetails(post.id)}
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
                  View
                </button>

                <button
                  onClick={() => handleEdit(post.id)}
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
                  Edit
                </button>

                {post.status !== 'active' && (
                  <button
                    onClick={() => handleActivate(post.id)}
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
                    Activate
                  </button>
                )}

                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deletingId === post.id}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: deletingId === post.id ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    opacity: deletingId === post.id ? 0.6 : 1,
                  }}
                >
                  {deletingId === post.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPostsPage;
