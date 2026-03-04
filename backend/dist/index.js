"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
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
const validateEnvironment = () => {
    const requiredVars = ['JWT_SECRET'];
    const missingVars = requiredVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
        process.exit(1);
    }
    const jwtSecret = process.env.JWT_SECRET || '';
    (0, aws_1.validateAwsConfig)();
};
validateEnvironment();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 5000;
// ✅ Trust proxy (needed for Render and other reverse proxies)
app.set('trust proxy', true);
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',');
app.use((0, cors_1.default)({
    origin: corsOrigins,
    credentials: true
}));
// ✅ Security headers
app.use((0, helmet_1.default)({
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        }
    }
}));
// ✅ Global rate limiting (100 requests per 15 minutes)
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', globalLimiter);
// ✅ Cache control headers for API responses
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        // Never cache API responses
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
    next();
});
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
});
app.use((req, res, next) => {
    req.io = io;
    next();
});
(0, socketService_1.initializeSocket)(io);
// ✅ Swagger API Documentation
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
    res.status(200).json({
        status: 'OK',
        server: 'Scrapair Backend API',
        environment: process.env.NODE_ENV || 'development',
        uptime: uptimeFormatted,
        timestamp: new Date().toISOString(),
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
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
async function startServer() {
    let redisConnected = false;
    try {
        try {
            await (0, redisHealth_1.checkRedisConnection)();
            redisConnected = true;
        }
        catch (redisError) {
        }
        await models_1.sequelize.authenticate();
        server.listen(PORT, () => {
            const baseUrl = process.env.BACKEND_BASE_URL || `http://localhost:${PORT}`;
            (0, pickupDeadlineService_1.initializePickupDeadlineChecker)();
        });
    }
    catch (error) {
        process.exit(1);
    }
}
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map