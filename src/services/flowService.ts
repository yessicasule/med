// Process Flow Service - Ensures all user flows are properly connected

import {
  userDB,
  doctorDB,
  appointmentDB,
  billingDB,
  medicalRecordsDB,
  notificationDB,
} from '@/db';
import { UserSchema, AppointmentSchema } from '@/db/schemas';

/**
 * Patient Flow:
 * Register/Login → Search Doctor → Book Appointment → Pay Bill → Get Notification → View Medical Record
 */
export class PatientFlowService {
  // Step 1: Register/Login
  static async registerAndLogin(email: string, password: string, userData: any) {
    // Check if user exists
    const existingUser = userDB.getByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    const user = userDB.create({
      id: `USER-${Date.now()}`,
      ...userData,
      email,
      password, // In production, hash this
      verified: userData.role !== 'doctor',
    });

    // Auto-login after registration
    return userDB.verifyCredentials(email, password);
  }

  // Step 2: Search Doctor
  static searchDoctor(filters: { name?: string; specialty?: string; location?: string }) {
    return doctorDB.search({
      ...filters,
      verified: true,
    });
  }

  // Step 3: Book Appointment
  static async bookAppointment(patientId: string, doctorId: string, date: string, time: string, type: string) {
    // Create appointment
    const appointment = appointmentDB.create({
      id: `APT-${Date.now()}`,
      patientId,
      doctorId,
      date,
      time,
      status: 'scheduled',
      type,
    });

    // Note: Slot booking is handled in the API layer since we need slotId, not time

    // Send notification
    notificationDB.send(
      patientId,
      'appointment',
      'in-app',
      'Appointment Booked',
      `Your appointment has been successfully booked for ${date} at ${time}`,
      'system',
      '/appointments/history'
    );

    return appointment;
  }

  // Step 4: Pay Bill
  static async payBill(invoiceId: string, paymentMethod: 'online' | 'offline' | 'cash' | 'card', transactionId?: string) {
    const invoice = billingDB.processPayment(invoiceId, paymentMethod, transactionId);
    
    if (invoice) {
      // Send payment confirmation notification
      notificationDB.send(
        invoice.patientId,
        'billing',
        'in-app',
        'Payment Received',
        `Your payment of $${invoice.amount} has been successfully processed`,
        'system',
        '/billing'
      );
    }

    return invoice;
  }

  // Step 5: Get Notification (already handled in notificationDB)
  // Step 6: View Medical Record (handled in medicalRecordsDB)
}

/**
 * Doctor Flow:
 * Login → View Schedule → Upload Prescription → Review Patient History
 */
export class DoctorFlowService {
  // Step 1: Login (uses userDB)

  // Step 2: View Schedule
  static viewSchedule(doctorId: string, date?: string) {
    if (date) {
      return appointmentDB.getByDate(date).filter(apt => apt.doctorId === doctorId);
    }
    return appointmentDB.getByDoctorId(doctorId);
  }

  // Step 3: Upload Prescription
  static async uploadPrescription(
    doctorId: string,
    patientId: string,
    appointmentId: string | undefined,
    prescriptionData: any
  ) {
    // Create medical record
    const record = medicalRecordsDB.create({
      id: `MR-${Date.now()}`,
      patientId,
      doctorId,
      appointmentId,
      recordType: 'prescription',
      title: prescriptionData.title,
      description: prescriptionData.description,
      fileUrl: prescriptionData.fileUrl,
      fileName: prescriptionData.fileName,
      encrypted: true,
      date: new Date().toISOString().split('T')[0],
      uploadedBy: doctorId,
    });

    // Send notification to patient
    notificationDB.send(
      patientId,
      'prescription',
      'in-app',
      'New Prescription Available',
      `Dr. has uploaded a new prescription for you`,
      doctorId,
      '/medical-records'
    );

    // Mark appointment as completed if provided
    if (appointmentId) {
      appointmentDB.complete(appointmentId);
    }

    return record;
  }

  // Step 4: Review Patient History
  static reviewPatientHistory(patientId: string) {
    return {
      appointments: appointmentDB.getByPatientId(patientId),
      medicalRecords: medicalRecordsDB.getByPatientId(patientId),
    };
  }
}

/**
 * Receptionist Flow:
 * Login → Generate Bill → Record Payment → Provide Invoice
 */
export class ReceptionistFlowService {
  // Step 1: Login (uses userDB)

  // Step 2: Generate Bill
  static generateBill(
    receptionistId: string,
    patientId: string,
    appointmentId: string | undefined,
    items: Array<{ description: string; quantity: number; unitPrice: number }>
  ) {
    const invoice = billingDB.generateInvoice(patientId, appointmentId, items, receptionistId);

    // Send notification to patient
    notificationDB.send(
      patientId,
      'billing',
      'in-app',
      'New Invoice Generated',
      `A new invoice of $${invoice.amount} has been generated for you`,
      receptionistId,
      '/billing'
    );

    return invoice;
  }

  // Step 3: Record Payment
  static recordPayment(invoiceId: string, paymentMethod: 'online' | 'offline' | 'cash' | 'card', transactionId?: string) {
    return billingDB.processPayment(invoiceId, paymentMethod, transactionId);
  }

  // Step 4: Provide Invoice (return invoice data)
  static getInvoice(invoiceId: string) {
    return billingDB.getById(invoiceId);
  }
}

/**
 * Administrator Flow:
 * Login → Verify Doctor → Manage Users → Monitor System
 */
export class AdministratorFlowService {
  // Step 1: Login (uses userDB)

  // Step 2: Verify Doctor
  static async verifyDoctor(adminId: string, doctorId: string, verified: boolean) {
    // Update doctor verification in doctorDB
    const doctor = doctorDB.getById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    const status = verified ? 'verified' : 'rejected';
    doctorDB.verifyDoctor(doctorId, status, adminId);

    // Update user verification
    userDB.verifyDoctor(doctor.userId, verified, adminId);

    // Send notification to doctor
    notificationDB.send(
      doctor.userId,
      'general',
      'in-app',
      verified ? 'Doctor Verification Approved' : 'Doctor Verification Rejected',
      verified
        ? 'Your doctor account has been verified and is now active'
        : 'Your doctor verification request has been rejected. Please contact support.',
      adminId,
      verified ? '/doctor-portal' : '/register'
    );

    return doctor;
  }

  // Step 3: Manage Users
  static manageUsers() {
    return {
      allUsers: userDB.getAll(),
      byRole: (role: UserSchema['role']) => userDB.getByRole(role),
    };
  }

  // Step 4: Monitor System
  static monitorSystem() {
    return {
      totalUsers: userDB.getAll().length,
      totalDoctors: doctorDB.getAll().length,
      totalAppointments: appointmentDB.getAll().length,
      pendingVerifications: doctorDB.getAll().filter(doc => doc.verificationStatus === 'pending').length,
      pendingBills: billingDB.getByStatus('pending').length,
      recentNotifications: notificationDB.getRecent(undefined, 20),
    };
  }
}

/**
 * AI Flow:
 * Monitor → Validate → Notify → Log → Report
 */
export class AIFlowService {
  // Step 1: Monitor
  static monitor() {
    return {
      appointments: appointmentDB.getAll(),
      bills: billingDB.getAll(),
      records: medicalRecordsDB.getAll(),
      notifications: notificationDB.getAll(),
    };
  }

  // Step 2: Validate
  static validate(data: {
    type: 'appointment' | 'doctor' | 'billing' | 'record';
    data: any;
  }) {
    switch (data.type) {
      case 'appointment':
        // Validate appointment conflicts
        const conflicts = appointmentDB.getByDate(data.data.date).filter(
          apt => apt.doctorId === data.data.doctorId && apt.time === data.data.time && apt.status !== 'cancelled'
        );
        return conflicts.length === 0;
      
      case 'doctor':
        // Validate doctor credentials (AI-based verification)
        // This would integrate with AI service in production
        return true;
      
      case 'billing':
        // Validate billing amounts
        const total = data.data.items.reduce((sum: number, item: any) => sum + item.total, 0);
        return total === data.data.amount;
      
      case 'record':
        // Validate record completeness
        return data.data.title && data.data.recordType;
      
      default:
        return false;
    }
  }

  // Step 3: Notify
  static notify(userId: string, type: string, message: string, link?: string) {
    return notificationDB.send(
      userId,
      type as any,
      'in-app',
      'System Notification',
      message,
      'system-ai',
      link
    );
  }

  // Step 4: Log (all operations are logged in database timestamps)
  // Step 5: Report
  static generateReport() {
    const today = new Date().toISOString().split('T')[0];
    const appointments = appointmentDB.getByDate(today);
    const overdueBills = billingDB.getByStatus('overdue');

    return {
      date: today,
      appointmentsToday: appointments.length,
      overdueBills: overdueBills.length,
      systemHealth: 'operational',
      recommendations: [
        overdueBills.length > 0 ? 'Follow up on overdue bills' : null,
        appointments.length > 20 ? 'Consider adding more doctor slots' : null,
      ].filter(Boolean),
    };
  }

  // Automated AI tasks
  static async runAutomatedTasks() {
    // Check for overdue appointments and send reminders
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const tomorrowAppointments = appointmentDB.getByDate(tomorrowStr)
      .filter(apt => apt.status === 'scheduled');

    tomorrowAppointments.forEach(apt => {
      notificationDB.send(
        apt.patientId,
        'appointment',
        'in-app',
        'Appointment Reminder',
        `You have an appointment tomorrow at ${apt.time}`,
        'system-ai',
        '/appointments/history'
      );
    });

    // Check for overdue bills
    const overdue = billingDB.getByStatus('overdue');
    overdue.forEach(bill => {
      if (!bill.status) {
        billingDB.markOverdue(bill.id);
      }
      notificationDB.send(
        bill.patientId,
        'billing',
        'in-app',
        'Overdue Bill Alert',
        `Your bill of $${bill.amount} is overdue. Please make payment.`,
        'system-ai',
        '/billing'
      );
    });
  }
}
