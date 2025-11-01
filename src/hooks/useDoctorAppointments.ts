import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/api/appointments';
import { Appointment } from '@/types';

export const useDoctorAppointments = (doctorId?: string) => {
  const queryClient = useQueryClient();

  const appointments = useQuery({
    queryKey: ['doctorAppointments', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      return appointmentsApi.getDoctorAppointments(doctorId);
    },
    enabled: !!doctorId,
    refetchInterval: 30000, // Refetch every 30 seconds to stay synchronized
  });

  const todayAppointments = useQuery({
    queryKey: ['todayAppointments', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const allAppointments = await appointmentsApi.getDoctorAppointments(doctorId);
      const today = new Date().toISOString().split('T')[0];
      return allAppointments.filter(apt => apt.date === today);
    },
    enabled: !!doctorId,
    refetchInterval: 30000,
  });

  return {
    appointments: appointments.data || [],
    todayAppointments: todayAppointments.data || [],
    isLoading: appointments.isLoading,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['todayAppointments', doctorId] });
    },
  };
};
