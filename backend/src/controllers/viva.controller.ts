import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { vivaService } from '../services/viva.service';

export class VivaController {
  public async evaluateSpeech(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { questionId, questionText, studentTranscript } = req.body;
      if (!questionText || !studentTranscript) {
        res.status(400).json({ success: false, error: 'questionText and studentTranscript are required.' });
        return;
      }

      const evaluation = vivaService.evaluateSpokenTranscript(
        questionId || 'vq-default',
        questionText,
        studentTranscript
      );

      res.status(200).json(evaluation);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;
      const { assessmentId } = req.query;
      const session = vivaService.getOrCreateSession(
        sessionId,
        (assessmentId as string) || 'asm-101',
        req.user?.id || 'usr-student-001',
        req.user?.name || 'Student Candidate'
      );
      res.status(200).json(session);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async recordViolation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;
      const violation = req.body;
      const updated = vivaService.recordViolation(sessionId, violation);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Session not found.' });
        return;
      }
      res.status(200).json({ success: true, session: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const vivaController = new VivaController();
