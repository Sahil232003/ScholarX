import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { authService } from '../services/auth.service';

export class AuthController {
  public async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      if (!result.success) {
        const status = result.error?.includes('registered as a') ? 403 : 401;
        res.status(status).json(result);
        return;
      }
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async registerStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await authService.registerStudent(req.body);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async registerMentor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await authService.registerMentor(req.body);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }
      res.status(200).json({ success: true, user: req.user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  }
}

export const authController = new AuthController();
