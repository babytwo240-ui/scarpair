import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleGetStarted = () => {
    navigate('/role-selection');
  };

  const handleDashboard = () => {
    if (user?.type === 'business') {
      navigate('/business/dashboard');
    } else if (user?.type === 'recycler') {
      navigate('/recycler/dashboard');
    }
  };

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
      <h1>ScrapAir</h1>
      <p style={{ fontSize: '18px', color: '#666' }}>
        Connecting businesses with recyclers for sustainable material management
      </p>

      {!isAuthenticated ? (
        <>
          <button 
            onClick={handleGetStarted}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Get Started
          </button>
        </>
      ) : (
        <button 
          onClick={handleDashboard}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Go to Dashboard
        </button>
      )}

      <div style={{ marginTop: '40px', textAlign: 'left' }}>
        <h2>Features</h2>
        <ul style={{ color: '#555' }}>
          <li>Post recyclable materials for collection</li>
          <li>Find nearby recyclers for your waste</li>
          <li>Track material history and statistics</li>
          <li>Secure user authentication and management</li>
        </ul>
      </div>
    </div>
  );
};

export default LandingPage;