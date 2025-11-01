import { Invoice, PaymentData, BillingSummary } from '@/types';
import { authApi } from './auth';
import { billingDB } from '@/db';
import { PatientFlowService, ReceptionistFlowService } from '@/services/flowService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Billing & Payments API
export const billingApi = {
  // Generate digital invoice
  async generateInvoice(appointmentId: string, items: Array<{ description: string; quantity: number; unitPrice: number }>): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/billing/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authApi.getToken()}`,
      },
      body: JSON.stringify({ appointmentId, items }),
    }).catch(() => {
      // Demo fallback
      const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      return {
        ok: true,
        json: async () => ({
          id: Date.now().toString(),
          patientId: authApi.getCurrentUser()?.id || '1',
          appointmentId,
          amount: total,
          status: 'pending',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          items: items.map((item, idx) => ({
            id: (idx + 1).toString(),
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
          createdAt: new Date().toISOString(),
        }),
      } as Response;
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate invoice' }));
      throw new Error(error.message || 'Failed to generate invoice');
    }

    return await response.json();
  },

  // Get invoices for a patient
  async getInvoices(patientId?: string): Promise<Invoice[]> {
    const userId = patientId || authApi.getCurrentUser()?.id;
    const response = await fetch(`${API_BASE_URL}/billing/invoices${userId ? `?patientId=${userId}` : ''}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
    }).catch(() => {
      // Demo fallback
      return {
        ok: true,
        json: async () => [
          {
            id: '1',
            patientId: userId || '1',
            appointmentId: '1',
            amount: 150,
            status: 'pending',
            dueDate: '2025-11-15',
            items: [
              { id: '1', description: 'Consultation Fee', quantity: 1, unitPrice: 100, total: 100 },
              { id: '2', description: 'Lab Test', quantity: 1, unitPrice: 50, total: 50 },
            ],
            createdAt: '2025-10-20T10:00:00Z',
          },
          {
            id: '2',
            patientId: userId || '1',
            appointmentId: '2',
            amount: 200,
            status: 'paid',
            dueDate: '2025-10-10',
            paidDate: '2025-10-08',
            items: [
              { id: '3', description: 'Follow-up Consultation', quantity: 1, unitPrice: 150, total: 150 },
              { id: '4', description: 'Prescription', quantity: 1, unitPrice: 50, total: 50 },
            ],
            paymentMethod: 'online',
            createdAt: '2025-10-05T10:00:00Z',
          },
        ],
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }

    return await response.json();
  },

  // Get invoice by ID
  async getInvoice(invoiceId: string): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/billing/invoices/${invoiceId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
    }).catch(() => {
      return {
        ok: true,
        json: async () => ({
          id: invoiceId,
          patientId: '1',
          amount: 150,
          status: 'pending',
          dueDate: '2025-11-15',
          items: [],
          createdAt: new Date().toISOString(),
        }),
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }

    return await response.json();
  },

  // Process payment (online and offline) - Uses Patient Flow
  async processPayment(data: PaymentData): Promise<Invoice> {
    try {
      const response = await fetch(`${API_BASE_URL}/billing/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authApi.getToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // Fall through to local database
    }

    // Use local database via Patient Flow
    const invoice = await PatientFlowService.payBill(data.invoiceId, data.paymentMethod, data.transactionId);
    if (!invoice) {
      throw new Error('Payment failed');
    }

    return {
      id: invoice.id,
      patientId: invoice.patientId,
      appointmentId: invoice.appointmentId,
      amount: invoice.amount,
      status: invoice.status as Invoice['status'],
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate,
      paymentMethod: invoice.paymentMethod,
      items: invoice.items,
      createdAt: invoice.createdAt,
    };
  },

  // Get billing summary
  async getBillingSummary(patientId?: string): Promise<BillingSummary> {
    const userId = patientId || authApi.getCurrentUser()?.id;
    const invoices = await this.getInvoices(userId);

    const totalPending = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const totalPaid = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const overdueAmount = invoices
      .filter(inv => {
        if (inv.status !== 'pending') return false;
        const dueDate = new Date(inv.dueDate);
        return dueDate < new Date();
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
  },

  // Update invoice status
  async updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/billing/invoices/${invoiceId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authApi.getToken()}`,
      },
      body: JSON.stringify({ status }),
    }).catch(() => {
      return {
        ok: true,
        json: async () => ({
          id: invoiceId,
          patientId: '1',
          amount: 0,
          status,
          dueDate: new Date().toISOString().split('T')[0],
          items: [],
          createdAt: new Date().toISOString(),
        }),
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to update invoice status');
    }

    return await response.json();
  },
};
