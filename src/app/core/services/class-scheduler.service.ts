import { Injectable, signal, computed } from '@angular/core';
import {
  ClassExamSession,
  ClassStudentVivaSlot,
  ClassScheduleKpis,
  ClassExamType,
  VivaSlotStatus,
  BloomLevel,
  MentorClass
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ClassSchedulerService {

  // Selected State Signals
  readonly selectedClassId = signal<string>('');
  readonly selectedDate = signal<string>('');
  readonly selectedExamType = signal<string>('ALL');
  readonly searchQuery = signal<string>('');
  readonly activeTab = signal<'SESSIONS' | 'STUDENT_SLOTS' | 'HALL_PASSES'>('SESSIONS');
  readonly selectedSlotForModal = signal<ClassStudentVivaSlot | null>(null);

  // Mentor's Assigned Classes
  readonly mentorClasses = signal<MentorClass[]>(this.loadMentorClasses());

  // Master Class Exam & Viva Sessions
  readonly sessions = signal<ClassExamSession[]>(this.loadSessions());

  private loadMentorClasses(): MentorClass[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('viva_mentor_classes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!this.selectedClassId() && parsed[0]?.id) {
            this.selectedClassId.set(parsed[0].id);
          }
          return parsed;
        }
      }
    } catch {}
    return [];
  }

  private loadSessions(): ClassExamSession[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('viva_class_exam_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((s: any) => !['sess-dl-viva-01', 'sess-dl-theory-02', 'sess-ds-viva-01'].includes(s.sessionId));
        }
      }
    } catch {}
    return [];
  }

  // Computed Current Class with Safe Fallback
  readonly currentClass = computed<MentorClass>(() => {
    const cid = this.selectedClassId();
    return this.mentorClasses().find(c => c.id === cid) || this.mentorClasses()[0] || {
      id: '',
      name: 'No Class Selected',
      subjectCode: '',
      department: '',
      semester: 1,
      academicYear: '2026-2027',
      joinCode: '',
      enrolledCount: 0,
      pendingRequestsCount: 0,
      status: 'ACTIVE',
      createdAt: ''
    };
  });

  // Computed Filtered Sessions for the Selected Class
  readonly filteredSessions = computed<ClassExamSession[]>(() => {
    const cid = this.selectedClassId();
    const type = this.selectedExamType();
    const query = this.searchQuery().toLowerCase().trim();

    return this.sessions().filter(s => {
      const matchClass = !cid || s.classId === cid;
      const matchType = type === 'ALL' || s.examType === type;
      const matchQuery = !query ||
        s.title.toLowerCase().includes(query) ||
        s.syllabusUnitFocus?.toLowerCase().includes(query) ||
        s.venueOrChannel?.toLowerCase().includes(query);
      return matchClass && matchType && matchQuery;
    });
  });

  // Computed Filtered Student Viva Slots across the Selected Class
  readonly currentClassStudentSlots = computed<ClassStudentVivaSlot[]>(() => {
    const sessions = this.filteredSessions();
    const allSlots: ClassStudentVivaSlot[] = [];
    for (const sess of sessions) {
      if (sess.studentSlots && sess.studentSlots.length > 0) {
        allSlots.push(...sess.studentSlots);
      }
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return allSlots;

    return allSlots.filter(st =>
      st.studentName.toLowerCase().includes(query) ||
      st.rollNumber.toLowerCase().includes(query) ||
      st.assignedTopic?.toLowerCase().includes(query)
    );
  });

  // Computed Class Schedule KPIs
  readonly classKpis = computed<ClassScheduleKpis>(() => {
    const cls = this.currentClass();
    const classSessions = cls?.id ? this.sessions().filter(s => s.classId === cls.id) : [];
    const allSlots = this.currentClassStudentSlots();

    const evaluated = allSlots.filter(s => s.status === 'EVALUATED').length;
    const totalSlotsCount = allSlots.length;
    const compRate = totalSlotsCount > 0 ? Math.round((evaluated / totalSlotsCount) * 100) : 0;

    return {
      totalScheduledSessions: classSessions.length,
      totalClassStudents: cls ? cls.enrolledCount : 0,
      vivasCompleted: evaluated,
      vivasPending: Math.max(0, totalSlotsCount - evaluated),
      completionRatePercent: compRate,
      nextSessionTime: classSessions.length > 0 ? `${classSessions[0].date} at ${classSessions[0].overallStartTime}` : 'No upcoming sessions'
    };
  });

  // Add New Class Exam / Viva Session
  createClassExamSession(sessionData: {
    title: string;
    examType: ClassExamType;
    mode: 'PHYSICAL_ROOM' | 'VIRTUAL_WEBRTC';
    venueOrChannel: string;
    date: string;
    overallStartTime: string;
    overallEndTime: string;
    syllabusUnitFocus: string;
    targetCourseOutcomes: string[];
    generate1on1Slots: boolean;
  }): ClassExamSession {
    const cls = this.currentClass();
    const sessionId = `sess-${(cls.subjectCode || 'exam').toLowerCase()}-${Date.now().toString().slice(-4)}`;

    let generatedSlots: ClassStudentVivaSlot[] = [];
    if (sessionData.generate1on1Slots) {
      generatedSlots = this.generateSequentialVivaSlots(
        sessionData.overallStartTime,
        sessionData.date,
        sessionData.syllabusUnitFocus,
        cls.id
      );
    }

    const newSession: ClassExamSession = {
      sessionId,
      classId: cls.id,
      className: cls.name,
      courseCode: cls.subjectCode,
      section: cls.name.includes('Sec A') ? 'Section A' : 'Section B',
      academicYear: cls.academicYear,
      semester: cls.semester,
      title: sessionData.title,
      examType: sessionData.examType,
      mode: sessionData.mode,
      venueOrChannel: sessionData.venueOrChannel,
      date: sessionData.date,
      overallStartTime: sessionData.overallStartTime,
      overallEndTime: sessionData.overallEndTime,
      totalStudentsEnrolled: generatedSlots.length > 0 ? generatedSlots.length : cls.enrolledCount,
      evaluatedCount: 0,
      status: 'UPCOMING',
      syllabusUnitFocus: sessionData.syllabusUnitFocus,
      targetCourseOutcomes: sessionData.targetCourseOutcomes,
      studentSlots: generatedSlots,
      hasAiCoPilotEnabled: true
    };

    const updated = [newSession, ...this.sessions()];
    this.sessions.set(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('viva_class_exam_sessions', JSON.stringify(updated));
      } catch {}
    }
    return newSession;
  }

  // Update a Student Slot's Viva Status & Score
  updateSlotEvaluation(sessionId: string, slotId: string, awardedScore: number, feedback: string): void {
    this.sessions.update(prevSessions => {
      const updated = prevSessions.map(sess => {
        if (sess.sessionId !== sessionId) return sess;
        const updatedSlots = sess.studentSlots.map(slot => {
          if (slot.slotId !== slotId) return slot;
          return {
            ...slot,
            status: 'EVALUATED' as VivaSlotStatus,
            awardedScore,
            rubricFeedbackSummary: feedback
          };
        });
        const evalCount = updatedSlots.filter(s => s.status === 'EVALUATED').length;
        return {
          ...sess,
          evaluatedCount: evalCount,
          studentSlots: updatedSlots
        };
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('viva_class_exam_sessions', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  }

  // Helper to generate 15-min sequential viva slots for real enrolled students
  private generateSequentialVivaSlots(startTime: string, date: string, topicFocus: string, classId?: string): ClassStudentVivaSlot[] {
    let students: { id: string; name: string; roll: string; avatar?: string }[] = [];
    if (typeof window !== 'undefined' && classId) {
      try {
        const storedRequests = localStorage.getItem('viva_enrollment_requests');
        if (storedRequests) {
          const reqs = JSON.parse(storedRequests);
          if (Array.isArray(reqs)) {
            students = reqs
              .filter((r: any) => r.classId === classId && r.status === 'APPROVED')
              .map((r: any) => ({
                id: r.studentId,
                name: r.studentName,
                roll: r.studentRollNumber || r.rollNumber || 'STU',
                avatar: r.avatarUrl
              }));
          }
        }
      } catch {}
    }

    if (students.length === 0) {
      return [];
    }

    const [startH, startM] = startTime.split(':').map(Number);
    let currentMinutes = (startH * 60) + (startM || 0);

    return students.map((st, i) => {
      const slotStart = this.minutesToTime(currentMinutes);
      currentMinutes += 15;
      const slotEnd = this.minutesToTime(currentMinutes);

      return {
        slotId: `slot-gen-${Date.now().toString().slice(-4)}-${i + 1}`,
        studentId: st.id,
        studentName: st.name,
        rollNumber: st.roll,
        studentAvatar: st.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(st.name),
        timeSlot: `${slotStart} - ${slotEnd}`,
        startTime: slotStart,
        endTime: slotEnd,
        durationMinutes: 15,
        status: 'SCHEDULED',
        assignedTopic: `${topicFocus} (Subtopic Module #${i + 1})`,
        bloomLevel: (['UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE'][i % 4]) as BloomLevel,
        maxScore: 25,
        meetingLinkOrRoom: 'WebRTC Room Alpha',
        aiCoPilotReady: true
      };
    });
  }

  private minutesToTime(totalMin: number): string {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
}
