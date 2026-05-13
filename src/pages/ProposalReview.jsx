import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload, FileText, Sparkles, Loader2, AlertTriangle, CheckCircle2,
  MessageSquare, TrendingUp, ChevronDown, ChevronUp, RefreshCw, X, Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const SCORE_COLORS = {
  high: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  medium: 'text-amber-700 bg-amber-50 border-amber-200',
  low: 'text-red-700 bg-red-50 border-red-200',
};

function ScoreBar({ label, score }) {
  const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-700 font-medium">{label}</span>
        <span className={`font-bold ${score >= 75 ? 'text-emerald-700' : score >= 50 ? 'text-amber-700' : 'text-red-600'}`}>{score}/100</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function QuestionCard({ question, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-full bg-[#143A50] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{index + 1}</span>
          <span className="font-medium text-slate-900">{question.question}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {expanded && (
        <div className="border-t border-slate-100 bg-[#143A50]/5 p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Why they ask this</p>
            <p className="text-sm text-slate-700">{question.why}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#143A50] uppercase tracking-wide mb-1">How to answer well</p>
            <p className="text-sm text-slate-700">{question.tip}</p>
          </div>
          {question.difficulty && (
            <Badge className={
              question.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
              question.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            }>
              {question.difficulty} difficulty
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProposalReview() {
  const [proposalText, setProposalText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('feedback');
  const fileRef = useRef();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'text/plain') {
      const text = await file.text();
      setProposalText(text);
      setFileName(file.name);
      toast.success('File loaded successfully');
    } else if (file.type === 'application/pdf' || file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      // Upload and extract via AI
      setFileName(file.name);
      toast.info('Extracting text from document...');
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url,
          json_schema: {
            type: 'object',
            properties: { text: { type: 'string', description: 'Full text content of the document' } }
          }
        });
        if (extracted.status === 'success') {
          setProposalText(extracted.output?.text || '');
          toast.success('Document extracted!');
        } else {
          toast.error('Could not extract text. Please paste the text manually.');
        }
      } catch {
        toast.error('Upload failed. Please paste the text directly.');
      }
    } else {
      toast.error('Supported formats: PDF, DOCX, TXT');
    }
  };

  const analyze = async () => {
    if (!proposalText.trim() || proposalText.trim().length < 100) {
      toast.error('Please provide a proposal with at least 100 characters.');
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    try {
      const data = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `You are an expert grant reviewer and funder interview coach with 20+ years of experience reviewing nonprofit and small business proposals.

Analyze the following grant/funding proposal and return a JSON response with this exact structure:

1. scores: object with keys: clarity (0-100), impact (0-100), feasibility (0-100), budget_alignment (0-100), funder_fit (0-100)
2. overall_score: number 0-100 (weighted average)
3. summary: 2-3 sentence executive summary of the proposal's strengths and weaknesses
4. strengths: array of 3-5 objects with { point: string, detail: string }
5. improvements: array of 4-6 objects with { area: string, issue: string, suggestion: string, priority: "high"|"medium"|"low" }
6. funder_questions: array of 8-10 objects with { question: string, why: string, tip: string, difficulty: "easy"|"medium"|"hard" }
7. red_flags: array of 0-4 strings (critical issues funders may reject on)
8. quick_wins: array of 3-5 strings (fast fixes that would improve the proposal immediately)

PROPOSAL:
${proposalText}`,
        response_json_schema: {
          type: 'object',
          properties: {
            scores: { type: 'object' },
            overall_score: { type: 'number' },
            summary: { type: 'string' },
            strengths: { type: 'array', items: { type: 'object' } },
            improvements: { type: 'array', items: { type: 'object' } },
            funder_questions: { type: 'array', items: { type: 'object' } },
            red_flags: { type: 'array', items: { type: 'string' } },
            quick_wins: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      setResult(data);
      setActiveTab('feedback');
    } catch (err) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const overallColor = result
    ? result.overall_score >= 75 ? 'text-emerald-700' : result.overall_score >= 50 ? 'text-amber-600' : 'text-red-600'
    : '';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Proposal Review & Mock Interview</h1>
            <p className="text-slate-500 text-sm mt-1">Upload your draft proposal for AI-powered feedback and funder interview prep</p>
          </div>
          <Badge className="bg-[#143A50]/10 text-[#143A50] border-[#143A50]/20 gap-1.5 px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5" /> AI Powered
          </Badge>
        </div>

        {/* Input Area */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-800">Your Proposal</p>
              {fileName && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <FileText className="w-4 h-4" />
                  <span>{fileName}</span>
                  <button onClick={() => { setFileName(''); setProposalText(''); }}>
                    <X className="w-4 h-4 hover:text-red-500" />
                  </button>
                </div>
              )}
            </div>

            <Textarea
              placeholder="Paste your grant proposal, project narrative, or funding application here... (minimum 100 characters)"
              value={proposalText}
              onChange={e => setProposalText(e.target.value)}
              rows={10}
              className="font-mono text-sm resize-none"
            />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                <Button variant="outline" size="sm" className="gap-2" onClick={() => fileRef.current.click()}>
                  <Upload className="w-4 h-4" /> Upload Document
                </Button>
                <span className="text-xs text-slate-400">PDF, DOCX, or TXT</span>
              </div>
              <div className="flex items-center gap-3">
                {proposalText && (
                  <span className="text-xs text-slate-400">{proposalText.length.toLocaleString()} characters</span>
                )}
                <Button
                  className="bg-[#143A50] hover:bg-[#1E4F58] gap-2 px-6"
                  onClick={analyze}
                  disabled={isAnalyzing || proposalText.trim().length < 100}
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Analyze Proposal</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isAnalyzing && (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#143A50]/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-[#143A50] animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Reviewing your proposal...</p>
                <p className="text-sm text-slate-500 mt-1">This takes about 15–30 seconds</p>
              </div>
              <div className="flex justify-center gap-6 text-xs text-slate-400 mt-4">
                {['Scoring clarity & impact', 'Identifying gaps', 'Generating funder questions'].map(s => (
                  <span key={s} className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> {s}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && !isAnalyzing && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm md:col-span-1 flex flex-col items-center justify-center py-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Overall Score</p>
                <p className={`text-6xl font-bold ${overallColor}`}>{result.overall_score}</p>
                <p className="text-slate-400 text-sm mt-1">out of 100</p>
                <Badge className={`mt-3 ${
                  result.overall_score >= 75 ? 'bg-emerald-100 text-emerald-800' :
                  result.overall_score >= 50 ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {result.overall_score >= 75 ? 'Strong Proposal' : result.overall_score >= 50 ? 'Needs Refinement' : 'Needs Significant Work'}
                </Badge>
              </Card>

              <Card className="border-0 shadow-sm md:col-span-2">
                <CardContent className="p-5 space-y-3">
                  <p className="font-semibold text-slate-800 mb-1">Score Breakdown</p>
                  {Object.entries(result.scores || {}).map(([key, val]) => (
                    <ScoreBar key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} score={val} />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <Card className="border-0 shadow-sm border-l-4 border-l-[#143A50]">
              <CardContent className="p-5">
                <p className="font-semibold text-slate-800 mb-2">AI Summary</p>
                <p className="text-slate-700 leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>

            {/* Red Flags */}
            {result.red_flags?.length > 0 && (
              <Card className="border-0 shadow-sm border-l-4 border-l-red-500 bg-red-50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="font-semibold text-red-800">Red Flags — Address Before Submitting</p>
                  </div>
                  <ul className="space-y-2">
                    {result.red_flags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Quick Wins */}
            {result.quick_wins?.length > 0 && (
              <Card className="border-0 shadow-sm bg-amber-50 border-l-4 border-l-amber-400">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    <p className="font-semibold text-amber-800">Quick Wins — Easy Improvements</p>
                  </div>
                  <ul className="space-y-2">
                    {result.quick_wins.map((win, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        {win}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Detailed Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="feedback" className="gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Detailed Feedback
                </TabsTrigger>
                <TabsTrigger value="strengths" className="gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Strengths
                </TabsTrigger>
                <TabsTrigger value="interview" className="gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Mock Interview ({result.funder_questions?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* Improvements */}
              <TabsContent value="feedback" className="space-y-3">
                {(result.improvements || []).map((item, i) => (
                  <Card key={i} className="border-0 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-slate-900">{item.area}</p>
                        <Badge className={
                          item.priority === 'high' ? SCORE_COLORS.low :
                          item.priority === 'medium' ? SCORE_COLORS.medium :
                          SCORE_COLORS.high
                        }>
                          {item.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{item.issue}</p>
                      <div className="bg-[#143A50]/5 rounded-lg p-3 border border-[#143A50]/10">
                        <p className="text-xs font-semibold text-[#143A50] uppercase tracking-wide mb-1">Suggested Improvement</p>
                        <p className="text-sm text-slate-700">{item.suggestion}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Strengths */}
              <TabsContent value="strengths" className="space-y-3">
                {(result.strengths || []).map((item, i) => (
                  <Card key={i} className="border-0 shadow-sm bg-emerald-50 border-l-4 border-l-emerald-500">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-emerald-900">{item.point}</p>
                          <p className="text-sm text-emerald-800 mt-1">{item.detail}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Mock Interview Questions */}
              <TabsContent value="interview" className="space-y-3">
                <div className="p-4 bg-[#143A50]/5 rounded-xl border border-[#143A50]/10 mb-2">
                  <p className="text-sm text-[#143A50] font-medium">
                    These are likely questions a funder would ask during an interview or site visit. Click each to see tips on how to answer.
                  </p>
                </div>
                {(result.funder_questions || []).map((q, i) => (
                  <QuestionCard key={i} question={q} index={i} />
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end pb-6">
              <Button variant="outline" className="gap-2" onClick={() => { setResult(null); setProposalText(''); setFileName(''); }}>
                <RefreshCw className="w-4 h-4" /> Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}