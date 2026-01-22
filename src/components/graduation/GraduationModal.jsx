import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles, ArrowRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GRADUATION_CONFIG = {
  grant_eligible: {
    title: "You're Ready to Pursue Grants — the Right Way",
    icon: Award,
    color: 'emerald',
    achievements: [
      'Organizational credibility',
      'Compliance alignment',
      'Capacity foundations',
      'Strategic clarity'
    ],
    unlocked: [
      'Full grant opportunity feeds',
      'Advanced grant templates',
      'Submission workflows',
      'Coach review services'
    ]
  },
  contract_ready: {
    title: "You're Ready to Pursue Contracts — the Right Way",
    icon: Award,
    color: 'blue',
    achievements: [
      'Business entity registration',
      'Compliance documentation',
      'Capability statement',
      'Past performance readiness'
    ],
    unlocked: [
      'Contract opportunity feeds',
      'RFP response templates',
      'Bidding strategies',
      'Contract review services'
    ]
  }
};

export default function GraduationModal({ isOpen, onClose, graduationType = 'grant_eligible' }) {
  const config = GRADUATION_CONFIG[graduationType];

  React.useEffect(() => {
    if (isOpen) {
      // Trigger confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#3b82f6', '#8b5cf6']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10b981', '#3b82f6', '#8b5cf6']
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!config) return null;

  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className={`mx-auto mb-4 p-4 bg-${config.color}-100 rounded-full inline-block`}
          >
            <Icon className={`w-12 h-12 text-${config.color}-600`} />
          </motion.div>
          <DialogTitle className="text-2xl md:text-3xl font-bold text-slate-900">
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="text-center">
            <p className="text-slate-600 mb-2">This isn't about chasing money.</p>
            <p className="text-slate-900 font-medium text-lg">This is about becoming ready to steward it.</p>
          </div>

          <div>
            <p className="font-semibold text-slate-900 mb-3">You've built:</p>
            <div className="space-y-2">
              {config.achievements.map((achievement, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <CheckCircle2 className={`w-5 h-5 text-${config.color}-600`} />
                  <span className="text-slate-700">{achievement}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className={`w-5 h-5 text-${config.color}-600`} />
              You are now eligible to access:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {config.unlocked.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <Badge variant="outline" className={`bg-${config.color}-50 text-${config.color}-700 border-${config.color}-200 w-full justify-start py-2`}>
                    {item}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
            <Link to={createPageUrl('Opportunities')} onClick={onClose} className="block">
              <Button className={`w-full bg-${config.color}-600 hover:bg-${config.color}-700`}>
                Find Opportunities
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('BoilerplateBuilder')} onClick={onClose} className="block">
              <Button variant="outline" className="w-full">
                Build Strategy
              </Button>
            </Link>
            <Link to={createPageUrl('Community')} onClick={onClose} className="block">
              <Button variant="outline" className="w-full">
                Get Coach Support
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}