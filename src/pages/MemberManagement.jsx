import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, TrendingUp, Award, Shield, Edit, X } from 'lucide-react';
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS, getRoleColor } from '@/components/lib/roles';
import { toast } from 'sonner';

export default function MemberManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [newRole, setNewRole] = useState('');

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.asServiceRole.entities.User.list('-created_date')
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['userActivities', selectedMember?.email],
    queryFn: () => base44.entities.UserActivity.filter({ user_email: selectedMember?.email }, '-created_date', 50),
    enabled: !!selectedMember?.email
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      return await base44.asServiceRole.entities.User.update(userId, { role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      toast.success('Role updated successfully');
      setNewRole('');
    },
    onError: () => {
      toast.error('Failed to update role');
    }
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleStats = () => {
    const stats = {};
    Object.values(ROLES).forEach(role => {
      stats[role] = users.filter(u => u.role === role).length;
    });
    return stats;
  };

  const roleStats = getRoleStats();
  const canManageRoles = currentUser?.role === ROLES.OWNER || currentUser?.role === ROLES.ADMIN;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-[#143A50]" />
            <h1 className="text-3xl font-bold text-slate-900">Member & Role Management</h1>
          </div>
          <p className="text-slate-600">Manage platform members, roles, and permissions</p>
        </div>

        {/* Role Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <Card key={role} className="hover:shadow-md transition">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <Badge className={`${getRoleColor(role)} w-fit`}>{label}</Badge>
                  <p className="text-3xl font-bold text-slate-900">{roleStats[role] || 0}</p>
                  <p className="text-xs text-slate-600">{ROLE_DESCRIPTIONS[role].slice(0, 50)}...</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label>Search Members</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <Label>Filter by Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {Object.entries(ROLE_LABELS).map(([role, label]) => (
                      <SelectItem key={role} value={role}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Members ({filteredUsers.length})</CardTitle>
            <CardDescription>Click on a member to view details or update their role</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-slate-600">Loading members...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No members found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#143A50] to-[#1E4F58] flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-slate-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge className={getRoleColor(user.role)}>
                        {ROLE_LABELS[user.role] || user.role}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMember(user);
                          setNewRole(user.role);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

      {/* Member Detail & Role Update Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Member Management
              <Button variant="ghost" size="icon" onClick={() => setSelectedMember(null)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <Tabs defaultValue="profile" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="role">Role & Permissions</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#143A50] to-[#1E4F58] flex items-center justify-center text-white font-bold text-2xl">
                    {selectedMember.full_name?.[0]?.toUpperCase() || selectedMember.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">{selectedMember.full_name || 'User'}</h3>
                    <p className="text-slate-600">{selectedMember.email}</p>
                    <Badge className={`${getRoleColor(selectedMember.role)} mt-2`}>
                      {ROLE_LABELS[selectedMember.role] || selectedMember.role}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-500">Organization</Label>
                    <p className="text-sm font-medium">{selectedMember.organization_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Job Title</Label>
                    <p className="text-sm font-medium">{selectedMember.job_title || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Location</Label>
                    <p className="text-sm font-medium">{selectedMember.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Member Since</Label>
                    <p className="text-sm font-medium">
                      {new Date(selectedMember.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="role" className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900">Current Role</p>
                      <p className="text-sm text-amber-700 mt-1">
                        {ROLE_DESCRIPTIONS[selectedMember.role]}
                      </p>
                    </div>
                  </div>
                </div>

                {canManageRoles && currentUser.id !== selectedMember.id && (
                  <div className="space-y-3">
                    <Label>Update Role</Label>
                    <Select value={newRole} onValueChange={setNewRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_LABELS).map(([role, label]) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              <Badge className={getRoleColor(role)} variant="outline">
                                {label}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {newRole && newRole !== selectedMember.role && (
                      <>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm font-medium text-slate-900 mb-1">
                            {ROLE_LABELS[newRole]} Role
                          </p>
                          <p className="text-xs text-slate-600 mb-3">
                            {ROLE_DESCRIPTIONS[newRole]}
                          </p>
                          <details className="text-xs">
                            <summary className="cursor-pointer text-slate-700 font-medium">
                              View {ROLE_PERMISSIONS[newRole]?.length || 0} permissions
                            </summary>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {ROLE_PERMISSIONS[newRole]?.map(perm => (
                                <Badge key={perm} variant="outline" className="text-xs">
                                  {perm.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </details>
                        </div>

                        <Button
                          onClick={() => {
                            updateRoleMutation.mutate({
                              userId: selectedMember.id,
                              newRole
                            });
                          }}
                          disabled={updateRoleMutation.isPending}
                          className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
                        >
                          {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {currentUser.id === selectedMember.id && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-sm text-blue-800">
                      You cannot change your own role
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-3">
                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activities.map(activity => (
                      <div key={activity.id} className="p-3 border rounded-lg hover:bg-slate-50 transition">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline">{activity.activity_type.replace('_', ' ')}</Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(activity.created_date).toLocaleDateString()}
                          </span>
                        </div>
                        {activity.points_earned && (
                          <p className="text-sm text-slate-700">
                            Earned <span className="font-semibold text-green-600">{activity.points_earned}</span> points
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>