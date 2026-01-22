import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

const GUARDRAIL_MODES = {
  ethical: {
    icon: Shield,
    title: 'Ethical AI Mode',
    description: 'This tool only uses your verified organizational data. It will flag missing information rather than fabricate content.',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    iconColor: 'text-emerald-600'
  },
  review: {
    icon: AlertTriangle,
    title: 'Review Required',
    description: 'AI-generated content must be reviewed and approved before use in applications. Never submit without verification.',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-600'
  },
  verified: {
    icon: CheckCircle2,
    title: 'Data Verified',
    description: 'This content is based on your organization\'s verified profile data and approved narratives.',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600'
  }
};

export default function AIGuardrailsNotice({ mode = 'ethical', customMessage, showWarnings = [] }) {
  const config = GUARDRAIL_MODES[mode];
  const Icon = config.icon;

  return (
    <div className="space-y-3">
      <Alert className={`${config.bgColor} ${config.borderColor}`}>
        <Icon className={`w-4 h-4 ${config.iconColor}`} />
        <AlertDescription className={config.textColor}>
          <strong>{config.title}:</strong> {customMessage || config.description}
        </AlertDescription>
      </Alert>

      {showWarnings.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-700 text-sm">
            <strong>Missing Data:</strong>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              {showWarnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}