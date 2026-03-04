import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminPages.css';

const AdminUserManagementPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState(''); // 'business' or 'recycler'
  const [filterStatus, setFilterStatus] = useState(''); // 'active' or 'inactive'
  const [actionInProgress, setActionInProgress] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId, userName) => {
    if (!window.confirm(`Deactivate ${userName}? This will cancel all their active collections.`)) {
      return;
    }

    try {
      setActionInProgress(userId);
      const response = await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to deactivate user');
      }

      const data = await response.json();
      setSuccessMessage(`${userName} deactivated. ${data.data?.collectionsAffected || 0} collection(s) cancelled.`);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReactivate = async (userId, userName) => {
    if (!window.confirm(`Reactivate ${userName}?`)) {
      return;
    }

    try {
      setActionInProgress(userId);
      const response = await fetch(`/api/admin/users/${userId}/reactivate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reactivate user');
      }

      setSuccessMessage(`${userName} reactivated successfully.`);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filterType && user.type !== filterType) return false;
    if (filterStatus === 'active' && !user.isActive) return false;
    if (filterStatus === 'inactive' && user.isActive) return false;
    return true;
  });

  if (loading) return <div className="admin-page">Loading users...</div>;

  const activeCount = users.filter(u => u.isActive).length;
  const inactiveCount = users.filter(u => !u.isActive).length;
  const businessCount = users.filter(u => u.type === 'business').length;
  const recyclerCount = users.filter(u => u.type === 'recycler').length;

  return (
    <div className="admin-page admin-users">
      <h2>User Management</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total Users</p>
          <p className="stat-value">{users.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Active Users</p>
          <p className="stat-value">{activeCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Inactive Users</p>
          <p className="stat-value">{inactiveCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Businesses</p>
          <p className="stat-value">{businessCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Recyclers</p>
          <p className="stat-value">{recyclerCount}</p>
        </div>
      </div>

      <div className="filters-section">
        <h3>Filter Users</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="business">Business</option>
              <option value="recycler">Recycler</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button 
            onClick={() => {
              setFilterType('');
              setFilterStatus('');
            }}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="users-section">
        <h3>Users ({filteredUsers.length})</h3>

        {filteredUsers.length === 0 ? (
          <p>No users found matching the filters.</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Type</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge" style={{ 
                      backgroundColor: user.type === 'business' ? '#3498db' : '#2ecc71'
                    }}>
                      {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                    </span>
                  </td>
                  <td>{user.name || '-'}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span className={`badge ${user.isVerified ? 'badge-success' : 'badge-danger'}`}>
                      {user.isVerified ? '✓ Yes' : '✗ No'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user.isActive ? (
                      <button
                        onClick={() => handleDeactivate(user.id, user.email)}
                        disabled={actionInProgress === user.id}
                        className="btn btn-sm btn-danger"
                      >
                        {actionInProgress === user.id ? '...' : 'Deactivate'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(user.id, user.email)}
                        disabled={actionInProgress === user.id}
                        className="btn btn-sm btn-success"
                      >
                        {actionInProgress === user.id ? '...' : 'Reactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagementPage;
