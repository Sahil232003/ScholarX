import { Router } from 'express';
import { ocrController } from '../controllers/ocr.controller';
import { optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/process-document', optionalAuthenticate, (req, res) => ocrController.processDocument(req, res));
router.post('/parse-questions', optionalAuthenticate, (req, res) => ocrController.parseQuestions(req, res));

export default router;
