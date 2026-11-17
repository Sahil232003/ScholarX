import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { broadcastService } from '../services/broadcast.service';

export class BroadcastController {
  public async getBroadcasts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const items = await broadcastService.getBroadcasts();
      res.status(200).json(items);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async registerStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }
      const broadcastId = req.params.id;
      const success = await broadcastService.registerStudent(broadcastId, req.user.id);
      res.status(200).json({ success, message: 'Registration confirmed with assigned mentor.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async getGlobalNotice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const notice = await broadcastService.getGlobalNotice();
      res.status(200).json(notice);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async dismissGlobalNotice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await broadcastService.dismissGlobalNotice();
      res.status(200).json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const broadcastController = new BroadcastController();
