import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DATA_PROVIDER } from '../../../../core/api/api-provider.token';
import { MentorClass, CreateClassDto } from '../../../../core/models';

@Component({
  selector: 'app-classes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './classes-list.html',
  styleUrl: './classes-list.scss'
})
export class ClassesListComponent implements OnInit {
  private readonly provider = inject(DATA_PROVIDER);

  readonly classes = signal<MentorClass[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly showCreateModal = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly copiedCodeId = signal<string | null>(null);
  readonly copiedLinkId = signal<string | null>(null);
  readonly searchQuery = signal<string>('');
  readonly classCreatedSuccess = signal<MentorClass | null>(null);
  readonly liveJoinToast = signal<string | null>(null);

  readonly totalPendingCount = computed(() => 
    this.classes().reduce((sum, c) => sum + (c.pendingRequestsCount || 0), 0)
  );

  private enrollmentChannel: BroadcastChannel | null = null;

  // Form State
  newClass: CreateClassDto = {
    name: '',
    subject: '',
    subjectCode: '',
    department: 'Computer Science',
    semester: 5,
    academicYear: '2026-2027',
    description: ''
  };

  ngOnInit(): void {
    this.loadClasses();
    this.initEnrollmentListener();
  }

  private initEnrollmentListener(): void {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
    try {
      this.enrollmentChannel = new BroadcastChannel('viva_enrollment_channel');
      this.enrollmentChannel.onmessage = (event) => {
        const data = event.data;
        if (data && data.type === 'STUDENT_JOIN_REQUEST') {
          this.loadClasses();
          this.liveJoinToast.set(`🔔 Student ${data.studentName} (${data.studentId}) requested to join ${data.className || 'a class'}!`);
          setTimeout(() => this.liveJoinToast.set(null), 6000);
        }
      };
    } catch (e) {}
  }

  loadClasses(): void {
    this.isLoading.set(true);
    this.provider.getMentorClasses().subscribe({
      next: (data) => {
        const normalized = data.map(c => ({
          ...c,
          joinCode: c.joinCode || (c as any).code || 'DIST-SYS-601',
          subjectCode: c.subjectCode || (c as any).code || 'CS601'
        }));
        this.classes.set(normalized);
        this.isLoading.set(false);

        // Sync backend classes to localStorage so Student Portal can find any classroom
        if (typeof window !== 'undefined') {
          try {
            const existingRaw = localStorage.getItem('viva_mentor_classes');
            const existing = existingRaw ? JSON.parse(existingRaw) : [];
            const idMap = new Map<string, any>();
            normalized.forEach(c => idMap.set(c.id, c));
            existing.forEach((c: any) => { if (!idMap.has(c.id)) idMap.set(c.id, c); });
            localStorage.setItem('viva_mentor_classes', JSON.stringify(Array.from(idMap.values())));
          } catch (e) {}
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  getJoinLink(classItem: MentorClass): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200';
    const code = classItem.joinCode || (classItem as any).code || '';
    return `${origin}/student/classes?joinCode=${encodeURIComponent(code)}`;
  }

  copyJoinLink(classItem: MentorClass): void {
    const link = this.getJoinLink(classItem);
    navigator.clipboard.writeText(link);
    this.copiedLinkId.set(classItem.id);
    setTimeout(() => this.copiedLinkId.set(null), 2500);
  }

  copyJoinCode(classItem: MentorClass): void {
    const code = classItem.joinCode || (classItem as any).code || '';
    if (code) {
      navigator.clipboard.writeText(code);
    }
    this.copiedCodeId.set(classItem.id);
    setTimeout(() => this.copiedCodeId.set(null), 2500);
  }

  openCreateModal(): void {
    this.newClass = {
      name: '',
      subject: '',
      subjectCode: '',
      department: 'Computer Science',
      semester: 5,
      academicYear: '2026-2027',
      description: ''
    };
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitCreateClass(): void {
    if (!this.newClass.name || !this.newClass.subjectCode) return;

    this.isSubmitting.set(true);
    this.provider.createClass(this.newClass).subscribe({
      next: (created) => {
        // Guarantee valid joinCode and subjectCode on created class
        const finalJoinCode = created.joinCode || (created as any).code || `${this.newClass.subjectCode.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        created.joinCode = finalJoinCode;
        created.subjectCode = created.subjectCode || this.newClass.subjectCode;
        if (!created.academicYear) created.academicYear = this.newClass.academicYear || '2026-2027';
        if (!created.semester) created.semester = this.newClass.semester || 5;

        this.classes.update(prev => [created, ...prev]);
        this.isSubmitting.set(false);
        this.closeCreateModal();
        this.classCreatedSuccess.set(created);
        setTimeout(() => this.classCreatedSuccess.set(null), 10000);

        // Immediately sync to localStorage viva_mentor_classes so Student Portal finds it instantly!
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('viva_mentor_classes');
            const list = raw ? JSON.parse(raw) : [];
            const updated = [created, ...list.filter((c: any) => c.id !== created.id && c.joinCode !== created.joinCode)];
            localStorage.setItem('viva_mentor_classes', JSON.stringify(updated));
          } catch (e) {
            console.warn('Could not cache created mentor class', e);
          }
        }
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  get filteredClasses(): MentorClass[] {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.classes();
    return this.classes().filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.subjectCode.toLowerCase().includes(q) ||
      c.joinCode.toLowerCase().includes(q)
    );
  }
}
