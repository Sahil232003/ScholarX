import { Router } from 'express';
import { classroomController } from '../controllers/classroom.controller';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public classroom lookup by joinCode or ID
router.get('/lookup/:codeOrId', (req, res) => classroomController.lookupClass(req, res));

// Classroom list (optional auth so public/student can list available classes) and creation
router.get('/', optionalAuthenticate, (req, res) => classroomController.getClasses(req, res));
router.post('/', authenticate, requireRole('MENTOR', 'ADMIN'), (req, res) => classroomController.createClass(req, res));

// Class by ID and roster
router.get('/:id', authenticate, (req, res) => classroomController.getClassById(req, res));
router.get('/:id/students', authenticate, requireRole('MENTOR', 'ADMIN'), (req, res) => classroomController.getClassStudents(req, res));

// Enrollment requests and joining
router.get('/:id/enrollment-requests', authenticate, requireRole('MENTOR', 'ADMIN'), (req, res) => classroomController.getEnrollmentRequests(req, res));
router.post('/:id/join', authenticate, requireRole('STUDENT'), (req, res) => classroomController.joinClass(req, res));

// Security policy and proctoring
router.put('/:id/security-policy', authenticate, requireRole('MENTOR', 'ADMIN'), (req, res) => classroomController.updateSecurityPolicy(req, res));
router.get('/:id/terminated-students', authenticate, requireRole('MENTOR', 'ADMIN'), (req, res) => classroomController.getTerminatedStudents(req, res));
router.post('/:id/students/:sid/readmit', authenticate, requireRole('MENTOR', 'ADMIN'), (req, res) => classroomController.readmitStudent(req, res));
router.post('/:id/proctor-incidents', authenticate, (req, res) => classroomController.logProctorIncident(req, res));
router.get('/:id/proctor-incidents', authenticate, requireRole('MENTOR', 'ADMIN'), (req, res) => classroomController.getClassProctorAlerts(req, res));
router.put('/:id/students/:sid/status', authenticate, requireRole('MENTOR', 'ADMIN'), (req, res) => classroomController.updateStudentStatus(req, res));

export default router;
