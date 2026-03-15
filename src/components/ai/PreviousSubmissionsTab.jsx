import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles, FileText, AlertTriangle, Lightbulb, Target,
  CheckCircle, Loader2, History, TrendingUp, MessageSquare, HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const SUBMISSION_TYPES = [
  { value: 'federal_grant', label: 'Federal Grant (NIH, NSF, HUD, DOL, USDA, etc.)' },
  { value: 'state_grant', label: 'State Grant / State Agency' },
  { value: 'local_grant', label: 'Local / Municipal Grant' },
  { value: 'corporate_grant', label: 'Corporate Foundation Grant' },
  { value: 'private_foundation', label: 'Private Foundation Grant' },
  { value: 'rfp_contract', label: 'RFP / Contract Proposal' },
  { value: 'pitch_deck', label: 'Pitch / Investor Deck' },
  { value: 'loi', label: 'Letter of Intent (LOI)' },
  { value: 'other', label: 'Other Submission' },
];

const OUTCOMES = [
  { value: 'awarded', label: '✅ Awarded / Won' },
  { value: 'declined', label: '❌ Declined / Rejected' },
  { value: 'pending', label: '⏳ Still Pending' },
  { value: 'withdrawn', label: '🔙 Withdrawn' },
  { value: 'unknown', label: '❓ Outcome Unknown' },
];

const COACH_PERSONA = `You are Dr. Shawnte, a veteran grant writing coach and funding strategist with 20+ years of experience. You have personally written and reviewed hundreds of federal grants (NIH, NSF, HUD, USDA, DOL, NEA), state agency contracts, local government RFPs, corporate foundation grants, and private philanthropic proposals. You understand what program officers look for, what kills applications, and how to position organizations for funding success.

Your coaching style is direct, honest, encouraging, and deeply practical. You never give generic advice — everything you say is specific and actionable.`;

function ScoreBar({ label, score }) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className={`font-bold ${color}`}>{score}</span>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  );
}

export default function PreviousSubmissionsTab({ orgProfile }) {
  const [submissionType, setSubmissionType] = useState('federal_grant');
  const [outcome, setOutcome] = useState('declined');
  const [funderName, setFunderName] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [funderFeedback, setFunderFeedback] = useState('');
  const [amountRequested, setAmountRequested] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const orgName = orgProfile?.organization_name || '';
  const mission = orgProfile?.mission_statement || '';

  const analyze = async () => {
    if (!submissionText.trim()) { toast.error('Please paste your previous submission.'); return; }
    setLoading(true);
    try {
      const outcomeLabel = OUTCOMES.find(o => o.value === outcome)?.label || outcome;
      const typeLabel = SUBMISSION_TYPES.find(t => t.value === submissionType)?.label || submissionType;

      const res = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `${COACH_PERSONA}

A nonprofit/business is sharing a PREVIOUS submission they've already made. They want to learn from it — whether they won, lost, or are still waiting.

SUBMISSION DETAILS:
- Type: ${typeLabel}
- Funder: ${funderName || 'Not specified'}
- Amount requested: ${amountRequested || 'Not specified'}
- Outcome: ${outcomeLabel}
- Funder feedback they received: ${funderFeedback || 'None provided'}

ORGANIZATION CONTEXT:
- Name: ${orgName || 'Not provided'}
- Mission: ${mission || 'Not provided'}

THEIR PREVIOUS SUBMISSION:
${submissionText}

Conduct a thorough post-mortem coaching review. Be direct about what likely helped or hurt their chances. 
${outcome === 'awarded' ? 'Since this was AWARDED, focus on what they did right and how to replicate/strengthen it.' : ''}
${outcome === 'declined' ? 'Since this was DECLINED, be honest and specific about what likely cost them the award. Do not sugarcoat.' : ''}
If funder feedback was provided, use it as your anchor point and expand on it.`,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_score: { type: 'number' },
            coach_verdict: { type: 'string', description: '3-4 sentence honest coaching verdict on this submission' },
            likely_why_outcome: { type: 'string', description: 'Your expert opinion on why this was awarded/declined/pending' },
            clarity_score: { type: 'number' },
            completeness_score: { type: 'number' },
            persuasiveness_score: { type: 'number' },
            funder_alignment_score: { type: 'number' },
            what_worked: { type: 'array', items: { type: 'string' }, description: 'Elements that were strong (be specific, quote them if possible)' },
            what_hurt: { type: 'array', items: { type: 'string' }, description: 'Elements that likely hurt the application (be specific and direct)' },
            missed_opportunities: { type: 'array', items: { type: 'string' }, description: 'Things they could have included or done differently' },
            reapplication_strategy: { type: 'array', items: { type: 'string' }, description: 'Specific steps if they want to reapply or submit elsewhere' },
            transferable_elements: { type: 'array', items: { type: 'string' }, description: 'Strong sections/language they should reuse in future submissions' },
            lessons: { type: 'array', items: { type: 'string' }, description: '3-5 key lessons from this submission they should internalize' }
          }
        }
      });
      setFeedback(res);
    } catch (e) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {!feedback ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="p-5 bg-gradient-to-r from-[#1E4F58] to-[#143A50] text-white rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <History className="w-6 h-6 text-[#E5C089]" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Previous Submissions Review</h2>
                <p className="text-white/80 text-sm leading-relaxed">Paste a grant, proposal, pitch, or contract submission you've already made — won or lost. I'll do a full post-mortem coaching review so you can learn from it and do better next time.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Submission Type</label>
              <Select value={submissionType} onValueChange={setSubmissionType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBMISSION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Outcome</label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OUTCOMES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Funder Name <span className="text-slate-400 font-normal">(optional)</span></label>
              <Input value={funderName} onChange={e => setFunderName(e.target.value)} placeholder="e.g. W.K. Kellogg Foundation" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Amount Requested <span className="text-slate-400 font-normal">(optional)</span></label>
              <Input value={amountRequested} onChange={e => setAmountRequested(e.target.value)} placeholder="e.g. $75,000" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Funder's Feedback / Reviewer Notes <span className="text-slate-400 font-normal">(optional — very helpful if you have it)</span>
            </label>
            <Textarea
              value={funderFeedback}
              onChange={e => setFunderFeedback(e.target.value)}
              placeholder="Paste any feedback, reviewer scores, or rejection notes the funder provided. Even a single sentence helps me give you much better coaching."
              rows={3}
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Paste Your Previous Submission <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={submissionText}
              onChange={e => setSubmissionText(e.target.value)}
              placeholder="Paste your full submission — narrative, executive summary, project description, whatever you submitted. The more complete, the better my coaching."
              rows={14}
              className="text-sm font-mono leading-relaxed"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              {submissionText.split(/\s+/).filter(Boolean).length} words · {submissionText.length} characters
            </p>
          </div>

          <Button onClick={analyze} disabled={!submissionText.trim() || loading} className="w-full bg-[#1E4F58] hover:bg-[#143A50] h-12 text-base">
            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Analyzing submission...</> : <><History className="w-5 h-5 mr-2" />Run Post-Mortem Review</>}
          </Button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <Button variant="ghost" size="sm" onClick={() => setFeedback(null)} className="text-slate-500">← Review Another Submission</Button>

          {/* Score Hero */}
          <Card className="border-2 border-[#E5C089] bg-gradient-to-br from-[#1E4F58] to-[#143A50] text-white">
            <CardContent className="pt-6 pb-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Submission Score</p>
                  <p className={`text-6xl font-black ${feedback.overall_score >= 80 ? 'text-green-300' : feedback.overall_score >= 60 ? 'text-amber-300' : 'text-red-300'}`}>
                    {feedback.overall_score}
                  </p>
                  <p className="text-white/60 text-xs mt-1">out of 100</p>
                </div>
                {funderName && <Badge className="bg-white/10 text-white/80 border-white/20">{funderName}</Badge>}
              </div>
              {feedback.coach_verdict && (
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <p className="text-xs text-white/60 mb-1 font-medium uppercase tracking-wide">Coach Verdict</p>
                  <p className="text-white text-sm leading-relaxed">{feedback.coach_verdict}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score breakdown */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Score Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <ScoreBar label="Clarity" score={feedback.clarity_score} />
              <ScoreBar label="Completeness" score={feedback.completeness_score} />
              <ScoreBar label="Persuasiveness" score={feedback.persuasiveness_score} />
              <ScoreBar label="Funder Alignment" score={feedback.funder_alignment_score} />
            </CardContent>
          </Card>

          {/* Why the outcome */}
          {feedback.likely_why_outcome && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-900 text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Why This Likely {outcome === 'awarded' ? 'Won' : outcome === 'declined' ? 'Didn\'t Make It' : 'Has the Outcome It Has'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-800 leading-relaxed">{feedback.likely_why_outcome}</p>
              </CardContent>
            </Card>
          )}

          {/* What worked / what hurt */}
          <div className="grid md:grid-cols-2 gap-4">
            {feedback.what_worked?.length > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-900 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> What Worked
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {feedback.what_worked.map((s, i) => (
                      <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5 shrink-0">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {feedback.what_hurt?.length > 0 && (
              <Card className="bg-red-50 border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-900 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> What Hurt Your Chances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {feedback.what_hurt.map((s, i) => (
                      <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5 shrink-0">!</span>{s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Missed opportunities */}
          {feedback.missed_opportunities?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[#143A50] text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#E5C089]" /> Missed Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.missed_opportunities.map((item, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-[#E5C089] mt-0.5 shrink-0 font-bold">→</span>{item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Transferable elements */}
          {feedback.transferable_elements?.length > 0 && (
            <Card className="border-[#E5C089] bg-[#E5C089]/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#143A50] text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E5C089]" /> Keep These — Use Again
                </CardTitle>
                <CardDescription className="text-xs">Strong elements worth reusing in future submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {feedback.transferable_elements.map((el, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-[#E5C089] mt-0.5 font-bold shrink-0">★</span>{el}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Reapplication strategy + lessons */}
          <div className="grid md:grid-cols-2 gap-4">
            {feedback.reapplication_strategy?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#143A50] text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" /> Reapplication Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {feedback.reapplication_strategy.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-[#143A50] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}
            {feedback.lessons?.length > 0 && (
              <Card className="bg-slate-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-slate-800 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Key Lessons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feedback.lessons.map((lesson, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-slate-400 mt-0.5 shrink-0 font-bold">{i + 1}.</span>{lesson}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}