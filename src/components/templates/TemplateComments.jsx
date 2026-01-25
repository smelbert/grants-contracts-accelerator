import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, CheckCircle2, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function TemplateComments({ templateId, currentUser }) {
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['template-comments', templateId],
    queryFn: () => base44.entities.TemplateComment.filter({ template_id: templateId }, '-created_date'),
    enabled: !!templateId
  });

  const createCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.TemplateComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['template-comments', templateId]);
      setNewComment('');
    }
  });

  const resolveCommentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TemplateComment.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['template-comments', templateId])
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate({
      template_id: templateId,
      comment_text: newComment,
      author_email: currentUser.email,
      author_name: currentUser.full_name
    });
  };

  const handleResolve = (comment) => {
    resolveCommentMutation.mutate({
      id: comment.id,
      data: {
        is_resolved: true,
        resolved_by: currentUser.email,
        resolved_at: new Date().toISOString()
      }
    });
  };

  const activeComments = comments.filter(c => !c.is_resolved);
  const resolvedComments = comments.filter(c => c.is_resolved);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-slate-600" />
        <h3 className="font-semibold text-slate-900">Comments & Discussion</h3>
        <Badge variant="outline">{activeComments.length} active</Badge>
      </div>

      {/* Add Comment */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment or question..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <Button 
          onClick={handleSubmit} 
          disabled={!newComment.trim() || createCommentMutation.isPending}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-2" />
          Post Comment
        </Button>
      </div>

      {/* Active Comments */}
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {activeComments.map((comment) => (
            <Card key={comment.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900">
                        {comment.author_name || comment.author_email}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  {currentUser && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResolve(comment)}
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Resolve
                    </Button>
                  )}
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.comment_text}</p>
              </CardContent>
            </Card>
          ))}

          {activeComments.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No comments yet. Start the discussion!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Resolved Comments */}
      {resolvedComments.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-slate-600 font-medium">
            {resolvedComments.length} resolved comments
          </summary>
          <div className="mt-3 space-y-2">
            {resolvedComments.map((comment) => (
              <Card key={comment.id} className="opacity-60">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs font-medium text-slate-700">
                      {comment.author_name || comment.author_email}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600">{comment.comment_text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}