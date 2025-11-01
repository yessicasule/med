import { Doctor, Appointment, AppointmentSearchFilters, BookAppointmentData, TimeSlot } from '@/types';
import { authApi } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Appointment Management API
export const appointmentsApi = {
  // Search doctors by name, specialty, or location
  async searchDoctors(filters: AppointmentSearchFilters): Promise<Doctor[]> {
    const queryParams = new URLSearchParams();
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.specialty) queryParams.append('specialty', filters.specialty);
    if (filters.location) queryParams.append('location', filters.location);

    const response = await fetch(`${API_BASE_URL}/appointments/doctors?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
    }).catch(() => {
      // Demo fallback - return mock doctors
      return {
        ok: true,
        json: async () => [
          {
            id: '1',
            name: 'Dr. Sarah Johnson',
            specialty: 'Cardiologist',
            location: 'Medical Center East',
            rating: 4.9,
            experience: '15 years',
            verified: true,
            availableSlots: [
              { id: '1', startTime: '09:00', endTime: '09:30', available: true },
              { id: '2', startTime: '10:00', endTime: '10:30', available: true },
              { id: '3', startTime: '11:00', endTime: '11:30', available: false },
            ],
          },
          {
            id: '2',
            name: 'Dr. Michael Chen',
            specialty: 'General Physician',
            location: 'City Hospital',
            rating: 4.8,
            experience: '12 years',
            verified: true,
            availableSlots: [
              { id: '4', startTime: '14:00', endTime: '14:30', available: true },
              { id: '5', startTime: '15:00', endTime: '15:30', available: true },
            ],
          },
          {
            id: '3',
            name: 'Dr. Emily Rodriguez',
            specialty: 'Pediatrician',
            location: 'Wellness Clinic',
            rating: 4.9,
            experience: '10 years',
            verified: true,
            availableSlots: [
              { id: '6', startTime: '09:00', endTime: '09:30', available: true },
              { id: '7', startTime: '10:00', endTime: '10:30', available: true },
            ],
          },
        ],
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to search doctors');
    }

    return await response.json();
  },

  // Get doctor by ID
  async getDoctor(doctorId: string): Promise<Doctor> {
    const response = await fetch(`${API_BASE_URL}/appointments/doctors/${doctorId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
    }).catch(() => {
      // Demo fallback
      return {
        ok: true,
        json: async () => ({
          id: doctorId,
          name: 'Dr. Example',
          specialty: 'General',
          location: 'Hospital',
          rating: 4.5,
          experience: '5 years',
          verified: true,
          availableSlots: [],
        }),
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to fetch doctor');
    }

    return await response.json();
  },

  // Book appointment
  async bookAppointment(data: BookAppointmentData): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authApi.getToken()}`,
      },
      body: JSON.stringify(data),
    }).catch(() => {
      // Demo fallback
      const doctor = this.getDoctor(data.doctorId);
      return {
        ok: true,
        json: async () => ({
          id: Date.now().toString(),
          patientId: authApi.getCurrentUser()?.id || '1',
          doctorId: data.doctorId,
          doctorName: 'Dr. Example',
          doctorSpecialty: 'General',
          date: data.date,
          time: data.timeSlotId,
          status: 'scheduled',
          type: data.type,
          notes: data.notes,
          createdAt: new Date().toISOString(),
        }),
      } as Response;
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to book appointment' }));
      throw new Error(error.message || 'Failed to book appointment');
    }

    return await response.json();
  },

  // Cancel appointment
  async cancelAppointment(appointmentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
    }).catch(() => {
      return { ok: true } as Response;
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to cancel appointment' }));
      throw new Error(error.message || 'Failed to cancel appointment');
    }
  },

  // Get appointment history
  async getAppointmentHistory(patientId?: string): Promise<Appointment[]> {
    const userId = patientId || authApi.getCurrentUser()?.id;
    const response = await fetch(`${API_BASE_URL}/appointments/history${userId ? `?patientId=${userId}` : ''}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
    }).catch(() => {
      // Demo fallback
      return {
        ok: true,
        json: async () => [
          {
            id: '1',
            patientId: userId || '1',
            doctorId: '1',
            doctorName: 'Dr. Sarah Johnson',
            doctorSpecialty: 'Cardiologist',
            date: '2025-10-20',
            time: '10:00',
            status: 'completed',
            type: 'Check-up',
            createdAt: '2025-10-15T10:00:00Z',
          },
          {
            id: '2',
            patientId: userId || '1',
            doctorId: '2',
            doctorName: 'Dr. Michael Chen',
            doctorSpecialty: 'General Physician',
            date: '2025-11-01',
            time: '10:00',
            status: 'scheduled',
            type: 'Follow-up',
            createdAt: '2025-10-25T10:00:00Z',
          },
        ],
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to fetch appointment history');
    }

    return await response.json();
  },

  // Get appointments by doctor
  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    const response = await fetch(`${API_BASE_URL}/appointments/doctor/${doctorId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
    }).catch(() => {
      return {
        ok: true,
        json: async () => [],
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to fetch doctor appointments');
    }

    return await response.json();
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
