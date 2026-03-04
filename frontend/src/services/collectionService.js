import apiClient from './api';

const collectionService = {
  // Request collection - recycler initiates collection request
  requestCollection: async (postId, scheduledDate = null) => {
    try {
      const payload = { postId };
      if (scheduledDate) {
        payload.scheduledDate = scheduledDate;
      }
      const response = await apiClient.post('/collections/request', payload);
      // Backend returns: { message, data: { id, status, transactionCode, cancellationCount, forceApproved, ... } }
      return response.data || response;
    } catch (error) {
      const errorData = error.response?.data || error.data;
      const msg = errorData?.message || error.message || 'Failed to request collection';
      const code = errorData?.code;
      throw new Error(msg, { cause: { code } });
    }
  },

  // Approve collection - business approves pending->approved
  approveCollection: async (collectionId) => {
    try {
      const response = await apiClient.put(`/collections/${collectionId}/approve`, {});
      return response.data || response;
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to approve collection';
      throw new Error(msg);
    }
  },

  // Reject collection - business rejects pending->rejected
  rejectCollection: async (collectionId) => {
    try {
      const response = await apiClient.put(`/collections/${collectionId}/reject`, {});
      return response.data || response;
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to reject collection';
      throw new Error(msg);
    }
  },

  // Get collection details with full relations
  getCollectionDetails: async (id) => {
    try {
      const response = await apiClient.get(`/collections/${id}`);
      // Backend returns: { message, data: { id, status, post, recycler, business, ... } }
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to fetch collection details';
      throw new Error(msg);
    }
  },

  // Get available posts for collection request (public endpoint)
  getAvailablePosts: async (filters = {}) => {
    try {
      const response = await apiClient.get('/collections/available', { params: filters });
      // Backend returns: { message, pagination, data: [...posts] }
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to fetch available posts';
      throw new Error(msg);
    }
  },

  // Schedule collection - business sets pickup date (requires approved status)
  scheduleCollection: async (collectionId, data) => {
    try {
      const response = await apiClient.put(`/collections/${collectionId}/schedule`, data);
      return response.data || response;
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to schedule collection';
      throw new Error(msg);
    }
  },

  // Confirm collection completion - confirms pickup happened (scheduled->completed)
  confirmCollection: async (collectionId) => {
    try {
      const response = await apiClient.put(`/collections/${collectionId}/confirm`, {});
      return response.data || response;
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to confirm collection';
      throw new Error(msg);
    }
  },

  // Accept materials - recycler finalizes collection (completed->confirmed, marks post collected)
  acceptMaterials: async (collectionId) => {
    try {
      const response = await apiClient.put(`/collections/${collectionId}/accept-materials`, {});
      return response.data || response;
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to accept materials';
      throw new Error(msg);
    }
  },

  // Get user's collections - returns collections where user is recycler OR business
  getUserCollections: async (filters = {}) => {
    try {
      const response = await apiClient.get('/collections', { params: filters });
      // Backend returns: { message, pagination, data: [...collections] }
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to fetch collections';
      throw new Error(msg);
    }
  },

  // Get all collections (for admin/business viewing all requests)
  getAllCollections: async (filters = {}) => {
    try {
      const response = await apiClient.get('/collections', { params: filters });
      // Backend returns: { message, pagination, data: [...collections] }
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to fetch collections';
      console.error('getAllCollections error:', { error, msg, status: error.status });
      throw new Error(msg);
    }
  },

  // Cancel an approved or scheduled collection - both business and recycler can cancel
  cancelCollection: async (collectionId, cancellationReason = null) => {
    try {
      const payload = {};
      if (cancellationReason) {
        payload.cancellationReason = cancellationReason;
      }
      const response = await apiClient.put(`/collections/${collectionId}/cancel`, payload);
      return response.data || response;
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to cancel collection';
      throw new Error(msg);
    }
  },
};

export default collectionService;
