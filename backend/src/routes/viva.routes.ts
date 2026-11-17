import { Router } from 'express';
import { vivaController } from '../controllers/viva.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/evaluate-speech', authenticate, (req, res) => vivaController.evaluateSpeech(req, res));
router.get('/sessions/:sessionId', authenticate, (req, res) => vivaController.getSession(req, res));
router.post('/sessions/:sessionId/violations', authenticate, (req, res) => vivaController.recordViolation(req, res));

export default router;
