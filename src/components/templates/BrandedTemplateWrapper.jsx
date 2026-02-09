import React from 'react';

const EIS_COLORS = {
  darkTeal: '#143A50',
  magenta: '#AC1A5B',
  gold: '#E5C089',
  copper: '#A65D40',
  teal: '#1E4F58',
  tan: '#B5A698',
  white: '#FFFFFF'
};

export default function BrandedTemplateWrapper({ children }) {
  return (
    <div className="bg-white w-full">
      {/* Branded Header */}
      <div 
        className="px-8 py-6 border-b-4 flex items-center justify-between"
        style={{ 
          backgroundColor: EIS_COLORS.white,
          borderBottomColor: EIS_COLORS.gold
        }}
      >
        <div className="flex items-center gap-6">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/45aaceb53_EISLogotransparent.png" 
            alt="Elbert Innovative Solutions" 
            className="h-16 w-auto"
          />
          <div className="border-l-2 pl-6" style={{ borderColor: EIS_COLORS.copper }}>
            <p 
              className="text-sm font-semibold tracking-wide uppercase"
              style={{ color: EIS_COLORS.darkTeal }}
            >
              Excellence in Every Endeavor
            </p>
            <p 
              className="text-xs mt-1"
              style={{ color: EIS_COLORS.tan }}
            >
              Grant & Contract Accelerator
            </p>
          </div>
        </div>
        <div className="text-right">
          <p 
            className="text-xs font-medium"
            style={{ color: EIS_COLORS.teal }}
          >
            Professional Template Library
          </p>
        </div>
      </div>

      {/* Template Content */}
      <div className="px-8 py-8">
        {children}
      </div>

      {/* Branded Footer */}
      <div 
        className="px-8 py-6 border-t-4 mt-8"
        style={{ 
          backgroundColor: EIS_COLORS.darkTeal,
          borderTopColor: EIS_COLORS.gold
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-semibold mb-1">
              Elbert Innovative Solutions
            </p>
            <p 
              className="text-xs"
              style={{ color: EIS_COLORS.gold }}
            >
              Empowering organizations to secure funding and achieve their missions
            </p>
          </div>
          <div className="text-right">
            <p 
              className="text-xs"
              style={{ color: EIS_COLORS.tan }}
            >
              www.elbertinnovative.com
            </p>
            <p 
              className="text-xs mt-1"
              style={{ color: EIS_COLORS.tan }}
            >
              © {new Date().getFullYear()} All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}