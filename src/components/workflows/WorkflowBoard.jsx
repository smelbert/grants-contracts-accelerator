import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

const STATUS_COLUMNS = [
  { status: 'planning', label: 'Planning', color: 'bg-slate-100' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-blue-100' },
  { status: 'review', label: 'In Review', color: 'bg-amber-100' },
  { status: 'submitted', label: 'Submitted', color: 'bg-purple-100' }
];

export default function WorkflowBoard({ workflows, opportunities }) {
  const getOpportunityById = (id) => {
    return opportunities.find(o => o.id === id);
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    return differenceInDays(new Date(deadline), new Date());
  };

  const getWorkflowsByStatus = (status) => {
    return workflows.filter(w => w.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {STATUS_COLUMNS.map((column) => {
        const columnWorkflows = getWorkflowsByStatus(column.status);
        
        return (
          <div key={column.status} className="space-y-3">
            <div className={`${column.color} rounded-lg p-3 flex items-center justify-between`}>
              <h3 className="font-semibold text-slate-900">{column.label}</h3>
              <Badge variant="outline" className="bg-white">
                {columnWorkflows.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {columnWorkflows.map((workflow) => {
                const opportunity = getOpportunityById(workflow.opportunity_id);
                const daysLeft = getDaysUntilDeadline(workflow.final_deadline);
                const isUrgent = daysLeft !== null && daysLeft <= 7;

                return (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">
                        {workflow.workflow_name}
                      </CardTitle>
                      {opportunity && (
                        <p className="text-xs text-slate-600 mt-1">
                          {opportunity.funder_name}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-600">Progress</span>
                          <span className="text-xs font-medium">
                            {workflow.overall_progress || 0}%
                          </span>
                        </div>
                        <Progress value={workflow.overall_progress || 0} className="h-1.5" />
                      </div>

                      {/* Info */}
                      <div className="space-y-2 text-xs text-slate-600">
                        {workflow.final_deadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(workflow.final_deadline), 'MMM d')}</span>
                            {isUrgent && (
                              <Badge className="bg-red-100 text-red-800 text-xs ml-auto">
                                {daysLeft}d
                              </Badge>
                            )}
                          </div>
                        )}
                        {workflow.team_members && workflow.team_members.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{workflow.team_members.length} members</span>
                          </div>
                        )}
                      </div>

                      {/* Sections Summary */}
                      {workflow.sections && workflow.sections.length > 0 && (
                        <div className="pt-2 border-t">
                          <div className="text-xs text-slate-600">
                            {workflow.sections.filter(s => s.status === 'approved').length}/{workflow.sections.length} sections complete
                          </div>
                        </div>
                      )}

                      <Link to={createPageUrl(`ProposalWorkflowDetail?id=${workflow.id}`)}>
                        <Button variant="ghost" size="sm" className="w-full text-xs">
                          View Details <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}

              {columnWorkflows.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-400">
                  No workflows
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}