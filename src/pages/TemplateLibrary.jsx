import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import VersionHistory from '@/components/templates/VersionHistory';
import TemplateComments from '@/components/templates/TemplateComments';
import ActiveEditors from '@/components/templates/ActiveEditors';
import BrandedTemplateWrapper from '@/components/templates/BrandedTemplateWrapper';
import TemplateAISuggestions from '@/components/ai/TemplateAISuggestions';
import AIContentGenerator from '@/components/ai/AIContentGenerator';
import TemplateSectionBuilder from '@/components/templates/TemplateSectionBuilder';
import SectionRenderer from '@/components/templates/SectionRenderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BookOpen, FileText, DollarSign, RefreshCw, Briefcase, 
  Heart, Building2, TrendingUp, Sparkles, CheckSquare, 
  AlertCircle, Plus, Edit, Eye, Download, Star, MessageSquare,
  History, Save, Trash2, Wand2, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';

const CATEGORY_CONFIG = {
  foundational: { 
    label: 'Foundational / Readiness', 
    icon: Building2, 
    color: 'emerald',
    description: 'Organizational identity, governance, and structure templates'
  },
  financial_compliance: { 
    label: 'Financial & Compliance', 
    icon: DollarSign, 
    color: 'blue',
    description: 'Budgets, financial policies, and compliance documentation'
  },
  grant_writing: { 
    label: 'Grant Writing Core', 
    icon: FileText, 
    color: 'purple',
    description: 'Proposal sections and supporting documents for grants'
  },
  renewals: { 
    label: 'Renewals & Continuation', 
    icon: RefreshCw, 
    color: 'amber',
    description: 'Grant renewal narratives and reporting templates'
  },
  contracts_rfp: { 
    label: 'Contracts & RFP', 
    icon: Briefcase, 
    color: 'indigo',
    description: 'Procurement, capability statements, and RFP responses'
  },
  donor_philanthropy: { 
    label: 'Donor & Philanthropy', 
    icon: Heart, 
    color: 'rose',
    description: 'Relationship-based donor engagement materials'
  },
  public_funding: { 
    label: 'Public Funding & Civic', 
    icon: Building2, 
    color: 'cyan',
    description: 'Civic engagement and public funding resources'
  },
  strategic: { 
    label: 'Strategic & Sustainability', 
    icon: TrendingUp, 
    color: 'green',
    description: 'Long-term planning and capacity growth tools'
  },
  ai_tools: { 
    label: 'AI-Supported Tools', 
    icon: Sparkles, 
    color: 'violet',
    description: 'Guarded AI drafting and checking tools'
  },
  quality_tools: { 
    label: 'Review & Quality', 
    icon: CheckSquare, 
    color: 'slate',
    description: 'Checklists, rubrics, and quality assurance tools'
  },
  meta_resources: { 
    label: 'Meta-Resources', 
    icon: AlertCircle, 
    color: 'orange',
    description: 'Educational content on funding dynamics'
  }
};

export default function TemplateLibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTemplate, setViewTemplate] = useState(null);
  const [editTemplate, setEditTemplate] = useState(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.Template.list('-created_date'),
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['template-favorites', user?.email],
    queryFn: () => base44.entities.TemplateFavorite.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  const organization = organizations[0];

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.Template.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      setShowNewTemplate(false);
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data, changeSummary, currentTemplate }) => {
      // Create version history
      const versions = await base44.entities.TemplateVersion.filter({ template_id: id });
      const versionNumber = versions.length + 1;
      
      await base44.entities.TemplateVersion.create({
        template_id: id,
        version_number: versionNumber,
        template_content: currentTemplate.template_content,
        template_name: currentTemplate.template_name,
        purpose: currentTemplate.purpose,
        when_to_use: currentTemplate.when_to_use,
        when_not_to_use: currentTemplate.when_not_to_use,
        what_funders_look_for: currentTemplate.what_funders_look_for,
        common_mistakes: currentTemplate.common_mistakes,
        change_summary: changeSummary,
        edited_by_email: user?.email,
        edited_by_name: user?.full_name
      });
      
      return base44.entities.Template.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      setEditTemplate(null);
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.Template.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['templates'])
  });

  const togglePublishMutation = useMutation({
    mutationFn: (template) => base44.entities.Template.update(template.id, { is_published: !template.is_published }),
    onSuccess: () => queryClient.invalidateQueries(['templates'])
  });

  const handleDelete = (template) => {
    if (window.confirm(`Are you sure you want to permanently delete "${template.template_name}"? This cannot be undone.`)) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (templateId) => {
      const existing = favorites.find(f => f.template_id === templateId);
      if (existing) {
        return base44.entities.TemplateFavorite.delete(existing.id);
      } else {
        return base44.entities.TemplateFavorite.create({
          template_id: templateId,
          user_email: user?.email,
          organization_id: organization?.id
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['template-favorites'])
  });

  const filteredTemplates = templates?.filter(t => {
    if (selectedCategory === 'favorites') {
      return favorites.some(f => f.template_id === t.id) && t.is_active;
    }
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      t.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.purpose?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && t.is_active;
  });

  const groupedTemplates = filteredTemplates?.reduce((acc, template) => {
    if (!acc[template.category]) acc[template.category] = [];
    acc[template.category].push(template);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-purple-600" />
                Template & Resource Library (Admin)
              </h1>
              <p className="text-slate-600 mt-2">Manage templates and resources for the user-facing Resource Library</p>
            </div>
            {isAdmin && (
              <Button onClick={() => setShowNewTemplate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Template
              </Button>
            )}
          </div>

          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* AI Suggestions */}
          <TemplateAISuggestions 
            organization={organization}
            onTemplateSelect={(name) => setSearchQuery(name)}
          />
        </motion.div>

        {/* Category Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          <Button
            variant={selectedCategory === 'favorites' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('favorites')}
            className="gap-2"
          >
            <Star className={`w-4 h-4 ${selectedCategory === 'favorites' ? '' : 'fill-amber-400 text-amber-400'}`} />
            Favorites ({favorites.length})
          </Button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(key)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {config.label}
              </Button>
            );
          })}
        </div>

        {/* Templates Grid by Category */}
        <div className="space-y-8">
          {selectedCategory === 'all' ? (
            Object.entries(groupedTemplates || {}).map(([category, categoryTemplates]) => {
              const config = CATEGORY_CONFIG[category];
              if (!config) return null;
              const Icon = config.icon;

              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`w-6 h-6 text-${config.color}-600`} />
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{config.label}</h2>
                      <p className="text-sm text-slate-600">{config.description}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTemplates.map(template => (
                     <TemplateCard 
                       key={template.id} 
                       template={template}
                       onView={setViewTemplate}
                       onEdit={isAdmin ? setEditTemplate : null}
                       onDelete={isAdmin ? handleDelete : null}
                       onTogglePublish={isAdmin ? togglePublishMutation.mutate : null}
                       config={config}
                       isFavorite={favorites.some(f => f.template_id === template.id)}
                       onToggleFavorite={toggleFavoriteMutation.mutate}
                     />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates?.map(template => (
                <TemplateCard 
                  key={template.id} 
                  template={template}
                  onView={setViewTemplate}
                  onEdit={isAdmin ? setEditTemplate : null}
                  onDelete={isAdmin ? handleDelete : null}
                  onTogglePublish={isAdmin ? togglePublishMutation.mutate : null}
                  config={CATEGORY_CONFIG[template.category]}
                  isFavorite={favorites.some(f => f.template_id === template.id)}
                  onToggleFavorite={toggleFavoriteMutation.mutate}
                />
              ))}
            </div>
          )}
        </div>

        {(!filteredTemplates || filteredTemplates.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">No templates found. {isAdmin && 'Add your first template to get started.'}</p>
            </CardContent>
          </Card>
        )}

        {/* View Template Dialog */}
        {viewTemplate && (
          <TemplateViewDialog template={viewTemplate} onClose={() => setViewTemplate(null)} />
        )}

        {/* Edit Template Dialog */}
        {editTemplate && (
          <TemplateEditDialog 
            template={editTemplate} 
            onClose={() => setEditTemplate(null)}
            onSave={({ changeSummary, currentTemplate, ...data }) => 
              updateTemplateMutation.mutate({ 
                id: editTemplate.id, 
                data,
                changeSummary,
                currentTemplate: editTemplate
              })
            }
          />
        )}

        {/* New Template Dialog */}
        {showNewTemplate && (
          <TemplateEditDialog 
            onClose={() => setShowNewTemplate(false)}
            onSave={(data) => createTemplateMutation.mutate(data)}
          />
        )}
      </div>
    </div>
  );
}

function TemplateCard({ template, onView, onEdit, onDelete, onTogglePublish, config, isFavorite, onToggleFavorite }) {
  const isUnpublished = !template.is_published;
  const completionStatus = {
    hasName: !!template.template_name,
    hasPurpose: !!template.purpose,
    hasGuidance: !!template.when_to_use || !!template.when_not_to_use || !!template.what_funders_look_for || !!template.common_mistakes,
    hasContent: !!template.template_content
  };
  const completionPercent = Object.values(completionStatus).filter(Boolean).length;
  
  return (
    <Card className={`hover:shadow-lg transition-all relative ${
      isUnpublished ? 'border-2 border-amber-200 bg-amber-50' : ''
    }`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base leading-tight">{template.template_name || '(Untitled Template)'}</CardTitle>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <Badge className={`bg-${config?.color}-100 text-${config?.color}-700 text-xs`}>
              {template.maturity_level}
            </Badge>
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(template.id)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
              </button>
            )}
          </div>
        </div>
        {/* Published status badge */}
        {onTogglePublish && (
          <div className="mt-2 flex items-center justify-between">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              template.is_published 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${template.is_published ? 'bg-green-500' : 'bg-amber-500'}`} />
              {template.is_published ? 'Published' : 'Draft'}
            </span>
            {isUnpublished && (
              <span className="text-xs text-amber-700 font-medium">{completionPercent}/4 sections</span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {template.purpose && (
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{template.purpose}</p>
        )}
        
        {/* Completion checklist for unpublished templates */}
        {isUnpublished && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-amber-100 text-xs space-y-1">
            <p className="font-medium text-amber-800 mb-2">Complete to publish:</p>
            <div className="space-y-1">
              <div className={`flex items-center gap-2 ${completionStatus.hasName ? 'text-emerald-700' : 'text-slate-600'}`}>
                <span className={completionStatus.hasName ? '✓' : '◯'}></span>
                Template name
              </div>
              <div className={`flex items-center gap-2 ${completionStatus.hasPurpose ? 'text-emerald-700' : 'text-slate-600'}`}>
                <span className={completionStatus.hasPurpose ? '✓' : '◯'}></span>
                Purpose & description
              </div>
              <div className={`flex items-center gap-2 ${completionStatus.hasGuidance ? 'text-emerald-700' : 'text-slate-600'}`}>
                <span className={completionStatus.hasGuidance ? '✓' : '◯'}></span>
                Guidance (When to use, etc.)
              </div>
              <div className={`flex items-center gap-2 ${completionStatus.hasContent ? 'text-emerald-700' : 'text-slate-600'}`}>
                <span className={completionStatus.hasContent ? '✓' : '◯'}></span>
                Template content
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => onView(template)}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={() => onEdit(template)} className={isUnpublished ? 'text-amber-600 hover:bg-amber-100' : ''}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onTogglePublish && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onTogglePublish(template)}
              disabled={isUnpublished && completionPercent < 4}
              className={template.is_published ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}
              title={isUnpublished && completionPercent < 4 ? 'Complete all sections to publish' : ''}
            >
              {template.is_published ? 'Unpublish' : 'Publish'}
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="ghost" onClick={() => onDelete(template)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateViewDialog({ template, onClose }) {
  const [activeTab, setActiveTab] = React.useState('content');
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  return (
    <Dialog open={!!template} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 flex items-center justify-between">
          <DialogTitle className="text-xl font-bold text-slate-900">{template.template_name}</DialogTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const res = await base44.functions.invoke('exportTemplate', { templateId: template.id, templateName: template.template_name, templateContent: template.template_content });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `${template.template_name.replace(/\s+/g, '_')}.pdf`);
              document.body.appendChild(link);
              link.click();
              link.parentChild.removeChild(link);
            }}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="mb-4 flex-shrink-0">
            <TabsTrigger value="content">
              <FileText className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              Version History
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-1">
            <TabsContent value="content" className="mt-0 space-y-6">

              {/* Meta badges */}
              <div className="flex gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">Category</p>
                  <Badge>{CATEGORY_CONFIG[template.category]?.label}</Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">Maturity Level</p>
                  <Badge variant="outline">{template.maturity_level}</Badge>
                </div>
              </div>

              {/* 4-box guidance grid - always 2x2 layout */}
              {(template.when_to_use || template.when_not_to_use || template.what_funders_look_for || template.common_mistakes) && (
                <div className="grid grid-cols-2 gap-4">
                  {template.when_to_use && (
                    <div className="p-4 rounded-lg border-2 border-emerald-200 bg-emerald-50">
                      <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <span className="text-lg">✓</span> When to Use
                      </h3>
                      <p className="text-sm text-emerald-900 leading-relaxed">{template.when_to_use}</p>
                    </div>
                  ) || <div className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50 opacity-50"><p className="text-sm text-slate-500">When to Use</p></div>}
                  {template.when_not_to_use && (
                    <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
                      <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <span className="text-lg">✗</span> When NOT to Use
                      </h3>
                      <p className="text-sm text-red-900 leading-relaxed">{template.when_not_to_use}</p>
                    </div>
                  ) || <div className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50 opacity-50"><p className="text-sm text-slate-500">When NOT to Use</p></div>}
                  {template.what_funders_look_for && (
                    <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                      <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <span className="text-lg">👁</span> What Funders Look For
                      </h3>
                      <p className="text-sm text-blue-900 leading-relaxed">{template.what_funders_look_for}</p>
                    </div>
                  ) || <div className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50 opacity-50"><p className="text-sm text-slate-500">What Funders Look For</p></div>}
                  {template.common_mistakes && (
                    <div className="p-4 rounded-lg border-2 border-amber-200 bg-amber-50">
                      <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <span className="text-lg">⚠</span> Common Mistakes
                      </h3>
                      <p className="text-sm text-amber-900 leading-relaxed">{template.common_mistakes}</p>
                    </div>
                  ) || <div className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50 opacity-50"><p className="text-sm text-slate-500">Common Mistakes</p></div>}
                </div>
              )}

              {/* Template Content */}
              {template.template_content && (
                <div>
                  <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white px-6 py-3 rounded-t-lg">
                    <h2 className="text-lg font-bold">Template Content</h2>
                  </div>
                  <div className="border-2 border-[#143A50] rounded-b-lg">
                    <BrandedTemplateWrapper>
                      <div dangerouslySetInnerHTML={{ __html: template.template_content }} />
                    </BrandedTemplateWrapper>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="mt-0">
              <TemplateComments templateId={template.id} currentUser={user} />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <VersionHistory templateId={template.id} onRestore={() => {}} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AIEnhancePanel({ content, templateName, onApply }) {
  const [open, setOpen] = useState(false);
  const [orgType, setOrgType] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const QUICK_PROMPTS = [
    { label: 'Add callout boxes for key tips', value: 'Add visually distinct callout boxes (using HTML blockquote or styled divs) for the most important tips and warnings throughout this template.' },
    { label: 'Make it nonprofit-specific', value: 'Rewrite this template to be specifically tailored for 501(c)(3) nonprofit organizations, including compliance language and governance references.' },
    { label: 'Make it for-profit specific', value: 'Rewrite this template to be specifically tailored for for-profit small businesses, removing nonprofit-specific language and adding business-relevant framing.' },
    { label: 'Add section headers & formatting', value: 'Improve the visual structure by adding clear section headers, subheadings, and better HTML formatting with consistent spacing.' },
    { label: 'Add placeholder examples', value: 'Add realistic placeholder examples in brackets (e.g., [Your Organization Name]) throughout so users know exactly what to fill in.' },
    { label: 'Make more concise', value: 'Tighten the language throughout — remove redundancy, make sentences direct, and ensure each section is as concise as possible without losing meaning.' },
  ];

  const handleEnhance = async () => {
    setLoading(true);
    setResult('');
    const finalPrompt = `You are enhancing a professional funding template called "${templateName}".
${orgType ? `This template is specifically for: ${orgType} organizations.` : ''}
${prompt}

Here is the current template HTML content:
${content}

Return ONLY the improved HTML content — no explanations, no markdown code fences, just the raw HTML.`;

    const res = await base44.integrations.Core.InvokeLLM({ prompt: finalPrompt });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="border-2 border-purple-200 rounded-xl bg-purple-50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-purple-800">
          <Wand2 className="w-5 h-5" /> AI Enhance This Template
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-purple-600" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-purple-200">
          <p className="text-sm text-purple-700 pt-3">Use AI to reformat, specialize, or enhance the template content.</p>

          <div className="grid grid-cols-2 gap-2">
            {QUICK_PROMPTS.map(qp => (
              <button
                key={qp.label}
                onClick={() => setPrompt(qp.value)}
                className={`text-xs px-3 py-2 rounded-lg border text-left transition-all ${prompt === qp.value ? 'border-purple-500 bg-purple-100 text-purple-800' : 'border-slate-200 bg-white text-slate-600 hover:border-purple-300'}`}
              >
                {qp.label}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Target Org Type (optional)</label>
            <select
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">General (all org types)</option>
              <option value="Nonprofit 501(c)(3)">Nonprofit 501(c)(3)</option>
              <option value="For-profit small business">For-profit small business</option>
              <option value="Solopreneur / sole proprietor">Solopreneur / sole proprietor</option>
              <option value="Community-based organization">Community-based organization</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Custom instruction (or edit the quick prompt above)</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="e.g., Add callout boxes for tips, restructure the sections, make it more specific to faith-based orgs..."
            />
          </div>

          <Button
            onClick={handleEnhance}
            disabled={!prompt.trim() || loading}
            className="bg-purple-600 hover:bg-purple-700 w-full"
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enhancing...</> : <><Wand2 className="w-4 h-4 mr-2" />Enhance with AI</>}
          </Button>

          {result && (
            <div className="space-y-2">
              <div className="border border-purple-200 rounded-lg bg-white p-3 max-h-48 overflow-y-auto text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: result }} />
              <div className="flex gap-2">
                <Button onClick={() => onApply(result)} className="flex-1 bg-green-600 hover:bg-green-700">
                  Apply to Template
                </Button>
                <Button variant="outline" onClick={() => setResult('')} className="flex-1">
                  Discard
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TemplateEditDialog({ template, onClose, onSave }) {
  const [changeSummary, setChangeSummary] = useState('');
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });
  const [formData, setFormData] = useState(template || {
    template_name: '',
    category: 'foundational',
    subcategory: '',
    funding_lane: 'general',
    purpose: '',
    maturity_level: 'all',
    org_type: [],
    when_to_use: '',
    when_not_to_use: '',
    what_funders_look_for: '',
    common_mistakes: '',
    ai_assist_notes: '',
    template_content: '',
    sections: template?.sections || []
  });

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ]
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'check',
    'indent', 'align',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  const handleSave = () => {
    if (template && !changeSummary.trim()) {
      alert('Please describe what changed in this version');
      return;
    }
    if (template) {
      onSave({ ...formData, changeSummary, currentTemplate: template });
    } else {
      onSave(formData);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{template ? 'Edit Template' : 'New Template'}</DialogTitle>
        </DialogHeader>

        {template && <ActiveEditors templateId={template.id} currentUser={user} />}

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Template Name</label>
              <Input
                value={formData.template_name}
                onChange={(e) => setFormData({...formData, template_name: e.target.value})}
                placeholder="e.g., Logic Model Template"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Funding Lane</label>
              <select
                value={formData.funding_lane}
                onChange={(e) => setFormData({...formData, funding_lane: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="general">General</option>
                <option value="grants">Grants</option>
                <option value="contracts">Contracts</option>
                <option value="donors">Donors</option>
                <option value="public_funds">Public Funds</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Maturity Level</label>
              <select
                value={formData.maturity_level}
                onChange={(e) => setFormData({...formData, maturity_level: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Stages</option>
                <option value="seed">Seed</option>
                <option value="growth">Growth</option>
                <option value="scale">Scale</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Purpose</label>
            <Textarea
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              rows={2}
              placeholder="Brief description of what this template is for"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-emerald-700">When to Use</label>
              <Textarea
                value={formData.when_to_use}
                onChange={(e) => setFormData({...formData, when_to_use: e.target.value})}
                rows={3}
                className="border-emerald-200"
                placeholder="Guidance on when this template is appropriate"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-red-700">When NOT to Use</label>
              <Textarea
                value={formData.when_not_to_use}
                onChange={(e) => setFormData({...formData, when_not_to_use: e.target.value})}
                rows={3}
                className="border-red-200"
                placeholder="Guidance on when to avoid this template"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-blue-700">What Funders Look For</label>
              <Textarea
                value={formData.what_funders_look_for}
                onChange={(e) => setFormData({...formData, what_funders_look_for: e.target.value})}
                rows={3}
                className="border-blue-200"
                placeholder="Key elements funders want to see"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-amber-700">Common Mistakes</label>
              <Textarea
                value={formData.common_mistakes}
                onChange={(e) => setFormData({...formData, common_mistakes: e.target.value})}
                rows={3}
                className="border-amber-200"
                placeholder="Typical errors to avoid"
              />
            </div>
          </div>

          {/* Tabs for Section Builder vs Rich Text */}
          <Tabs defaultValue="sections" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sections">
                <FileText className="w-4 h-4 mr-2" />
                Section Builder
              </TabsTrigger>
              <TabsTrigger value="richtext">
                <FileText className="w-4 h-4 mr-2" />
                Rich Text Editor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sections" className="space-y-4">
              <div className="text-sm text-slate-600 p-3 bg-blue-50 rounded-lg border border-blue-200">
                Drag sections to reorder, customize each one, and see the preview update instantly.
              </div>
              <TemplateSectionBuilder
                sections={formData.sections}
                onChange={(sections) => setFormData({ ...formData, sections })}
              />
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-700 mb-3">Preview</p>
                <div className="border-2 border-slate-200 rounded-lg p-6 bg-slate-50">
                  <SectionRenderer sections={formData.sections} preview={true} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="richtext" className="space-y-4">
              {/* AI Enhance Panel */}
              <AIEnhancePanel
                content={formData.template_content}
                templateName={formData.template_name}
                onApply={(enhanced) => setFormData({ ...formData, template_content: enhanced })}
              />

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Template Content (Rich Text Editor)
                </label>
                <div className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white">
                  <ReactQuill
                    theme="snow"
                    value={formData.template_content}
                    onChange={(content) => setFormData({...formData, template_content: content})}
                    modules={quillModules}
                    formats={quillFormats}
                    className="min-h-[400px]"
                    placeholder="Start writing your template content here. Use the toolbar to format text, add headers with different colors, lists, etc."
                    style={{ height: '500px' }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {template && (
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Save className="w-4 h-4" />
                Change Summary (Required for Version History)
              </label>
              <Input
                placeholder="e.g., Updated funder guidance section, added budget examples"
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700">
              <Save className="w-4 h-4 mr-2" />
              {template ? 'Save Changes' : 'Create Template'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}