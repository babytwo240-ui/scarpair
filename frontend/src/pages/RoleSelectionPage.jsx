import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Select Your Role</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>What brings you here today?</p>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div
          onClick={() => navigate('/business/login')}
          style={{
            padding: '30px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            flex: '1',
            minWidth: '200px',
            backgroundColor: '#f9f9f9',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#e8f4f8';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f9f9';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <h3>Business Owner</h3>
          <p style={{ color: '#888', fontSize: '14px' }}>Post materials for collection</p>
        </div>

        <div
          onClick={() => navigate('/recycler/login')}
          style={{
            padding: '30px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            flex: '1',
            minWidth: '200px',
            backgroundColor: '#f9f9f9',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#e8f8f4';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f9f9';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <h3>Recycler</h3>
          <p style={{ color: '#888', fontSize: '14px' }}>Find materials to recycle</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
