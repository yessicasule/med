// Database Schema Definitions

// User Database Schema
export interface UserSchema {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // Hashed in production
  role: 'patient' | 'doctor' | 'receptionist' | 'admin';
  specialty?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Doctor Database Schema
export interface DoctorSchema {
  id: string;
  userId: string; // Reference to User DB
  specialty: string;
  location: string;
  experience: string;
  rating: number;
  available: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDate?: string;
  verifiedBy?: string; // Admin ID or AI
  availabilitySlots: AvailabilitySlot[];
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

// Appointment Database Schema
export interface AppointmentSchema {
  id: string;
  patientId: string; // Reference to User DB
  doctorId: string; // Reference to Doctor DB
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress' | 'no-show';
  type: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  completedAt?: string;
}

// Billing Database Schema
export interface BillingSchema {
  id: string;
  invoiceId: string;
  patientId: string; // Reference to User DB
  appointmentId?: string; // Reference to Appointment DB
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'online' | 'offline' | 'cash' | 'card';
  transactionId?: string;
  items: BillingItem[];
  generatedBy?: string; // Receptionist ID
  createdAt: string;
  updatedAt: string;
}

export interface BillingItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Medical Records Database Schema
export interface MedicalRecordSchema {
  id: string;
  patientId: string; // Reference to User DB
  doctorId?: string; // Reference to Doctor DB
  appointmentId?: string; // Reference to Appointment DB
  recordType: 'prescription' | 'lab_report' | 'xray' | 'diagnosis' | 'other';
  title: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  encrypted: boolean;
  encryptionKey?: string; // Encrypted storage key
  date: string;
  uploadedBy: string; // Doctor ID or Patient ID
  createdAt: string;
  updatedAt: string;
}

// Notification Database Schema
export interface NotificationSchema {
  id: string;
  userId: string; // Reference to User DB
  type: 'appointment' | 'billing' | 'prescription' | 'general' | 'system';
  channel: 'email' | 'sms' | 'push' | 'in-app';
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  link?: string;
  metadata?: Record<string, any>;
  sentBy?: string; // System AI, Admin ID, or Doctor ID
  createdAt: string;
  updatedAt: string;
}

// Database Collections
export interface DatabaseCollections {
  users: Map<string, UserSchema>;
  doctors: Map<string, DoctorSchema>;
  appointments: Map<string, AppointmentSchema>;
  billing: Map<string, BillingSchema>;
  medicalRecords: Map<string, MedicalRecordSchema>;
  notifications: Map<string, NotificationSchema>;
}
