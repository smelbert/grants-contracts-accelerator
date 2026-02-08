import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, Circle, Clock, Award, BookOpen, 
  Users, TrendingUp, Calendar, Loader2, Star, Target
} from 'lucide-react';
import ConsultantSkillsSection from '@/components/skills/ConsultantSkillsSection';
import CompetencyGateTracker from '@/components/training/CompetencyGateTracker';
import LiveSessionsCalendar from '@/components/training/LiveSessionsCalendar';
import AssessmentCenter from '@/components/training/AssessmentCenter';

const ONBOARDING_PHASES = {
  days_0_30: {
    label: 'Days 0-30: Foundation',
    description: 'Review Training Manual, Complete Modules 1-3, Shadow discovery calls',
    tasks: [
      'Review Training Manual',
      'Complete Module 1: Funding Ecosystem',
      'Complete Module 2: EIS Voice & Standards',
      'Complete Module 3: Discovery & Pitches',
      'Shadow 2+ discovery calls',
      'Draft sample sections',
      'Receive structured feedback'
    ]
  },
  days_31_60: {
    label: 'Days 31-60: Application',
    description: 'Complete Modules 4-5, Draft real client materials (supervised)',
    tasks: [
      'Complete Module 4: Grant Writing Fundamentals',
      'Complete Module 5: Contracts & RFPs',
      'Draft real client materials (supervised)',
      'Participate in internal reviews',
      'Begin budget exposure',
      'Submit 2+ clean drafts'
    ]
  },
  days_61_90: {
    label: 'Days 61-90: Integration',
    description: 'Complete Modules 6-7, Draft near-final work, Peer review',
    tasks: [
      'Complete Module 6: Budgeting',
      'Complete Module 7: Quality Control',
      'Draft near-final work independently',
      'Participate in peer review',
      'Eligibility for Level 2 consideration',
      'Final assessment'
    ]
  }
};

const LEVEL_PERMISSIONS = {
  'level-1': {
    label: 'Level 1: Foundation Consultant',
    color: 'green',
    permissions: [
      { allowed: true, text: 'Use templates' },
      { allowed: true, text: 'Draft assigned sections' },
      { allowed: true, text: 'Follow guidance precisely' },
      { allowed: false, text: 'Lead pitches' },
      { allowed: false, text: 'Submit final drafts' },
      { allowed: false, text: 'Communicate directly with funders' }
    ]
  },
  'level-2': {
    label: 'Level 2: Intermediate Consultant',
    color: 'blue',
    permissions: [
      { allowed: true, text: 'Draft full proposals with review' },
      { allowed: true, text: 'Support budgets and scopes' },
      { allowed: true, text: 'Communicate with clients (copied)' },
      { allowed: true, text: 'Independent problem-solving' },
      { allowed: true, text: 'Mentor Level 1 consultants' },
      { allowed: false, text: 'Submit without review' }
    ]
  },
  'level-3': {
    label: 'Level 3: Senior Consultant',
    color: 'purple',
    permissions: [
      { allowed: true, text: 'Lead strategy' },
      { allowed: true, text: 'QA others\' work' },
      { allowed: true, text: 'Train and mentor consultants' },
      { allowed: true, text: 'Support pricing and scope decisions' },
      { allowed: true, text: 'Final review authority' },
      { allowed: true, text: 'Client-facing leadership' }
    ]
  }
};

export default function ConsultantOnboardingPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: onboarding, isLoading } = useQuery({
    queryKey: ['consultant-onboarding', user?.email],
    queryFn: () => base44.entities.ConsultantOnboarding.filter({ consultant_email: user?.email }).then(r => r[0]),
    enabled: !!user?.email,
  });

  const { data: trainings = [] } = useQuery({
    queryKey: ['coach-trainings'],
    queryFn: () => base44.entities.CoachTraining.filter({ is_published: true }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E4F58]" />
      </div>
    );
  }

  const currentLevel = onboarding?.current_level || 'level-1';
  const currentPhase = onboarding?.onboarding_phase || 'days_0_30';
  const levelConfig = LEVEL_PERMISSIONS[currentLevel];
  const phaseConfig = ONBOARDING_PHASES[currentPhase];

  const modulesCompleted = onboarding?.modules_completed?.length || 0;
  const totalRequiredModules = trainings.filter(t => t.is_required && t.content_type === 'course').length;
  const progressPercentage = totalRequiredModules > 0 ? (modulesCompleted / totalRequiredModules) * 100 : 0;

  const daysElapsed = onboarding?.start_date 
    ? Math.floor((new Date() - new Date(onboarding.start_date)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#143A50] mb-2">30-60-90 Day Onboarding</h1>
          <p className="text-slate-600">Your journey to becoming a trusted EIS consultant</p>
        </div>

        {/* Current Level & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className={`border-2 border-${levelConfig.color}-200 bg-${levelConfig.color}-50/30`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-full bg-${levelConfig.color}-600 text-white flex items-center justify-center font-bold`}>
                  {currentLevel.split('-')[1]}
                </div>
                <div>
                  <p className="text-sm text-slate-600">Current Level</p>
                  <p className="font-bold text-[#143A50]">{levelConfig.label.split(':')[1]}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-12 h-12 text-[#1E4F58]" />
                <div>
                  <p className="text-sm text-slate-600">Days Elapsed</p>
                  <p className="font-bold text-[#143A50] text-2xl">{daysElapsed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-12 h-12 text-[#AC1A5B]" />
                <div>
                  <p className="text-sm text-slate-600">Progress</p>
                  <p className="font-bold text-[#143A50] text-2xl">{Math.round(progressPercentage)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="roadmap" className="space-y-6">
          <TabsList>
            <TabsTrigger value="roadmap">Onboarding Roadmap</TabsTrigger>
            <TabsTrigger value="promotion">Promotion Requirements</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
            <TabsTrigger value="permissions">Level Permissions</TabsTrigger>
            <TabsTrigger value="stats">My Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="roadmap" className="space-y-6">
            {/* Phase Cards */}
            {Object.entries(ONBOARDING_PHASES).map(([phase, config], idx) => {
              const isActive = phase === currentPhase;
              const isCompleted = ['days_0_30', 'days_31_60'].indexOf(phase) < ['days_0_30', 'days_31_60', 'days_61_90'].indexOf(currentPhase);

              return (
                <Card key={phase} className={`${isActive ? 'border-2 border-[#1E4F58] shadow-lg' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-600' : isActive ? 'bg-[#1E4F58]' : 'bg-slate-200'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          ) : (
                            <span className="text-white font-bold">{idx + 1}</span>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-xl text-[#143A50]">{config.label}</CardTitle>
                          <CardDescription className="mt-1">{config.description}</CardDescription>
                        </div>
                      </div>
                      {isActive && (
                        <Badge className="bg-[#1E4F58]">Active</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {config.tasks.map((task, taskIdx) => (
                        <li key={taskIdx} className="flex items-start gap-3 text-sm">
                          <Circle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="promotion">
            <CompetencyGateTracker 
              consultantEmail={user?.email} 
              currentLevel={currentLevel}
            />
          </TabsContent>

          <TabsContent value="skills">
            <ConsultantSkillsSection consultantEmail={user?.email} />
          </TabsContent>

          <TabsContent value="assessments">
            <AssessmentCenter 
              consultantEmail={user?.email}
              currentLevel={currentLevel}
            />
          </TabsContent>

          <TabsContent value="sessions">
            <LiveSessionsCalendar 
              consultantEmail={user?.email}
              currentLevel={currentLevel}
            />
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle className={`text-${levelConfig.color}-700`}>{levelConfig.label}</CardTitle>
                <CardDescription>What you can and cannot do at your current level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {levelConfig.permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                      {perm.allowed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={perm.allowed ? 'text-slate-900' : 'text-slate-500'}>
                        {perm.text}
                      </span>
                    </div>
                  ))}
                </div>

                {currentLevel === 'level-1' && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Path to Level 2</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• Complete all required modules (Modules 1-7)</li>
                      <li>• Submit 2+ clean drafts with positive review feedback</li>
                      <li>• Demonstrate understanding of EIS standards</li>
                    </ul>
                  </div>
                )}

                {currentLevel === 'level-2' && (
                  <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Path to Level 3</h4>
                    <ul className="space-y-1 text-sm text-purple-800">
                      <li>• Independently draft funded proposal or approved contract</li>
                      <li>• Mentor Level 1 consultants successfully</li>
                      <li>• Demonstrate strategic leadership capabilities</li>
                      <li>• Trusted with final review authority</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Training Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Modules Completed</span>
                      <span className="text-sm font-medium">{modulesCompleted} / {totalRequiredModules}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Worksheets Completed</span>
                      <span className="text-sm font-medium">{onboarding?.worksheets_completed?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Practical Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Discovery Calls Shadowed</span>
                    <span className="font-medium">{onboarding?.discovery_calls_shadowed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Drafts Submitted</span>
                    <span className="font-medium">{onboarding?.drafts_submitted || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Drafts Approved</span>
                    <span className="font-medium text-green-600">{onboarding?.drafts_approved || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Funded Proposals</span>
                    <span className="font-medium text-[#AC1A5B]">{onboarding?.funded_proposals_count || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {onboarding?.next_review_date && (
              <Card className="mt-6 bg-[#E5C089]/10 border-[#E5C089]">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-[#A65D40]" />
                    <div>
                      <p className="font-semibold text-[#143A50]">Next Review Scheduled</p>
                      <p className="text-sm text-slate-600">
                        {new Date(onboarding.next_review_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}