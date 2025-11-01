import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/api/appointments';
import { AppointmentSearchFilters, BookAppointmentData, Appointment, Doctor } from '@/types';
import { toast } from 'sonner';

export const useAppointments = () => {
  const queryClient = useQueryClient();

  const searchDoctors = useMutation({
    mutationFn: (filters: AppointmentSearchFilters) => appointmentsApi.searchDoctors(filters),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to search doctors');
    },
  });

  const getDoctor = useQuery({
    queryKey: ['doctor'],
    queryFn: () => appointmentsApi.getDoctor(''),
    enabled: false,
  });

  const appointmentHistory = useQuery({
    queryKey: ['appointmentHistory'],
    queryFn: () => appointmentsApi.getAppointmentHistory(),
  });

  const bookAppointment = useMutation({
    mutationFn: (data: BookAppointmentData) => appointmentsApi.bookAppointment(data),
    onSuccess: () => {
      // Invalidate all appointment-related queries to sync across all portals
      queryClient.invalidateQueries({ queryKey: ['appointmentHistory'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['todayAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] });
      toast.success('Appointment booked successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to book appointment');
    },
  });

  const cancelAppointment = useMutation({
    mutationFn: (appointmentId: string) => appointmentsApi.cancelAppointment(appointmentId),
    onSuccess: () => {
      // Invalidate all appointment-related queries to sync across all portals
      queryClient.invalidateQueries({ queryKey: ['appointmentHistory'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['todayAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] });
      toast.success('Appointment cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel appointment');
    },
  });

  const getAvailableSlots = useQuery({
    queryKey: ['availableSlots'],
    queryFn: () => appointmentsApi.getAvailableSlots('', ''),
    enabled: false,
  });

  return {
    searchDoctors: searchDoctors.mutate,
    doctors: searchDoctors.data || [],
    isLoadingDoctors: searchDoctors.isPending,
    appointmentHistory: appointmentHistory.data || [],
    isLoadingHistory: appointmentHistory.isLoading,
    bookAppointment: bookAppointment.mutate,
    cancelAppointment: cancelAppointment.mutate,
    getAvailableSlots: (doctorId: string, date: string) => {
      queryClient.fetchQuery({
        queryKey: ['availableSlots', doctorId, date],
        queryFn: () => appointmentsApi.getAvailableSlots(doctorId, date),
      });
    },
  };
};
