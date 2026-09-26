import React from 'react';

export default function ProgressBar({ currentStep, totalSteps, stepLabel }) {
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="sticky top-0 z-30 bg-[#F9F4EF] pb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-[#7E5F22]">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-xs font-semibold text-[#143A50]">{stepLabel}</span>
      </div>
      <div className="h-1.5 bg-[#E5C089]/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#143A50] to-[#1E4F58] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}