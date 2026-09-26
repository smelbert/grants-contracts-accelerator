import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ACKNOWLEDGMENTS } from '@/lib/assessmentConfig';

export default function AcknowledgmentsStep({ acknowledgments, onToggle }) {
  const allChecked = ACKNOWLEDGMENTS.every((_, i) => acknowledgments[i]);

  return (
    <div>
      <h2 className="text-2xl font-serif text-[#143A50] mb-1">Acknowledgments</h2>
      <p className="text-sm text-slate-600 mb-6">Please review and check each acknowledgment below to see your results.</p>

      <div className="space-y-3">
        {ACKNOWLEDGMENTS.map((text, i) => (
          <label
            key={i}
            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
              acknowledgments[i] ? 'border-[#143A50] bg-[#143A50]/5' : 'border-slate-200 hover:border-[#E5C089]'
            }`}
          >
            <Checkbox
              checked={acknowledgments[i] || false}
              onCheckedChange={() => onToggle(i)}
              className="mt-0.5"
            />
            <span className="text-sm text-slate-700">{text}</span>
          </label>
        ))}
      </div>

      {!allChecked && (
        <p className="mt-4 text-xs text-[#AC1A5B]">All acknowledgments must be checked to proceed.</p>
      )}
    </div>
  );
}