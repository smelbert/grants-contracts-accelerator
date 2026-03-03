import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Link2, FileText, Loader2, CheckCircle2,
  XCircle, AlertCircle, TrendingUp, ChevronDown, ChevronUp, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

const SCORE_COLOR = (score) => {
  if (score >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
};

const ScoreRing = ({ score }) => {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${2 * Math.PI * 40}`}
          strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{score}</span>
        <span className="text-xs text-slate-500">/ 100</span>
      </div>
    </div>
  );
};

export default function GrantFitEvaluator({ userOrgProfile, onBack }) {
  const [inputMode, setInputMode] = useState('url'); // 'url' | 'paste'
  const [url, setUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const orgContext = userOrgProfile
    ? `Organization: ${userOrgProfile.organization_name || 'Unknown'}, Type: ${userOrgProfile.organization_type || 'Unknown'}, Mission: ${userOrgProfile.mission_statement || 'Not provided'}, Programs: ${userOrgProfile.programs_offered || 'Not provided'}, Annual Budget: ${userOrgProfile.annual_budget || 'Not provided'}, Target Population: ${userOrgProfile.target_population || 'Not provided'}`
    : 'No organization profile available. Provide general guidance.';

  const evaluate = async () => {
    const content = inputMode === 'url' ? `URL: ${url}` : pastedText;
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a grant strategy expert helping a nonprofit or small business decide whether to apply for a funding opportunity.

Organization context:
${orgContext}

Funding opportunity ${inputMode === 'url' ? `URL: ${url}` : `text:\n${pastedText}`}

Analyze the fit between this organization and this opportunity. Be direct, honest, and practical.`,
        add_context_from_internet: inputMode === 'url',
        response_json_schema: {
          type: 'object',
          properties: {
            opportunity_name: { type: 'string', description: 'Name/title of the funding opportunity' },
            funder_name: { type: 'string' },
            opportunity_type: { type: 'string', description: 'e.g. Grant, RFP, Contract' },
            deadline: { type: 'string', description: 'Application deadline if found' },
            amount_range: { type: 'string', description: 'Funding amount range if available' },
            fit_score: { type: 'number', description: 'Overall fit score 0-100' },
            recommendation: { type: 'string', enum: ['Apply', 'Consider', 'Skip'], description: 'Apply = strong fit, Consider = worth exploring, Skip = poor fit' },
            recommendation_reason: { type: 'string', description: 'One concise sentence explaining the recommendation' },
            strengths: { type: 'array', items: { type: 'string' }, description: 'Top 3-4 reasons this is a good fit' },
            gaps: { type: 'array', items: { type: 'string' }, description: 'Top 2-3 gaps or concerns' },
            key_requirements: { type: 'array', items: { type: 'string' }, description: 'Key eligibility requirements extracted from the opportunity' },
            next_steps: { type: 'array', items: { type: 'string' }, description: '3-4 concrete next steps if they decide to apply' },
            effort_estimate: { type: 'string', description: 'Estimated effort to apply: Low, Medium, or High' },
          }
        }
      });
      setResult(res);
    } catch (err) {
      toast.error('Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const recColors = {
    Apply: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    Consider: 'bg-amber-50 text-amber-800 border-amber-300',
    Skip: 'bg-red-50 text-red-800 border-red-300',
  };
  const recIcons = {
    Apply: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    Consider: <AlertCircle className="w-5 h-5 text-amber-600" />,
    Skip: <XCircle className="w-5 h-5 text-red-600" />,
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2 text-slate-600 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back to Document Review
        </Button>
      )}

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#AC1A5B] to-[#A65D40] flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Should I Apply? — Grant Fit Evaluator</h2>
          <p className="text-sm text-slate-500">Paste a grant URL or text and AI will tell you if it's worth applying</p>
        </div>
      </div>

      {/* Input */}
      {!result && (
        <Card className="border-2 border-[#E5C089]">
          <CardContent className="pt-5 space-y-4">
            {/* Mode toggle */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button onClick={() => setInputMode('url')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === 'url' ? 'bg-white shadow text-[#143A50]' : 'text-slate-500 hover:text-slate-700'}`}>
                <Link2 className="w-4 h-4" /> Paste a URL
              </button>
              <button onClick={() => setInputMode('paste')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === 'paste' ? 'bg-white shadow text-[#143A50]' : 'text-slate-500 hover:text-slate-700'}`}>
                <FileText className="w-4 h-4" /> Paste Text
              </button>
            </div>

            {inputMode === 'url' ? (
              <div>
                <Label>Grant / RFP / Opportunity URL</Label>
                <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.grantexample.com/apply" className="mt-1.5" onKeyDown={e => e.key === 'Enter' && evaluate()} />
              </div>
            ) : (
              <div>
                <Label>Paste opportunity text</Label>
                <Textarea value={pastedText} onChange={e => setPastedText(e.target.value)} placeholder="Paste the grant announcement, email, or RFP details here..." rows={8} className="mt-1.5 text-sm" />
              </div>
            )}

            <Button onClick={evaluate} disabled={loading || (inputMode === 'url' ? !url.trim() : !pastedText.trim())} className="w-full bg-[#143A50] hover:bg-[#1E4F58] h-12 text-base">
              {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Analyzing fit...</> : <><Sparkles className="w-5 h-5 mr-2" />Evaluate My Fit</>}
            </Button>

            {loading && (
              <p className="text-center text-sm text-slate-500 animate-pulse">
                {inputMode === 'url' ? 'Reading the opportunity page...' : 'Analyzing your fit...'} This takes a few seconds.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Reset */}
          <Button variant="outline" size="sm" onClick={() => { setResult(null); setUrl(''); setPastedText(''); }}>
            ← Evaluate Another
          </Button>

          {/* Header card */}
          <Card className={`border-2 ${recColors[result.recommendation] || 'border-slate-200'}`}>
            <CardContent className="pt-5">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreRing score={result.fit_score} />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{result.opportunity_name}</h3>
                  {result.funder_name && <p className="text-sm text-slate-500 mb-3">{result.funder_name}</p>}
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-3">
                    {result.opportunity_type && <Badge variant="outline" className="text-xs">{result.opportunity_type}</Badge>}
                    {result.deadline && <Badge variant="outline" className="text-xs">Due: {result.deadline}</Badge>}
                    {result.amount_range && <Badge variant="outline" className="text-xs">{result.amount_range}</Badge>}
                    {result.effort_estimate && <Badge variant="outline" className={`text-xs ${result.effort_estimate === 'High' ? 'border-red-300 text-red-700' : result.effort_estimate === 'Medium' ? 'border-amber-300 text-amber-700' : 'border-green-300 text-green-700'}`}>Effort: {result.effort_estimate}</Badge>}
                  </div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold text-base ${recColors[result.recommendation]}`}>
                    {recIcons[result.recommendation]}
                    Recommendation: {result.recommendation}
                  </div>
                  {result.recommendation_reason && <p className="text-sm text-slate-600 mt-2">{result.recommendation_reason}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Gaps */}
          <div className="grid sm:grid-cols-2 gap-4">
            {result.strengths?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Why It's a Good Fit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {result.gaps?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Gaps / Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.gaps.map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-red-400 mt-0.5 shrink-0">!</span> {g}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Next steps */}
          {result.next_steps?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-[#143A50] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> If You Decide to Apply — Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {result.next_steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-[#143A50] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Key requirements collapsible */}
          {result.key_requirements?.length > 0 && (
            <Card>
              <button className="w-full px-5 py-3 flex items-center justify-between text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setShowDetails(!showDetails)}>
                <span>Key Eligibility Requirements</span>
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showDetails && (
                <CardContent className="pt-0">
                  <ul className="space-y-1.5">
                    {result.key_requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-slate-400 mt-0.5 shrink-0">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}