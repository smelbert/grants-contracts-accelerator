import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, FileText, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function GrantPipelineTracker({ projects }) {
  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Grant Pipeline Tracker
          </CardTitle>
          <CardDescription>Monitor your grant applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-3">No grants in pipeline yet</p>
            <Link to={createPageUrl('Projects')}>
              <Button size="sm" variant="outline">Create Project</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeProjects = projects.filter(p => 
    ['planning', 'in_progress', 'review', 'submitted'].includes(p.status)
  );

  const totalFunding = activeProjects.reduce((sum, p) => sum + (p.amount_asked || 0), 0);

  const getStageIcon = (stage) => {
    const icons = {
      drafting: '✏️',
      sent: '📤',
      pending: '⏳',
      awarded: '🎉',
      declined: '❌'
    };
    return icons[stage] || '📋';
  };

  const getStageColor = (stage) => {
    const colors = {
      drafting: 'bg-blue-100 text-blue-700',
      sent: 'bg-amber-100 text-amber-700',
      pending: 'bg-purple-100 text-purple-700',
      awarded: 'bg-emerald-100 text-emerald-700',
      declined: 'bg-red-100 text-red-700'
    };
    return colors[stage] || 'bg-slate-100 text-slate-700';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Grant Pipeline Tracker
        </CardTitle>
        <CardDescription>Monitor your grant applications and funding potential</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Funding Summary */}
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700 font-medium">Total Funding in Pipeline</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">
                ${totalFunding.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-2">
          {activeProjects.map((project) => {
            const deadline = project.deadline ? new Date(project.deadline) : null;
            const daysUntilDeadline = deadline ? Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)) : null;

            return (
              <Link key={project.id} to={createPageUrl('Projects')}>
                <div className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm line-clamp-1">{project.project_name}</p>
                      {project.funder_name && (
                        <p className="text-xs text-slate-600 line-clamp-1">{project.funder_name}</p>
                      )}
                    </div>
                    <Badge className={getStageColor(project.proposal_stage)}>
                      <span className="mr-1">{getStageIcon(project.proposal_stage)}</span>
                      {project.proposal_stage.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-600 gap-2">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span className="font-medium">${(project.amount_asked || 0).toLocaleString()}</span>
                    </div>
                    {deadline && (
                      <div className={`${daysUntilDeadline <= 7 ? 'text-red-600 font-medium' : ''}`}>
                        {format(deadline, 'MMM d, yyyy')} ({daysUntilDeadline} days)
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="pt-2 border-t border-slate-200">
          <Link to={createPageUrl('Projects')}>
            <Button className="w-full bg-[#143A50] hover:bg-[#1E4F58]" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              View All Projects
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}