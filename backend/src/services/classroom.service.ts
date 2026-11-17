import { db } from '../database/mock-db';
import {
  AuthUser,
  ClassProctorAlert,
  ClassSecurityPolicy,
  CreateClassDto,
  EnrollmentRequest,
  MentorClass,
  StudentRosterItem,
  TerminatedStudentIncident
} from '../models';

export class ClassroomService {
  /**
   * Helper to normalize class codes, query URLs, or raw strings
   */
  public extractClassCode(input: string): string {
    if (!input) return '';
    const trimmed = input.trim();
    // Check if input is a URL with code parameter
    try {
      if (trimmed.includes('?') && trimmed.startsWith('http')) {
        const url = new URL(trimmed);
        const codeParam = url.searchParams.get('code') || url.searchParams.get('joinCode');
        if (codeParam) return codeParam.toUpperCase().trim();
      }
    } catch {
      // Not a valid URL, continue
    }
    return trimmed.toUpperCase();
  }

  public async getAllClasses(mentorId?: string): Promise<MentorClass[]> {
    if (mentorId) {
      return db.classes.filter(c => c.mentorId === mentorId);
    }
    return db.classes;
  }

  public async getClassById(classId: string): Promise<MentorClass | null> {
    return db.findClassById(classId) || null;
  }

  public async createClass(dto: CreateClassDto, mentor: AuthUser): Promise<MentorClass> {
    const newId = `cls-${Date.now().toString(36)}`;
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const subjectName = dto.subject || dto.subjectCode || dto.name || 'General';
    const generatedCode = dto.code ? dto.code.toUpperCase() : `${subjectName.substring(0, 4).toUpperCase()}-${randomSuffix}`;

    const newClass: MentorClass = {
      id: newId,
      name: dto.name,
      code: generatedCode,
      subject: dto.subject || subjectName,
      department: dto.department || mentor.department || 'Computer Science & Engineering',
      mentorId: mentor.id,
      mentorName: mentor.name,
      enrolledCount: 0,
      maxCapacity: dto.maxCapacity || 60,
      semester: dto.semester || 'Semester 6',
      academicYear: '2025-2026',
      syllabusUnits: dto.syllabusUnits || [],
      securityPolicy: {
        strictWindowLockout: true,
        maxTabSwitchesAllowed: 2,
        requireDualCamera: false,
        blockClipboardPaste: true,
        requireMicrophoneContinuous: true,
        noiseThresholdDb: 45,
        faceOrientationToleranceDegrees: 25,
        aiAudioTranscribeActive: true
      },
      createdAt: new Date().toISOString()
    };

    db.createClass(newClass);
    return newClass;
  }

  public async getClassStudents(classId: string): Promise<StudentRosterItem[]> {
    // Generate roster from approved enrollment requests and sample records
    const approvedRequests = db.enrollmentRequests.filter(r => r.classId === classId && r.status === 'APPROVED');

    const roster: StudentRosterItem[] = approvedRequests.map((req, idx) => ({
      id: req.studentId,
      name: req.studentName,
      email: req.studentEmail,
      rollNumber: req.studentRollNumber,
      attendanceRate: 90 + (idx % 10),
      vivaReadiness: (idx % 2 === 0 ? 'HIGH' : 'MEDIUM') as 'HIGH' | 'MEDIUM' | 'LOW',
      currentProctorStatus: 'NORMAL',
      lastActive: new Date().toISOString()
    }));

    return roster;
  }

  public async getEnrollmentRequests(classId?: string): Promise<EnrollmentRequest[]> {
    return db.findEnrollmentRequests(classId);
  }

  public async joinClass(classIdOrCode: string, student: AuthUser): Promise<EnrollmentRequest> {
    const normalized = this.extractClassCode(classIdOrCode);
    const targetClass = db.findClassById(classIdOrCode) || db.findClassByCode(normalized);

    if (!targetClass) {
      throw new Error(`Classroom not found for code or ID: "${classIdOrCode}"`);
    }

    // Check if already requested or enrolled
    const existingReq = db.enrollmentRequests.find(
      r => r.classId === targetClass.id && r.studentId === student.id
    );

    if (existingReq) {
      return existingReq;
    }

    const newRequest: EnrollmentRequest = {
      id: `req-${Date.now()}`,
      classId: targetClass.id,
      className: targetClass.name,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentRollNumber: student.rollNumber || '20230121',
      department: student.department || 'Computer Science',
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    };

    db.enrollmentRequests.push(newRequest);
    return newRequest;
  }

  public async approveEnrollment(requestId: string): Promise<EnrollmentRequest> {
    const request = db.findEnrollmentRequestById(requestId);
    if (!request) {
      throw new Error(`Enrollment request ${requestId} not found.`);
    }

    request.status = 'APPROVED';
    request.decidedAt = new Date().toISOString();

    const targetClass = db.findClassById(request.classId);
    if (targetClass) {
      targetClass.enrolledCount = (targetClass.enrolledCount || 0) + 1;
    }

    return request;
  }

  public async rejectEnrollment(requestId: string, rejectionReason?: string): Promise<EnrollmentRequest> {
    const request = db.findEnrollmentRequestById(requestId);
    if (!request) {
      throw new Error(`Enrollment request ${requestId} not found.`);
    }

    request.status = 'REJECTED';
    request.rejectionReason = rejectionReason || 'Capacity full or prerequisite not met';
    request.decidedAt = new Date().toISOString();

    return request;
  }

  public async updateSecurityPolicy(classId: string, policy: Partial<ClassSecurityPolicy>): Promise<ClassSecurityPolicy> {
    const targetClass = db.findClassById(classId);
    if (!targetClass) {
      throw new Error(`Classroom ${classId} not found.`);
    }

    const defaultPolicy: ClassSecurityPolicy = {
      strictWindowLockout: true,
      maxTabSwitchesAllowed: 2,
      requireDualCamera: false,
      blockClipboardPaste: true,
      requireMicrophoneContinuous: true,
      noiseThresholdDb: 45,
      faceOrientationToleranceDegrees: 25,
      aiAudioTranscribeActive: true
    };

    targetClass.securityPolicy = {
      ...defaultPolicy,
      ...(targetClass.securityPolicy || {}),
      ...policy
    };

    return targetClass.securityPolicy;
  }

  public async getTerminatedStudents(classId: string): Promise<TerminatedStudentIncident[]> {
    return db.terminatedStudents.filter(t => t.classId === classId);
  }

  public async readmitStudent(classId: string, studentId: string): Promise<boolean> {
    const index = db.terminatedStudents.findIndex(t => t.classId === classId && t.studentId === studentId);
    if (index !== -1) {
      db.terminatedStudents.splice(index, 1);
      return true;
    }
    return false;
  }

  public async logProctorIncident(classId: string, alert: ClassProctorAlert): Promise<ClassProctorAlert> {
    db.proctorIncidents.push(alert);
    return alert;
  }

  public async getClassProctorAlerts(classId: string): Promise<ClassProctorAlert[]> {
    return db.proctorIncidents.filter(p => p.classId === classId);
  }

  public async updateStudentStatus(classId: string, studentId: string, status: string, reason?: string): Promise<{ success: boolean; newStatus: string }> {
    return { success: true, newStatus: status };
  }
}

export const classroomService = new ClassroomService();
