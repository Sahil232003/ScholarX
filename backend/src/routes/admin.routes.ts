import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Strict ADMIN role enforcement for all administrative routes
router.use(authenticate, requireRole('ADMIN'));

router.get('/kpis', (req, res) => adminController.getKpis(req, res));
router.get('/users', (req, res) => adminController.getUsers(req, res));
router.put('/users/:id/status', (req, res) => adminController.toggleUserStatus(req, res));
router.get('/institutions', (req, res) => adminController.getInstitutions(req, res));
router.post('/institutions', (req, res) => adminController.createInstitution(req, res));
router.get('/roles/capabilities', (req, res) => adminController.getRoleCapabilities(req, res));
router.patch('/roles/:roleKey/capabilities', (req, res) => adminController.toggleRoleCapability(req, res));

export default router;
