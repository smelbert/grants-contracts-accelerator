import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Plus, ThumbsUp, MessageCircle, Pin } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function DiscussionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState('all');

  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions'],
    queryFn: () => base44.entities.Discussion.list('-created_date'),
  });

  const { data: spaces = [] } = useQuery({
    queryKey: ['communitySpaces'],
    queryFn: () => base44.entities.CommunitySpace.filter({ space_type: 'posts', is_active: true }),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const categories = ['all', 'general', 'grants', 'contracts', 'fundraising', 'questions', 'success_stories'];

  const filteredDiscussions = selectedCategory === 'all' 
    ? discussions 
    : discussions.filter(d => d.category === selectedCategory);

  const pinnedPosts = filteredDiscussions.filter(d => d.is_pinned);
  const regularPosts = filteredDiscussions.filter(d => !d.is_pinned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-orange-600" />
              Community Discussions
            </h1>
            <p className="text-slate-600 mt-2">Ask questions, share knowledge, and connect</p>
          </div>
          <Button onClick={() => setShowNewPost(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        {spaces.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-2">Space:</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedSpace === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSpace('all')}
              >
                All Spaces
              </Button>
              {spaces.map(space => (
                <Button
                  key={space.id}
                  variant={selectedSpace === space.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSpace(space.id)}
                >
                  {space.space_name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.replace('_', ' ')}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {pinnedPosts.map(post => (
            <DiscussionCard key={post.id} discussion={post} isPinned />
          ))}
          {regularPosts.map(post => (
            <DiscussionCard key={post.id} discussion={post} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DiscussionCard({ discussion, isPinned }) {
  return (
    <Card className={isPinned ? 'border-orange-500 border-2' : ''}>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded">
              <ThumbsUp className="w-5 h-5 text-slate-400" />
            </button>
            <span className="text-sm font-medium">{discussion.total_likes}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {isPinned && <Pin className="w-4 h-4 text-orange-600" />}
                  {discussion.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                  <span>{discussion.author_name}</span>
                  <span>•</span>
                  <span>{format(new Date(discussion.created_date), 'MMM d')}</span>
                </div>
              </div>
              <Badge variant="outline">{discussion.category}</Badge>
            </div>
            <p className="text-sm text-slate-700 mb-3 line-clamp-2">{discussion.content}</p>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {discussion.total_replies} replies
              </div>
              {discussion.tags && discussion.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}