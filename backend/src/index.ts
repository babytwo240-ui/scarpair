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
import morganMiddleware from './config/morganConfig';
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

const logger = process.env.NODE_ENV === 'production'
  ? require('./config/logger.prod').default
  : require('./config/logger.dev').default;

const validateEnvironment = (): void => {
  const requiredVars = ['JWT_SECRET'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  const jwtSecret = process.env.JWT_SECRET || '';

  validateAwsConfig();
  logger.info('Environment validation passed');
};

validateEnvironment();

const app: Express = express();
const server = createServer(app); 
const PORT = process.env.PORT || 5000;

logger.info(`🚀 Starting Scrapair Backend Server...`);
logger.info(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`🔧 Port: ${PORT}`);

app.set('trust proxy', 1);

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',').map(origin => origin.trim());
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

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

app.use(morganMiddleware);
logger.info('📝 HTTP request logging enabled');
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    return req.path === '/api/health' || req.path === '/health';
  }
});
app.use('/api/', globalLimiter);

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const io: SocketIOServer = new SocketIOServer(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      
      if (corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 1e6,
  pingInterval: 25000,
  pingTimeout: 20000,
  allowRequest: (req, callback) => {
    callback(null, true);
  }
});

logger.info('🔌 Socket.io server initialized');

app.use((req: any, res, next) => {
  req.io = io;
  next();
});

initializeSocket(io);
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
      await checkRedisConnection();
      redisConnected = true;
      logger.info('✅ Redis connected successfully');
    } catch (redisError: any) {
      logger.warn(`⚠️  Redis connection failed: ${redisError.message}`);
    }

    logger.info('🔍 Connecting to database...');
    await sequelize.authenticate();
    logger.info('✅ Database connected successfully');

    server.listen(PORT, () => {
      const baseUrl = process.env.BACKEND_BASE_URL || `http://localhost:${PORT}`;
      logger.info(`✨ Server running at ${baseUrl}`);
      logger.info(`📚 API Docs available at ${baseUrl}/api-docs`);
      
      try {
        initializePickupDeadlineChecker();
        logger.info('⏰ Pickup deadline checker initialized');
      } catch (err: any) {
        logger.error(`Failed to initialize pickup deadline checker: ${err.message}`);
      }
    });
  } catch (error: any) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();

export default app;
