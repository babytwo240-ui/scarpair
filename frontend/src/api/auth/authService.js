import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authService = {
  // Business-specific login
  businessLogin: async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/business/login`, { email, password });
    const token = res.data.accessToken || res.data.token;
    if (token) localStorage.setItem('token', token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return { ...res.data, token };
  },

  // Recycler-specific login
  recyclerLogin: async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/recycler/login`, { email, password });
    const token = res.data.accessToken || res.data.token;
    if (token) localStorage.setItem('token', token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return { ...res.data, token };
  },

  // Generic login (for backwards compatibility)
  login: async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/business/login`, { email, password });
    const token = res.data.accessToken || res.data.token;
    if (token) localStorage.setItem('token', token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return { ...res.data, token };
  },

  // Business signup
  businessSignup: async (email, password, businessName, phoneNumber) => {
    const res = await axios.post(`${API_BASE}/auth/business/signup`, { 
      email, 
      password, 
      businessName, 
      phone: phoneNumber 
    });
    if (res.data.token) localStorage.setItem('token', res.data.token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  },

  // Recycler signup
  recyclerSignup: async (email, password, name, phoneNumber) => {
    const res = await axios.post(`${API_BASE}/auth/recycler/signup`, { 
      email, 
      password, 
      name, 
      phone: phoneNumber 
    });
    if (res.data.token) localStorage.setItem('token', res.data.token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  },

  // Generic signup (for backwards compatibility)
  register: async (email, password, role, businessName, phoneNumber) => {
    const endpoint = role === 'business' ? 'business/signup' : 'recycler/signup';
    const payload = role === 'business' 
      ? { email, password, businessName, phone: phoneNumber }
      : { email, password, name: businessName, phone: phoneNumber };
    
    const res = await axios.post(`${API_BASE}/auth/${endpoint}`, payload);
    if (res.data.token) localStorage.setItem('token', res.data.token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  verifyEmail: async (email, code) => {
    const res = await axios.post(`${API_BASE}/auth/verify-email`, { email, code });
    const token = res.data.accessToken || res.data.token;
    if (token) localStorage.setItem('token', token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return { ...res.data, token };
  },

  resetPassword: async (email) => {
    const res = await axios.post(`${API_BASE}/auth/reset-password`, { email });
    return res.data;
  },

  setNewPassword: async (token, newPassword) => {
    const res = await axios.post(`${API_BASE}/auth/set-password`, { token, newPassword });
    return res.data;
  },

  checkTokenValidity: async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const res = await axios.get(`${API_BASE}/auth/verify`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data.valid;
    } catch {
      return false;
    }
  },
};

export default authService;
