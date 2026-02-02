import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Heart, Pin, Plus, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import CreateDiscussionForm from '@/components/discussions/CreateDiscussionForm';
import DiscussionReplies from '@/components/discussions/DiscussionReplies';
import { hasPermission, PERMISSIONS } from '@/components/lib/permissions';

export default function DiscussionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSpace, setSelectedSpace] = useState('all');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [expandedDiscussion, setExpandedDiscussion] = useState(null);
  const queryClient = useQueryClient();

  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions'],
    queryFn: () => base44.entities.Discussion.list('-created_date'),
  });

  const { data: communitySpaces = [] } = useQuery({
    queryKey: ['communitySpaces'],
    queryFn: () => base44.entities.CommunitySpace.filter({ space_type: 'posts', is_active: true }),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
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
    return categoryMatch && spaceMatch;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#143A50] via-[#1E4F58] to-[#143A50] text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#143A50]/90 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#E5C089] bg-clip-text text-transparent">
                Community Discussions
              </h1>
              <p className="text-lg text-blue-100 mb-6">
                Ask questions, share knowledge, and connect with fellow changemakers
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <MessageSquare className="w-4 h-4" />
                  <span>{discussions.length} discussions</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>{discussions.reduce((sum, d) => sum + (d.total_replies || 0), 0)} replies</span>
                </div>
              </div>
            </div>
            {canCreateDiscussions && (
              <Button 
                onClick={() => setShowNewPostForm(true)} 
                size="lg"
                className="bg-[#E5C089] text-[#143A50] hover:bg-[#E5C089]/90 shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start Discussion
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="mb-6 border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 mb-3">Filter by Space</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedSpace === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedSpace('all')}
                    size="sm"
                    className={selectedSpace === 'all' ? 'bg-[#143A50] hover:bg-[#1E4F58]' : ''}
                  >
                    All Spaces
                  </Button>
                  {communitySpaces.map(space => (
                    <Button
                      key={space.id}
                      variant={selectedSpace === space.id ? 'default' : 'outline'}
                      onClick={() => setSelectedSpace(space.id)}
                      size="sm"
                      className={selectedSpace === space.id ? 'bg-[#143A50] hover:bg-[#1E4F58]' : ''}
                    >
                      {space.space_name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="lg:w-48">
                <p className="text-sm font-medium text-slate-700 mb-3">Sort By</p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
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
            </div>
          </CardContent>
        </Card>

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
            <Card className="border-none shadow-lg">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No discussions yet</h3>
                <p className="text-slate-600 mb-4">Be the first to start a conversation!</p>
                {canCreateDiscussions && (
                  <Button onClick={() => setShowNewPostForm(true)} className="bg-[#143A50] hover:bg-[#1E4F58]">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
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
    <Card className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 ${isPinned ? 'ring-2 ring-[#E5C089] bg-gradient-to-br from-amber-50/50 to-white' : 'bg-white/80 backdrop-blur-sm'}`}>
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