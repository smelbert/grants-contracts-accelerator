import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Download, FileText, BookOpen, Heart, Star, Eye } from 'lucide-react';
import { toast } from 'sonner';
import BrandedTemplateWrapper from '@/components/templates/BrandedTemplateWrapper';
import SuggestTemplatePanel from '@/components/incubateher/SuggestTemplatePanel';
import ComingSoonPipeline from '@/components/library/ComingSoonPipeline';
import { createPageUrl } from '@/utils';

const CATEGORY_LABELS = {
  foundational: 'Foundational / Readiness',
  financial_compliance: 'Financial & Compliance',
  grant_writing: 'Grant Writing Core',
  renewals: 'Renewals & Continuation',
  contracts_rfp: 'Contracts & RFP',
  donor_philanthropy: 'Donor & Philanthropy',
  public_funding: 'Public Funding & Civic',
  strategic: 'Strategic & Sustainability',
  ai_tools: 'AI-Supported Tools',
  quality_tools: 'Review & Quality',
  meta_resources: 'Meta-Resources'
};

export default function ResourceLibrary() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
      return await base44.entities.TemplateFavorite.filter({
        user_email: user.email
      });
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
        if (existingFav) {
          return await base44.entities.TemplateFavorite.delete(existingFav.id);
        }
      } else {
        return await base44.entities.TemplateFavorite.create({
          user_email: user.email,
          template_id: resource.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['template-favorites']);
      toast.success('Favorites updated');
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      return await base44.entities.ResourceReview.create(reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['resource-reviews']);
      setReviewDialogOpen(false);
      setReviewingResource(null);
      toast.success('Review submitted');
    },
  });

  const enrichedResources = templates?.map(resource => {
    const isFavorited = favorites.some(f => f.template_id === resource.id);
    const resourceReviews = reviews.filter(r => r.resource_id === resource.id);
    const avgRating = resourceReviews.length > 0
      ? resourceReviews.reduce((sum, r) => sum + r.rating, 0) / resourceReviews.length
      : 0;

    return { ...resource, isFavorited, reviewCount: resourceReviews.length, avgRating };
  }) || [];

  const filteredResources = enrichedResources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.template_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.purpose?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || resource.isFavorited;
    
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const workbookTemplates = filteredResources.filter(r => 
    r.category === 'foundational' || r.subcategory?.toLowerCase().includes('workbook')
  );
  const otherResources = filteredResources.filter(r => 
    r.category !== 'foundational' && !r.subcategory?.toLowerCase().includes('workbook')
  );

  const handleDownload = (resource) => {
    toast.success('Opening print dialog...');
    window.open(createPageUrl('CreateProject') + '?template=' + resource.id, '_blank');
  };
  
  const handleDirectDownload = (resource) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${resource.template_name}</title>
          <style>
            body { font-family: Georgia, serif; line-height: 1.8; padding: 2cm; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>${resource.template_name}</h1>
          ${resource.template_content || ''}
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePreview = (resource) => {
    setPreviewResource(resource);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#143A50] mb-2">Resource Library</h1>
          <p className="text-slate-600">
            Download templates, guidebooks, and workbooks to support your funding journey
          </p>
        </div>

        <Card className="mb-6 border-2 border-[#E5C089] shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
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

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {filteredResources.length} resources found
                </span>
                {(searchQuery || selectedCategory !== 'all' || showFavoritesOnly) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
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

        {enrichedResources.length === 0 && !isLoading && (
          <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <span className="text-2xl">🚧</span>
            <div>
              <p className="font-semibold text-amber-900">Resources Coming Soon</p>
              <p className="text-sm text-amber-800 mt-1">
                We're finishing up the Resource Library — templates will be published here shortly. In the meantime, use the suggestion box below to tell us what you need most!
              </p>
            </div>
          </div>
        )}

        <SuggestTemplatePanel userEmail={user?.email} userName={user?.full_name} context="resource_library" />

        <ComingSoonPipeline mode="resources" />

        <Tabs defaultValue="all" className="space-y-6 mt-8">
          <TabsList>
            <TabsTrigger value="all">
              <FileText className="w-4 h-4 mr-2" />
              All Resources ({filteredResources.length})
            </TabsTrigger>
            <TabsTrigger value="workbooks">
              <BookOpen className="w-4 h-4 mr-2" />
              Workbook Templates ({workbookTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="w-4 h-4 mr-2" />
              Templates & Guides ({otherResources.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-[#143A50] mb-2">All Resources</h2>
              <p className="text-slate-600">Complete library of templates, workbooks, and guides</p>
            </div>
            <ResourceGrid 
              resources={filteredResources}
              onDownload={handleDownload}
              onPreview={handlePreview}
              onFavorite={(resource) => toggleFavoriteMutation.mutate({ resource, isFavorited: resource.isFavorited })}
              onReview={(resource) => {
                setReviewingResource(resource);
                setReviewDialogOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="workbooks">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-[#143A50] mb-2">Workbook Templates</h2>
              <p className="text-slate-600">Fillable workbooks to guide your planning and development</p>
            </div>
            <ResourceGrid 
              resources={workbookTemplates}
              onDownload={handleDownload}
              onPreview={handlePreview}
              onFavorite={(resource) => toggleFavoriteMutation.mutate({ resource, isFavorited: resource.isFavorited })}
              onReview={(resource) => {
                setReviewingResource(resource);
                setReviewDialogOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="templates">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-[#143A50] mb-2">Templates & Guides</h2>
              <p className="text-slate-600">Essential documents and guides for your funding work</p>
            </div>
            <ResourceGrid 
              resources={otherResources}
              onDownload={handleDownload}
              onPreview={handlePreview}
              onFavorite={(resource) => toggleFavoriteMutation.mutate({ resource, isFavorited: resource.isFavorited })}
              onReview={(resource) => {
                setReviewingResource(resource);
                setReviewDialogOpen(true);
              }}
            />
          </TabsContent>
        </Tabs>

        {previewResource && (
          <Dialog open={!!previewResource} onOpenChange={() => setPreviewResource(null)}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{previewResource.template_name}</span>
                  <Button size="sm" onClick={() => handleDownload(previewResource)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto border rounded-lg bg-white">
                <div className="p-8 max-w-4xl mx-auto">
                  {/* Professional Header */}
                  <div className="border-b-4 border-[#143A50] pb-6 mb-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold text-[#143A50] mb-2">
                          {previewResource.template_name}
                        </h1>
                        {previewResource.purpose && (
                          <p className="text-lg text-slate-600 italic">
                            {previewResource.purpose}
                          </p>
                        )}
                      </div>
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png" 
                        alt="EIS Logo" 
                        className="h-16 w-auto"
                      />
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge className="bg-[#E5C089] text-[#143A50]">
                        {CATEGORY_LABELS[previewResource.category] || previewResource.category}
                      </Badge>
                      <Badge variant="outline">
                        {previewResource.maturity_level}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        {previewResource.funding_lane}
                      </span>
                    </div>
                  </div>

                  {/* Guidance Sections */}
                  {previewResource.when_to_use && (
                    <div className="mb-6 p-4 border-l-4 border-green-500 bg-green-50 rounded-r">
                      <h3 className="text-lg font-bold text-green-800 mb-2 flex items-center gap-2">
                        <span className="text-2xl">✓</span> When to Use This Template
                      </h3>
                      <p className="text-green-900">{previewResource.when_to_use}</p>
                    </div>
                  )}

                  {previewResource.when_not_to_use && (
                    <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 rounded-r">
                      <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center gap-2">
                        <span className="text-2xl">✗</span> When NOT to Use
                      </h3>
                      <p className="text-red-900">{previewResource.when_not_to_use}</p>
                    </div>
                  )}

                  {previewResource.what_funders_look_for && (
                    <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r">
                      <h3 className="text-lg font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <span className="text-2xl">👁</span> What Funders Look For
                      </h3>
                      <p className="text-blue-900">{previewResource.what_funders_look_for}</p>
                    </div>
                  )}

                  {previewResource.common_mistakes && (
                    <div className="mb-6 p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r">
                      <h3 className="text-lg font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <span className="text-2xl">⚠</span> Common Mistakes to Avoid
                      </h3>
                      <p className="text-amber-900">{previewResource.common_mistakes}</p>
                    </div>
                  )}

                  {/* Template Content */}
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

                  {/* Footer */}
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
            onClose={() => {
              setReviewDialogOpen(false);
              setReviewingResource(null);
            }}
            onSubmit={(reviewData) => submitReviewMutation.mutate(reviewData)}
          />
        )}
      </div>
    </div>
  );
}

function ResourceGrid({ resources, onDownload, onPreview, onFavorite, onReview }) {
  if (resources.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 mb-2">No resources found</h3>
        <p className="text-slate-500">Try adjusting your search or filter criteria</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <Card key={resource.id} className={`hover:shadow-xl transition-all border-2 ${resource.isFavorited ? 'border-[#AC1A5B]' : 'hover:border-[#E5C089]'}`}>
          <CardHeader className="bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white">
            <div className="flex items-start justify-between mb-2">
              <FileText className="w-8 h-8 text-[#E5C089]" />
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {CATEGORY_LABELS[resource.category] || resource.category}
                </Badge>
                <button
                  onClick={() => onFavorite(resource)}
                  className="hover:scale-110 transition-transform"
                >
                  <Heart 
                    className={`w-5 h-5 ${resource.isFavorited ? 'fill-[#E5C089] text-[#E5C089]' : 'text-white/60'}`}
                  />
                </button>
              </div>
            </div>
            <CardTitle className="text-lg">{resource.template_name}</CardTitle>
            {resource.purpose && (
              <CardDescription className="text-white/80 text-sm">
                {resource.purpose}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-3 space-y-2">
              {resource.avgRating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= resource.avgRating ? 'fill-[#E5C089] text-[#E5C089]' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600">
                    {resource.avgRating.toFixed(1)} ({resource.reviewCount} reviews)
                  </span>
                </div>
              )}
              {resource.maturity_level && (
                <Badge variant="outline" className="text-xs">
                  {resource.maturity_level}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => onPreview(resource)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={() => onDownload(resource)}
                className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]"
              >
                <Download className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReview(resource)}
              className="w-full mt-2 text-slate-600"
            >
              <Star className="w-4 h-4 mr-2" />
              Write a Review
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
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    onSubmit({
      resource_id: resource.id,
      user_email: userEmail,
      rating,
      review_text: reviewText,
      is_verified_download: true
    });
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
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${star <= rating ? 'fill-[#E5C089] text-[#E5C089]' : 'text-slate-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Your Review (Optional)</label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this resource..."
              rows={4}
            />
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