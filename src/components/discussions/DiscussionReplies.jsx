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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Replies ({replies.length})
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Share your thoughts..."
          className="h-24 bg-white border-slate-200 focus:border-[#143A50] focus:ring-[#143A50]"
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={createReplyMutation.isPending || !replyText.trim()}
            className="bg-[#143A50] hover:bg-[#1E4F58]"
          >
            {createReplyMutation.isPending ? 'Posting...' : 'Post Reply'}
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {replies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No replies yet. Be the first to respond!</p>
          </div>
        ) : (
          replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#143A50] to-[#1E4F58] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {reply.author_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{reply.author_name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {format(new Date(reply.created_date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likeReplyMutation.mutate(reply)}
                      className="gap-1.5 hover:bg-red-50 group"
                    >
                      <Heart className={`w-4 h-4 transition-colors ${reply.total_likes > 0 ? 'fill-red-500 text-red-500' : 'text-slate-400 group-hover:text-red-500'}`} />
                      <span className={reply.total_likes > 0 ? 'text-red-600' : 'text-slate-600 group-hover:text-red-600'}>
                        {reply.total_likes || 0}
                      </span>
                    </Button>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{reply.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}