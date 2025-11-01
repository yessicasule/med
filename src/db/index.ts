// Database Index - Exports all database services

export * from './schemas';
export { userDB } from './userDB';
export { doctorDB } from './doctorDB';
export { appointmentDB } from './appointmentDB';
export { billingDB } from './billingDB';
export { medicalRecordsDB } from './medicalRecordsDB';
export { notificationDB } from './notificationDB';

// Database initialization and utilities
export const initializeDatabases = () => {
  // Initialize all databases (they auto-load from localStorage)
  console.log('Databases initialized');
};

// Clear all databases (for testing/reset)
export const clearAllDatabases = () => {
  localStorage.removeItem('med_user_database');
  localStorage.removeItem('med_doctor_database');
  localStorage.removeItem('med_appointment_database');
  localStorage.removeItem('med_billing_database');
  localStorage.removeItem('med_medical_records_database');
  localStorage.removeItem('med_notification_database');
  console.log('All databases cleared');
};
