// Medical Records Database - Stores Prescriptions and Health Reports
// Connected to: Doctors, Patients Modules

import { MedicalRecordSchema } from './schemas';

const MEDICAL_RECORDS_DB_KEY = 'med_medical_records_database';

class MedicalRecordsDatabase {
  private records: Map<string, MedicalRecordSchema> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(MEDICAL_RECORDS_DB_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.records = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error loading medical records database:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.records);
      localStorage.setItem(MEDICAL_RECORDS_DB_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving medical records database:', error);
    }
  }

  // Create medical record
  create(record: Omit<MedicalRecordSchema, 'createdAt' | 'updatedAt'>): MedicalRecordSchema {
    const now = new Date().toISOString();
    const recordSchema: MedicalRecordSchema = {
      ...record,
      encrypted: record.encrypted ?? true, // Default to encrypted
      createdAt: now,
      updatedAt: now,
    };
    this.records.set(record.id, recordSchema);
    this.saveToStorage();
    return recordSchema;
  }

  // Get record by ID
  getById(id: string): MedicalRecordSchema | undefined {
    return this.records.get(id);
  }

  // Get records by patient ID
  getByPatientId(patientId: string): MedicalRecordSchema[] {
    return Array.from(this.records.values())
      .filter(record => record.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Get records by doctor ID
  getByDoctorId(doctorId: string): MedicalRecordSchema[] {
    return Array.from(this.records.values())
      .filter(record => record.doctorId === doctorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get records by appointment ID
  getByAppointmentId(appointmentId: string): MedicalRecordSchema[] {
    return Array.from(this.records.values())
      .filter(record => record.appointmentId === appointmentId);
  }

  // Filter records
  filter(filters: {
    patientId?: string;
    doctorId?: string;
    recordType?: MedicalRecordSchema['recordType'];
    startDate?: string;
    endDate?: string;
  }): MedicalRecordSchema[] {
    let results = Array.from(this.records.values());

    if (filters.patientId) {
      results = results.filter(record => record.patientId === filters.patientId);
    }
    if (filters.doctorId) {
      results = results.filter(record => record.doctorId === filters.doctorId);
    }
    if (filters.recordType) {
      results = results.filter(record => record.recordType === filters.recordType);
    }
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      results = results.filter(record => new Date(record.date) >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      results = results.filter(record => new Date(record.date) <= end);
    }

    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Update record
  update(id: string, updates: Partial<Omit<MedicalRecordSchema, 'id' | 'createdAt'>>): MedicalRecordSchema | undefined {
    const record = this.records.get(id);
    if (!record) return undefined;

    const updated: MedicalRecordSchema = {
      ...record,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.records.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  // Delete record
  delete(id: string): boolean {
    const deleted = this.records.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  // Get patient medical history
  getPatientHistory(patientId: string, limit?: number): MedicalRecordSchema[] {
    const records = this.getByPatientId(patientId);
    return limit ? records.slice(0, limit) : records;
  }

  // Get recent records
  getRecent(patientId?: string, doctorId?: string, limit: number = 10): MedicalRecordSchema[] {
    let results = Array.from(this.records.values());

    if (patientId) {
      results = results.filter(record => record.patientId === patientId);
    }
    if (doctorId) {
      results = results.filter(record => record.doctorId === doctorId);
    }

    return results
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export const medicalRecordsDB = new MedicalRecordsDatabase();
