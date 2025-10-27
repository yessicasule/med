import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, DollarSign, FileText, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

const ReceptionistPortal = () => {
  const stats = [
    { title: "Total Appointments", value: "156", icon: Calendar, change: "+12% from last month" },
    { title: "Active Patients", value: "89", icon: Users, change: "+8 new this week" },
    { title: "Total Revenue", value: "$24,580", icon: DollarSign, change: "+18% from last month" },
    { title: "Pending Bills", value: "23", icon: FileText, change: "5 overdue" },
  ];

  const doctorAppointments = [
    { id: "APT001", doctor: "Dr. Sarah Johnson", specialty: "Cardiology", time: "09:00 AM", patient: "John Doe", status: "Confirmed" },
    { id: "APT002", doctor: "Dr. Michael Chen", specialty: "Neurology", time: "10:30 AM", patient: "Emma Wilson", status: "Confirmed" },
    { id: "APT003", doctor: "Dr. Sarah Johnson", specialty: "Cardiology", time: "11:00 AM", patient: "Robert Smith", status: "Pending" },
    { id: "APT004", doctor: "Dr. Emily Davis", specialty: "Pediatrics", time: "02:00 PM", patient: "Lisa Anderson", status: "Confirmed" },
    { id: "APT005", doctor: "Dr. Michael Chen", specialty: "Neurology", time: "03:30 PM", patient: "James Brown", status: "Completed" },
  ];

  const patientAppointments = [
    { id: "PAT001", patient: "John Doe", age: 45, contact: "+1 234-567-8901", lastVisit: "2024-10-15", nextAppointment: "2024-10-27", doctor: "Dr. Sarah Johnson" },
    { id: "PAT002", patient: "Emma Wilson", age: 32, contact: "+1 234-567-8902", lastVisit: "2024-10-20", nextAppointment: "2024-10-27", doctor: "Dr. Michael Chen" },
    { id: "PAT003", patient: "Robert Smith", age: 58, contact: "+1 234-567-8903", lastVisit: "2024-10-18", nextAppointment: "2024-10-27", doctor: "Dr. Sarah Johnson" },
    { id: "PAT004", patient: "Lisa Anderson", age: 28, contact: "+1 234-567-8904", lastVisit: "2024-10-22", nextAppointment: "2024-10-27", doctor: "Dr. Emily Davis" },
  ];

  const billingRecords = [
    { id: "INV001", patient: "John Doe", doctor: "Dr. Sarah Johnson", service: "Consultation", amount: "$150", status: "Paid", date: "2024-10-15" },
    { id: "INV002", patient: "Emma Wilson", doctor: "Dr. Michael Chen", service: "MRI Scan", amount: "$800", status: "Paid", date: "2024-10-20" },
    { id: "INV003", patient: "Robert Smith", doctor: "Dr. Sarah Johnson", service: "ECG Test", amount: "$200", status: "Pending", date: "2024-10-18" },
    { id: "INV004", patient: "Lisa Anderson", doctor: "Dr. Emily Davis", service: "Vaccination", amount: "$80", status: "Paid", date: "2024-10-22" },
    { id: "INV005", patient: "James Brown", doctor: "Dr. Michael Chen", service: "Follow-up", amount: "$120", status: "Overdue", date: "2024-10-10" },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "paid":
        return "bg-mint-green/20 text-indigo-dye border-mint-green";
      case "pending":
        return "bg-columbia-blue/20 text-indigo-dye border-picton-blue";
      case "completed":
        return "bg-moonstone/20 text-indigo-dye border-moonstone";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-columbia-blue/30 to-mint-green/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-indigo-dye mb-2 font-poppins">Receptionist Dashboard</h1>
          <p className="text-indigo-dye/70">Manage appointments, patients, and billing records</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white/80 backdrop-blur shadow-card border-mint-green/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-dye">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-picton-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-dye">{stat.value}</div>
                  <p className="text-xs text-indigo-dye/60 mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Doctor Appointments Section */}
        <Card className="mb-8 shadow-card bg-white/80 backdrop-blur border-mint-green/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-indigo-dye font-poppins">Doctor Appointments</CardTitle>
                <CardDescription>Today's schedule for all doctors</CardDescription>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-indigo-dye/50" />
                  <Input placeholder="Search appointments..." className="pl-8 border-mint-green/30" />
                </div>
                <Button className="bg-picton-blue hover:bg-moonstone text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-mint-green/30">
                  <TableHead className="text-indigo-dye font-medium">Appointment ID</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Doctor</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Specialty</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Time</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Patient</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorAppointments.map((appointment) => (
                  <TableRow key={appointment.id} className="border-mint-green/20 hover:bg-mint-green/10">
                    <TableCell className="font-medium text-indigo-dye">{appointment.id}</TableCell>
                    <TableCell className="text-indigo-dye">{appointment.doctor}</TableCell>
                    <TableCell className="text-indigo-dye/80">{appointment.specialty}</TableCell>
                    <TableCell className="text-indigo-dye">{appointment.time}</TableCell>
                    <TableCell className="text-indigo-dye">{appointment.patient}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Patient Records Section */}
        <Card className="mb-8 shadow-card bg-white/80 backdrop-blur border-mint-green/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-indigo-dye font-poppins">Patient Records</CardTitle>
                <CardDescription>Active patients and their appointment details</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-indigo-dye/50" />
                <Input placeholder="Search patients..." className="pl-8 border-mint-green/30" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-mint-green/30">
                  <TableHead className="text-indigo-dye font-medium">Patient ID</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Name</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Age</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Contact</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Last Visit</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Next Appointment</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Assigned Doctor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientAppointments.map((patient) => (
                  <TableRow key={patient.id} className="border-mint-green/20 hover:bg-mint-green/10">
                    <TableCell className="font-medium text-indigo-dye">{patient.id}</TableCell>
                    <TableCell className="text-indigo-dye">{patient.patient}</TableCell>
                    <TableCell className="text-indigo-dye/80">{patient.age}</TableCell>
                    <TableCell className="text-indigo-dye/80">{patient.contact}</TableCell>
                    <TableCell className="text-indigo-dye">{patient.lastVisit}</TableCell>
                    <TableCell className="text-indigo-dye">{patient.nextAppointment}</TableCell>
                    <TableCell className="text-indigo-dye">{patient.doctor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Billing Records Section */}
        <Card className="shadow-card bg-white/80 backdrop-blur border-mint-green/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-indigo-dye font-poppins">Billing Records</CardTitle>
                <CardDescription>Invoice and payment tracking</CardDescription>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-indigo-dye/50" />
                  <Input placeholder="Search invoices..." className="pl-8 border-mint-green/30" />
                </div>
                <Button className="bg-picton-blue hover:bg-moonstone text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-mint-green/30">
                  <TableHead className="text-indigo-dye font-medium">Invoice ID</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Patient</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Doctor</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Service</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Amount</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Date</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Status</TableHead>
                  <TableHead className="text-indigo-dye font-medium">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingRecords.map((record) => (
                  <TableRow key={record.id} className="border-mint-green/20 hover:bg-mint-green/10">
                    <TableCell className="font-medium text-indigo-dye">{record.id}</TableCell>
                    <TableCell className="text-indigo-dye">{record.patient}</TableCell>
                    <TableCell className="text-indigo-dye">{record.doctor}</TableCell>
                    <TableCell className="text-indigo-dye/80">{record.service}</TableCell>
                    <TableCell className="text-indigo-dye font-semibold">{record.amount}</TableCell>
                    <TableCell className="text-indigo-dye/80">{record.date}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-picton-blue hover:text-moonstone hover:bg-mint-green/20">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReceptionistPortal;
