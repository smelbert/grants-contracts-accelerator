import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar, Tag, CheckCircle2, AlertTriangle, Loader2, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { addDays, format, isPast, parseISO } from 'date-fns';

export default function ContentWorkflowAutomation() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: allContent = [] } = useQuery({
    queryKey: ['all-learning-content'],
    queryFn: () => base44.entities.LearningContent.list(),
  });

  const { data: reviewSchedules = [] } = useQuery({
    queryKey: ['review-schedules'],
    queryFn: () => base44.entities.ContentReviewSchedule.list(),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['content-notifications'],
    queryFn: () => base44.entities.ContentNotification.list('-created_date'),
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['all-learning-feedback'],
    queryFn: () => base44.entities.LearningFeedback.filter({ is_resolved: false }),
  });

  // Auto-categorize content
  const autoCategorize = async (content) => {
    const prompt = `Analyze this learning content and automatically categorize it.

Title: ${content.title}
Description: ${content.description}
Existing Tags: ${content.target_org_types?.join(', ') || 'none'}

Provide optimal categorization following these rules:
1. If content mentions "grant writing" or "proposals" → funding_lane: grants
2. If content mentions "contracts" or "RFP" → funding_lane: contracts  
3. If content mentions "donors" or "fundraising" → funding_lane: donors
4. If content is introductory → skill_level: beginner
5. If content requires prior knowledge → skill_level: intermediate/advanced

Return categorization and confidence score.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          funding_lane: { type: "string" },
          skill_level: { type: "string" },
          target_audience: { type: "array", items: { type: "string" } },
          content_tags: { type: "array", items: { type: "string" } },
          confidence: { type: "number" },
          rationale: { type: "string" }
        }
      }
    });

    return result;
  };

  const autoCategorizeContentMutation = useMutation({
    mutationFn: async (contentId) => {
      const content = allContent.find(c => c.id === contentId);
      const categorization = await autoCategorize(content);
      
      await base44.entities.LearningContent.update(contentId, {
        funding_lane: categorization.funding_lane,
        target_org_types: categorization.target_audience
      });

      await base44.entities.ContentNotification.create({
        learning_content_id: contentId,
        recipient_email: content.created_by,
        notification_type: 'auto_categorized',
        subject: `Content Auto-Categorized: ${content.title}`,
        message: `Your content has been automatically categorized.\n\nFunding Lane: ${categorization.funding_lane}\nConfidence: ${Math.round(categorization.confidence * 100)}%\n\nRationale: ${categorization.rationale}`,
        priority: 'low'
      });

      return categorization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-learning-content'] });
      queryClient.invalidateQueries({ queryKey: ['content-notifications'] });
      toast.success('Content auto-categorized!');
    }
  });

  // Generate review notification
  const generateReviewNotificationMutation = useMutation({
    mutationFn: async (scheduleId) => {
      const schedule = reviewSchedules.find(s => s.id === scheduleId);
      const content = allContent.find(c => c.id === schedule.learning_content_id);

      const prompt = `Draft a professional notification for a content owner about their module being due for review.

Module: ${content.title}
Last Review: ${schedule.last_review_date}
Next Review Due: ${schedule.next_review_date}
Age: ${Math.round((new Date() - new Date(content.created_date)) / (1000 * 60 * 60 * 24 / 30))} months

Draft a concise, actionable email notification including:
- Why the review is needed
- What to focus on (outdated info, new best practices, etc.)
- Suggested timeline`;

      const notification = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            message: { type: "string" },
            priority: { type: "string" },
            suggested_actions: { type: "array", items: { type: "string" } }
          }
        }
      });

      await base44.entities.ContentNotification.create({
        learning_content_id: schedule.learning_content_id,
        recipient_email: schedule.content_owner_email,
        notification_type: 'review_due',
        subject: notification.subject,
        message: notification.message,
        priority: notification.priority,
        action_required: true
      });

      await base44.entities.ContentReviewSchedule.update(scheduleId, {
        notification_sent: true,
        notification_sent_date: new Date().toISOString()
      });

      return notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['review-schedules'] });
      toast.success('Review notification sent!');
    }
  });

  // Analyze feedback for critical issues
  const analyzeCriticalFeedbackMutation = useMutation({
    mutationFn: async () => {
      const feedbackByContent = feedbacks.reduce((acc, f) => {
        if (!acc[f.learning_content_id]) acc[f.learning_content_id] = [];
        acc[f.learning_content_id].push(f);
        return acc;
      }, {});

      const notifications = [];

      for (const [contentId, contentFeedback] of Object.entries(feedbackByContent)) {
        if (contentFeedback.length < 3) continue;

        const content = allContent.find(c => c.id === contentId);
        const feedbackText = contentFeedback.map(f => f.message).join('\n---\n');

        const prompt = `Analyze this user feedback and determine if there are critical issues requiring immediate attention.

Module: ${content?.title}
Feedback Count: ${contentFeedback.length}

Feedback:
${feedbackText}

Identify:
1. Are there critical issues? (outdated info, errors, confusion)
2. What's the severity?
3. Draft notification for content owner`;

        const analysis = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              has_critical_issues: { type: "boolean" },
              severity: { type: "string" },
              issues_summary: { type: "string" },
              notification_message: { type: "string" }
            }
          }
        });

        if (analysis.has_critical_issues) {
          notifications.push({
            learning_content_id: contentId,
            recipient_email: content.created_by,
            notification_type: 'feedback_critical',
            subject: `Critical User Feedback: ${content.title}`,
            message: analysis.notification_message,
            priority: analysis.severity === 'high' ? 'urgent' : 'high',
            action_required: true,
            metadata: { feedback_count: contentFeedback.length }
          });
        }
      }

      if (notifications.length > 0) {
        await base44.entities.ContentNotification.bulkCreate(notifications);
      }

      return notifications;
    },
    onSuccess: (notifications) => {
      queryClient.invalidateQueries({ queryKey: ['content-notifications'] });
      toast.success(`${notifications.length} critical feedback notifications created!`);
    }
  });

  const overdueCont = reviewSchedules.filter(s => 
    s.next_review_date && isPast(parseISO(s.next_review_date)) && !s.notification_sent
  );

  const unreadNotifications = notifications.filter(n => !n.is_read);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Workflow Automation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedules">Review Schedules</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{overdueCont.length}</p>
                  <p className="text-xs text-slate-600">Overdue Reviews</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Bell className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{unreadNotifications.length}</p>
                  <p className="text-xs text-slate-600">Pending Notifications</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{feedbacks.length}</p>
                  <p className="text-xs text-slate-600">Unresolved Feedback</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => analyzeCriticalFeedbackMutation.mutate()}
                disabled={analyzeCriticalFeedbackMutation.isPending}
                className="w-full"
              >
                {analyzeCriticalFeedbackMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                ) : (
                  <><AlertTriangle className="w-4 h-4 mr-2" /> Analyze Feedback for Critical Issues</>
                )}
              </Button>

              {allContent.filter(c => !c.funding_lane || c.funding_lane === 'general').length > 0 && (
                <div className="border rounded p-3 bg-blue-50">
                  <p className="text-sm font-medium mb-2">
                    {allContent.filter(c => !c.funding_lane || c.funding_lane === 'general').length} modules need categorization
                  </p>
                  {allContent.filter(c => !c.funding_lane || c.funding_lane === 'general').slice(0, 3).map(c => (
                    <div key={c.id} className="flex items-center justify-between text-sm py-1">
                      <span className="truncate">{c.title}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => autoCategorizeContentMutation.mutate(c.id)}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        Auto-tag
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Schedules Tab */}
          <TabsContent value="schedules" className="space-y-3">
            {overdueCont.length === 0 ? (
              <p className="text-center text-slate-500 py-6">No overdue reviews</p>
            ) : (
              overdueCont.map(schedule => {
                const content = allContent.find(c => c.id === schedule.learning_content_id);
                return content ? (
                  <div key={schedule.id} className="border rounded p-3 bg-orange-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{content.title}</p>
                        <p className="text-xs text-slate-600">
                          Due: {format(parseISO(schedule.next_review_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">Overdue</Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => generateReviewNotificationMutation.mutate(schedule.id)}
                      disabled={generateReviewNotificationMutation.isPending}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Send Notification
                    </Button>
                  </div>
                ) : null;
              })
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-slate-500 py-6">No notifications</p>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className={`border rounded p-3 ${notif.is_read ? 'bg-slate-50' : 'bg-white'}`}>
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm">{notif.subject}</p>
                    <Badge variant={notif.priority === 'urgent' ? 'destructive' : 'outline'}>
                      {notif.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{notif.message}</p>
                  {!notif.is_read && (
                    <Badge className="bg-blue-100 text-blue-800 mt-2 text-xs">Unread</Badge>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}