import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, Building2, CheckCircle2, Circle, AlertTriangle, FileText } from 'lucide-react';
import { FUNDING_LANES, DOC_TYPE_LABELS, LEVEL_CONFIG, avgLaneScore, levelFromScore } from '@/lib/cohortReadiness';
import LaneReadinessBadge from './LaneReadinessBadge';

export default function OrgReadinessCard({ row }) {
  const [open, setOpen] = useState(false);
  const avgScore = avgLaneScore(row.lanes);
  const avgLevel = levelFromScore(avgScore);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex flex-col md:flex-row md:items-center gap-4 p-4 text-left hover:bg-slate-50/70 transition-colors"
        >
          <div className="flex items-center gap-3 md:w-64 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[#143A50]/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-[#143A50]" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate">{row.orgName}</p>
              <p className="text-xs text-slate-500 truncate">{row.email}</p>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
            {FUNDING_LANES.map((lane, i) => (
              <div key={lane.id} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500 truncate" style={{ color: lane.color }}>
                  {lane.label}
                </span>
                <LaneReadinessBadge level={row.lanes[i].laneLevel} score={row.lanes[i].laneScore} />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 md:w-32 justify-end flex-shrink-0">
            <div className="text-right">
              <p className="text-xs text-slate-500">Overall</p>
              <LaneReadinessBadge level={avgLevel} score={avgScore} />
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-100 overflow-hidden"
            >
              <div className="p-4 space-y-4 bg-slate-50/50">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-slate-600">Assessment:</span>
                  {row.assessment ? (
                    <>
                      <Badge variant="outline" className="capitalize">
                        {row.assessment.readiness_level?.replace(/_/g, ' ') || '—'}
                      </Badge>
                      <span className="text-slate-700 font-medium">{row.assessment.overall_score ?? 0}/100</span>
                      <span className="text-xs text-slate-400">
                        {row.assessment.assessment_date ? new Date(row.assessment.assessment_date).toLocaleDateString() : ''}
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-600 inline-flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> No readiness assessment on file
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FUNDING_LANES.map((lane, i) => {
                    const lr = row.lanes[i];
                    return (
                      <div key={lane.id} className="bg-white rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm" style={{ color: lane.color }}>{lane.label}</span>
                          <LaneReadinessBadge level={lr.laneLevel} score={lr.laneScore} />
                        </div>
                        <div className="space-y-1">
                          {lane.docTypes.map(t => {
                            const done = lr.completed.includes(t);
                            return (
                              <div key={t} className="flex items-center gap-2 text-xs">
                                {done
                                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                  : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                                <span className={done ? 'text-slate-700' : 'text-slate-400'}>
                                  {DOC_TYPE_LABELS[t] || t}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {lr.missing.length > 0 && (
                          <p className="text-xs text-slate-500 mt-2">
                            <FileText className="w-3 h-3 inline mr-1" />
                            Needs: {lr.missing.map(t => DOC_TYPE_LABELS[t] || t).join(', ')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!row.assessment && (
                  <div className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    Have this organization complete the Funding Readiness Assessment to populate assessment-based scoring across all lanes.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}