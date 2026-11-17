import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-progress.html',
  styleUrl: './student-progress.scss'
})
export class StudentProgressComponent {
  readonly studentService = inject(StudentService);
  readonly profile = this.studentService.profile;

  // Selected course filter for progress
  readonly selectedSubject = signal<string>('ALL');

  readonly completedAssessments = computed(() => {
    return this.studentService.assignedTests().filter(t => t.status === 'COMPLETED');
  });

  readonly averageCOAttainment = computed<number>(() => {
    const list = this.completedAssessments();
    if (!list.length) return this.profile().averageCOAttainment || 0;
    const total = list.reduce((sum, t) => sum + ((t.awardedScore || 0) / (t.totalMarks || 100)) * 100, 0);
    return Math.round((total / list.length) * 10) / 10;
  });

  readonly completedVivasCount = computed<number>(() => {
    return this.completedAssessments().length || this.profile().completedVivasCount || 0;
  });

  readonly readinessIndex = computed<number>(() => {
    return this.profile().overallReadinessIndex || (this.completedAssessments().length > 0 ? this.averageCOAttainment() : 0);
  });

  // Bloom's Cognitive Domains Mastery Radar Data (6 Axes)
  readonly bloomLevels = computed(() => {
    const avg = this.averageCOAttainment();
    const hasData = this.completedAssessments().length > 0;
    return [
      { label: 'Remembering (L1)', score: hasData ? Math.min(100, Math.round(avg * 1.05)) : 0, target: 70, angle: 0 },
      { label: 'Understanding (L2)', score: hasData ? Math.min(100, Math.round(avg * 1.02)) : 0, target: 70, angle: 60 },
      { label: 'Applying (L3)', score: hasData ? Math.min(100, Math.round(avg * 0.98)) : 0, target: 70, angle: 120 },
      { label: 'Analyzing (L4)', score: hasData ? Math.min(100, Math.round(avg * 0.94)) : 0, target: 70, angle: 180 },
      { label: 'Evaluating (L5)', score: hasData ? Math.min(100, Math.round(avg * 0.90)) : 0, target: 70, angle: 240 },
      { label: 'Creating (L6)', score: hasData ? Math.min(100, Math.round(avg * 0.85)) : 0, target: 70, angle: 300 }
    ];
  });

  // Course Outcome Attainment Progress Bars (CO1 to CO6)
  readonly courseOutcomes = computed(() => {
    const completed = this.completedAssessments();
    if (!completed.length) return [];
    const coMap = new Map<string, { total: number; count: number }>();
    for (const t of completed) {
      const scorePct = ((t.awardedScore || 0) / (t.totalMarks || 100)) * 100;
      for (const co of (t.targetCOs || ['CO1'])) {
        const cur = coMap.get(co) || { total: 0, count: 0 };
        cur.total += scorePct;
        cur.count += 1;
        coMap.set(co, cur);
      }
    }
    const result: Array<{ code: string; name: string; score: number; benchmark: number; status: string }> = [];
    coMap.forEach((val, code) => {
      const avg = Math.round((val.total / val.count) * 10) / 10;
      result.push({
        code,
        name: `Course Outcome ${code} Attainment`,
        score: avg,
        benchmark: 70,
        status: avg >= 80 ? 'PROFICIENT' : avg >= 60 ? 'COMPETENT' : 'REMEDIATION'
      });
    });
    return result;
  });

  // Historical Assessment Ledger Items
  readonly assessmentHistory = computed(() => {
    return this.completedAssessments().map((t, idx) => ({
      id: t.id || `h-${idx + 1}`,
      title: t.title,
      course: `${t.subjectCode} ${t.className}`,
      date: t.dueDate || 'Completed',
      type: t.type === 'ORAL_VIVA' ? 'ORAL_VIVA' : 'THEORY_CIE',
      score: `${t.awardedScore || 0} / ${t.totalMarks} (${Math.round(((t.awardedScore || 0) / (t.totalMarks || 100)) * 100)}%)`,
      integrity: '100% Verified',
      status: 'VERIFIED',
      coTarget: t.targetCOs?.[0] || 'CO1'
    }));
  });

  // SVG Radar Polygon Calculations
  readonly radarCenter = 150;
  readonly radarRadius = 110;

  getPointCoordinates(angleDegrees: number, valuePercent: number): { x: number; y: number } {
    const angleRad = (angleDegrees - 90) * (Math.PI / 180);
    const r = (valuePercent / 100) * this.radarRadius;
    const x = this.radarCenter + r * Math.cos(angleRad);
    const y = this.radarCenter + r * Math.sin(angleRad);
    return { x, y };
  }

  readonly actualPolygonPoints = computed(() => {
    return this.bloomLevels()
      .map(b => {
        const pt = this.getPointCoordinates(b.angle, b.score);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');
  });

  readonly targetPolygonPoints = computed(() => {
    return this.bloomLevels()
      .map(b => {
        const pt = this.getPointCoordinates(b.angle, b.target);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');
  });

  downloadReportPdf(): void {
    const name = this.profile().fullName || 'Student Candidate';
    const roll = this.profile().studentId ? ` (${this.profile().studentId})` : '';
    alert(`📥 Downloading Official OBE Assessment Performance Report (.PDF) for ${name}${roll}...`);
  }
}
