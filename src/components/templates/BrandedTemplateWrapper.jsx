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
        <style>{`
          .eis-template-body table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 14px;
          }
          .eis-template-body table th {
            padding: 10px 12px;
            border: 1px solid #ccc;
            text-align: left;
            font-weight: 600;
          }
          .eis-template-body table td {
            padding: 9px 12px;
            border: 1px solid #ccc;
            vertical-align: top;
          }
          .eis-template-body h1 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 8px;
            line-height: 1.3;
          }
          .eis-template-body h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-top: 28px;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 2px solid #E5C089;
          }
          .eis-template-body h3 {
            font-size: 1rem;
            font-weight: 600;
            margin-top: 20px;
            margin-bottom: 8px;
            color: #1E4F58;
          }
          .eis-template-body p {
            margin-bottom: 10px;
            line-height: 1.7;
          }
          .eis-template-body ul, .eis-template-body ol {
            margin: 8px 0 12px 24px;
            line-height: 1.7;
          }
          .eis-template-body li {
            margin-bottom: 4px;
          }
          .eis-template-body hr {
            border: none;
            border-top: 2px solid #E5C089;
            margin: 24px 0;
          }
        `}</style>
        <div className="eis-template-body">
          {children}
        </div>
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
              ©{new Date().getFullYear()} Elbert Innovative Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}