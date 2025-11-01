import { MedicalRecord, UploadMedicalRecordData, MedicalRecordFilters } from '@/types';
import { authApi } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Medical Records API
export const medicalRecordsApi = {
  // Upload prescription or report
  async uploadRecord(data: UploadMedicalRecordData): Promise<MedicalRecord> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('recordType', data.recordType);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.appointmentId) formData.append('appointmentId', data.appointmentId);

    const response = await fetch(`${API_BASE_URL}/medical-records`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
      body: formData,
    }).catch(() => {
      // Demo fallback
      return {
        ok: true,
        json: async () => ({
          id: Date.now().toString(),
          patientId: authApi.getCurrentUser()?.id || '1',
          recordType: data.recordType,
          title: data.title,
          description: data.description,
          fileName: data.file.name,
          date: new Date().toISOString().split('T')[0],
          encrypted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      } as Response;
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to upload record' }));
      throw new Error(error.message || 'Failed to upload record');
    }

    return await response.json();
  },

  // Get medical records for a patient
  async getRecords(patientId?: string, filters?: MedicalRecordFilters): Promise<MedicalRecord[]> {
    const userId = patientId || authApi.getCurrentUser()?.id;
    const queryParams = new URLSearchParams();
    queryParams.append('patientId', userId || '');
    if (filters?.recordType) queryParams.append('recordType', filters.recordType);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.doctorId) queryParams.append('doctorId', filters.doctorId);

    const response = await fetch(`${API_BASE_URL}/medical-records?${queryParams}`, {
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
            recordType: 'prescription',
            title: 'Blood Pressure Medication',
            description: 'Prescribed for hypertension management',
            fileName: 'prescription_001.pdf',
            date: '2025-10-20',
            encrypted: true,
            createdAt: '2025-10-20T10:00:00Z',
            updatedAt: '2025-10-20T10:00:00Z',
          },
          {
            id: '2',
            patientId: userId || '1',
            doctorId: '2',
            doctorName: 'Dr. Michael Chen',
            recordType: 'lab_report',
            title: 'Complete Blood Count',
            description: 'Lab results from annual check-up',
            fileName: 'lab_report_001.pdf',
            date: '2025-10-18',
            encrypted: true,
            createdAt: '2025-10-18T14:00:00Z',
            updatedAt: '2025-10-18T14:00:00Z',
          },
          {
            id: '3',
            patientId: userId || '1',
            doctorId: '1',
            doctorName: 'Dr. Sarah Johnson',
            recordType: 'xray',
            title: 'Chest X-Ray',
            description: 'Routine chest X-ray examination',
            fileName: 'xray_chest_001.jpg',
            date: '2025-10-15',
            encrypted: true,
            createdAt: '2025-10-15T09:00:00Z',
            updatedAt: '2025-10-15T09:00:00Z',
          },
        ],
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to fetch medical records');
    }

    return await response.json();
  },

  // Get record by ID
  async getRecord(recordId: string): Promise<MedicalRecord> {
    const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
    }).catch(() => {
      return {
        ok: true,
        json: async () => ({
          id: recordId,
          patientId: '1',
          recordType: 'prescription',
          title: 'Sample Record',
          date: new Date().toISOString().split('T')[0],
          encrypted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to fetch medical record');
    }

    return await response.json();
  },

  // Delete medical record
  async deleteRecord(recordId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
    }).catch(() => {
      return { ok: true } as Response;
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete record' }));
      throw new Error(error.message || 'Failed to delete record');
    }
  },

  // Download record file
  async downloadRecord(recordId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/download`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download record');
    }

    return await response.blob();
  },

  // Get records by doctor (for doctor portal)
  async getRecordsByDoctor(doctorId: string, patientId?: string): Promise<MedicalRecord[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('doctorId', doctorId);
    if (patientId) queryParams.append('patientId', patientId);

    const response = await fetch(`${API_BASE_URL}/medical-records?${queryParams}`, {
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
      throw new Error('Failed to fetch records');
    }

    return await response.json();
  },
};
