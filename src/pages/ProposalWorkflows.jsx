import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Users, CheckCircle2, AlertCircle, Clock, FileText, ArrowRight } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import WorkflowBuilder from '../components/workflows/WorkflowBuilder';
import WorkflowBoard from '../components/workflows/WorkflowBoard';

export default function ProposalWorkflowsPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  
  const queryClient = useQueryClient();

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['proposalWorkflows'],
    queryFn: () => base44.entities.ProposalWorkflow.list('-updated_date')
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['fundingOpportunities'],
    queryFn: () => base44.entities.FundingOpportunity.list()
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: (id) => base44.entities.ProposalWorkflow.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposalWorkflows'] });
    }
  });

  const getOpportunityById = (id) => {
    return opportunities.find(o => o.id === id);
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-slate-100 text-slate-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-amber-100 text-amber-800',
      submitted: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    return differenceInDays(new Date(deadline), new Date());
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-slate-600">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Proposal Workflows</h1>
            <p className="text-slate-600 mt-1">Manage grant proposal development and collaboration</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="board">Board View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Proposal Workflow</DialogTitle>
                </DialogHeader>
                <WorkflowBuilder
                  opportunities={opportunities}
                  onComplete={() => {
                    setShowCreateDialog(false);
                    queryClient.invalidateQueries({ queryKey: ['proposalWorkflows'] });
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Workflows</p>
                  <p className="text-2xl font-bold text-slate-900">{workflows.length}</p>
                </div>
                <FileText className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {workflows.filter(w => w.status === 'in_progress').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Review</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {workflows.filter(w => w.status === 'review').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {workflows.filter(w => w.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflows Display */}
        {viewMode === 'board' ? (
          <WorkflowBoard workflows={workflows} opportunities={opportunities} />
        ) : (
          <div className="space-y-4">
            {workflows.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No workflows yet</h3>
                  <p className="text-slate-600 mb-4">Create your first proposal workflow to get started</p>
                  <Button onClick={() => setShowCreateDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Workflow
                  </Button>
                </CardContent>
              </Card>
            ) : (
              workflows.map((workflow) => {
                const opportunity = getOpportunityById(workflow.opportunity_id);
                const daysLeft = getDaysUntilDeadline(workflow.final_deadline);
                const isUrgent = daysLeft !== null && daysLeft <= 7;

                return (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{workflow.workflow_name}</CardTitle>
                            <Badge className={getStatusColor(workflow.status)}>
                              {workflow.status.replace('_', ' ')}
                            </Badge>
                            {isUrgent && (
                              <Badge className="bg-red-100 text-red-800">
                                {daysLeft} days left
                              </Badge>
                            )}
                          </div>
                          {opportunity && (
                            <p className="text-sm text-slate-600">
                              {opportunity.title} • {opportunity.funder_name}
                            </p>
                          )}
                        </div>
                        <Link to={createPageUrl(`ProposalWorkflowDetail?id=${workflow.id}`)}>
                          <Button variant="ghost" size="sm">
                            View Details <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">Overall Progress</span>
                            <span className="text-sm font-medium text-slate-900">
                              {workflow.overall_progress || 0}%
                            </span>
                          </div>
                          <Progress value={workflow.overall_progress || 0} />
                        </div>

                        {/* Info */}
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                          {workflow.final_deadline && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(workflow.final_deadline), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                          {workflow.sections && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>{workflow.sections.length} sections</span>
                            </div>
                          )}
                          {workflow.team_members && workflow.team_members.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{workflow.team_members.length} team members</span>
                            </div>
                          )}
                        </div>

                        {/* Section Status Summary */}
                        {workflow.sections && workflow.sections.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {workflow.sections.filter(s => s.status === 'not_started').length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {workflow.sections.filter(s => s.status === 'not_started').length} not started
                              </Badge>
                            )}
                            {workflow.sections.filter(s => s.status === 'in_progress').length > 0 && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                {workflow.sections.filter(s => s.status === 'in_progress').length} in progress
                              </Badge>
                            )}
                            {workflow.sections.filter(s => s.status === 'approved').length > 0 && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                {workflow.sections.filter(s => s.status === 'approved').length} approved
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}