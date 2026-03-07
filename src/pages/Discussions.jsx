import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, MessageCircle, Share2, Search, Pin, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Discussions() {
  const queryClient = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const spaceSlug = params.get('space');

  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [newDiscussionData, setNewDiscussionData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });
  const [newReply, setNewReply] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: space } = useQuery({
    queryKey: ['communitySpace', spaceSlug],
    queryFn: () => base44.entities.CommunitySpace.filter({ slug: spaceSlug }).then(res => res[0]),
    enabled: !!spaceSlug,
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions', space?.id],
    queryFn: () => {
      if (!space?.id) return [];
      return base44.entities.Discussion.filter({}, '-created_date', 50);
    },
    enabled: !!space?.id,
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['replies', selectedDiscussion?.id],
    queryFn: () => {
      if (!selectedDiscussion?.id) return [];
      return base44.entities.DiscussionReply.filter({ discussion_id: selectedDiscussion.id }, '-created_date');
    },
    enabled: !!selectedDiscussion?.id,
  });

  const createDiscussionMutation = useMutation({
    mutationFn: (data) => base44.entities.Discussion.create({
      ...data,
      author_email: user.email,
      author_name: user.full_name,
      tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions', space?.id] });
      setShowNewDiscussion(false);
      setNewDiscussionData({ title: '', content: '', category: 'general', tags: '' });
    }
  });

  const createReplyMutation = useMutation({
    mutationFn: (content) => base44.entities.DiscussionReply.create({
      discussion_id: selectedDiscussion.id,
      content,
      author_email: user.email,
      author_name: user.full_name,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies', selectedDiscussion?.id] });
      setNewReply('');
    }
  });

  const likeMutation = useMutation({
    mutationFn: (discussionId) => base44.entities.Discussion.update(discussionId, { 
      total_likes: (discussions.find(d => d.id === discussionId)?.total_likes || 0) + 1 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions', space?.id] });
    }
  });

  const filteredDiscussions = discussions.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || d.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (!space) {
    return <div className="flex items-center justify-center min-h-screen text-slate-600">Loading space...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-2">{space.space_name}</h1>
          <p className="text-[#E5C089]/90">{space.description}</p>
          {space.welcome_message && (
            <p className="text-white/70 mt-4 italic">{space.welcome_message}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Search & Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={showNewDiscussion} onOpenChange={setShowNewDiscussion}>
              <DialogTrigger asChild>
                <Button className="bg-[#143A50] hover:bg-[#1E4F58] px-6">
                  + Start Discussion
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Start a New Discussion</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createDiscussionMutation.mutate(newDiscussionData);
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      placeholder="What's your question or topic?"
                      value={newDiscussionData.title}
                      onChange={(e) => setNewDiscussionData({...newDiscussionData, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      placeholder="Share more details..."
                      value={newDiscussionData.content}
                      onChange={(e) => setNewDiscussionData({...newDiscussionData, content: e.target.value})}
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={newDiscussionData.category}
                        onChange={(e) => setNewDiscussionData({...newDiscussionData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      >
                        <option value="general">General</option>
                        <option value="questions">Questions</option>
                        <option value="success_stories">Success Stories</option>
                        <option value="resources">Resources</option>
                        <option value="grants">Grants</option>
                        <option value="contracts">Contracts</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                      <Input
                        placeholder="e.g., grants, nonprofit, budget"
                        value={newDiscussionData.tags}
                        onChange={(e) => setNewDiscussionData({...newDiscussionData, tags: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end mt-6">
                    <Button type="button" variant="outline" onClick={() => setShowNewDiscussion(false)}>Cancel</Button>
                    <Button type="submit" className="bg-[#143A50] hover:bg-[#1E4F58]">Post Discussion</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'general', 'questions', 'success_stories', 'resources'].map(cat => (
              <Badge
                key={cat}
                variant={filterCategory === cat ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setFilterCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Discussion Feed */}
        <div className="space-y-4">
          {filteredDiscussions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-slate-600">No discussions yet. Be the first to start one!</p>
            </Card>
          ) : (
            filteredDiscussions.map((discussion, idx) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-[#143A50] hover:border-[#AC1A5B]"
                  onClick={() => setSelectedDiscussion(discussion)}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {discussion.is_pinned && <Pin className="w-4 h-4 text-red-500" />}
                            {discussion.is_locked && <Lock className="w-4 h-4 text-slate-400" />}
                            <Badge className="bg-[#143A50]">{discussion.category || 'general'}</Badge>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 hover:text-[#143A50] transition-colors">
                            {discussion.title}
                          </h3>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <p className="text-slate-600 line-clamp-2">{discussion.content}</p>

                      {/* Tags */}
                      {discussion.tags && discussion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {discussion.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">#{tag}</Badge>
                          ))}
                          {discussion.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">+{discussion.tags.length - 3}</Badge>
                          )}
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-slate-500 pt-3 border-t">
                        <div className="flex items-center gap-4">
                          <span>By <strong>{discussion.author_name || 'Anonymous'}</strong></span>
                          <span>{new Date(discussion.created_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 hover:text-[#143A50] transition-colors" onClick={(e) => { e.stopPropagation(); likeMutation.mutate(discussion.id); }}>
                            <Heart className="w-4 h-4" />
                            {discussion.total_likes || 0}
                          </button>
                          <div className="flex items-center gap-1 text-slate-500">
                            <MessageCircle className="w-4 h-4" />
                            {discussion.total_replies || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Discussion Detail Modal */}
      <Dialog open={!!selectedDiscussion} onOpenChange={(open) => !open && setSelectedDiscussion(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedDiscussion?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Original Post */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#143A50] text-white flex items-center justify-center font-bold">
                  {selectedDiscussion?.author_name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{selectedDiscussion?.author_name || 'Anonymous'}</p>
                  <p className="text-sm text-slate-500">{new Date(selectedDiscussion?.created_date).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{selectedDiscussion?.content}</p>
              <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
                <button className="flex items-center gap-1 hover:text-[#143A50]">
                  <Heart className="w-4 h-4" />
                  {selectedDiscussion?.total_likes || 0} Likes
                </button>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {replies.length} Replies
                </span>
              </div>
            </div>

            {/* Replies */}
            <div className="space-y-4">
              <h4 className="font-bold text-lg">Replies ({replies.length})</h4>
              {replies.map((reply, idx) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-4 border border-slate-200 rounded-lg"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#AC1A5B] text-white flex items-center justify-center font-bold text-sm">
                      {reply.author_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{reply.author_name || 'Anonymous'}</p>
                      <p className="text-xs text-slate-500">{new Date(reply.created_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{reply.content}</p>
                </motion.div>
              ))}
            </div>

            {/* Reply Form */}
            {user && !selectedDiscussion?.is_locked && (
              <div className="space-y-3 border-t pt-6">
                <h4 className="font-bold">Add Your Reply</h4>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={() => createReplyMutation.mutate(newReply)}
                  disabled={!newReply.trim() || createReplyMutation.isPending}
                  className="bg-[#143A50] hover:bg-[#1E4F58]"
                >
                  {createReplyMutation.isPending ? 'Posting...' : 'Post Reply'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}