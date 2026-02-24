import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield } from 'lucide-react';

export default function LegalFooter() {
  const companyName = "Elbert Innovative Solutions";
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 bg-slate-50 rounded-lg p-4">
      <div className="flex items-start gap-3 text-xs text-slate-600">
        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#AC1A5B]" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">
            ©{currentYear} {companyName}. All rights reserved.
          </p>
          <p>
            All materials, methods, frameworks, workbooks, templates, and content provided are proprietary 
            and protected by intellectual property law. These materials are for personal use only and may not 
            be copied, shared, taught, sold, distributed, or repurposed for commercial use without express 
            written consent.
          </p>
          <Link 
            to={createPageUrl('TermsOfService')} 
            className="text-[#AC1A5B] hover:underline inline-block mt-2"
          >
            View Full Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}