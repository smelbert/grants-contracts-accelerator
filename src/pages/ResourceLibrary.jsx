import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, FileText, BookOpen, Target, Filter, Star, Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ResourceRecommendations from '@/components/resources/ResourceRecommendations';

const RESOURCE_TYPES = [
  { value: 'all', label: 'All Resources', icon: FileText },
  { value: 'worksheet', label: 'Worksheets', icon: FileText },
  { value: 'handout', label: 'Handouts', icon: BookOpen },
  { value: 'guide', label: 'Guides', icon: Target },
  { value: 'template', label: 'Templates', icon: FileText },
];

const FUNDING_STAGES = [
  { value: 'all', label: 'All Stages' },
  { value: 'research', label: 'Research & Discovery' },
  { value: 'proposal_writing', label: 'Proposal Writing' },
  { value: 'budgeting', label: 'Budget Development' },
  { value: 'reporting', label: 'Grant Reporting' },
  { value: 'stewardship', label: 'Donor Stewardship' },
];

export default function ResourceLibrary() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const handouts = await base44.entities.LearningContent.filter({});
      return handouts.filter(h => h.handouts && h.handouts.length > 0);
    },
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['resource-favorites', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ResourceFavorite.filter({
        user_email: user.email
      });
    },
    enabled: !!user?.email,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ handout, isFavorited }) => {
      if (isFavorited) {
        const existingFav = favorites.find(f => 
          f.resource_title === handout.title && 
          f.resource_url === handout.file_url
        );
        if (existingFav) {
          return await base44.entities.ResourceFavorite.delete(existingFav.id);
        }
      } else {
        return await base44.entities.ResourceFavorite.create({
          user_email: user.email,
          resource_type: 'handout',
          resource_title: handout.title,
          resource_url: handout.file_url,
          resource_metadata: {
            parent_title: handout.parentTitle,
            file_type: handout.file_type,
            description: handout.description,
            funding_lane: handout.funding_lane
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['resource-favorites']);
      toast.success('Favorites updated');
    },
  });

  const allHandouts = resources?.flatMap(resource => 
    resource.handouts?.map(handout => ({
      ...handout,
      parentTitle: resource.title,
      parentDescription: resource.description,
      funding_lane: resource.funding_lane,
    })) || []
  ) || [];

  const enrichedHandouts = allHandouts.map(handout => {
    const isFavorited = favorites.some(f => 
      f.resource_title === handout.title && 
      f.resource_url === handout.file_url
    );
    
    // Infer stage based on content
    let stage = 'research';
    const titleLower = handout.title?.toLowerCase() || '';
    const descLower = handout.description?.toLowerCase() || '';
    if (titleLower.includes('proposal') || titleLower.includes('writing')) stage = 'proposal_writing';
    else if (titleLower.includes('budget') || titleLower.includes('financial')) stage = 'budgeting';
    else if (titleLower.includes('report') || titleLower.includes('impact')) stage = 'reporting';
    else if (titleLower.includes('steward') || titleLower.includes('donor')) stage = 'stewardship';
    
    return { ...handout, isFavorited, stage };
  });

  const filteredHandouts = enrichedHandouts.filter(handout => {
    const matchesSearch = !searchQuery || 
      handout.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      handout.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      handout.parentTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || 
      handout.file_type?.toLowerCase().includes(selectedType) ||
      handout.title?.toLowerCase().includes(selectedType);
    
    const matchesStage = selectedStage === 'all' || handout.stage === selectedStage;
    
    const matchesFavorites = !showFavoritesOnly || handout.isFavorited;
    
    return matchesSearch && matchesType && matchesStage && matchesFavorites;
  });

  const handleDownload = (handout) => {
    window.open(handout.file_url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#143A50] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#143A50] mb-2">Resource Library</h1>
          <p className="text-slate-600">
            Download worksheets, handouts, guides, and templates to support your funding readiness journey
          </p>
        </div>

        {/* AI Recommendations */}
        <ResourceRecommendations 
          userEmail={user?.email}
          onResourceClick={(rec) => {
            // Scroll to resources and apply filters based on recommendation
            if (rec.type) setSelectedType(rec.type);
            if (rec.stage) setSelectedStage(rec.stage);
            document.getElementById('resources-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Search and Filter */}
        <Card className="mb-6 border-2 border-[#E5C089] shadow-lg" id="resources-section">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 focus:border-[#143A50]"
                  />
                </div>
                <Button
                  variant={showFavoritesOnly ? 'default' : 'outline'}
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={showFavoritesOnly ? 'bg-[#AC1A5B]' : ''}
                >
                  <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  Favorites
                </Button>
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-600 mb-1 block">Resource Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-600 mb-1 block">Funding Stage</label>
                  <Select value={selectedStage} onValueChange={setSelectedStage}>
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FUNDING_STAGES.map(stage => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">
                    {filteredHandouts.length} resources found
                  </span>
                  {showFavoritesOnly && (
                    <Badge className="bg-[#AC1A5B]">
                      <Heart className="w-3 h-3 mr-1" />
                      Favorites Only
                    </Badge>
                  )}
                </div>
                {(searchQuery || selectedType !== 'all' || selectedStage !== 'all' || showFavoritesOnly) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedType('all');
                      setSelectedStage('all');
                      setShowFavoritesOnly(false);
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        {filteredHandouts.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No resources found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHandouts.map((handout, idx) => (
              <Card key={idx} className={`hover:shadow-xl transition-all border-2 ${handout.isFavorited ? 'border-[#AC1A5B]' : 'hover:border-[#E5C089]'}`}>
                <CardHeader className="bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white">
                  <div className="flex items-start justify-between mb-2">
                    <FileText className="w-8 h-8 text-[#E5C089]" />
                    <div className="flex items-center gap-2">
                      {handout.file_type && (
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {handout.file_type.toUpperCase()}
                        </Badge>
                      )}
                      <button
                        onClick={() => toggleFavoriteMutation.mutate({ 
                          handout, 
                          isFavorited: handout.isFavorited 
                        })}
                        className="hover:scale-110 transition-transform"
                      >
                        <Heart 
                          className={`w-5 h-5 ${handout.isFavorited ? 'fill-[#E5C089] text-[#E5C089]' : 'text-white/60'}`}
                        />
                      </button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{handout.title}</CardTitle>
                  {handout.description && (
                    <CardDescription className="text-white/80 text-sm">
                      {handout.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-3 space-y-2">
                    {handout.parentTitle && (
                      <div className="pb-2 border-b border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">From course:</p>
                        <p className="text-sm font-medium text-slate-700">{handout.parentTitle}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {FUNDING_STAGES.find(s => s.value === handout.stage)?.label || 'Research'}
                      </Badge>
                      {handout.funding_lane && (
                        <Badge variant="outline" className="text-xs">
                          {handout.funding_lane}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleDownload(handout)}
                    className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Featured: Grant Readiness Toolkit */}
        <Card className="mt-8 border-4 border-[#AC1A5B] bg-gradient-to-br from-[#AC1A5B]/5 to-[#E5C089]/5">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-[#AC1A5B] flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-[#143A50]">Grant Readiness Toolkit</CardTitle>
                <CardDescription>Complete assessment and planning guide</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4">
              A comprehensive toolkit to help you assess grant alignment and organizational readiness before applying. 
              Includes the Grant Alignment Assessment, Organizational Readiness Assessment, and Capacity & Risk Analysis.
            </p>
            <Button 
              onClick={() => window.open('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/GrantReadinessToolkit.pdf', '_blank')}
              size="lg"
              className="bg-[#AC1A5B] hover:bg-[#8C1548]"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Grant Readiness Toolkit
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}