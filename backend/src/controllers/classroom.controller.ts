import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { classroomService } from '../services/classroom.service';
import { db } from '../database/mock-db';

export class ClassroomController {
  public async getClasses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const mentorId = req.user?.role === 'MENTOR' ? req.user.id : undefined;
      const classes = await classroomService.getAllClasses(mentorId);
      res.status(200).json(classes);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getClassById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const classId = req.params.id;
      const cls = await classroomService.getClassById(classId);
      if (!cls) {
        res.status(404).json({ success: false, error: 'Classroom not found.' });
        return;
      }
      res.status(200).json(cls);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async lookupClass(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const codeOrId = req.params.codeOrId;
      const normalized = (codeOrId || '').trim().toUpperCase();
      const cls = db.findClassById(codeOrId) || db.findClassByCode(normalized);
      if (!cls) {
        res.status(404).json({ success: false, error: `Classroom not found for "${codeOrId}".` });
        return;
      }
      res.status(200).json({
        success: true,
        classroom: {
          id: cls.id,
          name: cls.name,
          code: cls.code || cls.joinCode,
          joinCode: cls.joinCode || cls.code,
          subjectCode: cls.subjectCode || cls.code || 'CS',
          department: cls.department,
          mentorName: cls.mentorName,
          mentorEmail: cls.mentorEmail,
          semester: cls.semester,
          academicYear: cls.academicYear,
          coverGradient: cls.coverGradient || 'from-indigo-900 to-slate-950'
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createClass(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }
      const newClass = await classroomService.createClass(req.body, req.user);
      res.status(201).json(newClass);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async getClassStudents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const classId = req.params.id;
      const students = await classroomService.getClassStudents(classId);
      res.status(200).json(students);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getEnrollmentRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const classId = req.params.id;
      const requests = await classroomService.getEnrollmentRequests(classId);
      res.status(200).json(requests);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async joinClass(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const classIdOrCode = req.params.id || req.body.classId || req.body.classCode || req.body.code;
      const student = req.user || req.body.student || req.body;
      if (!student || (!student.id && !student.studentId && !student.name && !student.fullName && !student.email)) {
        res.status(400).json({ success: false, error: 'Student details are required to join class.' });
        return;
      }
      const request = await classroomService.joinClass(classIdOrCode, student);
      res.status(200).json({ success: true, request });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async approveEnrollment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const requestId = req.params.id;
      const result = await classroomService.approveEnrollment(requestId);
      res.status(200).json({ success: true, request: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async rejectEnrollment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const requestId = req.params.id;
      const { reason } = req.body;
      const result = await classroomService.rejectEnrollment(requestId, reason);
      res.status(200).json({ success: true, request: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async updateSecurityPolicy(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const classId = req.params.id;
      const updatedPolicy = await classroomService.updateSecurityPolicy(classId, req.body);
      res.status(200).json({ success: true, securityPolicy: updatedPolicy });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async getTerminatedStudents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const classId = req.params.id;
      const list = await classroomService.getTerminatedStudents(classId);
      res.status(200).json(list);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async readmitStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: classId, sid: studentId } = req.params;
      const success = await classroomService.readmitStudent(classId, studentId);
      res.status(200).json({ success });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async logProctorIncident(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const classId = req.params.id;
      const alert = await classroomService.logProctorIncident(classId, req.body);
      res.status(201).json({ success: true, alert });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async getClassProctorAlerts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const classId = req.params.id;
      const alerts = await classroomService.getClassProctorAlerts(classId);
      res.status(200).json(alerts);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async updateStudentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: classId, sid: studentId } = req.params;
      const { status, reason } = req.body;
      const result = await classroomService.updateStudentStatus(classId, studentId, status, reason);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

export const classroomController = new ClassroomController();
