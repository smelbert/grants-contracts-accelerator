import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ROLE_CHECKLISTS = {
  admin: [
    { id: 'profile', title: 'Complete Organization Profile', description: 'Set up your organization details', action_url: '/Profile' },
    { id: 'content', title: 'Create First Learning Module', description: 'Add content to your learning hub', action_url: '/AIContentManagement' },
    { id: 'templates', title: 'Review Template Library', description: 'Explore available templates', action_url: '/TemplateLibrary' },
    { id: 'coaches', title: 'Invite Coaches', description: 'Add team members to help organizations', action_url: '/CoachesStaff' },
    { id: 'pricing', title: 'Set Up Pricing', description: 'Configure membership tiers', action_url: '/Pricing' },
    { id: 'website', title: 'Build Your Website', description: 'Create landing pages and blog', action_url: '/WebsiteBuilder' },
  ],
  coach: [
    { id: 'profile', title: 'Set Up Coach Profile', description: 'Add your expertise and bio', action_url: '/CoachProfile' },
    { id: 'review', title: 'Explore Review Queue', description: 'Learn how to review documents', action_url: '/ReviewQueue' },
    { id: 'organizations', title: 'View Assigned Organizations', description: 'See who you\'re supporting', action_url: '/AssignedOrganizations' },
    { id: 'content', title: 'Create Teaching Content', description: 'Share your expertise', action_url: '/TeachingContent' },
    { id: 'video', title: 'Record Video Feedback', description: 'Learn the video feedback tool', action_url: '/VideoFeedback' },
  ],
  user: [
    { id: 'profile', title: 'Complete Your Organization Profile', description: 'Tell us about your mission', action_url: '/Profile' },
    { id: 'assessment', title: 'Take Readiness Assessment', description: 'Understand your funding readiness', action_url: '/GrantReadinessAssessment' },
    { id: 'learning', title: 'Start Your First Course', description: 'Build your grant writing skills', action_url: '/Learning' },
    { id: 'opportunities', title: 'Explore Funding Opportunities', description: 'Find grants and contracts', action_url: '/Opportunities' },
    { id: 'project', title: 'Create Your First Project', description: 'Start tracking an application', action_url: '/Projects' },
    { id: 'team', title: 'Invite Team Members', description: 'Collaborate with your team', action_url: '/TeamCollaboration' },
  ],
};

export default function OnboardingFlow({ userEmail, userRole, onComplete }) {
  const queryClient = useQueryClient();
  const [showOnboarding, setShowOnboarding] = useState(true);

  const { data: checklist } = useQuery({
    queryKey: ['onboarding-checklist', userEmail],
    queryFn: async () => {
      const lists = await base44.entities.OnboardingChecklist.filter({ user_email: userEmail });
      return lists[0];
    },
  });

  const createChecklistMutation = useMutation({
    mutationFn: async () => {
      const items = ROLE_CHECKLISTS[userRole].map(item => ({
        ...item,
        completed: false,
      }));
      
      const newChecklist = await base44.entities.OnboardingChecklist.create({
        user_email: userEmail,
        user_role: userRole,
        checklist_items: items,
        current_step: 0,
        completed: false,
      });

      // Send welcome email
      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: `Welcome to Grants + Contracts Accelerator! 🎉`,
        body: `
          <h2>Welcome aboard!</h2>
          <p>We're excited to have you join our community.</p>
          <p>We've created a personalized onboarding checklist to help you get started. Complete each step to unlock the full potential of the platform.</p>
          <p><strong>Your role:</strong> ${userRole === 'user' ? 'Member' : userRole === 'coach' ? 'Coach' : 'Administrator'}</p>
          <p>Let's get started on your journey to funding success!</p>
        `,
      });

      await base44.entities.OnboardingChecklist.update(newChecklist.id, {
        welcome_email_sent: true,
      });

      return newChecklist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['onboarding-checklist']);
      toast.success('Welcome! Your onboarding guide is ready.');
    },
  });

  const updateChecklistMutation = useMutation({
    mutationFn: async ({ itemId, completed }) => {
      const updatedItems = checklist.checklist_items.map(item =>
        item.id === itemId
          ? { ...item, completed, completed_date: completed ? new Date().toISOString() : null }
          : item
      );
      
      const allCompleted = updatedItems.every(item => item.completed);
      
      return await base44.entities.OnboardingChecklist.update(checklist.id, {
        checklist_items: updatedItems,
        completed: allCompleted,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['onboarding-checklist']);
    },
  });

  useEffect(() => {
    if (!checklist && userEmail && userRole) {
      createChecklistMutation.mutate();
    }
  }, [userEmail, userRole, checklist]);

  if (!checklist || checklist.completed || !showOnboarding) return null;

  const completedCount = checklist.checklist_items.filter(item => item.completed).length;
  const totalCount = checklist.checklist_items.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-6 right-6 z-50 w-96 max-w-[90vw]"
      >
        <Card className="shadow-2xl border-2 border-emerald-200">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-lg">Getting Started</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowOnboarding(false)}
                className="h-6 w-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">
                  {completedCount} of {totalCount} completed
                </span>
                <span className="text-sm font-semibold text-emerald-600">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {checklist.checklist_items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                    item.completed ? 'bg-emerald-50' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <button
                    onClick={() => updateChecklistMutation.mutate({ itemId: item.id, completed: !item.completed })}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${item.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                  </div>
                  {!item.completed && item.action_url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.location.href = item.action_url}
                      className="flex-shrink-0"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}