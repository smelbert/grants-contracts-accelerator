import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar } from '@/components/ui/avatar';
import { 
  Plus, 
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  MessageSquare,
  Bell,
  TrendingUp,
  AlertCircle,
  FileText,
  Send
} from 'lucide-react';
import { format } from 'date-fns';

const TASK_TYPES = [
  { value: 'research', label: 'Research', icon: FileText },
  { value: 'document', label: 'Document', icon: FileText },
  { value: 'review', label: 'Review', icon: CheckCircle2 },
  { value: 'application', label: 'Application', icon: TrendingUp },
  { value: 'meeting', label: 'Meeting', icon: Users },
  { value: 'follow_up', label: 'Follow-up', icon: Bell },
];

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: 'bg-slate-100 text-slate-700' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  review: { label: 'Review', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-amber-100 text-amber-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

export default function TeamCollaborationPage() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['team-tasks'],
    queryFn: () => base44.entities.TeamTask.list('-created_date'),
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['funding-opportunities'],
    queryFn: () => base44.entities.FundingOpportunity.list(),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['opportunity-comments'],
    queryFn: () => base44.entities.OpportunityComment.list('-created_date'),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
      setShowTaskForm(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks'] });
      setSelectedTask(null);
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.OpportunityComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity-comments'] });
      setCommentText('');
    },
  });

  const myTasks = tasks.filter(t => t.assigned_to === user?.email);
  const assignedByMe = tasks.filter(t => t.assigned_by === user?.email);
  const allTeamTasks = tasks;

  const workloadByUser = tasks.reduce((acc, task) => {
    if (task.status !== 'completed') {
      acc[task.assigned_to] = (acc[task.assigned_to] || 0) + 1;
    }
    return acc;
  }, {});

  const opportunityComments = selectedOpportunity
    ? comments.filter(c => c.opportunity_id === selectedOpportunity.id)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Team Collaboration</h1>
            <p className="text-slate-600">Coordinate tasks, discuss opportunities, and track team progress</p>
          </div>
          <Button onClick={() => setShowTaskForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">My Tasks</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{myTasks.length}</p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {tasks.filter(t => t.status === 'in_progress').length}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Team Members</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {Object.keys(workloadByUser).length}
                  </p>
                </div>
                <Users className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Comments</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">{comments.length}</p>
                </div>
                <MessageSquare className="w-10 h-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="workload">Team Workload</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Tabs defaultValue="my-tasks">
              <TabsList>
                <TabsTrigger value="my-tasks">My Tasks ({myTasks.length})</TabsTrigger>
                <TabsTrigger value="assigned-by-me">Assigned by Me ({assignedByMe.length})</TabsTrigger>
                <TabsTrigger value="all">All Tasks ({allTeamTasks.length})</TabsTrigger>
              </TabsList>

              {[
                { value: 'my-tasks', tasks: myTasks },
                { value: 'assigned-by-me', tasks: assignedByMe },
                { value: 'all', tasks: allTeamTasks }
              ].map(({ value, tasks: taskList }) => (
                <TabsContent key={value} value={value}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {taskList.map(task => (
                      <Card
                        key={task.id}
                        className="cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => setSelectedTask(task)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <Badge className={STATUS_CONFIG[task.status]?.color}>
                              {STATUS_CONFIG[task.status]?.label}
                            </Badge>
                            <Badge className={PRIORITY_CONFIG[task.priority]?.color}>
                              {PRIORITY_CONFIG[task.priority]?.label}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-2">{task.title}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-3">{task.description}</p>
                          <div className="space-y-1 text-xs text-slate-500">
                            <p>Assigned to: {task.assigned_to}</p>
                            {task.due_date && (
                              <p className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Opportunities List */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm">Select Opportunity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {opportunities.slice(0, 10).map(opp => (
                      <div
                        key={opp.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedOpportunity?.id === opp.id
                            ? 'bg-emerald-100 border-2 border-emerald-500'
                            : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                        onClick={() => setSelectedOpportunity(opp)}
                      >
                        <p className="font-medium text-sm text-slate-900 line-clamp-1">{opp.title}</p>
                        <p className="text-xs text-slate-600">{opp.funder_name}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {comments.filter(c => c.opportunity_id === opp.id).length} comments
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Discussion Thread */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm">
                    {selectedOpportunity ? selectedOpportunity.title : 'Select an opportunity to view discussions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOpportunity ? (
                    <div className="space-y-4">
                      {/* Comments List */}
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {opportunityComments.length === 0 ? (
                          <p className="text-center text-slate-500 py-8">No comments yet. Start the discussion!</p>
                        ) : (
                          opportunityComments.map(comment => (
                            <div key={comment.id} className="p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-medium text-emerald-700">
                                    {comment.author_name?.[0] || comment.author_email?.[0]?.toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-sm text-slate-900">
                                      {comment.author_name || comment.author_email}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                                    </p>
                                  </div>
                                  <p className="text-sm text-slate-700">{comment.comment_text}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Comment Form */}
                      <div className="flex gap-2">
                        <Textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add your thoughts, questions, or strategy notes..."
                          rows={2}
                        />
                        <Button
                          onClick={() => {
                            if (commentText.trim()) {
                              createCommentMutation.mutate({
                                opportunity_id: selectedOpportunity.id,
                                comment_text: commentText,
                                author_name: user?.full_name || user?.email,
                                author_email: user?.email
                              });
                            }
                          }}
                          disabled={!commentText.trim()}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p>Select an opportunity to view and add comments</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Workload Tab */}
          <TabsContent value="workload">
            <Card>
              <CardHeader>
                <CardTitle>Team Member Workload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(workloadByUser).map(([email, count]) => (
                    <div key={email} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="font-medium text-emerald-700">{email[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{email}</p>
                        <p className="text-sm text-slate-600">{count} active tasks</p>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                  {Object.keys(workloadByUser).length === 0 && (
                    <p className="text-center text-slate-500 py-8">No active tasks assigned yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Task Dialog */}
        <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                createTaskMutation.mutate({
                  title: formData.get('title'),
                  description: formData.get('description'),
                  task_type: formData.get('task_type'),
                  assigned_to: formData.get('assigned_to'),
                  assigned_by: user?.email,
                  status: 'todo',
                  priority: formData.get('priority'),
                  due_date: formData.get('due_date'),
                  estimated_hours: parseFloat(formData.get('estimated_hours') || 0)
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Task Title *</label>
                <Input name="title" required placeholder="e.g., Research XYZ Foundation" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
                <Textarea name="description" rows={3} placeholder="Task details and context..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Task Type</label>
                  <Select name="task_type" defaultValue="other">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Priority</label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Assign To *</label>
                  <Input name="assigned_to" required type="email" placeholder="user@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Due Date</label>
                  <Input name="due_date" type="date" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Estimated Hours</label>
                <Input name="estimated_hours" type="number" step="0.5" placeholder="2.5" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowTaskForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Create Task
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Task Detail Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent>
            {selectedTask && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedTask.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Badge className={STATUS_CONFIG[selectedTask.status]?.color}>
                      {STATUS_CONFIG[selectedTask.status]?.label}
                    </Badge>
                    <Badge className={PRIORITY_CONFIG[selectedTask.priority]?.color}>
                      {PRIORITY_CONFIG[selectedTask.priority]?.label}
                    </Badge>
                  </div>
                  {selectedTask.description && <p className="text-slate-700">{selectedTask.description}</p>}
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Assigned to:</span> {selectedTask.assigned_to}</p>
                    <p><span className="font-medium">Assigned by:</span> {selectedTask.assigned_by}</p>
                    {selectedTask.due_date && (
                      <p><span className="font-medium">Due:</span> {format(new Date(selectedTask.due_date), 'MMMM d, yyyy')}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Update Status</label>
                    <Select
                      value={selectedTask.status}
                      onValueChange={(value) => {
                        updateTaskMutation.mutate({
                          id: selectedTask.id,
                          data: { status: value, ...(value === 'completed' && { completed_at: new Date().toISOString() }) }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                          <SelectItem key={value} value={value}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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