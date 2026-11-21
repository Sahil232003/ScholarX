import http from 'http';
import express from 'express';
import cors from 'cors';
import { config } from './config';
import apiRouter from './routes';
import { errorHandler } from './middleware/error.middleware';
import { socketHandler } from './websocket/socket-handler';

const app = express();

// Enable CORS for all frontends (localhost, 127.0.0.1, Vercel)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'],
    exposedHeaders: ['*']
  })
);
app.options('*', cors());

// Body parsers with support for base64 encoded OCR images & PDF documents
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount Unified API Router under /api/v1
app.use('/api/v1', apiRouter);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'ScholarX Academic Portal Core Backend',
    version: '1.0.0',
    status: 'ACTIVE',
    portals: {
      student: '/student/*',
      mentor: '/mentor/*',
      admin: '/admin/*'
    },
    documentation: 'See BACKEND_CONNECTIONS.md and backend/README.md',
    endpointsBase: '/api/v1'
  });
});

// Global Error Handler
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Crash Prevention & Server Error Handlers
process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Server] Port ${PORT} is already in use. Please terminate the existing process or choose another port.`);
  } else {
    console.error('[Server] HTTP server error:', err);
  }
});

// Attach WebSocket Server on /ws
if (config.enableWebSocket) {
  try {
    socketHandler.init(server);
  } catch (err) {
    console.error('[WebSocket] Initialization error:', err);
  }
}

// Start Server explicitly on 0.0.0.0 (all IPv4 & IPv6 dual-stack interfaces)
const PORT = config.port;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` ScholarX Core Backend Service Started Successfully`);
  console.log(` HTTP REST API:   http://localhost:${PORT}/api/v1`);
  console.log(` WebSocket Bus:   ws://localhost:${PORT}/ws`);
  console.log(` Health Check:    http://localhost:${PORT}/api/v1/health`);
  console.log(` Source Dir:      ${process.cwd()}`);
  console.log(`-------------------------------------------------------`);
  console.log(` Cloud Adapters Status (Dual-Mode):`);
  console.log(`   • DB (Postgres):     ${config.supabase.isConfigured ? '🟢 Supabase Cloud Connected' : '🟡 Local Store (Ready for Supabase Key)'}`);
  console.log(`   • Auth:              ${config.supabase.isConfigured ? '🟢 Supabase Auth Active' : '🟡 Local JWT Store (Ready for Supabase Key)'}`);
  console.log(`   • Cloud Storage:     ${config.r2.isConfigured ? '🟢 Cloudflare R2 Active' : '🟡 Local Disk Storage (Ready for R2 Key)'}`);
  console.log(`   • Real-Time Viva:    ${config.livekit.isConfigured ? '🟢 LiveKit Cloud WebRTC' : '🟡 Local WebSocket Bus (Ready for LiveKit Key)'}`);
  console.log(`   • Cache:             ${config.redis.isConfigured ? '🟢 Redis Engine Configured' : '🟡 Local In-Memory TTL Cache'}`);
  console.log(`   • Messages:          ${config.firestore.isConfigured ? '🟢 Google Firestore Active' : '🟡 Local Real-Time Channel (Ready for Firebase Key)'}`);
  console.log(`=======================================================`);
});

export default server;
