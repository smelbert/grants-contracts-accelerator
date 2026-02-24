import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageSquare, Reply, Edit, Trash2, Flag, CheckCircle, XCircle } from 'lucide-react';
import moment from 'moment';
import { toast } from 'sonner';

export default function CommentSection({ postId, postAuthorEmail, user, isAdmin }) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['blog-comments', postId],
    queryFn: async () => {
      const results = await base44.entities.BlogComment.filter({ 
        blog_post_id: postId,
        status: isAdmin ? undefined : 'approved'
      }, '-created_date');
      return results;
    },
    enabled: !!postId
  });

  const createCommentMutation = useMutation({
    mutationFn: async (commentData) => {
      return await base44.entities.BlogComment.create(commentData);
    },
    onSuccess: async (newCommentData) => {
      queryClient.invalidateQueries({ queryKey: ['blog-comments', postId] });
      setNewComment('');
      setReplyingTo(null);
      setReplyContent('');
      toast.success('Comment posted!');

      // Send notification if it's a reply
      if (newCommentData.parent_comment_id) {
        const parentComment = comments.find(c => c.id === newCommentData.parent_comment_id);
        if (parentComment && parentComment.commenter_email !== user?.email) {
          await base44.entities.UserNotification.create({
            user_email: parentComment.commenter_email,
            notification_type: 'blog_reply',
            title: 'New Reply to Your Comment',
            message: `${user.full_name} replied to your comment on the blog`,
            link: window.location.href,
            is_read: false
          }).catch(() => {});
        }
      }
    }
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.BlogComment.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-comments', postId] });
      setEditingComment(null);
      setEditContent('');
      toast.success('Comment updated!');
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.BlogComment.update(id, { status: 'deleted' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-comments', postId] });
      toast.success('Comment deleted');
    }
  });

  const handleSubmitComment = () => {
    if (!user) {
      toast.error('Please log in to comment');
      return;
    }
    if (!newComment.trim()) return;

    createCommentMutation.mutate({
      blog_post_id: postId,
      commenter_email: user.email,
      commenter_name: user.full_name || user.email,
      content: newComment,
      status: 'approved'
    });
  };

  const handleSubmitReply = (parentId) => {
    if (!user) {
      toast.error('Please log in to reply');
      return;
    }
    if (!replyContent.trim()) return;

    createCommentMutation.mutate({
      blog_post_id: postId,
      parent_comment_id: parentId,
      commenter_email: user.email,
      commenter_name: user.full_name || user.email,
      content: replyContent,
      status: 'approved'
    });
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = (commentId) => {
    if (!editContent.trim()) return;

    updateCommentMutation.mutate({
      id: commentId,
      data: {
        content: editContent,
        is_edited: true,
        edited_at: new Date().toISOString()
      }
    });
  };

  const handleModerate = (commentId, status) => {
    updateCommentMutation.mutate({
      id: commentId,
      data: { status }
    });
  };

  const topLevelComments = comments.filter(c => !c.parent_comment_id && c.status !== 'deleted');
  const getReplies = (commentId) => comments.filter(c => c.parent_comment_id === commentId && c.status !== 'deleted');

  const CommentCard = ({ comment, isReply = false }) => {
    const replies = getReplies(comment.id);
    const isOwner = user?.email === comment.commenter_email;
    const canModerate = isAdmin || postAuthorEmail === user?.email;

    return (
      <div className={`${isReply ? 'ml-12' : ''}`}>
        <Card className="p-4 mb-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#143A50] flex items-center justify-center text-white font-semibold flex-shrink-0">
              {comment.commenter_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-slate-900">{comment.commenter_name}</span>
                <span className="text-xs text-slate-500">
                  {moment(comment.created_date).fromNow()}
                </span>
                {comment.is_edited && (
                  <span className="text-xs text-slate-400 italic">(edited)</span>
                )}
                {comment.status === 'pending' && (
                  <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">Pending</span>
                )}
              </div>

              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveEdit(comment.id)}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingComment(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-slate-700 mb-2 whitespace-pre-wrap">{comment.content}</p>
                  <div className="flex items-center gap-3 text-sm">
                    {user && (
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="flex items-center gap-1 text-[#AC1A5B] hover:text-[#143A50] transition-colors"
                      >
                        <Reply className="w-4 h-4" />
                        Reply
                      </button>
                    )}
                    {isOwner && (
                      <>
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}
                    {canModerate && comment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleModerate(comment.id, 'approved')}
                          className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerate(comment.id, 'spam')}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Spam
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {replyingTo === comment.id && (
          <div className="ml-12 mb-4">
            <Card className="p-4 bg-slate-50">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="mb-2 bg-white"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                  Post Reply
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}

        {replies.length > 0 && (
          <div className="space-y-4">
            {replies.map(reply => (
              <CommentCard key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-12 border-t border-slate-200 pt-12">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-6 h-6 text-[#143A50]" />
        <h2 className="text-2xl font-bold text-[#143A50]">
          Comments ({topLevelComments.length})
        </h2>
      </div>

      {/* New Comment Form */}
      {user ? (
        <Card className="p-6 mb-8 bg-slate-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#143A50] flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="mb-3 bg-white"
                rows={4}
              />
              <Button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || createCommentMutation.isPending}
                className="bg-[#143A50] hover:bg-[#1E4F58]"
              >
                Post Comment
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 mb-8 text-center bg-slate-50">
          <p className="text-slate-600 mb-4">Please log in to leave a comment</p>
          <Button className="bg-[#143A50] hover:bg-[#1E4F58]">
            Log In
          </Button>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">No comments yet. Be the first to share your thoughts!</p>
          </Card>
        ) : (
          topLevelComments.map(comment => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}