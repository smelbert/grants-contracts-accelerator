import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Sparkles, 
  Link as LinkIcon, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ExternalLink,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function OpportunityScannerAdmin() {
  const [scanQuery, setScanQuery] = useState('');
  const [fundingType, setFundingType] = useState('all');
  const [quickAddUrl, setQuickAddUrl] = useState('');
  const [quickAddText, setQuickAddText] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();

  const { data: pendingOpportunities = [], isLoading } = useQuery({
    queryKey: ['pending-opportunities'],
    queryFn: async () => {
      const opps = await base44.entities.FundingOpportunity.filter({
        status: 'pending_approval'
      });
      return opps.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('scanOpportunities', {
        query: scanQuery,
        funding_type: fundingType,
        max_results: 10
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Found ${data.created} new opportunities`);
      queryClient.invalidateQueries(['pending-opportunities']);
      setScanQuery('');
    },
    onError: (error) => {
      toast.error('Scan failed: ' + error.message);
    }
  });

  const quickAddMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('quickAddOpportunity', {
        url: quickAddUrl || null,
        input_text: quickAddText || null
      });
      return response.data;
    },
    onSuccess: (result) => {
      setExtractedData(result.data);
      setShowPreview(true);
      toast.success('Opportunity data extracted');
    },
    onError: (error) => {
      toast.error('Extraction failed: ' + error.message);
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (opportunityId) => {
      await base44.entities.FundingOpportunity.update(opportunityId, {
        status: 'active'
      });
    },
    onSuccess: () => {
      toast.success('Opportunity approved');
      queryClient.invalidateQueries(['pending-opportunities']);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (opportunityId) => {
      await base44.entities.FundingOpportunity.delete(opportunityId);
    },
    onSuccess: () => {
      toast.success('Opportunity rejected');
      queryClient.invalidateQueries(['pending-opportunities']);
    }
  });

  const createFromExtractedMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.FundingOpportunity.create({
        ...data,
        status: 'active'
      });
    },
    onSuccess: () => {
      toast.success('Opportunity created');
      setExtractedData(null);
      setShowPreview(false);
      setQuickAddUrl('');
      setQuickAddText('');
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#143A50] mb-2">Opportunity Scanner</h1>
          <p className="text-slate-600">AI-powered opportunity discovery and quick add</p>
        </div>

        <Tabs defaultValue="scan" className="space-y-6">
          <TabsList>
            <TabsTrigger value="scan">Web Scanner</TabsTrigger>
            <TabsTrigger value="quick-add">Quick Add</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Approval
              {pendingOpportunities.length > 0 && (
                <Badge className="ml-2 bg-amber-500">{pendingOpportunities.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Web Scanner */}
          <TabsContent value="scan">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Web Scanner
                </CardTitle>
                <CardDescription>
                  Search the web for current funding opportunities using AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="e.g., education grants, nonprofit technology, healthcare funding"
                      value={scanQuery}
                      onChange={(e) => setScanQuery(e.target.value)}
                    />
                  </div>
                  <Select value={fundingType} onValueChange={setFundingType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="grant">Grants Only</SelectItem>
                      <SelectItem value="rfp">RFPs Only</SelectItem>
                      <SelectItem value="contract">Contracts Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => scanMutation.mutate()}
                  disabled={scanMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {scanMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning the web...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Scan for Opportunities
                    </>
                  )}
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  The AI will search the web for current opportunities and save them as pending for your review.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Add */}
          <TabsContent value="quick-add">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-blue-600" />
                    Add from URL
                  </CardTitle>
                  <CardDescription>
                    Paste a URL and AI will extract the opportunity details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="https://grants.gov/opportunity/..."
                    value={quickAddUrl}
                    onChange={(e) => setQuickAddUrl(e.target.value)}
                  />
                  <Button
                    onClick={() => quickAddMutation.mutate()}
                    disabled={!quickAddUrl || quickAddMutation.isPending}
                    className="w-full"
                  >
                    {quickAddMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Extract from URL
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Add from Text
                  </CardTitle>
                  <CardDescription>
                    Paste opportunity text and AI will parse the details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Paste opportunity announcement, email, or description..."
                    value={quickAddText}
                    onChange={(e) => setQuickAddText(e.target.value)}
                    rows={4}
                  />
                  <Button
                    onClick={() => quickAddMutation.mutate()}
                    disabled={!quickAddText || quickAddMutation.isPending}
                    className="w-full"
                  >
                    {quickAddMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Extract from Text
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pending Approval */}
          <TabsContent value="pending">
            <div className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-500">Loading opportunities...</p>
                  </CardContent>
                </Card>
              ) : pendingOpportunities.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Search className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500 mb-2">No pending opportunities</p>
                    <p className="text-sm text-slate-400">
                      Use the scanner or quick add to find opportunities
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pendingOpportunities.map((opp) => (
                  <Card key={opp.id} className="border-l-4 border-amber-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{opp.title}</CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">{opp.funder_name}</Badge>
                            <Badge className="bg-purple-100 text-purple-800">
                              {opp.opportunity_type}
                            </Badge>
                            {opp.ai_scanned && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI Scanned
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveMutation.mutate(opp.id)}
                            disabled={approveMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectMutation.mutate(opp.id)}
                            disabled={rejectMutation.isPending}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-slate-600">{opp.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {opp.award_amount_max > 0 && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-slate-400" />
                              <span>
                                ${opp.award_amount_min?.toLocaleString()} - ${opp.award_amount_max?.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {opp.deadline && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>{opp.deadline}</span>
                            </div>
                          )}
                        </div>

                        {opp.application_url && (
                          <a
                            href={opp.application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            View Source
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Extracted Data</DialogTitle>
            </DialogHeader>
            {extractedData && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={extractedData.title || ''}
                    onChange={(e) => setExtractedData({...extractedData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Funder</label>
                  <Input
                    value={extractedData.funder_name || ''}
                    onChange={(e) => setExtractedData({...extractedData, funder_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={extractedData.opportunity_type || 'grant'}
                    onValueChange={(val) => setExtractedData({...extractedData, opportunity_type: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grant">Grant</SelectItem>
                      <SelectItem value="rfp">RFP</SelectItem>
                      <SelectItem value="rfi">RFI</SelectItem>
                      <SelectItem value="rfq">RFQ</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Min Amount</label>
                    <Input
                      type="number"
                      value={extractedData.award_amount_min || 0}
                      onChange={(e) => setExtractedData({...extractedData, award_amount_min: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Amount</label>
                    <Input
                      type="number"
                      value={extractedData.award_amount_max || 0}
                      onChange={(e) => setExtractedData({...extractedData, award_amount_max: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Deadline</label>
                  <Input
                    value={extractedData.deadline || ''}
                    onChange={(e) => setExtractedData({...extractedData, deadline: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={extractedData.description || ''}
                    onChange={(e) => setExtractedData({...extractedData, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => createFromExtractedMutation.mutate(extractedData)}
                    disabled={createFromExtractedMutation.isPending}
                    className="flex-1"
                  >
                    Create Opportunity
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}