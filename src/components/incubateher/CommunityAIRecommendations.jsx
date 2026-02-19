import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, MessageSquare, Users, TrendingUp, ArrowRight, RefreshCw, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const MATCH_TYPE_CONFIG = {
  similar_challenge: { label: 'Similar Challenges', icon: Users, color: 'text-blue-600' },
  complementary_skills: { label: 'Complementary Skills', icon: Star, color: 'text-purple-600' },
  shared_goals: { label: 'Shared Goals', icon: TrendingUp, color: 'text-green-600' },
  mutual_learning: { label: 'Mutual Learning', icon: Sparkles, color: 'text-amber-600' }
};

const VALUE_TYPE_CONFIG = {
  expert_insight: { label: 'Expert Insight', color: 'bg-purple-100 text-purple-800' },
  practical_advice: { label: 'Practical Advice', color: 'bg-blue-100 text-blue-800' },
  common_pitfall: { label: 'Common Pitfall', color: 'bg-red-100 text-red-800' },
  success_story: { label: 'Success Story', color: 'bg-green-100 text-green-800' },
  systems_guidance: { label: 'Systems Guidance', color: 'bg-amber-100 text-amber-800' }
};

export default function CommunityAIRecommendations({ userEmail }) {
  const [activeTab, setActiveTab] = useState('discussions');
  const queryClient = useQueryClient();

  const { data: discussionRecs, isLoading: loadingDiscussions, refetch: refetchDiscussions } = useQuery({
    queryKey: ['community-ai-discussions', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('incubateHerCommunityAI', {
        action: 'recommend_discussions',
        participant_email: userEmail
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { data: prompts, isLoading: loadingPrompts, refetch: refetchPrompts } = useQuery({
    queryKey: ['community-ai-prompts', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('incubateHerCommunityAI', {
        action: 'generate_prompts',
        participant_email: userEmail
      });
      return response.data;
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  const { data: valuableDiscussions, isLoading: loadingValuable, refetch: refetchValuable } = useQuery({
    queryKey: ['community-ai-valuable'],
    queryFn: async () => {
      const response = await base44.functions.invoke('incubateHerCommunityAI', {
        action: 'flag_valuable',
        participant_email: userEmail
      });
      return response.data;
    },
    staleTime: 15 * 60 * 1000 // 15 minutes
  });

  const { data: connections, isLoading: loadingConnections, refetch: refetchConnections } = useQuery({
    queryKey: ['community-ai-connections', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('incubateHerCommunityAI', {
        action: 'suggest_connections',
        participant_email: userEmail
      });
      return response.data;
    },
    staleTime: 30 * 60 * 1000 // 30 minutes
  });

  const createDiscussionMutation = useMutation({
    mutationFn: (promptData) => base44.entities.Discussion.create({
      space_id: 'incubateher-program',
      title: promptData.title,
      content: promptData.description,
      author_email: userEmail,
      tags: [promptData.category, 'ai-suggested']
    }),
    onSuccess: () => {
      toast.success('Discussion created!');
      queryClient.invalidateQueries(['recentDiscussions']);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-[#AC1A5B] to-[#A65D40] text-white border-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#E5C089]" />
            <div>
              <CardTitle className="text-2xl">AI-Powered Community Insights</CardTitle>
              <CardDescription className="text-white/80">
                Personalized recommendations to help you connect and grow
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discussions">For You</TabsTrigger>
          <TabsTrigger value="prompts">Start Conversations</TabsTrigger>
          <TabsTrigger value="valuable">Top Insights</TabsTrigger>
          <TabsTrigger value="connections">Connect</TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recommended Discussions for You</CardTitle>
                <Button variant="outline" size="sm" onClick={() => refetchDiscussions()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <CardDescription>
                Based on your progress, goals, and stated challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDiscussions ? (
                <div className="text-center py-8 text-slate-500">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                  Analyzing your profile...
                </div>
              ) : (
                <div className="space-y-4">
                  {discussionRecs?.recommendations?.map((rec, idx) => (
                    <motion.div
                      key={rec.discussion?.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="border-l-4 border-[#AC1A5B]">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{rec.discussion?.title}</CardTitle>
                              <CardDescription className="mt-2">
                                <strong>Why this matters for you:</strong> {rec.reason}
                              </CardDescription>
                            </div>
                            <Badge className="ml-4 bg-[#E5C089] text-[#143A50]">
                              {rec.relevance_score}/10 Match
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Link to={createPageUrl('Discussions', `?id=${rec.discussion?.id}`)}>
                            <Button className="w-full bg-[#AC1A5B] hover:bg-[#A65D40]">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Join Discussion
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Timely Discussion Starters</CardTitle>
                <Button variant="outline" size="sm" onClick={() => refetchPrompts()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Ideas
                </Button>
              </div>
              <CardDescription>
                AI-generated prompts based on where the cohort is right now
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPrompts ? (
                <div className="text-center py-8 text-slate-500">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                  Generating discussion ideas...
                </div>
              ) : (
                <div className="space-y-4">
                  {prompts?.prompts?.map((prompt, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="bg-gradient-to-br from-slate-50 to-blue-50">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-3">
                            <CardTitle className="text-lg">{prompt.title}</CardTitle>
                            <Badge variant="outline">{prompt.target_stage}</Badge>
                          </div>
                          <CardDescription>{prompt.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-3">
                            <Badge className="bg-[#143A50] text-white">{prompt.category.replace(/_/g, ' ')}</Badge>
                            <Button 
                              onClick={() => createDiscussionMutation.mutate(prompt)}
                              disabled={createDiscussionMutation.isPending}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Start This Discussion
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valuable" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>High-Value Discussions</CardTitle>
                <Button variant="outline" size="sm" onClick={() => refetchValuable()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <CardDescription>
                Discussions with expert insights and practical advice
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingValuable ? (
                <div className="text-center py-8 text-slate-500">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                  Identifying valuable insights...
                </div>
              ) : (
                <div className="space-y-4">
                  {valuableDiscussions?.flagged?.map((item, idx) => (
                    <motion.div
                      key={item.discussion?.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="border-l-4 border-amber-500">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Star className="w-5 h-5 text-amber-500" />
                                <CardTitle className="text-lg">{item.discussion?.title}</CardTitle>
                              </div>
                              <Badge className={VALUE_TYPE_CONFIG[item.value_type]?.color || 'bg-slate-100'}>
                                {VALUE_TYPE_CONFIG[item.value_type]?.label}
                              </Badge>
                              <CardDescription className="mt-3">
                                <strong>Key Insight:</strong> "{item.highlight}"
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="ml-4">
                              {item.value_score}/10
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Link to={createPageUrl('Discussions', `?id=${item.discussion?.id}`)}>
                            <Button variant="outline" className="w-full">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Read Full Discussion
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Suggested Connections</CardTitle>
                <Button variant="outline" size="sm" onClick={() => refetchConnections()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Find More
                </Button>
              </div>
              <CardDescription>
                Fellow participants who can help you (and you can help them)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingConnections ? (
                <div className="text-center py-8 text-slate-500">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                  Finding your matches...
                </div>
              ) : (
                <div className="space-y-4">
                  {connections?.connections?.map((conn, idx) => {
                    const config = MATCH_TYPE_CONFIG[conn.match_type] || MATCH_TYPE_CONFIG.mutual_learning;
                    const Icon = config.icon;
                    
                    return (
                      <motion.div
                        key={conn.participant?.email}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="bg-gradient-to-br from-white to-[#E5C089]/10">
                          <CardHeader>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#143A50] flex items-center justify-center text-white font-bold">
                                  {conn.participant?.name?.charAt(0)}
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{conn.participant?.name}</CardTitle>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Icon className={`w-4 h-4 ${config.color}`} />
                                    <span className="text-sm text-slate-600">{config.label}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge className="bg-[#E5C089] text-[#143A50]">
                                {conn.match_score}/10 Match
                              </Badge>
                            </div>
                            <CardDescription className="text-base leading-relaxed">
                              {conn.connection_reason}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button className="w-full bg-[#143A50] hover:bg-[#1E4F58]">
                              <Users className="w-4 h-4 mr-2" />
                              Send Message
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}