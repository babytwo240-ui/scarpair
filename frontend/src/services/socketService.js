import io from 'socket.io-client';

// Determine socket URL based on environment
const determineSocketUrl = () => {
  // If explicit env var is set, use it
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }

  // If in browser, use the same domain as the frontend
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Fallback for development (should use .env file instead)
  return 'http://localhost:5000';
};

const SOCKET_URL = determineSocketUrl();

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket) {
      return this.socket;
    }

    if (!token) {
      return null;
    }

    try {
      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
        // Add path explicitly to ensure correct endpoint
        path: '/socket.io',
      });

      this.socket.on('connect', () => {
      });

      this.socket.on('disconnect', (reason) => {
      });

      this.socket.on('error', (error) => {
      });

      this.socket.on('connect_error', (error) => {
      });
    } catch (error) {
      this.socket = null;
      return null;
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  onMessage(callback) {
    this.on('message', callback);
  }

  onNotification(callback) {
    this.on('notification:new', callback);
  }

  onTyping(callback) {
    this.on('typing', callback);
  }

  emitTyping(conversationId) {
    this.emit('typing', { conversationId });
  }

  onUserStatus(callback) {
    this.on('user_status', callback);
  }

  onConversationUpdate(callback) {
    this.on('conversation:updated', callback);
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService();

