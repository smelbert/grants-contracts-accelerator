import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TOUR_STEPS = [
  {
    content: 'Welcome to the Grants + Contracts Accelerator! Let us show you around.',
  },
  {
    content: 'Visit your Dashboard to see your funding readiness and track progress across funding pathways.',
  },
  {
    content: 'Browse Funding Opportunities to discover grants, RFPs, and contracts that match your organization.',
  },
  {
    content: 'Access the Learning Hub for courses, webinars, and resources to build your funding expertise.',
  },
  {
    content: 'Find ready-to-use templates for proposals, budgets, and other grant documents.',
  },
];

export default function OnboardingTour({ onComplete }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem('onboardingTourCompleted');
    if (!done) setTimeout(() => setVisible(true), 1000);
  }, []);

  const finish = () => {
    setVisible(false);
    localStorage.setItem('onboardingTourCompleted', 'true');
    onComplete?.();
  };

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <div className="fixed bottom-8 right-8 z-[10000] w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
          Step {step + 1} of {TOUR_STEPS.length}
        </span>
        <button onClick={finish} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed mb-4">{current.content}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {TOUR_STEPS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-emerald-600' : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft className="w-3 h-3" />
            </Button>
          )}
          {isLast ? (
            <Button size="sm" onClick={finish} className="bg-emerald-600 hover:bg-emerald-700">
              Done
            </Button>
          ) : (
            <Button size="sm" onClick={() => setStep(s => s + 1)} className="bg-emerald-600 hover:bg-emerald-700">
              Next <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}