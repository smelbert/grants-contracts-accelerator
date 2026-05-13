import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ThumbsUp, MessageCircle, Search, Pin, Lock, AlertCircle,
  ArrowLeft, Plus, ChevronDown, ChevronUp, Send, Hash, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_COLORS = {
  general: 'bg-slate-100 text-slate-700',
  grants: 'bg-[#143A50]/10 text-[#143A50]',
  contracts: 'bg-blue-100 text-blue-700',
  fundraising: 'bg-purple-100 text-purple-700',
  questions: 'bg-amber-100 text-amber-700',
  success_stories: 'bg-green-100 text-green-700',
  resources: 'bg-[#AC1A5B]/10 text-[#AC1A5B]',
};

function Avatar({ name, size = 'md', color = '#143A50' }) {
  const initial = name?.[0]?.toUpperCase() || '?';
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-12 h-12 text-lg' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`} style={{ backgroundColor: color }}>
      {initial}
    </div>
  );
}

function ReplyThread({ reply, depth = 0, user, onReply, onUpvote, discussionAuthorEmail }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = reply.children?.length > 0;
  const borderColors = ['border-[#143A50]', 'border-[#AC1A5B]', 'border-[#E5C089]', 'border-slate-300'];
  const borderColor = borderColors[Math.min(depth, borderColors.length - 1)];
  const avatarColors = ['#143A50', '#AC1A5B', '#1E4F58', '#A65D40'];

  return (
    <div className={depth > 0 ? `ml-6 border-l-2 ${borderColor} pl-4` : ''}>
      <div className="py-3">
        <div className="flex items-start gap-3">
          <Avatar name={reply.author_name} size="sm" color={avatarColors[depth % avatarColors.length]} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-slate-900">{reply.author_name || 'Anonymous'}</span>
              {reply.is_marked_helpful && (
                <Badge className="bg-green-100 text-green-700 text-xs px-1.5 py-0">✓ Helpful</Badge>
              )}
              <span className="text-xs text-slate-400">
                {reply.created_date ? formatDistanceToNow(new Date(reply.created_date), { addSuffix: true }) : ''}
              </span>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <button
                onClick={() => onUpvote(reply.id)}
                className="flex items-center gap-1 hover:text-[#143A50] transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{reply.upvote_count || 0}</span>
              </button>
              <button
                onClick={() => onReply(reply)}
                className="hover:text-[#143A50] transition-colors"
              >
                Reply
              </button>
              {user?.email === discussionAuthorEmail && (
                <button className="hover:text-green-600 transition-colors">
                  Mark Helpful
                </button>
              )}
              {hasChildren && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 hover:text-[#143A50] transition-colors"
                >
                  {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {expanded ? 'Collapse' : `${reply.children.length} repl${reply.children.length === 1 ? 'y' : 'ies'}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {hasChildren && expanded && (
        <div>
          {reply.children.map(child => (
            <ReplyThread
              key={child.id}
              reply={child}
              depth={depth + 1}
              user={user}
              onReply={onReply}
              onUpvote={onUpvote}
              discussionAuthorEmail={discussionAuthorEmail}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DiscussionThread({ discussion, user, spaceId, onBack }) {
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const replyBoxRef = useRef(null);

  const { data: replies = [] } = useQuery({
    queryKey: ['replies', discussion.id],
    queryFn: () => base44.entities.DiscussionReply.filter({ discussion_id: discussion.id }, 'created_date'),
  });

  const createReplyMutation = useMutation({
    mutationFn: (content) => base44.entities.DiscussionReply.create({
      discussion_id: discussion.id,
      parent_reply_id: replyingTo?.id || null,
      content,
      author_email: user.email,
      author_name: user.full_name,
      moderation_status: 'approved',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies', discussion.id] });
      queryClient.invalidateQueries({ queryKey: ['discussions', spaceId] });
      setReplyContent('');
      setReplyingTo(null);
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: async (replyId) => {
      const reply = replies.find(r => r.id === replyId);
      await base44.entities.DiscussionReply.update(replyId, { upvote_count: (reply?.upvote_count || 0) + 1 });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['replies', discussion.id] }),
  });

  const buildTree = (list) => {
    const map = {};
    list.forEach(r => { map[r.id] = { ...r, children: [] }; });
    const tree = [];
    list.forEach(r => {
      if (r.parent_reply_id && map[r.parent_reply_id]) {
        map[r.parent_reply_id].children.push(map[r.id]);
      } else {
        tree.push(map[r.id]);
      }
    });
    return tree;
  };

  const handleReply = (reply) => {
    setReplyingTo(reply);
    replyBoxRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    createReplyMutation.mutate(replyContent.trim());
  };

  const tree = buildTree(replies);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#143A50] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to discussions
      </button>

      {/* Original Post */}
      <Card className="mb-6 border-l-4 border-[#143A50]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar name={discussion.author_name} size="lg" color="#143A50" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-bold text-slate-900">{discussion.author_name || 'Anonymous'}</span>
                <Badge className={`text-xs ${CATEGORY_COLORS[discussion.category] || CATEGORY_COLORS.general}`}>
                  {discussion.category}
                </Badge>
                {discussion.is_pinned && <Badge className="bg-red-100 text-red-700 text-xs">📌 Pinned</Badge>}
                <span className="text-xs text-slate-400">
                  {discussion.created_date ? formatDistanceToNow(new Date(discussion.created_date), { addSuffix: true }) : ''}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">{discussion.title}</h2>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{discussion.content}</p>
              {discussion.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {discussion.tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h3>
        {tree.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No replies yet — be the first to contribute!
          </div>
        ) : (
          <div className="space-y-1">
            {tree.map(reply => (
              <ReplyThread
                key={reply.id}
                reply={reply}
                user={user}
                onReply={handleReply}
                onUpvote={(id) => upvoteMutation.mutate(id)}
                discussionAuthorEmail={discussion.author_email}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reply Composer */}
      {user && !discussion.is_locked && (
        <Card className="border-2 border-[#143A50]/20">
          <CardContent className="p-4">
            {replyingTo && (
              <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 mb-3 text-sm">
                <span className="text-slate-600">
                  Replying to <strong>{replyingTo.author_name}</strong>
                </span>
                <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600 text-xs">✕ Cancel</button>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Avatar name={user.full_name} size="sm" color="#AC1A5B" />
              <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
                <Textarea
                  ref={replyBoxRef}
                  placeholder={replyingTo ? `Reply to ${replyingTo.author_name}...` : 'Share your thoughts, advice, or questions...'}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={3}
                  className="flex-1 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e);
                  }}
                />
                <Button
                  type="submit"
                  disabled={!replyContent.trim() || createReplyMutation.isPending}
                  className="bg-[#143A50] hover:bg-[#1E4F58] self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
            <p className="text-xs text-slate-400 mt-2 ml-10">Ctrl+Enter to post</p>
          </CardContent>
        </Card>
      )}
      {discussion.is_locked && (
        <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-100 rounded-lg p-4">
          <Lock className="w-4 h-4" /> This discussion is locked.
        </div>
      )}
    </div>
  );
}

export default function Discussions() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const spaceSlug = searchParams.get('space');

  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general', tags: '' });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: space, isLoading: spaceLoading } = useQuery({
    queryKey: ['communitySpace', spaceSlug],
    queryFn: async () => {
      if (!spaceSlug) return null;
      const result = await base44.entities.CommunitySpace.filter({ slug: spaceSlug });
      return Array.isArray(result) && result.length > 0 ? result[0] : null;
    },
    enabled: !!spaceSlug,
  });

  const { data: discussions = [], isLoading: discussionsLoading } = useQuery({
    queryKey: ['discussions', space?.id],
    queryFn: () => base44.entities.Discussion.filter({ space_id: space.id }, '-created_date'),
    enabled: !!space?.id,
  });

  const createDiscussionMutation = useMutation({
    mutationFn: (data) => base44.entities.Discussion.create({
      space_id: space.id,
      author_email: user.email,
      author_name: user.full_name,
      title: data.title,
      content: data.content,
      category: data.category,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      moderation_status: 'approved',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions', space?.id] });
      setShowNewPost(false);
      setNewPost({ title: '', content: '', category: 'general', tags: '' });
    },
  });

  const upvoteDiscussionMutation = useMutation({
    mutationFn: async (disc) => {
      await base44.entities.Discussion.update(disc.id, { total_upvotes: (disc.total_upvotes || 0) + 1 });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['discussions', space?.id] }),
  });

  const filteredDiscussions = discussions
    .filter(d => d.moderation_status !== 'removed')
    .filter(d => filterCategory === 'all' || d.category === filterCategory)
    .filter(d =>
      !searchTerm ||
      d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.content?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_date) - new Date(a.created_date);
    });

  if (!spaceSlug) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="p-10 text-center max-w-md">
          <Users className="w-14 h-14 mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">No Space Selected</h2>
          <p className="text-slate-500 mb-6">Please choose a community space to view its discussions.</p>
          <Link to="/Community">
            <Button className="bg-[#143A50] hover:bg-[#1E4F58]">Browse Community Spaces</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (spaceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#143A50] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="p-10 text-center max-w-md">
          <AlertCircle className="w-14 h-14 mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">Space Not Found</h2>
          <p className="text-slate-500 mb-6">This community space doesn't exist or hasn't been set up yet.</p>
          <Link to="/Community">
            <Button className="bg-[#143A50] hover:bg-[#1E4F58]">Back to Community</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Thread view
  if (selectedDiscussion) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Hash className="w-5 h-5 text-[#E5C089]" />
            <span className="font-semibold">{space.space_name}</span>
          </div>
        </div>
        <DiscussionThread
          discussion={selectedDiscussion}
          user={user}
          spaceId={space.id}
          onBack={() => setSelectedDiscussion(null)}
        />
      </div>
    );
  }

  // Board view
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link to="/Community" className="inline-flex items-center gap-1 text-[#E5C089]/70 hover:text-[#E5C089] text-sm mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> All Spaces
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">{space.space_name}</h1>
              <p className="text-[#E5C089]/80">{space.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{space.member_count || 0} members</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{discussions.length} posts</span>
              </div>
            </div>
            <Button
              onClick={() => setShowNewPost(true)}
              className="bg-[#E5C089] hover:bg-[#E5C089]/90 text-[#143A50] font-semibold flex-shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" /> New Post
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Search + Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'general', 'grants', 'questions', 'success_stories', 'resources'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                  filterCategory === cat
                    ? 'bg-[#143A50] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#143A50]'
                }`}
              >
                {cat === 'all' ? 'All' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Discussion Feed */}
        {discussionsLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-4 border-[#143A50] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredDiscussions.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed">
            <MessageCircle className="w-12 h-12 mx-auto text-slate-200 mb-4" />
            <h3 className="font-semibold text-slate-600 mb-2">
              {searchTerm ? 'No results found' : 'No discussions yet'}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {searchTerm ? 'Try a different search term.' : 'Be the first to start a conversation in this space!'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowNewPost(true)} className="bg-[#143A50] hover:bg-[#1E4F58]">
                <Plus className="w-4 h-4 mr-1" /> Start a Discussion
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredDiscussions.map((disc, idx) => (
                <motion.div
                  key={disc.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card
                    className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${disc.is_pinned ? 'border-amber-400' : 'border-[#143A50]'}`}
                    onClick={() => setSelectedDiscussion(disc)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <Avatar name={disc.author_name} size="md" color={disc.is_pinned ? '#A65D40' : '#143A50'} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {disc.is_pinned && <Badge className="bg-amber-100 text-amber-700 text-xs">📌 Pinned</Badge>}
                            <Badge className={`text-xs ${CATEGORY_COLORS[disc.category] || CATEGORY_COLORS.general}`}>
                              {disc.category?.replace('_', ' ')}
                            </Badge>
                            {disc.tags?.map(tag => (
                              <span key={tag} className="text-xs text-slate-400">#{tag}</span>
                            ))}
                          </div>
                          <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">{disc.title}</h3>
                          <p className="text-sm text-slate-500 line-clamp-2">{disc.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                            <span className="font-medium text-slate-600">{disc.author_name || 'Anonymous'}</span>
                            <span>{disc.created_date ? formatDistanceToNow(new Date(disc.created_date), { addSuffix: true }) : ''}</span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5" /> {disc.total_replies || 0}
                            </span>
                            <button
                              className="flex items-center gap-1 hover:text-[#143A50] transition-colors"
                              onClick={e => { e.stopPropagation(); upvoteDiscussionMutation.mutate(disc); }}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" /> {disc.total_upvotes || 0}
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* New Post Dialog */}
      <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Start a Discussion in {space.space_name}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newPost.title.trim() || !newPost.content.trim()) return;
              createDiscussionMutation.mutate(newPost);
            }}
            className="space-y-4 mt-2"
          >
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Title <span className="text-red-500">*</span></label>
              <Input
                placeholder="What's your question or topic?"
                value={newPost.title}
                onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Message <span className="text-red-500">*</span></label>
              <Textarea
                placeholder="Share details, context, or your full question..."
                value={newPost.content}
                onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                rows={6}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Category</label>
                <select
                  value={newPost.category}
                  onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="general">General</option>
                  <option value="questions">Question</option>
                  <option value="grants">Grants</option>
                  <option value="contracts">Contracts</option>
                  <option value="fundraising">Fundraising</option>
                  <option value="success_stories">Success Story</option>
                  <option value="resources">Resources</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Tags <span className="text-slate-400">(comma-separated)</span></label>
                <Input
                  placeholder="e.g. grants, nonprofit, tips"
                  value={newPost.tags}
                  onChange={e => setNewPost({ ...newPost, tags: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button>
              <Button
                type="submit"
                disabled={!newPost.title.trim() || !newPost.content.trim() || createDiscussionMutation.isPending}
                className="bg-[#143A50] hover:bg-[#1E4F58]"
              >
                {createDiscussionMutation.isPending ? 'Posting...' : 'Post Discussion'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}