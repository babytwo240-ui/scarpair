import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import wastePostService from '../services/wastePostService';
import imageService from '../services/imageService';

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
  error: '#dc2626',
  errorBg: 'rgba(220,38,38,0.08)',
  errorBorder: 'rgba(220,38,38,0.25)',
  success: '#2e7d32',
  successBg: 'rgba(46,125,50,0.08)',
  successBorder: 'rgba(46,125,50,0.25)',
  // Glows
  glowLight: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

const EditWastePostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    wasteType: 'plastic',
    condition: 'good',
    quantity: '',
    unit: 'kg',
    city: '',
    address: '',
    location: '',
    latitude: '',
    longitude: '',
  });

  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc);
    return () => window.removeEventListener('scroll', sc);
  }, []);

  useEffect(() => {
    fetchCategories();
    loadPost();
  }, [postId]);

  const fetchCategories = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/waste-posts/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
    }
  };

  const loadPost = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await wastePostService.getWastePostById(postId);
      const post = response.data;
      setFormData({
        title: post.title,
        description: post.description,
        wasteType: post.wasteType,
        condition: post.condition,
        quantity: post.quantity,
        unit: post.unit,
        city: post.city,
        address: post.address,
        location: post.location,
        latitude: post.latitude || '',
        longitude: post.longitude || '',
      });
      if (post.imageUrl) {
        setCurrentImageUrl(post.imageUrl);
      }
    } catch (err) {
      setError(err.message || 'Failed to load post.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return currentImageUrl;

    setImageLoading(true);
    try {
      // Delete old image if it exists
      if (currentImageUrl) {
        try {
          await imageService.deleteImage(currentImageUrl);
        } catch (err) {
        }
      }

      const response = await imageService.uploadImage(imageFile);
      return response.data.url;  // Backend returns data.url
    } catch (err) {
      setError('Failed to upload image. ' + (err.message || ''));
      throw err;
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);

    try {
      let imageUrl = currentImageUrl;

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const updateData = {
        title: formData.title,
        description: formData.description,
        wasteType: formData.wasteType,
        condition: formData.condition,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        city: formData.city,
        address: formData.address,
        location: formData.location,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }

      await wastePostService.updateWastePost(postId, updateData);
      setSuccess('Post updated successfully!');

      setTimeout(() => {
        navigate('/business/posts');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.primary, animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 14, color: C.textLight }}>Loading post...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: C.textLight }}>Please login to edit posts.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Outfit', sans-serif", overflowX: 'hidden', color: C.text, position: 'relative' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(255,255,255,0.92)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(24px) saturate(1.5)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/business/dashboard')}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(46,125,50,0.08)', border: `1px solid rgba(46,125,50,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4zM3.444 11H9v5.472A6.002 6.002 0 0 1 3.444 11zm6.556 5.472V11h5.556A6.002 6.002 0 0 1 10 16.472z" fill={C.primary} />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', fontFamily: "'Cormorant Garamond', serif", color: C.text }}>scrapair</span>
              <div style={{ height: 1.5, background: `linear-gradient(90deg, ${C.primary}, transparent)`, marginTop: 1, width: '100%' }} />
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.06em',
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              background: 'transparent',
              color: C.textLight,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = C.primary; e.target.style.color = C.primary; e.target.style.background = C.glowLight; }}
            onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textLight; e.target.style.background = 'transparent'; }}
          >
            ← Back
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ marginBottom: 48, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.primary }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>Edit</span>
            <div style={{ width: 40, height: 1, background: C.primary }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 600, letterSpacing: '-1.5px', margin: 0, color: C.text }}>
            Edit Waste Post
          </h1>
          <p style={{ fontSize: 15, color: C.textLight, marginTop: 12 }}>Update your waste material listing details</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: C.errorBg,
            border: `1px solid ${C.errorBorder}`,
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

        {/* Success Message */}
        {success && (
          <div style={{
            background: C.successBg,
            border: `1px solid ${C.successBorder}`,
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
            <span style={{ fontSize: 13, color: C.success, fontWeight: 500 }}>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {/* Title */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                background: C.surfaceHigh,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                color: C.text,
                fontSize: 14,
                fontFamily: "'Outfit', sans-serif",
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
              onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: C.surfaceHigh,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                color: C.text,
                fontSize: 14,
                fontFamily: "'Outfit', sans-serif",
                outline: 'none',
                transition: 'all 0.2s',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
              onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Waste Type & Condition */}
          <div style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Waste Type *</label>
              <select
                name="wasteType"
                value={formData.wasteType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: C.surfaceHigh,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.name.toLowerCase()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Condition *</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: C.surfaceHigh,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="1"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: C.surfaceHigh,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Unit *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: C.surfaceHigh,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="kg">Kilograms</option>
                <option value="ton">Tons</option>
                <option value="units">Units</option>
                <option value="m3">Cubic Meters</option>
              </select>
            </div>
          </div>

          {/* City & Address */}
          <div style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: C.surfaceHigh,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: C.surfaceHigh,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Location Description */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Location Description</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: C.surfaceHigh,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                color: C.text,
                fontSize: 14,
                fontFamily: "'Outfit', sans-serif",
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
              onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Coordinates */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Coordinates</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Latitude"
                step="0.0001"
                style={{
                  padding: '12px 14px',
                  background: C.surfaceHigh,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Longitude"
                step="0.0001"
                style={{
                  padding: '12px 14px',
                  background: C.surfaceHigh,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Image Section */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Material Image</label>
            {(imagePreview || currentImageUrl) && (
              <div style={{ marginBottom: 12 }}>
                <img
                  src={imagePreview || currentImageUrl}
                  alt="Current"
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 8, border: `1px solid ${C.border}` }}
                />
                {imagePreview && <p style={{ fontSize: 11, color: C.textLight, marginTop: 8 }}>New image selected</p>}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: C.surfaceHigh,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                color: C.text,
                fontSize: 13,
                fontFamily: "'Outfit', sans-serif",
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            />
            {imageLoading && <p style={{ color: C.primary, fontSize: 12, marginTop: 8 }}>⏳ Uploading image...</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving || imageLoading}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: C.primary,
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: saving || imageLoading ? 'not-allowed' : 'pointer',
              opacity: saving || imageLoading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              boxShadow: `0 2px 8px ${C.glowStrong}`,
            }}
            onMouseEnter={e => {
              if (!saving && !imageLoading) {
                e.target.style.background = C.primaryDark;
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = `0 4px 12px ${C.glowStrong}`;
              }
            }}
            onMouseLeave={e => {
              e.target.style.background = C.primary;
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 2px 8px ${C.glowStrong}`;
            }}
          >
            {saving ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: '16px', height: '16px', border: `2px solid #ffffff`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Updating Post...
              </span>
            ) : (
              'Update Post'
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditWastePostPage;