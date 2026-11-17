# ScholarX Core Backend Service

> **Single Source of Truth** for Student, Mentor, and Admin Portals  
> **Architecture**: Node.js + Express + TypeScript + WebSockets (RFC 6455)  
> **Base URL**: `http://localhost:5000/api/v1`  
> **WebSocket Bus**: `ws://localhost:5000/ws`  

---

## 1. Directory Structure

```
backend/
├── .env.example                # Sample environment variables
├── package.json                # Dependencies (express, cors, ws, dotenv, typescript)
├── tsconfig.json               # TypeScript configuration
├── README.md                   # This developer & architectural guide
└── src/
    ├── config/
    │   └── index.ts            # Environment loader with sensible fallbacks
    ├── database/
    │   ├── initial-data.ts     # Pre-seeded users, classes, assessments, institutions
    │   └── mock-db.ts          # In-memory repository with singleton access
    ├── models/
    │   ├── admin.model.ts      # Multi-campus governance, KPIs, institutions, RBAC
    │   ├── assessment.model.ts # ORAL_VIVA vs QUESTION_PAPER, Bloom taxonomy, rubrics
    │   ├── auth.model.ts       # Student/Mentor/Admin user schemas, login/register DTOs
    │   ├── broadcast.model.ts  # Hackathon campaigns and global academic notices
    │   ├── classroom.model.ts  # Classrooms, rosters, join codes, proctor policies
    │   ├── ocr.model.ts        # 7-pillar model solutions, MinedPYQ, OCR confidence
    │   ├── viva.model.ts       # Live viva speech evaluations and integrity violations
    │   └── index.ts            # Central barrel exports
    ├── services/
    │   ├── admin.service.ts    # KPI calculation, institutions, role capabilities
    │   ├── assessment.service.ts # Assessments, student acceptance, attempt submission
    │   ├── auth.service.ts     # Authentication, credentials verification, tokens
    │   ├── broadcast.service.ts# Announcements and hackathon student registration
    │   ├── classroom.service.ts# Classroom CRUD, student roster, join code parser
    │   ├── ocr.service.ts      # 3x3 convolution unsharp mask, Q16 OR-split, Q17 healing
    │   └── viva.service.ts     # Speech transcript analysis, rubric evaluations
    ├── controllers/
    │   ├── admin.controller.ts
    │   ├── assessment.controller.ts
    │   ├── auth.controller.ts
    │   ├── broadcast.controller.ts
    │   ├── classroom.controller.ts
    │   ├── ocr.controller.ts
    │   └── viva.controller.ts
    ├── middleware/
    │   ├── auth.middleware.ts  # Bearer token parsing & role-based access control
    │   └── error.middleware.ts # Unified error handling & JSON payload response
    ├── routes/
    │   ├── admin.routes.ts     # /api/v1/admin/* (Protected by ADMIN role)
    │   ├── assessment.routes.ts# /api/v1/assessments/* & /practice-papers/*
    │   ├── auth.routes.ts      # /api/v1/auth/* (login, register, me, logout)
    │   ├── broadcast.routes.ts # /api/v1/broadcasts/*
    │   ├── classroom.routes.ts # /api/v1/classes/*
    │   ├── ocr.routes.ts       # /api/v1/ocr/* (process-document, parse-questions)
    │   ├── viva.routes.ts      # /api/v1/viva/* (evaluate-speech, sessions)
    │   └── index.ts            # Root API router mounting /api/v1
    ├── websocket/
    │   └── socket-handler.ts   # Real-time WebSocket event broadcaster
    └── server.ts               # Express + HTTP Server + WebSocket initialization
```

---

## 2. Seed Accounts & Credentials

The backend comes pre-seeded with the exact credentials matching the frontend authentication system:

| Portal | Email / Login ID | Password | Access / Role |
| :--- | :--- | :--- | :--- |
| **Student Portal** | `student@apex.edu` (or `20230121`) | `student123` | `STUDENT` |
| **Mentor Portal** | `mentor@apex.edu` (or `SX-M401`) | `mentor123` | `MENTOR` |
| **Admin Portal** | `admin@scholarx.org` | `AdminMaster#2026` | `ADMIN` (Private Master) |

---

## 3. Quick Start & Execution

### Install Dependencies
```bash
cd backend
npm install
```

### Run in Development Mode (Live reload via ts-node)
```bash
npm run dev
```

### Build and Run Production Bundle
```bash
npm run build
npm start
```

---

## 4. Key Architectural Invariants

### 4.1 Optical OCR & Question Paper Segmentation
- **3x3 Convolution Sharpening**:
  $$\text{Output}(x,y) = 5 \cdot I(x,y) - \big(I(x-1,y) + I(x+1,y) + I(x,y-1) + I(x,y+1)\big)$$
- **OR Choice Separation**: Questions containing `---- OR ----` are separated into distinct items `(a)` and `(b)` with cross-alternative navigation links (`orAlternativeQuestionId`).
- **Faint Q17 Auto-Healing**: Section C ends at Q16; any subsequent question covering LM35 sensor or DC motor with a faint digit or missing numeral is recognized and auto-healed to Q17.
- **7-Pillar Model Solutions**: Every mined question is synthesized with:
  1. Definition & Context
  2. Intuitive Real-World Analogy
  3. Step-by-Step Derivation
  4. ASCII / Architecture Diagram
  5. Examiner Rubric Marks Allocation
  6. Common Traps & Pitfalls
  7. Cross-University Frequency (AKTU, RTU, VTU, MU)

### 4.2 Security & Proctoring
- **Strict Role-Based Guards**:
  - `requireRole('STUDENT')`
  - `requireRole('MENTOR')`
  - `requireRole('ADMIN')`
- **Classroom Security Policies**: Configurable per-classroom invariants (lockout rules, max tab switches, noise threshold dB, dual camera requirements).

### 4.3 Real-Time WebSocket Message Bus
- Connect to `ws://localhost:5000/ws`
- Events:
  - `STUDENT_JOIN_REQUEST`
  - `ENROLLMENT_APPROVED`
  - `ENROLLMENT_REJECTED`
  - `PROCTOR_ALERT`
  - `INTERCOM_BROADCAST`
  - `VIVA_TELEMETRY`
