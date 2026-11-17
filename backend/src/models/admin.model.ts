export interface AdminKpiMetrics {
  totalStudents: number;
  totalFaculty: number;
  activeInstitutions: number;
  activeVivas: number;
  systemUptimePercentage: number;
  avgProctorComplianceScore: number;
  totalAssessmentsEvaluated: number;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  campusCity: string;
  state: string;
  affiliatedUniversity: string;
  accreditationGrade: string; // e.g., 'NAAC A++', 'NBA Tier-1'
  primaryAdminEmail: string;
  enrolledStudentsCount: number;
  activeFacultyCount: number;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
  createdAt: string;
}

export interface CreateInstitutionDto {
  name: string;
  code: string;
  campusCity: string;
  state: string;
  affiliatedUniversity: string;
  accreditationGrade: string;
  primaryAdminEmail: string;
}

export interface RoleCapability {
  capabilityKey: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'AUTHENTICATION' | 'CLASSROOM_MANAGEMENT' | 'VIVA_EXAMINATION' | 'PROCTORING_SECURITY' | 'OBE_ANALYTICS';
}

export interface RoleCapabilitiesConfig {
  roleKey: 'STUDENT' | 'MENTOR' | 'INSTITUTION_ADMIN' | 'SYSTEM_ADMIN';
  roleName: string;
  description: string;
  capabilities: RoleCapability[];
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actorUserId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetResource: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details?: Record<string, any>;
}
