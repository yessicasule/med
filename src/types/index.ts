// User Management Types
export type UserRole = 'patient' | 'doctor' | 'receptionist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  specialty?: string; // For doctors
  verified?: boolean; // Doctor verification status
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  specialty?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Appointment Management Types
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  experience: string;
  avatar?: string;
  verified: boolean;
  availableSlots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  type: string;
  notes?: string;
  createdAt: string;
}

export interface AppointmentSearchFilters {
  name?: string;
  specialty?: string;
  location?: string;
}

export interface BookAppointmentData {
  doctorId: string;
  date: string;
  timeSlotId: string;
  type: string;
  notes?: string;
}

// Billing & Payments Types
export interface Invoice {
  id: string;
  patientId: string;
  appointmentId?: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  paymentMethod?: 'online' | 'offline' | 'cash' | 'card';
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentData {
  invoiceId: string;
  amount: number;
  paymentMethod: 'online' | 'offline' | 'cash' | 'card';
  transactionId?: string;
}

export interface BillingSummary {
  totalPending: number;
  totalPaid: number;
  overdueAmount: number;
  recentInvoices: Invoice[];
}

// Medical Records Types
export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId?: string;
  doctorName?: string;
  recordType: 'prescription' | 'lab_report' | 'xray' | 'diagnosis' | 'other';
  title: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  date: string;
  encrypted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadMedicalRecordData {
  recordType: MedicalRecord['recordType'];
  title: string;
  description?: string;
  file: File;
  appointmentId?: string;
}

export interface MedicalRecordFilters {
  recordType?: MedicalRecord['recordType'];
  startDate?: string;
  endDate?: string;
  doctorId?: string;
}

// Notifications Types
export type NotificationType = 'appointment' | 'billing' | 'prescription' | 'general';

export type NotificationChannel = 'email' | 'sms' | 'push';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NotificationSettings {
  appointmentReminder: boolean;
  billingAlerts: boolean;
  prescriptionReminders: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
}
