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
  CheckCircle2, Clock, Target, TrendingUp, Folders
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
    filterStatus === 'all' || p.status === filterStatus
  );

  const stats = {
    total: projects.length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    overdue: projects.filter(p => p.deadline && new Date(p.deadline) < new Date() && p.status !== 'completed').length
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
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Projects</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <FolderKanban className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.in_progress}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Completed</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Overdue</p>
                    <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {['all', 'planning', 'in_progress', 'review', 'submitted', 'completed'].map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
              >
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
  const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0 && project.status !== 'completed';

  const statusColors = {
    planning: 'bg-slate-100 text-slate-700',
    in_progress: 'bg-blue-100 text-blue-700',
    review: 'bg-purple-100 text-purple-700',
    submitted: 'bg-amber-100 text-amber-700',
    completed: 'bg-emerald-100 text-emerald-700',
    on_hold: 'bg-red-100 text-red-700'
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
              <CardTitle className="text-lg">{project.project_name}</CardTitle>
              <Badge className={statusColors[project.status]}>
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-600">Progress</span>
                  <span className="text-xs font-bold text-slate-900">{project.progress_percentage}%</span>
                </div>
                <Progress value={project.progress_percentage} className="h-2" />
              </div>

              {project.deadline && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                    {format(new Date(project.deadline), 'MMM d, yyyy')}
                    {daysUntilDeadline !== null && (
                      <span className="ml-1">
                        ({daysUntilDeadline < 0 ? 'Overdue' : `${daysUntilDeadline}d left`})
                      </span>
                    )}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{project.team_members?.length || 0} members</span>
                </div>
                <Badge variant="outline" className={priorityColors[project.priority]}>
                  {project.priority}
                </Badge>
              </div>
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
    project_type: 'general',
    deadline: '',
    priority: 'medium',
    status: 'planning'
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
              rows={3}
              placeholder="Briefly describe this project..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Project Type</label>
              <select
                value={formData.project_type}
                onChange={(e) => setFormData({...formData, project_type: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="general">General</option>
                <option value="grant_application">Grant Application</option>
                <option value="contract_proposal">Contract Proposal</option>
                <option value="donor_campaign">Donor Campaign</option>
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
            <label className="text-sm font-medium mb-2 block">Deadline</label>
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