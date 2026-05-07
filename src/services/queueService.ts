import { queueApi, Token } from '@/api/queue';

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
  async generateToken(patientId: string | undefined, department: string, doctorId?: string, priority = false): Promise<Token> {
    return queueApi.createToken({ patientId, department, doctorId, priority });
  }

  async getCurrentQueue(department: string): Promise<Token[]> {
    const tokens = await queueApi.getTokens({ department });
    return tokens
      .filter(t => t.status === 'waiting' || t.status === 'called')
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority ? -1 : 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }

  async getNextPatients(department: string, limit = 5): Promise<Token[]> {
    const queue = await this.getCurrentQueue(department);
    return queue.slice(0, limit);
  }

  async callNextPatient(department: string, doctorId?: string): Promise<Token | null> {
    try {
      return await queueApi.callNext(department, doctorId);
    } catch {
      return null;
    }
  }

  async completeToken(id: string): Promise<void> {
    await queueApi.updateStatus(id, 'completed');
  }

  async cancelToken(id: string): Promise<void> {
    await queueApi.updateStatus(id, 'cancelled');
  }

  async pauseToken(id: string): Promise<void> {
    await queueApi.updateStatus(id, 'paused');
  }

  async resumeToken(id: string): Promise<void> {
    await queueApi.updateStatus(id, 'waiting');
  }

  predictWaitTime(queueAhead: number, avgConsultationTime = 10): number {
    return queueAhead * avgConsultationTime;
  }

  async getEstimatedWait(tokenId: string): Promise<number> {
    const all = await queueApi.getTokens();
    const token = all.find(t => t.id === tokenId);
    if (!token) return 0;

    const queue = await this.getCurrentQueue(token.department);
    const position = queue.findIndex(t => t.id === tokenId);
    if (position <= 0) return 0;

    const tokensAhead = queue.slice(0, position);
    return tokensAhead.reduce((wait, t) => wait + this.predictWaitTime(1), 0);
  }

  async stats(): Promise<QueueStats> {
    const stats = await queueApi.getStats();
    return {
      total: Number(stats.total || 0),
      completed: Number(stats.completed || 0),
      waiting: Number(stats.waiting || 0),
      called: Number(stats.called || 0),
      cancelled: Number(stats.cancelled || 0),
      paused: Number(stats.paused || 0),
    };
  }

  async departmentStats(): Promise<DepartmentStats[]> {
    const all = await queueApi.getTokens();
    const departments = [...new Set(all.map(t => t.department))];
    return departments.map(dept => {
      const deptTokens = all.filter(t => t.department === dept);
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

  async getTokenById(id: string): Promise<Token | undefined> {
    const all = await queueApi.getTokens();
    return all.find(t => t.id === id);
  }

  async getPatientTokens(patientId: string): Promise<Token[]> {
    return queueApi.getTokens({ patientId });
  }

  async tokensPerDay(): Promise<Record<string, number>> {
    const all = await queueApi.getTokens();
    const result: Record<string, number> = {};
    all.forEach(t => {
      const date = t.createdAt.split('T')[0];
      result[date] = (result[date] || 0) + 1;
    });
    return result;
  }

  async peakHours(): Promise<{ hour: number; count: number }[]> {
    const all = await queueApi.getTokens();
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