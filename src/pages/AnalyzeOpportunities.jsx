import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link2, FileText, CheckCircle2, AlertCircle, Loader2, DollarSign, Calendar, Building2, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TYPE_LABELS = {
  grant: 'Grant', contract: 'Contract', rfp: 'RFP', rfq: 'RFQ',
  rfi: 'RFI', donor_program: 'Donor Program', public_fund: 'Public Fund'
};

function ExtractedOpportunityCard({ opp, onApprove, onReject }) {
  const laneColors = {
    grants: 'bg-emerald-50 border-emerald-200',
    contracts: 'bg-blue-50 border-blue-200',
    donors: 'bg-purple-50 border-purple-200',
    public_funds: 'bg-amber-50 border-amber-200'
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${laneColors[opp.funding_lane] || 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900">{opp.title}</h3>
          {opp.funder_name && <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Building2 className="w-3 h-3" /> {opp.funder_name}</p>}
        </div>
        <Badge variant="outline">{TYPE_LABELS[opp.type] || opp.type}</Badge>
      </div>

      {opp.description && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{opp.description}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {(opp.amount_min || opp.amount_max) && (
          <div className="bg-white/60 rounded p-2">
            <p className="text-xs text-slate-500">Amount</p>
            <p className="font-semibold text-sm flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {opp.amount_min || opp.amount_max ? `${opp.amount_min ? '$' + (opp.amount_min / 1000).toFixed(0) + 'K' : ''}${opp.amount_min && opp.amount_max ? '–' : ''}${opp.amount_max ? '$' + (opp.amount_max / 1000).toFixed(0) + 'K' : ''}` : 'TBD'}
            </p>
          </div>
        )}
        {(opp.deadline || opp.deadline_full) && (
          <div className="bg-white/60 rounded p-2">
            <p className="text-xs text-slate-500">Deadline</p>
            <p className="font-semibold text-sm flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(opp.deadline || opp.deadline_full), 'MMM d')}
            </p>
          </div>
        )}
      </div>

      {opp.eligibility_summary && (
        <div className="mb-3 p-2 bg-white/60 rounded text-sm">
          <p className="font-medium text-slate-700 mb-1">Eligibility:</p>
          <p className="text-slate-600 text-xs line-clamp-2">{opp.eligibility_summary}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onApprove(opp)} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
          <CheckCircle2 className="w-4 h-4 mr-1" /> Approve & Save
        </Button>
        <Button size="sm" variant="outline" onClick={() => onReject(opp.id)} className="flex-1">
          <X className="w-4 h-4 mr-1" /> Skip
        </Button>
      </div>
    </div>
  );
}

export default function AnalyzeOpportunitiesPage() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewQueue, setReviewQueue] = useState([]);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const approveMutation = useMutation({
    mutationFn: async (opp) => {
      return await base44.entities.FundingOpportunity.create({
        title: opp.title,
        funder_name: opp.funder_name,
        type: opp.type,
        funding_lane: opp.funding_lane,
        description: opp.description,
        eligibility_summary: opp.eligibility_summary,
        eligibility_requirements: opp.eligibility_requirements,
        amount_min: opp.amount_min,
        amount_max: opp.amount_max,
        deadline: opp.deadline || opp.deadline_full,
        rolling_deadline: opp.rolling_deadline,
        geographic_focus: opp.geographic_focus,
        sector_focus: opp.sector_focus,
        required_org_types: opp.required_org_types,
        required_stages: opp.required_stages,
        status: 'active',
        source_url: opp.source_url,
        application_url: opp.application_url
      });
    },
    onSuccess: () => {
      toast.success('Opportunity saved!');
      setReviewQueue(prev => prev.slice(1));
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
    onError: (err) => toast.error('Failed to save: ' + err.message)
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsAnalyzing(true);
    try {
      const fileUrls = [];
      for (const file of files) {
        const uploaded = await base44.integrations.Core.UploadFile({ file });
        fileUrls.push(uploaded.file_url);
      }
      await analyzeContent(fileUrls, null, null);
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUrlAnalysis = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    setIsAnalyzing(true);
    try {
      await analyzeContent(null, urlInput, null);
      setUrlInput('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) {
      toast.error('Please paste some text');
      return;
    }
    setIsAnalyzing(true);
    try {
      await analyzeContent(null, null, textInput);
      setTextInput('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeContent = async (fileUrls, url, text) => {
    try {
      const response = await base44.functions.invoke('analyzeOpportunity', {
        file_urls: fileUrls,
        source_url: url,
        text_content: text,
        user_email: user?.email
      });
      const opportunities = response.data?.opportunities || [];
      if (opportunities.length) {
        setReviewQueue(opportunities);
        setActiveTab('review');
        toast.success(`Found ${opportunities.length} opportunity(ies) to review`);
      } else {
        toast.error('No opportunities found in the content');
      }
    } catch (err) {
      toast.error('Analysis failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-[#143A50] flex items-center justify-center">
              <Upload className="w-7 h-7 text-[#E5C089]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#143A50]">Analyze Opportunities</h1>
              <p className="text-slate-600">Upload grants, RFPs, contracts & more for AI-powered analysis</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
            {reviewQueue.length > 0 && (
              <TabsTrigger value="review" className="relative">
                Review ({reviewQueue.length})
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">{reviewQueue.length}</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Upload Documents</CardTitle>
                <CardDescription>PDF, PNG, JPG/JPEG. Multiple files at once.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-[#143A50] transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    disabled={isAnalyzing}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-12 h-12 text-[#143A50] mx-auto mb-3 animate-spin" />
                      <p className="font-semibold">Analyzing files...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="font-semibold text-slate-900">Drag & drop files here</p>
                      <p className="text-sm text-slate-500">or click to browse</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* URL Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Link2 className="w-5 h-5" /> Enter URL</CardTitle>
                <CardDescription>Paste a link to an RFP, grant page, or proposal document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="https://example.com/rfp"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isAnalyzing}
                />
                <Button onClick={handleUrlAnalysis} disabled={isAnalyzing} className="w-full bg-[#143A50] hover:bg-[#1E4F58]">
                  {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Link2 className="w-4 h-4 mr-2" />}
                  Fetch & Analyze
                </Button>
              </CardContent>
            </Card>

            {/* Text Input */}
            <Card>
              <CardHeader>
                <CardTitle>Paste Text Content</CardTitle>
                <CardDescription>Paste the full text of a grant, RFP, or proposal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Paste the opportunity text here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={isAnalyzing}
                  rows={8}
                />
                <Button onClick={handleTextAnalysis} disabled={isAnalyzing} className="w-full bg-[#143A50] hover:bg-[#1E4F58]">
                  {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Analyze Text
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            {reviewQueue.length === 0 ? (
              <Card>
                <CardContent className="pt-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <p className="font-semibold text-slate-900">All done!</p>
                  <p className="text-sm text-slate-500">You've reviewed all opportunities from this batch.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>{reviewQueue.length}</strong> {reviewQueue.length === 1 ? 'opportunity' : 'opportunities'} to review. Approve to save to your opportunities list.
                  </p>
                </div>
                {reviewQueue.map((opp, idx) => (
                  <ExtractedOpportunityCard
                    key={idx}
                    opp={opp}
                    onApprove={() => approveMutation.mutate(opp)}
                    onReject={(id) => setReviewQueue(prev => prev.filter((_, i) => i !== idx))}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}