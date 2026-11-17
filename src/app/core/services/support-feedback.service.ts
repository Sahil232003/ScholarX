import { Injectable, signal, computed } from '@angular/core';
import { StudentFeedbackItem } from '../models';

const STORAGE_KEY = 'scholarx_admin_feedbacks_v2';

@Injectable({
  providedIn: 'root'
})
export class SupportFeedbackService {
  private channel: BroadcastChannel | null = null;

  readonly feedbacks = signal<StudentFeedbackItem[]>(this.loadFeedbacks());

  readonly newCount = computed(() => this.feedbacks().filter(f => f.status === 'NEW').length);
  readonly inReviewCount = computed(() => this.feedbacks().filter(f => f.status === 'IN_REVIEW').length);
  readonly resolvedCount = computed(() => this.feedbacks().filter(f => f.status === 'RESOLVED').length);
  readonly urgentCount = computed(() => this.feedbacks().filter(f => f.priority === 'URGENT' && f.status !== 'RESOLVED').length);

  constructor() {
    this.setupBroadcastSync();
  }

  private loadFeedbacks(): StudentFeedbackItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out legacy mock ticket IDs
          const filtered = parsed.filter(item => !['fb-001', 'fb-002', 'fb-003'].includes(item.id));
          if (filtered.length !== parsed.length) {
            this.saveToStorage(filtered);
          }
          return filtered;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored feedbacks:', e);
    }
    return [];
  }

  private saveToStorage(items: StudentFeedbackItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to write feedbacks to storage:', e);
    }
  }

  private setupBroadcastSync(): void {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('scholarx_feedback_channel');
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'FEEDBACKS_UPDATED') {
            const fresh = this.loadFeedbacks();
            this.feedbacks.set(fresh);
          }
        };
      } catch (e) {
        // Channel unavailable, rely on signals
      }
    }
  }

  private notifySync(): void {
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'FEEDBACKS_UPDATED', timestamp: Date.now() });
      } catch (e) {
        // broadcast fallback
      }
    }
  }

  submitFeedback(item: Omit<StudentFeedbackItem, 'id' | 'ticketId' | 'status' | 'createdAt'>): StudentFeedbackItem {
    const randomTicket = 'TKT-' + Math.floor(1000 + Math.random() * 9000);
    const newFeedback: StudentFeedbackItem = {
      ...item,
      id: 'fb-' + Date.now(),
      ticketId: randomTicket,
      status: 'NEW',
      createdAt: new Date().toISOString()
    };

    const updated = [newFeedback, ...this.feedbacks()];
    this.feedbacks.set(updated);
    this.saveToStorage(updated);
    this.notifySync();

    return newFeedback;
  }

  resolveFeedback(id: string, adminReply?: string): void {
    const updated = this.feedbacks().map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'RESOLVED' as const,
          resolvedAt: new Date().toISOString(),
          adminReply: adminReply || item.adminReply || 'Resolved by Campus Administration.'
        };
      }
      return item;
    });

    this.feedbacks.set(updated);
    this.saveToStorage(updated);
    this.notifySync();
  }

  updateStatus(id: string, status: 'NEW' | 'IN_REVIEW' | 'RESOLVED', adminReply?: string): void {
    const updated = this.feedbacks().map(item => {
      if (item.id === id) {
        return {
          ...item,
          status,
          resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : item.resolvedAt,
          adminReply: adminReply !== undefined ? adminReply : item.adminReply
        };
      }
      return item;
    });

    this.feedbacks.set(updated);
    this.saveToStorage(updated);
    this.notifySync();
  }

  deleteFeedback(id: string): void {
    const updated = this.feedbacks().filter(item => item.id !== id);
    this.feedbacks.set(updated);
    this.saveToStorage(updated);
    this.notifySync();
  }

  getStudentFeedbacks(studentId: string): StudentFeedbackItem[] {
    return this.feedbacks().filter(f => f.studentId === studentId);
  }
}
