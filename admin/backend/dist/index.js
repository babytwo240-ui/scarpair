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
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5498;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/admin', adminRoutes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Admin backend is running' });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});
// Start server
const server = app.listen(PORT, () => {
    const baseUrl = process.env.ADMIN_BACKEND_BASE_URL || `http://localhost:${PORT}`;
});
// Handle server errors
server.on('error', (err) => {
});
exports.default = app;
//# sourceMappingURL=index.js.map
