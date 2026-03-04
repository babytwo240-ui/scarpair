import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import wastePostService from '../services/wastePostService';
import imageService from '../services/imageService';

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
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Please login to create a waste post.</p>
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
      return response.data.url;  // Backend returns data.url
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
      // Upload image (required)
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

  return (
    <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Create Waste Post</h2>

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '10px', borderRadius: '4px', color: '#c33', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#efe', padding: '10px', borderRadius: '4px', color: '#3c3', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Plastic Bottles from Production"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe the waste material and its condition"
            rows="4"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Waste Type *</label>
            <select
              name="wasteType"
              value={formData.wasteType}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
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
            <label style={{ display: 'block', marginBottom: '5px' }}>Condition *</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              placeholder="Amount"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Unit *</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value="kg">Kilograms</option>
              <option value="ton">Tons</option>
              <option value="units">Units</option>
              <option value="m3">Cubic Meters</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="e.g., New York"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="e.g., 123 Main St"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Location Description</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Near central warehouse"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Location</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="Latitude"
              step="0.0001"
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="Longitude"
              step="0.0001"
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={handleGetLocation}
              style={{
                padding: '8px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Get Location
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Material Image</label>
          {imagePreview && (
            <div style={{ marginBottom: '10px' }}>
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
          {imageLoading && <p style={{ color: '#666' }}>Uploading image...</p>}
        </div>

        <button
          type="submit"
          disabled={loading || imageLoading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || imageLoading ? 'not-allowed' : 'pointer',
            opacity: loading || imageLoading ? 0.6 : 1,
          }}
        >
          {loading ? 'Creating Post...' : 'Create Waste Post'}
        </button>
      </form>
    </div>
  );
};

export default CreateWastePostPage;
