import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ThumbsUp, MessageCircle, Search, Pin, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Discussions() {
  const queryClient = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const spaceSlug = params.get('space');

  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [newDiscussionData, setNewDiscussionData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: space } = useQuery({
    queryKey: ['communitySpace', spaceSlug],
    queryFn: async () => {
      try {
        const result = await base44.entities.CommunitySpace.filter({ slug: spaceSlug });
        return Array.isArray(result) && result.length > 0 ? result[0] : null;
      } catch (error) {
        console.error('Error loading space:', error);
        return null;
      }
    },
    enabled: !!spaceSlug,
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions', space?.id],
    queryFn: async () => {
      if (!space?.id) return [];
      try {
        const result = await base44.entities.Discussion.filter({ space_id: space.id }, '-created_date');
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error('Error loading discussions:', error);
        return [];
      }
    },
    enabled: !!space?.id,
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['replies', selectedDiscussion?.id],
    queryFn: async () => {
      if (!selectedDiscussion?.id) return [];
      try {
        const result = await base44.entities.DiscussionReply.filter({ discussion_id: selectedDiscussion.id }, 'created_date');
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error('Error loading replies:', error);
        return [];
      }
    },
    enabled: !!selectedDiscussion?.id,
  });

  const createDiscussionMutation = useMutation({
    mutationFn: (data) => base44.entities.Discussion.create({
      ...data,
      space_id: space.id,
      author_email: user.email,
      author_name: user.full_name,
      tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
      moderation_status: 'approved'
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
      parent_reply_id: replyingTo?.id || null,
      content,
      author_email: user.email,
      author_name: user.full_name,
      moderation_status: 'approved'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies', selectedDiscussion?.id] });
      setNewReplyContent('');
      setReplyingTo(null);
    }
  });

  const upvoteMutation = useMutation({
    mutationFn: async (replyId) => {
      const reply = replies.find(r => r.id === replyId);
      await base44.entities.DiscussionReply.update(replyId, {
        upvote_count: (reply?.upvote_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies', selectedDiscussion?.id] });
    }
  });

  const markHelpfulMutation = useMutation({
    mutationFn: async (replyId) => {
      const reply = replies.find(r => r.id === replyId);
      await base44.entities.DiscussionReply.update(replyId, {
        is_marked_helpful: !reply?.is_marked_helpful
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies', selectedDiscussion?.id] });
    }
  });

  const filteredDiscussions = discussions
    .filter(d => d.moderation_status !== 'removed')
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_date) - new Date(a.created_date);
    })
    .filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  d.content.toLowerCase().includes(searchTerm.toLowerCase()));

  const buildReplyTree = (replyList) => {
    const tree = [];
    const map = {};
    replyList.forEach(reply => {
      map[reply.id] = { ...reply, children: [] };
    });
    replyList.forEach(reply => {
      if (reply.parent_reply_id) {
        map[reply.parent_reply_id]?.children?.push(map[reply.id]);
      } else {
        tree.push(map[reply.id]);
      }
    });
    return tree;
  };

  const ReplyThread = ({ reply, depth = 0 }) => (
    <motion.div initial={{ opacity: 0, x: depth * 20 }} animate={{ opacity: 1, x: 0 }} className={`ml-${depth * 4} space-y-2 mt-3`}>
      <Card className="bg-white border border-slate-200">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#AC1A5B] text-white flex items-center justify-center text-xs font-bold">
                {reply.author_name?.[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{reply.author_name || 'Anonymous'}</p>
                <p className="text-xs text-slate-500">{new Date(reply.created_date).toLocaleDateString()}</p>
              </div>
            </div>
            {reply.is_marked_helpful && (
              <Badge className="bg-green-100 text-green-800 text-xs">Helpful Answer</Badge>
            )}
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap mb-3">{reply.content}</p>
          <div className="flex gap-3 text-xs">
            <button onClick={() => upvoteMutation.mutate(reply.id)} className="flex items-center gap-1 hover:text-[#143A50] text-slate-600">
              <ThumbsUp className="w-4 h-4" />
              {reply.upvote_count || 0}
            </button>
            <button onClick={() => setReplyingTo(reply)} className="text-slate-600 hover:text-[#143A50]">Reply</button>
            {user?.email === selectedDiscussion?.author_email && (
              <button onClick={() => markHelpfulMutation.mutate(reply.id)} className="text-slate-600 hover:text-green-600">
                {reply.is_marked_helpful ? 'Unmark' : 'Mark'} Helpful
              </button>
            )}
          </div>
        </CardContent>
      </Card>
      {reply.children?.map(child => (
        <ReplyThread key={child.id} reply={child} depth={depth + 1} />
      ))}
    </motion.div>
  );

  if (!space) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-600">Loading space...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-2">{space.space_name}</h1>
          <p className="text-[#E5C089]/90">{space.description}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Search & Create */}
        <div className="mb-8 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input placeholder="Search discussions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          {space.settings?.allow_member_posts && (
            <Dialog open={showNewDiscussion} onOpenChange={setShowNewDiscussion}>
              <DialogTrigger asChild>
                <Button className="bg-[#143A50] hover:bg-[#1E4F58] whitespace-nowrap">+ New Discussion</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Start a Discussion</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); createDiscussionMutation.mutate(newDiscussionData); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input placeholder="What's your question?" value={newDiscussionData.title} onChange={(e) => setNewDiscussionData({...newDiscussionData, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea placeholder="Share details..." value={newDiscussionData.content} onChange={(e) => setNewDiscussionData({...newDiscussionData, content: e.target.value})} rows={6} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select value={newDiscussionData.category} onChange={(e) => setNewDiscussionData({...newDiscussionData, category: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                        <option value="general">General</option>
                        <option value="questions">Questions</option>
                        <option value="success_stories">Success Stories</option>
                        <option value="grants">Grants</option>
                        <option value="contracts">Contracts</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tags</label>
                      <Input placeholder="e.g., grants, budget" value={newDiscussionData.tags} onChange={(e) => setNewDiscussionData({...newDiscussionData, tags: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowNewDiscussion(false)}>Cancel</Button>
                    <Button type="submit" className="bg-[#143A50] hover:bg-[#1E4F58]">Post</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Discussion Feed */}
        <div className="space-y-4">
          {filteredDiscussions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-slate-600">No discussions yet. Be the first to start one!</p>
            </Card>
          ) : (
            filteredDiscussions.map((discussion, idx) => (
              <motion.div key={discussion.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-[#143A50] hover:border-[#AC1A5B]" onClick={() => setSelectedDiscussion(discussion)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {discussion.is_pinned && <Pin className="w-5 h-5 text-red-500" />}
                        {discussion.is_locked && <Lock className="w-5 h-5 text-slate-400" />}
                        <Badge className="bg-[#143A50]">{discussion.category}</Badge>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 hover:text-[#143A50] mb-2">{discussion.title}</h3>
                    <p className="text-slate-600 line-clamp-2 mb-4">{discussion.content}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>By <strong>{discussion.author_name || 'Anonymous'}</strong> • {new Date(discussion.created_date).toLocaleDateString()}</span>
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {discussion.total_replies || 0}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> {discussion.total_upvotes || 0}</span>
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
                  <p className="text-sm text-slate-500">{selectedDiscussion?.created_date && new Date(selectedDiscussion.created_date).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{selectedDiscussion?.content}</p>
            </div>

            {/* Reply Thread */}
            <div className="space-y-2">
              <h4 className="font-bold text-lg">Replies ({replies.length})</h4>
              {buildReplyTree(replies).map(reply => (
                <ReplyThread key={reply.id} reply={reply} />
              ))}
            </div>

            {/* Reply Form */}
            {user && !selectedDiscussion?.is_locked && (
              <div className="space-y-3 border-t pt-6">
                {replyingTo && (
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    Replying to: <strong>{replyingTo.author_name}</strong>
                    <button onClick={() => setReplyingTo(null)} className="ml-2 text-blue-600 hover:underline">Change</button>
                  </div>
                )}
                <h4 className="font-bold">Add Your Reply</h4>
                <Textarea placeholder="Share your thoughts..." value={newReplyContent} onChange={(e) => setNewReplyContent(e.target.value)} rows={4} />
                <Button onClick={() => createReplyMutation.mutate(newReplyContent)} disabled={!newReplyContent.trim()} className="bg-[#143A50] hover:bg-[#1E4F58]">
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