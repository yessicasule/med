import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorPortal from "./pages/DoctorPortal";
import ReceptionistPortal from "./pages/ReceptionistPortal";
import BookAppointment from "./pages/BookAppointment";
import FindDoctors from "./pages/FindDoctors";
import AppointmentHistory from "./pages/AppointmentHistory";
import Billing from "./pages/Billing";
import MedicalRecords from "./pages/MedicalRecords";
import Notifications from "./pages/Notifications";
import DoctorVerification from "./pages/DoctorVerification";
import NotFound from "./pages/NotFound";
import QueueBook from "./pages/patient/QueueBook";
import QueueStatus from "./pages/patient/QueueStatus";
import QueuePanel from "./pages/doctor/QueuePanel";
import QueueDesk from "./pages/receptionist/QueueDesk";
import Analytics from "./pages/admin/Analytics";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/find-doctors" element={<FindDoctors />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/appointments/history" element={<AppointmentHistory />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/doctor-portal" element={<DoctorPortal />} />
          <Route path="/receptionist-portal" element={<ReceptionistPortal />} />
          <Route path="/admin/doctor-verification" element={<DoctorVerification />} />
          <Route path="/queue/book" element={<QueueBook />} />
          <Route path="/queue/status" element={<QueueStatus />} />
          <Route path="/doctor/queue" element={<QueuePanel />} />
          <Route path="/reception/queue" element={<QueueDesk />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
