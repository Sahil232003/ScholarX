export interface BroadcastItem {
  id: string;
  badge: string;
  badgeColor?: string;
  title: string;
  deadlineText?: string;
  description: string;
  tags: string[];
  actionLabel: string;
  actionUrl?: string;
  category: 'HACKATHON' | 'RESEARCH_GRANT' | 'GUEST_LECTURE' | 'EXAM_UPDATE';
  bannerImageUrl?: string;
  targetDepartments?: string[];
  registeredStudentIds?: string[];
  createdAt: string;
}

export interface GlobalNoticeItem {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  dismissible: boolean;
  publishedAt: string;
  expiresAt?: string;
}
