import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function UserAccessManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [editingAccess, setEditingAccess] = useState({});

  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: accessLevels = [] } = useQuery({
    queryKey: ['all-access-levels'],
    queryFn: () => base44.entities.UserAccessLevel.list()
  });

  const updateAccessMutation = useMutation({
    mutationFn: async ({ userEmail, data }) => {
      const existing = accessLevels.find(a => a.user_email === userEmail);
      if (existing) {
        return base44.entities.UserAccessLevel.update(existing.id, data);
      } else {
        return base44.entities.UserAccessLevel.create({ user_email: userEmail, ...data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-access-levels']);
      toast.success('User access updated');
    }
  });

  const getUserAccess = (email) => accessLevels.find(a => a.user_email === email);

  const handleEdit = (email, field, value) => {
    setEditingAccess(prev => ({
      ...prev,
      [email]: { ...prev[email], [field]: value }
    }));
  };

  const handleSave = (email) => {
    const changes = editingAccess[email];
    if (!changes) return;
    updateAccessMutation.mutate({ userEmail: email, data: changes });
    setEditingAccess(prev => { const n = { ...prev }; delete n[email]; return n; });
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const accessOptions = ['community_only', 'coaching_portal', 'full_platform'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" /> User Access Management
          </CardTitle>
          <CardDescription>Control what each user can access across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {filteredUsers.map(user => {
              const access = getUserAccess(user.email);
              const pending = editingAccess[user.email] || {};
              const isExpanded = expandedUser === user.email;

              const current = {
                access_level: pending.access_level ?? access?.access_level ?? 'community_only',
                learning_hub_access: pending.learning_hub_access ?? access?.learning_hub_access ?? false,
                coaching_access: pending.coaching_access ?? access?.coaching_access ?? false,
              };

              return (
                <div key={user.email} className="border rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                    onClick={() => setExpandedUser(isExpanded ? null : user.email)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                        {(user.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.full_name || 'Unnamed'}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{access?.access_level || 'community_only'}</Badge>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t p-4 bg-slate-50 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs mb-1 block">Access Level</Label>
                          <Select
                            value={current.access_level}
                            onValueChange={v => handleEdit(user.email, 'access_level', v)}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {accessOptions.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt.replace(/_/g, ' ')}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Learning Hub Access</Label>
                            <Switch
                              checked={current.learning_hub_access}
                              onCheckedChange={v => handleEdit(user.email, 'learning_hub_access', v)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Coaching Access</Label>
                            <Switch
                              checked={current.coaching_access}
                              onCheckedChange={v => handleEdit(user.email, 'coaching_access', v)}
                            />
                          </div>
                        </div>
                      </div>
                      {editingAccess[user.email] && (
                        <Button size="sm" onClick={() => handleSave(user.email)} className="gap-1">
                          <Save className="w-3 h-3" /> Save Changes
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredUsers.length === 0 && (
              <p className="text-center text-slate-500 py-8">No users found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}