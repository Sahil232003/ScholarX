import {
  StoredAccount,
  MentorClass,
  EnrollmentRequest,
  Assessment,
  MinedPYQ,
  Institution,
  BroadcastItem,
  GlobalNoticeItem,
  RoleCapabilitiesConfig
} from '../models';

export const INITIAL_ACCOUNTS: StoredAccount[] = [
  {
    id: 'usr-student-001',
    name: 'Rahul Sharma',
    email: 'student@apex.edu',
    role: 'STUDENT',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rahul',
    institution: 'Apex Institute of Technology',
    department: 'Computer Science & Engineering',
    degreeProgram: 'B.Tech Computer Science & AI',
    rollNumber: '20230121',
    yearSemester: 'Year 3 / Sem 6',
    createdAt: '2026-01-10',
    passwordHash: 'student123'
  },
  {
    id: 'usr-mentor-001',
    name: 'Prof. Aris Thorne',
    email: 'mentor@apex.edu',
    role: 'MENTOR',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ProfAris',
    institution: 'Apex Institute of Technology',
    department: 'Computer Science & AI',
    academicTitle: 'Prof.',
    facultyId: 'SX-M401',
    designation: 'Senior Professor & Viva Mentor',
    teachingSpecialization: ['Distributed Systems', 'Microcontrollers & 8051', 'Operating Systems'],
    isVivaExaminerAuthorized: true,
    createdAt: '2026-01-05',
    passwordHash: 'mentor123'
  },
  {
    id: 'usr-admin-root',
    name: 'ScholarX Root Administrator',
    email: 'admin@scholarx.org',
    role: 'ADMIN',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ScholarAdmin',
    institution: 'ScholarX Governance Council',
    department: 'Central Academic Affairs',
    designation: 'Chief Academic & Platform Controller',
    createdAt: '2026-01-01',
    passwordHash: 'AdminMaster#2026'
  }
];

export const INITIAL_CLASSES: MentorClass[] = [
  {
    id: 'cls-cs601',
    name: 'CS601: Distributed Systems & Consensus Invariants',
    code: 'DIST-SYS-601',
    subject: 'Distributed Systems',
    department: 'Computer Science & AI',
    mentorId: 'usr-mentor-001',
    mentorName: 'Prof. Aris Thorne',
    enrolledCount: 14,
    maxCapacity: 60,
    semester: 'Semester 6',
    academicYear: '2025-2026',
    syllabusUnits: [
      { unitNumber: 1, title: 'Consensus Protocols (Paxos, Raft, Byzantine)', hours: 12 },
      { unitNumber: 2, title: 'CAP & PACELC Invariants in NoSQL Stores', hours: 10 },
      { unitNumber: 3, title: 'Logical Clocks, Vector Clocks & State SMR', hours: 8 }
    ],
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
    createdAt: '2026-01-15'
  },
  {
    id: 'cls-ai402',
    name: 'AI402: Neural Networks & Deep Learning Architectures',
    code: 'NEURAL-AI-402',
    subject: 'Deep Learning',
    department: 'Artificial Intelligence & Data Science',
    mentorId: 'usr-mentor-001',
    mentorName: 'Prof. Aris Thorne',
    enrolledCount: 22,
    maxCapacity: 75,
    semester: 'Semester 8',
    academicYear: '2025-2026',
    syllabusUnits: [
      { unitNumber: 1, title: 'Transformer Multi-Head Attention Mechanisms', hours: 14 },
      { unitNumber: 2, title: 'Diffusion Models & Score-Based Matching', hours: 12 }
    ],
    securityPolicy: {
      strictWindowLockout: true,
      maxTabSwitchesAllowed: 3,
      requireDualCamera: true,
      blockClipboardPaste: true,
      requireMicrophoneContinuous: true,
      noiseThresholdDb: 50,
      faceOrientationToleranceDegrees: 30,
      aiAudioTranscribeActive: true
    },
    createdAt: '2026-01-20'
  }
];

export const INITIAL_ENROLLMENT_REQUESTS: EnrollmentRequest[] = [
  {
    id: 'req-101',
    classId: 'cls-cs601',
    className: 'CS601: Distributed Systems & Consensus Invariants',
    studentId: 'usr-student-001',
    studentName: 'Rahul Sharma',
    studentEmail: 'student@apex.edu',
    studentRollNumber: '20230121',
    department: 'Computer Science & Engineering',
    status: 'APPROVED',
    requestedAt: '2026-01-16T09:30:00Z',
    decidedAt: '2026-01-16T11:00:00Z'
  },
  {
    id: 'req-102',
    classId: 'cls-ai402',
    className: 'AI402: Neural Networks & Deep Learning Architectures',
    studentId: 'usr-student-001',
    studentName: 'Rahul Sharma',
    studentEmail: 'student@apex.edu',
    studentRollNumber: '20230121',
    department: 'Computer Science & Engineering',
    status: 'PENDING',
    requestedAt: '2026-02-01T14:15:00Z'
  }
];

export const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: 'asm-101',
    assessmentType: 'ORAL_VIVA',
    title: 'Mid-Term Oral VIVA: Raft Consensus & CAP Theorem',
    classId: 'cls-cs601',
    type: 'AI_VIVA',
    durationMinutes: 30,
    maxMarks: 25,
    bloomCriteria: {
      REMEMBER: 10,
      UNDERSTAND: 20,
      APPLY: 30,
      ANALYZE: 25,
      EVALUATE: 10,
      CREATE: 5
    },
    status: 'PUBLISHED',
    questions: [
      {
        id: 'q-viva-1',
        text: 'Explain the role of randomized election timeouts in Raft. How does it prevent split-brain votes?',
        marks: 10,
        bloomLevel: 'UNDERSTAND',
        expectedKeyPoints: ['Split-vote resolution', '150ms-300ms random window', 'Leader heartbeat suppression'],
        rubricCriteria: 'Precision in explaining leader heartbeat suppression and candidate state transition'
      },
      {
        id: 'q-viva-2',
        text: 'State the CAP Theorem invariant. Under network partition (P), contrast CP vs AP behavior.',
        marks: 15,
        bloomLevel: 'ANALYZE',
        expectedKeyPoints: ['Network partition inevitability', 'Consistency rejection of writes', 'Availability stale read return'],
        rubricCriteria: 'Clear contrast of Paxos/Raft (CP) vs Dynamo/Cassandra (AP) partition behavior'
      }
    ],
    topicFocus: 'Distributed Consensus & CAP Trade-offs',
    scheduledReleaseTime: '2026-03-01T10:00:00Z',
    acceptanceSummary: {
      totalEnrolled: 14,
      acceptedCount: 11,
      pendingCount: 2,
      deniedCount: 1
    }
  },
  {
    id: 'asm-102',
    assessmentType: 'QUESTION_PAPER',
    title: 'Practice Paper #1: Raft Consensus & CAP Invariants Drill',
    classId: 'cls-cs601',
    type: 'MINED_PYQ',
    durationMinutes: 45,
    maxMarks: 30,
    bloomCriteria: {
      REMEMBER: 10,
      UNDERSTAND: 25,
      APPLY: 35,
      ANALYZE: 20,
      EVALUATE: 10,
      CREATE: 0
    },
    status: 'PUBLISHED',
    scheduledVenue: 'Self-Practice & OCR Archive',
    solutionFormat: 'WITH_SOLUTIONS',
    questions: [
      {
        id: 'q-pyq-16a',
        text: 'Describe the working of an LM35 precision temperature sensor with pinout diagram and calculate its output voltage at 37°C.',
        marks: 10,
        bloomLevel: 'APPLY',
        expectedKeyPoints: ['10mV/°C linear scale factor', 'Pin 1: Vcc, Pin 2: Vout, Pin 3: GND', '370 mV calculation'],
        rubricCriteria: 'Accurate pinout diagram (3M), scale factor proof (3M), numerical output computation (4M)'
      },
      {
        id: 'q-pyq-16b',
        text: 'Explain the internal architecture and H-Bridge pulse-width modulation speed control of a DC Motor with L293D driver IC.',
        marks: 10,
        bloomLevel: 'ANALYZE',
        expectedKeyPoints: ['Bidirectional rotation logic', 'L293D quadruple half-H driver', 'PWM duty cycle relationship with torque'],
        rubricCriteria: 'Schematic logic diagram (4M), PWM duty cycle relationship (3M), truth table (3M)'
      }
    ],
    acceptanceSummary: {
      totalEnrolled: 14,
      acceptedCount: 9,
      pendingCount: 4,
      deniedCount: 1
    },
    studentRosterStatus: [
      {
        studentId: 'usr-student-001',
        studentName: 'Rahul Sharma',
        rollNumber: '20230121',
        status: 'ACCEPTED',
        acceptedAt: '2026-03-02T14:22:00Z',
        scoreAwarded: 28,
        attemptStatus: 'SUBMITTED'
      }
    ]
  }
];

export const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-001',
    name: 'Apex Institute of Technology',
    code: 'AIT-MAIN',
    campusCity: 'Jaipur',
    state: 'Rajasthan',
    affiliatedUniversity: 'Rajasthan Technical University (RTU)',
    accreditationGrade: 'NAAC A++',
    primaryAdminEmail: 'dean.academic@apex.edu',
    enrolledStudentsCount: 2450,
    activeFacultyCount: 142,
    status: 'ACTIVE',
    createdAt: '2025-08-01'
  },
  {
    id: 'inst-002',
    name: 'Horizon Engineering College',
    code: 'HEC-BLR',
    campusCity: 'Bengaluru',
    state: 'Karnataka',
    affiliatedUniversity: 'Visvesvaraya Technological University (VTU)',
    accreditationGrade: 'NBA Tier-1',
    primaryAdminEmail: 'director@horizon.edu.in',
    enrolledStudentsCount: 3100,
    activeFacultyCount: 180,
    status: 'ACTIVE',
    createdAt: '2025-09-12'
  },
  {
    id: 'inst-003',
    name: 'Metro Polytechnic Campus',
    code: 'MPC-MUM',
    campusCity: 'Mumbai',
    state: 'Maharashtra',
    affiliatedUniversity: 'Mumbai University (MU)',
    accreditationGrade: 'NAAC A+',
    primaryAdminEmail: 'principal@metropolypune.ac.in',
    enrolledStudentsCount: 1820,
    activeFacultyCount: 95,
    status: 'ACTIVE',
    createdAt: '2025-10-04'
  },
  {
    id: 'inst-004',
    name: 'Pacific School of Computing',
    code: 'PSC-DEL',
    campusCity: 'New Delhi',
    state: 'Delhi NCR',
    affiliatedUniversity: 'Guru Gobind Singh Indraprastha University (GGSIPU)',
    accreditationGrade: 'NAAC A++',
    primaryAdminEmail: 'provost@pacificcomp.edu',
    enrolledStudentsCount: 4200,
    activeFacultyCount: 210,
    status: 'ACTIVE',
    createdAt: '2025-11-20'
  }
];

export const INITIAL_BROADCASTS: BroadcastItem[] = [
  {
    id: 'bcast-1',
    badge: 'National AI Hackathon 2026',
    badgeColor: 'emerald',
    title: 'Smart India AI & Edge Viva Hackathon 2026',
    deadlineText: 'Submissions Close: April 15, 2026',
    description: 'Build real-time AI agents for proctored viva voice evaluation and automated question paper mining. Top 5 national teams win INR 5,00,000 grant.',
    tags: ['Edge AI', 'Voice Synthesis', 'Computer Vision', 'Generative UI'],
    actionLabel: 'Register Team with Mentor',
    actionUrl: '/student/broadcasts/bcast-1',
    category: 'HACKATHON',
    createdAt: '2026-02-15'
  },
  {
    id: 'bcast-2',
    badge: 'Academic Notice',
    badgeColor: 'amber',
    title: 'University End-Semester Oral VIVA Mandatory Protocols',
    deadlineText: 'Effective: March 1, 2026',
    description: 'All final year engineering students must complete identity pre-check and calibrate audio before joining the oral viva room.',
    tags: ['Regulations', 'Oral VIVA', 'Identity Check'],
    actionLabel: 'View Detailed Guidelines',
    actionUrl: '/student/broadcasts/bcast-2',
    category: 'EXAM_UPDATE',
    createdAt: '2026-02-20'
  }
];

export const INITIAL_GLOBAL_NOTICE: GlobalNoticeItem = {
  id: 'notice-sys-01',
  title: 'Spring Semester 2026 Oral VIVA Window Opened',
  message: 'All enrolled students can now access Question Paper OCR Practice Studio and Scheduled Viva rooms.',
  severity: 'INFO',
  dismissible: true,
  publishedAt: '2026-03-01T08:00:00Z'
};

export const INITIAL_ROLE_CAPABILITIES: RoleCapabilitiesConfig[] = [
  {
    roleKey: 'STUDENT',
    roleName: 'Student Candidate',
    description: 'Enrolled learner attending classrooms, completing OCR paper practice, and participating in live AI viva defenses.',
    capabilities: [
      { capabilityKey: 'JOIN_CLASSROOM_WITH_CODE', name: 'Join Classrooms', description: 'Join mentor classes via unique course code', enabled: true, category: 'CLASSROOM_MANAGEMENT' },
      { capabilityKey: 'EXTRACT_QUESTION_PAPERS', name: 'OCR Question Extraction', description: 'Upload and parse exams into practice drills', enabled: true, category: 'OBE_ANALYTICS' },
      { capabilityKey: 'SUBMIT_PRACTICE_DRILL', name: 'Submit Practice Drills', description: 'Save and submit answers to mentor practice sets', enabled: true, category: 'VIVA_EXAMINATION' },
      { capabilityKey: 'ATTEND_ORAL_VIVA', name: 'Attend Oral VIVA Room', description: 'Stream voice and webcam during oral assessment', enabled: true, category: 'VIVA_EXAMINATION' }
    ]
  },
  {
    roleKey: 'MENTOR',
    roleName: 'Faculty Mentor & Examiner',
    description: 'Academic instructor creating classrooms, authoring question papers, scheduling viva voce exams, and proctoring students.',
    capabilities: [
      { capabilityKey: 'MANAGE_CLASSROOMS', name: 'Create & Manage Classrooms', description: 'Create classes, approve rosters, update syllabi', enabled: true, category: 'CLASSROOM_MANAGEMENT' },
      { capabilityKey: 'PUBLISH_ASSESSMENTS', name: 'Publish Assessments & VIVAs', description: 'Author oral viva rubrics and question papers', enabled: true, category: 'VIVA_EXAMINATION' },
      { capabilityKey: 'EDIT_SECURITY_POLICY', name: 'Configure Security Invariants', description: 'Set lockout rules, tab switch penalties, noise thresholds', enabled: true, category: 'PROCTORING_SECURITY' },
      { capabilityKey: 'LIVE_PROCTOR_OVERRIDE', name: 'Proctor Overrides & Readmission', description: 'Broadcast intercom warnings and readmit terminated students', enabled: true, category: 'PROCTORING_SECURITY' },
      { capabilityKey: 'VIEW_OBE_ANALYTICS', name: 'OBE Analytics & Attainment', description: 'Inspect Bloom taxonomy curves and course outcomes', enabled: true, category: 'OBE_ANALYTICS' }
    ]
  },
  {
    roleKey: 'INSTITUTION_ADMIN',
    roleName: 'Campus Dean / College Administrator',
    description: 'Administers departmental faculties, batch rosters, semester timelines, and accreditation audits for a campus.',
    capabilities: [
      { capabilityKey: 'MANAGE_CAMPUS_FACULTY', name: 'Manage Faculty Roster', description: 'Assign courses and verify teacher credentials', enabled: true, category: 'CLASSROOM_MANAGEMENT' },
      { capabilityKey: 'EXPORT_ACCREDITATION_AUDIT', name: 'Accreditation Reports', description: 'Generate NAAC / NBA / NIRF continuous assessment dossiers', enabled: true, category: 'OBE_ANALYTICS' }
    ]
  },
  {
    roleKey: 'SYSTEM_ADMIN',
    roleName: 'ScholarX Root System Administrator',
    description: 'Full supervisory authority across all multi-campus institutions, core identity databases, and system configuration.',
    capabilities: [
      { capabilityKey: 'MANAGE_ALL_INSTITUTIONS', name: 'Onboard & Govern Institutions', description: 'Activate, suspend, and configure multi-campus universities', enabled: true, category: 'AUTHENTICATION' },
      { capabilityKey: 'GLOBAL_RBAC_OVERRIDE', name: 'Global Role Capability Matrix', description: 'Toggle granular permission switches across all portals', enabled: true, category: 'AUTHENTICATION' },
      { capabilityKey: 'AUDIT_LOG_INSPECTION', name: 'Security Audit Log Inspection', description: 'Inspect full cryptographic audit trails of all sensitive actions', enabled: true, category: 'PROCTORING_SECURITY' }
    ]
  }
];
