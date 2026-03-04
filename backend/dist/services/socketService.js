"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
const redis_1 = __importDefault(require("../config/redis"));
const rateLimiter_1 = require("../middleware/rateLimiter");
const models_1 = require("../models");
const userJwt_1 = require("../config/userJwt");
function initializeSocket(io) {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                console.error('❌ Socket middleware: No token provided');
                return next(new Error('No token provided'));
            }
            const decoded = (0, userJwt_1.verifyUserToken)(token);
            if (!decoded) {
                console.error('❌ Socket middleware: Invalid token');
                return next(new Error('Invalid token'));
            }
            socket.userId = decoded.id;
            socket.userType = decoded.type;
            socket.userName = decoded.businessName || decoded.email;
            console.log(`✅ Socket middleware: Auth passed for user ${socket.userId}`);
            next();
        }
        catch (error) {
            console.error('❌ Socket middleware error:', error);
            next(new Error('Authentication failed'));
        }
    });
    io.on('connection', async (socket) => {
        console.log(`✅ User ${socket.userId} connected (${socket.id})`);
        socket.on('error', (error) => {
            console.error(`⚠️  Socket error for user ${socket.userId}:`, error);
        });
        socket.join(`user:${socket.userId}`);
        console.log(`📍 User ${socket.userId} joined personal room: user:${socket.userId}`);
        try {
            await redis_1.default.hset(`user:${socket.userId}:sockets`, socket.id, new Date().toISOString());
            await redis_1.default.expire(`user:${socket.userId}:sockets`, 30 * 24 * 60 * 60);
            console.log(`📝 Stored socket in Redis for user ${socket.userId}`);
        }
        catch (redisError) {
            console.warn(`⚠️  Redis error storing socket:`, redisError);
        }
        try {
            io.emit('user:online', {
                userId: socket.userId,
                timestamp: new Date()
            });
            console.log(`📢 Broadcasted user online status for user ${socket.userId}`);
        }
        catch (broadcastError) {
            console.warn(`⚠️  Broadcast error:`, broadcastError);
        }
        try {
            await redis_1.default.setex(`user:online:${socket.userId}`, 300, JSON.stringify({
                socketId: socket.id,
                lastSeen: new Date().getTime()
            }));
            console.log(`📍 User ${socket.userId} online status stored in Redis`);
        }
        catch (redisError) {
            console.warn(`⚠️  Redis error storing presence:`, redisError);
        }
        socket.on('error', (error) => {
            console.error(`⚠️  Socket error for user ${socket.userId}:`, error);
        });
        socket.on('conversation:join', async (conversationId) => {
            try {
                const conversation = await models_1.Conversation.findByPk(conversationId);
                if (!conversation) {
                    socket.emit('error', 'Conversation not found');
                    return;
                }
                const isParticipant = conversation.participant1Id === socket.userId ||
                    conversation.participant2Id === socket.userId;
                if (!isParticipant) {
                    socket.emit('error', 'Not authorized to join conversation');
                    return;
                }
                socket.join(`conversation:${conversationId}`);
                console.log(`User ${socket.userId} joined conversation ${conversationId}`);
                io.to(`conversation:${conversationId}`).emit('user:joined', {
                    userId: socket.userId,
                    conversationId
                });
            }
            catch (error) {
                console.error('Join conversation error:', error);
                socket.emit('error', 'Failed to join conversation');
            }
        });
        socket.on('message:typing', async (conversationId) => {
            try {
                const allowed = await rateLimiter_1.RateLimiter.checkLimit(socket.userId.toString(), socket.handshake.address || 'unknown', 'typing');
                if (!allowed) {
                    socket.emit('error', 'Typing rate limit exceeded');
                    return;
                }
                const typingKey = `typing:${conversationId}`;
                await redis_1.default.hset(typingKey, socket.userId.toString(), Date.now().toString());
                await redis_1.default.expire(typingKey, 3);
                socket.to(`conversation:${conversationId}`).emit('user:typing', {
                    userId: socket.userId,
                    userName: socket.userName,
                    conversationId
                });
            }
            catch (error) {
                console.error('Typing indicator error:', error);
            }
        });
        socket.on('message:stop-typing', async (conversationId) => {
            try {
                const typingKey = `typing:${conversationId}`;
                await redis_1.default.hdel(typingKey, socket.userId.toString());
                socket.to(`conversation:${conversationId}`).emit('user:stop-typing', {
                    userId: socket.userId,
                    conversationId
                });
            }
            catch (error) {
                console.error('Stop typing error:', error);
            }
        });
        socket.on('message:send', async (data) => {
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
                const allowed = await rateLimiter_1.RateLimiter.checkLimit(socket.userId.toString(), socket.handshake.address || 'unknown', 'sendMessage');
                if (!allowed) {
                    socket.emit('error', 'Message rate limit exceeded');
                    return;
                }
                const message = await models_1.Message.create({
                    conversationId,
                    senderId: socket.userId,
                    recipientId,
                    content,
                    imageUrl: imageUrl || null
                });
                await models_1.Conversation.update({ lastMessageAt: new Date() }, { where: { id: conversationId } });
                const cacheKey = `conversation:${conversationId}:messages`;
                await redis_1.default.zadd(cacheKey, Date.now(), JSON.stringify(message.toJSON()));
                await redis_1.default.expire(cacheKey, 24 * 60 * 60);
                await models_1.Notification.create({
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
                        id: socket.userId,
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
                await redis_1.default.hdel(`typing:${conversationId}`, socket.userId.toString());
                // Acknowledge
                socket.emit('message:sent', { id: message.id });
            }
            catch (error) {
                console.error('Send message error:', error);
                socket.emit('error', 'Failed to send message');
            }
        });
        socket.on('disconnect', async () => {
            try {
                console.log(`❌ User ${socket.userId} disconnected`);
                await redis_1.default.hdel(`user:${socket.userId}:sockets`, socket.id);
                const remainingSockets = await redis_1.default.hlen(`user:${socket.userId}:sockets`);
                if (remainingSockets === 0) {
                    await redis_1.default.del(`user:online:${socket.userId}`);
                    io.emit('user:offline', {
                        userId: socket.userId,
                        timestamp: new Date()
                    });
                }
            }
            catch (error) {
                console.error('Disconnect error:', error);
            }
        });
    });
    return io;
}
exports.default = initializeSocket;
//# sourceMappingURL=socketService.js.map