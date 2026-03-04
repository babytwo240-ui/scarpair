import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5498/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin Auth
export const adminAPI = {
  /**
   * Login with username and password
   */
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/admin/login', { username, password });
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  /**
   * Logout
   */
  logout: () => {
    localStorage.removeItem('adminToken');
  },

  /**
   * Get all materials
   */
  getAllMaterials: async () => {
    try {
      const response = await apiClient.get('/admin/materials');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch materials' };
    }
  },

  /**
   * Get material by ID
   */
  getMaterialById: async (id) => {
    try {
      const response = await apiClient.get(`/admin/materials/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch material' };
    }
  },

  /**
   * Create material
   */
  createMaterial: async (materialData) => {
    try {
      const response = await apiClient.post('/admin/materials', materialData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create material' };
    }
  },

  /**
   * Update material
   */
  updateMaterial: async (id, materialData) => {
    try {
      const response = await apiClient.put(`/admin/materials/${id}`, materialData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update material' };
    }
  },

  /**
   * Delete material
   */
  deleteMaterial: async (id) => {
    try {
      const response = await apiClient.delete(`/admin/materials/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete material' };
    }
  },

  /**
   * Get statistics
   */
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/admin/statistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch statistics' };
    }
  }
};

export default apiClient;
