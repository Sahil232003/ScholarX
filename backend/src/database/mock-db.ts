import fs from 'fs';
import path from 'path';
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
  private dbFilePath = path.join(__dirname, '..', '..', 'data', 'offline_db.json');

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

  public saveToDisk(): void {
    try {
      const dir = path.dirname(this.dbFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const state = {
        accounts: this.accounts,
        classes: this.classes,
        enrollmentRequests: this.enrollmentRequests,
        assessments: this.assessments,
        institutions: this.institutions,
        broadcasts: this.broadcasts,
        globalNotice: this.globalNotice,
        roleCapabilities: this.roleCapabilities,
        proctorIncidents: this.proctorIncidents,
        terminatedStudents: this.terminatedStudents,
        savedAt: new Date().toISOString()
      };
      fs.writeFileSync(this.dbFilePath, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[OfflineDB] Error saving to disk:', err);
    }
  }

  public loadFromDisk(): void {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const state = JSON.parse(raw);
        if (Array.isArray(state.accounts)) {
          const savedIds = new Set(state.accounts.map((a: StoredAccount) => a.id));
          const initialMissing = INITIAL_ACCOUNTS.filter(a => !savedIds.has(a.id));
          this.accounts = [...state.accounts, ...initialMissing];
        }
        if (Array.isArray(state.classes)) this.classes = state.classes;
        if (Array.isArray(state.enrollmentRequests)) this.enrollmentRequests = state.enrollmentRequests;
        if (Array.isArray(state.assessments)) this.assessments = state.assessments;
        if (Array.isArray(state.institutions)) this.institutions = state.institutions;
        if (Array.isArray(state.broadcasts)) this.broadcasts = state.broadcasts;
        if (state.globalNotice !== undefined) this.globalNotice = state.globalNotice;
        if (Array.isArray(state.roleCapabilities)) this.roleCapabilities = state.roleCapabilities;
        if (Array.isArray(state.proctorIncidents)) this.proctorIncidents = state.proctorIncidents;
        if (Array.isArray(state.terminatedStudents)) this.terminatedStudents = state.terminatedStudents;
        console.log(`[OfflineDB] Loaded offline state from ${this.dbFilePath} (${this.accounts.length} accounts, ${this.classes.length} classes).`);
      } else {
        this.saveToDisk();
      }
    } catch (err) {
      console.error('[OfflineDB] Error loading from disk:', err);
    }
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

    this.loadFromDisk();
  }

  public persist(): void {
    this.saveToDisk();
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
    this.saveToDisk();
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
    this.saveToDisk();
    return cls;
  }

  // Assessment queries
  public findAssessmentById(id: string): Assessment | undefined {
    return this.assessments.find(a => a.id === id);
  }

  public createAssessment(assessment: Assessment): Assessment {
    this.assessments.push(assessment);
    this.saveToDisk();
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
    this.saveToDisk();
    return inst;
  }
}

export const db = MockDatabase.getInstance();
