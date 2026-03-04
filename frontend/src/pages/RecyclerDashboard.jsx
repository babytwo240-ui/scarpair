import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import wastePostService from '../services/wastePostService';
import messageService from '../services/messageService';

const RecyclerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    wasteType: '',
    city: '',
    searchQuery: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/waste-posts/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wastePostService.getMarketplace({
        wasteType: filters.wasteType,
        city: filters.city,
        searchQuery: filters.searchQuery,
      });
      setMaterials(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRequestCollection = (postId) => {
    if (!user) {
      navigate('/role-selection');
      return;
    }
    navigate(`/collection/request/${postId}`);
  };

  const handleMessageBusiness = async (businessId, postId) => {
    if (!user) {
      navigate('/role-selection');
      return;
    }
    try {
      const response = await messageService.startConversation(businessId, postId);
      const conversationId = response.data?.id || response.id;
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      alert('Failed to message business: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Recycler Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/edit-profile')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            âš™ï¸ Edit Profile
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <p style={{ color: '#666' }}>Welcome, {user?.businessName || 'User'}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h3>Messages</h3>
          <p style={{ color: '#666', marginBottom: '10px', fontSize: '14px' }}>
            Chat with businesses about materials.
          </p>
          <button
            onClick={() => navigate('/messages')}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Open Inbox
          </button>
        </div>

        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h3>Notifications</h3>
          <p style={{ color: '#666', marginBottom: '10px', fontSize: '14px' }}>
            View collection updates and alerts.
          </p>
          <button
            onClick={() => navigate('/notifications')}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            View Notifications
          </button>
        </div>

        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h3>ðŸŽ¯ Approved Collections</h3>
          <p style={{ color: '#666', marginBottom: '10px', fontSize: '14px' }}>
            View and manage your approved waste pickups.
          </p>
          <button
            onClick={() => navigate('/recycler/approved-collections')}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            View Collections
          </button>
        </div>

        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h3>My Collections</h3>
          <p style={{ color: '#666', marginBottom: '10px', fontSize: '14px' }}>
            Track all your collection requests.
          </p>
          <button
            onClick={() => navigate('/collections')}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#ffc107',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            View Collections
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '30px', backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h2>Find Waste Materials</h2>
        <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr 1fr auto' }}>
          <input
            type="text"
            name="searchQuery"
            placeholder="Search by title or description"
            value={filters.searchQuery}
            onChange={handleFilterChange}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <select
            name="wasteType"
            value={filters.wasteType}
            onChange={handleFilterChange}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">All Waste Types</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name.toLowerCase()}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="city"
            placeholder="Filter by city"
            value={filters.city}
            onChange={handleFilterChange}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button
            onClick={fetchMaterials}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '10px', borderRadius: '4px', color: '#c33', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div>
        <h2>Available Waste Materials</h2>
        {loading ? (
          <p>Loading materials...</p>
        ) : materials.length === 0 ? (
          <p style={{ color: '#999' }}>No waste materials available. Check back later.</p>
        ) : (
          <>
            {/* Separate active from in-collection materials */}
            {(() => {
              const activeMaterials = materials.filter((m) => m.status === 'active');
              const inCollectionMaterials = materials.filter((m) => m.status === 'in-collection');

              return (
                <>
                  {/* ACTIVE MATERIALS */}
                  {activeMaterials.length > 0 && (
                    <>
                      <h3 style={{ marginBottom: '15px', color: '#28a745' }}>âœ… Available ({activeMaterials.length})</h3>
                      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginBottom: '30px' }}>
                        {activeMaterials.map((material) => (
                          <div
                            key={material.id}
                            style={{
                              border: '2px solid #28a745',
                              borderRadius: '4px',
                              padding: '15px',
                              backgroundColor: 'white',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                          >
                            {material.imageUrl && (
                              <img
                                src={material.imageUrl}
                                alt={material.title}
                                style={{
                                  width: '100%',
                                  height: '180px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  marginBottom: '10px',
                                }}
                              />
                            )}
                            <h3 style={{ margin: '10px 0' }}>{material.title}</h3>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                              {material.description.substring(0, 100)}...
                            </p>

                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                              <p style={{ margin: '3px 0' }}>
                                <strong>Type:</strong> {material.wasteType}
                              </p>
                              <p style={{ margin: '3px 0' }}>
                                <strong>Quantity:</strong> {material.quantity} {material.unit}
                              </p>
                              <p style={{ margin: '3px 0' }}>
                                <strong>Condition:</strong> {material.condition}
                              </p>
                              {material.city && (
                                <p style={{ margin: '3px 0' }}>
                                  <strong>Location:</strong> {material.city}
                                </p>
                              )}
                              {material.business?.businessName && (
                                <p style={{ margin: '3px 0' }}>
                                  <strong>Posted by:</strong> {material.business.businessName}
                                </p>
                              )}
                              {material.createdAt && (
                                <small style={{ color: '#999' }}>
                                  Posted on {new Date(material.createdAt).toLocaleDateString()}
                                </small>
                              )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                              <button
                                onClick={() => navigate(`/waste-post/${material.id}`)}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#6c757d',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                }}
                              >
                                ðŸ“‹ Details
                              </button>
                              <button
                                onClick={() => handleMessageBusiness(material.businessId, material.id)}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#17a2b8',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                }}
                              >
                                ðŸ’¬ Message
                              </button>
                              <button
                                onClick={() => handleRequestCollection(material.id)}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#28a745',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                }}
                              >
                                ðŸšš Collect
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* IN-COLLECTION MATERIALS */}
                  {inCollectionMaterials.length > 0 && (
                    <>
                      <h3 style={{ marginBottom: '15px', color: '#ffc107' }}>ðŸ”„ In Collection ({inCollectionMaterials.length})</h3>
                      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {inCollectionMaterials.map((material) => (
                          <div
                            key={material.id}
                            style={{
                              border: '2px solid #ccc',
                              borderRadius: '4px',
                              padding: '15px',
                              backgroundColor: '#f5f5f5',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              opacity: 0.7,
                            }}
                          >
                            {material.imageUrl && (
                              <img
                                src={material.imageUrl}
                                alt={material.title}
                                style={{
                                  width: '100%',
                                  height: '180px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  marginBottom: '10px',
                                  filter: 'grayscale(100%)',
                                }}
                              />
                            )}
                            <h3 style={{ margin: '10px 0', color: '#666' }}>{material.title}</h3>
                            <p style={{ color: '#999', fontSize: '14px', marginBottom: '10px' }}>
                              {material.description.substring(0, 100)}...
                            </p>

                            <div style={{ fontSize: '14px', color: '#999', marginBottom: '10px' }}>
                              <p style={{ margin: '3px 0' }}>
                                <strong>Type:</strong> {material.wasteType}
                              </p>
                              <p style={{ margin: '3px 0' }}>
                                <strong>Quantity:</strong> {material.quantity} {material.unit}
                              </p>
                              <p style={{ margin: '3px 0' }}>
                                <strong>Condition:</strong> {material.condition}
                              </p>
                              {material.city && (
                                <p style={{ margin: '3px 0' }}>
                                  <strong>Location:</strong> {material.city}
                                </p>
                              )}
                              {material.business?.businessName && (
                                <p style={{ margin: '3px 0' }}>
                                  <strong>Posted by:</strong> {material.business.businessName}
                                </p>
                              )}
                              <div
                                style={{
                                  backgroundColor: '#ffc107',
                                  color: '#333',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  marginTop: '5px',
                                  display: 'inline-block',
                                }}
                              >
                                ðŸ”„ In Collection
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                              <button
                                onClick={() => navigate(`/waste-post/${material.id}`)}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#6c757d',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                }}
                              >
                                ðŸ“‹ Details
                              </button>
                              <button
                                onClick={() => handleMessageBusiness(material.businessId, material.id)}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#17a2b8',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                }}
                              >
                                ðŸ’¬ Message
                              </button>
                              <button
                                disabled
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#ccc',
                                  color: '#666',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'not-allowed',
                                  fontSize: '11px',
                                }}
                                title="This material is already being collected by another recycler"
                              >
                                ðŸšš Collect
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
};

export default RecyclerDashboard;

