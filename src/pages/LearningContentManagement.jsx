import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  BookOpen, Plus, Edit, Trash2, Clock, Award, ArrowLeft, Sparkles,
  CheckSquare, GitBranch, Search, Filter, LayoutGrid, List,
  GraduationCap, Video, FileText, Layers, Target, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import CourseBuilder from '@/components/learning/CourseBuilder';
import AIContentAssistant from '@/components/learning/AIContentAssistant';
import BulkContentEditor from '@/components/admin/BulkContentEditor';
import ContentReviewWorkflow from '@/components/admin/ContentReviewWorkflow';

const TYPE_CONFIG = {
  course:    { label: 'Course',    icon: GraduationCap, color: 'bg-blue-100 text-blue-700' },
  webinar:   { label: 'Webinar',   icon: Video,         color: 'bg-purple-100 text-purple-700' },
  workshop:  { label: 'Workshop',  icon: Layers,        color: 'bg-amber-100 text-amber-700' },
  template:  { label: 'Template',  icon: FileText,      color: 'bg-green-100 text-green-700' },
  guidebook: { label: 'Guidebook', icon: BookOpen,      color: 'bg-slate-100 text-slate-700' },
};

const LANE_COLORS = {
  grants:       'bg-emerald-100 text-emerald-700',
  contracts:    'bg-blue-100 text-blue-700',
  donors:       'bg-pink-100 text-pink-700',
  public_funds: 'bg-orange-100 text-orange-700',
  general:      'bg-slate-100 text-slate-600',
};

const MODULE_LABELS = {
  monday: 'Session 1 – Foundations',
  thursday: 'Session 2 – Financial & Funding',
  saturday: 'Session 3 – Grant Writing',
  intro: 'Orientation & Foundations',
  legal: 'Legal & Compliance',
  financial: 'Financial Management',
  grants: 'Grants & Proposals',
  contracts: 'RFPs & Contracts',
  strategy: 'Funding Strategy',
  consultation: 'Consultation Prep',
  wrap: 'Wrap-Up',
};

function ContentCard({ content, isSelected, onSelect, onEdit, onDelete, onReview, viewMode }) {
  const typeConf = TYPE_CONFIG[content.content_type] || TYPE_CONFIG.course;
  const TypeIcon = typeConf.icon;

  if (viewMode === 'list') {
    return (
      <div className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeConf.color}`}>
          <TypeIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 truncate">{content.title}</span>
            {content.incubateher_only && <Badge className="bg-[#AC1A5B]/10 text-[#AC1A5B] border-[#AC1A5B]/20 text-xs">IncubateHer</Badge>}
            {content.is_premium && <Badge className="bg-amber-100 text-amber-700 text-xs">Premium</Badge>}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConf.color}`}>{typeConf.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LANE_COLORS[content.funding_lane] || LANE_COLORS.general}`}>{content.funding_lane}</span>
            {content.duration_minutes && <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{content.duration_minutes}m</span>}
            {content.agenda_section && <span className="text-xs text-slate-400">{MODULE_LABELS[content.agenda_section] || content.agenda_section}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button size="sm" variant="ghost" onClick={onReview} title="Review workflow"><GitBranch className="w-4 h-4 text-slate-400" /></Button>
          <Button size="sm" variant="ghost" onClick={onEdit}><Edit className="w-4 h-4 text-slate-500" /></Button>
          <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" /></Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col rounded-xl border transition-all h-full ${isSelected ? 'bg-blue-50 border-blue-300 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'}`}>
      {/* Card top color strip */}
      <div className={`h-1.5 rounded-t-xl ${content.incubateher_only ? 'bg-[#AC1A5B]' : 'bg-[#143A50]'}`} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Checkbox checked={isSelected} onCheckedChange={onSelect} />
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${typeConf.color}`}>
              <TypeIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onReview}><GitBranch className="w-3.5 h-3.5 text-slate-400" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onEdit}><Edit className="w-3.5 h-3.5 text-slate-500" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onDelete}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
          </div>
        </div>

        <h3 className="font-semibold text-slate-900 mb-1.5 leading-snug">{content.title}</h3>
        {content.description && (
          <p className="text-sm text-slate-500 mb-3 line-clamp-2 leading-relaxed flex-1">{content.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-slate-100">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConf.color}`}>{typeConf.label}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LANE_COLORS[content.funding_lane] || LANE_COLORS.general}`}>{content.funding_lane}</span>
          {content.incubateher_only && <span className="text-xs px-2 py-0.5 rounded-full bg-[#AC1A5B]/10 text-[#AC1A5B] font-medium">IncubateHer</span>}
          {content.is_premium && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Premium</span>}
          {content.duration_minutes && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{content.duration_minutes}m</span>}
          {content.agenda_section && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{MODULE_LABELS[content.agenda_section] || content.agenda_section}</span>}
        </div>
      </div>
    </div>
  );
}

export default function LearningContentManagement() {
  const queryClient = useQueryClient();
  const [builderMode, setBuilderMode] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterLane, setFilterLane] = useState('all');
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState([]);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [reviewingContent, setReviewingContent] = useState(null);

  const { data: allContent = [], isLoading } = useQuery({
    queryKey: ['learning-content-admin'],
    queryFn: () => base44.entities.LearningContent.list('-created_date')
  });

  const saveMutation = useMutation({
    mutationFn: async (courseData) => {
      if (editingContent?.id) {
        return await base44.entities.LearningContent.update(editingContent.id, courseData);
      } else {
        return await base44.entities.LearningContent.create(courseData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-content-admin'] });
      queryClient.invalidateQueries({ queryKey: ['learning'] });
      const wasEditing = !!editingContent?.id;
      setBuilderMode(false);
      setEditingContent(null);
      toast.success(wasEditing ? 'Course updated' : 'Course created');
    },
    onError: (error) => toast.error(`Failed to save: ${error.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LearningContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-content-admin'] });
      queryClient.invalidateQueries({ queryKey: ['learning'] });
      toast.success('Content deleted');
    }
  });

  const handleApplyAiContent = (content, type) => {
    if (type === 'outline') {
      setEditingContent({
        title: content.title,
        description: content.description,
        curriculum_sections: content.sections?.map(s => ({
          id: `ai-${Date.now()}-${Math.random()}`,
          title: s.title,
          description: s.description,
          duration_minutes: s.duration_minutes,
          content: s.topics ? `<ul>${s.topics.map(t => `<li>${t}</li>`).join('')}</ul>` : ''
        }))
      });
      setBuilderMode(true);
      setAiAssistantOpen(false);
    }
  };

  const toggleSelectContent = (content) => {
    setSelectedContent(prev =>
      prev.find(c => c.id === content.id) ? prev.filter(c => c.id !== content.id) : [...prev, content]
    );
  };

  const filteredContent = allContent.filter(content => {
    const typeMatch = filterType === 'all' || content.content_type === filterType;
    const laneMatch = filterLane === 'all' || content.funding_lane === filterLane;
    const tabMatch = filterTab === 'all' || (filterTab === 'incubateher' ? content.incubateher_only : !content.incubateher_only);
    const searchMatch = !searchQuery || content.title?.toLowerCase().includes(searchQuery.toLowerCase()) || content.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && laneMatch && tabMatch && searchMatch;
  });

  const incubateHerCount = allContent.filter(c => c.incubateher_only).length;
  const generalCount = allContent.filter(c => !c.incubateher_only).length;

  if (builderMode) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" onClick={() => { setBuilderMode(false); setEditingContent(null); }} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Content Library
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 mb-6">
            {editingContent ? 'Edit Course' : 'Create New Course'}
          </h1>
          <CourseBuilder
            course={editingContent}
            onSave={(d) => saveMutation.mutate(d)}
            onCancel={() => { setBuilderMode(false); setEditingContent(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Learning Hub Content</h1>
            <p className="text-slate-500 mt-1">Manage courses, webinars, workshops, and guides</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAiAssistantOpen(true)}>
              <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
              AI Assistant
            </Button>
            <Button onClick={() => { setEditingContent(null); setBuilderMode(true); }} className="bg-[#143A50] hover:bg-[#1E4F58]">
              <Plus className="w-4 h-4 mr-2" />
              New Course
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Content', value: allContent.length, icon: BookOpen, color: 'text-slate-600', bg: 'bg-slate-100' },
            { label: 'IncubateHer', value: incubateHerCount, icon: Award, color: 'text-[#AC1A5B]', bg: 'bg-[#AC1A5B]/10' },
            { label: 'General', value: generalCount, icon: GraduationCap, color: 'text-[#143A50]', bg: 'bg-[#143A50]/10' },
            { label: 'Selected', value: selectedContent.length, icon: CheckSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters & Toolbar */}
        <Card className="border-0 shadow-sm mb-5">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by title or description..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Tab filter */}
              <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                {[
                  { value: 'all', label: `All (${allContent.length})` },
                  { value: 'incubateher', label: `IncubateHer (${incubateHerCount})` },
                  { value: 'general', label: `General (${generalCount})` },
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setFilterTab(tab.value)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${filterTab === tab.value ? 'bg-[#143A50] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="course">Courses</SelectItem>
                  <SelectItem value="webinar">Webinars</SelectItem>
                  <SelectItem value="workshop">Workshops</SelectItem>
                  <SelectItem value="guidebook">Guidebooks</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterLane} onValueChange={setFilterLane}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Lane" />
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

              {/* View toggle */}
              <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 transition-colors ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 transition-colors ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk action bar */}
        {selectedContent.length > 0 && (
          <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
            <Badge className="bg-blue-600 text-white">{selectedContent.length} selected</Badge>
            <Button size="sm" onClick={() => setBulkEditOpen(true)}>
              <CheckSquare className="w-4 h-4 mr-2" />
              Bulk Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedContent([])}>Clear</Button>
          </div>
        )}

        {/* Select all / none */}
        {filteredContent.length > 0 && (
          <div className="flex items-center gap-3 mb-3 text-sm text-slate-500">
            <button
              className="hover:text-slate-900 underline"
              onClick={() => setSelectedContent(filteredContent)}
            >
              Select all {filteredContent.length}
            </button>
            {selectedContent.length > 0 && (
              <button className="hover:text-slate-900 underline" onClick={() => setSelectedContent([])}>
                Deselect all
              </button>
            )}
            <span className="ml-auto">{filteredContent.length} result{filteredContent.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Content Grid/List */}
        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-40 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredContent.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 mb-2">No content found</h3>
              <p className="text-sm text-slate-500 mb-4">Try adjusting your filters or create new content.</p>
              <Button onClick={() => { setEditingContent(null); setBuilderMode(true); }} className="bg-[#143A50]">
                <Plus className="w-4 h-4 mr-2" />
                Create New Course
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-2'
          }>
            {filteredContent.map(content => (
              <ContentCard
                key={content.id}
                content={content}
                viewMode={viewMode}
                isSelected={!!selectedContent.find(c => c.id === content.id)}
                onSelect={() => toggleSelectContent(content)}
                onEdit={() => { setEditingContent(content); setBuilderMode(true); }}
                onDelete={() => { if (confirm('Delete this content?')) deleteMutation.mutate(content.id); }}
                onReview={() => setReviewingContent(content)}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <AIContentAssistant
        open={aiAssistantOpen}
        onOpenChange={setAiAssistantOpen}
        onApplyContent={handleApplyAiContent}
        mode="create"
      />

      {/* Bulk Editor */}
      {bulkEditOpen && selectedContent.length > 0 && (
        <BulkContentEditor
          selectedContent={selectedContent}
          onClose={() => { setBulkEditOpen(false); setSelectedContent([]); }}
        />
      )}

      {/* Review Workflow */}
      {reviewingContent && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <ContentReviewWorkflow
              contentId={reviewingContent.id}
              onClose={() => setReviewingContent(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}