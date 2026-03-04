import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  X, ChevronRight, ChevronLeft, Search, Bookmark, ShieldCheck, 
  Sparkles, Filter, TrendingUp, CheckCircle2
} from 'lucide-react';

const TOUR_KEY = 'opportunities_tour_v1';

const STEPS = [
  {
    id: 'welcome',
    icon: TrendingUp,
    iconBg: 'bg-[#143A50]',
    title: 'Welcome to Funding Opportunities! 🎉',
    description: 'Discover grants, contracts, RFPs, and more — all curated and vetted for organizations like yours. Let\'s take a quick tour of the key features.',
    target: null,
    position: 'center',
  },
  {
    id: 'filters',
    icon: Filter,
    iconBg: 'bg-blue-600',
    title: 'Filter by Funding Lane',
    description: 'Use the Lanes filter to narrow down to Grants, Contracts, Donors, or Public Funds. You can also search by keyword, funder name, or location.',
    target: '[data-tour="opp-filters"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'save',
    icon: Bookmark,
    iconBg: 'bg-emerald-600',
    title: 'Save Your Favorites',
    description: 'Click the bookmark icon on any card to save an opportunity. Access all your saved picks from the "Saved" tab — perfect for tracking opportunities you\'re actively pursuing.',
    target: '[data-tour="opp-save"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'vetting',
    icon: ShieldCheck,
    iconBg: 'bg-green-600',
    title: 'AI Vetting Badges',
    description: 'Each opportunity shows a vetting badge — "Verified", "Vetted", "Flagged", or "Pending Review". Our AI checks legitimacy, scoring each opportunity out of 100 so you can apply with confidence.',
    target: '[data-tour="opp-vetting"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'ai',
    icon: Sparkles,
    iconBg: 'bg-purple-600',
    title: 'AI-Powered Insights',
    description: 'Open any opportunity to see AI analysis including vetting scores, red flags, and recommended next steps. Admins can also use "Add via URL or Text" to instantly import new opportunities using AI.',
    target: '[data-tour="opp-card"]',
    position: 'right',
    highlight: true,
  },
  {
    id: 'done',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-600',
    title: 'You\'re All Set!',
    description: 'You now know the essentials. Start exploring opportunities, save your favorites, and use the AI insights to make informed decisions. You can replay this tour anytime from Settings.',
    target: null,
    position: 'center',
  },
];

function Spotlight({ targetSelector }) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!targetSelector) { setRect(null); return; }
    const el = document.querySelector(targetSelector);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [targetSelector]);

  if (!rect) return null;
  const pad = 8;
  return (
    <div
      className="fixed pointer-events-none z-[9998] rounded-xl ring-4 ring-[#E5C089] ring-offset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
      style={{
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
        transition: 'all 0.3s ease',
      }}
    />
  );
}

function TooltipCard({ step, stepIndex, total, onNext, onPrev, onDismiss, targetSelector }) {
  const [pos, setPos] = useState({ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' });
  const cardRef = useRef(null);

  useEffect(() => {
    if (!targetSelector) {
      setPos({ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', position: 'fixed' });
      return;
    }
    const el = document.querySelector(targetSelector);
    if (!el) {
      setPos({ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', position: 'fixed' });
      return;
    }
    const r = el.getBoundingClientRect();
    const cardH = 240;
    const cardW = 340;
    const margin = 24;
    let top, left;

    if (step.position === 'bottom') {
      top = r.bottom + margin;
      left = Math.max(margin, Math.min(r.left + r.width / 2 - cardW / 2, window.innerWidth - cardW - margin));
    } else if (step.position === 'right') {
      top = Math.max(margin, r.top + r.height / 2 - cardH / 2);
      left = r.right + margin;
      if (left + cardW > window.innerWidth - margin) left = r.left - cardW - margin;
    } else {
      top = r.bottom + margin;
      left = Math.max(margin, Math.min(r.left, window.innerWidth - cardW - margin));
    }

    // Keep within viewport
    if (top + cardH > window.innerHeight - margin) top = r.top - cardH - margin;
    top = Math.max(margin, top);

    setPos({ top, left, transform: 'none', position: 'fixed' });
  }, [targetSelector, step]);

  const Icon = step.icon;

  return (
    <motion.div
      ref={cardRef}
      key={step.id}
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 10 }}
      transition={{ duration: 0.2 }}
      className="z-[9999] w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      style={{ position: pos.position || 'fixed', top: pos.top, left: pos.left, transform: pos.transform }}
    >
      {/* Progress bar */}
      <div className="h-1 bg-slate-100">
        <div
          className="h-1 bg-[#143A50] transition-all duration-300"
          style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${step.iconBg} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 -mt-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug">{step.title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{step.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{stepIndex + 1} of {total}</span>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <Button variant="outline" size="sm" onClick={onPrev} className="h-8 px-3 text-xs">
                <ChevronLeft className="w-3 h-3 mr-1" /> Back
              </Button>
            )}
            {stepIndex < total - 1 ? (
              <Button size="sm" onClick={onNext} className="h-8 px-3 text-xs bg-[#143A50] hover:bg-[#1E4F58]">
                Next <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={onDismiss} className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Done!
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function OpportunitiesTour({ autoStart = false }) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (autoStart) {
      const done = localStorage.getItem(TOUR_KEY);
      if (!done) {
        setTimeout(() => setActive(true), 1200);
      }
    }
  }, [autoStart]);

  // Listen for external trigger
  useEffect(() => {
    const handler = () => { setStepIndex(0); setActive(true); };
    window.addEventListener('start-opportunities-tour', handler);
    return () => window.removeEventListener('start-opportunities-tour', handler);
  }, []);

  const dismiss = () => {
    setActive(false);
    localStorage.setItem(TOUR_KEY, 'true');
  };

  const next = () => {
    if (stepIndex < STEPS.length - 1) setStepIndex(i => i + 1);
    else dismiss();
  };

  const prev = () => {
    if (stepIndex > 0) setStepIndex(i => i - 1);
  };

  const currentStep = STEPS[stepIndex];

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Overlay for center-positioned steps */}
          {!currentStep.target && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[9997]"
              onClick={dismiss}
            />
          )}

          {/* Spotlight for targeted steps */}
          {currentStep.target && <Spotlight targetSelector={currentStep.target} />}

          {/* Tooltip card */}
          <TooltipCard
            step={currentStep}
            stepIndex={stepIndex}
            total={STEPS.length}
            onNext={next}
            onPrev={prev}
            onDismiss={dismiss}
            targetSelector={currentStep.target}
          />
        </>
      )}
    </AnimatePresence>
  );
}

// Export helper to start tour programmatically
export const startOpportunitiesTour = () => {
  window.dispatchEvent(new Event('start-opportunities-tour'));
};

export { TOUR_KEY };