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
  danger: '#dc2626',
  dangerDark: '#b91c1c',
  info: '#2563eb',
  warning: '#d97706',
  // Glows
  glowLight: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

const AdminCategoriesPage = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch categories');

      const data = await response.json();
      setCategories(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : '/api/admin/categories';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save category');
      }

      setFormData({ name: '', description: '', icon: '', isActive: true });
      setEditingId(null);
      setShowForm(false);
      await fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will soft-delete the category.')) return;

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete category');
      await fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (category) => {
    setFormData(category);
    setEditingId(category.id);
    setShowForm(true);
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', sans-serif",
      color: C.text
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.primary, animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p>Loading categories...</p>
      </div>
    </div>
  );

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
        .admin-categories {
          animation: fadeUp 0.5s ease both;
        }
        .btn {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .btn:hover {
          transform: translateY(-1px);
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
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
            Waste Categories
          </h1>
          <p style={{ fontSize: 15, color: C.textLight, margin: 0 }}>Manage waste material categories for the platform</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.08)',
            border: '1px solid rgba(220,38,38,0.25)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke={C.danger} strokeWidth="2" />
              <path d="M10 6v4M10 14h.01" stroke={C.danger} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 14, color: C.danger, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', description: '', icon: '', isActive: true });
          }}
          style={{
            padding: '12px 24px',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            borderRadius: 8,
            border: 'none',
            background: C.primary,
            color: '#ffffff',
            cursor: 'pointer',
            marginBottom: 32,
            boxShadow: `0 2px 6px ${C.glowStrong}`,
          }}
          onMouseEnter={e => { e.target.style.background = C.primaryDark; e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 4px 12px ${C.glowStrong}`; }}
          onMouseLeave={e => { e.target.style.background = C.primary; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 2px 6px ${C.glowStrong}`; }}
        >
          {showForm ? '✕ Cancel' : '+ Add New Category'}
        </button>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: 32,
            marginBottom: 40,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              color: C.text,
              margin: '0 0 24px',
              fontFamily: "'Cormorant Garamond', serif",
            }}>
              {editingId ? 'Edit Category' : 'Create New Category'}
            </h3>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Plastic, Metal, Electronics"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: C.surfaceHigh,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description of this waste category"
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: C.surfaceHigh,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Icon/Emoji</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g., ♻️, 🔧, 🗑️"
                maxLength={5}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: C.surfaceHigh,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ marginRight: 8, width: 16, height: 16, cursor: 'pointer' }}
                />
                Active
              </label>
            </div>

            <button type="submit" style={{
              padding: '12px 24px',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderRadius: 8,
              border: 'none',
              background: C.primary,
              color: '#ffffff',
              cursor: 'pointer',
              width: '100%',
              boxShadow: `0 2px 6px ${C.glowStrong}`,
            }} onMouseEnter={e => { e.target.style.background = C.primaryDark; e.target.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.target.style.background = C.primary; e.target.style.transform = 'translateY(0)'; }}>
              {editingId ? 'Update Category' : 'Create Category'}
            </button>
          </form>
        )}

        {/* Categories Table */}
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
              All Categories ({categories.length})
            </h3>
          </div>

          {categories.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: C.textLight }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
              <p>No categories yet. Create your first category above.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {['Icon', 'Name', 'Description', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{
                        textAlign: 'left',
                        padding: '16px 20px',
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
                  {categories.map((cat, index) => (
                    <tr key={cat.id} style={{
                      borderBottom: `1px solid ${C.border}`,
                      transition: 'background 0.2s',
                      animation: `fadeUp 0.3s ease ${index * 0.03}s both`,
                    }} onMouseEnter={e => e.currentTarget.style.background = C.glowLight} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px 20px', fontSize: 24 }}>{cat.icon || '📦'}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: C.text }}>{cat.name}</td>
                      <td style={{ padding: '16px 20px', color: C.textLight }}>{cat.description || '-'}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: 100,
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: '0.03em',
                          background: cat.isActive ? C.glowLight : 'rgba(220,38,38,0.08)',
                          color: cat.isActive ? C.success : C.danger,
                          border: `1px solid ${cat.isActive ? C.success + '33' : C.danger + '33'}`,
                        }}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleEdit(cat)}
                            style={{
                              padding: '6px 14px',
                              fontSize: 12,
                              fontWeight: 600,
                              borderRadius: 6,
                              border: `1px solid ${C.border}`,
                              background: 'transparent',
                              color: C.info,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.target.style.borderColor = C.info; e.target.style.background = 'rgba(37,99,235,0.08)'; }}
                            onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            style={{
                              padding: '6px 14px',
                              fontSize: 12,
                              fontWeight: 600,
                              borderRadius: 6,
                              border: `1px solid ${C.danger}33`,
                              background: 'transparent',
                              color: C.danger,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.target.style.borderColor = C.danger; e.target.style.background = 'rgba(220,38,38,0.08)'; }}
                            onMouseLeave={e => { e.target.style.borderColor = C.danger + '33'; e.target.style.background = 'transparent'; }}
                          >
                            Delete
                          </button>
                        </div>
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

export default AdminCategoriesPage;