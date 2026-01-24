import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const TOUR_STEPS = [
  {
    target: 'body',
    content: 'Welcome to the Grants + Contracts Accelerator! Let us show you around.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="dashboard"]',
    content: 'This is your Dashboard. See your funding readiness and track progress across different funding pathways.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="opportunities"]',
    content: 'Browse the Funding Opportunities marketplace to discover grants, RFPs, and contracts that match your organization.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="learning"]',
    content: 'Access the Learning Hub for courses, webinars, and resources to build your funding expertise.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="templates"]',
    content: 'Find ready-to-use templates for proposals, budgets, and other grant documents.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="workflows"]',
    content: 'Track your proposal workflows and application deadlines in one place.',
    placement: 'bottom',
  },
];

export default function OnboardingTour({ onComplete }) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('onboardingTourCompleted');
    if (!hasCompletedTour) {
      // Start tour after a short delay
      setTimeout(() => setRun(true), 1000);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('onboardingTourCompleted', 'true');
      onComplete?.();
    }
  };

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#059669',
          zIndex: 10000,
        },
        tooltip: {
          fontSize: '14px',
          padding: '20px',
        },
        buttonNext: {
          backgroundColor: '#059669',
          fontSize: '14px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#64748b',
          fontSize: '14px',
        },
        buttonSkip: {
          color: '#94a3b8',
          fontSize: '13px',
        },
      }}
    />
  );
}