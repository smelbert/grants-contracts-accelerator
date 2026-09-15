import React from 'react';

const DEFAULT_BRAND = {
  primary_color: '#143A50',
  accent_color: '#E5C089',
  footer_text: '',
};

export default function ProgramFooter({ cohort }) {
  const brand = { ...DEFAULT_BRAND, ...(cohort?.brand_config || {}) };
  const text =
    brand.footer_text ||
    `© ${new Date().getFullYear()} ${cohort?.delivery_organization || 'Elbert Innovative Solutions'}. All rights reserved.`;

  return (
    <footer className="w-full mt-12" style={{ backgroundColor: brand.primary_color }}>
      <div className="max-w-7xl mx-auto px-6 py-6 text-center">
        <p className="text-xs" style={{ color: brand.accent_color }}>{text}</p>
        <p className="text-white/40 text-xs mt-1">Proprietary content protected by intellectual property law.</p>
      </div>
    </footer>
  );
}