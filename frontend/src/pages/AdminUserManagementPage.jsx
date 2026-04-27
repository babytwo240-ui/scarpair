import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminPages.css';

/* ─── Color tokens – 70% White / 30% Green Palette ────────────────── */
const C = {
  // Primary green (30%)
  primary: '#2e7d32',
  primaryDark: '#1b5e20',
  primaryLight: '#4caf50',
  // Backgrounds (70% white/light tones)
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceHigh: '#f1f5f9',
  // Text
  text: '#0f172a',
  textLight: '#475569',
  textLighter: '#94a3b8',
  // Borders
  border: 'rgba(0,0,0,0.08)',
  borderHover: 'rgba(46,125,50,0.25)',
  // Status colors
  success: '#2e7d32',
  successBg: 'rgba(46,125,50,0.08)',
  error: '#dc2626',
  errorBg: 'rgba(220,38,38,0.08)',
  warning: '#d97706',
  warningBg: 'rgba(217,119,6,0.08)',
  info: '#2563eb',
  infoBg: 'rgba(37,99,235,0.08)',
  // Type colors
  business: '#2563eb',
  businessBg: 'rgba(37,99,235,0.08)',
  recycler: '#2e7d32',
  recyclerBg: 'rgba(46,125,50,0.08)',
  // Glows
  glowLight: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

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

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.primary, animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 14, color: C.textLight }}>Loading users...</div>
      </div>
    </div>
  );

  const activeCount = users.filter(u => u.isActive).length;
  const inactiveCount = users.filter(u => !u.isActive).length;
  const businessCount = users.filter(u => u.type === 'business').length;
  const recyclerCount = users.filter(u => u.type === 'recycler').length;

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      fontFamily: "'Outfit', sans-serif",
      color: C.text,
      padding: '40px',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.primary }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>Management</span>
            <div style={{ width: 40, height: 1, background: C.primary }} />
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 48,
            fontWeight: 600,
            letterSpacing: '-1.5px',
            margin: '0 0 12px',
            color: C.text
          }}>
            User Management
          </h1>
          <p style={{ fontSize: 15, color: C.textLight, margin: 0 }}>Manage user accounts, monitor activity, and control access</p>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            background: C.errorBg,
            border: `1px solid ${C.error}33`,
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2" />
              <path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 13, color: C.error, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            background: C.successBg,
            border: `1px solid ${C.success}33`,
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-10.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fill={C.success} />
            </svg>
            <span style={{ fontSize: 13, color: C.success, fontWeight: 500 }}>{successMessage}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          marginBottom: 32
        }}>
          {[
            { label: 'Total Users', value: users.length, icon: '👥', color: C.primary },
            { label: 'Active Users', value: activeCount, icon: '✅', color: C.success },
            { label: 'Inactive Users', value: inactiveCount, icon: '⭕', color: C.warning },
            { label: 'Businesses', value: businessCount, icon: '🏢', color: C.business },
            { label: 'Recyclers', value: recyclerCount, icon: '♻️', color: C.recycler },
          ].map((stat, i) => (
            <div key={i} style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
              <p style={{ fontSize: 11, color: C.textLighter, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: stat.color, margin: '4px 0 0' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters Section */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 24,
          marginBottom: 32,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: '0 0 20px', fontFamily: "'Cormorant Garamond', serif" }}>
            Filter Users
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8, display: 'block', letterSpacing: '0.04em' }}>Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: C.surfaceHigh,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 13,
                  fontFamily: "'Outfit', sans-serif",
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="">All Types</option>
                <option value="business">Business</option>
                <option value="recycler">Recycler</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 8, display: 'block', letterSpacing: '0.04em' }}>Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: C.surfaceHigh,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 13,
                  fontFamily: "'Outfit', sans-serif",
                  cursor: 'pointer',
                  outline: 'none',
                }}
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
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                color: C.textLight,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = C.primary; e.target.style.color = C.primary; e.target.style.background = C.glowLight; }}
              onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textLight; e.target.style.background = 'transparent'; }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${C.border}`,
            background: C.surfaceHigh,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0 }}>
              Users ({filteredUsers.length})
            </h3>
          </div>

          {filteredUsers.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: C.textLight }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
              <p>No users found matching the filters.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {['ID', 'Email', 'Type', 'Name', 'Phone', 'Verified', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} style={{
                        textAlign: 'left',
                        padding: '14px 20px',
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: C.textLighter,
                        background: C.surfaceHigh,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} style={{
                      borderBottom: `1px solid ${C.border}`,
                      transition: 'background 0.2s',
                      animation: `fadeUp 0.3s ease ${index * 0.03}s both`,
                    }} onMouseEnter={e => e.currentTarget.style.background = C.glowLight} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 20px', fontWeight: 500, color: C.text }}>#{user.id}</td>
                      <td style={{ padding: '14px 20px', color: C.text }}>{user.email}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: 100,
                          fontSize: 11,
                          fontWeight: 600,
                          background: user.type === 'business' ? C.businessBg : C.recyclerBg,
                          color: user.type === 'business' ? C.business : C.recycler,
                        }}>
                          {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: C.text }}>{user.name || '-'}</td>
                      <td style={{ padding: '14px 20px', color: C.textLight }}>{user.phone || '-'}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 100,
                          fontSize: 10,
                          fontWeight: 600,
                          background: user.isVerified ? C.successBg : C.warningBg,
                          color: user.isVerified ? C.success : C.warning,
                        }}>
                          {user.isVerified ? '✓ Yes' : '✗ No'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 100,
                          fontSize: 10,
                          fontWeight: 600,
                          background: user.isActive ? C.successBg : C.errorBg,
                          color: user.isActive ? C.success : C.error,
                        }}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: C.textLight, fontSize: '0.85rem' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {user.isActive ? (
                          <button
                            onClick={() => handleDeactivate(user.id, user.email)}
                            disabled={actionInProgress === user.id}
                            style={{
                              padding: '6px 14px',
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: 6,
                              border: 'none',
                              background: C.error,
                              color: '#ffffff',
                              cursor: actionInProgress === user.id ? 'not-allowed' : 'pointer',
                              opacity: actionInProgress === user.id ? 0.6 : 1,
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { if (actionInProgress !== user.id) { e.target.style.background = '#b91c1c'; } }}
                            onMouseLeave={e => { if (actionInProgress !== user.id) { e.target.style.background = C.error; } }}
                          >
                            {actionInProgress === user.id ? '...' : 'Deactivate'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(user.id, user.email)}
                            disabled={actionInProgress === user.id}
                            style={{
                              padding: '6px 14px',
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: 6,
                              border: 'none',
                              background: C.success,
                              color: '#ffffff',
                              cursor: actionInProgress === user.id ? 'not-allowed' : 'pointer',
                              opacity: actionInProgress === user.id ? 0.6 : 1,
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { if (actionInProgress !== user.id) { e.target.style.background = C.primaryDark; } }}
                            onMouseLeave={e => { if (actionInProgress !== user.id) { e.target.style.background = C.success; } }}
                          >
                            {actionInProgress === user.id ? '...' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagementPage;