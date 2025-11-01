import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, FileText, CreditCard, Search, Clock, MapPin, Star, Heart, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useBilling } from "@/hooks/useBilling";
import { useMedicalRecords } from "@/hooks/useMedicalRecords";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser, logout } = useAuth();
  const { appointmentHistory, searchDoctors, doctors, isLoadingHistory } = useAppointments();
  const { billingSummary } = useBilling();
  const { records } = useMedicalRecords();

  // Get upcoming appointments
  const upcomingAppointments = appointmentHistory
    .filter(apt => apt.status === 'scheduled')
    .slice(0, 2)
    .map(apt => ({
      id: apt.id,
      doctor: apt.doctorName,
      specialty: apt.doctorSpecialty,
      date: apt.date,
      time: apt.time,
      avatar: apt.doctorName.substring(0, 2).toUpperCase()
    }));

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Navbar */}
      <nav className="bg-primary text-primary-foreground shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 fill-secondary text-secondary" />
              <span className="text-xl font-semibold">MedicalCare</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm">Welcome, {currentUser?.name || 'User'}!</span>
              <NotificationsDropdown />
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-secondary" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
                  <p className="text-sm text-muted-foreground">Appointments</p>
                </div>
                <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Medical</p>
                  <p className="text-3xl font-bold">{records.length}</p>
                  <p className="text-sm text-muted-foreground">Records</p>
                </div>
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold">${billingSummary?.totalPending.toFixed(0) || '0'}</p>
                  <p className="text-sm text-muted-foreground">Bills</p>
                </div>
                <div className="bg-success/10 w-16 h-16 rounded-full flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-success-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Find Doctors */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Find a Doctor</CardTitle>
                <CardDescription>Search by name, specialty, or location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search doctors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        searchDoctors({ name: searchQuery });
                      }
                    }}
                    className="pl-10"
                  />
                </div>

                <div className="mt-6 space-y-4">
                  {doctors.length > 0 ? (
                    doctors.map((doctor) => (
                      <div key={doctor.id} className="border rounded-lg p-4 hover:border-secondary transition-colors">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarFallback className="bg-secondary/10 text-secondary text-lg">
                              {doctor.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-lg">{doctor.name}</h4>
                                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                              </div>
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                {doctor.rating}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {doctor.location}
                              </span>
                              <span>{doctor.experience} experience</span>
                            </div>
                            <Button size="sm" className="mt-3" onClick={() => navigate(`/book-appointment?doctorId=${doctor.id}`)}>
                              Book Appointment
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Search for doctors to see results</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingHistory ? (
                  <div className="text-center py-4 text-muted-foreground">Loading...</div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No upcoming appointments</div>
                ) : (
                  upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-secondary/10 text-secondary">
                          {appointment.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{appointment.doctor}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <Calendar className="h-4 w-4 text-secondary" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-accent" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))
                )}
                <Button variant="outline" className="w-full" onClick={() => navigate('/appointments/history')}>
                  View All
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/medical-records')}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Medical Records
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/billing')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  View Bills
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/appointments/history')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Appointment History
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/find-doctors')}>
                  <Search className="mr-2 h-4 w-4" />
                  Find Doctors
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/book-appointment')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
