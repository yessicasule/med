// Seed Data - Example Patient History for Doctor and Receptionist Dashboards
import { userDB, doctorDB, appointmentDB, medicalRecordsDB } from './index';

export const seedExampleData = () => {
  // Check if data already exists
  const existingAppointments = appointmentDB.getAll();
  if (existingAppointments.length > 0) {
    console.log('Example data already exists. Skipping seed.');
    return;
  }

  console.log('Seeding example patient history data...');

  // Create example patients
  const patient1 = userDB.create({
    id: 'PAT-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'password123',
    phone: '+1 234-567-8901',
    role: 'patient',
    verified: true,
  });

  const patient2 = userDB.create({
    id: 'PAT-002',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    password: 'password123',
    phone: '+1 234-567-8902',
    role: 'patient',
    verified: true,
  });

  const patient3 = userDB.create({
    id: 'PAT-003',
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    password: 'password123',
    phone: '+1 234-567-8903',
    role: 'patient',
    verified: true,
  });

  const patient4 = userDB.create({
    id: 'PAT-004',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    password: 'password123',
    phone: '+1 234-567-8904',
    role: 'patient',
    verified: true,
  });

  const patient5 = userDB.create({
    id: 'PAT-005',
    name: 'Olivia Brown',
    email: 'olivia.brown@example.com',
    password: 'password123',
    phone: '+1 234-567-8905',
    role: 'patient',
    verified: true,
  });

  // Create example doctors
  const doctor1User = userDB.create({
    id: 'DOC-USER-001',
    name: 'Dr. Sarah Johnson',
    email: 'dr.sarah@example.com',
    password: 'password123',
    phone: '+1 234-567-9001',
    role: 'doctor',
    verified: true,
  });

  const doctor2User = userDB.create({
    id: 'DOC-USER-002',
    name: 'Dr. Michael Chen',
    email: 'dr.michael@example.com',
    password: 'password123',
    phone: '+1 234-567-9002',
    role: 'doctor',
    verified: true,
  });

  const doctor3User = userDB.create({
    id: 'DOC-USER-003',
    name: 'Dr. Emily Davis',
    email: 'dr.emily@example.com',
    password: 'password123',
    phone: '+1 234-567-9003',
    role: 'doctor',
    verified: true,
  });

  const doctor1 = doctorDB.create({
    id: 'DOC-001',
    userId: doctor1User.id,
    specialty: 'Cardiology',
    location: 'City Hospital, Downtown',
    experience: '15 years',
    rating: 4.8,
    available: true,
    verificationStatus: 'verified',
    verificationDate: new Date().toISOString(),
    verifiedBy: 'admin',
    availabilitySlots: [
      { id: 'slot1', date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '09:30', available: true },
      { id: 'slot2', date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '10:30', available: true },
    ],
  });

  const doctor2 = doctorDB.create({
    id: 'DOC-002',
    userId: doctor2User.id,
    specialty: 'Neurology',
    location: 'Medical Center, Uptown',
    experience: '12 years',
    rating: 4.6,
    available: true,
    verificationStatus: 'verified',
    verificationDate: new Date().toISOString(),
    verifiedBy: 'admin',
    availabilitySlots: [
      { id: 'slot3', date: new Date().toISOString().split('T')[0], startTime: '11:00', endTime: '11:30', available: true },
      { id: 'slot4', date: new Date().toISOString().split('T')[0], startTime: '14:00', endTime: '14:30', available: true },
    ],
  });

  const doctor3 = doctorDB.create({
    id: 'DOC-003',
    userId: doctor3User.id,
    specialty: 'Pediatrics',
    location: 'Children\'s Hospital, East Side',
    experience: '10 years',
    rating: 4.9,
    available: true,
    verificationStatus: 'verified',
    verificationDate: new Date().toISOString(),
    verifiedBy: 'admin',
    availabilitySlots: [
      { id: 'slot5', date: new Date().toISOString().split('T')[0], startTime: '15:00', endTime: '15:30', available: true },
    ],
  });

  // Helper to get date strings
  const getDateString = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  // Create completed appointments (patient history)
  const appointment1 = appointmentDB.create({
    id: 'APT-001',
    patientId: patient1.id,
    doctorId: doctor1.id,
    date: getDateString(10),
    time: '09:00',
    status: 'completed',
    type: 'Check-up',
    notes: 'Annual physical examination. Blood pressure: 120/80, Heart rate: 72 bpm. Patient advised to maintain current lifestyle and continue exercise routine.',
  });

  const appointment2 = appointmentDB.create({
    id: 'APT-002',
    patientId: patient1.id,
    doctorId: doctor1.id,
    date: getDateString(45),
    time: '10:30',
    status: 'completed',
    type: 'Follow-up',
    notes: 'Follow-up for hypertension. Blood pressure improved with medication. Prescribed Lisinopril 10mg daily. Patient to return in 3 months.',
  });

  const appointment3 = appointmentDB.create({
    id: 'APT-003',
    patientId: patient2.id,
    doctorId: doctor2.id,
    date: getDateString(20),
    time: '11:00',
    status: 'completed',
    type: 'Consultation',
    notes: 'Migraine consultation. Patient reports frequent headaches. Prescribed Sumatriptan 50mg as needed. Recommended stress management techniques.',
  });

  const appointment4 = appointmentDB.create({
    id: 'APT-004',
    patientId: patient2.id,
    doctorId: doctor2.id,
    date: getDateString(60),
    time: '14:00',
    status: 'completed',
    type: 'Diagnosis',
    notes: 'Neurological examination for persistent headaches. MRI scheduled. Patient advised to track headache frequency and triggers.',
  });

  const appointment5 = appointmentDB.create({
    id: 'APT-005',
    patientId: patient3.id,
    doctorId: doctor3.id,
    date: getDateString(15),
    time: '15:00',
    status: 'completed',
    type: 'Check-up',
    notes: 'Pediatric wellness visit for 8-year-old. Height: 4\'2", Weight: 65 lbs. All vaccinations up to date. Growth chart normal.',
  });

  const appointment6 = appointmentDB.create({
    id: 'APT-006',
    patientId: patient3.id,
    doctorId: doctor3.id,
    date: getDateString(50),
    time: '09:30',
    status: 'completed',
    type: 'Treatment',
    notes: 'Treatment for seasonal allergies. Prescribed Cetirizine 10mg daily. Patient parent advised on allergen avoidance strategies.',
  });

  const appointment7 = appointmentDB.create({
    id: 'APT-007',
    patientId: patient4.id,
    doctorId: doctor1.id,
    date: getDateString(25),
    time: '10:00',
    status: 'completed',
    type: 'Emergency',
    notes: 'Emergency consultation for chest pain. EKG normal. Diagnosed as muscle strain. Prescribed Ibuprofen 400mg as needed. Advised rest.',
  });

  const appointment8 = appointmentDB.create({
    id: 'APT-008',
    patientId: patient4.id,
    doctorId: doctor1.id,
    date: getDateString(70),
    time: '14:30',
    status: 'completed',
    type: 'Follow-up',
    notes: 'Follow-up for Type 2 Diabetes. HbA1c: 7.2%. Medication adjusted. Patient counseled on diet and exercise. Next appointment in 3 months.',
  });

  const appointment9 = appointmentDB.create({
    id: 'APT-009',
    patientId: patient5.id,
    doctorId: doctor1.id,
    date: getDateString(5),
    time: '09:00',
    status: 'completed',
    type: 'Check-up',
    notes: 'Annual physical examination. All vitals normal. Blood work ordered. Patient is in good health. Advised to continue healthy lifestyle.',
  });

  const appointment10 = appointmentDB.create({
    id: 'APT-010',
    patientId: patient5.id,
    doctorId: doctor3.id,
    date: getDateString(30),
    time: '11:30',
    status: 'completed',
    type: 'Consultation',
    notes: 'General consultation. Patient reports good health. No concerns. Preventive care discussion regarding nutrition and exercise.',
  });

  // Create some scheduled appointments for today
  const today = new Date().toISOString().split('T')[0];
  appointmentDB.create({
    id: 'APT-011',
    patientId: patient1.id,
    doctorId: doctor1.id,
    date: today,
    time: '09:00',
    status: 'scheduled',
    type: 'Follow-up',
  });

  appointmentDB.create({
    id: 'APT-012',
    patientId: patient2.id,
    doctorId: doctor2.id,
    date: today,
    time: '10:30',
    status: 'scheduled',
    type: 'Consultation',
  });

  // Create medical records (prescriptions and reports)
  medicalRecordsDB.create({
    id: 'MR-001',
    patientId: patient1.id,
    doctorId: doctor1.id,
    appointmentId: appointment1.id,
    recordType: 'prescription',
    title: 'Blood Pressure Medication',
    description: 'Lisinopril 10mg daily for hypertension management',
    fileUrl: '',
    fileName: 'prescription_apt001.pdf',
    encrypted: true,
    date: appointment1.date,
    uploadedBy: doctor1.id,
  });

  medicalRecordsDB.create({
    id: 'MR-002',
    patientId: patient2.id,
    doctorId: doctor2.id,
    appointmentId: appointment3.id,
    recordType: 'prescription',
    title: 'Migraine Medication',
    description: 'Sumatriptan 50mg tablets - Take as needed for migraine relief',
    fileUrl: '',
    fileName: 'prescription_apt003.pdf',
    encrypted: true,
    date: appointment3.date,
    uploadedBy: doctor2.id,
  });

  medicalRecordsDB.create({
    id: 'MR-003',
    patientId: patient3.id,
    doctorId: doctor3.id,
    appointmentId: appointment5.id,
    recordType: 'lab_report',
    title: 'Blood Test Results',
    description: 'Complete blood count and metabolic panel. All values within normal range.',
    fileUrl: '',
    fileName: 'lab_report_apt005.pdf',
    encrypted: true,
    date: appointment5.date,
    uploadedBy: doctor3.id,
  });

  medicalRecordsDB.create({
    id: 'MR-004',
    patientId: patient4.id,
    doctorId: doctor1.id,
    appointmentId: appointment8.id,
    recordType: 'diagnosis',
    title: 'Diabetes Management Plan',
    description: 'Type 2 Diabetes diagnosis and treatment plan. Medication: Metformin 500mg twice daily.',
    fileUrl: '',
    fileName: 'diagnosis_apt008.pdf',
    encrypted: true,
    date: appointment8.date,
    uploadedBy: doctor1.id,
  });

  medicalRecordsDB.create({
    id: 'MR-005',
    patientId: patient1.id,
    doctorId: doctor1.id,
    appointmentId: appointment2.id,
    recordType: 'prescription',
    title: 'Follow-up Prescription',
    description: 'Continuing Lisinopril 10mg. Patient responding well to treatment.',
    fileUrl: '',
    fileName: 'prescription_apt002.pdf',
    encrypted: true,
    date: appointment2.date,
    uploadedBy: doctor1.id,
  });

  console.log('✅ Example patient history data seeded successfully!');
  console.log(`   - ${userDB.getAll().length} users created`);
  console.log(`   - ${doctorDB.getAll().length} doctors created`);
  console.log(`   - ${appointmentDB.getAll().length} appointments created`);
  console.log(`   - ${medicalRecordsDB.getAll().length} medical records created`);
};


