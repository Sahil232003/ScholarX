export type BloomLevel = 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';

export interface RubricItem {
  criterion: string;
  marks: number;
  description: string;
}

export interface AssessmentQuestion {
  id: string;
  text?: string;
  questionText?: string;
  marks: number;
  bloomLevel: BloomLevel;
  targetCO?: string;
  modelAnswer?: string;
  keyPoints?: string[];
  expectedKeyPoints?: string[];
  rubricCriteria?: string | RubricItem[];
}

export interface AssignmentStudentAcceptance {
  studentId: string;
  studentName: string;
  studentRoll?: string;
  rollNumber?: string;
  status: 'ACCEPTED' | 'PENDING' | 'DENIED';
  respondedAt?: string;
  acceptedAt?: string;
  submissionScore?: number;
  scoreAwarded?: number;
  attemptStatus?: string;
}

export interface Assessment {
  id: string;
  classId: string;
  title: string;
  type: 'AI_VIVA' | 'MCQ' | 'MINED_PYQ' | 'HYBRID';
  assessmentType: 'ORAL_VIVA' | 'QUESTION_PAPER';
  durationMinutes: number;
  maxMarks: number;
  bloomCriteria: Record<string, number>;
  questions: AssessmentQuestion[];
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  createdAt?: string;
  publishedAt?: string;
  // Question Paper Assessment specific metadata
  topicFocus?: string;
  scheduledVenue?: string;
  scheduledReleaseTime?: string;
  scheduledEndTime?: string;
  solutionFormat?: 'WITH_SOLUTIONS' | 'QUESTIONS_ONLY';
  acceptanceSummary?: {
    totalEnrolled: number;
    acceptedCount: number;
    pendingCount: number;
    deniedCount: number;
  };
  studentRosterStatus?: AssignmentStudentAcceptance[];
}

export interface GenerateQuestionsRequest {
  classId?: string;
  topic?: string;
  syllabusTopic?: string;
  count: number;
  bloomLevel?: BloomLevel;
  bloomDistribution?: any;
  targetCO?: string;
  format?: 'DESCRIPTIVE' | 'MCQ' | 'VIVA';
}
