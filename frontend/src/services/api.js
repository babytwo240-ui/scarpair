import axios from 'axios';
import DOMPurify from 'dompurify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Sanitize responses and handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Sanitize string responses to prevent XSS
    if (response.data && typeof response.data === 'string') {
      response.data = DOMPurify.sanitize(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // ✅ Token is invalid or expired - clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        console.error('Session expired. Please login again.');
      } else if (status === 403) {
        console.error('Permission denied:', data.message);
      } else if (status === 404) {
        console.error('Resource not found:', data.message);
      } else if (status === 400) {
        console.error('Bad request:', data.message);
      } else if (status >= 500) {
        console.error('Server error:', data.message);
      }

      // Return error data for handling in components
      return Promise.reject({
        status,
        message: data.message || data.error || 'An error occurred',
        data,
      });
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server');
      return Promise.reject({
        status: 0,
        message: 'No response from server. Check your connection.',
      });
    } else {
      // Error in request setup
      console.error('Error:', error.message);
      return Promise.reject({
        status: 0,
        message: error.message,
      });
    }
  }
);

export default apiClient;

