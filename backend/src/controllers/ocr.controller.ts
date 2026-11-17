import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ocrService } from '../services/ocr.service';

export class OcrController {
  public async processDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { fileName, fileType, rawText } = req.body;
      const result = await ocrService.processDocument(
        fileName || 'ExamPaper.pdf',
        fileType || 'application/pdf',
        rawText
      );
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async parseQuestions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { rawText, subject } = req.body;
      if (!rawText) {
        res.status(400).json({ success: false, error: 'Raw text is required for parsing.' });
        return;
      }

      const questions = ocrService.parseAndSegmentQuestions(rawText, subject);
      res.status(200).json({
        success: true,
        extractedCount: questions.length,
        questions
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const ocrController = new OcrController();
