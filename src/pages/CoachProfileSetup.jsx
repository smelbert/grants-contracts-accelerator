import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Sparkles, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const FUNDING_LANES = ['grants', 'contracts', 'donors', 'public_funds'];
const ORG_TYPES = ['nonprofit', 'for_profit', 'solopreneur', 'community_based'];

export default function CoachProfileSetupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [completed, setCompleted] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [formData, setFormData] = useState({
    coach_expertise_areas: [],
    coach_funding_lanes: [],
    coach_org_types_served: [],
    coach_experience_level: 'intermediate',
    coach_teaching_style: ''
  });

  const [expertiseInput, setExpertiseInput] = useState('');

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe({ role: 'coach', ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      setCompleted(true);
      setTimeout(() => navigate(createPageUrl('Home')), 2000);
    },
  });

  const handleAddExpertise = () => {
    if (expertiseInput.trim() && !formData.coach_expertise_areas.includes(expertiseInput.trim())) {
      setFormData({
        ...formData,
        coach_expertise_areas: [...formData.coach_expertise_areas, expertiseInput.trim()]
      });
      setExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (area) => {
    setFormData({
      ...formData,
      coach_expertise_areas: formData.coach_expertise_areas.filter(a => a !== area)
    });
  };

  const toggleFundingLane = (lane) => {
    const current = formData.coach_funding_lanes;
    setFormData({
      ...formData,
      coach_funding_lanes: current.includes(lane)
        ? current.filter(l => l !== lane)
        : [...current, lane]
    });
  };

  const toggleOrgType = (type) => {
    const current = formData.coach_org_types_served;
    setFormData({
      ...formData,
      coach_org_types_served: current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type]
    });
  };

  const handleSubmit = () => {
    updateProfileMutation.mutate(formData);
  };

  const isFormValid = formData.coach_funding_lanes.length > 0 && 
                       formData.coach_org_types_served.length > 0 &&
                       formData.coach_teaching_style.trim().length > 0;

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Complete!</h2>
          <p className="text-slate-600">Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Coach Profile Setup</h1>
          <p className="text-slate-600">Help us understand your expertise so we can connect you with the right organizations</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Coaching Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Expertise Areas */}
              <div className="space-y-3">
                <Label>Areas of Expertise</Label>
                <div className="flex gap-2">
                  <Input
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddExpertise()}
                    placeholder="e.g., Grant Writing, Budget Development"
                  />
                  <Button onClick={handleAddExpertise} variant="outline">Add</Button>
                </div>
                {formData.coach_expertise_areas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.coach_expertise_areas.map((area) => (
                      <Badge key={area} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveExpertise(area)}>
                        {area} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Funding Lanes */}
              <div className="space-y-3">
                <Label>Funding Lanes You Support *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {FUNDING_LANES.map((lane) => (
                    <div key={lane} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.coach_funding_lanes.includes(lane)}
                        onCheckedChange={() => toggleFundingLane(lane)}
                      />
                      <label className="text-sm capitalize cursor-pointer" onClick={() => toggleFundingLane(lane)}>
                        {lane.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organization Types */}
              <div className="space-y-3">
                <Label>Organization Types You Serve *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {ORG_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.coach_org_types_served.includes(type)}
                        onCheckedChange={() => toggleOrgType(type)}
                      />
                      <label className="text-sm capitalize cursor-pointer" onClick={() => toggleOrgType(type)}>
                        {type.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-3">
                <Label>Experience Level</Label>
                <Select value={formData.coach_experience_level} onValueChange={(v) => setFormData({ ...formData, coach_experience_level: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (1-3 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (3-7 years)</SelectItem>
                    <SelectItem value="expert">Expert (7+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Teaching Style */}
              <div className="space-y-3">
                <Label>Teaching Style & Philosophy *</Label>
                <Textarea
                  value={formData.coach_teaching_style}
                  onChange={(e) => setFormData({ ...formData, coach_teaching_style: e.target.value })}
                  placeholder="Describe your approach to coaching and teaching organizations..."
                  className="min-h-[120px]"
                />
              </div>

              {/* Ethical Commitment */}
              <Alert className="bg-emerald-50 border-emerald-200">
                <Shield className="w-4 h-4 text-emerald-600" />
                <AlertDescription className="text-sm text-slate-700">
                  <strong>Coach Ethics Commitment:</strong> As a coach, you agree to teach readiness before funding, 
                  protect users from premature applications, never promise funding, and prioritize long-term capacity 
                  building over quick wins.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleSubmit} 
                disabled={!isFormValid || updateProfileMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Complete Profile Setup'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}