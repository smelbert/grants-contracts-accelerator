import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart } from 'lucide-react';
import { format } from 'date-fns';

export default function DiscussionReplies({ discussionId, userEmail, userName }) {
  const [replyText, setReplyText] = useState('');
  const queryClient = useQueryClient();

  const { data: replies = [] } = useQuery({
    queryKey: ['discussionReplies', discussionId],
    queryFn: () => base44.entities.DiscussionReply.filter({ discussion_id: discussionId }),
  });

  const createReplyMutation = useMutation({
    mutationFn: (data) => base44.entities.DiscussionReply.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussionReplies'] });
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      setReplyText('');
    },
  });

  const likeReplyMutation = useMutation({
    mutationFn: (reply) => base44.entities.DiscussionReply.update(reply.id, {
      total_likes: (reply.total_likes || 0) + 1
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussionReplies'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    createReplyMutation.mutate({
      discussion_id: discussionId,
      content: replyText,
      author_email: userEmail,
      author_name: userName || userEmail.split('@')[0],
      total_likes: 0
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">Replies ({replies.length})</h3>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write a reply..."
          className="h-24"
        />
        <Button type="submit" disabled={createReplyMutation.isPending || !replyText.trim()}>
          Post Reply
        </Button>
      </form>

      <div className="space-y-3">
        {replies.map((reply) => (
          <div key={reply.id} className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-slate-900">{reply.author_name}</p>
                <p className="text-xs text-slate-500">
                  {format(new Date(reply.created_date), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => likeReplyMutation.mutate(reply)}
                className="gap-1"
              >
                <Heart className={`w-4 h-4 ${reply.total_likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                {reply.total_likes || 0}
              </Button>
            </div>
            <p className="text-slate-700">{reply.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}