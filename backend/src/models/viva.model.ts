export interface VivaRubricBreakdown {
  conceptualClarity: number; // 0-10
  technicalVocabulary: number; // 0-10
  confidenceAndFluency: number; // 0-10
  edgeCaseHandling: number; // 0-10
}

export interface IntegrityViolation {
  timestamp: string;
  type: 'TAB_SWITCH' | 'SECONDARY_FACE_DETECTED' | 'BACKGROUND_SPEECH' | 'OFF_SCREEN_GAZE' | 'CLIPBOARD_PASTE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  evidenceSnapshotUrl?: string;
  detail: string;
}

export interface VivaQuestionEvaluationItem {
  questionId: string;
  questionText: string;
  studentSpokenTranscript: string;
  marksAwarded: number;
  maxMarks: number;
  rubricScores: VivaRubricBreakdown;
  examinerFeedback: string;
  integrityViolations: IntegrityViolation[];
}

export interface LiveVivaSessionState {
  sessionId: string;
  assessmentId: string;
  classId: string;
  studentId: string;
  studentName: string;
  status: 'PENDING_IDENTITY_CHECK' | 'IN_PROGRESS' | 'COMPLETED' | 'TERMINATED_FOR_INFRACTION';
  startTime: string;
  endTime?: string;
  currentQuestionIndex: number;
  evaluations: VivaQuestionEvaluationItem[];
  cumulativeMarks: number;
  maxTotalMarks: number;
  isMicActive: boolean;
  isCameraActive: boolean;
  proctorAlertsCount: number;
}
