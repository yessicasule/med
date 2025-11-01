import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentDB, userDB, doctorDB } from '@/db';
import { Appointment } from '@/types';

export const useAllAppointments = () => {
  const queryClient = useQueryClient();

  const appointments = useQuery({
    queryKey: ['allAppointments'],
    queryFn: () => {
      const allAppointments = appointmentDB.getAll();
      return allAppointments.map(apt => {
        const doctor = doctorDB.getById(apt.doctorId);
        const doctorUser = doctor ? userDB.getById(doctor.userId) : null;
        const patient = userDB.getById(apt.patientId);

        return {
          id: apt.id,
          patientId: apt.patientId,
          patientName: patient?.name || 'Unknown Patient',
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
    refetchInterval: 30000, // Refetch every 30 seconds to stay synchronized
  });

  return {
    appointments: appointments.data || [],
    isLoading: appointments.isLoading,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] });
    },
  };
};
