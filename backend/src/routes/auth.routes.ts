import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', (req, res) => authController.login(req, res));
router.post('/register/student', (req, res) => authController.registerStudent(req, res));
router.post('/register/mentor', (req, res) => authController.registerMentor(req, res));
router.get('/me', authenticate, (req, res) => authController.getMe(req, res));
router.post('/logout', authenticate, (req, res) => authController.logout(req, res));

export default router;
