import {
  IntegrityViolation,
  LiveVivaSessionState,
  VivaQuestionEvaluationItem,
  VivaRubricBreakdown
} from '../models';

export class VivaService {
  private activeSessions: Map<string, LiveVivaSessionState> = new Map();

  public evaluateSpokenTranscript(
    questionId: string,
    questionText: string,
    transcript: string
  ): VivaQuestionEvaluationItem {
    const textLower = transcript.toLowerCase();
    let score = 7.0;

    // Check key concepts
    const mentionsRaft = textLower.includes('raft') || textLower.includes('election') || textLower.includes('leader');
    const mentionsTimeout = textLower.includes('timeout') || textLower.includes('random') || textLower.includes('heartbeat');
    const mentionsSplitBrain = textLower.includes('split') || textLower.includes('brain') || textLower.includes('partition');

    if (mentionsRaft) score += 1.0;
    if (mentionsTimeout) score += 1.0;
    if (mentionsSplitBrain) score += 1.0;

    score = Math.min(10.0, Math.max(3.0, score));

    const rubrics: VivaRubricBreakdown = {
      conceptualClarity: score >= 9 ? 9.5 : score >= 7 ? 8.0 : 6.0,
      technicalVocabulary: mentionsTimeout ? 9.0 : 7.0,
      confidenceAndFluency: 8.5,
      edgeCaseHandling: mentionsSplitBrain ? 9.5 : 7.0
    };

    return {
      questionId,
      questionText,
      studentSpokenTranscript: transcript,
      marksAwarded: score,
      maxMarks: 10.0,
      rubricScores: rubrics,
      examinerFeedback:
        score >= 8.5
          ? 'Comprehensive defense. Accurately explained election timeout randomization and split-brain mitigation.'
          : 'Adequate explanation. Advise detailing heartbeat intervals and majority vote quorum checks.',
      integrityViolations: []
    };
  }

  public getOrCreateSession(
    sessionId: string,
    assessmentId: string,
    studentId: string,
    studentName: string
  ): LiveVivaSessionState {
    let session = this.activeSessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        assessmentId,
        classId: 'cls-cs601',
        studentId,
        studentName,
        status: 'IN_PROGRESS',
        startTime: new Date().toISOString(),
        currentQuestionIndex: 0,
        evaluations: [],
        cumulativeMarks: 0,
        maxTotalMarks: 25,
        isMicActive: true,
        isCameraActive: true,
        proctorAlertsCount: 0
      };
      this.activeSessions.set(sessionId, session);
    }
    return session;
  }

  public recordViolation(sessionId: string, violation: IntegrityViolation): LiveVivaSessionState | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    session.proctorAlertsCount += 1;
    const currentEval = session.evaluations[session.currentQuestionIndex];
    if (currentEval) {
      currentEval.integrityViolations.push(violation);
    }

    if (session.proctorAlertsCount >= 3) {
      session.status = 'TERMINATED_FOR_INFRACTION';
      session.endTime = new Date().toISOString();
    }

    return session;
  }
}

export const vivaService = new VivaService();
