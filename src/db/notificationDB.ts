// Notification Database - Stores Alerts and Messages
// Connected to: System AI

import { NotificationSchema } from './schemas';

const NOTIFICATION_DB_KEY = 'med_notification_database';

class NotificationDatabase {
  private notifications: Map<string, NotificationSchema> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(NOTIFICATION_DB_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.notifications = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error loading notification database:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.notifications);
      localStorage.setItem(NOTIFICATION_DB_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving notification database:', error);
    }
  }

  // Create notification
  create(notification: Omit<NotificationSchema, 'createdAt' | 'updatedAt' | 'read' | 'readAt'>): NotificationSchema {
    const now = new Date().toISOString();
    const notificationSchema: NotificationSchema = {
      ...notification,
      read: false,
      createdAt: now,
      updatedAt: now,
    };
    this.notifications.set(notification.id, notificationSchema);
    this.saveToStorage();
    return notificationSchema;
  }

  // Get notification by ID
  getById(id: string): NotificationSchema | undefined {
    return this.notifications.get(id);
  }

  // Get notifications by user ID
  getByUserId(userId: string): NotificationSchema[] {
    return Array.from(this.notifications.values())
      .filter(notif => notif.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get unread notifications
  getUnread(userId: string): NotificationSchema[] {
    return this.getByUserId(userId)
      .filter(notif => !notif.read);
  }

  // Get notifications by type
  getByType(type: NotificationSchema['type'], userId?: string): NotificationSchema[] {
    let results = Array.from(this.notifications.values())
      .filter(notif => notif.type === type);

    if (userId) {
      results = results.filter(notif => notif.userId === userId);
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get notifications by channel
  getByChannel(channel: NotificationSchema['channel'], userId?: string): NotificationSchema[] {
    let results = Array.from(this.notifications.values())
      .filter(notif => notif.channel === channel);

    if (userId) {
      results = results.filter(notif => notif.userId === userId);
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Mark as read
  markAsRead(id: string): NotificationSchema | undefined {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;

    const updated: NotificationSchema = {
      ...notification,
      read: true,
      readAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.notifications.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  // Mark all as read for user
  markAllAsRead(userId: string): number {
    const notifications = this.getByUserId(userId);
    let count = 0;

    notifications.forEach(notif => {
      if (!notif.read) {
        this.markAsRead(notif.id);
        count++;
      }
    });

    return count;
  }

  // Update notification
  update(id: string, updates: Partial<Omit<NotificationSchema, 'id' | 'createdAt'>>): NotificationSchema | undefined {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;

    const updated: NotificationSchema = {
      ...notification,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.notifications.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  // Delete notification
  delete(id: string): boolean {
    const deleted = this.notifications.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  // Get unread count
  getUnreadCount(userId: string): number {
    return this.getUnread(userId).length;
  }

  // Send notification (used by AI/system)
  send(
    userId: string,
    type: NotificationSchema['type'],
    channel: NotificationSchema['channel'],
    title: string,
    message: string,
    sentBy?: string,
    link?: string,
    metadata?: Record<string, any>
  ): NotificationSchema {
    return this.create({
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      channel,
      title,
      message,
      sentBy,
      link,
      metadata,
    });
  }

  // Get recent notifications
  getRecent(userId?: string, limit: number = 10): NotificationSchema[] {
    let results = Array.from(this.notifications.values());

    if (userId) {
      results = results.filter(notif => notif.userId === userId);
    }

    return results
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export const notificationDB = new NotificationDatabase();
