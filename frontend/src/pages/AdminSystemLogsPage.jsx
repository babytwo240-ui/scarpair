import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminPages.css';

const AdminSystemLogsPage = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    status: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.action && { action: filters.action }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.status && { status: filters.status })
      });

      const response = await fetch(`/api/admin/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch logs');

      const data = await response.json();
      setLogs(data.data || []);
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        pages: data.pagination.pages
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('LOGIN')) return 'badge-info';
    if (action.includes('CREATED')) return 'badge-success';
    if (action.includes('DELETED') || action.includes('DEACTIVATE')) return 'badge-danger';
    if (action.includes('UPDATED')) return 'badge-warning';
    return 'badge-secondary';
  };

  if (loading && logs.length === 0) return <div className="admin-page">Loading logs...</div>;

  return (
    <div className="admin-page admin-logs">
      <h2>System Activity Logs</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters-section">
        <h3>Filter Logs</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Action Type</label>
            <input
              type="text"
              value={filters.action}
              onChange={(e) => {
                setFilters({ ...filters, action: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
              placeholder="e.g., USER_LOGIN, WASTE_POST_CREATED"
            />
          </div>

          <div className="filter-group">
            <label>User ID</label>
            <input
              type="number"
              value={filters.userId}
              onChange={(e) => {
                setFilters({ ...filters, userId: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
              placeholder="Filter by user ID"
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <button 
            onClick={() => {
              setFilters({ action: '', userId: '', status: '' });
              setPagination({ ...pagination, page: 1 });
            }}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="logs-section">
        <h3>Activity Logs (Total: {pagination.total})</h3>
        
        {logs.length === 0 ? (
          <p>No logs found matching the filters.</p>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Target</th>
                <th>IP Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDate(log.timestamp)}</td>
                  <td>
                    {log.user ? (
                      <span>{log.user.email} ({log.user.type})</span>
                    ) : (
                      <span className="text-muted">System</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    {log.target} {log.targetId && `#${log.targetId}`}
                  </td>
                  <td>{log.ipAddress || 'N/A'}</td>
                  <td>
                    <span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="pagination">
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemLogsPage;
