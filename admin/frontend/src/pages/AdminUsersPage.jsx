import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    verified: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [filters, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const queryParams = new URLSearchParams({
        type: filters.type || '',
        verified: filters.verified || '',
        search: filters.search || '',
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their data? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      alert('User deleted successfully');
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  const handleVerifyUser = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5498/api'}/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update verification status');
      }

      alert('User verification status updated');
      fetchUsers();
    } catch (err) {
      alert('Failed to update verification status: ' + err.message);
    }
  };

  if (loading && users.length === 0) {
    return <div style={{ padding: '20px' }}>Loading users...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Users Management</h1>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          name="search"
          placeholder="Search by email or name..."
          value={filters.search}
          onChange={handleFilterChange}
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />

        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          style={{ padding: '8px', marginRight: '10px' }}
        >
          <option value="">All Types</option>
          <option value="business">Business</option>
          <option value="recycler">Recycler</option>
        </select>

        <select
          name="verified"
          value={filters.verified}
          onChange={handleFilterChange}
          style={{ padding: '8px', marginRight: '10px' }}
        >
          <option value="">All Verification Status</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>

        <button onClick={() => { setFilters({ type: '', verified: '', search: '' }); setPage(1); }} style={{ padding: '8px 12px' }}>Reset Filters</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Phone</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Verified</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Created</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{user.email}</td>
              <td style={{ padding: '10px' }}>{user.type}</td>
              <td style={{ padding: '10px' }}>{user.name}</td>
              <td style={{ padding: '10px' }}>{user.phone}</td>
              <td style={{ padding: '10px' }}>{user.isVerified ? 'âœ“ Yes' : 'âœ— No'}</td>
              <td style={{ padding: '10px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => navigate(`/admin/users/${user.id}`)} style={{ padding: '4px 8px', marginRight: '5px' }}>View</button>
                <button onClick={() => handleVerifyUser(user.id, user.isVerified)} style={{ padding: '4px 8px', marginRight: '5px' }}>{user.isVerified ? 'Unverify' : 'Verify'}</button>
                <button onClick={() => handleDeleteUser(user.id)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && !loading && (
        <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>No users found</p>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: '8px 12px', marginRight: '10px' }}>Previous</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)} disabled={users.length < limit} style={{ padding: '8px 12px', marginLeft: '10px' }}>Next</button>
      </div>
    </div>
  );
};

export default AdminUsersPage;

