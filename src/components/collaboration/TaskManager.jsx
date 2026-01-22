import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle2, Circle, Clock, AlertCircle, Plus, User } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  todo: { icon: Circle, color: 'text-slate-400', bg: 'bg-slate-100' },
  in_progress: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  review: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
  completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' }
};

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700'
};

export default function TaskManager({ organizationId }) {
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    due_date: ''
  });

  const queryClient = useQueryClient();

  const { data: tasks } = useQuery({
    queryKey: ['tasks', organizationId],
    queryFn: () => base44.entities.Task.filter({ organization_id: organizationId }, '-created_date'),
    enabled: !!organizationId
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['teamMembers', organizationId],
    queryFn: () => base44.entities.User.filter({ organization_id: organizationId }),
    enabled: !!organizationId
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create({ ...data, organization_id: organizationId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', organizationId]);
      setShowNewTask(false);
      setNewTask({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', organizationId]);
    }
  });

  const handleStatusChange = (task, newStatus) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Team Tasks</h3>
        <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Task title..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Task details..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Assign To</label>
                  <select
                    value={newTask.assigned_to}
                    onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers?.map(member => (
                      <option key={member.id} value={member.email}>{member.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Due Date</label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                />
              </div>
              <Button onClick={() => createTaskMutation.mutate(newTask)} className="w-full">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {tasks?.map(task => {
          const StatusIcon = STATUS_CONFIG[task.status].icon;
          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => {
                      const nextStatus = task.status === 'todo' ? 'in_progress' : 
                                       task.status === 'in_progress' ? 'review' :
                                       task.status === 'review' ? 'completed' : 'todo';
                      handleStatusChange(task, nextStatus);
                    }}
                    className="mt-1"
                  >
                    <StatusIcon className={`w-5 h-5 ${STATUS_CONFIG[task.status].color}`} />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <p className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {task.title}
                      </p>
                      <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {task.assigned_to && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assigned_to}
                        </div>
                      )}
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due {format(new Date(task.due_date), 'MMM d')}
                        </div>
                      )}
                      <Badge variant="outline" className="capitalize text-xs">
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!tasks || tasks.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-slate-500 text-sm">No tasks yet. Create one to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}