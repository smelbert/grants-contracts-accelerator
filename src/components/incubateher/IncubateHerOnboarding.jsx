import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';

const INCUBATEHER_TOUR_STEPS = [
  {
    target: '[data-tour="dashboard"]',
    content: 'Welcome to your IncubateHer workspace! This is your dashboard where you can see everything at a glance.',
    disableBeacon: true,
    placement: 'right'
  },
  {
    target: 'a[href*="Projects"]',
    content: 'Access your projects here. Create and manage funding proposals, grant applications, and strategic plans.',
    placement: 'right'
  },
  {
    target: 'a[href*="Documents"]',
    content: 'Store and organize all your important documents—budgets, letters of support, and more.',
    placement: 'right'
  },
  {
    target: '[data-tour="templates"]',
    content: 'Access professional templates for grants, RFPs, contracts, and funding readiness documents.',
    placement: 'right'
  },
  {
    target: 'a[href*="Opportunities"]',
    content: 'Browse funding opportunities to see examples and get inspired for your own applications.',
    placement: 'right'
  },
  {
    target: 'a[href*="Community"]',
    content: 'Connect with other IncubateHer participants in your exclusive community space.',
    placement: 'right'
  },
  {
    target: 'a[href*="Chat"]',
    content: 'Send direct messages to program facilitators and fellow participants.',
    placement: 'right'
  },
  {
    target: 'a[href*="IncubateHerOverview"]',
    content: 'Return to the IncubateHer program overview anytime to review materials and track your progress.',
    placement: 'right'
  }
];

export default function IncubateHerOnboarding({ userEmail, show, onComplete }) {
  const [run, setRun] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  useEffect(() => {
    if (show && !tourCompleted) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [show, tourCompleted]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      setTourCompleted(true);
      if (onComplete) {
        onComplete();
      }
    }
  };

  const restartTour = () => {
    setTourCompleted(false);
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

      {tourCompleted && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={restartTour}
            className="bg-[#AC1A5B] hover:bg-[#8A1548] text-white shadow-lg"
          >
            <Target className="w-4 h-4 mr-2" />
            Restart IncubateHer Tour
          </Button>
        </div>
      )}
    </>
  );
}