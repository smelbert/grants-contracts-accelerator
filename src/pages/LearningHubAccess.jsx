import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LearningHubAccessPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: allAccessLevels } = useQuery({
    queryKey: ['all-access-levels'],
    queryFn: () => base44.entities.UserAccessLevel.list()
  });

  const toggleAccessMutation = useMutation({
    mutationFn: async ({ userEmail, currentAccess }) => {
      const accessLevels = await base44.entities.UserAccessLevel.filter({
        user_email: userEmail
      });

      if (accessLevels.length > 0) {
        await base44.entities.UserAccessLevel.update(accessLevels[0].id, {
          learning_hub_access: !currentAccess
        });
      } else {
        await base44.entities.UserAccessLevel.create({
          user_email: userEmail,
          access_level: 'full_platform',
          learning_hub_access: !currentAccess
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-access-levels']);
      toast.success('Learning Hub access updated');
    }
  });

  const getUserAccessLevel = (userEmail) => {
    return allAccessLevels?.find(a => a.user_email === userEmail);
  };

  const hasLearningHubAccess = (userEmail) => {
    const accessLevel = getUserAccessLevel(userEmail);
    return accessLevel?.learning_hub_access || false;
  };

  const filteredUsers = users?.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-slate-900">Learning Hub Access Management</h1>
        </div>
        <p className="text-slate-600">
          Control which users can access the Learning Hub. IncubateHer participants have this disabled by default.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Access Control</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm text-slate-600">
                  {allAccessLevels?.filter(a => a.learning_hub_access).length || 0} users with access
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-600">
                  {users?.length - (allAccessLevels?.filter(a => a.learning_hub_access).length || 0)} without access
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredUsers?.map((user) => {
              const accessLevel = getUserAccessLevel(user.email);
              const hasAccess = hasLearningHubAccess(user.email);
              
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{user.full_name || 'No Name'}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                      {accessLevel?.entry_point === 'incubateher_program' && (
                        <Badge className="bg-[#AC1A5B] text-white">IncubateHer</Badge>
                      )}
                      {user.role === 'admin' && (
                        <Badge variant="outline">Admin</Badge>
                      )}
                    </div>
                    {accessLevel?.entry_point && (
                      <p className="text-xs text-slate-500 mt-1">
                        Entry: {accessLevel.entry_point}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {hasAccess ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Access Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-600">
                        <XCircle className="w-3 h-3 mr-1" />
                        No Access
                      </Badge>
                    )}
                    
                    <Switch
                      checked={hasAccess}
                      onCheckedChange={() => 
                        toggleAccessMutation.mutate({
                          userEmail: user.email,
                          currentAccess: hasAccess
                        })
                      }
                      disabled={toggleAccessMutation.isPending}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUsers?.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No users found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}