import { Component, inject, signal, computed, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../core/services/student.service';
import { GeminiAiService } from '../../../core/services/gemini-ai.service';
import { ChatChannel, ChatMessage } from '../../../core/models';

@Component({
  selector: 'app-student-communication',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-communication.html',
  styleUrl: './student-communication.scss'
})
export class StudentCommunicationComponent implements AfterViewChecked {
  private readonly studentService = inject(StudentService);
  private readonly geminiService = inject(GeminiAiService);

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  readonly channels = computed<ChatChannel[]>(() => {
    return this.studentService.joinedClasses().map(c => ({
      id: c.id,
      name: `${c.subjectCode}: ${c.name}`,
      courseCode: c.subjectCode,
      mentorName: c.mentorName || 'Faculty Instructor',
      mentorAvatar: (c.mentorName || 'FI').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      unreadCount: 0,
      lastMessageSnippet: 'Classroom study stream active.',
      lastMessageTime: 'Active'
    }));
  });

  readonly selectedChannelId = signal<string>('');
  readonly messageText = signal<string>('');
  readonly isAiThinking = signal<boolean>(false);

  // Messages State keyed by channelId
  readonly channelMessages = signal<Record<string, ChatMessage[]>>({});

  constructor() {
    const joined = this.studentService.joinedClasses();
    if (joined.length > 0) {
      this.selectedChannelId.set(joined[0].id);
    }
  }

  readonly activeChannel = computed(() => {
    const chans = this.channels();
    const selId = this.selectedChannelId();
    return chans.find(c => c.id === selId) || (chans.length > 0 ? chans[0] : null);
  });

  readonly currentMessages = computed(() => {
    const selId = this.selectedChannelId() || (this.channels().length > 0 ? this.channels()[0].id : '');
    return this.channelMessages()[selId] || [];
  });

  readonly quickChips = [
    '@ai Summarize the key concepts for this course',
    '@ai Generate 3 viva practice questions',
    '@ai Explain core formulas and theorems'
  ];

  selectChannel(id: string): void {
    this.selectedChannelId.set(id);
  }

  useChip(text: string): void {
    this.messageText.set(text);
  }

  sendMessage(): void {
    const text = this.messageText().trim();
    if (!text) return;

    const channelId = this.selectedChannelId();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: this.studentService.profile().studentId,
      senderName: this.studentService.profile().fullName,
      senderRole: 'STUDENT',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAiBot: false
    };

    this.channelMessages.update(m => ({
      ...m,
      [channelId]: [...(m[channelId] || []), newMsg]
    }));

    this.messageText.set('');

    // Check if message mentions @ai
    if (text.toLowerCase().includes('@ai')) {
      this.handleAiTutorResponse(text, channelId);
    }
  }

  private handleAiTutorResponse(query: string, channelId: string): void {
    this.isAiThinking.set(true);
    const cleanQuery = query.replace(/@ai/gi, '').trim();

    const studentName = this.studentService.profile().fullName || 'Student Scholar';
    const prompt = `
You are @ScholarX AI Tutor, an engineering academic assistant for ${studentName}.
Subject Context: ${this.activeChannel()?.name || 'Classroom Discussion'}
Student Question: "${cleanQuery}"

Provide a concise, grounded explanation with key engineering principles, formulas, and examination takeaways.
`;

    this.geminiService.generateText(prompt, 'You are @ScholarX AI Tutor bot. Respond informatively in markdown.').subscribe({
      next: (ans) => {
        const botMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          senderId: 'ai-tutor-bot',
          senderName: 'ScholarX AI Tutor',
          senderRole: 'FACULTY',
          text: ans,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAiBot: true
        };
        this.channelMessages.update(m => ({
          ...m,
          [channelId]: [...(m[channelId] || []), botMsg]
        }));
        this.isAiThinking.set(false);
      },
      error: () => {
        const botMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          senderId: 'ai-tutor-bot',
          senderName: 'ScholarX AI Tutor',
          senderRole: 'FACULTY',
          text: `🤖 **ScholarX AI Tutor Guidance:**\nHere is key guidance on "${cleanQuery}": Focus on core engineering definitions, underlying state transitions, and step-by-step mathematical proofs.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAiBot: true
        };
        this.channelMessages.update(m => ({
          ...m,
          [channelId]: [...(m[channelId] || []), botMsg]
        }));
        this.isAiThinking.set(false);
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.messagesContainer?.nativeElement) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }
}
