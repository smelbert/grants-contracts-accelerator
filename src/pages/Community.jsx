import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Building2, 
  Briefcase, 
  Rocket, 
  GraduationCap, 
  MessageCircle,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AIMemberConnections from '@/components/community/AIMemberConnections';
import AIDiscussionPrompts from '@/components/community/AIDiscussionPrompts';
import SuggestSpaceButton from '@/components/community/SuggestSpaceButton';
import CommunityAIRecommendations from '@/components/incubateher/CommunityAIRecommendations';

const iconMap = {
  Building2,
  Briefcase,
  Rocket,
  GraduationCap,
  MessageCircle,
  Users,
  Target: Sparkles
};

export default function CommunityPage() {
  const [selectedSpace, setSelectedSpace] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ['communitySpaces'],
    queryFn: async () => {
      try {
        const result = await base44.entities.CommunitySpace.filter({ is_active: true }, 'display_order');
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error('Error loading spaces:', error);
        return [];
      }
    },
  });

  const { data: userActivity = [] } = useQuery({
    queryKey: ['userActivity', user?.email],
    queryFn: () => base44.entities.UserActivity.filter(
      { user_email: user.email },
      '-created_date',
      10
    ),
    enabled: !!user,
  });

  const { data: incubateHerEnrollment } = useQuery({
    queryKey: ['incubateher-enrollment', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email,
        role: 'participant'
      });
      return enrollments.find(e => e.cohort_id);
    },
    enabled: !!user?.email
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#143A50]"></div>
      </div>
    );
  }

  const EmptySpacesState = () => (
    <Card className="p-12 text-center border-2 border-dashed border-slate-200">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">No Community Spaces Yet</h3>
      <p className="text-slate-500 text-sm max-w-md mx-auto">
        Community spaces haven't been set up yet. Admins can create spaces from <strong>Admin → Community Spaces Manager</strong>.
      </p>
    </Card>
  );

  const organizationSpaces = spaces.filter(s => 
    ['Building2', 'Briefcase', 'Rocket'].includes(s.icon)
  );
  
  const engagementSpaces = spaces.filter(s => 
    ['GraduationCap', 'MessageCircle'].includes(s.icon)
  );

  const incubateHerSpaces = spaces.filter(s => 
    s.icon === 'Target' || s.slug === 'incubateher-program'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-[#E5C089]/5">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-8 h-8 text-[#E5C089]" />
                <h1 className="text-4xl font-bold">Community Spaces</h1>
              </div>
              <p className="text-lg text-[#E5C089]/80 max-w-2xl">
                Connect with peers, share insights, and grow together in spaces designed for your organization type and learning goals
              </p>
            </div>
            <SuggestSpaceButton />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#E5C089]" />
                <div>
                  <p className="text-2xl font-bold">{spaces.reduce((acc, s) => acc + (s.member_count || 0), 0)}</p>
                  <p className="text-sm text-[#E5C089]/70">Active Members</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[#E5C089]" />
                <div>
                  <p className="text-2xl font-bold">{spaces.reduce((acc, s) => acc + (s.content_count || 0), 0)}</p>
                  <p className="text-sm text-[#E5C089]/70">Discussions</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#E5C089]" />
                <div>
                  <p className="text-2xl font-bold">AI-Powered</p>
                  <p className="text-sm text-[#E5C089]/70">Smart Insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="organization" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="incubateher">IncubateHer Program</TabsTrigger>
            <TabsTrigger value="organization">Organization Types</TabsTrigger>
            <TabsTrigger value="engagement">Learning & Coaching</TabsTrigger>
            <TabsTrigger value="all">All Spaces</TabsTrigger>
          </TabsList>

          {/* IncubateHer Tab */}
          <TabsContent value="incubateher">
            {incubateHerSpaces.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#AC1A5B] to-[#A65D40] text-white rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-8 h-8 text-[#E5C089]" />
                    <h2 className="text-2xl font-bold">IncubateHer Community</h2>
                  </div>
                  <p className="text-white/90 max-w-2xl">
                    Connect with fellow IncubateHer participants, share your progress, ask questions, and build lasting relationships with entrepreneurs on the same journey.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {incubateHerSpaces.map((space, idx) => {
                    const Icon = iconMap[space.icon] || Sparkles;
                    return (
                      <motion.div
                        key={space.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="hover:shadow-xl transition-all border-2 border-[#AC1A5B]/30">
                          <CardHeader>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#AC1A5B] to-[#A65D40] flex items-center justify-center">
                                  <Icon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                  <CardTitle className="text-2xl">{space.space_name}</CardTitle>
                                  <Badge className="bg-[#E5C089] text-[#143A50] mt-2">
                                    {space.visibility === 'members_only' ? 'Members Only' : 'Open'}
                                  </Badge>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-[#AC1A5B]">
                                {space.member_count || 0} members
                              </Badge>
                            </div>
                            <CardDescription className="text-base leading-relaxed">
                              {space.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-3">
                              <Link to={createPageUrl('Discussions', `?space=${space.slug}`)} className="flex-1">
                                <Button className="w-full bg-gradient-to-r from-[#AC1A5B] to-[#A65D40] hover:opacity-90 text-lg py-6">
                                  <MessageSquare className="w-5 h-5 mr-2" />
                                  Enter Community Space
                                  <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                              </Link>
                            </div>
                            <div className="flex items-center justify-around mt-4 pt-4 border-t">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-[#AC1A5B]">{space.content_count || 0}</p>
                                <p className="text-sm text-slate-600">Discussions</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-[#AC1A5B]">{space.member_count || 0}</p>
                                <p className="text-sm text-slate-600">Members</p>
                              </div>
                              <div className="text-center flex items-center gap-1">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                <p className="text-sm text-slate-600">Active</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* AI-Powered Recommendations for IncubateHer */}
                {incubateHerSpaces.length > 0 && incubateHerEnrollment && user && (
                  <CommunityAIRecommendations userEmail={user.email} />
                )}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Sparkles className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">IncubateHer Space Coming Soon</h3>
                <p className="text-slate-500">The IncubateHer community space will be available to program participants.</p>
              </Card>
            )}
          </TabsContent>

          {/* Organization Types Tab */}
          <TabsContent value="organization">
            {organizationSpaces.length === 0 && <EmptySpacesState />}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {organizationSpaces.map((space, idx) => {
                const Icon = iconMap[space.icon] || Users;
                return (
                  <motion.div
                    key={space.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card 
                      className="h-full hover:shadow-xl transition-all cursor-pointer border-2 hover:border-[#143A50]/30"
                      onClick={() => setSelectedSpace(space)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#143A50] to-[#1E4F58] flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <Badge variant="outline" className="text-[#143A50]">
                            {space.member_count || 0} members
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{space.space_name}</CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {space.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link to={createPageUrl('Discussions', `?space=${space.slug}`)}>
                          <Button className="w-full bg-[#143A50] hover:bg-[#1E4F58]">
                            Enter Space
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                        <div className="flex items-center justify-between mt-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {space.content_count || 0} posts
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            Active
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* AI Suggestions for Organization Spaces */}
            {user && organizationSpaces.length > 0 && (
              <AIMemberConnections 
                spaceId={organizationSpaces[0].id}
                currentUserEmail={user.email}
              />
            )}
          </TabsContent>

          {/* Learning & Coaching Tab */}
          <TabsContent value="engagement">
            {engagementSpaces.length === 0 && <EmptySpacesState />}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {engagementSpaces.map((space, idx) => {
                const Icon = iconMap[space.icon] || Users;
                return (
                  <motion.div
                    key={space.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-all border-2 hover:border-[#AC1A5B]/30">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#AC1A5B] to-[#A65D40] flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <Badge className="bg-[#E5C089] text-[#143A50]">
                            {space.visibility === 'members_only' ? 'Members Only' : 'Open'}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{space.space_name}</CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {space.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link to={createPageUrl('Discussions', `?space=${space.slug}`)}>
                          <Button className="w-full bg-gradient-to-r from-[#AC1A5B] to-[#A65D40] hover:opacity-90">
                            Join Conversation
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* AI Discussion Prompts for Learning/Coaching Spaces */}
            {engagementSpaces.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {engagementSpaces.map(space => (
                  <AIDiscussionPrompts 
                    key={space.id}
                    spaceType={space.space_type}
                    spaceName={space.space_name}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Spaces Tab */}
          <TabsContent value="all">
            {spaces.length === 0 && <EmptySpacesState />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaces.map((space, idx) => {
                const Icon = iconMap[space.icon] || Users;
                
                // Determine space color scheme
                let colorScheme = {
                  gradient: 'from-[#143A50] to-[#1E4F58]',
                  badge: 'bg-[#E5C089] text-[#143A50]',
                  border: 'border-[#143A50]/30',
                  button: 'bg-[#143A50] hover:bg-[#1E4F58]'
                };
                
                if (space.icon === 'Target' || space.slug === 'incubateher-program') {
                  colorScheme = {
                    gradient: 'from-[#AC1A5B] to-[#A65D40]',
                    badge: 'bg-[#AC1A5B] text-white',
                    border: 'border-[#AC1A5B]/30',
                    button: 'bg-gradient-to-r from-[#AC1A5B] to-[#A65D40] hover:opacity-90'
                  };
                } else if (['GraduationCap', 'MessageCircle'].includes(space.icon)) {
                  colorScheme = {
                    gradient: 'from-[#AC1A5B] to-[#A65D40]',
                    badge: 'bg-[#E5C089] text-[#143A50]',
                    border: 'border-[#AC1A5B]/30',
                    button: 'bg-gradient-to-r from-[#AC1A5B] to-[#A65D40] hover:opacity-90'
                  };
                }
                
                return (
                  <motion.div
                    key={space.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className={`h-full hover:shadow-xl transition-all border-2 ${colorScheme.border}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorScheme.gradient} flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <Badge className={colorScheme.badge}>
                            {space.member_count || 0}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{space.space_name}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {space.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link to={createPageUrl('Discussions', `?space=${space.slug}`)}>
                          <Button className={`w-full ${colorScheme.button}`}>
                            Enter Space
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                        <div className="flex items-center justify-between mt-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {space.content_count || 0} posts
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            Active
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}