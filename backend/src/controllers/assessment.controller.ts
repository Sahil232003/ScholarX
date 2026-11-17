import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { assessmentService } from '../services/assessment.service';

export class AssessmentController {
  public async getAssessments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const classId = req.query.classId as string | undefined;
      const type = req.query.assessmentType as 'ORAL_VIVA' | 'QUESTION_PAPER' | undefined;
      const list = await assessmentService.getAssessments(classId, type);
      res.status(200).json(list);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getAssessmentById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const assessment = await assessmentService.getAssessmentById(req.params.id);
      if (!assessment) {
        res.status(404).json({ success: false, error: 'Assessment not found.' });
        return;
      }
      res.status(200).json(assessment);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createAssessment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const created = await assessmentService.createAssessment(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async publishAssessment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const updated = await assessmentService.publishAssessment(req.params.id);
      res.status(200).json(updated);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async acceptPracticePaper(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }
      const paperId = req.params.id;
      const updated = await assessmentService.acceptPracticePaper(
        paperId,
        req.user.id,
        req.user.name,
        req.user.rollNumber || '20230121'
      );
      res.status(200).json({ success: true, assessment: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async submitPracticeAttempt(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }
      const paperId = req.params.id;
      const result = await assessmentService.submitPracticeAttempt(paperId, req.user.id, req.body);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async generateAiQuestions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const questions = await assessmentService.generateAiQuestions(req.body);
      res.status(200).json({ success: true, questions });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

export const assessmentController = new AssessmentController();
