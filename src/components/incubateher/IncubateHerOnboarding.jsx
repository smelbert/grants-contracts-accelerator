import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Target, X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';

const STEPS = [
  { content: '🎉 Welcome to your IncubateHer workspace! This is your central hub where you can see your progress, upcoming sessions, and quick actions.' },
  { content: '📚 Program Overview — Access your program details, schedule, key dates, and cohort information anytime.' },
  { content: '🎓 Learning Hub — Start courses specifically designed for IncubateHer participants. Track your completion and earn certificates!' },
  { content: '📝 Digital Workbook — Complete interactive exercises, reflect on your journey, and build your funding strategy.' },
  { content: '📖 Resource Library — Download templates, guides, and reference materials to support your funding journey.' },
  { content: '✅ Readiness Assessment — Evaluate your organization\'s funding readiness and get personalized recommendations.' },
  { content: '💬 One-on-One Consultations — Schedule and manage your personalized consultation sessions with program facilitators.' },
  { content: '👥 Community Space — Connect with fellow IncubateHer participants, share experiences, and learn from peers.' },
  { content: '📋 Professional Templates — Access grant templates, RFP responses, budgets, and more to accelerate your work.' },
  { content: '🎯 Completion Tracker — Monitor your progress toward program completion and eligibility for the giveaway!' },
];

export default function IncubateHerOnboarding({ userEmail, show, onComplete }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (show && !done) {
      const completed = localStorage.getItem(`incubateher_tour_${userEmail}`);
      if (!completed) {
        const t = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(t);
      } else {
        setDone(true);
      }
    }
  }, [show, done, userEmail]);

  const finish = (skipped = false) => {
    setVisible(false);
    setDone(true);
    localStorage.setItem(`incubateher_tour_${userEmail}`, 'completed');
    if (!skipped) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    onComplete?.();
  };

  const restart = () => {
    setStep(0);
    setDone(false);
    setVisible(true);
  };

  const isLast = step === STEPS.length - 1;

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-[10000] w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="h-1 bg-slate-100">
              <div className="h-1 bg-[#AC1A5B] transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold text-[#AC1A5B] uppercase tracking-wider">
                  Step {step + 1} of {STEPS.length}
                </span>
                <button onClick={() => finish(true)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">{STEPS[step].content}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {STEPS.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === step ? 'bg-[#AC1A5B]' : 'bg-slate-200'}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  {step > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)} className="h-8 px-2">
                      <ChevronLeft className="w-3 h-3" />
                    </Button>
                  )}
                  {isLast ? (
                    <Button size="sm" onClick={() => finish(false)} className="h-8 bg-[#AC1A5B] hover:bg-[#8e1549]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Done!
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setStep(s => s + 1)} className="h-8 bg-[#AC1A5B] hover:bg-[#8e1549]">
                      Next <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {done && show && (
        <div className="fixed bottom-24 right-6 z-40">
          <Button onClick={restart} variant="outline" size="sm" className="bg-white border-[#AC1A5B] text-[#AC1A5B] hover:bg-[#AC1A5B] hover:text-white shadow-lg">
            <Target className="w-4 h-4 mr-2" />
            Replay Tour
          </Button>
        </div>
      )}
    </>
  );
}