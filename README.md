# Medical Care Management System

## AIM

→ Developing a comprehensive medical management system with multi-role portals (Patient, Doctor, Receptionist, Administrator) to streamline healthcare operations, appointment scheduling, billing, medical records management, and system administration.

---

## PROJECT REPORT

### PROJECT OVERVIEW

The Medical Care Management System is a full-stack web application designed to modernize healthcare facility operations through digital transformation. The system provides distinct portals for different user roles, each with specialized functionalities to address their specific needs.

**User Roles:**

1. **Patient Portal** – Enables patients to search for doctors, book appointments, view medical records, manage billing, and track appointment history. Patients receive real-time notifications for appointments, prescriptions, and bill reminders.

2. **Doctor Portal** – Provides doctors with appointment schedules, patient history access, prescription upload capabilities, and patient interaction tools. Doctors can view their daily schedule, completed appointments, and manage patient records.

3. **Receptionist Portal** – Empowers receptionists to manage all appointments, generate bills, record payments, maintain patient records, and track billing status. Features comprehensive dashboards showing appointment statistics, active patients, revenue metrics, and pending bills.

4. **Administrator Portal** – Allows administrators to verify doctor credentials, manage user accounts, monitor system health, and generate system reports. Includes AI-powered validation and automated monitoring capabilities.

**Key Goals:**
- Centralized data management across all healthcare operations
- Real-time synchronization between different user portals
- Secure authentication and role-based access control
- Automated notifications and reminders
- Comprehensive billing and payment tracking
- Medical records management with encryption support
- System monitoring and AI-based validation

---

### METHODOLOGY

#### Requirement Analysis

**Patient Functionalities:**
- User registration and authentication with role-based access
- Doctor search by name, specialty, or location
- Appointment booking with available time slot selection
- View appointment history with status tracking
- Access to medical records and prescriptions
- Billing management with payment tracking
- Real-time notifications for appointments, bills, and medical records
- Dashboard with quick stats and upcoming appointments

**Doctor Functionalities:**
- Secure login and authentication
- View daily appointment schedule
- Access to patient history and previous records
- Upload prescriptions and medical records
- Manage appointment status (scheduled, in-progress, completed)
- View patient statistics and appointment metrics
- Track total patients and completed appointments

**Receptionist Functionalities:**
- Complete appointment management across all doctors
- Patient record management and search
- Bill generation and invoice creation
- Payment recording and status tracking
- Revenue tracking and financial reporting
- Patient appointment scheduling assistance
- Export capabilities for appointments and billing data

**Administrator Functionalities:**
- Doctor verification workflow
- User account management
- System health monitoring
- AI-powered validation of appointments, doctors, and billing
- Automated report generation
- System-wide data access and analytics

#### Back-End Development

**Database Architecture:**
The system implements a modular database architecture using localStorage-based databases:

1. **User Database (`userDB`)** – Manages user profiles, authentication credentials, and role assignments. Implements secure password hashing and email uniqueness validation.

2. **Doctor Database (`doctorDB`)** – Stores doctor profiles, specialties, availability slots, verification status, and ratings. Supports availability slot management and booking functionality.

3. **Appointment Database (`appointmentDB`)** – Central repository for all appointment records. Maintains relationships between patients, doctors, dates, times, and appointment status. Supports filtering by patient, doctor, date, and status.

4. **Billing Database (`billingDB`)** – Handles invoices, payment records, and billing history. Tracks payment status (pending, paid, overdue) and generates invoices with itemized billing.

5. **Medical Records Database (`medicalRecordsDB`)** – Manages prescriptions, health reports, and medical documents. Supports file uploads with encryption flags and maintains audit trails.

6. **Notification Database (`notificationDB`)** – Central notification system for alerts, messages, and reminders. Supports multiple notification types (in-app, email, SMS) and read/unread status tracking.

**Data Flow & Protection Mechanisms:**
- All database operations use centralized services with type safety
- Data validation at entry points using TypeScript interfaces
- Automatic data synchronization across portals using React Query
- Transaction-like operations with rollback capabilities
- Audit logging for all critical operations
- Data persistence via localStorage with error handling

**Service Layer:**
- **Flow Services** – Implement business logic for each user role workflow:
  - `PatientFlowService` – Handles patient registration, doctor search, appointment booking, and bill payment
  - `DoctorFlowService` – Manages schedule viewing, prescription upload, and patient history review
  - `ReceptionistFlowService` – Handles bill generation, payment recording, and invoice provision
  - `AdministratorFlowService` – Manages doctor verification, user management, and system monitoring
  - `AIFlowService` – Provides automated monitoring, validation, notification, and reporting

- **API Layer** – RESTful API services for:
  - Authentication (`authApi`) – Login, registration, token management, current user retrieval
  - Appointments (`appointmentsApi`) – Doctor search, appointment booking/cancellation, slot availability
  - Billing (`billingApi`) – Invoice generation, payment processing, billing history
  - Medical Records (`medicalRecordsApi`) – Record upload, retrieval, deletion, download
  - Notifications (`notificationsApi`) – Notification creation, retrieval, marking as read

**Caching & Performance:**
- React Query integration for intelligent data caching
- Automatic query invalidation on mutations
- Background refetching every 30 seconds for real-time updates
- Optimistic UI updates for better user experience

#### Authentication System

**JWT-Based Token Handling:**
- Token-based authentication using localStorage for token persistence
- Secure token storage with automatic cleanup on logout
- Token validation on protected routes

**Login/Logout Flow:**
1. User submits credentials via login form
2. `useAuth` hook calls `authApi.login()` with email and password
3. System validates credentials against `userDB`
4. Upon success, token is stored and user data is cached
5. User is redirected to role-specific portal:
   - Patients → `/patient/dashboard`
   - Doctors → `/doctor-portal`
   - Receptionists → `/receptionist-portal`
   - Admins → `/admin/doctor-verification`
6. Logout clears token, query cache, and redirects to login

**Route Security:**
- Protected routes require authentication
- Role-based redirection ensures users access appropriate portals
- Automatic redirect to login if unauthenticated
- Current user state managed via React Query with stale-time optimization

**User Registration:**
- Multi-step registration form with role selection
- Password confirmation validation
- Specialty input for doctors
- Automatic portal assignment upon successful registration
- Email uniqueness validation

#### Front-End Development

**Framework & Setup:**
- **React 18.3** – Component-based architecture with hooks
- **TypeScript** – Type safety throughout the application
- **Vite** – Fast build tool and development server
- **React Router DOM** – Client-side routing with protected routes

**State Management:**
- **TanStack React Query** – Server state management with caching, synchronization, and automatic refetching
- **React Hooks** – Custom hooks for authentication, appointments, billing, medical records, and notifications
- **Local State** – Component-level state using `useState` for UI interactions

**Routing Structure:**
```
/ → Home page
/login → Login page
/register → Registration page
/patient/dashboard → Patient dashboard
/find-doctors → Doctor search
/book-appointment → Appointment booking
/appointments/history → Appointment history
/billing → Billing management
/medical-records → Medical records
/notifications → Notifications center
/doctor-portal → Doctor dashboard
/receptionist-portal → Receptionist dashboard
/admin/doctor-verification → Admin verification page
```

**Component Structure:**
- **Pages** – Route-level components (Dashboard, Login, Register, etc.)
- **Components** – Reusable UI components:
  - `Navbar` – Navigation bar with role-based menu items
  - `NotificationsDropdown` – Real-time notification display
  - **UI Components** – shadcn/ui component library (Button, Card, Table, Badge, etc.)
- **Hooks** – Custom hooks encapsulating business logic:
  - `useAuth` – Authentication operations
  - `useAppointments` – Appointment management
  - `useDoctorAppointments` – Doctor-specific appointments
  - `useAllAppointments` – Receptionist view of all appointments
  - `useBilling` – Billing operations
  - `useMedicalRecords` – Medical records management
  - `useNotifications` – Notification handling

**Design System:**
- **Tailwind CSS** – Utility-first CSS framework
- **shadcn/ui** – High-quality, accessible component library
- **Radix UI** – Headless UI primitives for accessibility
- **Lucide React** – Icon library for consistent iconography
- **Custom Color Palette** – Medical-themed colors (mint, columbia blue, picton blue, moonstone)
- **Responsive Design** – Mobile-first approach with breakpoints for tablets and desktops

**User Experience Features:**
- Loading states for all data-fetching operations
- Empty state handling with helpful messages
- Error handling with toast notifications (Sonner)
- Real-time data synchronization across portals
- Optimistic UI updates for better perceived performance
- Form validation with helpful error messages
- Responsive tables with proper column spanning
- Search and filter capabilities

---

### TECH STACK

**Frontend Framework & Libraries:**
- **React 18.3.1** – UI library for building component-based interfaces
- **TypeScript 5.8.3** – Type-safe JavaScript for enhanced development experience
- **Vite 5.4.19** – Next-generation frontend build tool for fast development
- **React Router DOM 6.30.1** – Declarative routing for single-page applications

**State Management & Data Fetching:**
- **TanStack React Query 5.83.0** – Powerful data synchronization library for server state, caching, and real-time updates

**UI Components & Styling:**
- **Tailwind CSS 3.4.17** – Utility-first CSS framework for rapid UI development
- **shadcn/ui** – Collection of re-usable components built with Radix UI and Tailwind CSS
- **Radix UI** – Unstyled, accessible components for building design systems (Dialog, Dropdown, Toast, etc.)
- **Lucide React 0.462.0** – Beautiful & consistent icon library
- **date-fns 3.6.0** – Modern JavaScript date utility library for date formatting and manipulation

**Forms & Validation:**
- **React Hook Form 7.61.1** – Performant, flexible and extensible forms with easy validation
- **Zod 3.25.76** – TypeScript-first schema validation library
- **@hookform/resolvers 3.10.0** – Validation resolver for React Hook Form

**Notifications:**
- **Sonner 1.7.4** – Beautiful toast notifications library

**Data Visualization:**
- **Recharts 2.15.4** – Composable charting library built on React components

**Development Tools:**
- **ESLint 9.32.0** – Code linting for maintaining code quality
- **TypeScript ESLint 8.38.0** – TypeScript-specific linting rules
- **PostCSS 8.5.6** – CSS transformation tool
- **Autoprefixer 10.4.21** – CSS vendor prefixing tool

**Storage:**
- **localStorage API** – Client-side data persistence for databases and authentication tokens

**Architecture Patterns:**
- Service Layer Pattern – Separation of business logic from UI components
- Repository Pattern – Centralized data access through database classes
- Custom Hooks Pattern – Reusable logic encapsulation
- API Layer Pattern – Centralized API calls with error handling

---

### DEMO SCREENSHOTS

**1. Home Page**
   - Landing page with hero section, services overview, and navigation to login/register
   - Displays key features and system capabilities
   - Clean, modern design with medical-themed color scheme

**2. Login Page**
   - User authentication form with email and password fields
   - Role-based redirection upon successful login
   - Responsive design with validation feedback

**3. Registration Page**
   - Multi-step registration form with role selection (Patient, Doctor, Receptionist)
   - Specialty input field for doctors
   - Password confirmation and validation
   - Automatic portal assignment based on selected role

**4. Patient Dashboard**
   - Overview cards showing upcoming appointments, medical records count, and pending bills
   - Doctor search functionality with filters
   - Upcoming appointments sidebar
   - Quick action buttons for common tasks
   - Real-time notification dropdown

**5. Find Doctors Page**
   - Searchable list of available doctors
   - Doctor cards displaying name, specialty, location, rating, and experience
   - Book appointment button for each doctor
   - Empty state when no doctors match search criteria

**6. Book Appointment Page**
   - Date and time slot selection interface
   - Calendar component for date picking
   - Available time slots displayed for selected doctor
   - Appointment type selection
   - Confirmation flow with success notification

**7. Appointment History Page**
   - Comprehensive table displaying all patient appointments with complete details
   - Columns include: Doctor name, Specialty, Appointment date (formatted with calendar icon), Time (with clock icon), Appointment type, Status with color-coded badges
   - Status badge system: Scheduled (secondary), Completed (green), Cancelled (destructive red), In Progress (blue)
   - Cancel appointment functionality for scheduled appointments with confirmation dialog
   - Back navigation button to return to patient dashboard
   - Loading state indicator while fetching appointment data
   - Empty state with helpful message and direct link to book new appointment when no appointments exist
   - Real-time data synchronization using React Query hooks
   - Responsive table design adapting to different screen sizes
   - Action column showing cancel button only for scheduled appointments

**8. Billing Page**
   - Invoice list with status indicators
   - Payment tracking and history
   - Billing summary with total pending amount
   - Download invoice functionality
   - Empty state when no invoices exist

**9. Medical Records Page**
   - Complete medical records management interface with upload, view, filter, and delete capabilities
   - Upload dialog with form fields: Record type selector (Prescription, Lab Report, X-Ray, Diagnosis, Other), Title input (required), Description input (optional), File upload with PDF/Image support
   - Comprehensive records table displaying: Title, Record type with color-coded badges (blue for prescription, green for lab report, purple for X-Ray, orange for diagnosis, gray for other), Date (formatted display), Doctor name, Action buttons (Download, Delete)
   - Advanced filtering system with record type filter dropdown and apply filter button
   - File download functionality for each medical record with download icon button
   - Delete record capability with confirmation dialog for safety
   - Record type badge system with distinct color coding for visual categorization
   - Loading state indicator during data fetching operations
   - Empty state with encouraging message and "Upload Your First Record" button when no records exist
   - Back navigation button to return to patient dashboard
   - Encrypted medical records support with secure file storage
   - File type validation accepting PDF, JPG, JPEG, and PNG formats
   - Real-time record list updates after upload or deletion operations

**10. Notifications Page**
   - Centralized notification center
   - Unread notification indicators
   - Notification type categorization
   - Mark as read functionality
   - Empty state when no notifications

**11. Doctor Portal Dashboard**
   - Statistics cards: Today's appointments, total patients, pending reviews, completed today
   - Today's appointment schedule table with patient names, times, and status
   - Patient history records with diagnosis and notes
   - Loading states for data fetching
   - Empty states for no appointments or history

**12. Receptionist Portal Dashboard**
   - Comprehensive statistics: Total appointments, active patients, total revenue, pending bills
   - Doctor appointments table showing today's schedule for all doctors
   - Patient records table with contact information and appointment history
   - Billing records table with invoice details, payment status, and actions
   - Search functionality for appointments and patients
   - Export capabilities for appointments and billing

**13. Doctor Verification Page (Admin)**
   - List of doctors pending verification
   - Doctor details with specialty and credentials
   - Approve/Reject actions with confirmation dialogs
   - Verification status tracking
   - Empty state when no pending verifications

**14. Navigation Components**
   - Role-based navigation bar showing relevant menu items
   - Notification bell with unread count
   - User profile information display
   - Logout functionality

**15. Loading States**
   - Skeleton loaders for tables and cards
   - Loading spinners during data fetching
   - Consistent loading messages across all portals

**16. Empty States**
   - Helpful messages when no data is available
   - Action prompts for users (e.g., "Book your first appointment")
   - Consistent styling across all empty states

**17. Error Handling**
   - Toast notifications for errors and successes
   - Form validation feedback
   - Network error handling with retry options
   - User-friendly error messages

---

## CONCLUSION

The Medical Care Management System successfully addresses the critical need for digital transformation in healthcare facilities by providing a comprehensive, user-friendly platform that streamlines operations across all stakeholder roles. The system demonstrates excellent usability and effectiveness through its intuitive interfaces, real-time data synchronization, and role-specific functionalities.

**From Patient Perspective:**
The patient portal empowers users to manage their healthcare journey independently. Features such as doctor search, appointment booking, medical records access, and billing management provide a seamless experience. Real-time notifications ensure patients stay informed about appointments, prescriptions, and payment deadlines. The responsive design ensures accessibility across devices.

**From Doctor Perspective:**
Doctors benefit from an organized dashboard that centralizes their daily operations. The ability to view schedules, access patient history, and upload prescriptions efficiently improves workflow. Statistics and metrics help doctors track their practice performance. The system reduces administrative burden, allowing doctors to focus on patient care.

**From Receptionist Perspective:**
The receptionist portal serves as a command center for healthcare facility operations. Comprehensive dashboards provide real-time insights into appointments, patients, and revenue. The ability to manage all appointments, generate bills, and track payments in one place significantly improves operational efficiency. Search and export capabilities enhance productivity.

**From Administrator Perspective:**
Administrative tools enable effective system management through doctor verification workflows, user management, and system monitoring. AI-powered validation ensures data integrity and system health. Automated reporting provides insights for facility management and decision-making.

**Key Achievements:**
- ✅ Consistent user experience across all portals
- ✅ Real-time data synchronization ensuring accuracy
- ✅ Robust authentication and authorization system
- ✅ Comprehensive error handling and loading states
- ✅ Scalable architecture supporting future enhancements
- ✅ Type-safe codebase reducing bugs and improving maintainability
- ✅ Responsive design ensuring accessibility
- ✅ Automated notifications and reminders improving engagement

The system successfully bridges the gap between healthcare providers and patients while streamlining administrative processes, making it an effective solution for modern healthcare management.
