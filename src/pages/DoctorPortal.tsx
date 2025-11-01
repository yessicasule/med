import { Calendar, Users, Clock, FileText, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useDoctorAppointments } from "@/hooks/useDoctorAppointments";
import { doctorDB, userDB } from "@/db";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

const DoctorPortal = () => {
  const { currentUser } = useAuth();
  
  // Get doctor ID from current user
  const doctorData = useQuery({
    queryKey: ['doctorData', currentUser?.id],
    queryFn: () => {
      if (!currentUser?.id) return null;
      return doctorDB.getByUserId(currentUser.id);
    },
    enabled: !!currentUser?.id,
  });

  const doctorId = doctorData.data?.id;
  const { todayAppointments, appointments, isLoading } = useDoctorAppointments(doctorId);

  // Calculate stats from real data
  const stats = {
    todayAppointments: todayAppointments.length,
    totalPatients: new Set(appointments.map(apt => apt.patientId)).size,
    pendingReviews: appointments.filter(apt => apt.status === 'scheduled').length,
    completedToday: todayAppointments.filter(apt => apt.status === 'completed').length,
  };

  // Get patient history from appointments
  const patientHistory = appointments
    .filter(apt => apt.status === 'completed')
    .slice(0, 5)
    .map(apt => {
      const patient = userDB.getById(apt.patientId);
      return {
        id: apt.id,
        patient: patient?.name || 'Unknown Patient',
        lastVisit: apt.date,
        diagnosis: apt.type,
        notes: apt.notes || 'No notes available',
      };
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-mint text-indigo-dark">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-picton text-white">In Progress</Badge>;
      case "scheduled":
        return <Badge className="bg-moonstone text-white">Scheduled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-dark mb-2">Doctor Portal</h1>
          <p className="text-muted-foreground">Manage your appointments and patient records</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft bg-mint/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-indigo-dark" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-dark">{stats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedToday} completed
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft bg-columbia/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-indigo-dark" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-dark">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">
                Active patient records
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft bg-moonstone/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-indigo-dark" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-dark">{stats.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft bg-picton/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patient Activity</CardTitle>
              <Activity className="h-4 w-4 text-indigo-dark" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-dark">92%</div>
              <p className="text-xs text-muted-foreground">
                Attendance rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Schedule */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="text-indigo-dark">Today's Appointment Schedule</CardTitle>
            <CardDescription>View and manage your appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Appointment Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading appointments...
                    </TableCell>
                  </TableRow>
                ) : todayAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No appointments scheduled for today
                    </TableCell>
                  </TableRow>
                ) : (
                  todayAppointments.map((appointment) => {
                    const patient = userDB.getById(appointment.patientId);
                    return (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">{appointment.time}</TableCell>
                        <TableCell>{patient?.name || 'Unknown Patient'}</TableCell>
                        <TableCell>{appointment.type}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="text-xs">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Patient History Records */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-indigo-dark">Patient History Records</CardTitle>
            <CardDescription>Recent patient visits and treatment history</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No patient history available
                    </TableCell>
                  </TableRow>
                ) : (
                  patientHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.patient}</TableCell>
                      <TableCell>{format(new Date(record.lastVisit), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{record.diagnosis}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{record.notes}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          View Full Record
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DoctorPortal;