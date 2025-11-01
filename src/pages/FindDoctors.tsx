import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  MapPin, 
  Star, 
  ArrowLeft, 
  Heart, 
  Brain, 
  Baby, 
  Bone, 
  Eye, 
  Stethoscope,
  Activity,
  Shield,
  Clock
} from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import Navbar from '@/components/Navbar';

interface DoctorSpecialty {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  conditions: string[];
  commonTreatments: string[];
  locations: string[];
}

const doctorSpecialties: DoctorSpecialty[] = [
  {
    id: 'cardiologist',
    name: 'Cardiologist',
    description: 'Specializes in heart and cardiovascular system conditions. Treats heart diseases, high blood pressure, and cardiac disorders.',
    icon: Heart,
    conditions: ['Heart Disease', 'High Blood Pressure', 'Arrhythmia', 'Heart Attack', 'Cardiac Arrest'],
    commonTreatments: ['ECG', 'Echocardiogram', 'Cardiac Catheterization', 'Pacemaker Implantation'],
    locations: ['Cardiac Center', 'General Hospital', 'Heart Institute']
  },
  {
    id: 'neurologist',
    name: 'Neurologist',
    description: 'Diagnoses and treats disorders of the nervous system including brain, spinal cord, and nerves.',
    icon: Brain,
    conditions: ['Migraine', 'Epilepsy', 'Parkinson\'s Disease', 'Alzheimer\'s', 'Stroke'],
    commonTreatments: ['EEG', 'MRI Brain Scan', 'Neurological Examination', 'Medication Management'],
    locations: ['Neurology Clinic', 'Neurological Institute', 'General Hospital']
  },
  {
    id: 'pediatrician',
    name: 'Pediatrician',
    description: 'Provides medical care for infants, children, and adolescents. Focuses on child development and pediatric diseases.',
    icon: Baby,
    conditions: ['Childhood Illnesses', 'Developmental Disorders', 'Vaccinations', 'Growth Issues'],
    commonTreatments: ['Well-child Checkups', 'Vaccinations', 'Pediatric Procedures', 'Child Development Monitoring'],
    locations: ['Children\'s Hospital', 'Pediatric Clinic', 'Family Care Center']
  },
  {
    id: 'orthopedic',
    name: 'Orthopedic Surgeon',
    description: 'Treats musculoskeletal system including bones, joints, ligaments, tendons, and muscles.',
    icon: Bone,
    conditions: ['Fractures', 'Arthritis', 'Sports Injuries', 'Back Pain', 'Joint Problems'],
    commonTreatments: ['Joint Replacement', 'Fracture Repair', 'Arthroscopy', 'Physical Therapy'],
    locations: ['Orthopedic Center', 'Sports Medicine Clinic', 'General Hospital']
  },
  {
    id: 'dermatologist',
    name: 'Dermatologist',
    description: 'Specializes in skin, hair, and nail conditions. Treats acne, eczema, skin cancer, and cosmetic issues.',
    icon: Shield,
    conditions: ['Acne', 'Eczema', 'Psoriasis', 'Skin Cancer', 'Hair Loss'],
    commonTreatments: ['Skin Biopsy', 'Chemical Peels', 'Laser Therapy', 'Topical Treatments'],
    locations: ['Dermatology Clinic', 'Skin Care Center', 'Beauty & Wellness Clinic']
  },
  {
    id: 'ophthalmologist',
    name: 'Ophthalmologist',
    description: 'Diagnoses and treats eye diseases and vision problems. Performs eye surgeries and prescribes glasses.',
    icon: Eye,
    conditions: ['Cataracts', 'Glaucoma', 'Diabetic Retinopathy', 'Refractive Errors', 'Eye Infections'],
    commonTreatments: ['Eye Surgery', 'Laser Eye Surgery', 'Eye Examinations', 'Vision Correction'],
    locations: ['Eye Hospital', 'Vision Center', 'General Hospital']
  },
  {
    id: 'general',
    name: 'General Physician',
    description: 'Provides primary healthcare for common illnesses, routine checkups, and preventive care.',
    icon: Stethoscope,
    conditions: ['Common Cold', 'Fever', 'Hypertension', 'Diabetes', 'General Health'],
    commonTreatments: ['Physical Examinations', 'Health Screenings', 'Prescription Medications', 'Preventive Care'],
    locations: ['Primary Care Clinic', 'Family Medicine', 'Community Health Center']
  },
  {
    id: 'psychiatrist',
    name: 'Psychiatrist',
    description: 'Diagnoses and treats mental health disorders including depression, anxiety, and behavioral issues.',
    icon: Brain,
    conditions: ['Depression', 'Anxiety', 'Bipolar Disorder', 'Schizophrenia', 'Addiction'],
    commonTreatments: ['Psychotherapy', 'Medication Management', 'Cognitive Behavioral Therapy', 'Counseling'],
    locations: ['Mental Health Center', 'Psychiatric Hospital', 'Counseling Clinic']
  }
];

const FindDoctors = () => {
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { searchDoctors, doctors, isLoadingDoctors } = useAppointments();

  const handleSpecialtyClick = (specialtyId: string) => {
    setSelectedSpecialty(selectedSpecialty === specialtyId ? null : specialtyId);
    // Auto-search for doctors in this specialty
    searchDoctors({ specialty: doctorSpecialties.find(s => s.id === specialtyId)?.name });
  };

  const handleSearch = () => {
    searchDoctors({
      name: searchQuery || undefined,
      specialty: selectedSpecialty ? doctorSpecialties.find(s => s.id === selectedSpecialty)?.name : undefined,
    });
  };

  const handleBookDoctor = (doctorId: string) => {
    navigate(`/book-appointment?doctorId=${doctorId}`);
  };

  const specialty = selectedSpecialty ? doctorSpecialties.find(s => s.id === selectedSpecialty) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Doctors</h1>
          <p className="text-muted-foreground text-lg">
            Discover our medical specialists and find the right doctor for your needs
          </p>
        </div>

        {/* Search Bar */}
        <Card className="shadow-card mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search by doctor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} size="lg">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Specialties */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Medical Specialties</h2>
          <p className="text-muted-foreground mb-6">
            Click on a specialty to learn more and find doctors in that field
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {doctorSpecialties.map((specialty) => {
              const Icon = specialty.icon;
              const isSelected = selectedSpecialty === specialty.id;
              
              return (
                <Card
                  key={specialty.id}
                  className={`shadow-card cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSpecialtyClick(specialty.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className={`p-4 rounded-full mb-4 ${
                        isSelected ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Icon className={`h-8 w-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{specialty.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {specialty.description}
                      </p>
                      {isSelected && (
                        <Badge className="mt-2">Selected</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Specialty Details */}
        {specialty && (
          <Card className="shadow-card mb-8 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  {specialty.icon && <specialty.icon className="h-6 w-6 text-primary" />}
                </div>
                <div>
                  <CardTitle className="text-2xl">{specialty.name}</CardTitle>
                  <CardDescription className="text-base">{specialty.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Common Conditions
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {specialty.conditions.map((condition, idx) => (
                      <li key={idx}>• {condition}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Common Treatments
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {specialty.commonTreatments.map((treatment, idx) => (
                      <li key={idx}>• {treatment}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Available Locations
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {specialty.locations.map((location, idx) => (
                      <li key={idx}>• {location}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button 
                className="mt-6" 
                onClick={() => handleSearch()}
              >
                Find {specialty.name} Doctors
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Available Doctors */}
        {doctors.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Available Doctors {selectedSpecialty && `- ${specialty?.name}`}
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <Card key={doctor.id} className="shadow-card hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {doctor.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{doctor.name}</h4>
                            <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                          </div>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            {doctor.rating}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{doctor.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Clock className="h-4 w-4" />
                          <span>{doctor.experience} experience</span>
                        </div>

                        {doctor.verified && (
                          <Badge variant="outline" className="mb-4">Verified</Badge>
                        )}

                        <Button 
                          className="w-full" 
                          onClick={() => handleBookDoctor(doctor.id)}
                        >
                          Book Appointment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingDoctors && doctors.length === 0 && searchQuery && (
          <Card className="shadow-card">
            <CardContent className="pt-6 text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No doctors found</h3>
              <p className="text-muted-foreground mb-4">
                Try searching with a different name or specialty
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedSpecialty(null);
              }}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="shadow-card bg-muted/50">
          <CardHeader>
            <CardTitle>Need Help Choosing?</CardTitle>
            <CardDescription>
              Contact our support team for assistance in finding the right doctor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1">
                Call Support: (555) 123-4567
              </Button>
              <Button variant="outline" className="flex-1">
                Chat Online
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FindDoctors;
