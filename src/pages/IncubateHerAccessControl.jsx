import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, Calendar, Users, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function IncubateHerAccessControl() {
  const [editingUser, setEditingUser] = useState(null);
  const [bulkUnlockDate, setBulkUnlockDate] = useState('');
  const queryClient = useQueryClient();

  const { data: enrollments = [] } = useQuery({
    queryKey: ['incubateher-enrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.filter({ role: 'participant' })
  });

  const { data: userAccessLevels = [] } = useQuery({
    queryKey: ['user-access-levels'],
    queryFn: () => base44.entities.UserAccessLevel.filter({ entry_point: 'incubateher_program' })
  });

  const updateAccessMutation = useMutation({
    mutationFn: async ({ userEmail, featureUnlocks }) => {
      const access = userAccessLevels.find(a => a.user_email === userEmail);
      if (access) {
        await base44.entities.UserAccessLevel.update(access.id, { feature_unlocks: featureUnlocks });
      } else {
        await base44.entities.UserAccessLevel.create({
          user_email: userEmail,
          access_level: 'full_platform',
          entry_point: 'incubateher_program',
          feature_unlocks: featureUnlocks
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-access-levels'] });
      toast.success('Access updated successfully');
      setEditingUser(null);
    }
  });

  const bulkUnlockMutation = useMutation({
    mutationFn: async ({ feature, unlockDate }) => {
      const updates = enrollments.map(enrollment => {
        const access = userAccessLevels.find(a => a.user_email === enrollment.participant_email);
        const currentUnlocks = access?.feature_unlocks || {};
        
        return base44.entities.UserAccessLevel[access ? 'update' : 'create'](
          access?.id,
          access ? {
            feature_unlocks: { ...currentUnlocks, [feature]: unlockDate }
          } : {
            user_email: enrollment.participant_email,
            access_level: 'full_platform',
            entry_point: 'incubateher_program',
            feature_unlocks: { [feature]: unlockDate }
          }
        );
      });
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-access-levels'] });
      toast.success('Bulk unlock successful');
      setBulkUnlockDate('');
    }
  });

  const restrictedFeatures = [
    { page: 'AIDocumentReview', label: 'AI Document Review' },
    { page: 'Projects', label: 'Projects' },
    { page: 'Documents', label: 'Documents' },
    { page: 'Opportunities', label: 'Funding Opportunities' },
    { page: 'BoutiqueServices', label: 'Boutique Services' },
    { page: 'Community', label: 'Community Spaces' },
    { page: 'Events', label: 'Events' },
    { page: 'MyMentorship', label: 'My Mentorship' }
  ];

  const handleSaveUser = (userEmail, featureUnlocks) => {
    updateAccessMutation.mutate({ userEmail, featureUnlocks });
  };

  const handleBulkUnlock = (feature) => {
    if (!bulkUnlockDate) {
      toast.error('Please select a date');
      return;
    }
    bulkUnlockMutation.mutate({ feature, unlockDate: bulkUnlockDate });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#143A50] mb-2">IncubateHer Access Control</h1>
          <p className="text-slate-600">Manage feature access and unlock dates for program participants</p>
        </div>

        {/* Bulk Unlock Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bulk Feature Unlock</CardTitle>
            <CardDescription>Set unlock dates for all participants at once</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Select Unlock Date</Label>
                <Input
                  type="datetime-local"
                  value={bulkUnlockDate}
                  onChange={(e) => setBulkUnlockDate(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {restrictedFeatures.map(feature => (
                  <Button
                    key={feature.page}
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkUnlock(feature.page)}
                    disabled={!bulkUnlockDate}
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock {feature.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Participants */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participants ({enrollments.length})
          </h2>

          {enrollments.map(enrollment => {
            const userAccess = userAccessLevels.find(a => a.user_email === enrollment.participant_email);
            const featureUnlocks = userAccess?.feature_unlocks || {};
            const isEditing = editingUser === enrollment.participant_email;

            return (
              <Card key={enrollment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{enrollment.participant_name}</CardTitle>
                      <CardDescription>{enrollment.participant_email}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser(isEditing ? null : enrollment.participant_email)}
                    >
                      {isEditing ? <X className="w-4 h-4" /> : 'Edit Access'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <EditUserAccess
                      userEmail={enrollment.participant_email}
                      featureUnlocks={featureUnlocks}
                      restrictedFeatures={restrictedFeatures}
                      onSave={handleSaveUser}
                      onCancel={() => setEditingUser(null)}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {restrictedFeatures.map(feature => {
                        const unlockDate = featureUnlocks[feature.page];
                        const isUnlocked = unlockDate && new Date(unlockDate) <= new Date();
                        
                        return (
                          <div
                            key={feature.page}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isUnlocked
                                ? 'bg-green-50 border-green-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isUnlocked ? (
                                <Unlock className="w-4 h-4 text-green-600" />
                              ) : (
                                <Lock className="w-4 h-4 text-slate-400" />
                              )}
                              <span className="text-sm font-medium">{feature.label}</span>
                            </div>
                            {unlockDate && (
                              <Badge variant="outline" className="text-xs">
                                {format(new Date(unlockDate), 'MMM d')}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EditUserAccess({ userEmail, featureUnlocks, restrictedFeatures, onSave, onCancel }) {
  const [unlocks, setUnlocks] = useState(featureUnlocks);

  const handleUnlockChange = (page, date) => {
    setUnlocks(prev => ({
      ...prev,
      [page]: date
    }));
  };

  const handleToggle = (page, enabled) => {
    if (enabled) {
      setUnlocks(prev => ({
        ...prev,
        [page]: new Date().toISOString()
      }));
    } else {
      const newUnlocks = { ...unlocks };
      delete newUnlocks[page];
      setUnlocks(newUnlocks);
    }
  };

  return (
    <div className="space-y-4">
      {restrictedFeatures.map(feature => {
        const unlockDate = unlocks[feature.page];
        const isEnabled = !!unlockDate;

        return (
          <div key={feature.page} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3 flex-1">
              <Switch
                checked={isEnabled}
                onCheckedChange={(checked) => handleToggle(feature.page, checked)}
              />
              <Label className="cursor-pointer">{feature.label}</Label>
            </div>
            {isEnabled && (
              <Input
                type="datetime-local"
                value={unlockDate ? format(new Date(unlockDate), "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(e) => handleUnlockChange(feature.page, e.target.value)}
                className="max-w-xs"
              />
            )}
          </div>
        );
      })}
      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSave(userEmail, unlocks)}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}