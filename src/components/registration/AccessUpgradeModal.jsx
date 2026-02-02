import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AccessUpgradeModal({ isOpen, onClose, userEmail, currentLevel }) {
  const queryClient = useQueryClient();

  const upgradeMutation = useMutation({
    mutationFn: async (newLevel) => {
      const existingAccess = await base44.entities.UserAccessLevel.filter({ user_email: userEmail });
      
      if (existingAccess.length > 0) {
        const access = existingAccess[0];
        return base44.entities.UserAccessLevel.update(access.id, {
          access_level: newLevel,
          upgrade_history: [
            ...(access.upgrade_history || []),
            {
              from_level: access.access_level,
              to_level: newLevel,
              date: new Date().toISOString()
            }
          ]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userAccessLevel']);
      toast.success('Access upgraded successfully!');
      onClose();
    }
  });

  const upgradePlans = [
    {
      level: 'coaching_portal',
      name: 'Coaching Access',
      description: 'One-on-one coaching with personalized support',
      features: [
        'Scheduled coaching sessions',
        'Document sharing & review',
        'Progress tracking',
        'Community access',
        'Exclusive coaching resources'
      ],
      price: 'Starting at $150/session',
      highlight: currentLevel === 'community_only'
    },
    {
      level: 'full_platform',
      name: 'Full Platform Access',
      description: 'Complete access to all features and resources',
      features: [
        'All coaching features',
        'Unlimited document templates',
        'AI-powered grant assistance',
        'Full course library',
        'Priority support',
        'All community spaces'
      ],
      price: 'Starting at $99/month',
      highlight: true
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade Your Access</DialogTitle>
          <DialogDescription>
            Take your journey to the next level with expanded access and personalized support
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {upgradePlans.map((plan) => (
            <Card key={plan.level} className={plan.highlight ? 'border-[#143A50] border-2' : ''}>
              <CardContent className="p-6">
                {plan.highlight && (
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-[#E5C089]" />
                    <span className="text-sm font-medium text-[#143A50]">Most Popular</span>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <p className="text-2xl font-bold text-[#143A50]">{plan.price}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => upgradeMutation.mutate(plan.level)}
                  disabled={upgradeMutation.isPending}
                  className="w-full"
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  Upgrade Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600 text-center">
            Questions about upgrading? <a href="mailto:support@elbertinnovativesolutions.org" className="text-[#143A50] font-medium hover:underline">Contact us</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}