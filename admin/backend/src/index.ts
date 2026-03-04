import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load the correct .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: path.join(__dirname, '..', envFile) });

import adminRoutes from './routes/adminRoutes';

const app: Express = express();
const PORT = process.env.PORT || 5498;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Admin backend is running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
const server = app.listen(PORT, () => {
  const baseUrl = process.env.ADMIN_BACKEND_BASE_URL || `http://localhost:${PORT}`;
});

// Handle server errors
server.on('error', (err: any) => {
});

export default app;

