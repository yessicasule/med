// Doctor Database - Stores Doctor Details and Availability
// Connected to: Appointments, Verification Modules

import { DoctorSchema, AvailabilitySlot } from './schemas';

const DOCTOR_DB_KEY = 'med_doctor_database';

class DoctorDatabase {
  private doctors: Map<string, DoctorSchema> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(DOCTOR_DB_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.doctors = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error loading doctor database:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.doctors);
      localStorage.setItem(DOCTOR_DB_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving doctor database:', error);
    }
  }

  // Create doctor
  create(doctor: Omit<DoctorSchema, 'createdAt' | 'updatedAt'>): DoctorSchema {
    const now = new Date().toISOString();
    const doctorSchema: DoctorSchema = {
      ...doctor,
      createdAt: now,
      updatedAt: now,
    };
    this.doctors.set(doctor.id, doctorSchema);
    this.saveToStorage();
    return doctorSchema;
  }

  // Get doctor by ID
  getById(id: string): DoctorSchema | undefined {
    return this.doctors.get(id);
  }

  // Get doctor by user ID
  getByUserId(userId: string): DoctorSchema | undefined {
    for (const doctor of this.doctors.values()) {
      if (doctor.userId === userId) {
        return doctor;
      }
    }
    return undefined;
  }

  // Get all doctors
  getAll(): DoctorSchema[] {
    return Array.from(this.doctors.values());
  }

  // Search doctors
  search(filters: {
    name?: string;
    specialty?: string;
    location?: string;
    verified?: boolean;
  }): DoctorSchema[] {
    let results = this.getAll();

    // Filter by verification status
    if (filters.verified !== undefined) {
      results = results.filter(doc => 
        filters.verified ? doc.verificationStatus === 'verified' : doc.verificationStatus !== 'verified'
      );
    }

    // Filter by specialty
    if (filters.specialty) {
      results = results.filter(doc => 
        doc.specialty.toLowerCase().includes(filters.specialty!.toLowerCase())
      );
    }

    // Filter by location
    if (filters.location) {
      results = results.filter(doc => 
        doc.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    return results;
  }

  // Update doctor
  update(id: string, updates: Partial<Omit<DoctorSchema, 'id' | 'createdAt'>>): DoctorSchema | undefined {
    const doctor = this.doctors.get(id);
    if (!doctor) return undefined;

    const updated: DoctorSchema = {
      ...doctor,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.doctors.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  // Verify doctor
  verifyDoctor(doctorId: string, status: 'verified' | 'rejected', verifiedBy: string): DoctorSchema | undefined {
    const doctor = this.doctors.get(doctorId);
    if (!doctor) return undefined;

    return this.update(doctorId, {
      verificationStatus: status,
      verificationDate: new Date().toISOString(),
      verifiedBy,
    });
  }

  // Update availability slots
  updateAvailability(doctorId: string, slots: AvailabilitySlot[]): DoctorSchema | undefined {
    return this.update(doctorId, { availabilitySlots: slots });
  }

  // Get available slots for a date
  getAvailableSlots(doctorId: string, date: string): AvailabilitySlot[] {
    const doctor = this.getById(doctorId);
    if (!doctor) return [];

    return doctor.availabilitySlots.filter(
      slot => slot.date === date && slot.available
    );
  }

  // Mark slot as unavailable
  bookSlot(doctorId: string, slotId: string): boolean {
    const doctor = this.getById(doctorId);
    if (!doctor) return false;

    const slots = doctor.availabilitySlots.map(slot =>
      slot.id === slotId ? { ...slot, available: false } : slot
    );

    this.updateAvailability(doctorId, slots);
    return true;
  }
}

export const doctorDB = new DoctorDatabase();
