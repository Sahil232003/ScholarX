import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { adminService } from '../services/admin.service';

export class AdminController {
  public async getKpis(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const kpis = await adminService.getKpiMetrics();
      res.status(200).json(kpis);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const roleFilter = req.query.role as string | undefined;
      const users = await adminService.getUsers(roleFilter);
      res.status(200).json(users);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async toggleUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const { status } = req.body;
      const success = await adminService.toggleUserStatus(userId, status);
      res.status(200).json({ success });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async getInstitutions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutions = await adminService.getInstitutions();
      res.status(200).json(institutions);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createInstitution(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const created = await adminService.createInstitution(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async getRoleCapabilities(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const configs = await adminService.getRoleCapabilities();
      res.status(200).json(configs);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async toggleRoleCapability(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { roleKey } = req.params;
      const { capabilityKey } = req.body;
      const enabled = await adminService.toggleRoleCapability(roleKey, capabilityKey);
      res.status(200).json({ success: true, enabled });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

export const adminController = new AdminController();
