import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Shield } from 'lucide-react';

export default function CoachesStaffPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['coach-profiles-all'],
    queryFn: () => base44.entities.CoachProfile.list(),
  });

  const coaches = users?.filter(u => u.role === 'coach' || u.role === 'staff' || u.role === 'admin') || [];

  const getProfileForUser = (email) => {
    return profiles.find(p => p.user_email === email);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Loading coaches and staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Coaches & Staff</h1>
          <p className="text-slate-600">Manage coaching team access and permissions</p>
        </motion.div>

        {coaches.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Coaches or Staff Yet</h3>
              <p className="text-slate-600">Invite team members to start building your coaching team</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coaches?.map((coach, index) => {
              const profile = getProfileForUser(coach.email);
              return (
              <motion.div
                key={coach.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {profile?.headshot_url ? (
                          <img
                            src={profile.headshot_url}
                            alt={coach.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="p-2 bg-red-100 rounded-full">
                            <Users className="w-5 h-5 text-red-600" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-base">{coach.full_name || coach.email}</CardTitle>
                          <p className="text-sm text-slate-600">{profile?.title || coach.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className="capitalize">{coach.role}</Badge>
                        {profile && (
                          <Badge variant="outline" className="text-xs">
                            {profile.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {profile?.specialties && profile.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {profile.specialties.slice(0, 3).map(s => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Shield className="w-4 h-4 mr-2" />
                        Permissions
                      </Button>
                      {profile && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <UserCheck className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}