import React from 'react';
import { Download, RotateCcw, Lock, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STRUCTURES, DR_E_SIGNATURE, PROOF_STRIP, CONSULTATION_CARD, LEVEL_NAMES } from '@/lib/assessmentConfig';
import { downloadAssessmentPdf } from '@/lib/assessmentPdf';
import ScoreCard from './ScoreCard';
import ActionPlan from './ActionPlan';
import CalendlyEmbed from './CalendlyEmbed';

export default function ResultsView({ results, onRetake }) {
  const [downloading, setDownloading] = React.useState(false);
  const { trackResults, holds, actionPlan, openItems, recommendedDocs, bestBand, nextSteps, drEMessage } = results;
  const structureLabel = STRUCTURES[results.structure] || results.structure || 'N/A';
  const trackKeys = Object.keys(trackResults);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAssessmentPdf({ ...results, structureLabel });
    } catch (err) {
      console.error('PDF download failed:', err);
    }
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F4EF]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Dr. E opening message */}
        <div className="mb-8">
          <div className="w-12 h-0.5 bg-[#E5C089] mb-4" />
          <p className="text-lg text-slate-700 italic font-serif leading-relaxed">{drEMessage}</p>
          <p className="text-sm text-[#143A50] mt-3 font-medium">{DR_E_SIGNATURE}</p>
        </div>

        {/* Eligibility holds */}
        {holds && holds.length > 0 && (
          <div className="mb-8 bg-[#E5C089]/20 border border-[#E5C089]/40 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-[#7E5F22]" />
              <h3 className="font-semibold text-[#7E5F22]">Eligibility Holds</h3>
            </div>
            <div className="space-y-2">
              {holds.map((hold, i) => (
                <p key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-[#AC1A5B] mt-0.5">•</span>
                  {hold.text}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Score cards */}
        {trackKeys.map((tk, idx) => (
          <React.Fragment key={tk}>
            <div className="mb-6">
              <ScoreCard trackKey={tk} trackResult={trackResults[tk]} />
            </div>

            {/* Proof strip after first score card */}
            {idx === 0 && (
              <div className="mb-8 bg-[#143A50] rounded-xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {PROOF_STRIP.map((stat, i) => (
                  <div key={i}>
                    <p className="text-xl font-bold text-[#E5C089]">{stat.stat}</p>
                    <p className="text-xs text-white/80 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}

        {/* Band CTA */}
        <div className="mb-8 bg-[#143A50]/5 border border-[#143A50]/10 rounded-xl p-5">
          <h4 className="font-semibold text-[#143A50] mb-2">Recommended Next Step</h4>
          <p className="text-sm text-slate-700">{bestBand?.cta}</p>
          <Button className="mt-3 bg-[#143A50] hover:bg-[#1E4F58] text-white" size="sm">
            View our services <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Action plan */}
        <div className="mb-8">
          <h3 className="text-xl font-serif text-[#143A50] mb-4">Your Action Plan</h3>
          <ActionPlan actionPlan={actionPlan} />
        </div>

        {/* What to work on per track */}
        {trackKeys.map(tk => {
          const trackOpen = openItems.filter(i => i.track === tk);
          if (trackOpen.length === 0) return null;
          const trackLabel = tk === 'grant' ? 'Grant Funding' : 'Proposals & Contracts';
          return (
            <div key={tk} className="mb-8 bg-white rounded-2xl border border-[#E5C089]/30 p-6">
              <h4 className="font-serif text-[#143A50] mb-1">What to work on — {trackLabel}</h4>
              <p className="text-xs text-slate-500 mb-4">A gap can be closed while you pursue opportunities; a hold should be resolved before you submit.</p>
              {[1, 2, 3].map(level => {
                const levelItems = trackOpen.filter(i => i.level === level);
                if (levelItems.length === 0) return null;
                return (
                  <div key={level} className="mb-4">
                    <p className="text-sm font-semibold text-[#143A50] mb-2">Level {level} · {LEVEL_NAMES[tk]?.[level]}</p>
                    <div className="space-y-1.5">
                      {levelItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-slate-400 mt-1">•</span>
                          <span className="text-sm text-slate-700">{item.text}</span>
                          {item.is_gate && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#E5C089]/20 text-[#7E5F22]"><Lock className="w-2.5 h-2.5" /> gate</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Recommended documents */}
        <div className="mb-8 bg-white rounded-2xl border border-[#E5C089]/30 p-6">
          <h4 className="font-serif text-[#143A50] mb-1">For your structure</h4>
          <p className="text-xs text-slate-500 mb-4">Recommended documents for a {structureLabel}.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recommendedDocs.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#143A50] flex-shrink-0" />
                {doc}
              </div>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div className="mb-8 bg-white rounded-2xl border border-[#E5C089]/30 p-6">
          <h4 className="font-serif text-[#143A50] mb-4">Your prioritized next steps</h4>
          <div className="space-y-3">
            {nextSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#143A50] text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <p className="text-sm text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Consultation card */}
        <div className="mb-8 bg-[#143A50] rounded-2xl p-6">
          <h4 className="font-serif text-[#E5C089] mb-1">{CONSULTATION_CARD.title}</h4>
          <p className="text-sm text-white/80 mb-4">{CONSULTATION_CARD.body}</p>
          <CalendlyEmbed />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleDownload} disabled={downloading} className="bg-[#143A50] hover:bg-[#1E4F58] text-white">
            <Download className="w-4 h-4 mr-2" />
            {downloading ? 'Generating PDF…' : 'Download Branded Report (PDF)'}
          </Button>
          <Button onClick={onRetake} variant="outline" className="border-[#143A50] text-[#143A50] hover:bg-[#143A50]/5">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}