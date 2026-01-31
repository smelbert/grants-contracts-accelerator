import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard({ userEmail }) {
  const { data: allStreaks = [] } = useQuery({
    queryKey: ['all-learning-streaks'],
    queryFn: () => base44.entities.LearningStreak.list('-total_points', 10),
  });

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-700" />;
    return <Star className="w-5 h-5 text-slate-400" />;
  };

  const getRankColor = (index) => {
    if (index === 0) return 'bg-yellow-50 border-yellow-300';
    if (index === 1) return 'bg-gray-50 border-gray-300';
    if (index === 2) return 'bg-amber-50 border-amber-300';
    return 'bg-white border-slate-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Leaderboard - Top Learners
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allStreaks.length === 0 ? (
          <p className="text-center text-slate-500 py-6">
            Be the first to start learning!
          </p>
        ) : (
          <div className="space-y-3">
            {allStreaks.map((streak, index) => {
              const isCurrentUser = streak.user_email === userEmail;
              return (
                <motion.div
                  key={streak.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 ${getRankColor(index)} ${
                    isCurrentUser ? 'ring-2 ring-blue-400' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {streak.user_email.split('@')[0]}
                      {isCurrentUser && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">You</Badge>
                      )}
                    </p>
                    <p className="text-sm text-slate-600">
                      Level {streak.level} • {streak.current_streak} day streak
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{streak.total_points}</p>
                    <p className="text-xs text-slate-500">points</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}