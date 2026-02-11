import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BRAND_COLORS } from './CoBrandedHeader';
import { Trophy, Star, Award, TrendingUp, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GamificationDashboard({ userEmail }) {
  const { data: userBadges = [] } = useQuery({
    queryKey: ['user-badges', userEmail],
    queryFn: async () => {
      return await base44.entities.UserBadge.filter({
        user_email: userEmail,
        program: 'incubateher'
      });
    },
    enabled: !!userEmail
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', userEmail],
    queryFn: async () => {
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: userEmail
      });
      return enrollments[0];
    },
    enabled: !!userEmail
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['all-user-progress', userEmail],
    queryFn: async () => {
      if (!enrollment?.id) return [];
      return await base44.entities.UserProgress.filter({
        enrollment_id: enrollment.id
      });
    },
    enabled: !!enrollment?.id
  });

  const totalPoints = enrollment?.gamification_points || 0;
  const level = Math.floor(totalPoints / 100) + 1;
  const pointsToNextLevel = 100 - (totalPoints % 100);
  const levelProgress = (totalPoints % 100);

  const badgeDefinitions = {
    first_steps: { icon: Star, color: BRAND_COLORS.eisGold, name: 'First Steps', desc: 'Complete your first course' },
    knowledge_seeker: { icon: Award, color: BRAND_COLORS.culRed, name: 'Knowledge Seeker', desc: 'Complete 3 courses' },
    master_learner: { icon: Trophy, color: BRAND_COLORS.eisNavy, name: 'Master Learner', desc: 'Complete all 8 courses' },
    assessment_ace: { icon: Target, color: BRAND_COLORS.eisGold, name: 'Assessment Ace', desc: 'Score 80+ on post-assessment' },
    early_bird: { icon: Zap, color: BRAND_COLORS.culRed, name: 'Early Bird', desc: 'Complete within first week' },
    perfectionist: { icon: Star, color: BRAND_COLORS.eisNavy, name: 'Perfectionist', desc: '100% on all assessments' }
  };

  return (
    <div className="space-y-4">
      {/* Points & Level Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.eisNavy} 0%, ${BRAND_COLORS.culRed} 100%)` }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-8 h-8" style={{ color: BRAND_COLORS.eisGold }} />
                  <div>
                    <p className="text-3xl font-bold">{totalPoints}</p>
                    <p className="text-sm opacity-90">Total Points</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm opacity-90 mb-1">Level {level}</p>
                  <Progress value={levelProgress} className="h-2 w-48 bg-white/20" />
                  <p className="text-xs mt-1 opacity-75">{pointsToNextLevel} points to Level {level + 1}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{level}</p>
                    <p className="text-xs">Level</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: BRAND_COLORS.culRed }}>
            <Award className="w-5 h-5" />
            Badges Earned ({userBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(badgeDefinitions).map(([key, badge]) => {
              const earned = userBadges.some(b => b.badge_type === key);
              const Icon = badge.icon;
              return (
                <motion.div
                  key={key}
                  whileHover={{ scale: earned ? 1.05 : 1 }}
                  className={`p-4 rounded-lg text-center ${earned ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2' : 'bg-gray-50 opacity-50'}`}
                  style={{ borderColor: earned ? badge.color : 'transparent' }}
                >
                  <Icon 
                    className={`w-10 h-10 mx-auto mb-2 ${earned ? '' : 'opacity-30'}`} 
                    style={{ color: earned ? badge.color : '#gray' }}
                  />
                  <p className="font-semibold text-sm" style={{ color: earned ? BRAND_COLORS.neutralDark : '#gray' }}>
                    {badge.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{badge.desc}</p>
                  {earned && (
                    <Badge className="mt-2 text-xs" style={{ backgroundColor: badge.color }}>
                      Earned!
                    </Badge>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progress Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: BRAND_COLORS.eisNavy }}>
            <TrendingUp className="w-5 h-5" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold" style={{ color: BRAND_COLORS.culRed }}>
                {allProgress.filter(p => p.is_completed).length}
              </p>
              <p className="text-sm text-gray-600">Courses Completed</p>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ color: BRAND_COLORS.eisGold }}>
                {allProgress.reduce((sum, p) => sum + (p.completed_sections?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Sections Completed</p>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ color: BRAND_COLORS.eisNavy }}>
                {enrollment?.post_assessment_score || 0}
              </p>
              <p className="text-sm text-gray-600">Assessment Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}