import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Users, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ProgramAnnouncementsPage() {
  const [selectedCohort, setSelectedCohort] = useState('');
  const [recipientType, setRecipientType] = useState('all');
  const [sending, setSending] = useState(false);
  const queryClient = useQueryClient();

  const { data: cohorts = [] } = useQuery({
    queryKey: ['all-cohorts'],
    queryFn: () => base44.entities.ProgramCohort.list()
  });

  const { data: recentAnnouncements = [] } = useQuery({
    queryKey: ['recent-announcements'],
    queryFn: async () => {
      const notifications = await base44.entities.UserNotification.filter({
        notification_type: 'program_announcement'
      }, '-created_date', 20);
      return notifications;
    }
  });

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const formData = new FormData(e.target);
      const title = formData.get('title');
      const message = formData.get('message');
      const priority = formData.get('priority');

      const response = await base44.functions.invoke('sendProgramAnnouncement', {
        cohort_id: selectedCohort,
        recipient_type: recipientType,
        title,
        message,
        priority
      });

      if (response.data.success) {
        toast.success(`Announcement sent to ${response.data.recipients_count} recipients`);
        queryClient.invalidateQueries(['recent-announcements']);
        e.target.reset();
        setSelectedCohort('');
        setRecipientType('all');
      } else {
        toast.error('Failed to send announcement');
      }
    } catch (error) {
      toast.error('Error sending announcement');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const getCohortEnrollmentCount = async (cohortId) => {
    const enrollments = await base44.entities.ProgramEnrollment.filter({
      cohort_id: cohortId
    });
    return enrollments.length;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-[#143A50]" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Program Announcements</h1>
            <p className="text-slate-600">Send notifications to program participants and staff</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send Announcement Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send Announcement</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendAnnouncement} className="space-y-4">
                  <div>
                    <Label>Select Program</Label>
                    <Select value={selectedCohort} onValueChange={setSelectedCohort} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a program..." />
                      </SelectTrigger>
                      <SelectContent>
                        {cohorts.map((cohort) => (
                          <SelectItem key={cohort.id} value={cohort.id}>
                            {cohort.program_name} ({cohort.program_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Recipients</Label>
                    <Select value={recipientType} onValueChange={setRecipientType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Participants & Staff</SelectItem>
                        <SelectItem value="participants">Participants Only</SelectItem>
                        <SelectItem value="facilitators">Facilitators Only</SelectItem>
                        <SelectItem value="contractors">Contractors Only</SelectItem>
                        <SelectItem value="viewers">Viewers Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select name="priority" defaultValue="normal">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Title</Label>
                    <Input name="title" placeholder="Announcement title" required />
                  </div>

                  <div>
                    <Label>Message</Label>
                    <Textarea 
                      name="message" 
                      rows={6} 
                      placeholder="Your announcement message..."
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={sending || !selectedCohort}>
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Announcement
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recent Announcements */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Recent Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAnnouncements.slice(0, 10).map((notif) => (
                    <div key={notif.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-sm text-slate-900 line-clamp-1">
                          {notif.title}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={
                            notif.priority === 'urgent' ? 'border-red-500 text-red-700' :
                            notif.priority === 'high' ? 'border-amber-500 text-amber-700' :
                            'border-slate-300'
                          }
                        >
                          {notif.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400">
                        {format(new Date(notif.created_date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  ))}
                  {recentAnnouncements.length === 0 && (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No announcements sent yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Active Programs Overview */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cohorts.filter(c => c.is_active).map((cohort) => (
                  <div key={cohort.id} className="p-4 border rounded-lg hover:shadow-md transition">
                    <h3 className="font-semibold text-slate-900 mb-2">{cohort.program_name}</h3>
                    <p className="text-sm text-slate-600 mb-3">{cohort.program_code}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Users className="w-4 h-4" />
                      <span>Enrolled participants</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}