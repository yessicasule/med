import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '@/api/billing';
import { Invoice, PaymentData } from '@/types';
import { toast } from 'sonner';

export const useBilling = () => {
  const queryClient = useQueryClient();

  const invoices = useQuery({
    queryKey: ['invoices'],
    queryFn: () => billingApi.getInvoices(),
  });

  const billingSummary = useQuery({
    queryKey: ['billingSummary'],
    queryFn: () => billingApi.getBillingSummary(),
  });

  const generateInvoice = useMutation({
    mutationFn: ({ appointmentId, items }: { appointmentId: string; items: Array<{ description: string; quantity: number; unitPrice: number }> }) =>
      billingApi.generateInvoice(appointmentId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['billingSummary'] });
      toast.success('Invoice generated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate invoice');
    },
  });

  const processPayment = useMutation({
    mutationFn: (data: PaymentData) => billingApi.processPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['billingSummary'] });
      toast.success('Payment processed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Payment failed');
    },
  });

  return {
    invoices: invoices.data || [],
    isLoadingInvoices: invoices.isLoading,
    billingSummary: billingSummary.data,
    isLoadingSummary: billingSummary.isLoading,
    generateInvoice: generateInvoice.mutate,
    processPayment: processPayment.mutate,
  };
};
