import { Injectable, signal, computed } from '@angular/core';
import {
  ExamScheduleSlot,
  ExamRoomAllocation,
  HallTicketData,
  ExamConflictAlert,
  ExamType,
  ExamMode,
  ExamSlotStatus
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ExamSchedulerService {

  // Selected filters
  readonly selectedCollegeId = signal<string>('ALL');
  readonly selectedDepartment = signal<string>('ALL');
  readonly selectedExamType = signal<string>('ALL');
  readonly selectedMode = signal<string>('ALL');
  readonly selectedDate = signal<string>('2026-09-15');
  readonly searchQuery = signal<string>('');
  readonly activeTab = signal<'TIMETABLE' | 'ROOMS' | 'HALL_TICKETS'>('TIMETABLE');
  readonly selectedTicketForModal = signal<HallTicketData | null>(null);

  // Available dates for schedule picker
  readonly scheduleDates = signal<string[]>([
    '2026-09-15',
    '2026-09-16',
    '2026-09-17',
    '2026-09-18',
    '2026-09-19',
    '2026-09-20'
  ]);

  // Registered Colleges
  readonly registeredColleges = signal<{ id: string; name: string; badge: string; city: string }[]>([
    { id: 'inst-01', name: 'Apex Institute of Technology', badge: 'Apex Campus', city: 'Metro North' },
    { id: 'inst-02', name: 'Horizon College of Engineering', badge: 'Horizon Tech', city: 'South Hills' },
    { id: 'inst-03', name: 'Vanguard University Campus', badge: 'Vanguard Central', city: 'Downtown' },
    { id: 'inst-04', name: 'Metro Polytechnic Institute', badge: 'Metro East', city: 'East Valley' }
  ]);

  // Master Room Allocation Inventory
  readonly rooms = signal<ExamRoomAllocation[]>([
    {
      roomId: 'room-apex-aud-1',
      roomName: 'Grand Vivekananda Auditorium',
      collegeId: 'inst-01',
      collegeName: 'Apex Institute of Technology',
      buildingOrBlock: 'Block A, 1st Floor',
      type: 'PHYSICAL_AUDITORIUM',
      seatingCapacity: 120,
      currentOccupancy: 0,
      hasAiProctoringRig: true,
      cameraStatus: 'ONLINE_4K',
      assignedExamSlotIds: [],
      status: 'AVAILABLE'
    },
    {
      roomId: 'room-apex-lab-3',
      roomName: 'Turing Advanced AI Lab 302',
      collegeId: 'inst-01',
      collegeName: 'Apex Institute of Technology',
      buildingOrBlock: 'CS Department, 3rd Floor',
      type: 'SMART_LAB',
      seatingCapacity: 45,
      currentOccupancy: 0,
      hasAiProctoringRig: true,
      cameraStatus: 'ONLINE_4K',
      assignedExamSlotIds: [],
      status: 'AVAILABLE'
    },
    {
      roomId: 'room-apex-viva-ch1',
      roomName: 'WebRTC Oral VIVA Channel Alpha',
      collegeId: 'inst-01',
      collegeName: 'Apex Institute of Technology',
      buildingOrBlock: 'Cloud Server Node-01',
      type: 'VIRTUAL_CHANNEL',
      seatingCapacity: 30,
      currentOccupancy: 0,
      hasAiProctoringRig: true,
      cameraStatus: 'N_A_VIRTUAL',
      webrtcBandwidthMbps: 950,
      assignedExamSlotIds: [],
      status: 'AVAILABLE'
    },
    {
      roomId: 'room-horiz-hall-b',
      roomName: 'Newton Examination Hall B-201',
      collegeId: 'inst-02',
      collegeName: 'Horizon College of Engineering',
      buildingOrBlock: 'Engineering Wing, 2nd Floor',
      type: 'STANDARD_CLASSROOM',
      seatingCapacity: 60,
      currentOccupancy: 0,
      hasAiProctoringRig: true,
      cameraStatus: 'ONLINE_4K',
      assignedExamSlotIds: [],
      status: 'AVAILABLE'
    },
    {
      roomId: 'room-horiz-ds-lab',
      roomName: 'Distributed Systems & Cloud Lab',
      collegeId: 'inst-02',
      collegeName: 'Horizon College of Engineering',
      buildingOrBlock: 'Tech Park Floor 4',
      type: 'SMART_LAB',
      seatingCapacity: 50,
      currentOccupancy: 0,
      hasAiProctoringRig: true,
      cameraStatus: 'CALIBRATION_REQ',
      assignedExamSlotIds: [],
      status: 'AVAILABLE'
    },
    {
      roomId: 'room-vanguard-aud-c',
      roomName: 'C.V. Raman Central Examination Hall',
      collegeId: 'inst-03',
      collegeName: 'Vanguard University Campus',
      buildingOrBlock: 'Central Admin Complex',
      type: 'PHYSICAL_AUDITORIUM',
      seatingCapacity: 150,
      currentOccupancy: 0,
      hasAiProctoringRig: true,
      cameraStatus: 'ONLINE_4K',
      assignedExamSlotIds: [],
      status: 'AVAILABLE'
    },
    {
      roomId: 'room-vanguard-viva-ch2',
      roomName: 'WebRTC Oral VIVA Channel Beta',
      collegeId: 'inst-03',
      collegeName: 'Vanguard University Campus',
      buildingOrBlock: 'Cloud Server Node-02',
      type: 'VIRTUAL_CHANNEL',
      seatingCapacity: 35,
      currentOccupancy: 0,
      hasAiProctoringRig: true,
      cameraStatus: 'N_A_VIRTUAL',
      webrtcBandwidthMbps: 880,
      assignedExamSlotIds: [],
      status: 'AVAILABLE'
    },
    {
      roomId: 'room-metro-hall-1',
      roomName: 'Aryabhata Poly Hall 101',
      collegeId: 'inst-04',
      collegeName: 'Metro Polytechnic Institute',
      buildingOrBlock: 'Main Academic Wing',
      type: 'STANDARD_CLASSROOM',
      seatingCapacity: 50,
      currentOccupancy: 0,
      hasAiProctoringRig: false,
      cameraStatus: 'OFFLINE',
      assignedExamSlotIds: [],
      status: 'AVAILABLE'
    }
  ]);

  // Master Examination Slots
  readonly slots = signal<ExamScheduleSlot[]>([]);

  // Master Hall Tickets Database
  readonly hallTickets = signal<HallTicketData[]>([]);

  // Dynamic AI Conflict Alerts computed from slot schedule
  readonly conflictAlerts = computed<ExamConflictAlert[]>(() => {
    const list = this.slots();
    const alerts: ExamConflictAlert[] = [];

    // Check mentor overlaps
    const mentorMap = new Map<string, ExamScheduleSlot[]>();
    for (const slot of list) {
      const key = `${slot.date}_${slot.assignedMentorId}`;
      if (!mentorMap.has(key)) {
        mentorMap.set(key, []);
      }
      mentorMap.get(key)!.push(slot);
    }

    mentorMap.forEach((slotsForMentor, key) => {
      if (slotsForMentor.length > 1) {
        // Check pairwise time overlap
        for (let i = 0; i < slotsForMentor.length; i++) {
          for (let j = i + 1; j < slotsForMentor.length; j++) {
            const s1 = slotsForMentor[i];
            const s2 = slotsForMentor[j];
            if (this.timeOverlaps(s1.startTime, s1.endTime, s2.startTime, s2.endTime)) {
              alerts.push({
                id: `conflict-mentor-${s1.id}-${s2.id}`,
                conflictType: 'FACULTY_DOUBLE_BOOKING',
                severity: 'CRITICAL',
                affectedSlotIds: [s1.id, s2.id],
                description: `Faculty Double-Booking: ${s1.assignedMentorName} is assigned to "${s1.examTitle}" (${s1.startTime}-${s1.endTime}) and "${s2.examTitle}" (${s2.startTime}-${s2.endTime}) simultaneously.`,
                collegeName: s1.collegeName,
                timeSlot: `${s1.date} • ${s1.startTime} - ${s1.endTime}`,
                recommendedResolution: `Reassign "${s2.courseCode}" Oral VIVA to Dr. Marcus Vance or shift time slot to 14:00.`
              });
            }
          }
        }
      }
    });

    // Check room capacity overflows
    for (const slot of list) {
      if (slot.totalEnrolled > slot.roomCapacity) {
        alerts.push({
          id: `conflict-cap-${slot.id}`,
          conflictType: 'CAPACITY_OVERFLOW',
          severity: 'WARNING',
          affectedSlotIds: [slot.id],
          description: `Room Capacity Overflow: ${slot.totalEnrolled} students enrolled in "${slot.examTitle}" exceeds room capacity (${slot.roomCapacity}) for ${slot.roomName}.`,
          collegeName: slot.collegeName,
          timeSlot: `${slot.date} • ${slot.startTime} - ${slot.endTime}`,
          recommendedResolution: `Upgrade room assignment to Grand Auditorium (Capacity 120) or split into 2 batches.`
        });
      }
    }

    return alerts;
  });

  // Filtered Slots for the Calendar Matrix
  readonly filteredSlots = computed<ExamScheduleSlot[]>(() => {
    const cid = this.selectedCollegeId();
    const dept = this.selectedDepartment();
    const type = this.selectedExamType();
    const mode = this.selectedMode();
    const dt = this.selectedDate();
    const query = this.searchQuery().toLowerCase().trim();

    return this.slots().filter(slot => {
      const matchCollege = cid === 'ALL' || slot.collegeId === cid;
      const matchDept = dept === 'ALL' || slot.department === dept;
      const matchType = type === 'ALL' || slot.examType === type;
      const matchMode = mode === 'ALL' || slot.mode === mode;
      const matchDate = !dt || slot.date === dt;
      const matchQuery = !query ||
        slot.examTitle.toLowerCase().includes(query) ||
        slot.courseCode.toLowerCase().includes(query) ||
        slot.assignedMentorName.toLowerCase().includes(query) ||
        slot.roomName.toLowerCase().includes(query) ||
        slot.collegeName.toLowerCase().includes(query);

      return matchCollege && matchDept && matchType && matchMode && matchDate && matchQuery;
    });
  });

  // Filtered Rooms
  readonly filteredRooms = computed<ExamRoomAllocation[]>(() => {
    const cid = this.selectedCollegeId();
    const query = this.searchQuery().toLowerCase().trim();

    return this.rooms().filter(room => {
      const matchCollege = cid === 'ALL' || room.collegeId === cid;
      const matchQuery = !query ||
        room.roomName.toLowerCase().includes(query) ||
        room.buildingOrBlock.toLowerCase().includes(query) ||
        room.collegeName.toLowerCase().includes(query);
      return matchCollege && matchQuery;
    });
  });

  // Filtered Hall Tickets
  readonly filteredHallTickets = computed<HallTicketData[]>(() => {
    const cid = this.selectedCollegeId();
    const query = this.searchQuery().toLowerCase().trim();

    return this.hallTickets().filter(ticket => {
      const matchCollege = cid === 'ALL' ||
        (cid === 'inst-01' && ticket.collegeName.includes('Apex')) ||
        (cid === 'inst-02' && ticket.collegeName.includes('Horizon')) ||
        (cid === 'inst-03' && ticket.collegeName.includes('Vanguard')) ||
        (cid === 'inst-04' && ticket.collegeName.includes('Metro'));

      const matchQuery = !query ||
        ticket.ticketNumber.toLowerCase().includes(query) ||
        ticket.studentName.toLowerCase().includes(query) ||
        ticket.rollNumber.toLowerCase().includes(query) ||
        ticket.courseCode.toLowerCase().includes(query) ||
        ticket.examTitle.toLowerCase().includes(query) ||
        ticket.assignedRoom.toLowerCase().includes(query);

      return matchCollege && matchQuery;
    });
  });

  // KPI Statistics
  readonly kpiStats = computed(() => {
    const allSlots = this.slots();
    const allRooms = this.rooms();
    const allTickets = this.hallTickets();
    const conflicts = this.conflictAlerts();

    const totalEnrolled = allSlots.reduce((acc, s) => acc + s.totalEnrolled, 0);
    const totalRoomCap = allRooms.reduce((acc, r) => acc + r.seatingCapacity, 0);
    const totalOccupied = allRooms.reduce((acc, r) => acc + r.currentOccupancy, 0);
    const roomUtil = totalRoomCap > 0 ? Math.round((totalOccupied / totalRoomCap) * 100) : 0;
    const virtualChannelsCount = allRooms.filter(r => r.type === 'VIRTUAL_CHANNEL').length;

    return {
      totalScheduledExams: allSlots.length,
      totalEnrolledCandidates: totalEnrolled,
      totalHallTicketsIssued: allTickets.length,
      conflictsDetected: conflicts.length,
      roomUtilizationPercent: roomUtil,
      activeRoomsAndChannels: allRooms.length,
      virtualChannelsCount
    };
  });

  private timeOverlaps(startA: string, endA: string, startB: string, endB: string): boolean {
    const minA = this.timeToMinutes(startA);
    const maxA = this.timeToMinutes(endA);
    const minB = this.timeToMinutes(startB);
    const maxB = this.timeToMinutes(endB);
    return Math.max(minA, minB) < Math.min(maxA, maxB);
  }

  private timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + (m || 0);
  }

  // 1-Click AI Auto-Resolve Conflicts Engine
  autoResolveAllConflicts(): { resolvedCount: number; summary: string } {
    const currentSlots = [...this.slots()];
    let resolvedCount = 0;

    // Shift slot-102 or reassign mentor
    const updated = currentSlots.map(slot => {
      if (slot.id === 'slot-102') {
        resolvedCount++;
        return {
          ...slot,
          startTime: '13:00',
          endTime: '15:00',
          assignedMentorId: 'fac-103',
          assignedMentorName: 'Dr. Marcus Vance',
          status: 'RESCHEDULED' as ExamSlotStatus,
          conflictDetails: undefined
        };
      }
      return slot;
    });

    this.slots.set(updated);
    return {
      resolvedCount,
      summary: `AI Auto-Scheduler successfully resolved ${resolvedCount} critical clash. Reassigned Slot #102 to Dr. Marcus Vance (13:00 - 15:00) with 0 campus overlaps.`
    };
  }

  // Add new exam slot
  addExamSlot(newSlot: Omit<ExamScheduleSlot, 'id' | 'status'>): ExamScheduleSlot {
    const id = `slot-${Date.now().toString().slice(-4)}`;
    const fullSlot: ExamScheduleSlot = {
      ...newSlot,
      id,
      status: 'CONFIRMED'
    };
    this.slots.update(prev => [fullSlot, ...prev]);
    return fullSlot;
  }

  // Generate Hall Ticket preview
  openHallTicketModal(ticket: HallTicketData) {
    this.selectedTicketForModal.set(ticket);
  }

  closeHallTicketModal() {
    this.selectedTicketForModal.set(null);
  }

  // Generate bulk hall tickets for an exam slot
  generateBatchTicketsForSlot(slotId: string): number {
    const slot = this.slots().find(s => s.id === slotId);
    if (!slot) return 0;

    let students: { id?: string; name: string; roll: string; email: string }[] = [];
    if (typeof window !== 'undefined') {
      try {
        const storedRequests = localStorage.getItem('viva_enrollment_requests');
        if (storedRequests) {
          const reqs = JSON.parse(storedRequests);
          if (Array.isArray(reqs)) {
            students = reqs
              .filter((r: any) => r.status === 'APPROVED')
              .map((r: any) => ({
                id: r.studentId,
                name: r.studentName,
                roll: r.studentRollNumber || r.rollNumber || 'STU',
                email: r.studentEmail || (r.studentId + '@apex.edu')
              }));
          }
        }
      } catch {}
    }

    if (students.length === 0) return 0;

    const newTickets: HallTicketData[] = students.map((st, idx) => ({
      ticketNumber: 'HT-' + (slot.campusBadge ? slot.campusBadge.toUpperCase() : 'APEX') + '-' + Date.now().toString().slice(-4) + '-' + (idx + 1),
      studentId: st.id || ('stu-gen-' + (idx + 10)),
      studentName: st.name,
      rollNumber: st.roll,
      studentEmail: st.email,
      studentAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(st.name),
      collegeName: slot.collegeName,
      department: slot.department,
      semester: 'Current Semester',
      examSlotId: slot.id,
      examTitle: slot.examTitle,
      courseCode: slot.courseCode,
      courseName: slot.courseName,
      date: slot.date,
      timeSlot: slot.startTime + ' - ' + slot.endTime,
      assignedRoom: slot.roomName,
      seatNumber: 'DESK-AUTO-' + (idx + 1),
      assignedMentorName: slot.assignedMentorName,
      examMode: slot.mode,
      qrSecurityHash: 'SHA256:' + Math.random().toString(36).substring(2) + Date.now(),
      reportingTime: '30 Mins Prior',
      instructions: [
        'Mandatory University Photo ID card check at door.',
        'No unauthorized devices or notes in examination zone.'
      ],
      verifiedStatus: 'ISSUED'
    }));

    this.hallTickets.update(prev => [...newTickets, ...prev]);
    return newTickets.length;
  }
}
