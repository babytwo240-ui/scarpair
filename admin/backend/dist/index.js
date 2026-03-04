"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load the correct .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv_1.default.config({ path: path_1.default.join(__dirname, '..', envFile) });
// Load logger based on environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const logger = NODE_ENV === 'production'
    ? require('./config/logger.prod').default
    : require('./config/logger.dev').default;
// Import Morgan middleware
const morganConfig_1 = __importDefault(require("./config/morganConfig"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5498;
// Parse CORS origins from environment variable
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4000,http://127.0.0.1:4000').split(',').map(origin => origin.trim());
// Middleware
app.use((0, cors_1.default)({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// HTTP request logging
app.use(morganConfig_1.default);
// Log server initialization
logger.info('🚀 Starting Scrapair Admin Backend Server...');
logger.info(`📋 Environment: ${NODE_ENV}`);
logger.info(`📧 Port: ${PORT}`);
logger.info('📝 HTTP request logging enabled');
// Routes
app.use('/api/admin', adminRoutes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Admin backend is running' });
});
// 404 handler
app.use((req, res) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Route not found' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`${req.method} ${req.path} - Error: ${err.message}`);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(NODE_ENV === 'development' && { stack: err.stack })
    });
});
// Start server
const serverStartTime = Date.now();
const server = app.listen(PORT, () => {
    const baseUrl = process.env.ADMIN_BACKEND_BASE_URL || `http://localhost:${PORT}`;
    logger.info(`✨ Admin server running at ${baseUrl}`);
    logger.info(`📚 API available at ${baseUrl}/api/admin`);
});
// Handle server errors
server.on('error', (err) => {
    logger.error(`Server error: ${err.message}`, err);
});
exports.default = app;
//# sourceMappingURL=index.js.map