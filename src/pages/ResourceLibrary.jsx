import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, Download, FileText, BookOpen, Heart, Star, Eye,
  Building2, DollarSign, RefreshCw, Briefcase, TrendingUp,
  Sparkles, CheckSquare, AlertCircle, Filter, X
} from 'lucide-react';
import { toast } from 'sonner';
import BrandedTemplateWrapper from '@/components/templates/BrandedTemplateWrapper';
import SuggestTemplatePanel from '@/components/incubateher/SuggestTemplatePanel';
import ComingSoonPipeline from '@/components/library/ComingSoonPipeline';
import { createPageUrl } from '@/utils';

const CATEGORY_CONFIG = {
  foundational:         { label: 'Foundational / Readiness',   icon: Building2,   color: 'emerald' },
  financial_compliance: { label: 'Financial & Compliance',      icon: DollarSign,  color: 'blue' },
  grant_writing:        { label: 'Grant Writing Core',          icon: FileText,    color: 'purple' },
  renewals:             { label: 'Renewals & Continuation',     icon: RefreshCw,   color: 'amber' },
  contracts_rfp:        { label: 'Contracts & RFP',             icon: Briefcase,   color: 'indigo' },
  donor_philanthropy:   { label: 'Donor & Philanthropy',        icon: Heart,       color: 'rose' },
  public_funding:       { label: 'Public Funding & Civic',      icon: Building2,   color: 'cyan' },
  strategic:            { label: 'Strategic & Sustainability',  icon: TrendingUp,  color: 'green' },
  ai_tools:             { label: 'AI-Supported Tools',          icon: Sparkles,    color: 'violet' },
  quality_tools:        { label: 'Review & Quality',            icon: CheckSquare, color: 'slate' },
  meta_resources:       { label: 'Meta-Resources',              icon: AlertCircle, color: 'orange' },
};

const ORG_TYPE_OPTIONS = [
  { value: 'all',            label: 'All Org Types' },
  { value: 'nonprofit',      label: 'Nonprofit' },
  { value: 'for_profit',     label: 'For-Profit' },
  { value: 'solopreneur',    label: 'Solopreneur' },
  { value: 'community_based',label: 'Community-Based' },
];

const MATURITY_OPTIONS = [
  { value: 'all',    label: 'All Stages' },
  { value: 'seed',   label: 'Seed' },
  { value: 'growth', label: 'Growth' },
  { value: 'scale',  label: 'Scale' },
];

export default function ResourceLibrary() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOrgType, setSelectedOrgType] = useState('all');
  const [selectedMaturity, setSelectedMaturity] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingResource, setReviewingResource] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['published-templates'],
    queryFn: async () => {
      const allTemplates = await base44.entities.Template.list('-created_date');
      return allTemplates.filter(t => t.is_active !== false && t.is_published === true);
    },
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['template-favorites', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.TemplateFavorite.filter({ user_email: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['resource-reviews'],
    queryFn: () => base44.entities.ResourceReview.list(),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ resource, isFavorited }) => {
      if (isFavorited) {
        const existingFav = favorites.find(f => f.template_id === resource.id);
        if (existingFav) return await base44.entities.TemplateFavorite.delete(existingFav.id);
      } else {
        return await base44.entities.TemplateFavorite.create({ user_email: user.email, template_id: resource.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['template-favorites']);
      toast.success('Favorites updated');
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: (reviewData) => base44.entities.ResourceReview.create(reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries(['resource-reviews']);
      setReviewDialogOpen(false);
      setReviewingResource(null);
      toast.success('Review submitted');
    },
  });

  const enrichedResources = (templates || []).map(resource => {
    const isFavorited = favorites.some(f => f.template_id === resource.id);
    const resourceReviews = reviews.filter(r => r.resource_id === resource.id);
    const avgRating = resourceReviews.length > 0
      ? resourceReviews.reduce((sum, r) => sum + r.rating, 0) / resourceReviews.length : 0;
    return { ...resource, isFavorited, reviewCount: resourceReviews.length, avgRating };
  });

  const filteredResources = enrichedResources.filter(resource => {
    const matchesSearch = !searchQuery ||
      resource.template_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.purpose?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesOrgType = selectedOrgType === 'all' ||
      !resource.org_type || resource.org_type.length === 0 ||
      resource.org_type.includes(selectedOrgType);
    const matchesMaturity = selectedMaturity === 'all' ||
      resource.maturity_level === selectedMaturity || resource.maturity_level === 'all';
    const matchesFavorites = !showFavoritesOnly || resource.isFavorited;
    return matchesSearch && matchesCategory && matchesOrgType && matchesMaturity && matchesFavorites;
  });

  // Group by category for the "Browse by Category" view
  const byCategory = Object.keys(CATEGORY_CONFIG).reduce((acc, cat) => {
    const items = filteredResources.filter(r => r.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedOrgType !== 'all' || selectedMaturity !== 'all' || showFavoritesOnly;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedOrgType('all');
    setSelectedMaturity('all');
    setShowFavoritesOnly(false);
  };

  const handleDownload = (resource) => {
    window.open(createPageUrl('Projects') + '?template=' + resource.id, '_blank');
  };

  const handlePreview = (resource) => setPreviewResource(resource);

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
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#143A50] mb-2">Resource Library</h1>
          <p className="text-slate-600">Templates, guidebooks, and workbooks to support your funding journey</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-2 border-[#E5C089] shadow-lg">
          <CardContent className="p-5">
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-2 focus:border-[#143A50]"
                />
              </div>

              {/* Category */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-[#143A50] bg-white"
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>

              {/* Org Type */}
              <select
                value={selectedOrgType}
                onChange={(e) => setSelectedOrgType(e.target.value)}
                className="px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-[#143A50] bg-white"
              >
                {ORG_TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* Maturity */}
              <select
                value={selectedMaturity}
                onChange={(e) => setSelectedMaturity(e.target.value)}
                className="px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-[#143A50] bg-white"
              >
                {MATURITY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* Favorites */}
              <Button
                variant={showFavoritesOnly ? 'default' : 'outline'}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={showFavoritesOnly ? 'bg-[#AC1A5B]' : ''}
              >
                <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favorites
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              )}
            </div>

            <div className="mt-3 text-sm text-slate-500">
              {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
              {selectedCategory !== 'all' && ` in ${CATEGORY_CONFIG[selectedCategory]?.label}`}
              {selectedOrgType !== 'all' && ` · ${ORG_TYPE_OPTIONS.find(o => o.value === selectedOrgType)?.label}`}
            </div>
          </CardContent>
        </Card>

        {enrichedResources.length === 0 && (
          <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <span className="text-2xl">🚧</span>
            <div>
              <p className="font-semibold text-amber-900">Resources Coming Soon</p>
              <p className="text-sm text-amber-800 mt-1">
                We're finishing up the Resource Library — templates will be published here shortly. Use the suggestion box below to tell us what you need most!
              </p>
            </div>
          </div>
        )}

        {/* In-Kind Tracker Promo */}
        <Card className="mb-6 border-2 border-[#E5C089] bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white">
          <CardContent className="py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-[#E5C089] text-lg">🎁 In-Kind Contribution Tracker</p>
              <p className="text-sm text-white/80 mt-1">
                Track non-cash gifts, volunteer hours, and recurring partnerships — with IRS acknowledgment tracking, GAAP compliance flags, and an FMV reference library built in.
              </p>
            </div>
            <a href="/InKindTracker">
              <Button className="bg-[#E5C089] hover:bg-[#d4b070] text-[#143A50] font-bold flex-shrink-0">Open Tracker →</Button>
            </a>
          </CardContent>
        </Card>

        <SuggestTemplatePanel userEmail={user?.email} userName={user?.full_name} context="resource_library" />
        <ComingSoonPipeline mode="resources" />

        {/* Category pills for quick navigation when viewing all */}
        {selectedCategory === 'all' && filteredResources.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 mb-4">
            {Object.entries(byCategory).map(([cat, items]) => {
              const cfg = CATEGORY_CONFIG[cat];
              const Icon = cfg.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-slate-200 hover:border-[#143A50] text-sm text-slate-700 bg-white transition-all"
                >
                  <Icon className="w-4 h-4" />
                  {cfg.label} <span className="text-slate-400">({items.length})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Results */}
        {filteredResources.length > 0 && (
          <>
            {selectedCategory === 'all' ? (
              // Grouped by category
              <div className="space-y-10 mt-4">
                {Object.entries(byCategory).map(([cat, items]) => {
                  const cfg = CATEGORY_CONFIG[cat];
                  const Icon = cfg.icon;
                  return (
                    <section key={cat}>
                      <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-slate-100">
                        <Icon className="w-6 h-6 text-[#143A50]" />
                        <h2 className="text-xl font-bold text-[#143A50]">{cfg.label}</h2>
                        <Badge variant="outline" className="ml-auto">{items.length}</Badge>
                      </div>
                      <ResourceGrid
                        resources={items}
                        onDownload={handleDownload}
                        onPreview={handlePreview}
                        onFavorite={(r) => toggleFavoriteMutation.mutate({ resource: r, isFavorited: r.isFavorited })}
                        onReview={(r) => { setReviewingResource(r); setReviewDialogOpen(true); }}
                      />
                    </section>
                  );
                })}
              </div>
            ) : (
              // Single filtered category
              <div className="mt-4">
                <ResourceGrid
                  resources={filteredResources}
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                  onFavorite={(r) => toggleFavoriteMutation.mutate({ resource: r, isFavorited: r.isFavorited })}
                  onReview={(r) => { setReviewingResource(r); setReviewDialogOpen(true); }}
                />
              </div>
            )}
          </>
        )}

        {filteredResources.length === 0 && enrichedResources.length > 0 && (
          <Card className="p-12 text-center mt-4">
            <Filter className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No resources match your filters</h3>
            <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
          </Card>
        )}

        {/* Preview Dialog */}
        {previewResource && (
          <Dialog open={!!previewResource} onOpenChange={() => setPreviewResource(null)}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{previewResource.template_name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const res = await base44.functions.invoke('exportTemplate', { templateId: previewResource.id, templateName: previewResource.template_name, templateContent: previewResource.template_content });
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `${previewResource.template_name.replace(/\s+/g, '_')}.pdf`);
                        document.body.appendChild(link);
                        link.click();
                        link.parentChild.removeChild(link);
                      }}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export PDF
                    </Button>
                    {previewResource.org_type?.length > 0 && (
                      <div className="flex gap-1">
                        {previewResource.org_type.map(ot => (
                          <Badge key={ot} variant="outline" className="text-xs capitalize">{ot.replace('_', ' ')}</Badge>
                        ))}
                      </div>
                    )}
                    <Button size="sm" onClick={() => handleDownload(previewResource)}>
                      <Download className="w-4 h-4 mr-2" />Use Template
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto border rounded-lg bg-white">
                <div className="p-8 max-w-4xl mx-auto">
                  <div className="border-b-4 border-[#143A50] pb-6 mb-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold text-[#143A50] mb-2">{previewResource.template_name}</h1>
                        {previewResource.purpose && (
                          <p className="text-lg text-slate-600 italic">{previewResource.purpose}</p>
                        )}
                      </div>
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png"
                        alt="EIS Logo" className="h-16 w-auto"
                      />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className="bg-[#E5C089] text-[#143A50]">
                        {CATEGORY_CONFIG[previewResource.category]?.label || previewResource.category}
                      </Badge>
                      <Badge variant="outline">{previewResource.maturity_level}</Badge>
                      <span className="text-sm text-slate-500">{previewResource.funding_lane}</span>
                      {previewResource.org_type?.map(ot => (
                        <Badge key={ot} className="bg-slate-100 text-slate-700 capitalize">{ot.replace('_', ' ')}</Badge>
                      ))}
                    </div>
                  </div>

                  {previewResource.when_to_use && (
                    <div className="mb-6 p-4 border-l-4 border-green-500 bg-green-50 rounded-r">
                      <h3 className="text-lg font-bold text-green-800 mb-2">✓ When to Use This Template</h3>
                      <p className="text-green-900">{previewResource.when_to_use}</p>
                    </div>
                  )}
                  {previewResource.when_not_to_use && (
                    <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 rounded-r">
                      <h3 className="text-lg font-bold text-red-800 mb-2">✗ When NOT to Use</h3>
                      <p className="text-red-900">{previewResource.when_not_to_use}</p>
                    </div>
                  )}
                  {previewResource.what_funders_look_for && (
                    <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r">
                      <h3 className="text-lg font-bold text-blue-800 mb-2">👁 What Funders Look For</h3>
                      <p className="text-blue-900">{previewResource.what_funders_look_for}</p>
                    </div>
                  )}
                  {previewResource.common_mistakes && (
                    <div className="mb-6 p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r">
                      <h3 className="text-lg font-bold text-amber-800 mb-2">⚠ Common Mistakes to Avoid</h3>
                      <p className="text-amber-900">{previewResource.common_mistakes}</p>
                    </div>
                  )}

                  {previewResource.template_content && (
                    <div className="mt-8">
                      <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white px-6 py-3 rounded-t-lg">
                        <h2 className="text-xl font-bold">Template Content</h2>
                      </div>
                      <div className="border-2 border-[#143A50] rounded-b-lg bg-white">
                        <BrandedTemplateWrapper>
                          <div dangerouslySetInnerHTML={{ __html: previewResource.template_content }} />
                        </BrandedTemplateWrapper>
                      </div>
                    </div>
                  )}

                  <div className="mt-12 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
                    <p>© Elbert Innovative Solutions | Funding Readiness Resource Library</p>
                    <p className="mt-1">For questions or support, contact your EIS advisor</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {reviewDialogOpen && reviewingResource && (
          <ReviewDialog
            resource={reviewingResource}
            userEmail={user?.email}
            onClose={() => { setReviewDialogOpen(false); setReviewingResource(null); }}
            onSubmit={(data) => submitReviewMutation.mutate(data)}
          />
        )}
      </div>
    </div>
  );
}

function ResourceGrid({ resources, onDownload, onPreview, onFavorite, onReview }) {
  if (resources.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <Card key={resource.id} className={`hover:shadow-xl transition-all border-2 ${resource.isFavorited ? 'border-[#AC1A5B]' : 'hover:border-[#E5C089]'}`}>
          <CardHeader className="bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white">
            <div className="flex items-start justify-between mb-2">
              <FileText className="w-7 h-7 text-[#E5C089]" />
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                  {CATEGORY_CONFIG[resource.category]?.label || resource.category}
                </Badge>
                <button onClick={() => onFavorite(resource)} className="hover:scale-110 transition-transform">
                  <Heart className={`w-5 h-5 ${resource.isFavorited ? 'fill-[#E5C089] text-[#E5C089]' : 'text-white/60'}`} />
                </button>
              </div>
            </div>
            <CardTitle className="text-base leading-snug">{resource.template_name}</CardTitle>
            {resource.purpose && (
              <CardDescription className="text-white/80 text-sm line-clamp-2">{resource.purpose}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-3 flex flex-wrap gap-1">
              {resource.maturity_level && resource.maturity_level !== 'all' && (
                <Badge variant="outline" className="text-xs">{resource.maturity_level}</Badge>
              )}
              {resource.org_type?.map(ot => (
                <Badge key={ot} className="text-xs bg-slate-100 text-slate-600 capitalize border-0">{ot.replace('_', ' ')}</Badge>
              ))}
              {resource.avgRating > 0 && (
                <span className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
                  <Star className="w-3 h-3 fill-[#E5C089] text-[#E5C089]" />
                  {resource.avgRating.toFixed(1)} ({resource.reviewCount})
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onPreview(resource)} className="flex-1">
                <Eye className="w-4 h-4 mr-2" />Preview
              </Button>
              <Button onClick={() => onDownload(resource)} className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]">
                <Download className="w-4 h-4 mr-2" />Use It
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onReview(resource)} className="w-full mt-2 text-slate-500 text-xs">
              <Star className="w-3 h-3 mr-1" />Write a Review
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ReviewDialog({ resource, userEmail, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleSubmit = () => {
    if (rating === 0) { toast.error('Please select a rating'); return; }
    onSubmit({ resource_id: resource.id, user_email: userEmail, rating, review_text: reviewText, is_verified_download: true });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review: {resource.template_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="hover:scale-110 transition-transform">
                  <Star className={`w-8 h-8 ${star <= rating ? 'fill-[#E5C089] text-[#E5C089]' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Your Review (Optional)</label>
            <Textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your thoughts..." rows={4} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-[#143A50]">Submit Review</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}