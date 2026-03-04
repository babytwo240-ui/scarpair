import { Server as SocketIOServer, Socket } from 'socket.io';
import redisClient from '../config/redis';
import { RateLimiter } from '../middleware/rateLimiter';
import { Message, Conversation, User, Notification } from '../models';
import { verifyUserToken } from '../config/userJwt';

interface CustomSocket extends Socket {
  userId?: number;
  userType?: string;
  userName?: string;
}

export function initializeSocket(io: SocketIOServer) {
  // Middleware to authenticate socket connections
  // Important: In polling mode, token may not be available immediately
  // so we allow connection without token and authenticate on first event
  io.use(async (socket: CustomSocket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      
      // If no token provided, allow connection
      // Authentication will happen on first real event (conversation:join, etc)
      // This is necessary for polling mode on Render
      if (!token) {
        // Mark as unauthenticated but allow connection
        socket.userId = undefined;
        next();
        return;
      }

      const decoded = verifyUserToken(token);
      if (!decoded) {
        return next(new Error('Invalid or expired token'));
      }

      socket.userId = decoded.id;
      socket.userType = decoded.type;
      socket.userName = decoded.businessName || decoded.email;

      next();
    } catch (error: any) {
      // Allow connection to proceed, real auth happens per-event
      next();
    }
  });

  io.on('connection', async (socket: CustomSocket) => {
    // Require authentication for actual operations
    const requireAuth = (cb?: Function) => {
      if (!socket.userId) {
        socket.emit('error', 'Not authenticated. Please login first.');
        if (cb) cb(false);
        return false;
      }
      if (cb) cb(true);
      return true;
    };

    // Only setup online presence if authenticated
    if (socket.userId) {
      try {
        await redisClient.hset(`user:${socket.userId}:sockets`, socket.id, new Date().toISOString());
        await redisClient.expire(`user:${socket.userId}:sockets`, 30 * 24 * 60 * 60);
      } catch (redisError) {
      }

      socket.join(`user:${socket.userId}`);

      try {
        io.emit('user:online', {
          userId: socket.userId!,
          timestamp: new Date()
        });
      } catch (broadcastError) {
      }
      try {
        await redisClient.setex(
          `user:online:${socket.userId}`,
          300, 
          JSON.stringify({
            socketId: socket.id,
            lastSeen: new Date().getTime()
          })
        );
      } catch (redisError) {
      }
    }

    socket.on('error', (error: any) => {
    });

    socket.on('conversation:join', async (conversationId: number) => {
      try {
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
          socket.emit('error', 'Conversation not found');
          return;
        }

        const isParticipant =
          conversation.participant1Id === socket.userId ||
          conversation.participant2Id === socket.userId;

        if (!isParticipant) {
          socket.emit('error', 'Not authorized to join conversation');
          return;
        }

        socket.join(`conversation:${conversationId}`);

        io.to(`conversation:${conversationId}`).emit('user:joined', {
          userId: socket.userId,
          conversationId
        });
      } catch (error) {
        socket.emit('error', 'Failed to join conversation');
      }
    });
    socket.on('message:typing', async (conversationId: number) => {
      try {
        const allowed = await RateLimiter.checkLimit(
          socket.userId!.toString(),
          socket.handshake.address || 'unknown',
          'typing'
        );

        if (!allowed) {
          socket.emit('error', 'Typing rate limit exceeded');
          return;
        }

        const typingKey = `typing:${conversationId}`;
        await redisClient.hset(typingKey, socket.userId!.toString(), Date.now().toString());
        await redisClient.expire(typingKey, 3);

        socket.to(`conversation:${conversationId}`).emit('user:typing', {
          userId: socket.userId,
          userName: socket.userName,
          conversationId
        });
      } catch (error) {
      }
    });
    socket.on('message:stop-typing', async (conversationId: number) => {
      try {
        const typingKey = `typing:${conversationId}`;
        await redisClient.hdel(typingKey, socket.userId!.toString());

        socket.to(`conversation:${conversationId}`).emit('user:stop-typing', {
          userId: socket.userId,
          conversationId
        });
      } catch (error) {
      }
    });

    socket.on('message:send', async (data: any) => {
      try {
        const { conversationId, recipientId, content, imageUrl } = data;

        if (!conversationId || !content) {
          socket.emit('error', 'Missing required fields');
          return;
        }

        if (content.length > 5000) {
          socket.emit('error', 'Message exceeds maximum length');
          return;
        }

        const allowed = await RateLimiter.checkLimit(
          socket.userId!.toString(),
          socket.handshake.address || 'unknown',
          'sendMessage'
        );

        if (!allowed) {
          socket.emit('error', 'Message rate limit exceeded');
          return;
        }

        const message = await Message.create({
          conversationId,
          senderId: socket.userId!,
          recipientId,
          content,
          imageUrl: imageUrl || null
        });

        await Conversation.update(
          { lastMessageAt: new Date() },
          { where: { id: conversationId } }
        );

        const cacheKey = `conversation:${conversationId}:messages`;
        await redisClient.zadd(cacheKey, Date.now(), JSON.stringify(message.toJSON()));
        await redisClient.expire(cacheKey, 24 * 60 * 60);

        await Notification.create({
          userId: recipientId,
          type: 'MESSAGE',
          title: `Message from ${socket.userName}`,
          message: content.substring(0, 100),
          relatedId: message.id
        });

        io.to(`conversation:${conversationId}`).emit('message:received', {
          id: message.id,
          conversationId,
          sender: {
            id: socket.userId!,
            name: socket.userName
          },
          content,
          imageUrl: imageUrl || null,
          createdAt: message.createdAt
        });

        io.to(`user:${recipientId}`).emit('notification:new', {
          type: 'MESSAGE',
          title: `Message from ${socket.userName}`,
          message: content.substring(0, 100),
          relatedId: message.id
        });

        await redisClient.hdel(`typing:${conversationId}`, socket.userId!.toString());

        socket.emit('message:sent', { id: message.id });
      } catch (error) {
        socket.emit('error', 'Failed to send message');
      }
    });

    socket.on('disconnect', async (reason) => {
      try {
        await redisClient.hdel(`user:${socket.userId}:sockets`, socket.id);

        const remainingSockets = await redisClient.hlen(`user:${socket.userId}:sockets`);
        if (remainingSockets === 0) {
          await redisClient.del(`user:online:${socket.userId}`);
          io.emit('user:offline', {
            userId: socket.userId,
            timestamp: new Date()
          });
        }
      } catch (error) {
        // Error handling
      }
    });
  });

  return io;
}

export default initializeSocket;
