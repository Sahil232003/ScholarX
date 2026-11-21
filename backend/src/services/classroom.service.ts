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
    const rawClasses = mentorId ? db.classes.filter(c => c.mentorId === mentorId) : db.classes;
    return rawClasses.map(c => ({
      ...c,
      code: c.code || c.joinCode || '',
      joinCode: c.joinCode || c.code || '',
      subjectCode: c.subjectCode || c.code || c.name.substring(0, 5).toUpperCase()
    }));
  }

  public async getClassById(classId: string): Promise<MentorClass | null> {
    const c = db.findClassById(classId);
    if (!c) return null;
    return {
      ...c,
      code: c.code || c.joinCode || '',
      joinCode: c.joinCode || c.code || '',
      subjectCode: c.subjectCode || c.code || c.name.substring(0, 5).toUpperCase()
    };
  }

  public async createClass(dto: CreateClassDto, mentor: AuthUser): Promise<MentorClass> {
    const newId = `cls-${Date.now().toString(36)}`;
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const subjectName = dto.subject || dto.subjectCode || dto.name || 'General';
    const cleanSubjectCode = (dto.subjectCode || dto.code || subjectName.substring(0, 5)).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const generatedCode = dto.code ? dto.code.toUpperCase() : `${cleanSubjectCode.substring(0, 4)}-${randomSuffix}`;

    const newClass: MentorClass = {
      id: newId,
      name: dto.name,
      code: generatedCode,
      joinCode: generatedCode,
      subjectCode: dto.subjectCode || cleanSubjectCode || generatedCode,
      subject: dto.subject || subjectName,
      department: dto.department || mentor.department || 'Computer Science & Engineering',
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorEmail: mentor.email,
      enrolledCount: 0,
      enrolledStudentsCount: 0,
      maxCapacity: dto.maxCapacity || 60,
      semester: dto.semester || 5,
      academicYear: dto.academicYear || '2026-2027',
      coverGradient: dto.coverGradient || 'from-emerald-900 to-teal-950',
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
    const targetClass = db.findClassById(classId) || db.findClassByCode(classId);
    const targetId = targetClass ? targetClass.id : classId;
    const targetCode = targetClass?.joinCode || targetClass?.code || '';

    // Generate roster from approved enrollment requests
    const approvedRequests = db.enrollmentRequests.filter(r => {
      const matchId = r.classId === targetId || r.classId === classId;
      const matchCode = targetCode && ((r as any).classCode === targetCode || (r as any).classCode === targetClass?.code);
      return (matchId || matchCode) && r.status === 'APPROVED';
    });

    const roster: StudentRosterItem[] = approvedRequests.map((req, idx) => ({
      id: req.id || `stu-${req.studentId}`,
      studentId: req.studentId,
      name: req.studentName,
      email: req.studentEmail,
      rollNumber: req.studentRollNumber || '20230121',
      department: req.department || 'Computer Science & Engineering',
      attendanceRate: 92 + (idx % 8),
      vivaReadiness: (idx % 2 === 0 ? 'HIGH' : 'MEDIUM') as 'HIGH' | 'MEDIUM' | 'LOW',
      currentProctorStatus: 'NORMAL',
      lastActive: new Date().toISOString(),
      completedVivasCount: 0,
      status: 'ACTIVE'
    }));

    return roster;
  }

  public async getEnrollmentRequests(classId?: string): Promise<EnrollmentRequest[]> {
    if (!classId) {
      return db.enrollmentRequests.filter(r => r.status === 'PENDING');
    }

    const targetClass = db.findClassById(classId) || db.findClassByCode(classId);
    const targetId = targetClass ? targetClass.id : classId;
    const targetCode = targetClass?.joinCode || targetClass?.code || '';

    return db.enrollmentRequests.filter(r => {
      const matchId = r.classId === targetId || r.classId === classId;
      const matchCode = targetCode && ((r as any).classCode === targetCode || (r as any).classCode === targetClass?.code);
      return (matchId || matchCode) && r.status === 'PENDING';
    });
  }

  public async joinClass(classIdOrCode: string, student: any): Promise<EnrollmentRequest> {
    const normalized = this.extractClassCode(classIdOrCode);
    const targetClass = db.findClassById(classIdOrCode) || db.findClassByCode(normalized) || db.findClassByCode(classIdOrCode);

    if (!targetClass) {
      throw new Error(`Classroom not found for code or ID: "${classIdOrCode}"`);
    }

    const sId = student.id || student.studentId || `usr-student-${Date.now()}`;
    const sEmail = (student.email || '').toLowerCase();
    const sRoll = student.rollNumber || student.studentRollNumber || student.rollNo || sId;
    const sName = student.name || student.fullName || 'Student Scholar';

    // Check if already requested or enrolled
    const existingReq = db.enrollmentRequests.find(
      r => (r.classId === targetClass.id || (r as any).classCode === targetClass.joinCode) &&
           (r.studentId === sId || (sEmail && r.studentEmail.toLowerCase() === sEmail))
    );

    if (existingReq) {
      return existingReq;
    }

    const newRequest: EnrollmentRequest = {
      id: `req-${Date.now()}`,
      classId: targetClass.id,
      className: targetClass.name,
      studentId: sId,
      studentName: sName,
      studentEmail: student.email || `${sId}@scholarx.edu`,
      studentRollNumber: sRoll,
      department: student.department || 'Computer Science & Engineering',
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    };
    (newRequest as any).classCode = targetClass.joinCode || targetClass.code;

    db.enrollmentRequests.push(newRequest);
    db.saveToDisk();
    return newRequest;
  }

  public async approveEnrollment(requestId: string): Promise<EnrollmentRequest> {
    const request = db.findEnrollmentRequestById(requestId);
    if (!request) {
      throw new Error(`Enrollment request ${requestId} not found.`);
    }

    request.status = 'APPROVED';
    request.decidedAt = new Date().toISOString();

    const targetClass = db.findClassById(request.classId) || db.findClassByCode((request as any).classCode);
    if (targetClass) {
      targetClass.enrolledCount = (targetClass.enrolledCount || 0) + 1;
    }

    db.saveToDisk();
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

    db.saveToDisk();
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
