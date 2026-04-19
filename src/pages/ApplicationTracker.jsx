import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Trophy,
  X as XIcon,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import AIProposalDrafter from '@/components/ai/AIProposalDrafter';

const STATUS_CONFIG = {
  planning: { label: 'Planning', color: 'bg-slate-100 text-slate-700', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: TrendingUp },
  ready_to_submit: { label: 'Ready to Submit', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  submitted: { label: 'Submitted', color: 'bg-purple-100 text-purple-700', icon: CheckCircle2 },
  under_review: { label: 'Under Review', color: 'bg-indigo-100 text-indigo-700', icon: FileText },
  awarded: { label: 'Awarded', color: 'bg-green-100 text-green-700', icon: Trophy },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: XIcon },
  withdrawn: { label: 'Withdrawn', color: 'bg-slate-100 text-slate-700', icon: XIcon },
};

export default function ApplicationTrackerPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['grant-applications'],
    queryFn: () => base44.entities.GrantApplication.list('-created_date'),
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['funding-opportunities'],
    queryFn: () => base44.entities.FundingOpportunity.list(),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const organization = organizations[0];

  const createAppMutation = useMutation({
    mutationFn: (data) => base44.entities.GrantApplication.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grant-applications'] });
      setShowForm(false);
    },
  });

  const updateAppMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GrantApplication.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grant-applications'] });
      setSelectedApp(null);
    },
  });

  const filteredApps = filterStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === filterStatus);

  const stats = {
    total: applications.length,
    active: applications.filter(a => ['planning', 'in_progress', 'ready_to_submit'].includes(a.status)).length,
    submitted: applications.filter(a => ['submitted', 'under_review'].includes(a.status)).length,
    awarded: applications.filter(a => a.status === 'awarded').length,
    totalRequested: applications.reduce((sum, a) => sum + (a.requested_amount || 0), 0),
    totalAwarded: applications.filter(a => a.status === 'awarded').reduce((sum, a) => sum + (a.awarded_amount || 0), 0),
  };

  const getOpportunityName = (oppId) => {
    return opportunities.find(o => o.id === oppId)?.title || 'Unknown Opportunity';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6" data-tour="workflows">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Grant Application Tracker</h1>
            <p className="text-slate-600">Manage deadlines, documents, and application status</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            New Application
          </Button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Applications</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.active}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Under Review</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{stats.submitted}</p>
                </div>
                <Clock className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Awarded</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.awarded}</p>
                </div>
                <Trophy className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Awarded</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ${(stats.totalAwarded / 1000).toFixed(0)}K
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
            className={filterStatus === 'all' ? 'bg-emerald-600' : ''}
          >
            All ({applications.length})
          </Button>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const count = applications.filter(a => a.status === status).length;
            return (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className={filterStatus === status ? 'bg-emerald-600' : ''}
              >
                {config.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Applications Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-600">Loading applications...</div>
        ) : filteredApps.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {filterStatus === 'all' ? 'No applications yet' : `No ${STATUS_CONFIG[filterStatus]?.label.toLowerCase()} applications`}
              </h3>
              <p className="text-slate-600 mb-6">
                Track your grant applications and manage deadlines in one place
              </p>
              {filterStatus === 'all' && (
                <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Application
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredApps.map(app => {
                const StatusIcon = STATUS_CONFIG[app.status]?.icon || FileText;
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-emerald-500 h-full"
                      onClick={() => setSelectedApp(app)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className={STATUS_CONFIG[app.status]?.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {STATUS_CONFIG[app.status]?.label}
                          </Badge>
                          <div className="text-xs text-slate-500">
                            {app.completion_percentage}%
                          </div>
                        </div>

                        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                          {app.application_name}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-1">
                          {getOpportunityName(app.opportunity_id)}
                        </p>

                        <div className="space-y-2">
                          {app.submission_deadline && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {format(new Date(app.submission_deadline), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                          {app.requested_amount && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <DollarSign className="w-4 h-4" />
                              <span>${(app.requested_amount / 1000).toFixed(0)}K requested</span>
                            </div>
                          )}
                          {app.awarded_amount && (
                            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                              <Trophy className="w-4 h-4" />
                              <span>${(app.awarded_amount / 1000).toFixed(0)}K awarded</span>
                            </div>
                          )}
                        </div>

                        {app.supporting_documents && app.supporting_documents.length > 0 && (
                          <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-xs text-slate-500">
                              {app.supporting_documents.length} documents
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Create Application Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Grant Application</DialogTitle>
            </DialogHeader>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                createAppMutation.mutate({
                  opportunity_id: formData.get('opportunity_id'),
                  application_name: formData.get('application_name'),
                  submission_deadline: formData.get('submission_deadline'),
                  requested_amount: parseFloat(formData.get('requested_amount') || 0),
                  status: 'planning',
                  notes: formData.get('notes'),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Select Opportunity *
                </label>
                <Select name="opportunity_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an opportunity" />
                  </SelectTrigger>
                  <SelectContent>
                    {opportunities.map(opp => (
                      <SelectItem key={opp.id} value={opp.id}>
                        {opp.title} - {opp.funder_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Application Name *
                </label>
                <Input
                  name="application_name"
                  required
                  placeholder="e.g., Summer Youth Program 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Submission Deadline
                  </label>
                  <Input
                    name="submission_deadline"
                    type="date"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Requested Amount
                  </label>
                  <Input
                    name="requested_amount"
                    type="number"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Notes
                </label>
                <Textarea
                  name="notes"
                  rows={3}
                  placeholder="Application strategy, requirements, key contacts..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Create Application
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Application Detail Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedApp && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className={STATUS_CONFIG[selectedApp.status]?.color + ' mb-2'}>
                        {STATUS_CONFIG[selectedApp.status]?.label}
                      </Badge>
                      <DialogTitle className="text-2xl mb-2">{selectedApp.application_name}</DialogTitle>
                      <p className="text-slate-600">{getOpportunityName(selectedApp.opportunity_id)}</p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedApp.submission_deadline && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs text-slate-600">Deadline</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          {format(new Date(selectedApp.submission_deadline), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    )}
                    {selectedApp.requested_amount && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs text-slate-600">Requested</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          ${selectedApp.requested_amount.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Update */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Update Status
                    </label>
                    <Select
                      value={selectedApp.status}
                      onValueChange={(value) => {
                        updateAppMutation.mutate({
                          id: selectedApp.id,
                          data: { status: value }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                          <SelectItem key={status} value={status}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  {selectedApp.notes && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Notes</h4>
                      <p className="text-slate-700 whitespace-pre-line">{selectedApp.notes}</p>
                    </div>
                  )}

                  {/* AI Proposal Drafter */}
                  {organization && (
                    <AIProposalDrafter
                      opportunity={opportunities.find(o => o.id === selectedApp.opportunity_id)}
                      organization={organization}
                      onDraftGenerated={(draft) => {
                        console.log('Draft generated:', draft);
                      }}
                    />
                  )}

                  {/* Documents */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      Supporting Documents
                    </h4>
                    {selectedApp.supporting_documents && selectedApp.supporting_documents.length > 0 ? (
                      <div className="space-y-2">
                        {selectedApp.supporting_documents.map((docId) => {
                          const doc = documents.find(d => d.id === docId);
                          return doc ? (
                            <div key={docId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-700">{doc.doc_name}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">{doc.doc_type}</Badge>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-50 rounded-lg">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">No documents uploaded yet</p>
                        <Button variant="outline" size="sm" className="mt-3">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Document
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}