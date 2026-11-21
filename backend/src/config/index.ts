import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  wsPort: parseInt(process.env.WS_PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:4200',
  jwtSecret: process.env.JWT_SECRET || 'scholarx_super_secret_jwt_key_2026',
  jwtExpiresIn: '7d',
  adminMasterId: process.env.ADMIN_MASTER_ID || 'admin@scholarx.org',
  adminMasterPass: process.env.ADMIN_MASTER_PASS || 'AdminMaster#2026',
  enableWebSocket: process.env.ENABLE_WEBSOCKET !== 'false',

  // 1. Supabase (Database & Auth - Offline Local Supabase Adapter)
  supabase: {
    mode: process.env.SUPABASE_MODE || 'offline',
    url: process.env.SUPABASE_URL || 'http://127.0.0.1:54321',
    anonKey: process.env.SUPABASE_ANON_KEY || 'sb_publishable_local_offline_key',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_local_offline_key',
    get isOffline(): boolean {
      return this.mode === 'offline' || !this.url || this.url.includes('127.0.0.1') || this.url.includes('localhost');
    },
    get isConfigured(): boolean {
      return true;
    }
  },

  // 2. Cloudflare R2 (Object Storage)
  r2: {
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID || '',
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'scholarx-papers',
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || '',
    get isConfigured(): boolean {
      return Boolean(this.accountId && this.accessKeyId && this.secretAccessKey);
    }
  },

  // 3. LiveKit Cloud (Real-Time Audio/Video Telemetry)
  livekit: {
    url: process.env.LIVEKIT_URL || '',
    apiKey: process.env.LIVEKIT_API_KEY || '',
    apiSecret: process.env.LIVEKIT_API_SECRET || '',
    get isConfigured(): boolean {
      return Boolean(this.url && this.apiKey && this.apiSecret);
    }
  },

  // 4. Redis (Cache & Rate Limiting)
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    get isConfigured(): boolean {
      return Boolean(process.env.REDIS_URL);
    }
  },

  // 5. Firebase Firestore (Classroom Messages & Notices)
  firestore: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    get isConfigured(): boolean {
      return Boolean(this.projectId && (this.clientEmail || process.env.FIRESTORE_EMULATOR_HOST));
    }
  },

  // 6. AI Intelligence
  ai: {
    provider: process.env.AI_MODEL_PROVIDER || 'gemini-1.5-flash',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    get isConfigured(): boolean {
      return Boolean(this.geminiApiKey);
    }
  }
};
