// Billing Database - Stores Transactions and Invoices
// Connected to: Payments, Receptionist Modules

import { BillingSchema, BillingItem } from './schemas';

const BILLING_DB_KEY = 'med_billing_database';

class BillingDatabase {
  private billing: Map<string, BillingSchema> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(BILLING_DB_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.billing = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error loading billing database:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.billing);
      localStorage.setItem(BILLING_DB_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving billing database:', error);
    }
  }

  // Create invoice
  create(invoice: Omit<BillingSchema, 'createdAt' | 'updatedAt'>): BillingSchema {
    const now = new Date().toISOString();
    const invoiceSchema: BillingSchema = {
      ...invoice,
      createdAt: now,
      updatedAt: now,
    };
    this.billing.set(invoice.id, invoiceSchema);
    this.saveToStorage();
    return invoiceSchema;
  }

  // Generate invoice from appointment and items
  generateInvoice(
    patientId: string,
    appointmentId: string | undefined,
    items: BillingItem[],
    generatedBy: string
  ): BillingSchema {
    const total = items.reduce((sum, item) => sum + item.total, 0);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 days from now

    const invoice: BillingSchema = {
      id: `INV-${Date.now()}`,
      invoiceId: `INV-${Date.now()}`,
      patientId,
      appointmentId,
      amount: total,
      status: 'pending',
      dueDate: dueDate.toISOString().split('T')[0],
      items,
      generatedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.billing.set(invoice.id, invoice);
    this.saveToStorage();
    return invoice;
  }

  // Get invoice by ID
  getById(id: string): BillingSchema | undefined {
    return this.billing.get(id);
  }

  // Get invoices by patient ID
  getByPatientId(patientId: string): BillingSchema[] {
    return Array.from(this.billing.values())
      .filter(inv => inv.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get invoices by appointment ID
  getByAppointmentId(appointmentId: string): BillingSchema | undefined {
    return Array.from(this.billing.values())
      .find(inv => inv.appointmentId === appointmentId);
  }

  // Get invoices by status
  getByStatus(status: BillingSchema['status']): BillingSchema[] {
    return Array.from(this.billing.values())
      .filter(inv => inv.status === status);
  }

  // Update invoice
  update(id: string, updates: Partial<Omit<BillingSchema, 'id' | 'createdAt'>>): BillingSchema | undefined {
    const invoice = this.billing.get(id);
    if (!invoice) return undefined;

    const updated: BillingSchema = {
      ...invoice,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.billing.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  // Process payment
  processPayment(
    invoiceId: string,
    paymentMethod: 'online' | 'offline' | 'cash' | 'card',
    transactionId?: string
  ): BillingSchema | undefined {
    return this.update(invoiceId, {
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      transactionId,
    });
  }

  // Mark as overdue
  markOverdue(invoiceId: string): BillingSchema | undefined {
    const invoice = this.getById(invoiceId);
    if (!invoice || invoice.status === 'paid') return undefined;

    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return this.update(invoiceId, { status: 'overdue' });
    }
    return invoice;
  }

  // Get billing summary
  getSummary(patientId?: string): {
    totalPending: number;
    totalPaid: number;
    overdueAmount: number;
    recentInvoices: BillingSchema[];
  } {
    let invoices = Array.from(this.billing.values());

    if (patientId) {
      invoices = invoices.filter(inv => inv.patientId === patientId);
    }

    const totalPending = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const totalPaid = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueAmount = invoices
      .filter(inv => {
        if (inv.status !== 'pending') return false;
        const dueDate = new Date(inv.dueDate);
        return dueDate < today;
      })
      .reduce((sum, inv) => sum + inv.amount, 0);

    const recentInvoices = invoices
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalPending,
      totalPaid,
      overdueAmount,
      recentInvoices,
    };
  }

  // Delete invoice
  delete(id: string): boolean {
    const deleted = this.billing.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }
}

export const billingDB = new BillingDatabase();
