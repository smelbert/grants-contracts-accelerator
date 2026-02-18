import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, MessageSquare, Calendar, User, Sparkles, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const NOTIFICATION_TYPES = {
  new_resource: { icon: Sparkles, label: 'New Resources', color: 'text-blue-600' },
  resource_update: { icon: Sparkles, label: 'Resource Updates', color: 'text-blue-600' },
  community_reply: { icon: MessageSquare, label: 'Discussion Replies', color: 'text-green-600' },
  community_new_post: { icon: MessageSquare, label: 'New Posts', color: 'text-green-600' },
  program_announcement: { icon: Bell, label: 'Announcements', color: 'text-purple-600' },
  session_reminder: { icon: Calendar, label: 'Event Reminders', color: 'text-amber-600' },
  new_learning_content: { icon: Sparkles, label: 'New Content', color: 'text-indigo-600' },
  project_update: { icon: User, label: 'Project Updates', color: 'text-teal-600' },
  project_invitation: { icon: User, label: 'Project Invites', color: 'text-teal-600' },
  system_alert: { icon: Bell, label: 'System Alerts', color: 'text-red-600' }
};

export default function NotificationCenter({ userEmail }) {
  const [selectedTab, setSelectedTab] = useState('all');
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () => base44.entities.UserNotification.filter({ user_email: userEmail }, '-created_date', 50),
    enabled: !!userEmail
  });

  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences', userEmail],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.filter({ user_email: userEmail });
      return prefs[0] || null;
    },
    enabled: !!userEmail
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.UserNotification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.UserNotification.update(n.id, { is_read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('All notifications marked as read');
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.UserNotification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Notification deleted');
    }
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: async (updates) => {
      if (preferences?.id) {
        return await base44.entities.NotificationPreference.update(preferences.id, updates);
      } else {
        return await base44.entities.NotificationPreference.create({
          user_email: userEmail,
          ...updates
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-preferences']);
      toast.success('Preferences updated');
    }
  });

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filteredNotifications = selectedTab === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Bell className="w-8 h-8 text-[#143A50]" />
              Notifications
            </h1>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
          <p className="text-slate-600">Stay updated with important activities</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="preferences">
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No notifications</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => {
                const typeConfig = NOTIFICATION_TYPES[notification.notification_type] || {};
                const Icon = typeConfig.icon || Bell;

                return (
                  <Card 
                    key={notification.id}
                    className={`cursor-pointer hover:shadow-md transition ${!notification.is_read ? 'bg-blue-50 border-blue-200' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 ${typeConfig.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 mb-1">{notification.title}</h4>
                              <p className="text-sm text-slate-600">{notification.message}</p>
                              <p className="text-xs text-slate-400 mt-2">
                                {new Date(notification.created_date).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notification.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-6 space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                  <p className="text-slate-600">You're all caught up!</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => {
                const typeConfig = NOTIFICATION_TYPES[notification.notification_type] || {};
                const Icon = typeConfig.icon || Bell;

                return (
                  <Card 
                    key={notification.id}
                    className="cursor-pointer hover:shadow-md transition bg-blue-50 border-blue-200"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 ${typeConfig.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{notification.title}</h4>
                          <p className="text-sm text-slate-600">{notification.message}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            {new Date(notification.created_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Choose which notifications you'd like to receive</h3>
                  <div className="space-y-4">
                    {Object.entries({
                      new_resources: 'New Resources',
                      resource_updates: 'Resource Updates',
                      community_replies: 'Discussion Replies',
                      community_new_posts: 'New Posts in Communities',
                      program_announcements: 'Program Announcements',
                      session_reminders: 'Event & Session Reminders',
                      project_updates: 'Project Updates'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <Label htmlFor={key} className="cursor-pointer flex-1">{label}</Label>
                        <Switch
                          id={key}
                          checked={preferences?.[key] ?? true}
                          onCheckedChange={(checked) => {
                            updatePreferenceMutation.mutate({ [key]: checked });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label className="mb-3 block">Email Digest Frequency</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['immediate', 'daily', 'weekly', 'never'].map((freq) => (
                      <Button
                        key={freq}
                        variant={preferences?.email_digest_frequency === freq ? 'default' : 'outline'}
                        onClick={() => updatePreferenceMutation.mutate({ email_digest_frequency: freq })}
                        className="capitalize"
                      >
                        {freq}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}