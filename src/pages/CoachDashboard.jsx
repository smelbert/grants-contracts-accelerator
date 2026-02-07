import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, FileText, Users, AlertTriangle, Calendar, 
  CheckCircle2, Clock, TrendingUp, Award, ArrowRight,
  BookOpen, Target, Sparkles
} from 'lucide-react';
import ReviewQueue from '@/components/coach/ReviewQueue';
import AssignedOrganizations from '@/components/coach/AssignedOrganizations';
import OrganizationReviewView from '@/components/coach/OrganizationReviewView';
import AITrainingRecommendations from '@/components/training/AITrainingRecommendations';
import CoachSkillValidation from '@/components/skills/CoachSkillValidation';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CoachDashboard() {
  const [selectedOrg, setSelectedOrg] = useState(null);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: reviewRequests, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviewRequests', user?.email],
    queryFn: () => base44.entities.ReviewRequest.filter({ 
      assigned_coach_id: user?.id,
      status: { $in: ['pending', 'assigned', 'in_review'] }
    }),
    enabled: !!user?.id,
  });

  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['assignedOrganizations', user?.email],
    queryFn: async () => {
      if (!user?.assigned_organization_ids?.length) return [];
      return base44.entities.Organization.filter({
        id: { $in: user.assigned_organization_ids }
      });
    },
    enabled: !!user?.assigned_organization_ids,
  });

  const { data: onboarding } = useQuery({
    queryKey: ['consultant-onboarding', user?.email],
    queryFn: () => base44.entities.ConsultantOnboarding.filter({ consultant_email: user?.email }).then(r => r[0]),
    enabled: !!user?.email,
  });

  const { data: trainings = [] } = useQuery({
    queryKey: ['coach-trainings'],
    queryFn: () => base44.entities.CoachTraining.filter({ is_published: true }),
  });

  const { data: coachProfile } = useQuery({
    queryKey: ['coach-profile', user?.email],
    queryFn: () => base44.entities.CoachProfile.filter({ user_email: user?.email }).then(r => r[0]),
    enabled: !!user?.email,
  });

  const requiredTrainings = trainings.filter(t => t.is_required && t.content_type === 'course');
  const modulesCompleted = onboarding?.modules_completed?.length || 0;
  const trainingProgress = requiredTrainings.length > 0 ? (modulesCompleted / requiredTrainings.length) * 100 : 0;
  
  const daysUntilReview = onboarding?.next_review_date 
    ? Math.ceil((new Date(onboarding.next_review_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (user?.role !== 'coach' && user?.role !== 'owner' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-slate-600">Coach access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedOrg) {
    return (
      <OrganizationReviewView 
        organization={selectedOrg}
        onBack={() => setSelectedOrg(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900">Coach Dashboard</h1>
          <p className="text-slate-600 mt-1">
            {user?.coach_specialization ? `${user.coach_specialization} specialist` : 'Review queue and assignments'}
          </p>
        </motion.div>

        {/* Personalized Dashboard Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Onboarding & Training Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Training Progress Widget */}
            {onboarding && (
              <Card className="border-l-4 border-[#1E4F58] shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-[#1E4F58]" />
                      <div>
                        <CardTitle>Training Progress</CardTitle>
                        <CardDescription>Complete modules to advance your level</CardDescription>
                      </div>
                    </div>
                    <Badge className={`${
                      onboarding.current_level === 'level-1' ? 'bg-green-600' :
                      onboarding.current_level === 'level-2' ? 'bg-blue-600' :
                      'bg-purple-600'
                    }`}>
                      Level {onboarding.current_level?.split('-')[1]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Required Modules</span>
                      <span className="text-sm text-[#1E4F58] font-semibold">{modulesCompleted} / {requiredTrainings.length}</span>
                    </div>
                    <Progress value={trainingProgress} className="h-3" />
                  </div>
                  
                  {onboarding.onboarding_phase !== 'completed' && (
                    <div className="bg-[#E5C089]/10 rounded-lg p-4">
                      <p className="text-sm font-medium text-[#143A50] mb-2">Current Phase: {
                        onboarding.onboarding_phase === 'days_0_30' ? 'Foundation (Days 0-30)' :
                        onboarding.onboarding_phase === 'days_31_60' ? 'Application (Days 31-60)' :
                        'Integration (Days 61-90)'
                      }</p>
                      <p className="text-xs text-slate-600">
                        {onboarding.onboarding_phase === 'days_0_30' && 'Shadow calls, complete Modules 1-3, practice sections'}
                        {onboarding.onboarding_phase === 'days_31_60' && 'Draft real materials, complete Modules 4-5, build budgets'}
                        {onboarding.onboarding_phase === 'days_61_90' && 'Near-final work, Modules 6-7, peer review'}
                      </p>
                    </div>
                  )}

                  <Link to={createPageUrl('ConsultantOnboarding')}>
                    <Button className="w-full bg-[#1E4F58] hover:bg-[#143A50]">
                      View Full Onboarding Roadmap
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Performance Metrics Widget */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-[#AC1A5B]" />
                  <div>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Track your consulting effectiveness</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Drafts Submitted</p>
                    <p className="text-3xl font-bold text-[#143A50]">{onboarding?.drafts_submitted || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Drafts Approved</p>
                    <p className="text-3xl font-bold text-green-600">{onboarding?.drafts_approved || 0}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Pending Reviews</p>
                    <p className="text-3xl font-bold text-blue-600">{reviewRequests?.length || 0}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Funded Proposals</p>
                    <p className="text-3xl font-bold text-purple-600">{onboarding?.funded_proposals_count || 0}</p>
                  </div>
                </div>

                {coachProfile && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Assigned Organizations</span>
                      <span className="text-lg font-bold text-[#1E4F58]">{organizations?.length || 0}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Action Items & Next Steps */}
          <div className="space-y-6">
            {/* Upcoming Review Widget */}
            {onboarding?.next_review_date && (
              <Card className="shadow-lg border-2 border-[#E5C089]">
                <CardHeader className="bg-[#E5C089]/10">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-[#A65D40]" />
                    <div>
                      <CardTitle className="text-lg">Next Review</CardTitle>
                      <CardDescription className="text-xs">Scheduled assessment</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-[#143A50] mb-1">
                      {daysUntilReview !== null && daysUntilReview >= 0 ? daysUntilReview : '—'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {daysUntilReview !== null && daysUntilReview >= 0 ? 'days remaining' : 'Not scheduled'}
                    </p>
                  </div>
                  {daysUntilReview !== null && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-1">Review Date</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(onboarding.next_review_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Next Steps for Promotion Widget */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-[#AC1A5B]" />
                  <div>
                    <CardTitle className="text-lg">Level Advancement</CardTitle>
                    <CardDescription className="text-xs">Next steps for promotion</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {onboarding?.current_level === 'level-1' && (
                  <>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        modulesCompleted >= requiredTrainings.length ? 'text-green-600' : 'text-slate-300'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Complete all modules</p>
                        <p className="text-xs text-slate-600">{modulesCompleted}/{requiredTrainings.length} done</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        (onboarding?.drafts_approved || 0) >= 2 ? 'text-green-600' : 'text-slate-300'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-slate-900">2+ clean drafts</p>
                        <p className="text-xs text-slate-600">{onboarding?.drafts_approved || 0} approved</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        onboarding?.discovery_calls_shadowed >= 2 ? 'text-green-600' : 'text-slate-300'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Shadow discovery calls</p>
                        <p className="text-xs text-slate-600">{onboarding?.discovery_calls_shadowed || 0}/2 calls</p>
                      </div>
                    </div>
                  </>
                )}

                {onboarding?.current_level === 'level-2' && (
                  <>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        (onboarding?.funded_proposals_count || 0) >= 1 ? 'text-green-600' : 'text-slate-300'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Funded proposal</p>
                        <p className="text-xs text-slate-600">{onboarding?.funded_proposals_count || 0} funded</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-slate-300" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Mentor Level 1s</p>
                        <p className="text-xs text-slate-600">Demonstrate leadership</p>
                      </div>
                    </div>
                  </>
                )}

                {onboarding?.current_level === 'level-3' && (
                  <div className="text-center py-4">
                    <Award className="w-12 h-12 text-[#AC1A5B] mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900">Senior Consultant</p>
                    <p className="text-xs text-slate-600">Maximum level achieved</p>
                  </div>
                )}

                {onboarding && onboarding.current_level !== 'level-3' && (
                  <Link to={createPageUrl('ConsultantOnboarding')}>
                    <Button variant="outline" className="w-full mt-2" size="sm">
                      View Full Requirements
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-[#E5C089]" />
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={createPageUrl('CoachTrainingLibrary')}>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Training Library
                  </Button>
                </Link>
                <Link to={createPageUrl('CoachProfile')}>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    My Profile
                  </Button>
                </Link>
                <Link to={createPageUrl('ReviewQueue')}>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Review Queue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Training Recommendations */}
        <div className="mb-8">
          <AITrainingRecommendations consultantEmail={user?.email} />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reviews">Review Queue</TabsTrigger>
            <TabsTrigger value="organizations">My Organizations</TabsTrigger>
            <TabsTrigger value="skills">Skill Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <ReviewQueue 
              reviewRequests={reviewRequests || []} 
              isLoading={reviewsLoading}
            />
          </TabsContent>

          <TabsContent value="organizations">
            <AssignedOrganizations
              organizations={organizations || []}
              isLoading={orgsLoading}
              onSelectOrg={setSelectedOrg}
            />
          </TabsContent>

          <TabsContent value="skills">
            {onboarding ? (
              <CoachSkillValidation consultantEmail={user?.email} />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-slate-600">Complete onboarding to access skill validation</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}