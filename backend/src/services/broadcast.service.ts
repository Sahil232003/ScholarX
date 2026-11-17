import { db } from '../database/mock-db';
import { BroadcastItem, GlobalNoticeItem } from '../models';

export class BroadcastService {
  public async getBroadcasts(): Promise<BroadcastItem[]> {
    return db.broadcasts;
  }

  public async getBroadcastById(id: string): Promise<BroadcastItem | null> {
    return db.broadcasts.find(b => b.id === id) || null;
  }

  public async registerStudent(broadcastId: string, studentId: string): Promise<boolean> {
    const item = db.broadcasts.find(b => b.id === broadcastId);
    if (!item) return false;

    if (!item.registeredStudentIds) {
      item.registeredStudentIds = [];
    }

    if (!item.registeredStudentIds.includes(studentId)) {
      item.registeredStudentIds.push(studentId);
    }

    return true;
  }

  public async getGlobalNotice(): Promise<GlobalNoticeItem | null> {
    return db.globalNotice;
  }

  public async dismissGlobalNotice(): Promise<boolean> {
    db.globalNotice = null;
    return true;
  }
}

export const broadcastService = new BroadcastService();
