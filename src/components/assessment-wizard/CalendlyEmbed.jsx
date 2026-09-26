import React from 'react';
import { CALENDLY_URL } from '@/lib/assessmentConfig';

export default function CalendlyEmbed() {
  return (
    <iframe
      src={CALENDLY_URL}
      width="100%"
      height="600"
      frameBorder="0"
      title="Schedule a consultation with Dr. Shawnté Elbert"
      className="rounded-xl"
    />
  );
}