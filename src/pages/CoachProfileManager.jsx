import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Search, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  XCircle,
  Edit,
  Loader2,
  Calendar
} from 'lucide-react';

export default function CoachProfileManagerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['coach-profiles-all'],
    queryFn: () => base44.entities.CoachProfile.list('-created_date'),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CoachProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-profiles-all'] });
      setSelectedProfile(null);
    },
  });

  const toggleActiveStatus = (profile) => {
    updateProfileMutation.mutate({
      id: profile.id,
      data: { is_active: !profile.is_active }
    });
  };

  const filteredProfiles = profiles.filter(profile => {
    const query = searchQuery.toLowerCase();
    return (
      profile.full_name?.toLowerCase().includes(query) ||
      profile.user_email?.toLowerCase().includes(query) ||
      profile.title?.toLowerCase().includes(query) ||
      profile.specialties?.some(s => s.toLowerCase().includes(query))
    );
  });

  const activeProfiles = filteredProfiles.filter(p => p.is_active);
  const inactiveProfiles = filteredProfiles.filter(p => !p.is_active);

  const coachesWithoutProfiles = allUsers.filter(user => 
    (user.role === 'coach' || user.role === 'admin') && 
    !profiles.some(p => p.user_email === user.email)
  );

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-600';
      case 'limited': return 'bg-yellow-600';
      case 'unavailable': return 'bg-red-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-emerald-600" />
            Coach & Staff Profile Manager
          </h1>
          <p className="text-slate-600">Manage all coach and staff profiles across the platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-900">{profiles.length}</div>
              <p className="text-sm text-slate-600">Total Profiles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{activeProfiles.length}</div>
              <p className="text-sm text-slate-600">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-emerald-600">
                {profiles.filter(p => p.availability_status === 'available').length}
              </div>
              <p className="text-sm text-slate-600">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{coachesWithoutProfiles.length}</div>
              <p className="text-sm text-slate-600">Missing Profiles</p>
            </CardContent>
          </Card>
        </div>

        {/* Missing Profiles Alert */}
        {coachesWithoutProfiles.length > 0 && (
          <Alert className="bg-orange-50 border-orange-200">
            <AlertDescription className="text-orange-900">
              <strong>{coachesWithoutProfiles.length} coaches/staff</strong> haven't created their profiles yet: {' '}
              {coachesWithoutProfiles.map(u => u.full_name || u.email).join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search by name, email, title, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Profiles List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          </div>
        ) : (
          <>
            {/* Active Profiles */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Active Profiles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeProfiles.map((profile) => (
                  <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {profile.headshot_url ? (
                          <img
                            src={profile.headshot_url}
                            alt={profile.full_name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                            <User className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{profile.full_name}</h3>
                          <p className="text-sm text-slate-600 truncate">{profile.title}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge className="bg-emerald-600 text-xs">{profile.role}</Badge>
                            <Badge className={`${getAvailabilityColor(profile.availability_status)} text-xs`}>
                              {profile.availability_status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{profile.user_email}</span>
                        </div>
                        {profile.phone && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="w-4 h-4" />
                            <span>{profile.phone}</span>
                          </div>
                        )}
                        {profile.years_experience > 0 && (
                          <p className="text-slate-600">
                            {profile.years_experience} years experience
                          </p>
                        )}
                      </div>

                      {profile.specialties?.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {profile.specialties.slice(0, 3).map((spec) => (
                              <Badge key={spec} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {profile.specialties.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.specialties.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedProfile(profile)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActiveStatus(profile)}
                          disabled={updateProfileMutation.isPending}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {activeProfiles.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No active profiles found</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Inactive Profiles */}
            {inactiveProfiles.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Inactive Profiles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inactiveProfiles.map((profile) => (
                    <Card key={profile.id} className="opacity-60">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                            <User className="w-8 h-8 text-slate-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{profile.full_name}</h3>
                            <p className="text-sm text-slate-600">{profile.title}</p>
                            <Badge className="bg-red-600 text-xs mt-2">Inactive</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setSelectedProfile(profile)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => toggleActiveStatus(profile)}
                            disabled={updateProfileMutation.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Profile Detail Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                {selectedProfile.headshot_url ? (
                  <img
                    src={selectedProfile.headshot_url}
                    alt={selectedProfile.full_name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900">{selectedProfile.full_name}</h3>
                  <p className="text-lg text-slate-600">{selectedProfile.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-emerald-600">{selectedProfile.role}</Badge>
                    <Badge variant="outline">{selectedProfile.years_experience} years</Badge>
                    <Badge className={getAvailabilityColor(selectedProfile.availability_status)}>
                      {selectedProfile.availability_status}
                    </Badge>
                    <Badge className={selectedProfile.is_active ? 'bg-green-600' : 'bg-red-600'}>
                      {selectedProfile.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedProfile.bio && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Bio</h4>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedProfile.bio}</p>
                </div>
              )}

              {selectedProfile.specialties?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.specialties.map((spec) => (
                      <Badge key={spec} className="bg-emerald-600">{spec}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{selectedProfile.user_email}</span>
                  </div>
                  {selectedProfile.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{selectedProfile.phone}</span>
                    </div>
                  )}
                  {selectedProfile.calendar_link && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <a
                        href={selectedProfile.calendar_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline"
                      >
                        Book Meeting
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => toggleActiveStatus(selectedProfile)}
                  disabled={updateProfileMutation.isPending}
                >
                  {selectedProfile.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button onClick={() => setSelectedProfile(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}