import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { connectDB } from './database/connectDB';
import { errorHandler } from './middlewares/error.middleware';
import { initializeSocket } from './socket';
import platformRoutes from './routes/platform.routes';
import webhookRoutes from './routes/webhook.routes';
import profileRoutes from './routes/profile.routes';
import projectRoutes from './routes/project.routes';
import socialRoutes from './routes/social.routes';
import contestRoutes from './routes/contest.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import searchRoutes from './routes/search.routes';
import { startCronJobs } from './cron';
import './workers/profile.worker'; // Start the BullMQ profile worker

// Load env vars
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT && process.env.PORT !== '5000' ? process.env.PORT : 5005;

// Initialize WebSockets
initializeSocket(httpServer);

// BullMQ Workers & Cron Jobs disabled locally (no local Redis)
// Enable in production with: setupWorkers(); setupCleanupWorker(); initCronJobs();

// Connect to Database
connectDB();

// Initialize UPSTASH/Mongo Cron Background Sync
startCronJobs();

// IMPORTANT: Webhook routes must come BEFORE generic express.json()
// because Svix requires the raw buffer to verify the signature.
app.use('/api/webhooks', webhookRoutes);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(helmet());
app.use(morgan('dev'));

// CORS setup for Frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Basic Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Codeyx API is running successfully!' });
});

// Define API Routes here
app.use('/api/platforms', platformRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/search', searchRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server using httpServer instead of app
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Graceful Shutdown to instantly release port 5005 on Windows/Linux
const gracefulShutdown = (signal: string) => {
  console.log(`\nStopping server via ${signal}...`);
  httpServer.close(() => {
    console.log('HTTP server closed. Port 5005 released.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

