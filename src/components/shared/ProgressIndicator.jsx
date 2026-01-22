import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

export default function ProgressIndicator({ 
  steps = [], 
  currentStep = 0,
  showLabels = true,
  variant = 'default' // 'default' | 'compact'
}) {
  const completedCount = steps.filter(s => s.completed).length;
  const percentage = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">Progress</span>
          <span className="text-slate-900 font-semibold">{Math.round(percentage)}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-slate-500">
          {completedCount} of {steps.length} completed
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-900">Your Progress</h3>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          {Math.round(percentage)}% Complete
        </Badge>
      </div>

      <Progress value={percentage} className="h-2" />

      {showLabels && (
        <div className="space-y-2">
          {steps.map((step, index) => {
            const isCompleted = step.completed;
            const isCurrent = index === currentStep;
            const isLocked = step.locked;

            return (
              <motion.div
                key={step.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isCurrent ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {isLocked ? (
                    <Lock className="w-5 h-5 text-slate-400" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    isCompleted ? 'text-emerald-900' : 'text-slate-700'
                  }`}>
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                  )}
                </div>
                {isLocked && (
                  <Badge variant="outline" className="text-xs">Locked</Badge>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">
          <strong>Self-Led Progress:</strong> Complete items at your own pace. 
          Support is available when you need it—not required to advance.
        </p>
      </div>
    </div>
  );
}