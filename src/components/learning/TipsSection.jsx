import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, AlertTriangle, CheckCircle2, Star } from 'lucide-react';

export default function TipsSection({ tips }) {
  if (!tips || tips.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No tips available for this content yet.</p>
        </CardContent>
      </Card>
    );
  }

  const categoryConfig = {
    best_practice: {
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-900',
      label: 'Best Practice'
    },
    common_mistake: {
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
      label: 'Common Mistake'
    },
    pro_tip: {
      icon: Star,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-900',
      label: 'Pro Tip'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-900',
      label: 'Warning'
    }
  };

  return (
    <div className="space-y-4">
      {tips.map((tip, idx) => {
        const config = categoryConfig[tip.category] || categoryConfig.pro_tip;
        const Icon = config.icon;

        return (
          <Alert key={idx} className={`${config.bgColor} ${config.borderColor} border-2`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
            <AlertDescription className="ml-2">
              <div className={`text-xs font-semibold uppercase ${config.textColor} mb-1`}>
                {config.label}
              </div>
              <div className="font-medium text-slate-900 mb-1">{tip.title}</div>
              <div className="text-sm text-slate-700">{tip.content}</div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}