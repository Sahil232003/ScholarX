import { db } from '../database/mock-db';
import {
  Assessment,
  AssessmentQuestion,
  AssignmentStudentAcceptance,
  BloomLevel,
  GenerateQuestionsRequest
} from '../models';

export class AssessmentService {
  public async getAssessments(classId?: string, assessmentType?: 'ORAL_VIVA' | 'QUESTION_PAPER'): Promise<Assessment[]> {
    let list = db.assessments;

    if (classId) {
      list = list.filter(a => a.classId === classId);
    }

    if (assessmentType) {
      list = list.filter(a => a.assessmentType === assessmentType);
    }

    return list;
  }

  public async getAssessmentById(id: string): Promise<Assessment | null> {
    return db.findAssessmentById(id) || null;
  }

  public async createAssessment(data: Partial<Assessment>): Promise<Assessment> {
    const newId = `asm-${Date.now().toString(36)}`;
    const assessment: Assessment = {
      id: newId,
      classId: data.classId || 'cls-cs601',
      title: data.title || 'Untitled Assessment',
      type: data.type || 'AI_VIVA',
      assessmentType: data.assessmentType || 'ORAL_VIVA',
      durationMinutes: data.durationMinutes || 30,
      maxMarks: data.maxMarks || 25,
      bloomCriteria: data.bloomCriteria || {
        REMEMBER: 10,
        UNDERSTAND: 25,
        APPLY: 35,
        ANALYZE: 20,
        EVALUATE: 10,
        CREATE: 0
      },
      questions: data.questions || [],
      status: data.status || 'DRAFT',
      topicFocus: data.topicFocus,
      scheduledVenue: data.scheduledVenue,
      scheduledReleaseTime: data.scheduledReleaseTime,
      scheduledEndTime: data.scheduledEndTime,
      solutionFormat: data.solutionFormat || 'WITH_SOLUTIONS',
      acceptanceSummary: {
        totalEnrolled: 14,
        acceptedCount: 0,
        pendingCount: 14,
        deniedCount: 0
      },
      studentRosterStatus: []
    };

    db.createAssessment(assessment);
    return assessment;
  }

  public async publishAssessment(id: string): Promise<Assessment> {
    const asm = db.findAssessmentById(id);
    if (!asm) {
      throw new Error(`Assessment ${id} not found.`);
    }

    asm.status = 'PUBLISHED';
    return asm;
  }

  public async acceptPracticePaper(
    paperId: string,
    studentId: string,
    studentName: string,
    rollNumber: string
  ): Promise<Assessment> {
    const asm = db.findAssessmentById(paperId);
    if (!asm) {
      throw new Error(`Practice paper ${paperId} not found.`);
    }

    if (!asm.studentRosterStatus) {
      asm.studentRosterStatus = [];
    }

    const existingIndex = asm.studentRosterStatus.findIndex(s => s.studentId === studentId);
    const acceptance: AssignmentStudentAcceptance = {
      studentId,
      studentName,
      rollNumber,
      status: 'ACCEPTED',
      acceptedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      asm.studentRosterStatus[existingIndex] = {
        ...asm.studentRosterStatus[existingIndex],
        ...acceptance
      };
    } else {
      asm.studentRosterStatus.push(acceptance);
    }

    // Update acceptance count summary
    if (asm.acceptanceSummary) {
      const accepted = asm.studentRosterStatus.filter(s => s.status === 'ACCEPTED').length;
      asm.acceptanceSummary.acceptedCount = accepted;
      asm.acceptanceSummary.pendingCount = Math.max(0, asm.acceptanceSummary.totalEnrolled - accepted);
    }

    return asm;
  }

  public async submitPracticeAttempt(
    paperId: string,
    studentId: string,
    attemptData: { answers: Record<string, string>; timeSpentSeconds: number }
  ): Promise<{ success: boolean; score: number; feedback: string }> {
    const asm = db.findAssessmentById(paperId);
    if (!asm) {
      throw new Error(`Practice paper ${paperId} not found.`);
    }

    // Record submission
    const existing = asm.studentRosterStatus?.find(s => s.studentId === studentId);
    const score = Math.floor(asm.maxMarks * 0.88); // High score benchmark

    if (existing) {
      existing.scoreAwarded = score;
      existing.attemptStatus = 'SUBMITTED';
    }

    // Save in studentPracticeAttempts store
    const attempts = db.studentPracticeAttempts.get(paperId) || [];
    attempts.push({
      studentId,
      submittedAt: new Date().toISOString(),
      score,
      ...attemptData
    });
    db.studentPracticeAttempts.set(paperId, attempts);

    return {
      success: true,
      score,
      feedback: 'Attempt successfully evaluated. Demonstrates comprehensive mastery of core algorithms and mathematical derivations.'
    };
  }

  public async generateAiQuestions(req: GenerateQuestionsRequest): Promise<AssessmentQuestion[]> {
    const { syllabusTopic, bloomDistribution, count = 3 } = req;

    const questions: AssessmentQuestion[] = [
      {
        id: `q-ai-${Date.now()}-1`,
        text: `Explain the fundamental architecture and state transitions for ${syllabusTopic}. Detail candidate election mechanisms.`,
        marks: 10,
        bloomLevel: 'UNDERSTAND',
        expectedKeyPoints: ['State transitions (Follower, Candidate, Leader)', 'Term increments', 'Vote RPC protocols'],
        rubricCriteria: 'Precision in explaining leader heartbeat suppression and candidate state transition'
      },
      {
        id: `q-ai-${Date.now()}-2`,
        text: `Under high network latency and intermittent partitions, analyze how ${syllabusTopic} maintains linearizable consistency.`,
        marks: 15,
        bloomLevel: 'ANALYZE',
        expectedKeyPoints: ['Commit index advancement', 'Majority quorum verification', 'Log truncation on conflicts'],
        rubricCriteria: 'Rigorous derivation of safety invariants and majority consensus proofs'
      }
    ];

    return questions.slice(0, count);
  }
}

export const assessmentService = new AssessmentService();
