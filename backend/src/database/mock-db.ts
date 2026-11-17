import {
  StoredAccount,
  MentorClass,
  EnrollmentRequest,
  Assessment,
  Institution,
  BroadcastItem,
  GlobalNoticeItem,
  RoleCapabilitiesConfig,
  TerminatedStudentIncident,
  ClassProctorAlert
} from '../models';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CLASSES,
  INITIAL_ENROLLMENT_REQUESTS,
  INITIAL_ASSESSMENTS,
  INITIAL_INSTITUTIONS,
  INITIAL_BROADCASTS,
  INITIAL_GLOBAL_NOTICE,
  INITIAL_ROLE_CAPABILITIES
} from './initial-data';

export class MockDatabase {
  private static instance: MockDatabase;

  public accounts: StoredAccount[] = [];
  public classes: MentorClass[] = [];
  public enrollmentRequests: EnrollmentRequest[] = [];
  public assessments: Assessment[] = [];
  public institutions: Institution[] = [];
  public broadcasts: BroadcastItem[] = [];
  public globalNotice: GlobalNoticeItem | null = null;
  public roleCapabilities: RoleCapabilitiesConfig[] = [];
  public proctorIncidents: ClassProctorAlert[] = [];
  public terminatedStudents: TerminatedStudentIncident[] = [];
  public studentPracticeAttempts: Map<string, any[]> = new Map(); // paperId -> attempts

  private constructor() {
    this.reset();
  }

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  public reset(): void {
    this.accounts = JSON.parse(JSON.stringify(INITIAL_ACCOUNTS));
    this.classes = JSON.parse(JSON.stringify(INITIAL_CLASSES));
    this.enrollmentRequests = JSON.parse(JSON.stringify(INITIAL_ENROLLMENT_REQUESTS));
    this.assessments = JSON.parse(JSON.stringify(INITIAL_ASSESSMENTS));
    this.institutions = JSON.parse(JSON.stringify(INITIAL_INSTITUTIONS));
    this.broadcasts = JSON.parse(JSON.stringify(INITIAL_BROADCASTS));
    this.globalNotice = JSON.parse(JSON.stringify(INITIAL_GLOBAL_NOTICE));
    this.roleCapabilities = JSON.parse(JSON.stringify(INITIAL_ROLE_CAPABILITIES));
    this.proctorIncidents = [];
    this.terminatedStudents = [];
    this.studentPracticeAttempts.clear();
  }

  // Account queries
  public findUserByEmail(email: string): StoredAccount | undefined {
    const normalized = email.trim().toLowerCase();
    return this.accounts.find(u => u.email.toLowerCase() === normalized);
  }

  public findUserById(id: string): StoredAccount | undefined {
    return this.accounts.find(u => u.id === id);
  }

  public createAccount(account: StoredAccount): StoredAccount {
    this.accounts.push(account);
    return account;
  }

  // Class queries
  public findClassById(id: string): MentorClass | undefined {
    return this.classes.find(c => c.id === id);
  }

  public findClassByCode(code: string): MentorClass | undefined {
    const normalized = code.trim().toUpperCase();
    return this.classes.find(c => ((c.code || c.subjectCode || '').toUpperCase() === normalized));
  }

  public createClass(cls: MentorClass): MentorClass {
    this.classes.push(cls);
    return cls;
  }

  // Assessment queries
  public findAssessmentById(id: string): Assessment | undefined {
    return this.assessments.find(a => a.id === id);
  }

  public createAssessment(assessment: Assessment): Assessment {
    this.assessments.push(assessment);
    return assessment;
  }

  // Enrollment queries
  public findEnrollmentRequests(classId?: string): EnrollmentRequest[] {
    if (classId) {
      return this.enrollmentRequests.filter(r => r.classId === classId);
    }
    return this.enrollmentRequests;
  }

  public findEnrollmentRequestById(id: string): EnrollmentRequest | undefined {
    return this.enrollmentRequests.find(r => r.id === id);
  }

  // Institution queries
  public findInstitutionById(id: string): Institution | undefined {
    return this.institutions.find(i => i.id === id);
  }

  public createInstitution(inst: Institution): Institution {
    this.institutions.push(inst);
    return inst;
  }
}

export const db = MockDatabase.getInstance();
