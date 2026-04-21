export type QueueStatus = 'waiting' | 'called' | 'completed' | 'cancelled' | 'paused';

export interface Token {
  id: string;
  tokenNumber: string;
  patientId?: string;
  department: string;
  doctorId?: string;
  status: QueueStatus;
  priority: boolean;
  createdAt: string;
  estimatedWait: number;
}

const KEY = 'mediqueue_tokens';

const read = (): Token[] => JSON.parse(localStorage.getItem(KEY) || '[]');
const write = (data: Token[]) => localStorage.setItem(KEY, JSON.stringify(data));

export const queueDB = {
  getAll: (): Token[] => read(),
  saveAll: (tokens: Token[]) => write(tokens),
  add: (token: Token) => write([...read(), token]),
  update: (id: string, patch: Partial<Token>) => {
    const data = read().map(t => t.id === id ? { ...t, ...patch } : t);
    write(data);
  },
  remove: (id: string) => write(read().filter(t => t.id !== id)),
  byDepartment: (department: string) => read().filter(t => t.department === department),
  byDoctor: (doctorId: string) => read().filter(t => t.doctorId === doctorId),
  clear: () => localStorage.removeItem(KEY),
};