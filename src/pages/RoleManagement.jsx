import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Users, 
  Search, 
  Edit, 
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS, PERMISSIONS, getRoleColor } from '@/components/lib/roles';
import { toast } from 'react-hot-toast';

export default function RoleManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      return await base44.asServiceRole.entities.User.list();
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      return await base44.asServiceRole.entities.User.update(userId, { role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      toast.success('Role updated successfully');
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error('Failed to update role');
      console.error(error);
    },
  });

  const handleUpdateRole = () => {
    if (!editingUser || !newRole) return;
    updateRoleMutation.mutate({ userId: editingUser.id, newRole });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
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

  if (currentUser?.role !== ROLES.OWNER && currentUser?.role !== ROLES.ADMIN) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-slate-600">You don't have permission to manage roles.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-[#143A50]" />
            <h1 className="text-3xl font-bold text-slate-900">Role Management</h1>
          </div>
          <p className="text-slate-600">Manage user roles and permissions across the platform</p>
        </div>

        {/* Role Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <Card key={role}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{label}</p>
                    <p className="text-2xl font-bold text-slate-900">{roleStats[role] || 0}</p>
                  </div>
                  <Badge className={getRoleColor(role)}>
                    {label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role Descriptions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Role Descriptions & Permissions</CardTitle>
            <CardDescription>Understanding what each role can do</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                <div key={role} className="border-l-4 border-[#143A50] pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getRoleColor(role)}>{label}</Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{ROLE_DESCRIPTIONS[role]}</p>
                  <details className="text-xs text-slate-600">
                    <summary className="cursor-pointer hover:text-slate-900 font-medium">
                      View {ROLE_PERMISSIONS[role]?.length || 0} permissions
                    </summary>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {ROLE_PERMISSIONS[role]?.map(perm => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Users</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <Label htmlFor="role-filter">Filter by Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
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

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-slate-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#143A50] to-[#1E4F58] flex items-center justify-center text-white font-semibold">
                        {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-slate-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleColor(user.role)}>
                        {ROLE_LABELS[user.role] || user.role}
                      </Badge>
                      {currentUser.role === ROLES.OWNER && user.id !== currentUser.id && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingUser(user);
                                setNewRole(user.role);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update User Role</DialogTitle>
                              <DialogDescription>
                                Change the role for {user.full_name || user.email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <Label>Select New Role</Label>
                                <Select value={newRole} onValueChange={setNewRole}>
                                  <SelectTrigger className="mt-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(ROLE_LABELS).map(([role, label]) => (
                                      <SelectItem key={role} value={role}>
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-sm font-medium text-slate-900 mb-1">
                                  {ROLE_LABELS[newRole]}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {ROLE_DESCRIPTIONS[newRole]}
                                </p>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingUser(null)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleUpdateRole}
                                  disabled={updateRoleMutation.isPending || newRole === user.role}
                                  className="bg-[#143A50] hover:bg-[#1E4F58]"
                                >
                                  Update Role
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
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