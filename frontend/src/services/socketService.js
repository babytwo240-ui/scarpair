import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket) {
      console.log('🔌 Socket already exists, returning existing connection');
      return this.socket;
    }

    if (!token) {
      console.error('❌ No token provided to Socket.io connect()');
      return null;
    }

    console.log('🔌 Connecting to Socket.io with token:', token.substring(0, 20) + '...');

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected. Reason:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

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

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService();
