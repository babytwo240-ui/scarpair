"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const envFileLocal = path_1.default.resolve(__dirname, '../.env.local');
dotenv_1.default.config({ path: fs_1.default.existsSync(envFileLocal) ? envFileLocal : path_1.default.resolve(__dirname, '../.env') });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const compression_1 = __importDefault(require("compression"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const morganConfig_1 = __importDefault(require("./config/morganConfig"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const materialRoutes_1 = __importDefault(require("./routes/materialRoutes"));
const wastePostRoutes_1 = __importDefault(require("./routes/wastePostRoutes"));
const collectionRoutes_1 = __importDefault(require("./routes/collectionRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const conversationRoutes_1 = __importDefault(require("./routes/conversationRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const imageRoutes_1 = __importDefault(require("./routes/imageRoutes"));
const postMessageRoutes_1 = __importDefault(require("./routes/postMessageRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const feedbackRoutes_1 = __importDefault(require("./routes/feedbackRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const ratingRoutes_1 = __importDefault(require("./routes/ratingRoutes"));
const redisHealth_1 = require("./config/redisHealth");
const socketService_1 = require("./services/socketService");
const aws_1 = require("./config/aws");
const pickupDeadlineService_1 = require("./services/pickupDeadlineService");
const models_1 = require("./models");
const cacheService_1 = __importDefault(require("./services/cacheService"));
const logger = process.env.NODE_ENV === 'production'
    ? require('./config/logger.prod').default
    : require('./config/logger.dev').default;
const validateEnvironment = () => {
    const requiredVars = ['JWT_SECRET'];
    const missingVars = requiredVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
        logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
        process.exit(1);
    }
    const jwtSecret = process.env.JWT_SECRET || '';
    (0, aws_1.validateAwsConfig)();
    logger.info('Environment validation passed');
};
validateEnvironment();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 5000;
logger.info(`🚀 Starting Scrapair Backend Server...`);
logger.info(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`🔧 Port: ${PORT}`);
app.set('trust proxy', 1);
// Add compression middleware early in the chain
app.use((0, compression_1.default)({
    level: 6, // Balance between compression speed and ratio
    threshold: 1024, // Only compress response > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    }
}));
// Parse request bodies EARLY - before any other middleware that might intercept
app.use(express_1.default.json({ limit: '5mb' }));
app.use(express_1.default.urlencoded({ limit: '5mb', extended: true }));
// CORS configuration - use function for safer origin handling
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (same-origin requests, like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (corsOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
}));
app.use((0, helmet_1.default)({
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'ws:', 'wss:'], // Allow WebSocket connections
            mediaSrc: ["'self'"],
            fontSrc: ["'self'"]
        }
    },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: false
    }
}));
app.use(morganConfig_1.default);
logger.info('📝 HTTP request logging enabled');
// Global rate limiter (stricter for production)
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return req.path === '/api/health' || req.path === '/health';
    }
});
app.use('/api/', globalLimiter);
// Cache and response header middleware
app.use((req, res, next) => {
    if (req.method === 'GET') {
        // Cache GET requests in browser for 1 hour
        res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
        res.set('Pragma', 'public');
    }
    else {
        // Don't cache mutations
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
    next();
});
// Response payload size limiter - FIXED to prevent infinite recursion
app.use((req, res, next) => {
    const originalJson = res.json.bind(res);
    let isCheckingSize = false;
    res.json = function (data) {
        // Skip size check if we're already in a size limit error response (prevent recursion)
        if (isCheckingSize || !data) {
            return originalJson.call(this, data);
        }
        isCheckingSize = true;
        try {
            const size = Buffer.byteLength(JSON.stringify(data), 'utf8');
            res.set('X-Response-Size', size.toString());
            // Enforce 1MB max response size
            if (size > 1048576) { // 1MB
                isCheckingSize = false; // Reset before sending error response
                res.status(413);
                return originalJson.call(this, {
                    error: 'Payload too large',
                    message: `Response size ${size} bytes exceeds limit of 1MB`,
                    size,
                    limit: 1048576
                });
            }
        }
        finally {
            isCheckingSize = false;
        }
        return originalJson.call(this, data);
    };
    next();
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (corsOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                console.warn(`Socket.IO denied CORS request from: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    transports: ['websocket'], // WebSocket only - disable polling to reduce HTTP load
    maxHttpBufferSize: 1e6,
    pingInterval: 30000, // Optimized ping interval
    pingTimeout: 15000,
    allowRequest: (req, callback) => {
        // Allow all requests - CORS is handled above
        callback(null, true);
    }
});
// Socket.IO Error Handlers - CRITICAL for production
io.on('error', (error) => {
    logger.error('Socket.IO server error:', error);
});
io.on('connect_error', (error) => {
    logger.error('Socket.IO connection error:', error.message);
});
io.engine.on('connection_error', (error) => {
    logger.error('Socket.IO engine connection error:', error.message);
});
logger.info('🔌 Socket.io server initialized with error handlers');
app.use((req, res, next) => {
    req.io = io;
    next();
});
(0, socketService_1.initializeSocket)(io);
app.use('/api-docs', swagger_ui_express_1.default.serve);
app.get('/api-docs', swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    swaggerOptions: {
        persistAuthorization: true,
        displayOperationId: true
    }
}));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/materials', materialRoutes_1.default);
app.use('/api/waste-posts', wastePostRoutes_1.default);
app.use('/api/collections', collectionRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api/conversations', conversationRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/images', imageRoutes_1.default);
app.use('/api/post-messages', postMessageRoutes_1.default);
app.use('/api/reviews', reviewRoutes_1.default);
app.use('/api/feedback', feedbackRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
app.use('/api/ratings', ratingRoutes_1.default);
const serverStartTime = new Date();
app.get('/api/health', (req, res) => {
    const uptime = new Date().getTime() - serverStartTime.getTime();
    const uptimeSeconds = Math.floor(uptime / 1000);
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const uptimeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const imageUploadEnabled = !!(process.env.SUPABASE_URL &&
        process.env.SUPABASE_ANON_KEY &&
        process.env.SUPABASE_SERVICE_ROLE_KEY);
    // Get cache statistics
    const cacheStats = cacheService_1.default.getCacheStats();
    res.status(200).json({
        status: 'OK',
        server: 'Scrapair Backend API',
        environment: process.env.NODE_ENV || 'development',
        uptime: uptimeFormatted,
        timestamp: new Date().toISOString(),
        cache: {
            hits: cacheStats.hits,
            misses: cacheStats.misses,
            hitRatio: cacheStats.hitRatio + '%'
        },
        features: {
            phase1: 'Waste Posting ',
            phase2: 'Collection ',
            phase3: 'Messaging & Notifications ',
            imageUpload: imageUploadEnabled ? ' Supabase Storage Enabled' : '  Supabase Storage Disabled (configure credentials)'
        },
        version: '1.0.0'
    });
});
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.use((err, req, res, next) => {
    logger.error(`${req.method} ${req.path} - Error: ${err.message}`);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
async function startServer() {
    let redisConnected = false;
    try {
        try {
            logger.info('🔍 Checking Redis connection...');
            await (0, redisHealth_1.checkRedisConnection)();
            redisConnected = true;
            logger.info('✅ Redis connected successfully');
        }
        catch (redisError) {
            logger.warn(`⚠️  Redis connection failed: ${redisError.message}`);
        }
        logger.info('🔍 Connecting to database...');
        await models_1.sequelize.authenticate();
        logger.info('✅ Database connected successfully');
        server.listen(PORT, () => {
            const baseUrl = process.env.BACKEND_BASE_URL || `http://localhost:${PORT}`;
            logger.info(`✨ Server running at ${baseUrl}`);
            logger.info(`📚 API Docs available at ${baseUrl}/api-docs`);
            try {
                (0, pickupDeadlineService_1.initializePickupDeadlineChecker)();
                logger.info('⏰ Pickup deadline checker initialized');
            }
            catch (err) {
                logger.error(`Failed to initialize pickup deadline checker: ${err.message}`);
            }
        });
    }
    catch (error) {
        logger.error(`❌ Failed to start server: ${error.message}`);
        process.exit(1);
    }
}
startServer();
// Graceful shutdown handlers - CRITICAL for production
// Register IMMEDIATELY before any async operations to ensure they're always active
let isShuttingDown = false;
const gracefulShutdown = async (signal) => {
    if (isShuttingDown) {
        logger.warn(`⚠️  ${signal} received again, forcing shutdown`);
        process.exit(1);
    }
    isShuttingDown = true;
    logger.info(`\n📍 Received ${signal}, starting graceful shutdown...`);
    // Stop accepting new connections
    server.close((err) => {
        if (err) {
            logger.error('Error during server.close():', err.message);
        }
        logger.info('✅ HTTP server closed');
        try {
            // Close Socket.IO connections gracefully
            io.close();
            logger.info('✅ Socket.IO closed');
        }
        catch (closeErr) {
            logger.error('Error closing Socket.IO:', closeErr?.message);
        }
        // Close database connection (async but don't wait - timeout will handle)
        models_1.sequelize.close().catch((err) => {
            logger.error('Error closing database:', err?.message);
        }).then(() => {
            logger.info('✅ Database connection closed');
            logger.info('🛑 Server shutdown complete');
            process.exit(0);
        });
    });
    // Force shutdown after 30 seconds if graceful shutdown fails
    setTimeout(() => {
        logger.warn('⚠️  Graceful shutdown timeout, forcing exit');
        process.exit(1);
    }, 30000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map