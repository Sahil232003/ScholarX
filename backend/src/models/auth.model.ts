export type UserRole = 'STUDENT' | 'MENTOR' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  institution?: string;
  // Student Specific
  rollNumber?: string;
  yearSemester?: string;
  degreeProgram?: string;
  // Mentor Specific
  academicTitle?: string;
  facultyId?: string;
  designation?: string;
  teachingSpecialization?: string[];
  isVivaExaminerAuthorized?: boolean;
  createdAt: string;
}

export interface StoredAccount extends AuthUser {
  passwordHash: string;
}

export interface LoginDto {
  loginId: string;
  password: string;
  role: UserRole;
}

export interface StudentRegisterDto {
  fullName: string;
  email: string;
  rollNumber: string;
  collegeName?: string;
  degreeProgram?: string;
  department?: string;
  yearSemester?: string;
  password: string;
  confirmPassword?: string;
}

export interface MentorRegisterDto {
  academicTitle?: string;
  fullName: string;
  email: string;
  facultyId: string;
  collegeName?: string;
  department?: string;
  designation?: string;
  teachingSpecialization?: string;
  isVivaExaminerAuthorized?: boolean;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
  redirectUrl?: string;
}
