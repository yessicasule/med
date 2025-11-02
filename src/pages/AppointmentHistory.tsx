import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, ArrowLeft, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { format } from 'date-fns';

const AppointmentHistory = () => {
  const navigate = useNavigate();


  const appointmentHistory = [
    {
      id: '1',
      doctorName: 'Dr. Meera Nair',
      doctorSpecialty: 'Cardiologist',
      date: '2025-10-20',
      time: '09:00 AM',
      type: 'Check-up',
      status: 'completed',
    },
    {
      id: '2',
      doctorName: 'Dr. Rohan Deshmukh',
      doctorSpecialty: 'Dermatologist',
      date: '2025-10-23',
      time: '11:30 AM',
      type: 'Follow-up',
      status: 'cancelled',
    },
    {
      id: '3',
      doctorName: 'Dr. Aisha Shaikh',
      doctorSpecialty: 'Pediatrician',
      date: '2025-10-26',
      time: '03:00 PM',
      type: 'Consultation',
      status: 'scheduled',
    },
    {
      id: '4',
      doctorName: 'Dr. Arjun Rao',
      doctorSpecialty: 'Orthopedic Surgeon',
      date: '2025-10-28',
      time: '05:00 PM',
      type: 'Emergency',
      status: 'in-progress',
    },
    {
      id: '5',
      doctorName: 'Dr. Kavita Menon',
      doctorSpecialty: 'General Physician',
      date: '2025-10-30',
      time: '10:15 AM',
      type: 'Routine Check-up',
      status: 'completed',
    },
  ];

  // 🟢 Function to render styled status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500 text-white">In Progress</Badge>;
      case 'scheduled':
        return <Badge className="bg-moonstone text-white">Scheduled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // ❌ Handle cancel click
  const handleCancel = (appointmentId: string) => {
    alert(`Appointment ${appointmentId} cancelled (mock action).`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/patient/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-dark mb-2">Appointment History</h1>
          <p className="text-muted-foreground">View and manage your previous appointments</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>All Appointments</CardTitle>
            <CardDescription>Your complete appointment record</CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No appointments found</p>
                <Button onClick={() => navigate('/book-appointment')}>Book an Appointment</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointmentHistory.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.doctorName}</TableCell>
                      <TableCell>{appointment.doctorSpecialty}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(appointment.date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {appointment.time}
                        </div>
                      </TableCell>
                      <TableCell>{appointment.type}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        {appointment.status === 'scheduled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(appointment.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
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

export default AppointmentHistory;
