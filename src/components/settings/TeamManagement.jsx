import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Plus, Mail, Trash2, Shield, CheckCircle2 } from 'lucide-react';

const ROLE_LABELS = {
  owner: { label: 'Owner', color: 'bg-purple-100 text-purple-700', description: 'Full control' },
  staff: { label: 'Staff', color: 'bg-blue-100 text-blue-700', description: 'Can draft & upload' },
  board_viewer: { label: 'Board Viewer', color: 'bg-slate-100 text-slate-700', description: 'View only' }
};

export default function TeamManagement({ currentUser }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: organization } = useQuery({
    queryKey: ['userOrg', currentUser?.organization_id],
    queryFn: () => base44.entities.Organization.filter({ id: currentUser?.organization_id }),
    enabled: !!currentUser?.organization_id,
    select: (data) => data[0]
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['teamMembers', currentUser?.organization_id],
    queryFn: () => base44.entities.User.filter({ organization_id: currentUser?.organization_id }),
    enabled: !!currentUser?.organization_id && currentUser?.org_team_role === 'owner'
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      await base44.users.inviteUser(email, 'user');
      // Note: The invited user will need to set their org_team_role after accepting
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMembers']);
      setInviteEmail('');
      setShowInviteForm(false);
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => base44.entities.User.update(userId, { org_team_role: role }),
    onSuccess: () => queryClient.invalidateQueries(['teamMembers'])
  });

  const handleInvite = () => {
    if (inviteEmail && inviteRole) {
      inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
    }
  };

  if (currentUser?.org_team_role !== 'owner') {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Only organization owners can manage team members</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
          <p className="text-sm text-slate-600">Manage access for your organization</p>
        </div>
        <Button onClick={() => setShowInviteForm(!showInviteForm)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="staff">Staff Contributor</option>
                  <option value="board_viewer">Board Viewer</option>
                  <option value="owner">Owner/Admin</option>
                </select>
                <p className="text-xs text-slate-600 mt-1">
                  {ROLE_LABELS[inviteRole]?.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleInvite} disabled={!inviteEmail || inviteMutation.isPending}>
                  <Mail className="w-4 h-4 mr-2" />
                  {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
                </Button>
                <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Permissions Info */}
      <Alert>
        <Shield className="w-4 h-4" />
        <AlertDescription className="text-sm">
          <strong>Role Permissions:</strong>
          <ul className="mt-2 space-y-1 text-slate-600">
            <li>• <strong>Owner:</strong> Full access, can manage team and payments</li>
            <li>• <strong>Staff:</strong> Can upload and draft documents</li>
            <li>• <strong>Board Viewer:</strong> View-only access to progress and documents</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Team</CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembers && teamMembers.length > 0 ? (
            <div className="space-y-3">
              {teamMembers.map((member) => {
                const roleConfig = ROLE_LABELS[member.org_team_role] || ROLE_LABELS.staff;
                const isCurrentUser = member.id === currentUser.id;
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-slate-900">
                          {member.full_name || member.email}
                        </p>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isCurrentUser ? (
                        <Badge className={roleConfig.color}>
                          {roleConfig.label}
                        </Badge>
                      ) : (
                        <select
                          value={member.org_team_role || 'staff'}
                          onChange={(e) => updateRoleMutation.mutate({ userId: member.id, role: e.target.value })}
                          className="px-3 py-1 border border-slate-300 rounded-md text-sm"
                        >
                          <option value="owner">Owner</option>
                          <option value="staff">Staff</option>
                          <option value="board_viewer">Board Viewer</option>
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No team members yet</p>
              <p className="text-sm text-slate-500 mt-1">Invite colleagues to collaborate</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}