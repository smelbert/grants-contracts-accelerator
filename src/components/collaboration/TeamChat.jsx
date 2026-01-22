import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Pin } from 'lucide-react';
import { format } from 'date-fns';

export default function TeamChat({ organizationId }) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: messages } = useQuery({
    queryKey: ['teamMessages', organizationId],
    queryFn: () => base44.entities.TeamMessage.filter({ organization_id: organizationId }, '-created_date', 50),
    enabled: !!organizationId,
    refetchInterval: 5000 // Poll every 5 seconds for new messages
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMessages', organizationId]);
      setMessage('');
    }
  });

  const togglePinMutation = useMutation({
    mutationFn: ({ id, isPinned }) => base44.entities.TeamMessage.update(id, { is_pinned: !isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMessages', organizationId]);
    }
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!organizationId) return;

    const unsubscribe = base44.entities.TeamMessage.subscribe((event) => {
      if (event.data.organization_id === organizationId) {
        queryClient.invalidateQueries(['teamMessages', organizationId]);
      }
    });

    return unsubscribe;
  }, [organizationId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      organization_id: organizationId,
      message: message,
      sender_name: user?.full_name || 'Unknown',
      sender_email: user?.email
    });
  };

  const pinnedMessages = messages?.filter(m => m.is_pinned) || [];
  const regularMessages = messages?.filter(m => !m.is_pinned) || [];

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          Team Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Pinned Messages */}
        {pinnedMessages.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-medium text-amber-900 mb-2 flex items-center gap-1">
              <Pin className="w-3 h-3" />
              Pinned
            </p>
            {pinnedMessages.map(msg => (
              <div key={msg.id} className="text-sm text-amber-800 mb-1">
                <strong>{msg.sender_name}:</strong> {msg.message}
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {regularMessages.reverse().map(msg => (
            <div key={msg.id} className="group">
              <div className={`flex gap-2 ${msg.sender_email === user?.email ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.sender_email === user?.email ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-lg p-3 ${
                    msg.sender_email === user?.email 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-100 text-slate-900'
                  }`}>
                    {msg.sender_email !== user?.email && (
                      <p className="text-xs font-medium mb-1 opacity-80">{msg.sender_name}</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <p className="text-xs text-slate-500">
                      {format(new Date(msg.created_date), 'h:mm a')}
                    </p>
                    {msg.sender_email === user?.email && (
                      <button
                        onClick={() => togglePinMutation.mutate({ id: msg.id, isPinned: msg.is_pinned })}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Pin className="w-3 h-3 text-slate-400 hover:text-amber-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 border-t pt-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="resize-none"
            rows={2}
          />
          <Button onClick={handleSend} disabled={!message.trim() || sendMessageMutation.isPending}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}