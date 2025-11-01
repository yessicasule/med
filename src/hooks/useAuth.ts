import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { RegisterData, LoginData, User } from '@/types';
import { toast } from 'sonner';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const currentUser = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getCurrentUser(),
    staleTime: Infinity,
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Registration successful!');
      if (data.user.role === 'doctor') {
        navigate('/doctor-portal');
      } else if (data.user.role === 'receptionist') {
        navigate('/receptionist-portal');
      } else {
        navigate('/patient/dashboard');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Login successful!');
      if (data.user.role === 'doctor') {
        navigate('/doctor-portal');
      } else if (data.user.role === 'receptionist') {
        navigate('/receptionist-portal');
      } else {
        navigate('/patient/dashboard');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });

  const logout = () => {
    authApi.logout();
    queryClient.clear();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const verifyDoctorMutation = useMutation({
    mutationFn: ({ doctorId, verified }: { doctorId: string; verified: boolean }) =>
      authApi.verifyDoctor(doctorId, verified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Doctor verification updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Verification failed');
    },
  });

  return {
    currentUser: currentUser.data,
    isLoading: currentUser.isLoading,
    isAuthenticated: authApi.isAuthenticated(),
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout,
    verifyDoctor: verifyDoctorMutation.mutate,
  };
};
