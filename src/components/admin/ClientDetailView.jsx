import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building2, User, DollarSign, Calendar, TrendingUp, 
  MessageSquare, Phone, Mail, FileText, CheckCircle2, 
  AlertCircle, Clock, Plus, ArrowLeft, Activity
} from 'lucide-react';
import { format } from 'date-fns';

const STAGE_CONFIG = {
  lead: { color: 'bg-slate-100 text-slate-700', label: 'Lead' },
  trial: { color: 'bg-blue-100 text-blue-700', label: 'Trial' },
  onboarding: { color: 'bg-purple-100 text-purple-700', label: 'Onboarding' },
  active: { color: 'bg-emerald-100 text-emerald-700', label: 'Active' },
  at_risk: { color: 'bg-amber-100 text-amber-700', label: 'At Risk' },
  churned: { color: 'bg-red-100 text-red-700', label: 'Churned' },
  won_back: { color: 'bg-teal-100 text-teal-700', label: 'Won Back' }
};

const INTERACTION_ICONS = {
  email: Mail,
  call: Phone,
  meeting: MessageSquare,
  note: FileText,
  support_ticket: AlertCircle,
  review_session: CheckCircle2,
  onboarding: Activity,
  check_in: Clock
};

export default function ClientDetailView({ client, onBack }) {
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    interaction_type: 'note',
    subject: '',
    notes: '',
    outcome: 'neutral',
    next_action: '',
    next_action_date: '',
    is_internal_note: true
  });

  const queryClient = useQueryClient();

  const { data: clientStage } = useQuery({
    queryKey: ['clientStage', client.id],
    queryFn: async () => {
      const stages = await base44.entities.ClientStage.filter({ organization_id: client.id });
      return stages[0];
    }
  });

  const { data: interactions } = useQuery({
    queryKey: ['interactions', client.id],
    queryFn: () => base44.entities.ClientInteraction.filter(
      { organization_id: client.id },
      '-created_date'
    )
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['teamMembers', client.id],
    queryFn: () => base44.entities.User.filter({ organization_id: client.id })
  });

  const addInteractionMutation = useMutation({
    mutationFn: (data) => base44.entities.ClientInteraction.create({
      ...data,
      organization_id: client.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['interactions', client.id]);
      setShowAddInteraction(false);
      setNewInteraction({
        interaction_type: 'note',
        subject: '',
        notes: '',
        outcome: 'neutral',
        next_action: '',
        next_action_date: '',
        is_internal_note: true
      });
    }
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ stage }) => {
      if (clientStage) {
        return base44.entities.ClientStage.update(clientStage.id, { stage });
      } else {
        return base44.entities.ClientStage.create({ organization_id: client.id, stage });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['clientStage', client.id]);
    }
  });

  const healthScore = clientStage?.health_score || 50;
  const engagementScore = clientStage?.engagement_score || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">{client.name}</h2>
          <p className="text-sm text-slate-600">{client.ownerEmail}</p>
        </div>
        <Dialog open={showAddInteraction} onOpenChange={setShowAddInteraction}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Log Interaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log Client Interaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <select
                  value={newInteraction.interaction_type}
                  onChange={(e) => setNewInteraction({...newInteraction, interaction_type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="note">Note</option>
                  <option value="email">Email</option>
                  <option value="call">Call</option>
                  <option value="meeting">Meeting</option>
                  <option value="support_ticket">Support Ticket</option>
                  <option value="review_session">Review Session</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="check_in">Check-in</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  value={newInteraction.subject}
                  onChange={(e) => setNewInteraction({...newInteraction, subject: e.target.value})}
                  placeholder="Brief subject line"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <Textarea
                  value={newInteraction.notes}
                  onChange={(e) => setNewInteraction({...newInteraction, notes: e.target.value})}
                  placeholder="Detailed notes about the interaction..."
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Outcome</label>
                <select
                  value={newInteraction.outcome}
                  onChange={(e) => setNewInteraction({...newInteraction, outcome: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="needs_followup">Needs Follow-up</option>
                  <option value="issue_resolved">Issue Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Next Action</label>
                <Input
                  value={newInteraction.next_action}
                  onChange={(e) => setNewInteraction({...newInteraction, next_action: e.target.value})}
                  placeholder="What needs to happen next?"
                />
              </div>
              <Button 
                onClick={() => addInteractionMutation.mutate(newInteraction)}
                disabled={!newInteraction.subject}
                className="w-full"
              >
                Save Interaction
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Client Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Client Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Organization Type</p>
                  <Badge variant="outline" className="capitalize">
                    {client.type?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Development Stage</p>
                  <Badge variant="outline" className="capitalize">
                    {client.stage}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Client Stage</p>
                  <select
                    value={clientStage?.stage || 'lead'}
                    onChange={(e) => updateStageMutation.mutate({ stage: e.target.value })}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                  >
                    {Object.entries(STAGE_CONFIG).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Team Size</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold">{teamMembers?.length || 0} members</span>
                  </div>
                </div>
              </div>

              {client.subscription && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-900 mb-2">Subscription</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Tier</p>
                      <Badge className="capitalize mt-1">{client.subscription.tier}</Badge>
                    </div>
                    <div>
                      <p className="text-slate-600">Status</p>
                      <Badge className="capitalize mt-1">{client.subscription.status}</Badge>
                    </div>
                    <div>
                      <p className="text-slate-600">Monthly</p>
                      <p className="font-semibold text-slate-900 mt-1">
                        ${client.subscription.monthly_cost || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interaction Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Interaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interactions?.map((interaction) => {
                  const Icon = INTERACTION_ICONS[interaction.interaction_type] || FileText;
                  return (
                    <div key={interaction.id} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="mt-1">
                        <Icon className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-slate-900">{interaction.subject}</p>
                            <p className="text-xs text-slate-500">
                              {format(new Date(interaction.created_date), 'MMM d, yyyy h:mm a')}
                              {interaction.created_by && ` • ${interaction.created_by}`}
                            </p>
                          </div>
                          <Badge className="capitalize text-xs">
                            {interaction.interaction_type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        {interaction.notes && (
                          <p className="text-sm text-slate-600 mb-2">{interaction.notes}</p>
                        )}
                        {interaction.next_action && (
                          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded">
                            <Clock className="w-4 h-4" />
                            Next: {interaction.next_action}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!interactions?.length && (
                  <p className="text-center text-slate-500 py-8">No interactions logged yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metrics */}
        <div className="space-y-6">
          {/* Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Health Score</span>
                    <span className="text-2xl font-bold text-slate-900">{healthScore}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        healthScore >= 70 ? 'bg-emerald-500' : 
                        healthScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Engagement</span>
                    <span className="text-2xl font-bold text-slate-900">{engagementScore}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${engagementScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Documents Created</span>
                <span className="font-semibold">{clientStage?.documents_created || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Reviews Requested</span>
                <span className="font-semibold">{clientStage?.reviews_requested || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Team Members</span>
                <span className="font-semibold">{teamMembers?.length || 0}</span>
              </div>
              {clientStage?.last_login && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Last Login</span>
                  <span className="text-sm font-semibold">
                    {format(new Date(clientStage.last_login), 'MMM d')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Staff */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Staff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {clientStage?.assigned_coach && (
                <div>
                  <p className="text-xs text-slate-600 mb-1">Coach</p>
                  <p className="text-sm font-medium">{clientStage.assigned_coach}</p>
                </div>
              )}
              {clientStage?.assigned_account_manager && (
                <div>
                  <p className="text-xs text-slate-600 mb-1">Account Manager</p>
                  <p className="text-sm font-medium">{clientStage.assigned_account_manager}</p>
                </div>
              )}
              {!clientStage?.assigned_coach && !clientStage?.assigned_account_manager && (
                <p className="text-sm text-slate-500">No staff assigned</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}