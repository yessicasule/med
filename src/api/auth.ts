import { User, RegisterData, LoginData, AuthResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Mock localStorage for demo - in production, use secure token storage
const TOKEN_KEY = 'med_auth_token';
const USER_KEY = 'med_user_data';

// User Management API
export const authApi = {
  // Register user (patient/doctor)
  async register(data: RegisterData): Promise<AuthResponse> {
    // In production, this would call: POST /api/auth/register
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {
      // Demo fallback - return mock data
      return {
        ok: true,
        json: async () => ({
          user: {
            id: Date.now().toString(),
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            specialty: data.specialty,
            verified: data.role === 'doctor' ? false : true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: `mock_token_${Date.now()}`,
        }),
      } as Response;
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }

    const result: AuthResponse = await response.json();
    // Store token and user data
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    return result;
  },

  // Login and authentication
  async login(data: LoginData): Promise<AuthResponse> {
    // In production, this would call: POST /api/auth/login
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {
      // Demo fallback
      return {
        ok: true,
        json: async () => ({
          user: {
            id: '1',
            name: 'Demo User',
            email: data.email,
            phone: '+1234567890',
            role: 'patient',
            verified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: `mock_token_${Date.now()}`,
        }),
      } as Response;
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    const result: AuthResponse = await response.json();
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    return result;
  },

  // Get current user
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Logout
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Doctor verification (admin or AI-based)
  async verifyDoctor(doctorId: string, verified: boolean): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-doctor/${doctorId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({ verified }),
    }).catch(() => {
      // Demo fallback
      return {
        ok: true,
        json: async () => ({
          id: doctorId,
          name: 'Dr. Verified',
          email: 'doctor@example.com',
          phone: '+1234567890',
          role: 'doctor',
          verified,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      } as Response;
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Verification failed' }));
      throw new Error(error.message || 'Verification failed');
    }

    return await response.json();
  },

  // Get all users (for admin)
  async getUsers(role?: string): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/auth/users${role ? `?role=${role}` : ''}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
    }).catch(() => {
      // Demo fallback
      return {
        ok: true,
        json: async () => [],
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return await response.json();
  },
};
