import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AdminUserDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm('Are you sure you want to delete this user and all their data? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      alert('User deleted successfully');
      navigate('/admin/users');
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  const handleVerifyUser = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users/${id}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified: !user.isVerified })
      });

      if (!response.ok) {
        throw new Error('Failed to update verification status');
      }

      alert('User verification status updated');
      fetchUserDetails();
    } catch (err) {
      alert('Failed to update verification status: ' + err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading user details...</div>;
  }

  if (!user) {
    return <div style={{ padding: '20px', color: 'red' }}>User not found</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/admin/users')} style={{ padding: '8px 12px', marginBottom: '20px' }}>â† Back to Users</button>

      <h1>User Details</h1>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '4px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Email:</label>
          <p>{user.email}</p>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Type:</label>
          <p>{user.type === 'business' ? 'Business Owner' : 'Recycler'}</p>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Name:</label>
          <p>{user.businessName || user.companyName || 'N/A'}</p>
        </div>

        {user.companyName && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Company Name:</label>
            <p>{user.companyName}</p>
          </div>
        )}

        {user.businessName && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Business Name:</label>
            <p>{user.businessName}</p>
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Phone:</label>
          <p>{user.phone}</p>
        </div>

        {user.specialization && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Specialization:</label>
            <p>{user.specialization}</p>
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Verified:</label>
          <p>{user.isVerified ? 'âœ“ Yes' : 'âœ— No'}</p>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Created At:</label>
          <p>{new Date(user.createdAt).toLocaleString()}</p>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Last Updated:</label>
          <p>{new Date(user.updatedAt).toLocaleString()}</p>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Active:</label>
          <p>{user.isActive ? 'âœ“ Yes' : 'âœ— No'}</p>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={handleVerifyUser} 
          style={{ padding: '10px 16px', marginRight: '10px', backgroundColor: '#28a745', color: 'white' }}
        >
          {user.isVerified ? 'Unverify User' : 'Verify User'}
        </button>

        <button 
          onClick={handleDeleteUser} 
          style={{ padding: '10px 16px', backgroundColor: '#dc3545', color: 'white' }}
        >
          Delete User
        </button>
      </div>
    </div>
  );
};

export default AdminUserDetailsPage;

