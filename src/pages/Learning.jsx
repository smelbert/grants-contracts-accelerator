import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, Search, BookOpen, Video, Users, FileText, Sparkles, MessageSquare, TrendingUp, Clock, Award, CheckCircle2 } from 'lucide-react';
import LearningCard from '@/components/learning/LearningCard';
import AILearningRecommendations from '@/components/ai/AILearningRecommendations';
import AIContentRecommendations from '@/components/learning/AIContentRecommendations';
import LearningRequestForm from '@/components/learning/LearningRequestForm';
import MyLearningRequests from '@/components/learning/MyLearningRequests';

const CONTENT_TYPES = [
  { value: 'all', label: 'All Types', icon: BookOpen },
  { value: 'course', label: 'Courses', icon: BookOpen },
  { value: 'webinar', label: 'Webinars', icon: Video },
  { value: 'workshop', label: 'Workshops', icon: Users },
];

export default function LearningPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLane, setSelectedLane] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: enrollment } = useQuery({
    queryKey: ['incubateher-enrollment', user?.email],
    queryFn: async () => {
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email,
        role: 'participant'
      });
      return enrollments.find(e => e.cohort_id);
    },
    enabled: !!user?.email
  });

  const { data: learningContent, isLoading } = useQuery({
    queryKey: ['learning'],
    queryFn: async () => {
      const allContent = await base44.entities.LearningContent.list();
      // Filter out standalone resources (they belong in Resource Library)
      // Also filter out IncubateHer-only content if user is not enrolled
      let filtered = allContent.filter(c => !c.is_standalone_resource);
      if (!enrollment) {
        filtered = filtered.filter(c => !c.incubateher_only);
      }
      return filtered;
    },
    enabled: !!user
  });

  const { data: curatedPaths = [] } = useQuery({
    queryKey: ['curated-paths'],
    queryFn: () => base44.entities.CuratedPath.filter({ is_active: true }),
  });

  const { data: recentlyViewed = [] } = useQuery({
    queryKey: ['recently-viewed', user?.email],
    queryFn: () => base44.entities.RecentlyViewed.filter({ user_email: user?.email }, '-last_viewed', 5),
    enabled: !!user?.email,
  });

  const organization = organizations?.[0];

  // Track recently viewed
  const trackViewMutation = useMutation({
    mutationFn: async (contentId) => {
      const existing = recentlyViewed.find(rv => rv.learning_content_id === contentId);
      if (existing) {
        return base44.entities.RecentlyViewed.update(existing.id, {
          last_viewed: new Date().toISOString()
        });
      }
      return base44.entities.RecentlyViewed.create({
        user_email: user.email,
        learning_content_id: contentId,
        last_viewed: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recently-viewed'] });
    }
  });

  // Separate content for Browse All (exclude program-specific courses)
  const browseContent = (learningContent || []).filter(c => !c.incubateher_only);
  
  const filteredContent = browseContent.filter(content => {
    const matchesSearch = !searchQuery || 
      content.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLane = selectedLane === 'all' || content.funding_lane === selectedLane;
    const matchesType = selectedType === 'all' || content.content_type === selectedType;
    
    const matchesDuration = durationFilter === 'all' || 
      (durationFilter === 'short' && content.duration_minutes <= 30) ||
      (durationFilter === 'medium' && content.duration_minutes > 30 && content.duration_minutes <= 60) ||
      (durationFilter === 'long' && content.duration_minutes > 60);
    
    return matchesSearch && matchesLane && matchesType && matchesDuration;
  });

  const recentlyViewedContent = recentlyViewed
    .map(rv => learningContent?.find(c => c.id === rv.learning_content_id))
    .filter(Boolean);

  const handleStartContent = (content) => {
    // Check IncubateHer access
    if (content.incubateher_only && !enrollment) {
      alert('This content is only available to IncubateHer program participants.');
      return;
    }
    
    if (user?.email) {
      trackViewMutation.mutate(content.id);
    }
    if (content.content_url) {
      window.open(content.content_url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Learning Hub
            </h1>
          </div>
          <p className="text-slate-500">
            Build your funding knowledge with courses, webinars, and workshops
          </p>
        </motion.div>

        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <Button asChild variant="outline">
            <Link to={createPageUrl('LearningProgress')}>
              <TrendingUp className="w-4 h-4 mr-2" />
              My Progress
            </Link>
          </Button>
          <LearningRequestForm organization={organization} />
        </div>

        {/* Continue Learning Section */}
        {recentlyViewedContent.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                Continue Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentlyViewedContent.slice(0, 3).map(content => (
                  <LearningCard
                    key={content.id}
                    content={content}
                    isPremium={content.is_premium}
                    hasAccess={!content.is_premium}
                    onStart={handleStartContent}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Curated Learning Paths */}
        {curatedPaths.length > 0 && (
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="w-5 h-5 text-purple-600" />
                Curated Learning Paths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {curatedPaths.map(path => (
                  <Card key={path.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-slate-900">{path.path_name}</h3>
                          <p className="text-sm text-slate-600 mt-1">{path.description}</p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800">
                          {path.difficulty_level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {path.module_sequence?.length || 0} modules
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {path.estimated_hours}h
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs - Recommended vs Browse */}
        <Tabs defaultValue={enrollment ? "incubateher" : (organization ? "recommended" : "browse")} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto">
            {enrollment && (
              <TabsTrigger 
                value="incubateher"
                className="data-[state=active]:bg-[#AC1A5B] data-[state=active]:text-white"
              >
                <Award className="w-4 h-4 mr-2" />
                IncubateHer Courses
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="recommended"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Recommended for You
            </TabsTrigger>
            <TabsTrigger 
              value="browse"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Browse All
            </TabsTrigger>
            <TabsTrigger 
              value="requests"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              My Requests
            </TabsTrigger>
          </TabsList>

          {/* IncubateHer Courses Tab */}
          <TabsContent value="incubateher">
            {enrollment && learningContent ? (
              <div className="space-y-6">
                <Card className="border-[#AC1A5B] bg-gradient-to-r from-[#AC1A5B]/10 to-[#E5C089]/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          <Award className="w-6 h-6 text-[#AC1A5B]" />
                          IncubateHer Program Courses
                        </CardTitle>
                        <p className="text-slate-600 mt-2">
                          Complete all 6 courses to earn your certificate and become eligible for the program giveaway
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#E5C089]" />
                        <span>Earn 10 points for completing each section</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#E5C089]" />
                        <span>Earn 50 bonus points for completing a full course</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#E5C089]" />
                        <span>Unlock badges as you progress through the curriculum</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {learningContent
                    .filter(c => c.incubateher_only)
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((content, index) => (
                      <motion.div
                        key={content.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <LearningCard
                          content={content}
                          isPremium={false}
                          hasAccess={true}
                          onStart={handleStartContent}
                        />
                      </motion.div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  IncubateHer Program Enrollment Required
                </h3>
                <p className="text-slate-600 mb-4">
                  These exclusive courses are available only to IncubateHer program participants
                </p>
                <Button asChild className="bg-[#AC1A5B] hover:bg-[#8B1549]">
                  <Link to={createPageUrl('IncubateHerSchedule')}>
                    Learn More About IncubateHer
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Recommended Tab */}
          <TabsContent value="recommended">
            {organization && learningContent ? (
              <div className="space-y-6">
                <AIContentRecommendations
                  user={user}
                  organization={organization}
                  userProgress={userProgress}
                  allContent={browseContent}
                />
                <AILearningRecommendations
                  organization={organization}
                  learningContent={browseContent}
                  fundingGaps={organization.readiness_status ? `Current readiness: ${organization.readiness_status}` : null}
                />
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Complete Your Profile for Personalized Recommendations
                </h3>
                <p className="text-slate-600">
                  AI will analyze your organization's profile to recommend the most relevant courses
                </p>
              </div>
            )}
          </TabsContent>

          {/* Browse All Tab */}
          <TabsContent value="browse">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 mb-6"
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search learning content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Type Tabs */}
              <Tabs value={selectedType} onValueChange={setSelectedType}>
                <TabsList className="bg-white border border-slate-200 p-1 h-auto flex-wrap">
                  {CONTENT_TYPES.map(type => (
                    <TabsTrigger 
                      key={type.value} 
                      value={type.value}
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      <type.icon className="w-4 h-4 mr-2" />
                      {type.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Advanced Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <Select value={selectedLane} onValueChange={setSelectedLane}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Funding lane" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Lanes</SelectItem>
                    <SelectItem value="grants">Grants</SelectItem>
                    <SelectItem value="contracts">Contracts</SelectItem>
                    <SelectItem value="donors">Donors</SelectItem>
                    <SelectItem value="public_funds">Public Funds</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={durationFilter} onValueChange={setDurationFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Durations</SelectItem>
                    <SelectItem value="short">Short (≤30 min)</SelectItem>
                    <SelectItem value="medium">Medium (30-60 min)</SelectItem>
                    <SelectItem value="long">Long (>60 min)</SelectItem>
                  </SelectContent>
                </Select>

                <p className="text-sm text-slate-500 ml-auto">
                  {filteredContent.length} resources found
                </p>
              </div>
            </motion.div>

            {/* Content Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredContent.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No learning content matches your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((content, index) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <LearningCard
                      content={content}
                      isPremium={content.is_premium}
                      hasAccess={!content.is_premium}
                      onStart={handleStartContent}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="requests">
            <MyLearningRequests userEmail={user?.email} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}