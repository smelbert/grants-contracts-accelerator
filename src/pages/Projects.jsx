import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FolderKanban, Plus, Calendar, Users, AlertCircle, 
  CheckCircle2, Clock, Target, TrendingUp, Folders,
  DollarSign, ArrowRight, X, Edit2, Trash2, Bell
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function ProjectsPage() {
  const [showNewProject, setShowNewProject] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', organizations[0]?.id],
    queryFn: () => base44.entities.Project.filter({ organization_id: organizations[0]?.id }, '-created_date'),
    enabled: !!organizations[0]?.id,
  });

  const createProjectMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create({
      ...data,
      organization_id: organizations[0]?.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setShowNewProject(false);
    }
  });

  const filteredProjects = projects.filter(p => 
    filterStatus === 'all' || p.proposal_stage === filterStatus
  );

  const stats = {
    total: projects.length,
    drafting: projects.filter(p => p.proposal_stage === 'drafting').length,
    sent: projects.filter(p => p.proposal_stage === 'sent').length,
    pending: projects.filter(p => p.proposal_stage === 'pending').length,
    awarded: projects.filter(p => p.proposal_stage === 'awarded').length,
    declined: projects.filter(p => p.proposal_stage === 'declined').length,
    total_asked: projects.reduce((sum, p) => sum + (p.amount_asked || 0), 0),
    total_awarded: projects.reduce((sum, p) => sum + (p.amount_awarded || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Folders className="w-8 h-8 text-emerald-600" />
                Project Management
              </h1>
              <p className="text-slate-600 mt-2">Organize templates and documents into trackable projects</p>
            </div>
            <Button onClick={() => setShowNewProject(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-600 mt-1">Total Proposals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-slate-700">{stats.drafting}</p>
                <p className="text-xs text-slate-600 mt-1">Drafting</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
                <p className="text-xs text-slate-600 mt-1">Sent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-xs text-slate-600 mt-1">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats.awarded}</p>
                <p className="text-xs text-slate-600 mt-1">Awarded</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
                <p className="text-xs text-slate-600 mt-1">Declined</p>
              </CardContent>
            </Card>
          </div>

          {/* Funding Summary */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Asked</p>
                    <p className="text-3xl font-bold text-slate-900">${(stats.total_asked / 1000000).toFixed(1)}M</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-amber-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Awarded</p>
                    <p className="text-3xl font-bold text-emerald-600">${(stats.total_awarded / 1000000).toFixed(1)}M</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
           <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
             {['all', 'drafting', 'sent', 'pending', 'awarded', 'declined'].map(stage => (
               <Button
                 key={stage}
                 variant={filterStatus === stage ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setFilterStatus(stage)}
                 className="whitespace-nowrap"
               >
                 {stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
               </Button>
             ))}
           </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => (
            <ProjectCard key={project.id} project={project} index={idx} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderKanban className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No projects found. Create your first project to get started!</p>
            </CardContent>
          </Card>
        )}

        {/* New Project Dialog */}
        {showNewProject && (
          <NewProjectDialog 
            onClose={() => setShowNewProject(false)}
            onSave={(data) => createProjectMutation.mutate(data)}
          />
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, index }) {
  const daysUntilDeadline = project.deadline ? differenceInDays(new Date(project.deadline), new Date()) : null;
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline > 0 && daysUntilDeadline <= 14 && project.proposal_stage !== 'sent' && project.proposal_stage !== 'pending';

  const stageColors = {
    drafting: 'bg-slate-100 text-slate-700',
    sent: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    awarded: 'bg-emerald-100 text-emerald-700',
    declined: 'bg-red-100 text-red-700'
  };

  const priorityColors = {
    low: 'text-slate-600',
    medium: 'text-blue-600',
    high: 'text-amber-600',
    urgent: 'text-red-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={createPageUrl('ProjectDetail') + `?id=${project.id}`}>
        <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-300 cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <CardTitle className="text-lg">{project.project_name}</CardTitle>
                {project.funder_name && <p className="text-xs text-slate-500 mt-1">{project.funder_name}</p>}
              </div>
              <Badge className={stageColors[project.proposal_stage]}>
                {project.proposal_stage.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.amount_asked && (
                <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                  <span className="text-xs text-slate-600">Amount Asked</span>
                  <span className="font-semibold text-amber-700">${(project.amount_asked / 1000000).toFixed(1)}M</span>
                </div>
              )}

              {project.amount_awarded && (
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                  <span className="text-xs text-slate-600">Amount Awarded</span>
                  <span className="font-semibold text-emerald-700">${(project.amount_awarded / 1000000).toFixed(1)}M</span>
                </div>
              )}

              {project.deadline && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-slate-400'}`} />
                  <span className={isUrgent ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                    {format(new Date(project.deadline), 'MMM d')}
                    {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                      <span className="ml-1">({daysUntilDeadline}d)</span>
                    )}
                  </span>
                </div>
              )}

              {project.next_follow_up_date && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Bell className="w-4 h-4" />
                  <span>Follow-up: {format(new Date(project.next_follow_up_date), 'MMM d')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function NewProjectDialog({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    funder_name: '',
    project_type: 'grant_application',
    funding_lane: 'grants',
    proposal_stage: 'drafting',
    amount_asked: '',
    deadline: '',
    priority: 'medium'
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Project Name</label>
            <Input
              value={formData.project_name}
              onChange={(e) => setFormData({...formData, project_name: e.target.value})}
              placeholder="e.g., Youth Leadership Grant 2026"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={2}
              placeholder="Briefly describe this project..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Funder Name</label>
              <Input
                value={formData.funder_name}
                onChange={(e) => setFormData({...formData, funder_name: e.target.value})}
                placeholder="e.g., Ford Foundation"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Amount Asked</label>
              <Input
                type="number"
                value={formData.amount_asked}
                onChange={(e) => setFormData({...formData, amount_asked: e.target.value ? parseInt(e.target.value) : ''})}
                placeholder="e.g., 250000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Project Type</label>
              <select
                value={formData.project_type}
                onChange={(e) => setFormData({...formData, project_type: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="grant_application">Grant Application</option>
                <option value="contract_proposal">Contract Proposal</option>
                <option value="donor_campaign">Donor Campaign</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Funding Lane</label>
              <select
                value={formData.funding_lane}
                onChange={(e) => setFormData({...formData, funding_lane: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="grants">Grants</option>
                <option value="contracts">Contracts</option>
                <option value="donors">Donors</option>
                <option value="public_funds">Public Funds</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Proposal Stage</label>
              <select
                value={formData.proposal_stage}
                onChange={(e) => setFormData({...formData, proposal_stage: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="drafting">Drafting</option>
                <option value="sent">Sent</option>
                <option value="pending">Pending Review</option>
                <option value="awarded">Awarded</option>
                <option value="declined">Declined</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Submission Deadline</label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={() => onSave(formData)} 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={!formData.project_name}
            >
              Create Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}