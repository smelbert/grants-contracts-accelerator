import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Edit2, Save, X, DollarSign, Calendar, User, Bell, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

const stageColors = {
  drafting: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  awarded: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-red-100 text-red-700'
};

export default function ProjectDetailPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [followUpDays, setFollowUpDays] = useState('7');
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }).then(r => r[0]),
    enabled: !!projectId
  });

  const { data: organization } = useQuery({
    queryKey: ['org', project?.organization_id],
    queryFn: () => base44.entities.Organization.filter({ id: project?.organization_id }).then(r => r[0]),
    enabled: !!project?.organization_id
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setIsEditing(false);
      toast.success('Project updated!');
    }
  });

  const followUpMutation = useMutation({
    mutationFn: async () => {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + parseInt(followUpDays));
      return base44.entities.Project.update(projectId, {
        next_follow_up_date: nextDate.toISOString().split('T')[0],
        follow_up_frequency_days: parseInt(followUpDays),
        last_follow_up_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setShowFollowUpDialog(false);
      toast.success('Follow-up scheduled!');
    }
  });

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;
  if (!project) return <div className="p-6 text-center">Project not found</div>;

  const daysUntilDeadline = project.deadline ? differenceInDays(new Date(project.deadline), new Date()) : null;

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  if (isEditing && editData) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Edit Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Project Name</label>
                <Input
                  value={editData.project_name}
                  onChange={(e) => setEditData({...editData, project_name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Funder Name</label>
                  <Input
                    value={editData.funder_name || ''}
                    onChange={(e) => setEditData({...editData, funder_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount Asked</label>
                  <Input
                    type="number"
                    value={editData.amount_asked || ''}
                    onChange={(e) => setEditData({...editData, amount_asked: e.target.value ? parseInt(e.target.value) : null})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Proposal Stage</label>
                  <select
                    value={editData.proposal_stage}
                    onChange={(e) => setEditData({...editData, proposal_stage: e.target.value})}
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
                  <label className="text-sm font-medium mb-2 block">Amount Awarded</label>
                  <Input
                    type="number"
                    value={editData.amount_awarded || ''}
                    onChange={(e) => setEditData({...editData, amount_awarded: e.target.value ? parseInt(e.target.value) : null})}
                    placeholder="If awarded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Deadline</label>
                  <Input
                    type="date"
                    value={editData.deadline}
                    onChange={(e) => setEditData({...editData, deadline: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Expected Notification</label>
                  <Input
                    type="date"
                    value={editData.expected_notification_date || ''}
                    onChange={(e) => setEditData({...editData, expected_notification_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <Textarea
                  value={editData.notes || ''}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Link to={createPageUrl('Projects')}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
          </Button>
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{project.project_name}</h1>
            {project.funder_name && <p className="text-slate-600 mt-1">{project.funder_name}</p>}
          </div>
          <Button onClick={() => { setEditData(project); setIsEditing(true); }} className="gap-2">
            <Edit2 className="w-4 h-4" /> Edit
          </Button>
        </div>

        {/* Stage & Timeline */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Stage</p>
                  <Badge className={stageColors[project.proposal_stage]}>
                    {project.proposal_stage.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {project.deadline && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">Deadline</p>
                    <p className="font-semibold text-slate-900">{format(new Date(project.deadline), 'MMM d, yyyy')}</p>
                    {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                      <p className="text-xs text-slate-500">{daysUntilDeadline} days left</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {project.expected_notification_date && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">Expected Decision</p>
                    <p className="font-semibold text-slate-900">{format(new Date(project.expected_notification_date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Funding Summary */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {project.amount_asked && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm text-slate-600">Amount Asked</p>
                    <p className="text-2xl font-bold text-slate-900">${(project.amount_asked / 1000000).toFixed(2)}M</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {project.amount_awarded && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm text-slate-600">Amount Awarded</p>
                    <p className="text-2xl font-bold text-emerald-600">${(project.amount_awarded / 1000000).toFixed(2)}M</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Follow-up */}
        {project.proposal_stage === 'pending' && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600" />
                  <CardTitle>Follow-up Schedule</CardTitle>
                </div>
                <Button onClick={() => setShowFollowUpDialog(true)} size="sm" variant="outline">
                  Schedule Follow-up
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {project.next_follow_up_date ? (
                <div>
                  <p className="text-sm text-slate-700 mb-2">
                    Next follow-up: <strong>{format(new Date(project.next_follow_up_date), 'MMM d, yyyy')}</strong>
                  </p>
                  {project.follow_up_frequency_days && (
                    <p className="text-xs text-slate-600">
                      Repeat every {project.follow_up_frequency_days} days
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No follow-up scheduled. Click the button to set one.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {project.description && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-wrap">{project.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {project.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-wrap">{project.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Follow-up Dialog */}
      {showFollowUpDialog && (
        <Dialog open onOpenChange={setShowFollowUpDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Follow-up Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Follow-up in (days)</label>
                <Input
                  type="number"
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(e.target.value)}
                  min="1"
                />
              </div>
              <div className="bg-slate-100 p-3 rounded text-sm text-slate-600">
                Reminder will be sent on {new Date(new Date().getTime() + parseInt(followUpDays) * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFollowUpDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => followUpMutation.mutate()} className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]">
                  Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}