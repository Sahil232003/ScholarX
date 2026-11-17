export interface ClassSecurityPolicy {
  strictWindowLockout: boolean;
  maxTabSwitchesAllowed: number;
  requireDualCamera: boolean;
  blockClipboardPaste: boolean;
  requireMicrophoneContinuous: boolean;
  noiseThresholdDb: number;
  faceOrientationToleranceDegrees: number;
  aiAudioTranscribeActive: boolean;
}

export interface MentorClass {
  id: string;
  name: string;
  code?: string;
  subjectCode?: string;
  subject?: string;
  department: string;
  semester: number | string;
  academicYear: string;
  mentorId: string;
  mentorName: string;
  mentorEmail?: string;
  enrolledCount?: number;
  enrolledStudentsCount?: number;
  maxCapacity?: number;
  maxStudentsCapacity?: number;
  activeStatus?: 'ACTIVE' | 'ARCHIVED' | 'UPCOMING';
  joinCode?: string;
  coverGradient?: string;
  createdAt: string;
  syllabusTopics?: string[];
  syllabusUnits?: Array<{ unitNumber: number; title: string; hours: number }>;
  securityPolicy?: ClassSecurityPolicy;
}

export interface CreateClassDto {
  name: string;
  code?: string;
  subjectCode?: string;
  subject?: string;
  department?: string;
  semester?: number | string;
  academicYear?: string;
  maxCapacity?: number;
  maxStudentsCapacity?: number;
  coverGradient?: string;
  syllabusTopics?: string[];
  syllabusUnits?: Array<{ unitNumber: number; title: string; hours: number }>;
}

export interface StudentRosterItem {
  id: string;
  name: string;
  rollNumber?: string;
  email: string;
  attendanceRate: number;
  vivaReadiness: 'READY' | 'PRACTICING' | 'NEEDS_HELP' | 'HIGH' | 'MEDIUM' | 'LOW';
  integrityScore?: number;
  enrolledDate?: string;
  status?: 'ACTIVE' | 'TERMINATED' | 'ON_PROBATION' | string;
  currentProctorStatus?: string;
  lastActive?: string;
}

export interface EnrollmentRequest {
  id: string;
  classId: string;
  className: string;
  subjectCode?: string;
  department?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRoll?: string;
  studentRollNumber?: string;
  requestedAt: string;
  decidedAt?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface TerminatedStudentIncident {
  incidentId?: string;
  classId?: string;
  studentId: string;
  studentName: string;
  studentRoll?: string;
  terminatedAt: string;
  reason: string;
  infractionsCount?: number;
  screenCaptureProofUrl?: string;
  canBeReadmitted?: boolean;
}

export interface ClassProctorAlert {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'TAB_SWITCH' | 'SECONDARY_VOICE' | 'GAZE_DEVIATION' | 'PHONE_DETECTED' | 'MULTIPLE_FACES';
  timestamp: string;
  message: string;
  resolved: boolean;
}
