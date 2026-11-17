import { Router } from 'express';
import { assessmentController } from '../controllers/assessment.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, (req, res) => assessmentController.getAssessments(req, res));
router.post('/', authenticate, requireRole('MENTOR', 'ADMIN'), (req, res) => assessmentController.createAssessment(req, res));
router.get('/:id', authenticate, (req, res) => assessmentController.getAssessmentById(req, res));
router.post('/:id/publish', authenticate, requireRole('MENTOR', 'ADMIN'), (req, res) => assessmentController.publishAssessment(req, res));
router.post('/generate-ai', authenticate, requireRole('MENTOR', 'ADMIN'), (req, res) => assessmentController.generateAiQuestions(req, res));

// Practice Paper routes
router.post('/:id/accept', authenticate, requireRole('STUDENT'), (req, res) => assessmentController.acceptPracticePaper(req, res));
router.post('/:id/submit-attempt', authenticate, requireRole('STUDENT'), (req, res) => assessmentController.submitPracticeAttempt(req, res));

export default router;
