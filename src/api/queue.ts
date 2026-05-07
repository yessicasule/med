import { authApi } from "./auth";

export type QueueStatus = "waiting" | "called" | "completed" | "cancelled" | "paused";

export interface Token {
  id: string;
  tokenNumber: string;
  patientId?: string;
  patientName?: string;
  department: string;
  doctorId?: string;
  status: QueueStatus;
  priority: boolean;
  createdAt: string;
  estimatedWait: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = authApi.getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "API request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
};

export const queueApi = {
  createToken: (payload: {
    patientId?: string;
    patientName?: string;
    department: string;
    doctorId?: string;
    priority?: boolean;
  }) => request<Token>("/queue-tokens", { method: "POST", body: JSON.stringify(payload) }),

  getTokens: (filters?: { department?: string; patientId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.department) params.set("department", filters.department);
    if (filters?.patientId) params.set("patientId", filters.patientId);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return request<Token[]>(`/queue-tokens${suffix}`);
  },

  updateStatus: (id: string, status: QueueStatus) =>
    request<Token>(`/queue-tokens/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  callNext: (department: string, doctorId?: string) =>
    request<Token>(`/queue-tokens/${department}/call-next`, {
      method: "POST",
      body: JSON.stringify({ doctorId }),
    }),

  getStats: () =>
    request<{
      total: string;
      waiting: string;
      called: string;
      completed: string;
      cancelled: string;
      paused: string;
    }>("/analytics/queue-stats"),
};
