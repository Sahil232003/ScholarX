import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { DataProviderInterface } from './data-provider.interface';
import {
  MentorClass,
  CreateClassDto,
  StudentRosterItem,
  EnrollmentRequest,
  Assessment,
  GenerateQuestionsRequest,
  AssessmentQuestion,
  ClassAnalyticsSummary,
  CourseOutcome,
  ProctoringSession,
  AdminUser,
  Institution,
  MentorNotification,
  ChatMessage,
  ChatChannel,
  ClassSecurityPolicy,
  TerminatedStudentIncident,
  ClassProctorAlert
} from '../models';

@Injectable({ providedIn: 'root' })
export class HttpDataProvider implements DataProviderInterface {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api/v1';

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    try {
      token = localStorage.getItem('scholarx_auth_token') || '';
      if (!token) {
        const userJson = localStorage.getItem('scholarx_auth_current_user');
        if (userJson) {
          const user = JSON.parse(userJson);
          token = user.id ? `sx-auth-${user.id}` : '';
        }
      }
    } catch {
      token = '';
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  // --- Classrooms & Enrollment ---
  getMentorClasses(): Observable<MentorClass[]> {
    return this.http.get<MentorClass[]>(`${this.baseUrl}/classes`, { headers: this.getAuthHeaders() }).pipe(
      catchError(err => {
        console.error('Error fetching classes from backend:', err);
        return of([]);
      })
    );
  }

  getClassById(classId: string): Observable<MentorClass> {
    return this.http.get<MentorClass>(`${this.baseUrl}/classes/${classId}`, { headers: this.getAuthHeaders() });
  }

  createClass(dto: CreateClassDto): Observable<MentorClass> {
    return this.http.post<MentorClass>(`${this.baseUrl}/classes`, dto, { headers: this.getAuthHeaders() });
  }

  getClassStudents(classId: string): Observable<StudentRosterItem[]> {
    return this.http.get<StudentRosterItem[]>(`${this.baseUrl}/classes/${classId}/students`, { headers: this.getAuthHeaders() }).pipe(
      map(students => {
        try {
          const reqsRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('viva_enrollment_requests') : null;
          if (reqsRaw) {
            const reqs = JSON.parse(reqsRaw);
            const approved = reqs.filter((r: any) => (r.classId === classId || r.classCode === classId) && r.status === 'APPROVED');
            const studentIds = new Set(students.map(s => s.studentId || s.id));
            approved.forEach((r: any) => {
              if (!studentIds.has(r.studentId)) {
                students.unshift({
                  id: r.id || `stu-${r.studentId}`,
                  studentId: r.studentId,
                  name: r.studentName,
                  email: r.studentEmail,
                  rollNumber: r.studentRollNumber || '20230121',
                  department: r.department || 'Computer Science & Engineering',
                  enrolledAt: r.decidedAt || r.requestedAt || new Date().toISOString(),
                  attendanceRate: 95,
                  vivaReadiness: 'HIGH',
                  currentProctorStatus: 'NORMAL',
                  lastActive: new Date().toISOString(),
                  completedVivasCount: 0,
                  status: 'ACTIVE'
                });
                studentIds.add(r.studentId);
              }
            });
          }
        } catch (e) {}
        return students;
      }),
      catchError(() => of([]))
    );
  }

  getEnrollmentRequests(classId?: string): Observable<EnrollmentRequest[]> {
    const url = classId ? `${this.baseUrl}/classes/${classId}/enrollment-requests` : `${this.baseUrl}/classes/enrollment-requests`;
    return this.http.get<EnrollmentRequest[]>(url, { headers: this.getAuthHeaders() }).pipe(
      map(serverRequests => {
        try {
          const reqsRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('viva_enrollment_requests') : null;
          if (reqsRaw) {
            const reqs = JSON.parse(reqsRaw);
            const existingIds = new Set(serverRequests.map(r => r.id));
            reqs.forEach((r: any) => {
              const matchesClass = !classId || r.classId === classId || r.classCode === classId;
              const isPending = !r.status || r.status === 'PENDING';
              if (matchesClass && isPending && !existingIds.has(r.id)) {
                serverRequests.unshift({
                  id: r.id,
                  classId: r.classId,
                  className: r.className,
                  studentId: r.studentId,
                  studentName: r.studentName,
                  studentEmail: r.studentEmail,
                  studentRollNumber: r.studentRollNumber || r.studentId || '20230121',
                  department: r.department || 'Computer Science & Engineering',
                  status: 'PENDING',
                  requestedAt: r.requestedAt || 'Just now'
                });
                existingIds.add(r.id);
              }
            });
          }
        } catch (e) {}
        return serverRequests;
      }),
      catchError(() => {
        try {
          const reqsRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('viva_enrollment_requests') : null;
          if (reqsRaw) {
            const reqs = JSON.parse(reqsRaw);
            return of(reqs.filter((r: any) => (!classId || r.classId === classId || r.classCode === classId) && (!r.status || r.status === 'PENDING')));
          }
        } catch (e) {}
        return of([]);
      })
    );
  }

  approveEnrollment(requestId: string): Observable<{ success: boolean; status: string }> {
    try {
      if (typeof localStorage !== 'undefined') {
        const reqsRaw = localStorage.getItem('viva_enrollment_requests');
        if (reqsRaw) {
          const reqs = JSON.parse(reqsRaw);
          const req = reqs.find((r: any) => r.id === requestId);
          if (req) {
            req.status = 'APPROVED';
            req.decidedAt = new Date().toISOString();
            localStorage.setItem('viva_enrollment_requests', JSON.stringify(reqs));
          }
        }
      }
    } catch (e) {}

    return this.http.post<any>(`${this.baseUrl}/enrollment-requests/${requestId}/approve`, {}, { headers: this.getAuthHeaders() }).pipe(
      map(res => ({ success: res.success !== false, status: 'APPROVED' })),
      catchError(() => of({ success: true, status: 'APPROVED' }))
    );
  }

  rejectEnrollment(requestId: string, reason?: string): Observable<{ success: boolean }> {
    try {
      if (typeof localStorage !== 'undefined') {
        const reqsRaw = localStorage.getItem('viva_enrollment_requests');
        if (reqsRaw) {
          const reqs = JSON.parse(reqsRaw);
          const req = reqs.find((r: any) => r.id === requestId);
          if (req) {
            req.status = 'REJECTED';
            req.decidedAt = new Date().toISOString();
            req.rejectionReason = reason;
            localStorage.setItem('viva_enrollment_requests', JSON.stringify(reqs));
          }
        }
      }
    } catch (e) {}

    return this.http.post<any>(`${this.baseUrl}/enrollment-requests/${requestId}/reject`, { reason }, { headers: this.getAuthHeaders() }).pipe(
      map(res => ({ success: res.success !== false })),
      catchError(() => of({ success: true }))
    );
  }

  updateStudentStatus(classId: string, studentId: string, status: string, reason?: string): Observable<{ success: boolean; newStatus: string }> {
    return this.http.put<{ success: boolean; newStatus: string }>(
      `${this.baseUrl}/classes/${classId}/students/${studentId}/status`,
      { status, reason },
      { headers: this.getAuthHeaders() }
    );
  }

  // --- Class Security Policy & Proctoring Controls ---
  updateClassSecurityPolicy(classId: string, policy: ClassSecurityPolicy): Observable<{ success: boolean; policy: ClassSecurityPolicy }> {
    return this.http.put<any>(`${this.baseUrl}/classes/${classId}/security-policy`, policy, { headers: this.getAuthHeaders() }).pipe(
      map(res => ({ success: true, policy: res.securityPolicy || policy }))
    );
  }

  getTerminatedStudents(classId: string): Observable<TerminatedStudentIncident[]> {
    return this.http.get<TerminatedStudentIncident[]>(`${this.baseUrl}/classes/${classId}/terminated-students`, { headers: this.getAuthHeaders() }).pipe(
      catchError(() => of([]))
    );
  }

  readmitTerminatedStudent(classId: string, studentId: string): Observable<{ success: boolean }> {
    return this.http.post<any>(`${this.baseUrl}/classes/${classId}/students/${studentId}/readmit`, {}, { headers: this.getAuthHeaders() }).pipe(
      map(res => ({ success: res.success !== false }))
    );
  }

  logClassProctorIncident(incident: ClassProctorAlert): Observable<{ success: boolean }> {
    return this.http.post<any>(`${this.baseUrl}/classes/${incident.classId}/proctor-incidents`, incident, { headers: this.getAuthHeaders() }).pipe(
      map(res => ({ success: res.success !== false }))
    );
  }

  getClassProctorAlerts(classId: string): Observable<ClassProctorAlert[]> {
    return this.http.get<ClassProctorAlert[]>(`${this.baseUrl}/classes/${classId}/proctor-incidents`, { headers: this.getAuthHeaders() }).pipe(
      catchError(() => of([]))
    );
  }

  // --- Assessments & AI Generator ---
  getAssessments(classId?: string): Observable<Assessment[]> {
    const url = classId ? `${this.baseUrl}/assessments?classId=${classId}` : `${this.baseUrl}/assessments`;
    return this.http.get<Assessment[]>(url, { headers: this.getAuthHeaders() }).pipe(
      catchError(() => of([]))
    );
  }

  getAssessmentById(id: string): Observable<Assessment> {
    return this.http.get<Assessment>(`${this.baseUrl}/assessments/${id}`, { headers: this.getAuthHeaders() });
  }

  createAssessment(assessment: Assessment): Observable<Assessment> {
    return this.http.post<Assessment>(`${this.baseUrl}/assessments`, assessment, { headers: this.getAuthHeaders() });
  }

  generateAiQuestions(params: GenerateQuestionsRequest): Observable<AssessmentQuestion[]> {
    return this.http.post<any>(`${this.baseUrl}/assessments/generate-ai`, params, { headers: this.getAuthHeaders() }).pipe(
      map(res => res.questions || [])
    );
  }

  regenerateSingleQuestion(questionId: string, instruction?: string): Observable<AssessmentQuestion> {
    return of({
      id: questionId,
      questionText: instruction ? `Refined question based on: ${instruction}` : 'Explain the primary differences between Paxos and Raft consensus protocols under high churn.',
      marks: 10,
      bloomLevel: 'ANALYZE',
      targetCO: 'CO3',
      expectedKeyPoints: ['State transitions', 'Churn tolerance', 'Heartbeat timeouts'],
      rubricCriteria: 'Precision in explaining leader heartbeat suppression and candidate state transition'
    } as unknown as AssessmentQuestion);
  }

  publishAssessment(assessmentId: string): Observable<{ success: boolean; publishedAt: string }> {
    return this.http.post<any>(`${this.baseUrl}/assessments/${assessmentId}/publish`, {}, { headers: this.getAuthHeaders() }).pipe(
      map(() => ({ success: true, publishedAt: new Date().toISOString() }))
    );
  }

  // --- OBE Analytics & Reports ---
  getClassAnalytics(classId: string): Observable<ClassAnalyticsSummary> {
    return of({
      classId,
      overallReadinessScore: 84.5,
      totalAssessmentsConducted: 6,
      averageAttendanceRate: 91.2,
      bloomDistribution: {
        REMEMBER: 15,
        UNDERSTAND: 25,
        APPLY: 30,
        ANALYZE: 20,
        EVALUATE: 10,
        CREATE: 0
      },
      attainmentMetrics: {
        co1AttainmentPercentage: 88,
        co2AttainmentPercentage: 82,
        co3AttainmentPercentage: 79,
        co4AttainmentPercentage: 85
      }
    } as unknown as ClassAnalyticsSummary);
  }

  getClassOutcomes(classId: string): Observable<{ cos: CourseOutcome[]; poMapping: Record<string, number> }> {
    return of({
      cos: [
        { id: 'co-1', code: 'CO1', description: 'Analyze fundamental principles of distributed computing and consensus protocols', bloomTarget: 'ANALYZE', weightagePercentage: 35 },
        { id: 'co-2', code: 'CO2', description: 'Evaluate CAP and PACELC trade-offs across modern NoSQL database systems', bloomTarget: 'EVALUATE', weightagePercentage: 35 },
        { id: 'co-3', code: 'CO3', description: 'Implement leader election and state machine replication algorithms', bloomTarget: 'APPLY', weightagePercentage: 30 }
      ],
      poMapping: { PO1: 3, PO2: 3, PO3: 2, PO4: 2, PO5: 1 }
    });
  }

  saveClassOutcomes(classId: string, payload: { cos: CourseOutcome[]; poMapping: Record<string, number> }): Observable<{ success: boolean }> {
    return of({ success: true });
  }

  downloadClassPdfReport(classId: string): Observable<Blob> {
    const dummyBlob = new Blob([`ScholarX Accreditation Report for Class ${classId}\nGenerated: ${new Date().toISOString()}`], { type: 'application/pdf' });
    return of(dummyBlob);
  }

  // --- Proctoring ---
  getActiveProctoringSessions(assessmentId: string): Observable<ProctoringSession[]> {
    return of([]);
  }

  sendIntercomMessage(studentId: string, assessmentId: string, message: string): Observable<{ delivered: boolean; timestamp: string }> {
    return of({ delivered: true, timestamp: new Date().toISOString() });
  }

  // --- Notifications ---
  getNotifications(): Observable<MentorNotification[]> {
    return of([
      {
        id: 'notif-1',
        title: 'New Student Enrollment',
        message: 'Rahul Sharma submitted an enrollment request for CS601.',
        type: 'ENROLLMENT',
        read: false,
        timestamp: new Date().toISOString()
      }
    ] as unknown as MentorNotification[]);
  }

  markNotificationAsRead(id: string): Observable<{ success: boolean }> {
    return of({ success: true });
  }

  markAllNotificationsAsRead(): Observable<{ success: boolean }> {
    return of({ success: true });
  }

  // --- Chat & Communication ---
  getChatChannels(): Observable<ChatChannel[]> {
    return of([
      { id: 'chan-1', name: 'General Classroom Announcement', unreadCount: 0, lastMessage: 'Welcome to Spring 2026 semester' }
    ] as unknown as ChatChannel[]);
  }

  getChannelMessages(channelId: string): Observable<ChatMessage[]> {
    return of([]);
  }

  sendChatMessage(channelId: string, content: string): Observable<ChatMessage> {
    return of({
      id: `msg-${Date.now()}`,
      channelId,
      senderId: 'usr-mentor-001',
      senderName: 'Prof. Aris Thorne',
      content,
      timestamp: new Date().toISOString()
    } as unknown as ChatMessage);
  }

  // --- Admin ---
  getAdminKpis(): Observable<{ totalStudents: number; totalFaculty: number; activeInstitutions: number; activeVivas: number }> {
    return this.http.get<any>(`${this.baseUrl}/admin/kpis`, { headers: this.getAuthHeaders() }).pipe(
      catchError(() => of({ totalStudents: 1420, totalFaculty: 84, activeInstitutions: 4, activeVivas: 18 }))
    );
  }

  getAdminUsers(role?: string): Observable<AdminUser[]> {
    const url = role ? `${this.baseUrl}/admin/users?role=${role}` : `${this.baseUrl}/admin/users`;
    return this.http.get<any[]>(url, { headers: this.getAuthHeaders() }).pipe(
      map(users => users as unknown as AdminUser[]),
      catchError(() => of([]))
    );
  }

  toggleUserStatus(userId: string, status: string): Observable<{ success: boolean }> {
    return this.http.put<any>(`${this.baseUrl}/admin/users/${userId}/status`, { status }, { headers: this.getAuthHeaders() });
  }

  getInstitutions(): Observable<Institution[]> {
    return this.http.get<Institution[]>(`${this.baseUrl}/admin/institutions`, { headers: this.getAuthHeaders() }).pipe(
      catchError(() => of([]))
    );
  }

  onboardInstitution(dto: Partial<Institution>): Observable<Institution> {
    return this.http.post<Institution>(`${this.baseUrl}/admin/institutions`, dto, { headers: this.getAuthHeaders() });
  }
}
