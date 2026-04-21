import { Doctor, Appointment, AppointmentSearchFilters, BookAppointmentData, TimeSlot } from '@/types';
import { authApi } from './auth';
import { doctorDB, appointmentDB, userDB, notificationDB } from '@/db';
import { PatientFlowService } from '@/services/flowService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Appointment Management API
export const appointmentsApi = {
  // Search doctors by name, specialty, or location - Uses Patient Flow
  async searchDoctors(filters: AppointmentSearchFilters): Promise<Doctor[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.specialty) queryParams.append('specialty', filters.specialty);
      if (filters.location) queryParams.append('location', filters.location);

      const response = await fetch(`${API_BASE_URL}/appointments/doctors?${queryParams}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authApi.getToken()}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // Fall through to local database
    }

    // Use local database via Patient Flow
    const doctors = PatientFlowService.searchDoctor({
      name: filters.name,
      specialty: filters.specialty,
      location: filters.location,
    });

    // Map to Doctor type
    return doctors.map(doc => {
      const user = userDB.getById(doc.userId);
      return {
        id: doc.id,
        name: user?.name || 'Dr. Unknown',
        specialty: doc.specialty,
        location: doc.location,
        rating: doc.rating,
        experience: doc.experience,
        verified: doc.verificationStatus === 'verified',
        availableSlots: doc.availabilitySlots.map(slot => ({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: slot.available,
        })),
      };
    });
  },

  // Get doctor by ID
  async getDoctor(doctorId: string): Promise<Doctor> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/doctors/${doctorId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authApi.getToken()}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Doctor not found');
    } catch {
      // Fallback to local database
      const doctorDoc = doctorDB.getById(doctorId);
      if (!doctorDoc) {
        throw new Error('Doctor not found');
      }
      const user = userDB.getById(doctorDoc.userId);
      return {
        id: doctorDoc.id,
        name: user?.name || 'Dr. Unknown',
        specialty: doctorDoc.specialty,
        location: doctorDoc.location,
        rating: doctorDoc.rating,
        experience: doctorDoc.experience,
        verified: doctorDoc.verificationStatus === 'verified',
        availableSlots: doctorDoc.availabilitySlots.map(slot => ({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: slot.available,
        })),
      };
    }
  },

  // Book appointment - Uses Patient Flow
  async bookAppointment(data: BookAppointmentData): Promise<Appointment> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authApi.getToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // Fall through to local database
    }

    // Use local database via Patient Flow
    const currentUser = authApi.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Get the doctor to find the time from slotId
    const doctor = doctorDB.getById(data.doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Find the slot to get the time
    const slot = doctor.availabilitySlots.find(s => s.id === data.timeSlotId);
    if (!slot || !slot.available) {
      throw new Error('Time slot is not available');
    }

    const appointment = await PatientFlowService.bookAppointment(
      currentUser.id,
      data.doctorId,
      data.date,
      slot.startTime, // Use the actual time string
      data.type
    );

    // Mark the slot as unavailable using slotId
    doctorDB.bookSlot(data.doctorId, data.timeSlotId);

    const doctorUser = userDB.getById(doctor.userId);

    // Send notification to doctor about new appointment
    if (doctor?.userId) {
      notificationDB.send(
        doctor.userId,
        'appointment',
        'in-app',
        'New Appointment Scheduled',
        `You have a new appointment scheduled with ${currentUser.name} on ${data.date} at ${data.timeSlotId}`,
        'system',
        '/doctor-portal'
      );
    }

    return {
      id: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      doctorName: doctorUser?.name || 'Dr. Unknown',
      doctorSpecialty: doctor?.specialty || 'General',
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      type: appointment.type,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
    };
  },

  // Cancel appointment - Connected to Appointment DB
  async cancelAppointment(appointmentId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authApi.getToken()}`,
        },
      });

      if (response.ok) {
        return;
      }
    } catch (error) {
      // Fall through to local database
    }

    // Use local database
    const appointment = appointmentDB.cancel(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
  },

  // Get appointment history - Connected to Appointment DB
  async getAppointmentHistory(patientId?: string): Promise<Appointment[]> {
    try {
      const userId = patientId || authApi.getCurrentUser()?.id;
      const response = await fetch(`${API_BASE_URL}/appointments/history${userId ? `?patientId=${userId}` : ''}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authApi.getToken()}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // Fall through to local database
    }

    // Use local database
    const userId = patientId || authApi.getCurrentUser()?.id;
    if (!userId) {
      return [];
    }

    const appointments = appointmentDB.getByPatientId(userId);
    
    return appointments.map(apt => {
      const doctor = doctorDB.getById(apt.doctorId);
      const doctorUser = doctor ? userDB.getById(doctor.userId) : null;

      return {
        id: apt.id,
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        doctorName: doctorUser?.name || 'Dr. Unknown',
        doctorSpecialty: doctor?.specialty || 'General',
        date: apt.date,
        time: apt.time,
        status: apt.status as Appointment['status'],
        type: apt.type,
        notes: apt.notes,
        createdAt: apt.createdAt,
      };
    });
  },

  // Get appointments by doctor - Connected to Appointment DB
  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/doctor/${doctorId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authApi.getToken()}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // Fall through to local database
    }

    // Use local database
    const appointments = appointmentDB.getByDoctorId(doctorId);
    
    return appointments.map(apt => {
      const doctor = doctorDB.getById(apt.doctorId);
      const doctorUser = doctor ? userDB.getById(doctor.userId) : null;
      const patient = userDB.getById(apt.patientId);

      return {
        id: apt.id,
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        doctorName: doctorUser?.name || 'Dr. Unknown',
        doctorSpecialty: doctor?.specialty || 'General',
        date: apt.date,
        time: apt.time,
        status: apt.status as Appointment['status'],
        type: apt.type,
        notes: apt.notes,
        createdAt: apt.createdAt,
      };
    });
  },

  // Get available time slots for a doctor on a specific date
  async getAvailableSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
    const response = await fetch(`${API_BASE_URL}/appointments/slots?doctorId=${doctorId}&date=${date}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
    }).catch(() => {
      // Demo fallback
      return {
        ok: true,
        json: async () => [
          { id: '1', startTime: '09:00', endTime: '09:30', available: true },
          { id: '2', startTime: '10:00', endTime: '10:30', available: true },
          { id: '3', startTime: '11:00', endTime: '11:30', available: false },
          { id: '4', startTime: '14:00', endTime: '14:30', available: true },
        ],
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to fetch available slots');
    }

    return await response.json();
  },
};
