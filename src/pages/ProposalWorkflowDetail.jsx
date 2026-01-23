import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Users, FileText, CheckCircle2, Clock, AlertCircle, Sparkles, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProposalWorkflowDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const workflowId = urlParams.get('id');

  const queryClient = useQueryClient();

  const { data: workflow, isLoading } = useQuery({
    queryKey: ['proposalWorkflow', workflowId],
    queryFn: () => base44.entities.ProposalWorkflow.list().then(list => list.find(w => w.id === workflowId)),
    enabled: !!workflowId
  });

  const { data: opportunity } = useQuery({
    queryKey: ['fundingOpportunity', workflow?.opportunity_id],
    queryFn: () => base44.entities.FundingOpportunity.list().then(list => list.find(o => o.id === workflow?.opportunity_id)),
    enabled: !!workflow?.opportunity_id
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list()
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProposalWorkflow.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposalWorkflow', workflowId] });
    }
  });

  const handleUpdateSection = (sectionId, updates) => {
    const updatedSections = workflow.sections.map(s =>
      s.section_id === sectionId ? { ...s, ...updates } : s
    );

    const completedSections = updatedSections.filter(s => s.status === 'approved').length;
    const overallProgress = Math.round((completedSections / updatedSections.length) * 100);

    updateWorkflowMutation.mutate({
      id: workflowId,
      data: {
        sections: updatedSections,
        overall_progress: overallProgress
      }
    });
  };

  const handleUpdateWorkflowStatus = (status) => {
    updateWorkflowMutation.mutate({
      id: workflowId,
      data: { status }
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      not_started: 'bg-slate-100 text-slate-800',
      in_progress: 'bg-blue-100 text-blue-800',
      draft_complete: 'bg-purple-100 text-purple-800',
      in_review: 'bg-amber-100 text-amber-800',
      approved: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-slate-600">Loading workflow...</div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Workflow not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to={createPageUrl('ProposalWorkflows')}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Workflows
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{workflow.workflow_name}</h1>
              {opportunity && (
                <p className="text-slate-600 mt-1">
                  {opportunity.title} • {opportunity.funder_name}
                </p>
              )}
            </div>
            <Select value={workflow.status} onValueChange={handleUpdateWorkflowStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Completion</span>
                    <span className="text-2xl font-bold text-slate-900">
                      {workflow.overall_progress || 0}%
                    </span>
                  </div>
                  <Progress value={workflow.overall_progress || 0} className="h-3" />
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-2">
                    <span>
                      {workflow.sections?.filter(s => s.status === 'approved').length || 0} of {workflow.sections?.length || 0} sections complete
                    </span>
                    {workflow.final_deadline && (
                      <span>Due {format(new Date(workflow.final_deadline), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Proposal Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflow.sections && workflow.sections.length > 0 ? (
                    workflow.sections.map((section) => (
                      <Card key={section.section_id} className="border-l-4 border-l-emerald-500">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900">{section.section_name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getStatusColor(section.status)} variant="outline">
                                    {section.status?.replace('_', ' ')}
                                  </Badge>
                                  {section.assigned_to && (
                                    <span className="text-xs text-slate-600">
                                      Assigned to: {section.assigned_to}
                                    </span>
                                  )}
                                  {section.deadline && (
                                    <span className="text-xs text-slate-600">
                                      Due: {format(new Date(section.deadline), 'MMM d')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Select
                                value={section.status}
                                onValueChange={(val) => handleUpdateSection(section.section_id, { status: val })}
                              >
                                <SelectTrigger className="w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not_started">Not Started</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="draft_complete">Draft Complete</SelectItem>
                                  <SelectItem value="in_review">In Review</SelectItem>
                                  <SelectItem value="approved">Approved</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {section.document_id && (
                              <div className="flex items-center gap-2 text-sm text-slate-600 pt-2 border-t">
                                <FileText className="w-4 h-4" />
                                <span>Document attached</span>
                                <Link to={createPageUrl('Documents')} className="text-emerald-600 hover:underline ml-auto">
                                  View
                                </Link>
                              </div>
                            )}

                            {section.notes && (
                              <div className="text-sm text-slate-600 bg-slate-50 rounded p-2 border">
                                {section.notes}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-600">
                      No sections defined yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {workflow.proposal_lead && (
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Proposal Lead</div>
                    <div className="text-sm font-medium">{workflow.proposal_lead}</div>
                  </div>
                )}
                {workflow.final_deadline && (
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Final Deadline</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium">
                        {format(new Date(workflow.final_deadline), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                )}
                {opportunity?.application_url && (
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Application Portal</div>
                    <a
                      href={opportunity.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      Open portal →
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workflow.team_members && workflow.team_members.length > 0 ? (
                  <div className="space-y-2">
                    {workflow.team_members.map((email) => (
                      <div key={email} className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-700 font-medium text-xs">
                            {email[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-slate-700">{email}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No team members assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={createPageUrl('Templates')}>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Browse Templates
                  </Button>
                </Link>
                <Link to={createPageUrl('BoilerplateBuilder')}>
                  <Button variant="outline" className="w-full justify-start">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Drafting Tools
                  </Button>
                </Link>
                <Link to={createPageUrl('TeamCollaboration')}>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Team Chat
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}