import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, TrendingUp, Award, Mail, Edit } from 'lucide-react';

export default function MemberManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [activityFilter, setActivityFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('-total_activity_points')
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['userActivities', selectedMember?.email],
    queryFn: () => base44.entities.UserActivity.filter({ user_email: selectedMember?.email }, '-created_date', 50),
    enabled: !!selectedMember?.email
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ email, data }) => base44.entities.User.update(email, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setSelectedMember(null);
    }
  });

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActivityLevelColor = (level) => {
    const colors = {
      beginner: 'bg-slate-100 text-slate-700',
      active: 'bg-blue-100 text-blue-700',
      expert: 'bg-purple-100 text-purple-700',
      champion: 'bg-orange-100 text-orange-700'
    };
    return colors[level] || colors.beginner;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const topMembers = [...users].sort((a, b) => (b.total_activity_points || 0) - (a.total_activity_points || 0)).slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" />
            Member Management
          </h1>
          <p className="text-slate-600 mt-2">View and manage community members and their activity</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Members</p>
                <p className="text-2xl font-bold text-slate-900">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Members</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter(u => (u.activity_level === 'active' || u.activity_level === 'expert' || u.activity_level === 'champion')).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Champions</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter(u => u.activity_level === 'champion').length}
                </p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Admins</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'admin' || u.role === 'owner').length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="pl-10"
          />
        </div>
        <Select value={activityFilter} onValueChange={setActivityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="beginner">Beginners</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expert">Experts</SelectItem>
            <SelectItem value="champion">Champions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top Members */}
      <Card className="mb-8 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-600" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topMembers.map((member, idx) => (
              <div key={member.email} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{member.full_name || 'User'}</p>
                    <p className="text-sm text-slate-600">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getActivityLevelColor(member.activity_level)}>
                    {member.activity_level || 'beginner'}
                  </Badge>
                  <div className="text-right">
                    <p className="font-semibold text-orange-600">{member.total_activity_points || 0}</p>
                    <p className="text-xs text-slate-600">points</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredUsers.map(user => (
              <div
                key={user.email}
                className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                onClick={() => setSelectedMember(user)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium">
                    {user.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{user.full_name || 'User'}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{user.role}</Badge>
                  <Badge className={getActivityLevelColor(user.activity_level)}>
                    {user.activity_level || 'beginner'}
                  </Badge>
                  <div className="text-right min-w-[80px]">
                    <p className="font-semibold">{user.total_activity_points || 0}</p>
                    <p className="text-xs text-slate-600">points</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl">
                    {selectedMember.full_name?.[0] || selectedMember.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedMember.full_name || 'User'}</h3>
                    <p className="text-slate-600">{selectedMember.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge>{selectedMember.role}</Badge>
                      <Badge className={getActivityLevelColor(selectedMember.activity_level)}>
                        {selectedMember.activity_level || 'beginner'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Bio</p>
                    <p className="text-sm">{selectedMember.bio || 'No bio added'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Organization</p>
                    <p className="text-sm">{selectedMember.organization_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Job Title</p>
                    <p className="text-sm">{selectedMember.job_title || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Location</p>
                    <p className="text-sm">{selectedMember.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Activity Points</p>
                    <p className="text-2xl font-bold text-emerald-600">{selectedMember.total_activity_points || 0}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="activity" className="space-y-3">
                {activities.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">No activity yet</p>
                ) : (
                  activities.map(activity => (
                    <div key={activity.id} className="p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline">{activity.activity_type.replace('_', ' ')}</Badge>
                        <span className="text-xs text-slate-600">
                          {new Date(activity.created_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">
                        Earned <span className="font-semibold text-emerald-600">{activity.points_earned}</span> points
                      </p>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}