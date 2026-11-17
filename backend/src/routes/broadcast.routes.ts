import { Router } from 'express';
import { broadcastController } from '../controllers/broadcast.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', (req, res) => broadcastController.getBroadcasts(req, res));
router.get('/notice', (req, res) => broadcastController.getGlobalNotice(req, res));
router.post('/notice/dismiss', authenticate, (req, res) => broadcastController.dismissGlobalNotice(req, res));
router.post('/:id/register', authenticate, (req, res) => broadcastController.registerStudent(req, res));

export default router;
