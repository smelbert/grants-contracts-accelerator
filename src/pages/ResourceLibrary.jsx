import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Download, FileText, BookOpen, Target, Heart, Star, Eye, X } from 'lucide-react';
import { toast } from 'sonner';

const RESOURCE_CATEGORIES = [
  { value: 'all', label: 'All Resources', icon: FileText },
  { value: 'template', label: 'Templates', icon: FileText },
  { value: 'guidebook', label: 'Guidebooks', icon: BookOpen },
  { value: 'worksheet', label: 'Worksheets', icon: FileText },
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingResource, setReviewingResource] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: resources, isLoading } = useQuery({
    queryKey: ['standalone-resources'],
    queryFn: async () => {
      return await base44.entities.LearningContent.filter({
        is_standalone_resource: true
      });
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

  const { data: reviews = [] } = useQuery({
    queryKey: ['resource-reviews'],
    queryFn: () => base44.entities.ResourceReview.list(),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ resource, isFavorited }) => {
      if (isFavorited) {
        const existingFav = favorites.find(f => f.resource_id === resource.id);
        if (existingFav) {
          return await base44.entities.ResourceFavorite.delete(existingFav.id);
        }
      } else {
        return await base44.entities.ResourceFavorite.create({
          user_email: user.email,
          resource_type: resource.content_type,
          resource_id: resource.id,
          resource_title: resource.title,
          resource_url: resource.file_url,
          resource_metadata: {
            description: resource.description,
            funding_lane: resource.funding_lane
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['resource-favorites']);
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

  const enrichedResources = resources?.map(resource => {
    const isFavorited = favorites.some(f => f.resource_id === resource.id);
    const resourceReviews = reviews.filter(r => r.resource_id === resource.id);
    const avgRating = resourceReviews.length > 0
      ? resourceReviews.reduce((sum, r) => sum + r.rating, 0) / resourceReviews.length
      : 0;

    return { ...resource, isFavorited, reviewCount: resourceReviews.length, avgRating };
  }) || [];

  const filteredResources = enrichedResources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || resource.content_type === selectedCategory;
    const matchesStage = selectedStage === 'all';
    const matchesFavorites = !showFavoritesOnly || resource.isFavorited;
    
    return matchesSearch && matchesCategory && matchesStage && matchesFavorites;
  });

  const workbookTemplates = filteredResources.filter(r => 
    r.content_type === 'guidebook' || r.title?.toLowerCase().includes('workbook')
  );
  const otherResources = filteredResources.filter(r => 
    r.content_type !== 'guidebook' && !r.title?.toLowerCase().includes('workbook')
  );

  const handleDownload = (resource) => {
    window.open(resource.file_url, '_blank');
    toast.success('Download started');
  };

  const handlePreview = (resource) => {
    if (resource.file_url?.toLowerCase().endsWith('.pdf')) {
      setPreviewResource(resource);
    } else {
      toast.error('Preview is only available for PDF files');
    }
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
            Download templates, guidebooks, and workbooks to support your funding journey
          </p>
        </div>

        {/* Search and Filter */}
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
                {(searchQuery || selectedCategory !== 'all' || selectedStage !== 'all' || showFavoritesOnly) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
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

        <Tabs defaultValue="workbooks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="workbooks">
              <BookOpen className="w-4 h-4 mr-2" />
              Workbook Templates ({workbookTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="other">
              <FileText className="w-4 h-4 mr-2" />
              Templates & Guides ({otherResources.length})
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="other">
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

        {/* PDF Preview Dialog */}
        {previewResource && (
          <Dialog open={!!previewResource} onOpenChange={() => setPreviewResource(null)}>
            <DialogContent className="max-w-6xl h-[90vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{previewResource.title}</span>
                  <Button size="sm" onClick={() => handleDownload(previewResource)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 h-full">
                <iframe
                  src={previewResource.file_url}
                  className="w-full h-full rounded-lg border"
                  title="PDF Preview"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Review Dialog */}
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
                  {resource.content_type?.toUpperCase()}
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
            <CardTitle className="text-lg">{resource.title}</CardTitle>
            {resource.description && (
              <CardDescription className="text-white/80 text-sm">
                {resource.description}
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
              {resource.funding_lane && (
                <Badge variant="outline" className="text-xs">
                  {resource.funding_lane}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {resource.file_url?.toLowerCase().endsWith('.pdf') && (
                <Button 
                  variant="outline"
                  onClick={() => onPreview(resource)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button 
                onClick={() => onDownload(resource)}
                className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
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
          <DialogTitle>Review: {resource.title}</DialogTitle>
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