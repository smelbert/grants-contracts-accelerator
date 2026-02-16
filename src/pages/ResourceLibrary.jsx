import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, FileText, BookOpen, Target, Filter } from 'lucide-react';

const RESOURCE_TYPES = [
  { value: 'all', label: 'All Resources', icon: FileText },
  { value: 'worksheet', label: 'Worksheets', icon: FileText },
  { value: 'handout', label: 'Handouts', icon: BookOpen },
  { value: 'guide', label: 'Guides', icon: Target },
  { value: 'template', label: 'Templates', icon: FileText },
];

export default function ResourceLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

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

  const allHandouts = resources?.flatMap(resource => 
    resource.handouts?.map(handout => ({
      ...handout,
      parentTitle: resource.title,
      parentDescription: resource.description,
      funding_lane: resource.funding_lane,
    })) || []
  ) || [];

  const filteredHandouts = allHandouts.filter(handout => {
    const matchesSearch = !searchQuery || 
      handout.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      handout.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      handout.parentTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || 
      handout.file_type?.toLowerCase().includes(selectedType) ||
      handout.title?.toLowerCase().includes(selectedType);
    
    return matchesSearch && matchesType;
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

        {/* Search and Filter */}
        <Card className="mb-6 border-2 border-[#E5C089] shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 focus:border-[#143A50]"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {RESOURCE_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.value}
                      variant={selectedType === type.value ? 'default' : 'outline'}
                      onClick={() => setSelectedType(type.value)}
                      className={selectedType === type.value ? 'bg-[#143A50]' : ''}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>{filteredHandouts.length} resources found</span>
              {searchQuery && (
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              )}
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
              <Card key={idx} className="hover:shadow-xl transition-shadow border-2 hover:border-[#E5C089]">
                <CardHeader className="bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white">
                  <div className="flex items-start justify-between mb-2">
                    <FileText className="w-8 h-8 text-[#E5C089]" />
                    {handout.file_type && (
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {handout.file_type.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{handout.title}</CardTitle>
                  {handout.description && (
                    <CardDescription className="text-white/80 text-sm">
                      {handout.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  {handout.parentTitle && (
                    <div className="mb-3 pb-3 border-b border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">From course:</p>
                      <p className="text-sm font-medium text-slate-700">{handout.parentTitle}</p>
                    </div>
                  )}
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