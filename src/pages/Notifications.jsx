import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, Trash2, Settings, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['all-notifications', user?.email],
    queryFn: async () => {
      return await base44.entities.UserNotification.filter(
        { user_email: user.email },
        '-created_date'
      );
    },
    enabled: !!user?.email
  });

  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.filter({
        user_email: user.email
      });
      return prefs[0];
    },
    enabled: !!user?.email
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) =>
      base44.entities.UserNotification.update(notificationId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-notifications']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (notificationId) =>
      base44.entities.UserNotification.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-notifications']);
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences) {
        return await base44.entities.NotificationPreference.update(preferences.id, data);
      } else {
        return await base44.entities.NotificationPreference.create({
          user_email: user.email,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-preferences']);
    }
  });

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Bell className="w-8 h-8 text-[#143A50]" />
              Notifications
            </h1>
            <p className="text-slate-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="#settings">
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </a>
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilter('all')}>
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" onClick={() => setFilter('unread')}>
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read" onClick={() => setFilter('read')}>
              Read ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600">No notifications to display</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`${!notification.is_read ? 'border-l-4 border-l-blue-600 bg-blue-50/30' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!notification.is_read && (
                            <div className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                          <h3 className="font-semibold text-slate-900">
                            {notification.title}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {notification.notification_type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {notification.link && (
                      <Button
                        size="sm"
                        variant="link"
                        className="mt-2 p-0 h-auto"
                        asChild
                      >
                        <a href={notification.link}>View Details →</a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Notification Preferences Section */}
        <Card className="mt-8" id="settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { key: 'new_resources', label: 'New resources added to library' },
                { key: 'resource_updates', label: 'Updates to favorited resources' },
                { key: 'community_replies', label: 'Replies to my community posts' },
                { key: 'community_new_posts', label: 'New posts in subscribed spaces' },
                { key: 'program_announcements', label: 'Program announcements' },
                { key: 'session_reminders', label: 'Session reminders' },
                { key: 'project_updates', label: 'Project collaboration updates' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <label htmlFor={key} className="text-sm font-medium">
                    {label}
                  </label>
                  <input
                    type="checkbox"
                    id={key}
                    checked={preferences?.[key] ?? true}
                    onChange={(e) =>
                      updatePreferencesMutation.mutate({ [key]: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <label className="text-sm font-medium mb-2 block">
                Email Digest Frequency
              </label>
              <select
                value={preferences?.email_digest_frequency || 'daily'}
                onChange={(e) =>
                  updatePreferencesMutation.mutate({ email_digest_frequency: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily Summary</option>
                <option value="weekly">Weekly Summary</option>
                <option value="never">Never (In-app only)</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}