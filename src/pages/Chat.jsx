import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Hash, Lock } from 'lucide-react';
import { format } from 'date-fns';

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messageText, setMessageText] = useState('');

  const { data: channels = [] } = useQuery({
    queryKey: ['chat-channels'],
    queryFn: () => base44.entities.ChatChannel.list(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', selectedChannel],
    queryFn: () => base44.entities.ChatMessage.filter({ channel_id: selectedChannel }),
    enabled: !!selectedChannel,
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Direct Messages</h1>
            <p className="text-sm text-slate-600">Private conversations with other members</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Channels Sidebar */}
        <div className="w-64 bg-slate-800 text-white p-4 overflow-y-auto">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversations
          </h2>
        <div className="space-y-1">
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
                selectedChannel === channel.id ? 'bg-slate-700' : 'hover:bg-slate-700/50'
              }`}
            >
              {channel.channel_type === 'private' ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
              {channel.channel_name}
            </button>
          ))}
        </div>
      </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedChannel ? (
            <>
              <div className="border-b bg-white p-4">
                <h2 className="font-bold">
                  {channels.find(c => c.id === selectedChannel)?.channel_name}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {channels.find(c => c.id === selectedChannel)?.channel_type === 'direct_message' ? 'Direct Message' : 'Group Chat'}
                </p>
              </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-300 flex-shrink-0" />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium">{msg.sender_name}</span>
                      <span className="text-xs text-slate-500">
                        {format(new Date(msg.created_date), 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm">{msg.message_text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t bg-white p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <Button>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Your Direct Messages</h3>
                <p className="text-slate-500">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}