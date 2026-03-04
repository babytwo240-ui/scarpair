import React, { useState, useEffect } from 'react';
import ratingService from '../services/ratingService';
import '../styles/AdminPages.css';

const AdminRatingsPage = () => {
  const [userRatings, setUserRatings] = useState([]);
  const [postRatings, setPostRatings] = useState([]);
  const [view, setView] = useState('users'); // 'users' or 'posts'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('rating-low'); // 'rating-low', 'rating-high', 'feedback-count'

  useEffect(() => {
    if (view === 'users') {
      fetchUserRatings();
    } else {
      fetchPostRatings();
    }
  }, [view, sortBy]);

  const fetchUserRatings = async () => {
    try {
      setLoading(true);
      setError('');
      const ratings = (await ratingService.getAllUserRatings(1, 100) || []).sort((a, b) => {
        if (sortBy === 'rating-low') return a.averageRating - b.averageRating;
        if (sortBy === 'rating-high') return b.averageRating - a.averageRating;
        if (sortBy === 'feedback-count') return b.totalFeedback - a.totalFeedback;
        return 0;
      });
      setUserRatings(ratings);
    } catch (err) {
      setError(err.message || 'Failed to fetch user ratings');
    } finally {
      setLoading(false);
    }
  };

  const fetchPostRatings = async () => {
    try {
      setLoading(true);
      setError('');
      const ratings = (await ratingService.getAllPostRatings(1, 100) || []).sort((a, b) => {
        if (sortBy === 'rating-low') return a.averageRating - b.averageRating;
        if (sortBy === 'rating-high') return b.averageRating - a.averageRating;
        if (sortBy === 'feedback-count') return b.totalFeedback - a.totalFeedback;
        return 0;
      });
      setPostRatings(ratings);
    } catch (err) {
      setError(err.message || 'Failed to fetch post ratings');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`star ${i < Math.floor(rating) ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  const getRatingCategory = (rating) => {
    if (rating < 2) return 'Poor';
    if (rating < 3) return 'Fair';
    if (rating < 4) return 'Good';
    if (rating < 4.5) return 'Very Good';
    return 'Excellent';
  };

  if (loading) return <div className="admin-page">Loading ratings...</div>;

  const ratings = view === 'users' ? userRatings : postRatings;
  const avgRating = ratings.length > 0 
    ? (ratings.reduce((sum, r) => sum + r.averageRating, 0) / ratings.length).toFixed(2)
    : 0;
  const totalFeedback = ratings.reduce((sum, r) => sum + r.totalFeedback, 0);

  return (
    <div className="admin-page admin-ratings">
      <h2>Ratings Management</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total {view === 'users' ? 'Rated Users' : 'Rated Posts'}</p>
          <p className="stat-value">{ratings.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Average Rating</p>
          <p className="stat-value">{avgRating} ★</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Feedback</p>
          <p className="stat-value">{totalFeedback}</p>
        </div>
      </div>

      <div className="view-tabs">
        <button
          onClick={() => setView('users')}
          className={`tab ${view === 'users' ? 'active' : ''}`}
        >
          User Ratings ({userRatings.length})
        </button>
        <button
          onClick={() => setView('posts')}
          className={`tab ${view === 'posts' ? 'active' : ''}`}
        >
          Post Ratings ({postRatings.length})
        </button>
      </div>

      <div className="sort-section">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="rating-low">Lowest Rating</option>
          <option value="rating-high">Highest Rating</option>
          <option value="feedback-count">Most Feedback</option>
        </select>
      </div>

      <div className="ratings-list">
        {ratings.length === 0 ? (
          <p>No ratings found.</p>
        ) : (
          <div className="ratings-grid">
            {ratings.map((rating) => (
              <div key={rating.id || rating.userId || rating.postId} className="rating-card">
                <div className="rating-header">
                  {view === 'users' ? (
                    <>
                      <h4>User #{rating.userId}</h4>
                      <p className="rating-type">User Rating</p>
                    </>
                  ) : (
                    <>
                      <h4>Post #{rating.postId}</h4>
                      <p className="rating-type">Post Rating</p>
                    </>
                  )}
                </div>

                <div className="rating-display-main">
                  <div className="stars">
                    {renderStars(rating.averageRating)}
                  </div>
                  <p className="rating-value">{rating.averageRating.toFixed(2)}</p>
                  <p className="rating-category">{getRatingCategory(rating.averageRating)}</p>
                </div>

                <div className="rating-stats">
                  <p>
                    <strong>Total Ratings:</strong> {rating.totalRatings}
                  </p>
                  <p>
                    <strong>Total Feedback:</strong> {rating.totalFeedback}
                  </p>
                </div>

                {rating.averageRating < 3 && (
                  <div className="warning-badge">
                    ⚠️ Low Rating - Monitor for issues
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rating-guide">
        <h3>Rating Scale</h3>
        <ul>
          <li>⭐ 4.5-5.0: Excellent - High quality, reliable</li>
          <li>⭐ 4.0-4.4: Very Good - Good experience</li>
          <li>⭐ 3.0-3.9: Good - Acceptable, some room for improvement</li>
          <li>⭐ 2.0-2.9: Fair - Below expectations</li>
          <li>⭐ 0.0-1.9: Poor - Significantly below expectations</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminRatingsPage;
