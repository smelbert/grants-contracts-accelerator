import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BRAND_COLORS } from './CoBrandedHeader';
import { Trophy, TrendingUp, Award, Crown, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard({ currentUserEmail }) {
  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: async () => {
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        role: 'participant'
      });
      return enrollments.sort((a, b) => (b.gamification_points || 0) - (a.gamification_points || 0));
    }
  });

  const currentUserRank = allEnrollments.findIndex(e => e.participant_email === currentUserEmail) + 1;
  const topPerformers = allEnrollments.slice(0, 10);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' };
    if (rank === 2) return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
    if (rank === 3) return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' };
    return { bg: 'bg-white', text: 'text-gray-800', border: 'border-gray-200' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: BRAND_COLORS.culRed }}>
          <Trophy className="w-6 h-6" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="points">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="points">
              <TrendingUp className="w-4 h-4 mr-2" />
              Points
            </TabsTrigger>
            <TabsTrigger value="completion">
              <Award className="w-4 h-4 mr-2" />
              Completion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="points">
            {/* Current User Rank */}
            {currentUserRank > 0 && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="mb-4 p-4 rounded-lg border-2"
                style={{ 
                  backgroundColor: BRAND_COLORS.eisGold + '20',
                  borderColor: BRAND_COLORS.eisGold
                }}
              >
                <p className="text-sm font-medium mb-2" style={{ color: BRAND_COLORS.neutralDark }}>
                  Your Rank
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold" style={{ color: BRAND_COLORS.culRed }}>
                      #{currentUserRank}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: BRAND_COLORS.neutralDark }}>You</p>
                      <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                        {allEnrollments[currentUserRank - 1]?.gamification_points || 0} points
                      </p>
                    </div>
                  </div>
                  {getRankIcon(currentUserRank)}
                </div>
              </motion.div>
            )}

            {/* Top 10 */}
            <div className="space-y-2">
              {topPerformers.map((enrollment, idx) => {
                const rank = idx + 1;
                const styles = getRankBadge(rank);
                const isCurrentUser = enrollment.participant_email === currentUserEmail;
                
                return (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-3 rounded-lg border ${styles.border} ${styles.bg} ${isCurrentUser ? 'ring-2 ring-offset-1' : ''}`}
                    style={{ ringColor: isCurrentUser ? BRAND_COLORS.eisGold : undefined }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getRankIcon(rank)}
                          <span className={`text-lg font-bold ${styles.text}`}>#{rank}</span>
                        </div>
                        <div>
                          <p className={`font-medium ${styles.text}`}>
                            {isCurrentUser ? 'You' : enrollment.participant_name || 'Participant'}
                            {isCurrentUser && (
                              <Badge className="ml-2 text-xs" style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                                You
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm opacity-75">{enrollment.gamification_points || 0} points</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="completion">
            <div className="space-y-2">
              {allEnrollments
                .sort((a, b) => {
                  const aCompleted = (a.courses_completed || 0) + (a.workbook_completed ? 1 : 0) + (a.consultation_completed ? 1 : 0);
                  const bCompleted = (b.courses_completed || 0) + (b.workbook_completed ? 1 : 0) + (b.consultation_completed ? 1 : 0);
                  return bCompleted - aCompleted;
                })
                .slice(0, 10)
                .map((enrollment, idx) => {
                  const rank = idx + 1;
                  const styles = getRankBadge(rank);
                  const isCurrentUser = enrollment.participant_email === currentUserEmail;
                  const completed = (enrollment.courses_completed || 0) + (enrollment.workbook_completed ? 1 : 0) + (enrollment.consultation_completed ? 1 : 0);
                  
                  return (
                    <motion.div
                      key={enrollment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-3 rounded-lg border ${styles.border} ${styles.bg} ${isCurrentUser ? 'ring-2 ring-offset-1' : ''}`}
                      style={{ ringColor: isCurrentUser ? BRAND_COLORS.eisGold : undefined }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getRankIcon(rank)}
                            <span className={`text-lg font-bold ${styles.text}`}>#{rank}</span>
                          </div>
                          <div>
                            <p className={`font-medium ${styles.text}`}>
                              {isCurrentUser ? 'You' : enrollment.participant_name || 'Participant'}
                            </p>
                            <p className="text-sm opacity-75">{completed} completed</p>
                          </div>
                        </div>
                        <Award className="w-5 h-5 opacity-50" />
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}