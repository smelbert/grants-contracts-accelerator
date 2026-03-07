import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Heart, Pin, Plus, TrendingUp, Clock, Search, Home, ChevronRight, Users, Sparkles, ArrowLeft, Hash, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CreateDiscussionForm from '@/components/discussions/CreateDiscussionForm';
import DiscussionReplies from '@/components/discussions/DiscussionReplies';
import { hasPermission, PERMISSIONS } from '@/components/lib/permissions';

export default function DiscussionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSpace, setSelectedSpace] = useState('all');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [expandedDiscussion, setExpandedDiscussion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userAccess } = useQuery({
    queryKey: ['userAccess', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const access = await base44.entities.UserAccessLevel.filter({
        user_email: user.email
      });
      return access[0];
    },
    enabled: !!user?.email
  });

  const { data: allSpaces = [] } = useQuery({
    queryKey: ['communitySpaces'],
    queryFn: () => base44.entities.CommunitySpace.filter({ space_type: 'posts', is_active: true }),
  });

  // Filter spaces based on user access
  const communitySpaces = allSpaces.filter(space => {
    // If user is admin/owner/coach, show all spaces
    if (user?.role === 'admin' || user?.role === 'owner' || user?.role === 'coach') return true;
    
    // Check if space is for IncubateHer program
    if (space.slug === 'incubateher-program' || space.icon === 'Target') {
      return userAccess?.entry_point === 'incubateher_program';
    }
    
    // Check if user has specific space access in allowed_community_spaces
    if (userAccess?.allowed_community_spaces?.includes(space.id)) {
      return true;
    }
    
    // For open spaces, allow if user has general community access
    if (space.visibility === 'public') {
      return true;
    }
    
    return false;
  });

  // Parse URL parameters for space filter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const spaceSlug = params.get('space');
    if (spaceSlug && communitySpaces.length > 0) {
      const space = communitySpaces.find(s => s.slug === spaceSlug);
      if (space) {
        setSelectedSpace(space.id);
      } else {
        // If space not found or no access, redirect to first available space
        if (communitySpaces.length > 0) {
          setSelectedSpace(communitySpaces[0].id);
        }
      }
    }
  }, [communitySpaces]);

  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions'],
    queryFn: () => base44.entities.Discussion.list('-created_date'),
  });

  const likeDiscussionMutation = useMutation({
    mutationFn: (discussion) => base44.entities.Discussion.update(discussion.id, {
      total_likes: (discussion.total_likes || 0) + 1
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
  });

  const canCreateDiscussions = hasPermission(user?.role, PERMISSIONS.CREATE_DISCUSSIONS);

  let filteredDiscussions = discussions.filter(d => {
    const categoryMatch = selectedCategory === 'all' || d.category === selectedCategory;
    const spaceMatch = selectedSpace === 'all' || d.space_id === selectedSpace;
    const searchMatch = !searchQuery || 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Only show discussions from spaces user has access to
    const hasSpaceAccess = communitySpaces.some(s => s.id === d.space_id) || !d.space_id;
    
    return categoryMatch && spaceMatch && searchMatch && hasSpaceAccess;
  });

  if (sortBy === 'recent') {
    filteredDiscussions = [...filteredDiscussions].sort((a, b) => 
      new Date(b.created_date) - new Date(a.created_date)
    );
  } else if (sortBy === 'popular') {
    filteredDiscussions = [...filteredDiscussions].sort((a, b) => 
      (b.total_likes || 0) - (a.total_likes || 0)
    );
  } else if (sortBy === 'active') {
    filteredDiscussions = [...filteredDiscussions].sort((a, b) => 
      (b.total_replies || 0) - (a.total_replies || 0)
    );
  }

  const pinnedPosts = filteredDiscussions.filter(d => d.is_pinned);
  const regularPosts = filteredDiscussions.filter(d => !d.is_pinned);

  const categories = ['general', 'grants', 'contracts', 'donors', 'strategy'];
  const selectedSpaceData = communitySpaces.find(s => s.id === selectedSpace);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link to={createPageUrl('Community')} className="hover:text-[#143A50] flex items-center gap-1">
              <Home className="w-4 h-4" />
              Community
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">Discussions</span>
            {selectedSpaceData && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#143A50] font-medium">{selectedSpaceData.space_name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Create Button - Mobile */}
              {canCreateDiscussions && (
                <Button 
                  onClick={() => setShowNewPostForm(true)} 
                  className="w-full lg:hidden bg-[#143A50] hover:bg-[#1E4F58]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Discussion
                </Button>
              )}

              {/* Spaces Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Community Spaces</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <button
                    onClick={() => setSelectedSpace('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedSpace === 'all' 
                        ? 'bg-[#143A50] text-white' 
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    All Spaces
                  </button>
                  {communitySpaces.map(space => (
                    <button
                      key={space.id}
                      onClick={() => setSelectedSpace(space.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedSpace === space.id 
                          ? 'bg-[#143A50] text-white' 
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{space.space_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {space.content_count || 0}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Categories Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedCategory === 'all' 
                        ? 'bg-[#143A50] text-white' 
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition capitalize ${
                        selectedCategory === cat 
                          ? 'bg-[#143A50] text-white' 
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Community Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Discussions</span>
                    <span className="font-semibold text-[#143A50]">{discussions.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total Replies</span>
                    <span className="font-semibold text-[#143A50]">
                      {discussions.reduce((sum, d) => sum + (d.total_replies || 0), 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Active Today</span>
                    <span className="font-semibold text-green-600">
                      {discussions.filter(d => {
                        const today = new Date().toDateString();
                        return new Date(d.created_date).toDateString() === today;
                      }).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {selectedSpaceData ? selectedSpaceData.space_name : 'All Discussions'}
                  </h1>
                  <p className="text-slate-600 mt-1">
                    {selectedSpaceData?.welcome_message || selectedSpaceData?.description || 'Browse all community discussions'}
                  </p>
                </div>
                {canCreateDiscussions && (
                  <Button 
                    onClick={() => setShowNewPostForm(true)} 
                    className="hidden lg:flex bg-[#143A50] hover:bg-[#1E4F58]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Discussion
                  </Button>
                )}
              </div>

              {/* Search and Sort */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Most Recent
                      </div>
                    </SelectItem>
                    <SelectItem value="popular">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Most Popular
                      </div>
                    </SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Most Active
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters Display */}
              {(selectedCategory !== 'all' || selectedSpace !== 'all' || searchQuery) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-sm text-slate-600">Active filters:</span>
                  {selectedCategory !== 'all' && (
                    <Badge variant="outline" className="capitalize">
                      {selectedCategory}
                      <button onClick={() => setSelectedCategory('all')} className="ml-2">×</button>
                    </Badge>
                  )}
                  {selectedSpace !== 'all' && selectedSpaceData && (
                    <Badge variant="outline">
                      {selectedSpaceData.space_name}
                      <button onClick={() => setSelectedSpace('all')} className="ml-2">×</button>
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="outline">
                      Search: "{searchQuery}"
                      <button onClick={() => setSearchQuery('')} className="ml-2">×</button>
                    </Badge>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSpace('all');
                      setSearchQuery('');
                    }}
                    className="text-xs text-[#143A50] hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Pinned Posts */}
            {pinnedPosts.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Pin className="w-5 h-5 text-[#E5C089]" />
                  Pinned Discussions
                </h2>
                <div className="space-y-4">
                  {pinnedPosts.map(discussion => (
                    <DiscussionCard 
                      key={discussion.id} 
                      discussion={discussion} 
                      user={user}
                      isPinned
                      isExpanded={expandedDiscussion === discussion.id}
                      onToggleExpand={() => setExpandedDiscussion(expandedDiscussion === discussion.id ? null : discussion.id)}
                      onLike={() => likeDiscussionMutation.mutate(discussion)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Posts */}
            <div className="space-y-4">
              {regularPosts.length > 0 ? (
                regularPosts.map(discussion => (
                  <DiscussionCard 
                    key={discussion.id} 
                    discussion={discussion}
                    user={user}
                    isExpanded={expandedDiscussion === discussion.id}
                    onToggleExpand={() => setExpandedDiscussion(expandedDiscussion === discussion.id ? null : discussion.id)}
                    onLike={() => likeDiscussionMutation.mutate(discussion)}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {searchQuery ? 'No discussions found' : 'No discussions yet'}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {searchQuery 
                        ? 'Try adjusting your search or filters' 
                        : 'Be the first to start a conversation!'}
                    </p>
                    {canCreateDiscussions && !searchQuery && (
                      <Button onClick={() => setShowNewPostForm(true)} className="bg-[#143A50] hover:bg-[#1E4F58]">
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Post
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        <CreateDiscussionForm
          open={showNewPostForm}
          onOpenChange={setShowNewPostForm}
          userEmail={user?.email}
          userName={user?.full_name}
          spaceId={selectedSpace !== 'all' ? selectedSpace : null}
        />
      </div>
    </div>
  );
}

function DiscussionCard({ discussion, user, isPinned, isExpanded, onToggleExpand, onLike }) {
  const categoryColors = {
    general: 'bg-slate-100 text-slate-700',
    grants: 'bg-emerald-100 text-emerald-700',
    contracts: 'bg-blue-100 text-blue-700',
    donors: 'bg-purple-100 text-purple-700',
    strategy: 'bg-amber-100 text-amber-700'
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${isPinned ? 'border-2 border-[#E5C089] bg-amber-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {isPinned && (
                <div className="flex items-center gap-1 bg-[#E5C089]/20 text-[#A65D40] px-2 py-1 rounded-full text-xs font-medium">
                  <Pin className="w-3 h-3" />
                  Pinned
                </div>
              )}
              <Badge className={categoryColors[discussion.category] || categoryColors.general}>
                {discussion.category}
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 mb-3 hover:text-[#143A50] transition-colors cursor-pointer">
              {discussion.title}
            </CardTitle>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#143A50] to-[#1E4F58] flex items-center justify-center text-white text-xs font-medium">
                  {discussion.author_name?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="font-medium text-slate-900">{discussion.author_name}</span>
              </div>
              <span className="text-slate-400">•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{format(new Date(discussion.created_date), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-700 leading-relaxed">{discussion.content}</p>
        
        {discussion.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {discussion.tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs bg-slate-50">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 pt-3 border-t">
          <button 
            onClick={onLike}
            className="flex items-center gap-2 text-sm font-medium hover:text-red-500 transition-colors group"
          >
            <div className={`p-2 rounded-full transition-colors ${discussion.total_likes > 0 ? 'bg-red-50' : 'bg-slate-50 group-hover:bg-red-50'}`}>
              <Heart className={`w-4 h-4 ${discussion.total_likes > 0 ? 'fill-red-500 text-red-500' : 'text-slate-600 group-hover:text-red-500'}`} />
            </div>
            <span className={discussion.total_likes > 0 ? 'text-red-600' : 'text-slate-600'}>
              {discussion.total_likes || 0}
            </span>
          </button>
          
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-2 text-sm font-medium hover:text-[#143A50] transition-colors group"
          >
            <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-[#143A50]/10' : 'bg-slate-50 group-hover:bg-[#143A50]/10'}`}>
              <MessageSquare className={`w-4 h-4 ${isExpanded ? 'text-[#143A50]' : 'text-slate-600 group-hover:text-[#143A50]'}`} />
            </div>
            <span className={isExpanded ? 'text-[#143A50]' : 'text-slate-600'}>
              {discussion.total_replies || 0} {discussion.total_replies === 1 ? 'reply' : 'replies'}
            </span>
          </button>
        </div>

        {isExpanded && user && (
          <div className="pt-4 border-t bg-slate-50/50 -mx-6 px-6 -mb-6 pb-6 rounded-b-xl">
            <DiscussionReplies 
              discussionId={discussion.id}
              userEmail={user.email}
              userName={user.full_name}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}