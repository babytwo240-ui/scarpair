import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const BusinessDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Business Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/edit-profile')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ⚙️ Edit Profile
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Welcome, {user?.businessName}!</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h3>Post Waste Materials</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Create a new waste post to list your recyclable materials on the marketplace.
          </p>
          <button
            onClick={() => navigate('/waste-post/create')}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Create Waste Post
          </button>
        </div>

        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h3>View My Posts</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            View, edit, or manage your posted waste materials.
          </p>
          <button
            onClick={() => navigate('/business/posts')}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            View My Posts
          </button>
        </div>

        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h3>Collection Requests</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Manage collection requests from recyclers.
          </p>
          <button
            onClick={() => navigate('/collections')}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#ffc107',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            View Requests
          </button>
        </div>

        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h3>📋 New Requests (1-Hour Workflow)</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Approve collection requests with the new 1-hour pickup window.
          </p>
          <button
            onClick={() => navigate('/business/collection-requests')}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Manage New Requests
          </button>
        </div>

        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h3>Messages</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Communicate with recyclers about your materials.
          </p>
          <button
            onClick={() => navigate('/messages')}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Open Messages
          </button>
        </div>

        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h3>Notifications</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            View collection requests and system alerts.
          </p>
          <button
            onClick={() => navigate('/notifications')}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            View Notifications
          </button>
        </div>

        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h3>🎯 Pending Approvals</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Manage approved recyclers and their pickup windows.
          </p>
          <button
            onClick={() => navigate('/business/pending-approvals')}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            View Pending Approvals
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
