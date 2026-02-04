import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Sparkles, ArrowRight, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function NewSubscriberOnboarding({ userEmail, subscriptionPlan, onComplete }) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({});

  const { data: onboardingProgress } = useQuery({
    queryKey: ['onboarding-progress', userEmail],
    queryFn: async () => {
      const progress = await base44.entities.OnboardingProgress.filter({ user_email: userEmail });
      return progress[0] || null;
    },
    enabled: !!userEmail
  });

  const updateProgressMutation = useMutation({
    mutationFn: (data) => {
      if (onboardingProgress) {
        return base44.entities.OnboardingProgress.update(onboardingProgress.id, data);
      } else {
        return base44.entities.OnboardingProgress.create({
          user_email: userEmail,
          subscription_plan: subscriptionPlan,
          started_date: new Date().toISOString(),
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['onboarding-progress']);
    }
  });

  const updateOrganizationMutation = useMutation({
    mutationFn: async (data) => {
      const orgs = await base44.entities.Organization.filter({ primary_contact: userEmail });
      if (orgs.length > 0) {
        return base44.entities.Organization.update(orgs[0].id, data);
      } else {
        return base44.entities.Organization.create({
          primary_contact: userEmail,
          ...data
        });
      }
    }
  });

  if (onboardingProgress?.onboarding_completed) {
    return null;
  }

  const steps = [
    {
      title: 'Welcome to EIS!',
      description: 'Let\'s get you started with a quick tour',
      component: (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#143A50] to-[#AC1A5B] rounded-full mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Welcome to Elbert Innovative Solutions!</h2>
          <p className="text-slate-600 mb-6">
            Thank you for subscribing to {subscriptionPlan}. We're excited to help you succeed in your funding journey.
          </p>
          <div className="bg-[#E5C089]/10 border border-[#E5C089] rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-2">What's Next?</h3>
            <p className="text-sm text-slate-600">
              We'll guide you through a quick setup process to personalize your experience and ensure you get the most out of our platform.
            </p>
          </div>
          <Button onClick={() => setCurrentStep(1)} size="lg">
            Get Started <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )
    },
    {
      title: 'Tell Us About Your Organization',
      description: 'Help us understand your goals',
      component: (
        <div className="space-y-4">
          <div>
            <Label>Organization Name *</Label>
            <Input
              value={onboardingData.org_name || ''}
              onChange={(e) => setOnboardingData({...onboardingData, org_name: e.target.value})}
              placeholder="Your organization name"
            />
          </div>
          <div>
            <Label>Mission Statement</Label>
            <Textarea
              value={onboardingData.mission || ''}
              onChange={(e) => setOnboardingData({...onboardingData, mission: e.target.value})}
              placeholder="What is your organization's mission?"
              rows={3}
            />
          </div>
          <div>
            <Label>Primary Focus Area *</Label>
            <Input
              value={onboardingData.focus_area || ''}
              onChange={(e) => setOnboardingData({...onboardingData, focus_area: e.target.value})}
              placeholder="e.g., Youth Development, Education, Health"
            />
          </div>
          <div>
            <Label>Current Stage</Label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={onboardingData.stage || ''}
              onChange={(e) => setOnboardingData({...onboardingData, stage: e.target.value})}
            >
              <option value="">Select stage</option>
              <option value="idea">Idea Stage</option>
              <option value="early">Early Stage (0-2 years)</option>
              <option value="operating">Operating (2-5 years)</option>
              <option value="scaling">Scaling (5+ years)</option>
            </select>
          </div>
        </div>
      )
    },
    {
      title: 'Watch Our Welcome Video',
      description: 'Learn how to navigate the platform',
      component: (
        <div className="text-center py-8">
          <div className="bg-slate-100 rounded-lg p-12 mb-6">
            <Play className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Welcome video coming soon!</p>
          </div>
          <div className="flex items-center justify-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm text-slate-600">Mark as watched</span>
          </div>
        </div>
      )
    },
    {
      title: 'Complete!',
      description: 'You\'re all set',
      component: (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4">You're All Set!</h2>
          <p className="text-slate-600 mb-8">
            Your account is now configured and ready to use. Let's explore what you can do next:
          </p>
          <div className="space-y-3 text-left mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Explore Funding Opportunities</p>
                <p className="text-sm text-slate-600">Browse grants and contracts tailored to your needs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Access Learning Resources</p>
                <p className="text-sm text-slate-600">Strengthen your skills with our comprehensive library</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Join the Community</p>
                <p className="text-sm text-slate-600">Connect with peers and share experiences</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = async () => {
    if (currentStep === 1) {
      // Save organization data
      if (onboardingData.org_name && onboardingData.focus_area) {
        await updateOrganizationMutation.mutateAsync({
          name: onboardingData.org_name,
          mission_statement: onboardingData.mission,
          sector_focus: [onboardingData.focus_area],
          stage: onboardingData.stage
        });
        await updateProgressMutation.mutateAsync({
          current_step: 'profile_completed',
          profile_completed: true,
          steps_completed: ['welcome', 'profile']
        });
      } else {
        return; // Don't proceed if required fields are empty
      }
    }

    if (currentStep === 2) {
      await updateProgressMutation.mutateAsync({
        current_step: 'video_watched',
        welcome_video_watched: true,
        steps_completed: ['welcome', 'profile', 'video']
      });
    }

    if (currentStep === steps.length - 1) {
      await updateProgressMutation.mutateAsync({
        onboarding_completed: true,
        completed_date: new Date().toISOString(),
        steps_completed: ['welcome', 'profile', 'video', 'complete']
      });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        onComplete?.();
      }, 2000);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(steps.length - 1);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
          <p className="text-sm text-slate-500">{steps[currentStep].description}</p>
        </DialogHeader>

        <Progress value={progress} className="mb-6" />

        <div className="min-h-[300px]">
          {steps[currentStep].component}
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-slate-500">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 && currentStep > 0 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip for now
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Go to Dashboard' : 'Continue'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}