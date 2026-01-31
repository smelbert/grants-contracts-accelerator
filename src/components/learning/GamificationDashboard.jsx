import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Star, Award, TrendingUp, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const BADGE_CONFIG = {
  first_module: { name: 'First Steps', icon: '🎯', color: 'bg-blue-100 text-blue-800' },
  perfect_score: { name: 'Perfect Score', icon: '💯', color: 'bg-purple-100 text-purple-800' },
  week_streak: { name: '7 Day Streak', icon: '🔥', color: 'bg-orange-100 text-orange-800' },
  month_streak: { name: '30 Day Streak', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
  master_100_cards: { name: 'Flashcard Master', icon: '🧠', color: 'bg-indigo-100 text-indigo-800' },
  complete_5_modules: { name: '5 Modules Done', icon: '📚', color: 'bg-emerald-100 text-emerald-800' },
  complete_10_modules: { name: '10 Modules Done', icon: '🏆', color: 'bg-amber-100 text-amber-800' },
  speed_learner: { name: 'Speed Learner', icon: '⚡', color: 'bg-cyan-100 text-cyan-800' },
  grant_expert: { name: 'Grant Expert', icon: '💰', color: 'bg-green-100 text-green-800' },
  contract_specialist: { name: 'Contract Pro', icon: '📝', color: 'bg-blue-100 text-blue-800' },
  donor_relations_pro: { name: 'Donor Relations Pro', icon: '❤️', color: 'bg-rose-100 text-rose-800' }
};

export default function GamificationDashboard({ userEmail }) {
  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', userEmail],
    queryFn: () => base44.entities.UserBadge.filter({ user_email: userEmail }, '-earned_date'),
    enabled: !!userEmail,
  });

  const { data: streak } = useQuery({
    queryKey: ['learning-streak', userEmail],
    queryFn: () => base44.entities.LearningStreak.filter({ user_email: userEmail }).then(res => res[0]),
    enabled: !!userEmail,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['user-progress-all', userEmail],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: userEmail }),
    enabled: !!userEmail,
  });

  const completedModules = progress.filter(p => p.completed).length;
  const totalPoints = streak?.total_points || 0;
  const level = streak?.level || 1;
  const pointsToNextLevel = level * 100;
  const levelProgress = (totalPoints % 100);

  return (
    <div className="space-y-6">
      {/* Level and Points */}
      <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Your Level</p>
              <p className="text-4xl font-bold">Level {level}</p>
            </div>
            <Trophy className="w-16 h-16 opacity-80" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{totalPoints} points</span>
              <span>{pointsToNextLevel} to next level</span>
            </div>
            <Progress value={levelProgress} className="h-3 bg-white/20" />
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-600" />
            Learning Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-3xl font-bold text-orange-600">{streak?.current_streak || 0}</p>
              <p className="text-sm text-slate-600">Current Streak</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-3xl font-bold text-amber-600">{streak?.longest_streak || 0}</p>
              <p className="text-sm text-slate-600">Longest Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Badges Earned ({badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <p className="text-center text-slate-500 py-6">
              Complete modules and activities to earn badges!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge, idx) => {
                const config = BADGE_CONFIG[badge.badge_type] || {};
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Badge className={`${config.color} w-full justify-center py-2 text-sm`}>
                      <span className="mr-2">{config.icon}</span>
                      {config.name}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Modules Completed</span>
            <Badge variant="outline">{completedModules}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Total Points</span>
            <Badge variant="outline">{totalPoints}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Average Score</span>
            <Badge variant="outline">
              {progress.length > 0
                ? Math.round(
                    progress.reduce((acc, p) => {
                      const avgScore = p.quiz_scores?.length > 0
                        ? p.quiz_scores.reduce((sum, s) => sum + s.score, 0) / p.quiz_scores.length
                        : 0;
                      return acc + avgScore;
                    }, 0) / progress.length
                  ) + '%'
                : 'N/A'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}