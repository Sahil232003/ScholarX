-- ScholarX Local Database Schema
CREATE SCHEMA IF NOT EXISTS scholarx;

-- 1. Accounts Table
CREATE TABLE IF NOT EXISTS scholarx.accounts (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(32) NOT NULL,
    avatar_url TEXT,
    institution VARCHAR(255),
    department VARCHAR(255),
    degree_program VARCHAR(255),
    roll_number VARCHAR(64),
    year_semester VARCHAR(64),
    academic_title VARCHAR(32),
    faculty_id VARCHAR(64),
    designation VARCHAR(128),
    teaching_specialization JSONB DEFAULT '[]'::jsonb,
    is_viva_examiner_authorized BOOLEAN DEFAULT false,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Classes Table
CREATE TABLE IF NOT EXISTS scholarx.classes (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    mentor_id VARCHAR(64) REFERENCES scholarx.accounts(id),
    mentor_name VARCHAR(255) NOT NULL,
    enrolled_count INT DEFAULT 0,
    max_capacity INT DEFAULT 60,
    semester VARCHAR(64),
    academic_year VARCHAR(32),
    syllabus_units JSONB DEFAULT '[]'::jsonb,
    security_policy JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enrollment Requests Table
CREATE TABLE IF NOT EXISTS scholarx.enrollment_requests (
    id VARCHAR(64) PRIMARY KEY,
    class_id VARCHAR(64) REFERENCES scholarx.classes(id) ON DELETE CASCADE,
    className VARCHAR(255),
    student_id VARCHAR(64) REFERENCES scholarx.accounts(id),
    student_name VARCHAR(255) NOT NULL,
    student_roll VARCHAR(64),
    email VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING',
    rejection_reason TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- 4. Assessments Table
CREATE TABLE IF NOT EXISTS scholarx.assessments (
    id VARCHAR(64) PRIMARY KEY,
    class_id VARCHAR(64) REFERENCES scholarx.classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(64) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45,
    total_marks INT NOT NULL DEFAULT 100,
    status VARCHAR(32) DEFAULT 'PUBLISHED',
    questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Institutions Table
CREATE TABLE IF NOT EXISTS scholarx.institutions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) UNIQUE NOT NULL,
    state VARCHAR(64),
    city VARCHAR(64),
    type VARCHAR(32),
    active_students_count INT DEFAULT 0,
    active_faculty_count INT DEFAULT 0,
    active_classes_count INT DEFAULT 0,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Broadcasts & Campaigns Table
CREATE TABLE IF NOT EXISTS scholarx.broadcasts (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tagline TEXT,
    description TEXT,
    category VARCHAR(64) NOT NULL,
    target_audience VARCHAR(32) DEFAULT 'ALL',
    active BOOLEAN DEFAULT true,
    sponsor_college VARCHAR(255),
    assigned_mentor_id VARCHAR(64),
    assigned_mentor_name VARCHAR(255),
    requires_registration BOOLEAN DEFAULT false,
    registrations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Proctor Incidents Table
CREATE TABLE IF NOT EXISTS scholarx.proctor_alerts (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_roll VARCHAR(64),
    class_id VARCHAR(64),
    incident_type VARCHAR(64) NOT NULL,
    description TEXT,
    severity VARCHAR(32) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Accounts
INSERT INTO scholarx.accounts (id, name, email, role, avatar_url, institution, department, degree_program, roll_number, year_semester, password_hash)
VALUES 
('usr-student-001', 'Rahul Sharma', 'student@apex.edu', 'STUDENT', 'https://api.dicebear.com/7.x/bottts/svg?seed=Rahul', 'Apex Institute of Technology', 'Computer Science & Engineering', 'B.Tech Computer Science & AI', '20230121', 'Year 3 / Sem 6', 'student123')
ON CONFLICT (id) DO NOTHING;

INSERT INTO scholarx.accounts (id, name, email, role, avatar_url, institution, department, academic_title, faculty_id, designation, teaching_specialization, is_viva_examiner_authorized, password_hash)
VALUES 
('usr-mentor-001', 'Prof. Aris Thorne', 'mentor@apex.edu', 'MENTOR', 'https://api.dicebear.com/7.x/bottts/svg?seed=ProfAris', 'Apex Institute of Technology', 'Computer Science & AI', 'Prof.', 'SX-M401', 'Senior Professor & Viva Mentor', '["Distributed Systems", "Microcontrollers & 8051", "Operating Systems"]'::jsonb, true, 'mentor123')
ON CONFLICT (id) DO NOTHING;

INSERT INTO scholarx.accounts (id, name, email, role, avatar_url, institution, department, designation, password_hash)
VALUES 
('usr-admin-root', 'ScholarX Root Administrator', 'admin@scholarx.org', 'ADMIN', 'https://api.dicebear.com/7.x/bottts/svg?seed=ScholarAdmin', 'ScholarX Governance Council', 'Central Academic Affairs', 'Chief Academic & Platform Controller', 'AdminMaster#2026')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Classes
INSERT INTO scholarx.classes (id, name, code, subject, department, mentor_id, mentor_name, enrolled_count, max_capacity, semester, academic_year, syllabus_units, security_policy)
VALUES
('cls-cs601', 'CS601: Distributed Systems & Consensus Invariants', 'DIST-SYS-601', 'Distributed Systems', 'Computer Science & AI', 'usr-mentor-001', 'Prof. Aris Thorne', 14, 60, 'Semester 6', '2025-2026',
 '[{"unitNumber": 1, "title": "Consensus Protocols (Paxos, Raft, Byzantine)", "hours": 12}, {"unitNumber": 2, "title": "CAP & PACELC Invariants in NoSQL Stores", "hours": 10}, {"unitNumber": 3, "title": "Logical Clocks, Vector Clocks & State SMR", "hours": 8}]'::jsonb,
 '{"strictWindowLockout": true, "maxTabSwitchesAllowed": 2, "noiseThresholdDb": 45}'::jsonb),
('cls-ai402', 'AI402: Neural Networks & Deep Learning Architectures', 'NEURAL-AI-402', 'Deep Learning', 'Artificial Intelligence & Data Science', 'usr-mentor-001', 'Prof. Aris Thorne', 22, 75, 'Semester 8', '2025-2026',
 '[{"unitNumber": 1, "title": "Transformers, Self-Attention & Multi-Head Projections", "hours": 14}, {"unitNumber": 2, "title": "Diffusion Models & Generative Adversarial Networks", "hours": 12}]'::jsonb,
 '{"strictWindowLockout": true, "maxTabSwitchesAllowed": 3, "noiseThresholdDb": 50}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Institutions
INSERT INTO scholarx.institutions (id, name, code, state, city, type, active_students_count, active_faculty_count, active_classes_count, status)
VALUES
('inst-apex-01', 'Apex Institute of Technology (Main Autonomous Campus)', 'APEX-AIT-01', 'Rajasthan', 'Jaipur', 'AUTONOMOUS_COLLEGE', 2840, 142, 88, 'ACTIVE'),
('inst-rtu-02', 'Rajasthan Technical University Campus', 'RTU-KOTA-02', 'Rajasthan', 'Kota', 'AFFILIATED_UNIVERSITY', 5420, 280, 164, 'ACTIVE'),
('inst-vtu-03', 'Visvesvaraya Technological University Belagavi', 'VTU-BEL-03', 'Karnataka', 'Belagavi', 'STATE_TECHNICAL_UNIVERSITY', 9800, 520, 310, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
