import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award, 
  Trophy,
  Target,
  Lock,
  Play,
  Sparkles,
  FileText,
  Video,
  Download
} from 'lucide-react';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { createPageUrl } from '@/utils';

export default function IncubateHerLearning() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: cohort } = useQuery({
    queryKey: ['incubateher-cohort'],
    queryFn: async () => {
      const cohorts = await base44.entities.ProgramCohort.filter({
        program_code: 'incubateher_funding_readiness'
      });
      return cohorts[0];
    }
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', user?.email, cohort?.id],
    queryFn: async () => {
      if (!user?.email || !cohort?.id) return null;
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email,
        cohort_id: cohort.id
      });
      return enrollments[0];
    },
    enabled: !!user?.email && !!cohort?.id
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ['incubateher-courses'],
    queryFn: async () => {
      const content = await base44.entities.LearningContent.filter({
        incubateher_only: true
      });
      return content.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', enrollment?.id],
    queryFn: async () => {
      if (!enrollment?.id) return [];
      return await base44.entities.UserProgress.filter({
        enrollment_id: enrollment.id
      });
    },
    enabled: !!enrollment?.id
  });

  const { data: badges } = useQuery({
    queryKey: ['user-badges', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.UserBadge.filter({
        user_email: user.email,
        program: 'incubateher'
      });
    },
    enabled: !!user?.email
  });

  if (!enrollment) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
        <CoBrandedHeader title="IncubateHer Learning Hub" />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card className="text-center">
            <CardContent className="py-12">
              <Lock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4" style={{ color: BRAND_COLORS.culRed }}>
                Enrollment Required
              </h2>
              <p className="text-slate-600 mb-6">
                This learning hub is exclusive to IncubateHer program participants.
              </p>
              <Button asChild style={{ backgroundColor: BRAND_COLORS.culRed, color: 'white' }}>
                <a href={createPageUrl('IncubateHerSchedule')}>
                  Enroll in IncubateHer
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <CoBrandedFooter />
      </div>
    );
  }

  const completedCourses = userProgress?.filter(p => p.is_completed) || [];
  const totalCourses = courses?.length || 0;
  const completionPercent = totalCourses > 0 ? Math.round((completedCourses.length / totalCourses) * 100) : 0;
  const totalPoints = enrollment?.gamification_points || 0;

  const getCourseProgress = (courseId) => {
    return userProgress?.find(p => p.content_id === courseId);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
      <CoBrandedHeader 
        title="IncubateHer Learning Hub"
        subtitle="Your path to funding readiness mastery"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card style={{ borderColor: BRAND_COLORS.culRed, borderWidth: 2 }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8" style={{ color: BRAND_COLORS.eisGold }} />
                <span className="text-3xl font-bold" style={{ color: BRAND_COLORS.culRed }}>
                  {totalPoints}
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: BRAND_COLORS.eisNavy }}>
                Total Points Earned
              </p>
            </CardContent>
          </Card>

          <Card style={{ borderColor: BRAND_COLORS.eisGold, borderWidth: 2 }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8" style={{ color: BRAND_COLORS.eisGold }} />
                <span className="text-3xl font-bold" style={{ color: BRAND_COLORS.eisGold }}>
                  {completedCourses.length}/{totalCourses}
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: BRAND_COLORS.eisNavy }}>
                Courses Completed
              </p>
              <Progress value={completionPercent} className="mt-2" />
            </CardContent>
          </Card>

          <Card style={{ borderColor: BRAND_COLORS.eisNavy, borderWidth: 2 }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8" style={{ color: BRAND_COLORS.eisNavy }} />
                <span className="text-3xl font-bold" style={{ color: BRAND_COLORS.eisNavy }}>
                  {badges?.length || 0}
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: BRAND_COLORS.eisNavy }}>
                Badges Earned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gamification Notice */}
        <Card className="mb-8" style={{ backgroundColor: BRAND_COLORS.eisGold + '15', borderColor: BRAND_COLORS.eisGold }}>
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 flex-shrink-0" style={{ color: BRAND_COLORS.eisGold }} />
              <div>
                <h3 className="font-semibold mb-2" style={{ color: BRAND_COLORS.neutralDark }}>
                  How to Earn Points & Badges
                </h3>
                <ul className="space-y-1 text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                  <li>• Complete each course section: <strong>+10 points</strong></li>
                  <li>• Complete a full course: <strong>+50 bonus points</strong></li>
                  <li>• Unlock special badges at milestones (1, 3, and 6 courses completed)</li>
                  <li>• Complete all courses to be eligible for the program giveaway</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Curriculum */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" style={{ color: BRAND_COLORS.culRed }}>
              <BookOpen className="w-6 h-6 inline mr-2" />
              Program Curriculum
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Work through each module at your own pace. All content is available immediately.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12 text-slate-500">
                  Loading courses...
                </div>
              ) : courses && courses.length > 0 ? (
                courses.map((course, index) => {
                  const progress = getCourseProgress(course.id);
                  const isCompleted = progress?.is_completed;
                  const progressPercent = progress?.progress_percentage || 0;

                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-6">
                            {/* Course Number Badge */}
                            <div 
                              className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold"
                              style={{ 
                                backgroundColor: isCompleted ? BRAND_COLORS.eisGold : BRAND_COLORS.neutralLight,
                                color: isCompleted ? 'white' : BRAND_COLORS.eisNavy
                              }}
                            >
                              {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : (index + 1)}
                            </div>

                            {/* Course Info */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-xl font-semibold mb-1" style={{ color: BRAND_COLORS.culRed }}>
                                    {course.title}
                                  </h3>
                                  <p className="text-sm mb-3" style={{ color: BRAND_COLORS.eisNavy }}>
                                    {course.description}
                                  </p>
                                  <div className="flex items-center gap-4 mb-3 flex-wrap">
                                    <Badge style={{ backgroundColor: BRAND_COLORS.eisGold, color: 'white' }}>
                                      {course.funding_lane}
                                    </Badge>
                                    {course.duration_minutes && (
                                      <div className="flex items-center gap-1 text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                                        <Clock className="w-4 h-4" />
                                        {course.duration_minutes} min
                                      </div>
                                    )}
                                    {course.curriculum_sections && (
                                      <div className="flex items-center gap-1 text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                                        <Target className="w-4 h-4" />
                                        {course.curriculum_sections.length} sections
                                      </div>
                                    )}
                                    {course.handouts && course.handouts.length > 0 && (
                                      <div className="flex items-center gap-1 text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                                        <FileText className="w-4 h-4" />
                                        {course.handouts.length} handouts
                                      </div>
                                    )}
                                    {course.curriculum_sections?.some(s => s.video_url || s.presentation_url) && (
                                      <div className="flex items-center gap-1 text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                                        <Video className="w-4 h-4" />
                                        Media included
                                      </div>
                                    )}
                                  </div>
                                  {progress && (
                                    <div className="mb-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium" style={{ color: BRAND_COLORS.eisNavy }}>
                                          Progress
                                        </span>
                                        <span className="text-xs font-bold" style={{ color: BRAND_COLORS.eisGold }}>
                                          {progressPercent}%
                                        </span>
                                      </div>
                                      <Progress value={progressPercent} className="h-2" />
                                    </div>
                                  )}

                                  {/* Quick Access to Resources */}
                                  {(course.handouts?.length > 0 || course.curriculum_sections?.some(s => s.video_url || s.presentation_url)) && (
                                    <div className="flex gap-2 mb-3 flex-wrap">
                                      {course.handouts?.slice(0, 3).map((handout, idx) => (
                                        <a 
                                          key={idx}
                                          href={handout.file_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium hover:opacity-80 transition-opacity"
                                          style={{ backgroundColor: BRAND_COLORS.neutralLight, color: BRAND_COLORS.eisNavy }}
                                        >
                                          <Download className="w-3 h-3" />
                                          {handout.title.length > 20 ? handout.title.substring(0, 20) + '...' : handout.title}
                                        </a>
                                      ))}
                                      {course.handouts?.length > 3 && (
                                        <span className="inline-flex items-center px-3 py-1 text-xs" style={{ color: BRAND_COLORS.eisNavy }}>
                                          +{course.handouts.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                asChild
                                style={{ 
                                  backgroundColor: isCompleted ? BRAND_COLORS.eisGold : BRAND_COLORS.culRed,
                                  color: 'white'
                                }}
                                className="hover:opacity-90"
                              >
                                <a href={createPageUrl('IncubateHerCourse') + '?id=' + course.id + '&from=learning'}>
                                  <Play className="w-4 h-4 mr-2" />
                                  {isCompleted ? 'Review Course' : progressPercent > 0 ? 'Continue Learning' : 'Start Course'}
                                </a>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-500">
                  No courses available yet. Check back soon!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completion Status */}
        {completionPercent === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8"
          >
            <Card style={{ backgroundColor: BRAND_COLORS.eisGold + '20', borderColor: BRAND_COLORS.eisGold, borderWidth: 2 }}>
              <CardContent className="py-8 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.eisGold }} />
                <h2 className="text-2xl font-bold mb-2" style={{ color: BRAND_COLORS.culRed }}>
                  🎉 Congratulations!
                </h2>
                <p className="text-lg mb-4" style={{ color: BRAND_COLORS.eisNavy }}>
                  You've completed all IncubateHer courses and earned your certificate!
                </p>
                <Button asChild size="lg" style={{ backgroundColor: BRAND_COLORS.culRed, color: 'white' }}>
                  <a href={createPageUrl('IncubateHerCompletion')}>
                    View Certificate & Giveaway Status
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <CoBrandedFooter />
    </div>
  );
}