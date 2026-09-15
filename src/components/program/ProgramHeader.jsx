import React from 'react';

const DEFAULT_BRAND = {
  primary_color: '#143A50',
  secondary_color: '#1E4F58',
  accent_color: '#E5C089',
  logo_url: null,
  header_title: '',
  header_subtitle: '',
};

export default function ProgramHeader({ cohort, title, subtitle }) {
  const brand = { ...DEFAULT_BRAND, ...(cohort?.brand_config || {}) };
  const displayTitle = title || brand.header_title || cohort?.program_name || 'Program';
  const displaySubtitle = subtitle || brand.header_subtitle || cohort?.description || '';

  return (
    <header className="w-full" style={{ backgroundColor: brand.primary_color }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-center gap-4 mb-3">
          {brand.logo_url && (
            <img
              src={brand.logo_url}
              alt={cohort?.program_name || 'Program'}
              className="h-12 w-auto object-contain flex-shrink-0"
            />
          )}
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: brand.accent_color }}>
              {cohort?.funder_organization || 'Funding Readiness Program'}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{displayTitle}</h1>
          </div>
        </div>
        {displaySubtitle && (
          <p className="text-white/80 text-sm md:text-base max-w-3xl leading-relaxed">{displaySubtitle}</p>
        )}
      </div>
    </header>
  );
}