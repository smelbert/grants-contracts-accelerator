import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pin, Trash2, AlertTriangle, Eye, Lock, Tag, MessageSquare } from 'lucide-react';

export default function CommunityModerationDashboard() {
  const queryClient = useQueryClient();
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [selectedReply, setSelectedReply] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [topicName, setTopicName] = useState('');
  const [moderationNotes, setModerationNotes] = useState('');

  const { data: spaces = [] } = useQuery({
    queryKey: ['allSpaces'],
    queryFn: () => base44.entities.CommunitySpace.list(),
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ['allDiscussions'],
    queryFn: async () => {
      try {
        const result = await base44.entities.Discussion.list();
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error('Error loading discussions:', error);
        return [];
      }
    },
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['allReplies'],
    queryFn: async () => {
      try {
        const result = await base44.entities.DiscussionReply.list();
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error('Error loading replies:', error);
        return [];
      }
    },
  });

  const pinMutation = useMutation({
    mutationFn: (discussionId) => {
      const discussion = discussions.find(d => d.id === discussionId);
      return base44.entities.Discussion.update(discussionId, { is_pinned: !discussion?.is_pinned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDiscussions'] });
    }
  });

  const lockMutation = useMutation({
    mutationFn: (discussionId) => {
      const discussion = discussions.find(d => d.id === discussionId);
      return base44.entities.Discussion.update(discussionId, { is_locked: !discussion?.is_locked });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDiscussions'] });
    }
  });

  const addTopicMutation = useMutation({
    mutationFn: () => base44.entities.Discussion.update(selectedDiscussion.id, { topic: topicName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDiscussions'] });
      setTopicName('');
      setSelectedDiscussion(null);
    }
  });

  const deleteDiscussionMutation = useMutation({
    mutationFn: (discussionId) => base44.entities.Discussion.update(discussionId, { moderation_status: 'removed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDiscussions'] });
      setDeleteConfirm(null);
    }
  });

  const deleteReplyMutation = useMutation({
    mutationFn: (replyId) => base44.entities.DiscussionReply.update(replyId, { moderation_status: 'removed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allReplies'] });
      setSelectedReply(null);
    }
  });

  const approveDiscussionMutation = useMutation({
    mutationFn: (discussionId) => base44.entities.Discussion.update(discussionId, { moderation_status: 'approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDiscussions'] });
    }
  });

  const approveReplyMutation = useMutation({
    mutationFn: (replyId) => base44.entities.DiscussionReply.update(replyId, { moderation_status: 'approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allReplies'] });
    }
  });

  const pendingDiscussions = discussions.filter(d => d.moderation_status === 'pending');
  const flaggedDiscussions = discussions.filter(d => d.moderation_status === 'flagged');
  const pendingReplies = replies.filter(r => r.moderation_status === 'pending');
  const pinnedDiscussions = discussions.filter(d => d.is_pinned && d.moderation_status !== 'removed');

  const DiscussionItem = ({ discussion, showApproveBtn = false }) => (
    <Card className="mb-4 hover:shadow-md transition-all">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {discussion.is_pinned && <Pin className="w-4 h-4 text-red-500" />}
              {discussion.is_locked && <Lock className="w-4 h-4 text-slate-400" />}
              <Badge className="bg-[#143A50]">{discussion.category}</Badge>
              {discussion.topic && <Badge className="bg-purple-100 text-purple-800">{discussion.topic}</Badge>}
            </div>
            <h4 className="font-bold text-slate-900 mb-1">{discussion.title}</h4>
            <p className="text-sm text-slate-600 line-clamp-2">{discussion.content}</p>
            <p className="text-xs text-slate-500 mt-2">By {discussion.author_name} • {new Date(discussion.created_date).toLocaleDateString()}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>{discussion.total_replies || 0} replies</p>
            <p>{discussion.total_upvotes || 0} upvotes</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={() => pinMutation.mutate(discussion.id)} className="gap-2">
            <Pin className="w-3 h-3" />
            {discussion.is_pinned ? 'Unpin' : 'Pin'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => lockMutation.mutate(discussion.id)} className="gap-2">
            <Lock className="w-3 h-3" />
            {discussion.is_locked ? 'Unlock' : 'Lock'}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" onClick={() => setSelectedDiscussion(discussion)} className="gap-2">
                <Tag className="w-3 h-3" />
                Add Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Topic</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Topic name" value={topicName} onChange={(e) => setTopicName(e.target.value)} />
                <div className="flex gap-3">
                  <Button onClick={addTopicMutation.mutate} className="bg-[#143A50]">Save</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {showApproveBtn && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approveDiscussionMutation.mutate(discussion.id)}>
              <Eye className="w-3 h-3 mr-1" />
              Approve
            </Button>
          )}
          <Button size="sm" variant="destructive" onClick={() => setDeleteConfirm(discussion)} className="gap-2">
            <Trash2 className="w-3 h-3" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ReplyItem = ({ reply }) => {
    const discussion = discussions.find(d => d.id === reply.discussion_id);
    return (
      <Card className="mb-4 hover:shadow-md transition-all">
        <CardContent className="pt-6">
          <div className="text-xs text-slate-500 mb-2">
            In: <strong>{discussion?.title}</strong>
          </div>
          <p className="text-slate-700 mb-3">{reply.content}</p>
          <div className="text-xs text-slate-500 mb-4">
            By {reply.author_name} • {new Date(reply.created_date).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            {reply.moderation_status === 'pending' && (
              <Button size="sm" className="bg-green-600" onClick={() => approveReplyMutation.mutate(reply.id)}>
                <Eye className="w-3 h-3 mr-1" />
                Approve
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => deleteReplyMutation.mutate(reply.id)}>
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#143A50] mb-2">Community Moderation</h1>
          <p className="text-slate-600">Manage discussions, replies, topics, and community content</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-[#143A50]">{discussions.length}</p>
              <p className="text-sm text-slate-600">Total Discussions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-red-600">{pendingDiscussions.length}</p>
              <p className="text-sm text-slate-600">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-yellow-600">{flaggedDiscussions.length}</p>
              <p className="text-sm text-slate-600">Flagged</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-purple-600">{pinnedDiscussions.length}</p>
              <p className="text-sm text-slate-600">Pinned</p>
            </CardContent>
          </Card>
        </div>

        {/* Moderation Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending Review ({pendingDiscussions.length})</TabsTrigger>
            <TabsTrigger value="flagged">Flagged ({flaggedDiscussions.length})</TabsTrigger>
            <TabsTrigger value="pinned">Pinned ({pinnedDiscussions.length})</TabsTrigger>
            <TabsTrigger value="replies">Replies ({pendingReplies.length})</TabsTrigger>
            <TabsTrigger value="all">All ({discussions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div>
              <h3 className="font-bold text-lg mb-4">Discussions Pending Review</h3>
              {pendingDiscussions.length === 0 ? (
                <Card className="p-8 text-center"><p className="text-slate-600">No pending discussions</p></Card>
              ) : (
                pendingDiscussions.map(d => <DiscussionItem key={d.id} discussion={d} showApproveBtn />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="flagged">
            <div>
              <h3 className="font-bold text-lg mb-4">Flagged Discussions</h3>
              {flaggedDiscussions.length === 0 ? (
                <Card className="p-8 text-center"><p className="text-slate-600">No flagged discussions</p></Card>
              ) : (
                flaggedDiscussions.map(d => <DiscussionItem key={d.id} discussion={d} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="pinned">
            <div>
              <h3 className="font-bold text-lg mb-4">Pinned Discussions</h3>
              {pinnedDiscussions.length === 0 ? (
                <Card className="p-8 text-center"><p className="text-slate-600">No pinned discussions</p></Card>
              ) : (
                pinnedDiscussions.map(d => <DiscussionItem key={d.id} discussion={d} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="replies">
            <div>
              <h3 className="font-bold text-lg mb-4">Replies Pending Review ({pendingReplies.length})</h3>
              {pendingReplies.length === 0 ? (
                <Card className="p-8 text-center"><p className="text-slate-600">No pending replies</p></Card>
              ) : (
                pendingReplies.map(r => <ReplyItem key={r.id} reply={r} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div>
              <h3 className="font-bold text-lg mb-4">All Discussions</h3>
              {discussions.filter(d => d.moderation_status !== 'removed').map(d => <DiscussionItem key={d.id} discussion={d} />)}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Discussion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{deleteConfirm?.title}"? This cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-6">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteDiscussionMutation.mutate(deleteConfirm.id)} className="bg-red-600">Delete</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}