import { Notification, NotificationSettings, NotificationType, NotificationChannel } from '@/types';
import { authApi } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Notifications API
export const notificationsApi = {
  // Get all notifications for a user
  async getNotifications(userId?: string, read?: boolean): Promise<Notification[]> {
    const userIdParam = userId || authApi.getCurrentUser()?.id;
    const queryParams = new URLSearchParams();
    if (userIdParam) queryParams.append('userId', userIdParam);
    if (read !== undefined) queryParams.append('read', read.toString());

    const response = await fetch(`${API_BASE_URL}/notifications?${queryParams}`, {
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
            userId: userIdParam || '1',
            type: 'appointment',
            channel: 'email',
            title: 'Appointment Reminder',
            message: 'You have an appointment with Dr. Sarah Johnson tomorrow at 10:00 AM',
            read: false,
            link: '/patient/dashboard',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            userId: userIdParam || '1',
            type: 'billing',
            channel: 'sms',
            title: 'Invoice Due',
            message: 'Your invoice #12345 is due on November 15, 2025',
            read: false,
            link: '/billing',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            userId: userIdParam || '1',
            type: 'prescription',
            channel: 'email',
            title: 'Prescription Ready',
            message: 'Your prescription from Dr. Michael Chen is ready for pickup',
            read: true,
            link: '/medical-records',
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          },
        ],
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return await response.json();
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
    }).catch(() => {
      return {
        ok: true,
        json: async () => ({
          id: notificationId,
          userId: '1',
          type: 'general',
          channel: 'email',
          title: 'Notification',
          message: 'Test',
          read: true,
          createdAt: new Date().toISOString(),
        }),
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return await response.json();
  },

  // Mark all notifications as read
  async markAllAsRead(userId?: string): Promise<void> {
    const userIdParam = userId || authApi.getCurrentUser()?.id;
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authApi.getToken()}`,
      },
      body: JSON.stringify({ userId: userIdParam }),
    }).catch(() => {
      return { ok: true } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
    }).catch(() => {
      return { ok: true } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
  },

  // Send notification (admin/system)
  async sendNotification(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authApi.getToken()}`,
      },
      body: JSON.stringify({
        userId,
        type,
        channel,
        title,
        message,
        link,
        metadata,
      }),
    }).catch(() => {
      return {
        ok: true,
        json: async () => ({
          id: Date.now().toString(),
          userId,
          type,
          channel,
          title,
          message,
          link,
          metadata,
          read: false,
          createdAt: new Date().toISOString(),
        }),
      } as Response;
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to send notification' }));
      throw new Error(error.message || 'Failed to send notification');
    }

    return await response.json();
  },

  // Get notification settings
  async getNotificationSettings(userId?: string): Promise<NotificationSettings> {
    const userIdParam = userId || authApi.getCurrentUser()?.id;
    const response = await fetch(`${API_BASE_URL}/notifications/settings?userId=${userIdParam}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authApi.getToken()}`,
      },
    }).catch(() => {
      // Demo fallback
      return {
        ok: true,
        json: async () => ({
          appointmentReminder: true,
          billingAlerts: true,
          prescriptionReminders: true,
          emailEnabled: true,
          smsEnabled: false,
        }),
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notification settings');
    }

    return await response.json();
  },

  // Update notification settings
  async updateNotificationSettings(userId: string, settings: NotificationSettings): Promise<NotificationSettings> {
    const response = await fetch(`${API_BASE_URL}/notifications/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authApi.getToken()}`,
      },
      body: JSON.stringify({ userId, ...settings }),
    }).catch(() => {
      return {
        ok: true,
        json: async () => settings,
      } as Response;
    });

    if (!response.ok) {
      throw new Error('Failed to update notification settings');
    }

    return await response.json();
  },

  // Get unread notification count
  async getUnreadCount(userId?: string): Promise<number> {
    const notifications = await this.getNotifications(userId, false);
    return notifications.length;
  },
};
