// User Database - Stores Profiles and Login Credentials
// Connected to: User Management Module

import { UserSchema } from './schemas';

const USER_DB_KEY = 'med_user_database';

class UserDatabase {
  private users: Map<string, UserSchema> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  // Load from localStorage
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(USER_DB_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.users = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error loading user database:', error);
    }
  }

  // Save to localStorage
  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.users);
      localStorage.setItem(USER_DB_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user database:', error);
    }
  }

  // Create user
  create(user: Omit<UserSchema, 'createdAt' | 'updatedAt'>): UserSchema {
    const now = new Date().toISOString();
    const userSchema: UserSchema = {
      ...user,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(user.id, userSchema);
    this.saveToStorage();
    return userSchema;
  }

  // Get user by ID
  getById(id: string): UserSchema | undefined {
    return this.users.get(id);
  }

  // Get user by email
  getByEmail(email: string): UserSchema | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  // Get all users
  getAll(): UserSchema[] {
    return Array.from(this.users.values());
  }

  // Get users by role
  getByRole(role: UserSchema['role']): UserSchema[] {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // Update user
  update(id: string, updates: Partial<Omit<UserSchema, 'id' | 'createdAt'>>): UserSchema | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updated: UserSchema = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  // Delete user
  delete(id: string): boolean {
    const deleted = this.users.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  // Verify user (for authentication)
  verifyCredentials(email: string, password: string): UserSchema | null {
    const user = this.getByEmail(email);
    if (user && user.password === password) { // In production, use hashed passwords
      return user;
    }
    return null;
  }

  // Check if email exists
  emailExists(email: string): boolean {
    return this.getByEmail(email) !== undefined;
  }

  // Verify doctor
  verifyDoctor(userId: string, verified: boolean, verifiedBy?: string): UserSchema | undefined {
    return this.update(userId, { verified });
  }
}

export const userDB = new UserDatabase();
