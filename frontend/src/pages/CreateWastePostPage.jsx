import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import wastePostService from '../services/wastePostService';
import imageService from '../services/imageService';

/* ─── Color tokens – 70% White / 30% Green Palette ────────────────── */
const C = {
  // Primary green (30%)
  primary: '#2e7d32',        // Deep green for primary actions
  primaryDark: '#1b5e20',     // Darker green for hover
  primaryLight: '#4caf50',    // Lighter green for accents
  // Backgrounds (70% white/light tones)
  bg: '#f8fafc',              // Light grey-white background
  bgDeep: '#f1f5f9',          // Slightly deeper light background
  surface: '#ffffff',         // Pure white surfaces
  surfaceHigh: '#f8fafc',     // Light surfaces
  cardHover: '#f1f5f9',       // Hover state
  // Text (Dark grey for high contrast on white)
  text: '#0f172a',            // Slate 900
  textLight: '#475569',       // Slate 600
  textLighter: '#94a3b8',     // Slate 400
  // Borders and accents
  border: 'rgba(0,0,0,0.08)',
  borderHover: 'rgba(46,125,50,0.25)',
  error: '#dc2626',
  errorDark: '#b91c1c',
  errorBg: 'rgba(220,38,38,0.08)',
  errorBorder: 'rgba(220,38,38,0.25)',
  info: '#2563eb',
  infoBg: 'rgba(37,99,235,0.08)',
  infoBorder: 'rgba(37,99,235,0.2)',
  glowLight: 'rgba(46,125,50,0.04)',
  glowStrong: 'rgba(46,125,50,0.12)',
};

/* ─── Inline keyframes ─────────────────────────────────────────────── */
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
  
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes floatA {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-18px) rotate(3deg); }
  }
  @keyframes floatB {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-12px) rotate(-2deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .green-shimmer {
    background: linear-gradient(90deg, #2e7d32 0%, #4caf50 40%, #2e7d32 60%, #1b5e20 100%);
    background-size: 800px 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #e2e8f0; }
  ::-webkit-scrollbar-thumb { background: rgba(46,125,50,0.3); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(46,125,50,0.6); }
`;

/* ─── Ambient orb background (soft green for light theme) ──────────── */
function AmbientOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '-15%', right: '-10%',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,125,50,0.04) 0%, transparent 65%)',
        animation: 'floatA 14s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '-8%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,125,50,0.03) 0%, transparent 65%)',
        animation: 'floatB 18s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(46,125,50,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(46,125,50,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(241,245,249,0.6) 100%)',
      }} />
    </div>
  );
}

/* ─── Logo Mark (green gradient) ───────────────────────────────────── */
function LogoMark({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 4px 12px rgba(46,125,50,0.2), inset 0 1px 0 rgba(255,255,255,0.2)`,
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
        borderRadius: `${size * 0.28}px ${size * 0.28}px 0 0`,
      }} />
      <svg width={size * 0.48} height={size * 0.48} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8L12 3L20 8L12 13L4 8Z" />
        <path d="M4 14L12 19L20 14" />
        <path d="M4 11L12 16L20 11" />
      </svg>
    </div>
  );
}

const CreateWastePostPage = () => {
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const mm = (e) => setMouse({ x: e.clientX, y: e.clientY });
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', mm);
    window.addEventListener('scroll', sc);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('scroll', sc);
    };
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/waste-posts/categories`);
      const data = await response.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        setCategories(data.data);
        setFormData((prev) => ({ ...prev, wasteType: data.data[0].name.toLowerCase() }));
      }
    } catch (err) { }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ fontSize: 16, color: C.error, marginBottom: 16 }}>Please login to create a waste post</p>
          <button onClick={() => navigate('/role-selection')} style={{ padding: '12px 28px', fontSize: 13, fontWeight: 700, borderRadius: 100, border: 'none', background: C.primary, color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.background = C.primaryDark; e.target.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.target.style.background = C.primary; e.target.style.transform = 'translateY(0)'; }}>Login</button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
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
    if (!imageFile) return null;

    setImageLoading(true);
    try {
      const response = await imageService.uploadImage(imageFile);
      return response.data.url;
    } catch (err) {
      setError('Failed to upload image. ' + (err.message || ''));
      return null;
    } finally {
      setImageLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setSuccess('Location captured successfully');
      });
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description || !formData.quantity) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!imageFile) {
      setError('Please upload a material image before submitting.');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';
      imageUrl = await uploadImage();

      if (!imageUrl) {
        setError('Failed to upload image. Please try again.');
        return;
      }

      const postData = {
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
        imageUrl,
      };

      const response = await wastePostService.createWastePost(postData);
      setSuccess('Waste post created successfully!');

      setTimeout(() => {
        navigate('/business/posts');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create waste post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (name, label, type = 'text', required = false, placeholder = '') => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>{label} {required && '*'}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: C.bgDeep,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          color: C.text,
          fontFamily: "'Outfit', sans-serif",
          fontSize: 14,
          boxSizing: 'border-box',
          transition: 'all 0.2s',
          outline: 'none',
        }}
        onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );

  const renderSelect = (name, label, options, required = false) => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>{label} {required && '*'}</label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: C.bgDeep,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          color: C.text,
          fontFamily: "'Outfit', sans-serif",
          fontSize: 14,
          boxSizing: 'border-box',
          transition: 'all 0.2s',
          outline: 'none',
          cursor: 'pointer',
        }}
        onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: C.surface, color: C.text }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Outfit', sans-serif", overflowX: 'hidden', color: C.text, position: 'relative' }}>
      <style>{KEYFRAMES}</style>
      <AmbientOrbs />

      {/* Mouse-following green glow */}
      <div style={{ position: 'fixed', top: mouse.y - 320, left: mouse.x - 320, width: 640, height: 640, background: `radial-gradient(circle, ${C.glowLight} 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'top 0.35s ease, left 0.35s ease' }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(255,255,255,0.92)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(24px) saturate(1.5)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <LogoMark size={38} />
            <div>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', fontFamily: "'Cormorant Garamond', serif", color: C.text }}>scrapair</span>
              <div style={{ height: 1.5, background: `linear-gradient(90deg, ${C.primary}, transparent)`, marginTop: 1, width: '100%' }} />
            </div>
          </div>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent', color: C.textLight, cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={e => { e.target.style.borderColor = C.primary; e.target.style.color = C.primary; e.target.style.background = C.glowLight; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textLight; e.target.style.background = 'transparent'; }}>← Back</button>
        </div>
      </nav>

      <section style={{ maxWidth: 700, margin: '0 auto', padding: '60px 40px 100px', position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: 60, animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: C.primary }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.primary }}>Post Material</span>
            <div style={{ width: 40, height: 1, background: C.primary }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 600, letterSpacing: '-1.5px', margin: '0 0 16px', color: C.text, lineHeight: 1.1 }}>Create Post</h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: C.textLight, maxWidth: 520, margin: 0 }}>List your waste material for recyclers to collect</p>
        </div>

        {error && (
          <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 8, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2" />
              <path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ background: C.infoBg, border: `1px solid ${C.infoBorder}`, borderRadius: 8, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-10.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fill={C.info} />
            </svg>
            <span style={{ fontSize: 14, color: C.info, fontWeight: 500 }}>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Material Info Section */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, marginBottom: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 24px' }}>📦 Material Details</h3>
            {renderInput('title', 'Title', 'text', true, 'e.g., Plastic Bottles from Production')}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe the waste material and its condition"
                rows="4"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: C.bgDeep,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 14,
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  outline: 'none',
                  resize: 'vertical',
                }}
                onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px ${C.glowLight}`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {renderSelect('wasteType', 'Waste Type', categories.map(c => ({ value: c.name.toLowerCase(), label: c.name })), true)}
              {renderSelect('condition', 'Condition', [{ value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' }, { value: 'poor', label: 'Poor' }], true)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {renderInput('quantity', 'Quantity', 'number', true, 'Amount')}
              {renderSelect('unit', 'Unit', [{ value: 'kg', label: 'Kilograms' }, { value: 'ton', label: 'Tons' }, { value: 'units', label: 'Units' }, { value: 'm3', label: 'Cubic Meters' }], true)}
            </div>
          </div>

          {/* Location Section */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, marginBottom: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 24px' }}>📍 Location</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {renderInput('city', 'City', 'text', true, 'e.g., New York')}
              {renderInput('address', 'Address', 'text', true, 'e.g., 123 Main St')}
            </div>
            {renderInput('location', 'Location Description', 'text', false, 'e.g., Near central warehouse')}

            <label style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Coordinates</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              <input type="number" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Latitude" step="0.0001" style={{ padding: '12px 14px', background: C.bgDeep, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontFamily: "'Outfit', sans-serif", fontSize: 13, boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} onFocus={e => e.target.style.borderColor = C.borderHover} onBlur={e => e.target.style.borderColor = C.border} />
              <input type="number" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Longitude" step="0.0001" style={{ padding: '12px 14px', background: C.bgDeep, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontFamily: "'Outfit', sans-serif", fontSize: 13, boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} onFocus={e => e.target.style.borderColor = C.borderHover} onBlur={e => e.target.style.borderColor = C.border} />
              <button type="button" onClick={handleGetLocation} style={{ padding: '12px 14px', background: C.primary, border: 'none', borderRadius: 8, color: '#ffffff', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }} onMouseEnter={e => { e.target.style.background = C.primaryDark; e.target.style.transform = 'scale(1.02)'; }} onMouseLeave={e => { e.target.style.background = C.primary; e.target.style.transform = 'scale(1)'; }}>📍 Detect</button>
            </div>
          </div>

          {/* Image Section */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, marginBottom: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 24px' }}>📷 Material Image</h3>
            {imagePreview && (
              <div style={{ marginBottom: 20, borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 250, objectFit: 'cover' }} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ width: '100%', padding: '12px 14px', background: C.bgDeep, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontFamily: "'Outfit', sans-serif", fontSize: 13, boxSizing: 'border-box', outline: 'none', cursor: 'pointer' }} />
            {imageLoading && <p style={{ color: C.primary, fontSize: 13, marginTop: 8 }}>⏳ Uploading image...</p>}
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading || imageLoading} style={{ width: '100%', padding: '16px 24px', fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 8, border: 'none', background: loading || imageLoading ? `${C.primary}99` : C.primary, color: '#ffffff', cursor: loading || imageLoading ? 'not-allowed' : 'pointer', opacity: loading || imageLoading ? 0.6 : 1, transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)', boxShadow: loading || imageLoading ? 'none' : `0 2px 8px ${C.glowStrong}` }} onMouseEnter={e => { if (!loading && !imageLoading) { e.target.style.background = C.primaryDark; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `0 6px 16px ${C.glowStrong}`; } }} onMouseLeave={e => { if (!loading && !imageLoading) { e.target.style.background = C.primary; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 2px 8px ${C.glowStrong}`; } }}>
            {loading ? '⏳ Creating Post...' : '✓ Create Waste Post'}
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '32px 40px', position: 'relative', zIndex: 2, background: C.surface, boxShadow: '0 -1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', textAlign: 'center', color: C.textLighter, fontSize: 12, letterSpacing: '0.04em' }}>
          <p style={{ margin: 0 }}>© 2026 scrapair. Building a circular economy, one pickup at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default CreateWastePostPage;