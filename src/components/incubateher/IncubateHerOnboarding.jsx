import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import confetti from 'canvas-confetti';

const INCUBATEHER_TOUR_STEPS = [
  {
    target: '[data-tour="dashboard"]',
    content: '🎉 Welcome to your IncubateHer workspace! This is your central hub where you can see your progress, upcoming sessions, and quick actions.',
    disableBeacon: true,
    placement: 'right'
  },
  {
    target: 'a[href*="IncubateHerOverview"]',
    content: '📚 Your Program Overview - Access your program details, schedule, key dates, and cohort information anytime.',
    placement: 'right'
  },
  {
    target: 'a[href*="IncubateHerLearning"]',
    content: '🎓 Learning Hub - Start courses specifically designed for IncubateHer participants. Track your completion and earn certificates!',
    placement: 'right'
  },
  {
    target: 'a[href*="IncubateHerWorkbook"]',
    content: '📝 Your Digital Workbook - Complete interactive exercises, reflect on your journey, and build your funding strategy.',
    placement: 'right'
  },
  {
    target: 'a[href*="ResourceLibrary"]',
    content: '📖 Resource Library - Download templates, guides, and reference materials to support your funding journey.',
    placement: 'right'
  },
  {
    target: 'a[href*="FundingReadinessAssessment"]',
    content: '✅ Readiness Assessment - Evaluate your organization\'s funding readiness and get personalized recommendations.',
    placement: 'right'
  },
  {
    target: 'a[href*="IncubateHerConsultations"]',
    content: '💬 One-on-One Consultations - Schedule and manage your personalized consultation sessions with program facilitators.',
    placement: 'right'
  },
  {
    target: 'a[href*="Community"]',
    content: '👥 Community Space - Connect with fellow IncubateHer participants, share experiences, and learn from peers.',
    placement: 'right'
  },
  {
    target: '[data-tour="templates"]',
    content: '📋 Professional Templates - Access grant templates, RFP responses, budgets, and more to accelerate your work.',
    placement: 'right'
  },
  {
    target: 'a[href*="IncubateHerCompletion"]',
    content: '🎯 Completion Tracker - Monitor your progress toward program completion and eligibility for the giveaway!',
    placement: 'right'
  }
];

export default function IncubateHerOnboarding({ userEmail, show, onComplete }) {
  const [run, setRun] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (show && !tourCompleted) {
      // Check if tour was already completed before
      const hasCompletedTour = localStorage.getItem(`incubateher_tour_${userEmail}`);
      if (!hasCompletedTour) {
        const timer = setTimeout(() => {
          setRun(true);
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        setTourCompleted(true);
      }
    }
  }, [show, tourCompleted, userEmail]);

  const handleJoyrideCallback = (data) => {
    const { status, index, action } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      setTourCompleted(true);
      localStorage.setItem(`incubateher_tour_${userEmail}`, 'completed');
      
      // Celebrate completion
      if (status === STATUS.FINISHED) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      if (onComplete) {
        onComplete();
      }
    }
    
    setStepIndex(index);
  };

  const restartTour = () => {
    setTourCompleted(false);
    setStepIndex(0);
    setRun(true);
  };

  return (
    <>
      <Joyride
        steps={INCUBATEHER_TOUR_STEPS}
        run={run}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#AC1A5B',
            zIndex: 10000,
          },
          tooltipContainer: {
            textAlign: 'left'
          },
          buttonNext: {
            backgroundColor: '#AC1A5B',
            borderRadius: '8px',
            padding: '8px 16px'
          },
          buttonBack: {
            color: '#AC1A5B',
            marginRight: '8px'
          },
          buttonSkip: {
            color: '#64748b'
          }
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour'
        }}
      />

      {tourCompleted && show && (
        <div className="fixed bottom-24 right-6 z-40">
          <Button
            onClick={restartTour}
            variant="outline"
            size="sm"
            className="bg-white border-[#AC1A5B] text-[#AC1A5B] hover:bg-[#AC1A5B] hover:text-white shadow-lg"
          >
            <Target className="w-4 h-4 mr-2" />
            Replay Tour
          </Button>
        </div>
      )}
    </>
  );
}