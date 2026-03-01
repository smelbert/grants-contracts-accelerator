import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, CreditCard, Bell, Shield, User, Users } from 'lucide-react';
import UserAccessManager from '@/components/admin/UserAccessManager';
import { toast } from 'sonner';

export default function PlatformSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const profile = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profile[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['user-subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: notificationPrefs } = useQuery({
    queryKey: ['notification-prefs', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.OpportunityNotificationPreference.filter({ user_email: user.email });
      return prefs[0] || null;
    },
    enabled: !!user?.email
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success('Profile updated successfully');
    }
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: (data) => {
      if (notificationPrefs) {
        return base44.entities.OpportunityNotificationPreference.update(notificationPrefs.id, data);
      } else {
        return base44.entities.OpportunityNotificationPreference.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-prefs']);
      toast.success('Notification preferences updated');
    }
  });

  const activeSubscription = subscriptions.find(s => s.status === 'active');

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <User className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="user-access">
            <Users className="w-4 h-4 mr-2" />
            User Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                updateUserMutation.mutate({
                  full_name: formData.get('full_name')
                });
              }} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    defaultValue={user?.full_name}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email}
                    disabled
                    className="bg-slate-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label>Account Type</Label>
                  <div className="mt-2">
                    <Badge>{user?.role}</Badge>
                  </div>
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Billing</CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              {activeSubscription ? (
                <div className="space-y-6">
                  <div>
                    <Label>Current Plan</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <Badge className="text-base py-2 px-4">{activeSubscription.plan_name}</Badge>
                      <span className="text-2xl font-bold">${activeSubscription.amount}/mo</span>
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-2">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Next Billing Date</Label>
                    <p className="mt-2 text-slate-700">
                      {new Date(activeSubscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <Button variant="outline">Manage Subscription</Button>
                    <Button variant="outline" className="ml-2">Update Payment Method</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No active subscription</p>
                  <Button>View Plans</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 text-center py-8">No billing history available</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Funding Opportunity Notifications</CardTitle>
              <CardDescription>Choose which opportunities you want to be notified about</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Receive All Notifications</Label>
                    <p className="text-sm text-slate-500">Get notified about every new funding opportunity</p>
                  </div>
                  <Switch
                    checked={notificationPrefs?.receive_all_notifications ?? true}
                    onCheckedChange={(checked) => {
                      updateNotificationsMutation.mutate({
                        user_email: user.email,
                        receive_all_notifications: checked
                      });
                    }}
                  />
                </div>

                {!notificationPrefs?.receive_all_notifications && (
                  <div className="border-t pt-6 space-y-4">
                    <p className="text-sm font-medium">Customize Your Notifications</p>
                    <p className="text-sm text-slate-500">
                      Configure specific criteria for funding opportunities you want to be notified about.
                    </p>
                    <Button variant="outline">Configure Filters</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Program Updates</Label>
                    <p className="text-sm text-slate-500">Updates about programs you're enrolled in</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Community Activity</Label>
                    <p className="text-sm text-slate-500">Notifications about community discussions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-slate-500">News, tips, and special offers</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input id="current_password" type="password" />
                </div>
                <div>
                  <Label htmlFor="new_password">New Password</Label>
                  <Input id="new_password" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input id="confirm_password" type="password" />
                </div>
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-500">Currently disabled</p>
                </div>
                <Button variant="outline">Enable</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Manage devices where you're logged in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Current Device</p>
                    <p className="text-sm text-slate-500">Last active: Just now</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}