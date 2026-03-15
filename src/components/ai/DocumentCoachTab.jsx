import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Sparkles, FileText, CheckCircle, AlertTriangle,
  Lightbulb, Target, TrendingUp, Loader2, Upload,
  ChevronRight, MessageSquare, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const DOC_TYPES = [
  { value: 'grant_proposal', label: 'Grant Proposal' },
  { value: 'capability_statement', label: 'Capability Statement' },
  { value: 'program_description', label: 'Program Description' },
  { value: 'budget_narrative', label: 'Budget Narrative' },
  { value: 'logic_model', label: 'Logic Model / Theory of Change' },
  { value: 'case_statement', label: 'Case for Support' },
  { value: 'needs_statement', label: 'Needs Statement' },
  { value: 'org_overview', label: 'Organizational Overview / Bio' },
  { value: 'cover_letter', label: 'Cover Letter' },
  { value: 'letters_of_support', label: 'Letters of Support' },
  { value: 'other', label: 'Other Document' },
];

const COACH_PERSONA = `You are Dr. Shawnte, a veteran grant writing coach and funding strategist with 20+ years of experience. You have personally written and reviewed hundreds of federal grants (NIH, NSF, HUD, USDA, DOL, NEA), state agency contracts, local government RFPs, corporate foundation grants, and private philanthropic proposals. You understand what program officers look for, what kills applications, and how to position organizations for funding success.

Your coaching style is direct, honest, encouraging, and deeply practical. You never give generic advice — everything you say is specific and actionable. You speak plainly and you hold no punches when something needs to be fixed. But you also know how to motivate — you celebrate what's working before driving into what isn't.`;

function ClarifyingQuestionsForm({ questions, answers, onChange, onSubmit, loading }) {
  const allAnswered = questions.every((_, i) => answers[i]?.trim());
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-amber-900 text-sm">A few quick questions before I dig in</p>
          <p className="text-amber-700 text-xs mt-0.5">Your answers help me give you precise, relevant feedback — not generic advice.</p>
        </div>
      </div>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i}>
            <label className="text-sm font-medium text-slate-800 mb-1.5 block">{i + 1}. {q}</label>
            <Textarea
              value={answers[i] || ''}
              onChange={e => onChange(i, e.target.value)}
              placeholder="Your answer..."
              rows={2}
              className="text-sm"
            />
          </div>
        ))}
      </div>
      <Button
        onClick={onSubmit}
        disabled={!allAnswered || loading}
        className="w-full bg-[#143A50] hover:bg-[#1E4F58] h-11"
      >
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Sparkles className="w-4 h-4 mr-2" />Get My Feedback</>}
      </Button>
    </motion.div>
  );
}

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

export default function DocumentCoachTab({ orgProfile, enrollment }) {
  const [docType, setDocType] = useState('grant_proposal');
  const [docText, setDocText] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [funderContext, setFunderContext] = useState('');
  const [stage, setStage] = useState('input'); // input | clarifying | results
  const [clarifyingQs, setClarifyingQs] = useState([]);
  const [clarifyingAs, setClarifyingAs] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const orgName = orgProfile?.organization_name || '';
  const mission = orgProfile?.mission_statement || '';
  const orgType = orgProfile?.organization_type || '';
  const budget = orgProfile?.annual_budget || '';

  const profileSufficient = orgName && mission;

  // Step 1: check if we need clarifying questions
  const handleRequestReview = async () => {
    if (!docText.trim()) { toast.error('Please paste your document text first.'); return; }
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${COACH_PERSONA}

A user wants you to review their ${DOC_TYPES.find(d => d.value === docType)?.label || 'document'}.

What we know about them:
- Organization: ${orgName || 'Unknown'}
- Mission: ${mission || 'Not provided'}
- Org type: ${orgType || 'Not provided'}
- Annual budget: ${budget || 'Not provided'}
- Funder/opportunity context provided: ${funderContext || 'None'}

Document excerpt (first 800 chars): ${docText.slice(0, 800)}

Based on what you see, do you have enough context to give highly specific, actionable feedback? 
If NOT, generate 2-3 clarifying questions that would most improve your review quality.
If YES, return an empty questions array.`,
        response_json_schema: {
          type: 'object',
          properties: {
            has_enough_context: { type: 'boolean' },
            questions: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      if (!res.has_enough_context && res.questions?.length > 0) {
        setClarifyingQs(res.questions);
        setStage('clarifying');
      } else {
        await runFullAnalysis({});
      }
    } catch (e) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const runFullAnalysis = async (answers) => {
    setLoading(true);
    try {
      const clarifyContext = Object.keys(answers).length > 0
        ? '\n\nADDITIONAL CONTEXT FROM USER:\n' + clarifyingQs.map((q, i) => `Q: ${q}\nA: ${answers[i] || ''}`).join('\n')
        : '';

      const res = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `${COACH_PERSONA}

You are doing a full coaching review of a ${DOC_TYPES.find(d => d.value === docType)?.label || 'document'}.

ORGANIZATION CONTEXT:
- Name: ${orgName || 'Unknown'}
- Mission: ${mission || 'Not provided'}  
- Type: ${orgType || 'Not provided'}
- Annual budget: ${budget || 'Not provided'}
${funderContext ? `\nFUNDER / OPPORTUNITY CONTEXT:\n${funderContext}` : ''}
${clarifyContext}

DOCUMENT TO REVIEW:
${docText}

Give this applicant your full expert coaching review. Be specific — quote their own language when pointing to issues or strengths. Think like a funder program officer reading this for the first time.`,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_score: { type: 'number' },
            coach_summary: { type: 'string', description: 'Your honest 3-4 sentence coaching summary — what the applicant most needs to hear' },
            clarity_score: { type: 'number' },
            completeness_score: { type: 'number' },
            persuasiveness_score: { type: 'number' },
            funder_alignment_score: { type: 'number' },
            strengths: { type: 'array', items: { type: 'string' } },
            critical_fixes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  section: { type: 'string' },
                  issue: { type: 'string' },
                  why_it_matters: { type: 'string' },
                  how_to_fix: { type: 'string' },
                  priority: { type: 'string' }
                }
              }
            },
            top_action_items: { type: 'array', items: { type: 'string' } },
            funder_perspective: { type: 'string', description: 'What a program officer would say/think reading this' },
            red_flags: { type: 'array', items: { type: 'string' } },
            standout_lines: { type: 'array', items: { type: 'string' }, description: 'Lines or phrases that are particularly strong — quote them exactly' }
          }
        }
      });

      setFeedback(res);
      setStage('results');
    } catch (e) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStage('input');
    setFeedback(null);
    setClarifyingQs([]);
    setClarifyingAs({});
    setDocText('');
    setFunderContext('');
    setDocTitle('');
  };

  const scoreColor = (s) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ── Input Stage ─────────────────────────────────────── */}
      {stage === 'input' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="p-5 bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E5C089]/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-[#E5C089]" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">AI Document Coach</h2>
                <p className="text-white/80 text-sm leading-relaxed">Paste any grant proposal, business plan, capability statement, needs assessment, or funding document. I'll review it the same way a seasoned grant writer and program officer would — specific, honest, and actionable.</p>
              </div>
            </div>
          </div>

          {!profileSufficient && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Your organization profile is incomplete. <a href="#" className="underline font-medium ml-1">Add your mission & org name</a> for more targeted feedback.
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Document Type</label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Document Title <span className="text-slate-400 font-normal">(optional)</span></label>
              <Input value={docTitle} onChange={e => setDocTitle(e.target.value)} placeholder="e.g. DHHS Capacity Building Proposal 2026" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Funder / Opportunity Context <span className="text-slate-400 font-normal">(optional but recommended)</span>
            </label>
            <Textarea
              value={funderContext}
              onChange={e => setFunderContext(e.target.value)}
              placeholder="Who is the funder? What are their stated priorities? What's the grant/contract for? What's the deadline or award range? Paste anything useful here — even a few sentences helps."
              rows={3}
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Paste Your Document <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={docText}
              onChange={e => setDocText(e.target.value)}
              placeholder="Paste your full document text here. The more complete it is, the more specific the feedback. Partial drafts are fine too — just note it's a draft."
              rows={14}
              className="text-sm font-mono leading-relaxed"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              {docText.split(/\s+/).filter(Boolean).length} words · {docText.length} characters
            </p>
          </div>

          <Button
            onClick={handleRequestReview}
            disabled={!docText.trim() || loading}
            className="w-full bg-[#143A50] hover:bg-[#1E4F58] h-12 text-base"
          >
            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Checking context...</> : <><Sparkles className="w-5 h-5 mr-2" />Get Expert Feedback</>}
          </Button>
        </motion.div>
      )}

      {/* ── Clarifying Stage ─────────────────────────────────── */}
      {stage === 'clarifying' && (
        <div className="space-y-5">
          <Button variant="ghost" size="sm" onClick={() => setStage('input')} className="text-slate-500">← Back to Document</Button>
          <ClarifyingQuestionsForm
            questions={clarifyingQs}
            answers={clarifyingAs}
            onChange={(i, val) => setClarifyingAs(prev => ({ ...prev, [i]: val }))}
            onSubmit={() => runFullAnalysis(clarifyingAs)}
            loading={loading}
          />
        </div>
      )}

      {/* ── Results Stage ─────────────────────────────────────── */}
      {stage === 'results' && feedback && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={reset} className="text-slate-500">← Review Another Document</Button>
            {docTitle && <p className="text-sm text-slate-500 font-medium">{docTitle}</p>}
          </div>

          {/* Score Hero */}
          <Card className="border-2 border-[#E5C089] bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white">
            <CardContent className="pt-6 pb-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Overall Score</p>
                  <p className={`text-6xl font-black ${feedback.overall_score >= 80 ? 'text-green-300' : feedback.overall_score >= 60 ? 'text-amber-300' : 'text-red-300'}`}>
                    {feedback.overall_score}
                  </p>
                  <p className="text-white/60 text-xs mt-1">out of 100</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#E5C089]" />
                </div>
              </div>
              {feedback.coach_summary && (
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <p className="text-xs text-white/60 mb-1 font-medium uppercase tracking-wide">Coach Summary</p>
                  <p className="text-white text-sm leading-relaxed">{feedback.coach_summary}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScoreBar label="Clarity" score={feedback.clarity_score} />
              <ScoreBar label="Completeness" score={feedback.completeness_score} />
              <ScoreBar label="Persuasiveness" score={feedback.persuasiveness_score} />
              <ScoreBar label="Funder Alignment" score={feedback.funder_alignment_score} />
            </CardContent>
          </Card>

          {/* Red flags */}
          {feedback.red_flags?.length > 0 && (
            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-900 flex items-center gap-2 text-base">
                  <AlertTriangle className="w-5 h-5" /> Critical Issues — Fix These First
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {feedback.red_flags.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                      <span className="font-bold text-red-500 mt-0.5">!</span>{f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Critical Fixes */}
          {feedback.critical_fixes?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Detailed Coaching Notes</h3>
              {feedback.critical_fixes.map((fix, i) => (
                <Card key={i} className={`border-l-4 ${fix.priority === 'high' ? 'border-l-red-500' : fix.priority === 'medium' ? 'border-l-amber-400' : 'border-l-blue-400'}`}>
                  <CardContent className="pt-4 pb-4 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={fix.priority === 'high' ? 'bg-red-100 text-red-700' : fix.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} variant="outline">
                        {fix.priority} priority
                      </Badge>
                      <span className="font-semibold text-slate-800 text-sm">{fix.section}</span>
                    </div>
                    <p className="text-sm text-slate-700"><span className="font-medium">Issue: </span>{fix.issue}</p>
                    <p className="text-xs text-slate-500 italic">{fix.why_it_matters}</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-900 flex items-center gap-1.5 mb-1">
                        <Lightbulb className="w-3.5 h-3.5" /> How to fix it
                      </p>
                      <p className="text-sm text-green-800">{fix.how_to_fix}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Two column: Strengths + Top Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            {feedback.strengths?.length > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-900 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> What's Working
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {feedback.top_action_items?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#143A50] text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" /> Top Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {feedback.top_action_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-[#143A50] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Funder perspective */}
          {feedback.funder_perspective && (
            <Card className="border-[#143A50]/20 bg-[#143A50]/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#143A50] text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> What a Program Officer Would Think
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 italic leading-relaxed">"{feedback.funder_perspective}"</p>
              </CardContent>
            </Card>
          )}

          {/* Standout lines */}
          {feedback.standout_lines?.length > 0 && (
            <Card className="border-[#E5C089] bg-[#E5C089]/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#143A50] text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E5C089]" /> Lines Worth Keeping
                </CardTitle>
                <CardDescription className="text-xs">These phrases are particularly strong — protect them in your revisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feedback.standout_lines.map((line, i) => (
                    <div key={i} className="bg-white border border-[#E5C089]/50 rounded-lg p-3">
                      <p className="text-sm text-slate-700 italic">"{line}"</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}