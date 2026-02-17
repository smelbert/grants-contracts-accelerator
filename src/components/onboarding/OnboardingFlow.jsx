import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ArrowRight, Sparkles, X, Video, Award, TrendingUp, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

const ROLE_CHECKLISTS = {
  admin: [
    { id: 'profile', title: 'Complete Organization Profile', description: 'Set up your organization details', action_url: '/Profile', points: 100, videoUrl: null },
    { id: 'content', title: 'Create First Learning Module', description: 'Add content to your learning hub', action_url: '/AIContentManagement', points: 150, videoUrl: null },
    { id: 'templates', title: 'Review Template Library', description: 'Explore available templates', action_url: '/TemplateLibrary', points: 50, videoUrl: null },
    { id: 'coaches', title: 'Invite Coaches', description: 'Add team members to help organizations', action_url: '/CoachesStaff', points: 100, videoUrl: null },
    { id: 'pricing', title: 'Set Up Pricing', description: 'Configure membership tiers', action_url: '/Pricing', points: 150, videoUrl: null },
    { id: 'website', title: 'Build Your Website', description: 'Create landing pages and blog', action_url: '/WebsiteBuilder', points: 200, videoUrl: null },
  ],
  coach: [
    { id: 'profile', title: 'Set Up Coach Profile', description: 'Add your expertise and bio', action_url: '/CoachProfile', points: 100, videoUrl: null },
    { id: 'review', title: 'Explore Review Queue', description: 'Learn how to review documents', action_url: '/ReviewQueue', points: 150, videoUrl: null },
    { id: 'organizations', title: 'View Assigned Organizations', description: 'See who you\'re supporting', action_url: '/AssignedOrganizations', points: 100, videoUrl: null },
    { id: 'content', title: 'Create Teaching Content', description: 'Share your expertise', action_url: '/TeachingContent', points: 150, videoUrl: null },
    { id: 'video', title: 'Record Video Feedback', description: 'Learn the video feedback tool', action_url: '/VideoFeedback', points: 100, videoUrl: null },
  ],
  user: [
    { id: 'profile', title: 'Complete Your Organization Profile', description: 'Tell us about your mission and stage', action_url: '/Profile', points: 100, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 'assessment', title: 'Take Readiness Assessment', description: 'Get personalized insights on your funding readiness', action_url: '/FundingReadinessAssessment', points: 150, videoUrl: null },
    { id: 'learning', title: 'Start Your First Course', description: 'Learn grant writing fundamentals', action_url: '/Learning', points: 200, videoUrl: null },
    { id: 'community', title: 'Join a Community Space', description: 'Connect with peers in your funding lane', action_url: '/Community', points: 50, videoUrl: null },
    { id: 'opportunities', title: 'Explore Funding Opportunities', description: 'Discover grants and contracts', action_url: '/Opportunities', points: 75, videoUrl: null },
    { id: 'project', title: 'Create Your First Project', description: 'Start tracking a funding application', action_url: '/Projects', points: 100, videoUrl: null },
    { id: 'template', title: 'Use a Template', description: 'Download and customize a template', action_url: '/Templates', points: 75, videoUrl: null },
  ],
};

export default function OnboardingFlow({ userEmail, userRole, onComplete }) {
  const queryClient = useQueryClient();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);
  const [watchingVideo, setWatchingVideo] = useState(null);

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
      if (!checklist?.id) {
        throw new Error('Checklist not found');
      }

      const updatedItems = checklist.checklist_items.map(item =>
        item.id === itemId
          ? { ...item, completed, completed_date: completed ? new Date().toISOString() : null }
          : item
      );
      
      const completedItem = updatedItems.find(item => item.id === itemId);
      const allCompleted = updatedItems.every(item => item.completed);
      
      // Award points for completing item
      if (completed && completedItem?.points) {
        try {
          await base44.entities.UserActivity.create({
            user_email: userEmail,
            activity_type: 'onboarding_step_completed',
            points: completedItem.points,
            description: `Completed: ${completedItem.title}`,
            metadata: { step_id: itemId }
          });
        } catch (error) {
          console.error('Failed to create activity:', error);
        }
      }
      
      const updated = await base44.entities.OnboardingChecklist.update(checklist.id, {
        checklist_items: updatedItems,
        completed: allCompleted,
        current_step: updatedItems.filter(i => i.completed).length
      });

      return updated;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['onboarding-checklist']);
      
      if (variables.completed) {
        const item = checklist.checklist_items.find(i => i.id === variables.itemId);
        toast.success(`✅ ${item?.title} completed! +${item?.points || 0} points`);
        
        // Confetti celebration
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
        
        // Check if all completed
        const allComplete = data.checklist_items.every(item => item.completed);
        if (allComplete) {
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
            toast.success('🎉 Onboarding Complete! You\'re all set!', { duration: 5000 });
          }, 500);
        }
      }
    },
  });

  useEffect(() => {
    if (!checklist && userEmail && userRole) {
      createChecklistMutation.mutate();
    }
  }, [userEmail, userRole, checklist]);

  if (!checklist || !showOnboarding) return null;
  if (checklist.completed && !expandedItem && !watchingVideo) return null;

  const completedCount = checklist.checklist_items.filter(item => item.completed).length;
  const totalCount = checklist.checklist_items.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const totalPoints = checklist.checklist_items.reduce((sum, item) => sum + (item.completed ? (item.points || 0) : 0), 0);
  const maxPoints = checklist.checklist_items.reduce((sum, item) => sum + (item.points || 0), 0);

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
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/90">
                  {completedCount} of {totalCount} completed
                </span>
                <div className="flex items-center gap-3">
                  <Badge className="bg-[#E5C089] text-[#143A50]">
                    <Award className="w-3 h-3 mr-1" />
                    {totalPoints} / {maxPoints} pts
                  </Badge>
                  <span className="text-sm font-semibold text-[#E5C089]">{progressPercent}%</span>
                </div>
              </div>
              <Progress value={progressPercent} className="h-2 bg-white/20" />
              {progressPercent === 100 && (
                <div className="bg-[#E5C089]/20 border border-[#E5C089] rounded-lg p-3 mt-2">
                  <p className="text-sm text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <strong>Congratulations!</strong> You've completed your onboarding journey!
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {checklist.checklist_items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-lg transition-all ${
                    item.completed ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3 p-3">
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
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-medium ${item.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {item.title}
                        </p>
                        {item.points && (
                          <Badge variant="outline" className="text-xs">
                            +{item.points}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{item.description}</p>
                      {expandedItem === item.id && item.videoUrl && (
                        <div className="mt-3">
                          <div className="relative bg-slate-900 rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                              src={item.videoUrl}
                              className="absolute top-0 left-0 w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.videoUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                          className="h-8 w-8 p-0"
                        >
                          {expandedItem === item.id ? <Maximize2 className="w-4 h-4" /> : <Video className="w-4 h-4 text-blue-600" />}
                        </Button>
                      )}
                      {!item.completed && item.action_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.location.href = item.action_url}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}