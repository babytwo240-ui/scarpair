/* eslint-disable unicode-bom */
import axios from 'axios';
import DOMPurify from 'dompurify';

if (!process.env.REACT_APP_API_URL) {
  console.warn('REACT_APP_API_URL is not defined in environment variables');
}
const API_BASE_URL = process.env.REACT_APP_API_URL;

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

// âœ… Sanitize responses and handle errors
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
        // âœ… Token is invalid or expired - clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      } else if (status === 403) {
      } else if (status === 404) {
      } else if (status === 400) {
      } else if (status >= 500) {
      }

      // Return error data for handling in components
      return Promise.reject({
        status,
        message: data.message || data.error || 'An error occurred',
        data,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        status: 0,
        message: 'No response from server. Check your connection.',
      });
    } else {
      // Error in request setup
      return Promise.reject({
        status: 0,
        message: error.message,
      });
    }
  }
);

export default apiClient;


