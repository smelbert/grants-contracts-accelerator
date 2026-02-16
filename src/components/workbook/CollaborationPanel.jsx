import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Users, MessageSquare, Send, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function CollaborationPanel({ pageId, fieldId, responses }) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch collaborators for this workbook
  const { data: collaborators = [] } = useQuery({
    queryKey: ['workbook-collaborators', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const collabs = await base44.entities.Document.filter({
        owner_email: user.email,
        document_type: 'workbook_collaboration'
      });
      return collabs;
    },
    enabled: !!user?.email
  });

  // Fetch comments for this specific field
  const { data: comments = [] } = useQuery({
    queryKey: ['field-comments', pageId, fieldId],
    queryFn: async () => {
      const allComments = await base44.entities.DocumentComment.filter({
        document_id: `${pageId}_${fieldId}`,
      });
      return allComments.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentText) => {
      return await base44.entities.DocumentComment.create({
        document_id: `${pageId}_${fieldId}`,
        comment_text: commentText,
        commenter_email: user.email,
        commenter_name: user.full_name || user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['field-comments', pageId, fieldId]);
      setNewComment('');
      setShowCommentForm(false);
      toast.success('Comment added');
    }
  });

  const inviteCollaboratorMutation = useMutation({
    mutationFn: async (email) => {
      // Send invitation email and create collaboration record
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `${user.full_name} invited you to collaborate on their workbook`,
        body: `You've been invited to collaborate on a workbook. Log in to the platform to view and comment on responses.`
      });

      return await base44.entities.Document.create({
        owner_email: user.email,
        document_type: 'workbook_collaboration',
        title: `Collaboration with ${email}`,
        content: JSON.stringify({ collaborator_email: email, invited_date: new Date().toISOString() })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workbook-collaborators']);
      setInviteEmail('');
      setShowInviteForm(false);
      toast.success('Invitation sent!');
    },
    onError: () => {
      toast.error('Failed to send invitation');
    }
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  const handleInvite = () => {
    if (inviteEmail.trim() && inviteEmail.includes('@')) {
      inviteCollaboratorMutation.mutate(inviteEmail);
    }
  };

  return (
    <Card className="border-2 border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Collaboration
            </CardTitle>
            <CardDescription className="text-xs">
              {comments.length} comment{comments.length !== 1 ? 's' : ''} • {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInviteForm(!showInviteForm)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Invite
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Invite Form */}
        <AnimatePresence>
          {showInviteForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <div className="flex gap-2">
                <Input
                  placeholder="Collaborator email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleInvite}
                  disabled={inviteCollaboratorMutation.isPending || !inviteEmail.includes('@')}
                >
                  {inviteCollaboratorMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Send'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInviteForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comments Section */}
        <div className="space-y-3 mb-4">
          {comments.length === 0 && !showCommentForm && (
            <div className="text-center py-6 text-slate-500 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p>No comments yet. Start a conversation!</p>
            </div>
          )}

          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-semibold">
                    {comment.commenter_name?.[0]?.toUpperCase() || '?'}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-900">{comment.commenter_name}</span>
                      {comment.commenter_email === user?.email && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                      <span className="text-xs text-slate-500">
                        {new Date(comment.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.comment_text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Comment Form */}
        {!showCommentForm ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCommentForm(true)}
            className="w-full"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Add Comment
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <Textarea
              placeholder="Share your thoughts, questions, or suggestions..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={addCommentMutation.isPending || !newComment.trim()}
                className="flex-1"
              >
                {addCommentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post Comment
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCommentForm(false);
                  setNewComment('');
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        <div className="text-xs text-slate-500 text-center mt-3 pt-3 border-t">
          Comments are visible to you and your invited collaborators
        </div>
      </CardContent>
    </Card>
  );
}