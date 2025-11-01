import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, UserCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const DoctorVerification = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', 'doctor'],
    queryFn: () => authApi.getUsers('doctor'),
  });

  const verifyMutation = useMutation({
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

  const doctors = users.filter(user => user.role === 'doctor');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Doctor Verification</h1>
          <p className="text-muted-foreground">Verify or reject doctor registrations</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>Review and verify doctor accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No doctors found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell>{doctor.specialty || 'N/A'}</TableCell>
                      <TableCell>{doctor.phone}</TableCell>
                      <TableCell>
                        {doctor.verified ? (
                          <Badge className="bg-green-500">Verified</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!doctor.verified ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => verifyMutation.mutate({ doctorId: doctor.id, verified: true })}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => verifyMutation.mutate({ doctorId: doctor.id, verified: false })}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verifyMutation.mutate({ doctorId: doctor.id, verified: false })}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorVerification;
