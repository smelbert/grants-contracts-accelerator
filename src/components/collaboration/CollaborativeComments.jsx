import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function CollaborativeComments({ documentId }) {
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: comments } = useQuery({
    queryKey: ['documentComments', documentId],
    queryFn: () => base44.entities.DocumentComment.filter({ document_id: documentId }, '-created_date'),
    enabled: !!documentId
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.DocumentComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['documentComments', documentId]);
      setNewComment('');
    }
  });

  // Real-time subscription
  useEffect(() => {
    if (!documentId) return;

    const unsubscribe = base44.entities.DocumentComment.subscribe((event) => {
      if (event.data.document_id === documentId) {
        queryClient.invalidateQueries(['documentComments', documentId]);
      }
    });

    return unsubscribe;
  }, [documentId, queryClient]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addCommentMutation.mutate({
      document_id: documentId,
      comment_text: newComment,
      author_name: user?.full_name || user?.email,
      author_role: user?.role,
      comment_type: 'comment'
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Comments ({comments?.length || 0})
      </h3>

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments?.map(comment => (
          <div key={comment.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-medium text-sm text-slate-900">{comment.author_name}</p>
              <Badge variant="outline" className="text-xs capitalize">{comment.author_role}</Badge>
              <span className="text-xs text-slate-500 ml-auto">
                {format(new Date(comment.created_date), 'MMM d, h:mm a')}
              </span>
            </div>
            <p className="text-sm text-slate-700">{comment.comment_text}</p>
          </div>
        ))}
      </div>

      {/* Add Comment */}
      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="flex-1"
        />
        <Button 
          onClick={handleAddComment}
          disabled={!newComment.trim() || addCommentMutation.isPending}
          size="sm"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}