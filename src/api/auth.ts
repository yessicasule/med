import { User, RegisterData, LoginData, AuthResponse } from '@/types';
import { userDB, doctorDB } from '@/db';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Mock localStorage for demo - in production, use secure token storage
const TOKEN_KEY = 'med_auth_token';
const USER_KEY = 'med_user_data';

// User Management API
export const authApi = {
  // Register user (patient/doctor) - Uses Patient Flow
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const result: AuthResponse = await response.json();
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    return result;
  },

  // Login and authentication
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Invalid email or password');
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

  // Doctor verification (admin or AI-based) - Uses Administrator Flow
  async verifyDoctor(doctorId: string, verified: boolean): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-doctor/${doctorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ verified }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // Fall through to local database
    }

    // Use local database via Administrator Flow
    const { AdministratorFlowService } = await import('@/services/flowService');
    const adminUser = this.getCurrentUser();
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const doctor = doctorDB.getById(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    await AdministratorFlowService.verifyDoctor(adminUser.id, doctorId, verified);

    const user = userDB.getById(doctor.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      specialty: user.specialty,
      verified: user.verified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
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
