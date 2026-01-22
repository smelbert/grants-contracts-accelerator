import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle, Sparkles } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function AIMatchScore({ matchData, compact = false }) {
  if (!matchData) return null;

  const { overall_score, category_scores, recommendation, concerns } = matchData;

  const getScoreColor = (score) => {
    if (score >= 80) return 'emerald';
    if (score >= 60) return 'amber';
    return 'red';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return CheckCircle2;
    if (score >= 60) return AlertCircle;
    return XCircle;
  };

  const color = getScoreColor(overall_score);
  const Icon = getScoreIcon(overall_score);

  if (compact) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-${color}-50 border border-${color}-200 cursor-pointer`}>
            <Icon className={`w-4 h-4 text-${color}-600`} />
            <span className={`text-sm font-medium text-${color}-700`}>
              {overall_score}% Match
            </span>
            <Sparkles className={`w-3 h-3 text-${color}-500`} />
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-900 mb-2">AI Match Analysis</p>
              <p className="text-xs text-slate-600">{recommendation}</p>
            </div>
            <div className="space-y-2">
              {Object.entries(category_scores || {}).map(([category, score]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 capitalize">{category.replace('_', ' ')}</span>
                    <span className="text-xs font-medium text-slate-900">{score}%</span>
                  </div>
                  <Progress value={score} className="h-1.5" />
                </div>
              ))}
            </div>
            {concerns?.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-700 mb-1">Key Concerns:</p>
                <ul className="space-y-1">
                  {concerns.slice(0, 3).map((concern, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Overall Score */}
      <div className={`p-4 rounded-xl bg-${color}-50 border-2 border-${color}-200`}>
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`w-6 h-6 text-${color}-600`} />
          <div>
            <p className="text-sm font-medium text-slate-700">AI Match Score</p>
            <p className={`text-2xl font-bold text-${color}-700`}>{overall_score}%</p>
          </div>
        </div>
        <p className="text-sm text-slate-700">{recommendation}</p>
      </div>

      {/* Category Breakdown */}
      {category_scores && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-900">Detailed Breakdown</p>
          {Object.entries(category_scores).map(([category, score]) => {
            const catColor = getScoreColor(score);
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600 capitalize">{category.replace('_', ' ')}</span>
                  <Badge variant="outline" className={`bg-${catColor}-50 text-${catColor}-700 border-${catColor}-200`}>
                    {score}%
                  </Badge>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            );
          })}
        </div>
      )}

      {/* Concerns */}
      {concerns?.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-medium text-amber-900 mb-2">Areas for Improvement:</p>
          <ul className="space-y-1.5">
            {concerns.map((concern, i) => (
              <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {concern}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}