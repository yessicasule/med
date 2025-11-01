import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicalRecordsApi } from '@/api/medicalRecords';
import { MedicalRecord, UploadMedicalRecordData, MedicalRecordFilters } from '@/types';
import { toast } from 'sonner';

export const useMedicalRecords = () => {
  const queryClient = useQueryClient();

  const records = useQuery({
    queryKey: ['medicalRecords'],
    queryFn: () => medicalRecordsApi.getRecords(),
  });

  const uploadRecord = useMutation({
    mutationFn: (data: UploadMedicalRecordData) => medicalRecordsApi.uploadRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      toast.success('Medical record uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload record');
    },
  });

  const deleteRecord = useMutation({
    mutationFn: (recordId: string) => medicalRecordsApi.deleteRecord(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      toast.success('Medical record deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete record');
    },
  });

  const filterRecords = (filters: MedicalRecordFilters) => {
    queryClient.fetchQuery({
      queryKey: ['medicalRecords', filters],
      queryFn: () => medicalRecordsApi.getRecords(undefined, filters),
    });
  };

  return {
    records: records.data || [],
    isLoadingRecords: records.isLoading,
    uploadRecord: uploadRecord.mutate,
    deleteRecord: deleteRecord.mutate,
    filterRecords,
  };
};
