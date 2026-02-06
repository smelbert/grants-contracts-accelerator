import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Video, FileText, Award, Clock, 
  Search, Filter, Star, ExternalLink, PlayCircle,
  Download, TrendingUp, Loader2
} from 'lucide-react';

const CATEGORIES = {
  grant_writing: { label: 'Grant Writing', icon: FileText, color: 'bg-blue-600' },
  contract_management: { label: 'Contract Management', icon: Award, color: 'bg-purple-600' },
  proposal_development: { label: 'Proposal Development', icon: BookOpen, color: 'bg-emerald-600' },
  pitch_coaching: { label: 'Pitch Coaching', icon: TrendingUp, color: 'bg-orange-600' },
  budget_development: { label: 'Budget Development', icon: FileText, color: 'bg-indigo-600' },
  compliance: { label: 'Compliance', icon: Award, color: 'bg-red-600' },
  report_writing: { label: 'Report Writing', icon: FileText, color: 'bg-teal-600' },
  client_communication: { label: 'Client Communication', icon: Video, color: 'bg-pink-600' },
  platform_tools: { label: 'Platform Tools', icon: Award, color: 'bg-cyan-600' },
  best_practices: { label: 'Best Practices', icon: Star, color: 'bg-amber-600' }
};

const CONTENT_TYPE_ICONS = {
  video: Video,
  document: FileText,
  article: BookOpen,
  course: Award,
  webinar: Video,
  template: Download
};

export default function CoachTrainingLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ['coach-trainings'],
    queryFn: () => base44.entities.CoachTraining.filter({ is_published: true }),
  });

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         training.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || training.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || training.difficulty_level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const requiredTrainings = filteredTrainings.filter(t => t.is_required);
  const optionalTrainings = filteredTrainings.filter(t => !t.is_required);

  const TrainingCard = ({ training }) => {
    const CategoryIcon = CATEGORIES[training.category]?.icon || BookOpen;
    const ContentIcon = CONTENT_TYPE_ICONS[training.content_type] || FileText;

    return (
      <Card className="hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: CATEGORIES[training.category]?.color?.replace('bg-', '#') || '#3B82F6' }}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CategoryIcon className="w-5 h-5 text-[#1E4F58]" />
                <h3 className="text-lg font-bold text-[#143A50]">{training.title}</h3>
              </div>
              <p className="text-slate-600 text-sm mb-4">{training.description}</p>
              
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" className="text-xs">
                  {CATEGORIES[training.category]?.label}
                </Badge>
                <Badge className={`text-xs ${
                  training.difficulty_level === 'beginner' ? 'bg-green-600' :
                  training.difficulty_level === 'intermediate' ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}>
                  {training.difficulty_level}
                </Badge>
                {training.duration_minutes && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {training.duration_minutes} min
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <ContentIcon className="w-3 h-3" />
                  {training.content_type}
                </Badge>
                {training.is_required && (
                  <Badge className="bg-[#AC1A5B] text-xs">Required</Badge>
                )}
              </div>

              {training.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {training.tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {training.thumbnail_url && (
              <img 
                src={training.thumbnail_url} 
                alt={training.title}
                className="w-32 h-32 rounded-lg object-cover"
              />
            )}
          </div>

          <div className="flex gap-2 mt-4">
            {training.content_url && (
              <Button 
                asChild
                className="bg-[#1E4F58] hover:bg-[#143A50] flex-1"
              >
                <a href={training.content_url} target="_blank" rel="noopener noreferrer">
                  {training.content_type === 'video' || training.content_type === 'webinar' ? (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Watch Now
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Access Content
                    </>
                  )}
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E4F58]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#143A50] mb-2">Coach Training Library</h1>
          <p className="text-slate-600">Enhance your skills with our comprehensive training resources</p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-6 shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search trainings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(CATEGORIES).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Trainings</p>
                  <p className="text-2xl font-bold text-[#143A50]">{filteredTrainings.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-[#1E4F58]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Required</p>
                  <p className="text-2xl font-bold text-[#AC1A5B]">{requiredTrainings.length}</p>
                </div>
                <Star className="w-8 h-8 text-[#AC1A5B]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Optional</p>
                  <p className="text-2xl font-bold text-[#1E4F58]">{optionalTrainings.length}</p>
                </div>
                <Award className="w-8 h-8 text-[#1E4F58]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training Sections */}
        <Tabs defaultValue="required" className="space-y-6">
          <TabsList className="bg-slate-200">
            <TabsTrigger value="required" className="gap-2">
              <Star className="w-4 h-4" />
              Required Training
            </TabsTrigger>
            <TabsTrigger value="optional" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Optional Training
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Award className="w-4 h-4" />
              All Training
            </TabsTrigger>
          </TabsList>

          <TabsContent value="required" className="space-y-4">
            {requiredTrainings.length > 0 ? (
              requiredTrainings.map(training => (
                <TrainingCard key={training.id} training={training} />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Star className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No required trainings match your filters</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="optional" className="space-y-4">
            {optionalTrainings.length > 0 ? (
              optionalTrainings.map(training => (
                <TrainingCard key={training.id} training={training} />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No optional trainings match your filters</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {filteredTrainings.length > 0 ? (
              filteredTrainings.map(training => (
                <TrainingCard key={training.id} training={training} />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No trainings found matching your criteria</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}