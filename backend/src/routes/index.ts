import { Router } from 'express';
import authRoutes from './auth.routes';
import classroomRoutes from './classroom.routes';
import assessmentRoutes from './assessment.routes';
import ocrRoutes from './ocr.routes';
import vivaRoutes from './viva.routes';
import adminRoutes from './admin.routes';
import broadcastRoutes from './broadcast.routes';
import { classroomController } from '../controllers/classroom.controller';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.middleware';

const apiRouter = Router();

// Mount service domain routers
apiRouter.use('/auth', authRoutes);
apiRouter.use('/classes', classroomRoutes);
apiRouter.use('/assessments', assessmentRoutes);
apiRouter.use('/practice-papers', assessmentRoutes);
apiRouter.use('/ocr', ocrRoutes);
apiRouter.use('/viva', vivaRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/broadcasts', broadcastRoutes);

// Direct enrollment-requests endpoint routes
apiRouter.post(
  '/enrollment-requests/:id/approve',
  optionalAuthenticate,
  (req, res) => classroomController.approveEnrollment(req, res)
);

apiRouter.post(
  '/enrollment-requests/:id/reject',
  optionalAuthenticate,
  (req, res) => classroomController.rejectEnrollment(req, res)
);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    mode: 'OFFLINE_STANDALONE',
    supabase: 'LOCAL_OFFLINE',
    persistence: 'DISK_BACKED',
    service: 'ScholarX Academic Portal Core Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default apiRouter;
