import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Search, BookOpen, Video, Users, FileText, Sparkles } from 'lucide-react';
import LearningCard from '@/components/learning/LearningCard';
import AILearningRecommendations from '@/components/ai/AILearningRecommendations';

const CONTENT_TYPES = [
  { value: 'all', label: 'All Types', icon: BookOpen },
  { value: 'course', label: 'Courses', icon: BookOpen },
  { value: 'webinar', label: 'Webinars', icon: Video },
  { value: 'workshop', label: 'Workshops', icon: Users },
  { value: 'guide', label: 'Guides', icon: FileText },
];

export default function LearningPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLane, setSelectedLane] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: learningContent, isLoading } = useQuery({
    queryKey: ['learning'],
    queryFn: () => base44.entities.LearningContent.list(),
  });

  const organization = organizations?.[0];

  const filteredContent = (learningContent || []).filter(content => {
    const matchesSearch = !searchQuery || 
      content.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLane = selectedLane === 'all' || content.funding_lane === selectedLane;
    const matchesType = selectedType === 'all' || content.content_type === selectedType;
    
    return matchesSearch && matchesLane && matchesType;
  });

  const handleStartContent = (content) => {
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

        {/* Main Tabs - Recommended vs Browse */}
        <Tabs defaultValue={organization ? "recommended" : "browse"} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto">
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
          </TabsList>

          {/* Recommended Tab */}
          <TabsContent value="recommended">
            {organization && learningContent ? (
              <AILearningRecommendations
                organization={organization}
                learningContent={learningContent || []}
                fundingGaps={organization.readiness_status ? `Current readiness: ${organization.readiness_status}` : null}
              />
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

              {/* Lane Filter */}
              <div className="flex items-center gap-4">
                <Select value={selectedLane} onValueChange={setSelectedLane}>
                  <SelectTrigger className="w-48">
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
                <p className="text-sm text-slate-500">
                  {filteredContent.length} resources available
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
        </Tabs>
      </div>
    </div>
  );
}