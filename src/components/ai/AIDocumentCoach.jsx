import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Sparkles, Upload, FileText, CheckCircle, AlertTriangle, 
  Lightbulb, Target, TrendingUp, Send, Loader2, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const DOCUMENT_TYPES = [
  { value: 'grant_proposal', label: 'Grant Proposal' },
  { value: 'business_plan', label: 'Business Plan' },
  { value: 'case_statement', label: 'Case for Support' },
  { value: 'budget_narrative', label: 'Budget Narrative' },
  { value: 'logic_model', label: 'Logic Model' },
  { value: 'cover_letter', label: 'Cover Letter' },
  { value: 'program_description', label: 'Program Description' }
];

export default function AIDocumentCoach({ documentId, existingText, onClose }) {
  const [documentType, setDocumentType] = useState('grant_proposal');
  const [documentText, setDocumentText] = useState(existingText || '');
  const [funderInfo, setFunderInfo] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organization } = useQuery({
    queryKey: ['organization', user?.email],
    queryFn: async () => {
      const orgs = await base44.entities.Organization.filter({ 
        created_by: user.email 
      });
      return orgs[0];
    },
    enabled: !!user?.email,
  });

  const { data: readinessAssessment } = useQuery({
    queryKey: ['readiness-assessment', user?.email],
    queryFn: async () => {
      const assessments = await base44.entities.FundingReadinessAssessment.filter({
        user_email: user.email
      });
      return assessments.sort((a, b) => 
        new Date(b.assessment_date) - new Date(a.assessment_date)
      )[0];
    },
    enabled: !!user?.email,
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const context = {
        organization_name: organization?.organization_name || 'Your organization',
        mission: organization?.mission_statement || '',
        funding_lane: organization?.funding_lane || 'general',
        stage: organization?.organization_stage || '',
        readiness_level: readinessAssessment?.readiness_level || '',
        document_type: documentType,
        funder_info: funderInfo
      };

      const prompt = `You are an expert grant writing coach and consultant. Analyze this ${documentType.replace('_', ' ')} and provide comprehensive feedback.

ORGANIZATION CONTEXT:
- Name: ${context.organization_name}
- Mission: ${context.mission}
- Funding Lane: ${context.funding_lane}
- Stage: ${context.stage}
- Readiness: ${context.readiness_level}
${funderInfo ? `\nTARGET FUNDER INFO:\n${funderInfo}\n` : ''}

DOCUMENT TO REVIEW:
${documentText}

Provide feedback in the following JSON format:
{
  "overall_score": <number 1-100>,
  "strengths": [<list of 3-5 specific strengths>],
  "areas_for_improvement": [
    {
      "category": "<clarity|completeness|tone|alignment|structure>",
      "issue": "<specific issue description>",
      "suggestion": "<actionable suggestion>",
      "priority": "<high|medium|low>"
    }
  ],
  "clarity_score": <number 1-100>,
  "completeness_score": <number 1-100>,
  "tone_score": <number 1-100>,
  "alignment_score": <number 1-100>,
  "key_recommendations": [<3-5 most important action items>],
  "positive_highlights": [<2-3 sentences that are particularly well-written>],
  "red_flags": [<any critical issues that must be addressed>]
}

Be specific, actionable, and encouraging. Focus on helping them improve while acknowledging what's working well.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            areas_for_improvement: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  issue: { type: "string" },
                  suggestion: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            clarity_score: { type: "number" },
            completeness_score: { type: "number" },
            tone_score: { type: "number" },
            alignment_score: { type: "number" },
            key_recommendations: { type: "array", items: { type: "string" } },
            positive_highlights: { type: "array", items: { type: "string" } },
            red_flags: { type: "array", items: { type: "string" } }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setFeedback(data);
      toast.success('Analysis complete!');
    },
    onError: () => {
      toast.error('Failed to analyze document. Please try again.');
    }
  });

  const handleAnalyze = () => {
    if (!documentText.trim()) {
      toast.error('Please enter document text to analyze');
      return;
    }
    setAnalyzing(true);
    analyzeMutation.mutate();
    setTimeout(() => setAnalyzing(false), 1000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {!feedback ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#143A50] to-[#1E4F58] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#E5C089]" />
              </div>
              <div>
                <CardTitle className="text-2xl">AI Document Coach</CardTitle>
                <CardDescription>
                  Get personalized feedback on your grant proposals and documents
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Document Type
              </label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Target Funder Information (Optional)
              </label>
              <Textarea
                placeholder="Provide details about the funder, their priorities, typical grant size, etc."
                value={funderInfo}
                onChange={(e) => setFunderInfo(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Paste Your Document Text
              </label>
              <Textarea
                placeholder="Paste your grant proposal, business plan, or document text here..."
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                {documentText.length} characters • {Math.ceil(documentText.split(/\s+/).length)} words
              </p>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!documentText.trim() || analyzing || analyzeMutation.isPending}
              className="w-full bg-[#143A50] hover:bg-[#1E4F58] h-12"
              size="lg"
            >
              {analyzing || analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Your Document...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get AI Feedback
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Score */}
          <Card className="border-2 border-[#E5C089] bg-gradient-to-br from-[#E5C089]/5 to-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Overall Assessment</CardTitle>
                  <CardDescription>Your document scored {feedback.overall_score}/100</CardDescription>
                </div>
                <div className={`text-5xl font-bold ${getScoreColor(feedback.overall_score)}`}>
                  {feedback.overall_score}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Clarity</p>
                  <div className="flex items-center gap-2">
                    <Progress value={feedback.clarity_score} className="flex-1" />
                    <span className={`text-sm font-semibold ${getScoreColor(feedback.clarity_score)}`}>
                      {feedback.clarity_score}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Completeness</p>
                  <div className="flex items-center gap-2">
                    <Progress value={feedback.completeness_score} className="flex-1" />
                    <span className={`text-sm font-semibold ${getScoreColor(feedback.completeness_score)}`}>
                      {feedback.completeness_score}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Tone</p>
                  <div className="flex items-center gap-2">
                    <Progress value={feedback.tone_score} className="flex-1" />
                    <span className={`text-sm font-semibold ${getScoreColor(feedback.tone_score)}`}>
                      {feedback.tone_score}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Alignment</p>
                  <div className="flex items-center gap-2">
                    <Progress value={feedback.alignment_score} className="flex-1" />
                    <span className={`text-sm font-semibold ${getScoreColor(feedback.alignment_score)}`}>
                      {feedback.alignment_score}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Red Flags */}
          {feedback.red_flags && feedback.red_flags.length > 0 && (
            <Card className="border-2 border-red-300 bg-red-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-red-900">Critical Issues</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.red_flags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-red-800">
                      <span className="text-red-600 font-bold">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="improvements" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="improvements">Improvements</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="recommendations">Action Items</TabsTrigger>
              <TabsTrigger value="highlights">Highlights</TabsTrigger>
            </TabsList>

            <TabsContent value="improvements" className="space-y-4">
              {feedback.areas_for_improvement.map((area, idx) => (
                <Card key={idx} className={`border-l-4 ${
                  area.priority === 'high' ? 'border-l-red-500' :
                  area.priority === 'medium' ? 'border-l-yellow-500' :
                  'border-l-blue-500'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className={
                          area.priority === 'high' ? 'bg-red-100 text-red-800' :
                          area.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {area.priority} priority
                        </Badge>
                        <CardTitle className="text-lg mt-2">{area.category}</CardTitle>
                      </div>
                      <Target className="w-5 h-5 text-slate-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Issue:</p>
                      <p className="text-sm text-slate-600">{area.issue}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-900 mb-1 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Suggestion:
                      </p>
                      <p className="text-sm text-green-800">{area.suggestion}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="strengths" className="space-y-3">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <CheckCircle className="w-5 h-5" />
                    What's Working Well
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feedback.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-green-800">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Key Action Items
                  </CardTitle>
                  <CardDescription>Prioritized next steps to improve your document</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {feedback.key_recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#143A50] text-white text-sm font-semibold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-slate-700 pt-0.5">{rec}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="highlights" className="space-y-3">
              <Card className="border-2 border-[#E5C089] bg-gradient-to-br from-[#E5C089]/5 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#143A50]">
                    <Sparkles className="w-5 h-5" />
                    Exceptional Writing
                  </CardTitle>
                  <CardDescription>These sections are particularly strong</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedback.positive_highlights.map((highlight, idx) => (
                      <div key={idx} className="bg-white border-2 border-[#E5C089] rounded-lg p-4">
                        <p className="text-slate-700 italic">"{highlight}"</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3">
            <Button
              onClick={() => setFeedback(null)}
              variant="outline"
              className="flex-1"
            >
              Analyze Another Document
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]"
            >
              Done
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}