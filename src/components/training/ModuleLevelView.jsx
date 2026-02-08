import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, BookOpen } from 'lucide-react';

export default function ModuleLevelView({ module, userLevel }) {
  const canAccessLevel = (moduleLevel) => {
    if (!userLevel) return false;
    const levels = ['level-1', 'level-2', 'level-3'];
    const userIndex = levels.indexOf(userLevel);
    const moduleIndex = levels.indexOf(moduleLevel);
    return moduleIndex <= userIndex;
  };

  const getLevelBadgeColor = (level) => {
    switch(level) {
      case 'level-1': return 'bg-blue-100 text-blue-800';
      case 'level-2': return 'bg-purple-100 text-purple-800';
      case 'level-3': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{module.title}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">{module.description}</p>
          </div>
          <Badge className={getLevelBadgeColor(module.level)}>
            {module.level.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Learning Focus */}
        <div>
          <h4 className="font-semibold text-sm text-[#143A50] mb-2">Learning Focus</h4>
          <p className="text-sm text-slate-700">{module.learningFocus}</p>
        </div>

        {/* Allowed Actions */}
        <div>
          <h4 className="font-semibold text-sm text-[#143A50] mb-2">What You Can Do</h4>
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            {canAccessLevel(module.level) ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Lock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-slate-700">{module.allowedAction}</p>
          </div>
        </div>

        {/* Authority Boundaries */}
        {module.authorityBoundaries && (
          <div>
            <h4 className="font-semibold text-sm text-[#143A50] mb-2">Authority & Risk Boundaries</h4>
            <div className="space-y-2">
              {module.authorityBoundaries.canDo && (
                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                  <span className="text-xs font-semibold text-blue-700">CAN DO:</span>
                  <span className="text-xs text-slate-700">{module.authorityBoundaries.canDo}</span>
                </div>
              )}
              {module.authorityBoundaries.mustEscalate && (
                <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                  <span className="text-xs font-semibold text-amber-700">MUST ESCALATE:</span>
                  <span className="text-xs text-slate-700">{module.authorityBoundaries.mustEscalate}</span>
                </div>
              )}
              {module.authorityBoundaries.cannotDo && (
                <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                  <span className="text-xs font-semibold text-red-700">CANNOT DO:</span>
                  <span className="text-xs text-slate-700">{module.authorityBoundaries.cannotDo}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Context Application */}
        {module.contextApplication && (
          <div>
            <h4 className="font-semibold text-sm text-[#143A50] mb-2">Apply This to:</h4>
            <div className="flex flex-wrap gap-2">
              {module.contextApplication.map((context, idx) => (
                <Badge key={idx} variant="outline">{context}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Required Outputs */}
        {module.requiredOutputs && module.requiredOutputs.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-[#143A50] mb-2">Required Outputs</h4>
            <ul className="space-y-1">
              {module.requiredOutputs.map((output, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <BookOpen className="w-4 h-4 text-[#143A50] flex-shrink-0 mt-0.5" />
                  <span>{output}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mastery Threshold */}
        {module.masteryThreshold && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-sm text-purple-900 mb-1">Mastery Threshold</h4>
            <p className="text-sm text-purple-800">{module.masteryThreshold}</p>
          </div>
        )}

        {/* Common Mistakes at This Level */}
        {module.commonMistakes && module.commonMistakes.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-[#143A50] mb-2">Common Mistakes at This Level</h4>
            <ul className="space-y-1">
              {module.commonMistakes.map((mistake, idx) => (
                <li key={idx} className="text-sm text-red-600">• {mistake}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}