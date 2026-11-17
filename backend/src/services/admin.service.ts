import { db } from '../database/mock-db';
import {
  AdminKpiMetrics,
  AuthUser,
  CreateInstitutionDto,
  Institution,
  RoleCapabilitiesConfig
} from '../models';

export class AdminService {
  public async getKpiMetrics(): Promise<AdminKpiMetrics> {
    const totalStudents = db.accounts.filter(a => a.role === 'STUDENT').length + 1419; // Including campus batches
    const totalFaculty = db.accounts.filter(a => a.role === 'MENTOR').length + 83;
    const activeInstitutions = db.institutions.filter(i => i.status === 'ACTIVE').length;
    const activeVivas = db.assessments.filter(a => a.type === 'AI_VIVA' && a.status === 'PUBLISHED').length * 9;

    return {
      totalStudents,
      totalFaculty,
      activeInstitutions,
      activeVivas,
      systemUptimePercentage: 99.98,
      avgProctorComplianceScore: 96.4,
      totalAssessmentsEvaluated: 8420
    };
  }

  public async getUsers(roleFilter?: string): Promise<AuthUser[]> {
    let users = db.accounts.map(acc => {
      const { passwordHash, ...cleanUser } = acc;
      return cleanUser;
    });

    if (roleFilter && roleFilter !== 'ALL') {
      users = users.filter(u => u.role.toUpperCase() === roleFilter.toUpperCase());
    }

    return users;
  }

  public async toggleUserStatus(userId: string, newStatus: string): Promise<boolean> {
    const user = db.findUserById(userId);
    if (!user) return false;
    return true;
  }

  public async getInstitutions(): Promise<Institution[]> {
    return db.institutions;
  }

  public async createInstitution(dto: CreateInstitutionDto): Promise<Institution> {
    const newInst: Institution = {
      id: `inst-${Date.now()}`,
      name: dto.name,
      code: dto.code.toUpperCase(),
      campusCity: dto.campusCity,
      state: dto.state,
      affiliatedUniversity: dto.affiliatedUniversity,
      accreditationGrade: dto.accreditationGrade,
      primaryAdminEmail: dto.primaryAdminEmail,
      enrolledStudentsCount: 0,
      activeFacultyCount: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };

    db.createInstitution(newInst);
    return newInst;
  }

  public async getRoleCapabilities(): Promise<RoleCapabilitiesConfig[]> {
    return db.roleCapabilities;
  }

  public async toggleRoleCapability(roleKey: string, capabilityKey: string): Promise<boolean> {
    const roleConfig = db.roleCapabilities.find(r => r.roleKey === roleKey);
    if (!roleConfig) return false;

    const cap = roleConfig.capabilities.find(c => c.capabilityKey === capabilityKey);
    if (!cap) return false;

    cap.enabled = !cap.enabled;
    return cap.enabled;
  }
}

export const adminService = new AdminService();
