import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppServer } from '@mentra/app-api';
import { initializeDatabase } from './database/init';
import authRoutes from './routes/auth';
import glassSessionsRoutes from './routes/glassSessions';
import documentsRoutes from './routes/documents';

dotenv.config();

const PORT = parseInt(process.env.PORT || '8112');
const PACKAGE_NAME = process.env.PACKAGE_NAME || 'com.phonegpt.app';
const MENTRAOS_API_KEY = process.env.MENTRAOS_API_KEY || '';

initializeDatabase();

class PhoneGPTMentraOSApp extends AppServer {
  constructor() {
    super({
      packageName: PACKAGE_NAME,
      apiKey: MENTRAOS_API_KEY,
      port: PORT,
    });

    this.setupExpress();
  }

  private setupExpress() {
    const app = (this as any).app;

    if (!app) {
      console.error('❌ Failed to get Express app from AppServer');
      return;
    }

    app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: '*',
      credentials: true
    }));

    app.use((req: any, res: any, next: any) => {
      if (req.path.startsWith('/api/')) {
        res.set({
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        });
      }
      next();
    });

    app.use(express.json({ limit: '100mb' }));
    app.use(express.urlencoded({ extended: true, limit: '100mb' }));

    app.use('/api/auth', authRoutes);
    app.use('/api/glass-sessions', glassSessionsRoutes);
    app.use('/api/documents', documentsRoutes);

    app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    console.log('✅ Express routes configured');
  }

  public async start() {
    await super.start();

    console.log('\n' + '='.repeat(70));
    console.log('🚀 PHONEGPT SYSTEM STARTED');
    console.log('='.repeat(70));
    console.log(`📱 Port: ${PORT}`);
    console.log(`🔐 Database: phonegpt.db`);
    console.log(`✨ Features: Glass Sessions • Personas • Documents`);
    console.log('='.repeat(70));
    console.log('\n📍 API Endpoints:');
    console.log('   Auth: /api/auth/login, /api/auth/verify');
    console.log('   Glass: /api/glass-sessions (CRUD + conversations)');
    console.log('   Documents: /api/documents (with personas)');
    console.log('\n✅ Ready for connections!\n');
  }
}

const appInstance = new PhoneGPTMentraOSApp();
appInstance.start().catch(console.error);

export default appInstance;
