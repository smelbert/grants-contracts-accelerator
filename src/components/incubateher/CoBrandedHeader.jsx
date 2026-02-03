import React from 'react';

const BRAND_COLORS = {
  culRed: '#B21F2D',
  eisGold: '#F5A623',
  eisNavy: '#1F3A5F',
  neutralDark: '#1A1A1A',
  neutralLight: '#FFFFFF',
  neutralGray: '#F4F4F4'
};

export default function CoBrandedHeader({ title, subtitle }) {
  return (
    <div className="bg-white border-b-2" style={{ borderBottomColor: BRAND_COLORS.culRed }}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Logos */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/5bda1b14c_image.png"
              alt="Columbus Urban League - IncubateHer"
              className="h-16 object-contain"
            />
          </div>
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png"
              alt="Elbert Innovative Solutions"
              className="h-12 object-contain"
            />
          </div>
        </div>

        {/* Title Section */}
        {title && (
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: BRAND_COLORS.neutralDark }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg" style={{ color: BRAND_COLORS.eisNavy }}>
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { BRAND_COLORS };