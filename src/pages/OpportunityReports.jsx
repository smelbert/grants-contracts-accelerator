import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Flag, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function OpportunityReports() {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [vettingInProgress, setVettingInProgress] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['opportunity-reports'],
    queryFn: () => base44.entities.OpportunityReport.list('-created_date')
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => base44.entities.FundingOpportunity.list()
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ reportId, status, notes }) => {
      return await base44.entities.OpportunityReport.update(reportId, {
        status,
        reviewed_by: user.email,
        review_notes: notes,
        reviewed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity-reports'] });
      toast.success('Report reviewed');
      setSelectedReport(null);
      setReviewNotes('');
    }
  });

  const vetOpportunityMutation = useMutation({
    mutationFn: async (opportunityId) => {
      setVettingInProgress(true);
      const response = await base44.functions.invoke('vetOpportunity', {
        opportunity_id: opportunityId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('AI vetting completed');
      setVettingInProgress(false);
    },
    onError: () => {
      toast.error('Vetting failed');
      setVettingInProgress(false);
    }
  });

  const bulkVetMutation = useMutation({
    mutationFn: async () => {
      setVettingInProgress(true);
      const response = await base44.functions.invoke('bulkVetOpportunities', {
        limit: 20,
        only_unvetted: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success(`Vetted ${data.successful} opportunities`);
      setVettingInProgress(false);
    },
    onError: () => {
      toast.error('Bulk vetting failed');
      setVettingInProgress(false);
    }
  });

  const pendingReports = reports.filter(r => r.status === 'pending');
  const reviewedReports = reports.filter(r => r.status !== 'pending');

  const getOpportunity = (reportId) => {
    const report = reports.find(r => r.id === reportId);
    return opportunities.find(o => o.id === report?.opportunity_id);
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    under_review: 'bg-blue-100 text-blue-800',
    verified_legitimate: 'bg-green-100 text-green-800',
    removed: 'bg-red-100 text-red-800',
    false_report: 'bg-slate-100 text-slate-800'
  };

  const reasonLabels = {
    suspicious_funder: 'Suspicious Funder',
    unrealistic_amounts: 'Unrealistic Amounts',
    fake_contact_info: 'Fake Contact Info',
    scam_indicators: 'Scam Indicators',
    duplicate_listing: 'Duplicate Listing',
    outdated_info: 'Outdated Info',
    other: 'Other'
  };

  const unvettedOpportunities = opportunities.filter(o => !o.ai_vetted);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Opportunity Reports & Vetting</h1>
            <p className="text-slate-600">Review user reports and manage AI vetting</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => bulkVetMutation.mutate()}
              disabled={vettingInProgress || unvettedOpportunities.length === 0}
              className="bg-[#143A50] hover:bg-[#1E4F58]"
            >
              {vettingInProgress ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vetting...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Bulk Vet ({unvettedOpportunities.length})
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              <Clock className="w-4 h-4 mr-2" />
              Pending ({pendingReports.length})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Reviewed ({reviewedReports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingReports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Flag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500">No pending reports</p>
                </CardContent>
              </Card>
            ) : (
              pendingReports.map((report) => {
                const opportunity = getOpportunity(report.id);
                return (
                  <Card key={report.id} className="border-2 border-amber-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={statusColors[report.status]}>
                              {report.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {reasonLabels[report.report_reason]}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">{opportunity?.title || 'Opportunity'}</CardTitle>
                          <p className="text-sm text-slate-600">Reported by {report.reported_by_email}</p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(report.created_date), 'MMM d, yyyy • h:mm a')}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {report.description && (
                        <div className="p-3 bg-amber-50 rounded-lg">
                          <p className="text-sm text-slate-700">{report.description}</p>
                        </div>
                      )}

                      {opportunity && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-2">Opportunity Details:</p>
                          <p className="text-sm mb-1"><strong>Funder:</strong> {opportunity.funder_name || 'N/A'}</p>
                          <p className="text-sm mb-1"><strong>Type:</strong> {opportunity.type}</p>
                          <p className="text-sm mb-1"><strong>Amount:</strong> ${opportunity.amount_min?.toLocaleString()} - ${opportunity.amount_max?.toLocaleString()}</p>
                          {opportunity.application_url && (
                            <a 
                              href={opportunity.application_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2"
                            >
                              View Website <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium mb-2 block">Review Notes</label>
                        <Textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          rows={3}
                          placeholder="Add your review notes..."
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {opportunity && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => vetOpportunityMutation.mutate(opportunity.id)}
                            disabled={vettingInProgress}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Run AI Vetting
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => reviewMutation.mutate({
                            reportId: report.id,
                            status: 'verified_legitimate',
                            notes: reviewNotes
                          })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Legitimate
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => reviewMutation.mutate({
                            reportId: report.id,
                            status: 'removed',
                            notes: reviewNotes
                          })}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Remove Listing
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reviewMutation.mutate({
                            reportId: report.id,
                            status: 'false_report',
                            notes: reviewNotes
                          })}
                        >
                          False Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-4">
            {reviewedReports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500">No reviewed reports yet</p>
                </CardContent>
              </Card>
            ) : (
              reviewedReports.map((report) => {
                const opportunity = getOpportunity(report.id);
                return (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={statusColors[report.status]}>
                              {report.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {reasonLabels[report.report_reason]}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg mb-2">{opportunity?.title || 'Opportunity'}</CardTitle>
                          <p className="text-xs text-slate-500">
                            Reviewed by {report.reviewed_by} • {format(new Date(report.reviewed_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {report.review_notes && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-700">{report.review_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}