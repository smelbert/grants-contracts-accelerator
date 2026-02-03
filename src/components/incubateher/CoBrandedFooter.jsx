import React from 'react';
import { BRAND_COLORS } from './CoBrandedHeader';

export default function CoBrandedFooter() {
  return (
    <div className="bg-white border-t mt-12 py-6">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
          <span className="font-semibold">Funded by Columbus Urban League</span>
          {' | '}
          <span className="font-semibold">Delivered by Elbert Innovative Solutions</span>
        </p>
      </div>
    </div>
  );
}