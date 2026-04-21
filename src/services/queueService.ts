import { queueDB, Token } from '../db/queueDB';
import { notificationDB } from '../db';

const prefixMap: Record<string, string> = {
  CARDIOLOGY: 'C',
  ENT: 'E',
  ORTHO: 'O',
  GENERAL: 'G',
  DENTAL: 'D',
  DERMATOLOGY: 'DR',
  NEUROLOGY: 'N',
  PEDIATRICS: 'P',
};

export interface QueueStats {
  total: number;
  completed: number;
  waiting: number;
  called: number;
  cancelled: number;
  paused: number;
}

export interface DepartmentStats {
  department: string;
  waiting: number;
  called: number;
  completed: number;
  avgWaitTime: number;
}

class QueueService {
  private nextTokenNumber(department: string): string {
    const prefix = prefixMap[department] || department[0].toUpperCase();
    const existing = queueDB.byDepartment(department);
    const maxNum = existing.reduce((max, t) => {
      const num = parseInt(t.tokenNumber.replace(prefix, ''), 10);
      return num > max ? num : max;
    }, 0);
    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
  }

  generateToken(patientId: string | undefined, department: string, doctorId?: string, priority = false): Token {
    const waiting = this.getCurrentQueue(department).length;
    const token: Token = {
      id: `TOKEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tokenNumber: this.nextTokenNumber(department),
      patientId,
      department,
      doctorId,
      status: 'waiting',
      priority,
      createdAt: new Date().toISOString(),
      estimatedWait: this.predictWaitTime(waiting),
    };

    const all = queueDB.getAll();
    if (priority) {
      const firstNonPriority = all.findIndex(t => t.status === 'waiting' && !t.priority);
      if (firstNonPriority === -1) {
        all.push(token);
      } else {
        all.splice(firstNonPriority, 0, token);
      }
    } else {
      all.push(token);
    }
    queueDB.saveAll(all);
    return token;
  }

  getCurrentQueue(department: string): Token[] {
    return queueDB
      .byDepartment(department)
      .filter(t => t.status === 'waiting' || t.status === 'called')
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority ? -1 : 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }

  getNextPatients(department: string, limit = 5): Token[] {
    return this.getCurrentQueue(department).slice(0, limit);
  }

  callNextPatient(department: string, doctorId?: string): Token | null {
    const candidates = this.getCurrentQueue(department).filter(t => t.status === 'waiting');
    let next: Token | undefined;

    if (doctorId) {
      next = candidates.find(t => t.doctorId === doctorId);
    }
    if (!next) {
      next = candidates.find(t => !t.priority);
    }
    if (!next) {
      next = candidates[0];
    }

    if (!next) return null;
    queueDB.update(next.id, { status: 'called' });
    
    if (next.patientId) {
      notificationDB.send(
        next.patientId,
        'queue',
        'in-app',
        'Token Called',
        `Your token ${next.tokenNumber} is now being called. Please proceed to ${next.department}.`,
        next.doctorId || 'system',
        '/queue/status'
      );
    }
    
    return next;
  }

  completeToken(id: string): void {
    queueDB.update(id, { status: 'completed' });
  }

  cancelToken(id: string): void {
    queueDB.update(id, { status: 'cancelled' });
  }

  pauseToken(id: string): void {
    queueDB.update(id, { status: 'paused' });
  }

  resumeToken(id: string): void {
    queueDB.update(id, { status: 'waiting' });
  }

  predictWaitTime(queueAhead: number, avgConsultationTime = 10): number {
    return queueAhead * avgConsultationTime;
  }

  getEstimatedWait(tokenId: string): number {
    const token = queueDB.getAll().find(t => t.id === tokenId);
    if (!token) return 0;

    const queue = this.getCurrentQueue(token.department);
    const position = queue.findIndex(t => t.id === tokenId);
    if (position <= 0) return 0;

    const tokensAhead = queue.slice(0, position);
    return tokensAhead.reduce((wait, t) => wait + this.predictWaitTime(1), 0);
  }

  stats(): QueueStats {
    const all = queueDB.getAll();
    return {
      total: all.length,
      completed: all.filter(x => x.status === 'completed').length,
      waiting: all.filter(x => x.status === 'waiting').length,
      called: all.filter(x => x.status === 'called').length,
      cancelled: all.filter(x => x.status === 'cancelled').length,
      paused: all.filter(x => x.status === 'paused').length,
    };
  }

  departmentStats(): DepartmentStats[] {
    const departments = [...new Set(queueDB.getAll().map(t => t.department))];
    return departments.map(dept => {
      const deptTokens = queueDB.byDepartment(dept);
      const waitingTokens = deptTokens.filter(t => t.status === 'waiting');
      const completedTokens = deptTokens.filter(t => t.status === 'completed');
      const avgWaitTime =
        waitingTokens.length > 0
          ? Math.round(waitingTokens.reduce((sum, t) => sum + t.estimatedWait, 0) / waitingTokens.length)
          : 0;

      return {
        department: dept,
        waiting: waitingTokens.length,
        called: deptTokens.filter(t => t.status === 'called').length,
        completed: completedTokens.length,
        avgWaitTime,
      };
    });
  }

  getTokenById(id: string): Token | undefined {
    return queueDB.getAll().find(t => t.id === id);
  }

  getPatientTokens(patientId: string): Token[] {
    return queueDB.getAll().filter(t => t.patientId === patientId);
  }

  tokensPerDay(): Record<string, number> {
    const all = queueDB.getAll();
    const result: Record<string, number> = {};
    all.forEach(t => {
      const date = t.createdAt.split('T')[0];
      result[date] = (result[date] || 0) + 1;
    });
    return result;
  }

  peakHours(): { hour: number; count: number }[] {
    const all = queueDB.getAll();
    const hours: Record<number, number> = {};
    all.forEach(t => {
      const hour = new Date(t.createdAt).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });
    return Object.entries(hours)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);
  }
}

export const queueService = new QueueService();