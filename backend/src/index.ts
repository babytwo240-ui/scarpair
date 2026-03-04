import dotenv from 'dotenv';
dotenv.config();
import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import materialRoutes from './routes/materialRoutes';
import wastePostRoutes from './routes/wastePostRoutes';
import collectionRoutes from './routes/collectionRoutes';
import messageRoutes from './routes/messageRoutes';
import conversationRoutes from './routes/conversationRoutes';
import notificationRoutes from './routes/notificationRoutes';
import imageRoutes from './routes/imageRoutes';
import postMessageRoutes from './routes/postMessageRoutes';
import reviewRoutes from './routes/reviewRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import reportRoutes from './routes/reportRoutes';
import ratingRoutes from './routes/ratingRoutes';
import { checkRedisConnection } from './config/redisHealth';
import { initializeSocket } from './services/socketService';
import { validateAwsConfig } from './config/aws';
import { initializePickupDeadlineChecker } from './services/pickupDeadlineService';
import { sequelize } from './models';

const validateEnvironment = (): void => {
  const requiredVars = ['JWT_SECRET'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.error(` Missing critical environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  const jwtSecret = process.env.JWT_SECRET || '';
  if (jwtSecret.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET is less than 32 characters. Use a stronger secret in production.');
  }

  validateAwsConfig();
};

validateEnvironment();

const app: Express = express();
const server = createServer(app); 
const PORT = process.env.PORT || 5000;

// ✅ Trust proxy (needed for Render and other reverse proxies)
app.set('trust proxy', true);

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',');
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// ✅ Security headers
app.use(helmet({
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
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// ✅ Cache control headers for API responses
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    // Never cache API responses
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

const io: SocketIOServer = new SocketIOServer(server, {
  cors: {
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

app.use((req: any, res, next) => {
  req.io = io;
  next();
});

initializeSocket(io);

// ✅ Swagger API Documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/waste-posts', wastePostRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/post-messages', postMessageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ratings', ratingRoutes);
const serverStartTime = new Date();

app.get('/api/health', (req: Request, res: Response) => {
  const uptime = new Date().getTime() - serverStartTime.getTime();
  const uptimeSeconds = Math.floor(uptime / 1000);
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  const uptimeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const imageUploadEnabled = !!(
    process.env.SUPABASE_URL && 
    process.env.SUPABASE_ANON_KEY && 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

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
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(' Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
async function startServer() {
  let redisConnected = false;
  
  try {
    console.log('🔍 Checking Redis connection...');
    try {
      await checkRedisConnection();
      console.log('✅ Redis connected');
      redisConnected = true;
    } catch (redisError) {
      console.warn('⚠️  Redis not available - WebSocket features will be limited');
      console.warn('   Run: docker run -d -p 6379:6379 redis:latest');
    }

    console.log('🔍 Checking database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    server.listen(PORT, () => {
      console.log(`\n╔════════════════════════════════════════════╗`);
      console.log(`║  Scrapair Backend Server Started       ║`);
      console.log(`║  Port: ${PORT}${' '.repeat(45 - PORT.toString().length - 10)}║`);
      console.log(`║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(29)}║`);
      console.log(`║  WebSocket:  ${(redisConnected ? 'Ready' : 'Limited (no Redis)').padEnd(28)}║`);
      console.log(`║  Database:  Ready                        ║`);
      console.log(`║                                            ║`);
      console.log(`║  Endpoints:                                ║`);
      const baseUrl = process.env.BACKEND_BASE_URL || `http://localhost:${PORT}`;
      console.log(`║  • REST: ${baseUrl}/api/*`.padEnd(44) + '║');
      console.log(`╚════════════════════════════════════════════╝\n`);

      console.log('🚀 Initializing background jobs...');
      initializePickupDeadlineChecker();
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
