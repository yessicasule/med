// Appointment Database - Stores Appointment Records
// Connected to: Patients, Doctors Modules

import { AppointmentSchema } from './schemas';

const APPOINTMENT_DB_KEY = 'med_appointment_database';

class AppointmentDatabase {
  private appointments: Map<string, AppointmentSchema> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(APPOINTMENT_DB_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.appointments = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error loading appointment database:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.appointments);
      localStorage.setItem(APPOINTMENT_DB_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving appointment database:', error);
    }
  }

  // Create appointment
  create(appointment: Omit<AppointmentSchema, 'createdAt' | 'updatedAt'>): AppointmentSchema {
    const now = new Date().toISOString();
    const appointmentSchema: AppointmentSchema = {
      ...appointment,
      createdAt: now,
      updatedAt: now,
    };
    this.appointments.set(appointment.id, appointmentSchema);
    this.saveToStorage();
    return appointmentSchema;
  }

  // Get appointment by ID
  getById(id: string): AppointmentSchema | undefined {
    return this.appointments.get(id);
  }

  // Get appointments by patient ID
  getByPatientId(patientId: string): AppointmentSchema[] {
    return Array.from(this.appointments.values())
      .filter(apt => apt.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get appointments by doctor ID
  getByDoctorId(doctorId: string): AppointmentSchema[] {
    return Array.from(this.appointments.values())
      .filter(apt => apt.doctorId === doctorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get appointments by date
  getByDate(date: string): AppointmentSchema[] {
    return Array.from(this.appointments.values())
      .filter(apt => apt.date === date);
  }

  // Get appointments by status
  getByStatus(status: AppointmentSchema['status']): AppointmentSchema[] {
    return Array.from(this.appointments.values())
      .filter(apt => apt.status === status);
  }

  // Get upcoming appointments
  getUpcoming(patientId?: string, doctorId?: string): AppointmentSchema[] {
    const now = new Date();
    let results = Array.from(this.appointments.values());

    if (patientId) {
      results = results.filter(apt => apt.patientId === patientId);
    }
    if (doctorId) {
      results = results.filter(apt => apt.doctorId === doctorId);
    }

    return results
      .filter(apt => {
        const aptDate = new Date(`${apt.date}T${apt.time}`);
        return aptDate > now && apt.status === 'scheduled';
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  }

  // Update appointment
  update(id: string, updates: Partial<Omit<AppointmentSchema, 'id' | 'createdAt'>>): AppointmentSchema | undefined {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;

    const updated: AppointmentSchema = {
      ...appointment,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.appointments.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  // Cancel appointment
  cancel(id: string): AppointmentSchema | undefined {
    return this.update(id, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    });
  }

  // Complete appointment
  complete(id: string): AppointmentSchema | undefined {
    return this.update(id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  }

  // Mark as in-progress
  markInProgress(id: string): AppointmentSchema | undefined {
    return this.update(id, {
      status: 'in-progress',
    });
  }

  // Delete appointment
  delete(id: string): boolean {
    const deleted = this.appointments.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  // Get appointment history
  getHistory(patientId?: string, doctorId?: string, limit?: number): AppointmentSchema[] {
    let results = Array.from(this.appointments.values());

    if (patientId) {
      results = results.filter(apt => apt.patientId === patientId);
    }
    if (doctorId) {
      results = results.filter(apt => apt.doctorId === doctorId);
    }

    const sorted = results.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return limit ? sorted.slice(0, limit) : sorted;
  }
}

export const appointmentDB = new AppointmentDatabase();
