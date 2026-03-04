import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminPages.css';

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

  if (loading) return <div className="admin-page">Loading categories...</div>;

  return (
    <div className="admin-page admin-categories">
      <h2>Waste Categories Management</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <button 
        onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
          setFormData({ name: '', description: '', icon: '', isActive: true });
        }}
        className="btn btn-primary"
      >
        {showForm ? 'Cancel' : '+ Add New Category'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="category-form">
          <h3>{editingId ? 'Edit Category' : 'Create New Category'}</h3>

          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Plastic, Metal, Electronics"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description of this waste category"
            />
          </div>

          <div className="form-group">
            <label>Icon/Emoji</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="e.g., ♻️, 🔧, 🗑️"
              maxLength={5}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Active
            </label>
          </div>

          <button type="submit" className="btn btn-success">
            {editingId ? 'Update Category' : 'Create Category'}
          </button>
        </form>
      )}

      <div className="categories-list">
        <h3>All Categories ({categories.length})</h3>
        {categories.length === 0 ? (
          <p>No categories yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Icon</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.icon || 'N/A'}</td>
                  <td>{cat.name}</td>
                  <td>{cat.description || '-'}</td>
                  <td>
                    <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEdit(cat)}
                      className="btn btn-sm btn-info"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
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

export default AdminCategoriesPage;
