import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2, Wand2, Download, ChevronRight, FileText, DollarSign, Search,
  CheckCircle2, AlertCircle, Circle, Sparkles, RefreshCw, Link2, ArrowRight,
  AlertTriangle, BookOpen, Plus, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ── helpers ──────────────────────────────────────────────────────────────────
const LANE_LABELS = { grants: 'Grant', contracts: 'Contract / RFP', donors: 'Donor Campaign', public_funds: 'Public Funding' };
const LANE_COLORS = {
  grants: 'bg-emerald-100 text-emerald-800',
  contracts: 'bg-blue-100 text-blue-800',
  donors: 'bg-purple-100 text-purple-800',
  public_funds: 'bg-amber-100 text-amber-800',
};

function StatusIcon({ status }) {
  if (status === 'ready') return <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
  if (status === 'in_progress') return <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
  return <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />;
}

function DocCheckItem({ doc, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const statusCycle = ['missing', 'in_progress', 'ready'];
  const next = statusCycle[(statusCycle.indexOf(doc.status) + 1) % statusCycle.length];
  return (
    <div className={`rounded-xl border transition-all ${doc.status === 'ready' ? 'border-emerald-200 bg-emerald-50' : doc.status === 'in_progress' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => onToggle(doc.id, next)} title="Click to cycle status">
          <StatusIcon status={doc.status} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-medium ${doc.required ? 'text-slate-900' : 'text-slate-600'}`}>{doc.name}</p>
            {doc.required && <Badge className="bg-red-100 text-red-700 text-xs px-1.5">Required</Badge>}
            {!doc.required && <Badge className="bg-slate-100 text-slate-500 text-xs px-1.5">Optional</Badge>}
          </div>
          {doc.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{doc.description}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge className={doc.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : doc.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}>
            {doc.status?.replace('_', ' ')}
          </Badge>
          {doc.tip && (
            <button onClick={() => setExpanded(v => !v)} className="text-slate-400 hover:text-slate-700">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      {expanded && doc.tip && (
        <div className="px-4 pb-4 pt-0">
          <div className="bg-[#143A50]/5 rounded-lg p-3 border border-[#143A50]/10">
            <p className="text-xs font-semibold text-[#143A50] mb-1">AI Tip</p>
            <p className="text-sm text-slate-700">{doc.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
const STEPS = { LINK: 'link', CHECKLIST: 'checklist', ASSEMBLE: 'assemble', DONE: 'done' };

export default function DocumentAssembly() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(STEPS.LINK);
  const [opportunitySearch, setOpportunitySearch] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [manualOpportunity, setManualOpportunity] = useState({ title: '', type: 'grant', funder: '', description: '', deadline: '', amount: '' });
  const [useManual, setUseManual] = useState(false);
  const [checklist, setChecklist] = useState([]);   // [{ id, name, description, required, status, tip }]
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAssembling, setIsAssembling] = useState(false);
  const [assembleResult, setAssembleResult] = useState(null);
  const [additionalContext, setAdditionalContext] = useState('');

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: organization } = useQuery({
    queryKey: ['org-for-assembly', user?.email],
    queryFn: async () => {
      const orgs = await base44.entities.Organization.filter({ primary_contact_email: user.email });
      return orgs[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: opportunities = [], isLoading: loadingOpps } = useQuery({
    queryKey: ['funding-opportunities-assembly'],
    queryFn: () => base44.entities.FundingOpportunity.filter({ is_active: true }, '-created_date', 50)
  });

  const { data: myDocuments = [] } = useQuery({
    queryKey: ['my-documents', user?.email],
    queryFn: () => base44.entities.Document.filter({ created_by: user.email }, '-created_date', 30),
    enabled: !!user?.email
  });

  const filteredOpps = opportunities.filter(o =>
    !opportunitySearch || o.title?.toLowerCase().includes(opportunitySearch.toLowerCase()) ||
    o.funder_name?.toLowerCase().includes(opportunitySearch.toLowerCase())
  );

  // ── Step 1: Analyze opportunity → generate checklist ──────────────────────
  const analyzeOpportunity = async () => {
    const opp = useManual ? manualOpportunity : selectedOpportunity;
    if (!opp) return;
    setIsAnalyzing(true);
    try {
      const oppSummary = useManual
        ? `Title: ${manualOpportunity.title}\nType: ${manualOpportunity.type}\nFunder: ${manualOpportunity.funder}\nDescription: ${manualOpportunity.description}\nDeadline: ${manualOpportunity.deadline}\nAmount: ${manualOpportunity.amount}`
        : `Title: ${opp.title}\nFunder: ${opp.funder_name}\nType: ${opp.type}\nAmount: $${opp.amount_min || 0}–$${opp.amount_max || 0}\nDeadline: ${opp.deadline || opp.deadline_full || 'Rolling'}\nDescription: ${opp.description || ''}\nEligibility: ${opp.eligibility_summary || ''}`;

      const orgContext = organization
        ? `Org Name: ${organization.organization_name}\nOrg Type: ${organization.organization_type}\nMission: ${organization.mission_statement || 'N/A'}\nAnnual Budget: ${organization.annual_budget || 'N/A'}`
        : 'Organization details not provided';

      const result = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `You are an expert grant writer and proposal manager. Based on the funding opportunity and organization below, generate a comprehensive document checklist — all the documents this organization will need to prepare and submit for this opportunity.

FUNDING OPPORTUNITY:
${oppSummary}

ORGANIZATION:
${orgContext}

Return a JSON object with this structure:
{
  "checklist": [
    {
      "id": "unique_slug",
      "name": "Document Name",
      "description": "Brief description of what this document should contain",
      "required": true,
      "category": "narrative|financial|legal|supporting|attachments",
      "tip": "Specific AI tip for writing/preparing this document for THIS opportunity",
      "status": "missing"
    }
  ],
  "opportunity_summary": "2-sentence summary of what this funder is looking for",
  "key_themes": ["theme1", "theme2", "theme3"],
  "red_flags": ["any eligibility concerns or missing org info that could be a problem"]
}

Be specific to the funding type. For grants: include narrative, budget, budget narrative, org financials, 501c3 letter, board list, etc. For RFPs/contracts: include technical approach, past performance, staffing plan, pricing, certifications, etc. For RFQs: include qualifications, rates, references. Order by importance.`,
        response_json_schema: {
          type: 'object',
          properties: {
            checklist: { type: 'array', items: { type: 'object' } },
            opportunity_summary: { type: 'string' },
            key_themes: { type: 'array', items: { type: 'string' } },
            red_flags: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setChecklist((result.checklist || []).map(item => ({ ...item, status: item.status || 'missing' })));
      setSelectedOpportunity(prev => ({ ...prev, _summary: result.opportunity_summary, _themes: result.key_themes, _flags: result.red_flags }));
      if (useManual) setSelectedOpportunity({ ...manualOpportunity, id: 'manual', title: manualOpportunity.title, _summary: result.opportunity_summary, _themes: result.key_themes, _flags: result.red_flags });
      setStep(STEPS.CHECKLIST);
      toast.success('Document checklist generated!');
    } catch (err) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleDocStatus = (id, newStatus) => {
    setChecklist(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  // ── Step 3: Assemble documents ─────────────────────────────────────────────
  const assembleDocuments = async () => {
    setIsAssembling(true);
    try {
      const readyDocs = checklist.filter(d => d.status === 'ready').map(d => d.name);
      const missingRequired = checklist.filter(d => d.required && d.status === 'missing').map(d => d.name);

      const opp = selectedOpportunity;
      const result = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `You are a senior grant writer assembling a complete proposal package for submission.

FUNDING OPPORTUNITY: ${opp?.title || opp?.name || 'N/A'}
FUNDER: ${opp?.funder_name || opp?.funder || 'N/A'}
ORGANIZATION: ${organization?.organization_name || 'N/A'}
MISSION: ${organization?.mission_statement || 'N/A'}
PROGRAMS: ${organization?.programs_offered || 'N/A'}

DOCUMENT CHECKLIST (ready: ${readyDocs.join(', ') || 'none'})
MISSING REQUIRED: ${missingRequired.join(', ') || 'none'}

ADDITIONAL CONTEXT FROM USER:
${additionalContext || 'None provided'}

Generate a professional, submission-ready proposal package. Include:
1. A cover letter addressed to the funder
2. An executive summary
3. A project narrative with sections for: Need Statement, Goals & Objectives, Program Design/Methodology, Evaluation Plan, Organizational Capacity, Sustainability
4. A budget narrative overview
5. A checklist cover page listing all submitted documents

Make the content specific, compelling, and tailored to this funder's priorities. Use the organization details throughout.`,
      });

      // Save to Documents entity
      const saved = await base44.entities.Document.create({
        doc_name: `${opp?.title || 'Proposal'} — Document Package`,
        doc_type: 'proposal',
        content: result,
        status: 'draft',
        ai_assisted: true
      });

      setAssembleResult({ content: result, document_id: saved.id });
      setStep(STEPS.DONE);
      toast.success('Proposal package assembled and saved!');
    } catch (err) {
      toast.error('Assembly failed: ' + err.message);
    } finally {
      setIsAssembling(false);
    }
  };

  const reset = () => {
    setStep(STEPS.LINK); setSelectedOpportunity(null); setUseManual(false);
    setManualOpportunity({ title: '', type: 'grant', funder: '', description: '', deadline: '', amount: '' });
    setChecklist([]); setAssembleResult(null); setAdditionalContext('');
    setOpportunitySearch('');
  };

  const readyCount = checklist.filter(d => d.status === 'ready').length;
  const requiredMissing = checklist.filter(d => d.required && d.status === 'missing').length;
  const byCategory = checklist.reduce((acc, d) => { acc[d.category] = acc[d.category] || []; acc[d.category].push(d); return acc; }, {});

  const stepList = [STEPS.LINK, STEPS.CHECKLIST, STEPS.ASSEMBLE, STEPS.DONE];
  const stepLabels = { [STEPS.LINK]: 'Link Opportunity', [STEPS.CHECKLIST]: 'Document Checklist', [STEPS.ASSEMBLE]: 'Assemble Package', [STEPS.DONE]: 'Complete' };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#143A50] flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-[#E5C089]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Document Assembly</h1>
              <p className="text-slate-500 text-sm">AI-powered document checklist and proposal package builder for grants, RFPs, RFQs & more</p>
            </div>
          </div>
          {step !== STEPS.LINK && (
            <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Start Over
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-1">
          {stepList.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${step === s ? 'bg-[#143A50] text-white' : stepList.indexOf(step) > i ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                {stepList.indexOf(step) > i ? <CheckCircle2 className="w-3 h-3" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{stepLabels[s]}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-0.5 ${stepList.indexOf(step) > i ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: Link Opportunity ── */}
        {step === STEPS.LINK && (
          <div className="space-y-4">
            <Tabs defaultValue={useManual ? 'manual' : 'library'} onValueChange={v => setUseManual(v === 'manual')}>
              <TabsList>
                <TabsTrigger value="library" className="gap-1.5"><Search className="w-4 h-4" />From Opportunity Library</TabsTrigger>
                <TabsTrigger value="manual" className="gap-1.5"><Plus className="w-4 h-4" />Enter Manually</TabsTrigger>
              </TabsList>

              {/* From library */}
              <TabsContent value="library" className="space-y-3 mt-4">
                <Input
                  placeholder="Search opportunities by title or funder..."
                  value={opportunitySearch}
                  onChange={e => setOpportunitySearch(e.target.value)}
                  className="w-full"
                />
                {loadingOpps && <div className="flex items-center gap-2 text-slate-400 text-sm py-4"><Loader2 className="w-4 h-4 animate-spin" /> Loading opportunities...</div>}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {filteredOpps.length === 0 && !loadingOpps && (
                    <div className="text-center py-10 text-slate-400">
                      <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No opportunities found. Try entering one manually.</p>
                    </div>
                  )}
                  {filteredOpps.map(opp => (
                    <div
                      key={opp.id}
                      onClick={() => setSelectedOpportunity(opp)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedOpportunity?.id === opp.id ? 'border-[#143A50] bg-[#143A50]/5' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{opp.title}</p>
                          <p className="text-sm text-slate-500">{opp.funder_name || 'Funder not listed'}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {opp.type && <Badge className={LANE_COLORS[opp.funding_lane] || 'bg-slate-100 text-slate-600'} >{opp.type?.toUpperCase()}</Badge>}
                            {(opp.deadline || opp.deadline_full) && (
                              <span className="text-xs text-slate-500">Due: {format(new Date(opp.deadline || opp.deadline_full), 'MMM d, yyyy')}</span>
                            )}
                            {opp.amount_max && <span className="text-xs text-slate-500">Up to ${opp.amount_max?.toLocaleString()}</span>}
                          </div>
                        </div>
                        {selectedOpportunity?.id === opp.id && <CheckCircle2 className="w-5 h-5 text-[#143A50] flex-shrink-0 mt-1" />}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Manual entry */}
              <TabsContent value="manual" className="mt-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-1 block">Opportunity Title *</label>
                        <Input value={manualOpportunity.title} onChange={e => setManualOpportunity(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Community Health Innovation Grant RFP" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Type</label>
                        <select value={manualOpportunity.type} onChange={e => setManualOpportunity(p => ({ ...p, type: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                          <option value="grant">Grant</option>
                          <option value="rfp">RFP (Request for Proposal)</option>
                          <option value="rfq">RFQ (Request for Qualifications)</option>
                          <option value="rfi">RFI (Request for Information)</option>
                          <option value="contract">Contract Bid</option>
                          <option value="donor_program">Donor / Philanthropy</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Funder / Agency</label>
                        <Input value={manualOpportunity.funder} onChange={e => setManualOpportunity(p => ({ ...p, funder: e.target.value }))} placeholder="e.g., Ohio Department of Health" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Deadline</label>
                        <Input type="date" value={manualOpportunity.deadline} onChange={e => setManualOpportunity(p => ({ ...p, deadline: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Award Amount</label>
                        <Input value={manualOpportunity.amount} onChange={e => setManualOpportunity(p => ({ ...p, amount: e.target.value }))} placeholder="e.g., Up to $250,000" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-1 block">Description / Requirements (paste RFP text or key requirements)</label>
                        <Textarea value={manualOpportunity.description} onChange={e => setManualOpportunity(p => ({ ...p, description: e.target.value }))} placeholder="Paste the opportunity description, scope of work, eligibility criteria, or key requirements here. The more detail, the more accurate the checklist." rows={5} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-2">
              <Button
                className="bg-[#143A50] hover:bg-[#1E4F58] gap-2 px-8"
                disabled={isAnalyzing || (useManual ? !manualOpportunity.title : !selectedOpportunity)}
                onClick={analyzeOpportunity}
              >
                {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Opportunity...</> : <><Sparkles className="w-4 h-4" /> Generate Document Checklist <ChevronRight className="w-4 h-4" /></>}
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Document Checklist ── */}
        {step === STEPS.CHECKLIST && (
          <div className="space-y-5">
            {/* Opportunity Summary Banner */}
            <Card className="border-0 shadow-sm border-l-4 border-l-[#143A50]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Working Towards</p>
                    <h2 className="font-bold text-slate-900 text-lg">{selectedOpportunity?.title || selectedOpportunity?.name || 'Opportunity'}</h2>
                    <p className="text-sm text-slate-500">{selectedOpportunity?.funder_name || selectedOpportunity?.funder || ''}</p>
                    {selectedOpportunity?._summary && <p className="text-sm text-slate-700 mt-2">{selectedOpportunity._summary}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(selectedOpportunity?._themes || []).map(t => (
                      <Badge key={t} className="bg-[#143A50]/10 text-[#143A50]">{t}</Badge>
                    ))}
                  </div>
                </div>
                {(selectedOpportunity?._flags || []).length > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-1.5 mb-1.5 text-amber-700">
                      <AlertTriangle className="w-4 h-4" />
                      <p className="text-xs font-semibold uppercase tracking-wide">Potential Concerns</p>
                    </div>
                    {(selectedOpportunity._flags).map((f, i) => (
                      <p key={i} className="text-sm text-amber-800">• {f}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Documents', value: checklist.length, color: 'text-slate-900' },
                { label: 'Ready', value: readyCount, color: 'text-emerald-700' },
                { label: 'Required Missing', value: requiredMissing, color: requiredMissing > 0 ? 'text-red-600' : 'text-emerald-700' },
              ].map(({ label, value, color }) => (
                <Card key={label} className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-xs text-slate-500">Click the status icon to cycle: Missing → In Progress → Ready</p>

            {/* Checklist by Category */}
            {Object.entries(byCategory).map(([cat, docs]) => (
              <div key={cat}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> {cat?.replace('_', ' ')} ({docs.length})
                </p>
                <div className="space-y-2">
                  {docs.map(doc => <DocCheckItem key={doc.id} doc={doc} onToggle={toggleDocStatus} />)}
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(STEPS.LINK)}>← Back</Button>
              <Button className="bg-[#143A50] hover:bg-[#1E4F58] gap-2" onClick={() => setStep(STEPS.ASSEMBLE)}>
                Continue to Assembly <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Assemble Package ── */}
        {step === STEPS.ASSEMBLE && (
          <div className="space-y-5">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg mb-1">Assemble Your Proposal Package</h2>
                  <p className="text-sm text-slate-500">AI will draft a complete submission package using your organization profile, the checklist, and any additional context you provide.</p>
                </div>

                {/* Readiness recap */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <p className="text-xs text-emerald-600 font-semibold mb-1">Ready Documents</p>
                    {checklist.filter(d => d.status === 'ready').length === 0
                      ? <p className="text-sm text-slate-500">None marked ready yet</p>
                      : checklist.filter(d => d.status === 'ready').map(d => (
                        <p key={d.id} className="text-sm text-emerald-800 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />{d.name}</p>
                      ))
                    }
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-xs text-red-600 font-semibold mb-1">Required — Still Missing</p>
                    {checklist.filter(d => d.required && d.status === 'missing').length === 0
                      ? <p className="text-sm text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> All required docs accounted for!</p>
                      : checklist.filter(d => d.required && d.status === 'missing').map(d => (
                        <p key={d.id} className="text-sm text-red-800 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{d.name}</p>
                      ))
                    }
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Additional Context (optional)</label>
                  <Textarea
                    value={additionalContext}
                    onChange={e => setAdditionalContext(e.target.value)}
                    placeholder="Any extra details: specific program data, outcomes from past projects, unique qualifications, budget notes, or specific funder priorities to emphasize..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(STEPS.CHECKLIST)}>← Back to Checklist</Button>
                  <Button
                    className="flex-1 bg-[#143A50] hover:bg-[#1E4F58] gap-2"
                    onClick={assembleDocuments}
                    disabled={isAssembling}
                  >
                    {isAssembling
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Assembling Package...</>
                      : <><Wand2 className="w-4 h-4" /> Assemble Proposal Package</>
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── STEP 4: Done ── */}
        {step === STEPS.DONE && assembleResult && (
          <div className="space-y-5">
            <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">Proposal Package Assembled!</h2>
                    <p className="text-sm text-slate-500">Saved to your Document Library</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-5">Your AI-drafted proposal package for <strong>{selectedOpportunity?.title}</strong> is ready. Review, edit, and finalize before submitting.</p>
                <div className="flex gap-3 flex-wrap">
                  <Button className="bg-[#143A50] hover:bg-[#1E4F58] gap-2" onClick={() => window.location.href = '/Documents'}>
                    <ExternalLink className="w-4 h-4" /> Open in Document Library
                  </Button>
                  <Button variant="outline" onClick={reset} className="gap-1.5">
                    <RefreshCw className="w-4 h-4" /> Build Another Package
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Package Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-xl p-5 max-h-[500px] overflow-y-auto">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{assembleResult.content}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}