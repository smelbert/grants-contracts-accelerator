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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Discussions</h1>
            <p className="text-slate-600 mt-1">Ask questions, share knowledge, and connect</p>
          </div>
          {canCreateDiscussions && (
            <Button onClick={() => setShowNewPostForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-wrap gap-2 flex-1">
            <Button
              variant={selectedSpace === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedSpace('all')}
              size="sm"
            >
              All Spaces
            </Button>
            {communitySpaces.map(space => (
              <Button
                key={space.id}
                variant={selectedSpace === space.id ? 'default' : 'outline'}
                onClick={() => setSelectedSpace(space.id)}
                size="sm"
              >
                {space.space_name}
              </Button>
            ))}
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="active">Most Active</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
          {regularPosts.map(discussion => (
            <DiscussionCard 
              key={discussion.id} 
              discussion={discussion}
              user={user}
              isExpanded={expandedDiscussion === discussion.id}
              onToggleExpand={() => setExpandedDiscussion(expandedDiscussion === discussion.id ? null : discussion.id)}
              onLike={() => likeDiscussionMutation.mutate(discussion)}
            />
          ))}
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
  return (
    <Card className={isPinned ? 'border-emerald-500 border-2' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isPinned && <Pin className="w-4 h-4 text-emerald-600" />}
              <CardTitle className="text-lg">{discussion.title}</CardTitle>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span>{discussion.author_name}</span>
              <span>•</span>
              <span>{format(new Date(discussion.created_date), 'MMM d, yyyy')}</span>
              <Badge variant="outline">{discussion.category}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-700">{discussion.content}</p>
        
        <div className="flex items-center gap-4 text-sm">
          <button 
            onClick={onLike}
            className="flex items-center gap-1 hover:text-red-500 transition-colors"
          >
            <Heart className={`w-4 h-4 ${discussion.total_likes > 0 ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
            {discussion.total_likes || 0}
          </button>
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1 text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            {discussion.total_replies || 0} replies
          </button>
          {discussion.tags?.length > 0 && (
            <div className="flex gap-1 ml-auto">
              {discussion.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {isExpanded && user && (
          <div className="border-t pt-4">
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