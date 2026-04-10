"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables FIRST, before any other imports
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : (fs_1.default.existsSync(path_1.default.join(__dirname, '..', '.env.local')) ? '.env.local' : '.env');
dotenv_1.default.config({ path: path_1.default.join(__dirname, '..', envFile) });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morganConfig_1 = __importDefault(require("./config/morganConfig"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const models_1 = require("./models");
const NODE_ENV = process.env.NODE_ENV || 'development';
const logger = NODE_ENV === 'production' ? require('./config/logger.prod').default : require('./config/logger.dev').default;
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5498;
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4000,http://127.0.0.1:4000').split(',').map(origin => origin.trim());
app.use((0, cors_1.default)({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));
// Explicit OPTIONS handler for preflight requests
app.options('*', (0, cors_1.default)({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));
app.use(express_1.default.json());
app.use(morganConfig_1.default);
logger.info('🚀 Starting Scrapair Admin Backend Server...');
logger.info(`📋 Environment: ${NODE_ENV}`);
logger.info(`📧 Port: ${PORT}`);
logger.info('📝 HTTP request logging enabled');
app.use('/api/admin', adminRoutes_1.default);
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Admin backend is running' });
});
app.use((req, res) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Route not found' });
});
app.use((err, req, res, next) => {
    logger.error(`${req.method} ${req.path} - Error: ${err.message}`);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(NODE_ENV === 'development' && { stack: err.stack })
    });
});
const serverStartTime = Date.now();
async function startServer() {
    try {
        logger.info('🔍 Connecting to database...');
        await models_1.sequelize.authenticate();
        logger.info('✅ Database connected successfully');
    }
    catch (error) {
        logger.error(`❌ Database connection failed: ${error.message}`);
        if (NODE_ENV === 'development') {
            logger.error(`Error details: ${JSON.stringify(error, null, 2)}`);
            logger.error(error);
        }
        process.exit(1);
    }
    const server = app.listen(PORT, () => {
        const baseUrl = process.env.ADMIN_BACKEND_BASE_URL || `http://localhost:${PORT}`;
        logger.info(`✨ Admin server running at ${baseUrl}`);
        logger.info(`📚 API available at ${baseUrl}/api/admin`);
    });
    server.on('error', (err) => {
        logger.error(`Server error: ${err.message}`, err);
    });
}
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map