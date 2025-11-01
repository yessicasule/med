import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Check, Trash2, Bell, Mail, MessageSquare } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import { format } from 'date-fns';

const Notifications = () => {
  const navigate = useNavigate();
  const {
    notifications,
    notificationSettings,
    isLoadingSettings,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    updateSettings,
  } = useNotifications();
  const { currentUser } = useAuth();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return '📅';
      case 'billing':
        return '💰';
      case 'prescription':
        return '💊';
      default:
        return '📢';
    }
  };

  const handleUpdateSettings = (key: keyof typeof notificationSettings, value: boolean) => {
    if (!currentUser?.id || !notificationSettings) return;
    updateSettings({
      userId: currentUser.id,
      settings: {
        ...notificationSettings,
        [key]: value,
      },
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/patient/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">Manage your notifications and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>All Notifications</CardTitle>
                  <CardDescription>
                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                  </CardDescription>
                </div>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark all as read
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          !notification.read ? 'bg-muted border-primary/20' : 'bg-background'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`font-semibold ${!notification.read ? 'font-bold' : ''}`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <Badge variant="secondary" className="text-xs">New</Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {notification.channel}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (window.confirm('Delete this notification?')) {
                                      deleteNotification(notification.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Appointment Reminders</Label>
                      <p className="text-xs text-muted-foreground">Get reminders before appointments</p>
                    </div>
                    <Switch
                      checked={notificationSettings?.appointmentReminder ?? false}
                      onCheckedChange={(checked) => handleUpdateSettings('appointmentReminder', checked)}
                      disabled={isLoadingSettings}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Billing Alerts</Label>
                      <p className="text-xs text-muted-foreground">Notifications for invoices and payments</p>
                    </div>
                    <Switch
                      checked={notificationSettings?.billingAlerts ?? false}
                      onCheckedChange={(checked) => handleUpdateSettings('billingAlerts', checked)}
                      disabled={isLoadingSettings}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Prescription Reminders</Label>
                      <p className="text-xs text-muted-foreground">Alerts for new prescriptions</p>
                    </div>
                    <Switch
                      checked={notificationSettings?.prescriptionReminders ?? false}
                      onCheckedChange={(checked) => handleUpdateSettings('prescriptionReminders', checked)}
                      disabled={isLoadingSettings}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Notifications
                      </Label>
                      <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings?.emailEnabled ?? false}
                      onCheckedChange={(checked) => handleUpdateSettings('emailEnabled', checked)}
                      disabled={isLoadingSettings}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        SMS Notifications
                      </Label>
                      <p className="text-xs text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={notificationSettings?.smsEnabled ?? false}
                      onCheckedChange={(checked) => handleUpdateSettings('smsEnabled', checked)}
                      disabled={isLoadingSettings}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
