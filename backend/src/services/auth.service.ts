import { db } from '../database/mock-db';
import {
  AuthResponse,
  AuthUser,
  LoginDto,
  MentorRegisterDto,
  StoredAccount,
  StudentRegisterDto,
  UserRole
} from '../models';

export class AuthService {
  public async login(dto: LoginDto): Promise<AuthResponse> {
    const { loginId, password, role } = dto;

    if (!loginId || !password) {
      return { success: false, error: 'Please enter Login ID and password.' };
    }

    const normalizedId = loginId.trim().toLowerCase();
    const account = db.accounts.find(
      u => u.email.toLowerCase() === normalizedId || (u.rollNumber && u.rollNumber.toLowerCase() === normalizedId)
    );

    if (!account) {
      return { success: false, error: 'No account found matching this Login ID.' };
    }

    if (account.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }

    if (account.role !== role) {
      return {
        success: false,
        error: `This account is registered as a ${account.role}, but you logged in under the ${role} portal.`
      };
    }

    const { passwordHash, ...cleanUser } = account;
    const token = `mock-token-${account.id}`;

    let redirectUrl = '/student/dashboard';
    if (account.role === 'MENTOR') {
      redirectUrl = '/mentor/dashboard';
    } else if (account.role === 'ADMIN') {
      redirectUrl = '/admin/dashboard';
    }

    return {
      success: true,
      user: cleanUser,
      token,
      redirectUrl
    };
  }

  public async registerStudent(dto: StudentRegisterDto): Promise<AuthResponse> {
    const { fullName, email, rollNumber, collegeName, degreeProgram, department, yearSemester, password } = dto;

    if (!fullName?.trim() || !email?.trim() || !rollNumber?.trim() || !password) {
      return { success: false, error: 'Please fill in all mandatory fields.' };
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newId = `usr-student-${Date.now()}`;
    const newAccount: StoredAccount = {
      id: newId,
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      role: 'STUDENT',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName.trim())}`,
      institution: collegeName?.trim() || 'Apex Institute of Technology',
      department: department?.trim() || 'Computer Science & Engineering',
      degreeProgram: degreeProgram?.trim() || 'B.Tech Computer Science',
      rollNumber: rollNumber.trim(),
      yearSemester: yearSemester?.trim() || 'Year 1 / Sem 1',
      createdAt: new Date().toISOString().split('T')[0],
      passwordHash: password
    };

    db.createAccount(newAccount);
    const { passwordHash, ...cleanUser } = newAccount;

    return {
      success: true,
      user: cleanUser,
      token: `mock-token-${cleanUser.id}`,
      redirectUrl: '/student/dashboard'
    };
  }

  public async registerMentor(dto: MentorRegisterDto): Promise<AuthResponse> {
    const { academicTitle, fullName, email, facultyId, collegeName, department, designation, teachingSpecialization, isVivaExaminerAuthorized, password } = dto;

    if (!fullName?.trim() || !email?.trim() || !facultyId?.trim() || !password) {
      return { success: false, error: 'Please fill in all mandatory fields.' };
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const specs = teachingSpecialization
      ? teachingSpecialization.split(',').map(s => s.trim()).filter(Boolean)
      : ['Distributed Computing'];

    const newId = `usr-mentor-${Date.now()}`;
    const newAccount: StoredAccount = {
      id: newId,
      name: `${academicTitle ? academicTitle + ' ' : ''}${fullName.trim()}`.trim(),
      email: email.trim().toLowerCase(),
      role: 'MENTOR',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName.trim())}`,
      institution: collegeName?.trim() || 'Apex Institute of Technology',
      department: department?.trim() || 'Computer Science & AI',
      academicTitle: academicTitle || 'Prof.',
      facultyId: facultyId.trim(),
      designation: designation?.trim() || 'Faculty Mentor',
      teachingSpecialization: specs,
      isVivaExaminerAuthorized: isVivaExaminerAuthorized !== false,
      createdAt: new Date().toISOString().split('T')[0],
      passwordHash: password
    };

    db.createAccount(newAccount);
    const { passwordHash, ...cleanUser } = newAccount;

    return {
      success: true,
      user: cleanUser,
      token: `mock-token-${cleanUser.id}`,
      redirectUrl: '/mentor/dashboard'
    };
  }

  public async getCurrentUser(userId: string): Promise<AuthUser | null> {
    const account = db.findUserById(userId);
    if (!account) return null;
    const { passwordHash, ...cleanUser } = account;
    return cleanUser;
  }
}

export const authService = new AuthService();
