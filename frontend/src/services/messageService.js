import apiClient from './api';

const messageService = {
  // Start conversation
  startConversation: async (participantUserId, wastePostId) => {
    const response = await apiClient.post('/conversations', {
      participantUserId,
      wastePostId,
    });
    return response.data;
  },

  // Get all conversations
  getConversations: async () => {
    const response = await apiClient.get('/conversations');
    return response.data;
  },

  // Get conversation by ID
  getConversation: async (id) => {
    const response = await apiClient.get(`/conversations/${id}`);
    return response.data;
  },

  // Get conversation messages
  getConversationMessages: async (conversationId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/messages/${conversationId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Send message
  sendMessage: async (conversationId, recipientId, content, imageUrl = null) => {
    const response = await apiClient.post('/messages', {
      conversationId,
      recipientId,
      content,
      imageUrl,
    });
    return response.data;
  },

  // Edit message
  editMessage: async (messageId, content) => {
    const response = await apiClient.put(`/messages/${messageId}`, { content });
    return response.data;
  },

  // Delete message
  deleteMessage: async (messageId) => {
    const response = await apiClient.delete(`/messages/${messageId}`);
    return response.data;
  },

  // Get all notifications
  getNotifications: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/notifications', {
      params: { page, limit },
    });
    return response.data;
  },

  // Mark notification as read
  markNotificationRead: async (id) => {
    const response = await apiClient.put(`/notifications/${id}/read`, {});
    return response.data;
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    const response = await apiClient.put('/notifications/read-all', {});
    return response.data;
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    const response = await apiClient.delete('/notifications/delete-all');
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },
};

export default messageService;
