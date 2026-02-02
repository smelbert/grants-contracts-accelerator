import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, User, Search, Plus } from 'lucide-react';
import { format } from 'date-fns';
import PlatformGuidelinesDialog from '@/components/community/PlatformGuidelinesDialog';

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (profile && !profile.platform_guidelines_accepted) {
      setShowGuidelines(true);
    }
  }, [profile]);

  const { data: conversations = [] } = useQuery({
    queryKey: ['directMessages', user?.email],
    queryFn: async () => {
      const messages = await base44.entities.DirectMessage.filter({}, '-created_date');
      
      const convMap = {};
      messages.forEach(msg => {
        const otheremail = msg.sender_email === user.email ? msg.recipient_email : msg.sender_email;
        if (!convMap[msg.conversation_id]) {
          convMap[msg.conversation_id] = {
            id: msg.conversation_id,
            other_user_email: other_email,
            last_message: msg.message_text,
            last_message_time: msg.created_date,
            unread: !msg.is_read && msg.recipient_email === user.email
          };
        }
      });
      
      return Object.values(convMap);
    },
    enabled: !!user?.email,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['conversationMessages', selectedConversation],
    queryFn: () => base44.entities.DirectMessage.filter({ conversation_id: selectedConversation }, 'created_date'),
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.DirectMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversationMessages']);
      queryClient.invalidateQueries(['directMessages']);
      setMessageText('');
    },
  });

  return (
    <>
      <div className="h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-[#143A50]" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Direct Messages</h1>
                <p className="text-sm text-slate-600">Private conversations with community members</p>
              </div>
            </div>
            <Button className="bg-[#143A50] hover:bg-[#1E4F58]">
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Conversations Sidebar */}
          <div className="w-80 bg-white border-r p-4 overflow-y-auto">
            <div className="mb-4">
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-1">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No conversations yet
                </div>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                      selectedConversation === conv.id 
                        ? 'bg-[#143A50]/10 border border-[#143A50]' 
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#143A50] text-white flex items-center justify-center font-semibold">
                        {conv.other_user_email?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm truncate">{conv.other_user_email}</span>
                          {conv.unread && (
                            <Badge className="bg-[#AC1A5B] text-white text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{conv.last_message}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedConversation ? (
              <>
                <div className="border-b bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#143A50] text-white flex items-center justify-center font-semibold">
                      {conversations.find(c => c.id === selectedConversation)?.other_user_email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-bold">
                        {conversations.find(c => c.id === selectedConversation)?.other_user_email}
                      </h2>
                      <p className="text-xs text-slate-500">Direct Message</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => {
                    const isCurrentUser = msg.sender_email === user?.email;
                    return (
                      <div key={msg.id} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-[#143A50] text-white flex items-center justify-center font-semibold text-xs flex-shrink-0">
                          {msg.sender_email?.[0]?.toUpperCase()}
                        </div>
                        <div className={`max-w-md ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2 rounded-lg ${
                            isCurrentUser 
                              ? 'bg-[#143A50] text-white' 
                              : 'bg-slate-100 text-slate-900'
                          }`}>
                            <p className="text-sm">{msg.message_text}</p>
                          </div>
                          <span className="text-xs text-slate-500 mt-1 block">
                            {format(new Date(msg.created_date), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="border-t bg-white p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && messageText.trim()) {
                          sendMessageMutation.mutate({
                            sender_email: user.email,
                            recipient_email: conversations.find(c => c.id === selectedConversation)?.other_user_email,
                            message_text: messageText,
                            conversation_id: selectedConversation
                          });
                        }
                      }}
                    />
                    <Button 
                      onClick={() => {
                        if (messageText.trim()) {
                          sendMessageMutation.mutate({
                            sender_email: user.email,
                            recipient_email: conversations.find(c => c.id === selectedConversation)?.other_user_email,
                            message_text: messageText,
                            conversation_id: selectedConversation
                          });
                        }
                      }}
                      disabled={!messageText.trim()}
                      className="bg-[#143A50] hover:bg-[#1E4F58]"
                    >
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

      {/* Platform Guidelines Dialog */}
      <PlatformGuidelinesDialog
        open={showGuidelines}
        onAccepted={() => setShowGuidelines(false)}
        userEmail={user?.email}
      />
    </>
  );
}