import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const collectionService = {
  requestCollection: async (wastePostId, collectionData) => {
    const res = await axios.post(`${API_BASE}/collections/request`, { wastePostId, ...collectionData }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  getMyRequests: async (userId, page = 1) => {
    const res = await axios.get(`${API_BASE}/collections/my-requests?page=${page}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  getReceivedRequests: async (userId, page = 1) => {
    const res = await axios.get(`${API_BASE}/collections/received?page=${page}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  approveRequest: async (collectionId) => {
    const res = await axios.put(`${API_BASE}/collections/${collectionId}/approve`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  rejectRequest: async (collectionId, reason) => {
    const res = await axios.put(`${API_BASE}/collections/${collectionId}/reject`, { reason }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  getRequestDetails: async (collectionId) => {
    const res = await axios.get(`${API_BASE}/collections/${collectionId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },
};

export default collectionService;
