import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MapPin, Star, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import { Doctor } from '@/types';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { doctorDB, userDB } from '@/db';
import { appointmentsApi } from '@/api/appointments';
import { toast } from 'sonner';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get('doctorId');
  const { searchDoctors, doctors, isLoadingDoctors, bookAppointment, isBooking } = useAppointments();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState('consultation');

  // Debug: Log render state
  useEffect(() => {
    console.log('BookAppointment Render State:', {
      doctorId,
      selectedDoctor: selectedDoctor?.name,
      doctorsCount: doctors.length,
      isLoadingDoctors,
      currentUser: currentUser?.name,
    });
  }, [doctorId, selectedDoctor, doctors, isLoadingDoctors, currentUser]);

  // Load doctor from URL parameter
  useEffect(() => {
    const loadDoctorFromUrl = async () => {
      if (doctorId) {
        console.log('Loading doctor from URL:', doctorId);
        try {
          // Try to get doctor from API first
          const doctor = await appointmentsApi.getDoctor(doctorId);
          
          // Map to Doctor type if needed
          const doctorData: Doctor = {
            id: doctor.id,
            name: doctor.name,
            specialty: doctor.specialty,
            location: doctor.location,
            rating: doctor.rating,
            experience: doctor.experience,
            verified: doctor.verified,
            availableSlots: doctor.availableSlots || [],
          };
          
          console.log('Doctor loaded from API:', doctorData);
          setSelectedDoctor(doctorData);
        } catch (error) {
          console.log('API failed, trying local DB:', error);
          // Fallback to local database
          const doctorDoc = doctorDB.getById(doctorId);
          if (doctorDoc) {
            const doctorUser = userDB.getById(doctorDoc.userId);
            const doctorData: Doctor = {
              id: doctorDoc.id,
              name: doctorUser?.name || 'Dr. Unknown',
              specialty: doctorDoc.specialty,
              location: doctorDoc.location,
              rating: doctorDoc.rating,
              experience: doctorDoc.experience,
              verified: doctorDoc.verificationStatus === 'verified',
              availableSlots: doctorDoc.availabilitySlots.map(slot => ({
                id: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                available: slot.available,
              })),
            };
            console.log('Doctor loaded from DB:', doctorData);
            setSelectedDoctor(doctorData);
          } else {
            console.error('Doctor not found in DB');
          }
        }
      }
    };

    loadDoctorFromUrl();
  }, [doctorId]);

  const handleSearch = () => {
    console.log('Searching doctors with filters:', {
      name: searchQuery,
      specialty: selectedSpecialty,
      location: selectedLocation,
    });
    
    searchDoctors({
      name: searchQuery || undefined,
      specialty: selectedSpecialty || undefined,
      location: selectedLocation || undefined,
    });
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      toast.error('Please select a date and time slot');
      return;
    }

    // Get the selected slot to extract the time
    const slot = selectedDoctor.availableSlots.find(s => s.id === selectedSlot);
    if (!slot) {
      toast.error('Selected time slot is no longer available');
      return;
    }

    if (!slot.available) {
      toast.error('This time slot is no longer available');
      return;
    }

    try {
      await bookAppointment({
        doctorId: selectedDoctor.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlotId: selectedSlot,
        type: appointmentType,
      });
      
      // Navigation will happen after successful booking
      navigate('/patient/dashboard');
    } catch (error) {
      // Error is handled by the hook, just don't navigate
      console.error('Booking failed:', error);
    }
  };

  // Debug: Check if component is rendering at all
  console.log('BookAppointment component rendering');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/patient/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book Appointment</h1>
          <p className="text-muted-foreground">Search and book an appointment with a doctor</p>
          <Button 
            variant="link" 
            className="mt-2 p-0"
            onClick={() => navigate('/find-doctors')}
          >
            Browse doctor specialties →
          </Button>
        </div>

        {/* Debug info - Remove in production */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm font-mono">
            Debug: doctors={doctors.length}, loading={isLoadingDoctors.toString()}, 
            selected={selectedDoctor ? 'yes' : 'no'}
          </p>
        </div>

        {!selectedDoctor ? (
          <Card className="shadow-card mb-6">
            <CardHeader>
              <CardTitle>Search Doctors</CardTitle>
              <CardDescription>Search by name, specialty, or location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Search by Name</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Doctor name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Specialty</Label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All specialties</SelectItem>
                      <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                      <SelectItem value="General Physician">General Physician</SelectItem>
                      <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                      <SelectItem value="Orthopedic Surgeon">Orthopedic Surgeon</SelectItem>
                      <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    placeholder="City, Hospital..."
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSearch} className="w-full md:w-auto">
                Search Doctors
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card mb-6">
            <CardHeader>
              <CardTitle>Selected Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{selectedDoctor.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedDoctor.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{selectedDoctor.location}</span>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedDoctor(null)}>
                  Change Doctor
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoadingDoctors ? (
          <div className="text-center py-8">Loading doctors...</div>
        ) : doctors.length > 0 && !selectedDoctor ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="shadow-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedDoctor(doctor)}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback>{doctor.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{doctor.name}</h4>
                          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {doctor.rating}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {doctor.location}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">{doctor.experience} experience</div>
                      {doctor.verified && (
                        <Badge variant="outline" className="mt-2">Verified</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : selectedDoctor ? (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Select Date and Time</CardTitle>
              <CardDescription>Choose your preferred appointment date and time slot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Appointment Type</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="check-up">Check-up</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedDate && (
                <div>
                  <Label>Select Time Slot</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {selectedDoctor.availableSlots
                      .filter(slot => slot.available)
                      .map((slot) => (
                        <Button
                          key={slot.id}
                          variant={selectedSlot === slot.id ? 'default' : 'outline'}
                          onClick={() => setSelectedSlot(slot.id)}
                          disabled={!slot.available}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {slot.startTime}
                        </Button>
                      ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleBook}
                disabled={!selectedDate || !selectedSlot || isBooking}
                className="w-full"
                size="lg"
              >
                {isBooking ? 'Booking...' : 'Book Appointment'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card">
            <CardContent className="pt-6 text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">Search for doctors to get started</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/find-doctors')}
                >
                  Browse Doctor Specialties
                </Button>
                <Button onClick={handleSearch}>
                  Search Doctors
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;