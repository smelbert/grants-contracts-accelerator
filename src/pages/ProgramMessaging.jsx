import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Search, Users, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ProgramMessagingPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Get user's program enrollments (to know which programs they're part of)
  const { data: userEnrollments = [] } = useQuery({
    queryKey: ['user-enrollments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
    },
    enabled: !!user?.email
  });

  // Get all messages where user is sender or recipient
  const { data: messages = [] } = useQuery({
    queryKey: ['program-messages', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      
      const sent = await base44.entities.DirectMessage.filter({
        sender_email: user.email
      }, '-created_date');
      
      const received = await base44.entities.DirectMessage.filter({
        recipient_email: user.email
      }, '-created_date');
      
      return [...sent, ...received].sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
    },
    enabled: !!user?.email,
    refetchInterval: 5000 // Poll every 5 seconds
  });

  // Get conversation participants (people user can message)
  const { data: availableContacts = [] } = useQuery({
    queryKey: ['program-contacts', user?.email],
    queryFn: async () => {
      if (!user?.email || userEnrollments.length === 0) return [];
      
      const cohortIds = userEnrollments.map(e => e.cohort_id);
      const contacts = [];
      
      for (const cohortId of cohortIds) {
        const enrollments = await base44.entities.ProgramEnrollment.filter({
          cohort_id: cohortId
        });
        
        const cohort = await base44.entities.ProgramCohort.get(cohortId);
        
        contacts.push(...enrollments.map(e => ({
          email: e.participant_email,
          name: e.participant_name,
          role: e.role,
          cohort_name: cohort.program_name
        })));
      }
      
      // Remove duplicates and self
      const uniqueContacts = contacts.filter((contact, index, self) =>
        contact.email !== user.email &&
        index === self.findIndex(c => c.email === contact.email)
      );
      
      return uniqueContacts;
    },
    enabled: !!user?.email && userEnrollments.length > 0
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.DirectMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['program-messages']);
      setMessageText('');
      toast.success('Message sent');
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.DirectMessage.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['program-messages']);
    }
  });

  // Group messages into conversations
  const conversations = {};
  messages.forEach(msg => {
    const otherPerson = msg.sender_email === user?.email ? msg.recipient_email : msg.sender_email;
    if (!conversations[otherPerson]) {
      conversations[otherPerson] = [];
    }
    conversations[otherPerson].push(msg);
  });

  const conversationList = Object.entries(conversations).map(([email, msgs]) => {
    const latestMsg = msgs[0];
    const unreadCount = msgs.filter(m => 
      m.recipient_email === user?.email && !m.is_read
    ).length;
    const contact = availableContacts.find(c => c.email === email);
    
    return {
      email,
      name: contact?.name || email,
      role: contact?.role || 'unknown',
      cohort_name: contact?.cohort_name,
      latestMessage: latestMsg,
      messages: msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)),
      unreadCount
    };
  }).filter(conv => 
    !searchQuery || conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (selectedConversation) {
      // Mark messages as read
      const unreadMessages = selectedConversation.messages.filter(
        m => m.recipient_email === user?.email && !m.is_read
      );
      unreadMessages.forEach(msg => {
        markAsReadMutation.mutate({ id: msg.id });
      });
    }
  }, [selectedConversation?.email]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      sender_email: user.email,
      recipient_email: selectedConversation.email,
      subject: 'Program Message',
      message_body: messageText,
      is_read: false
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="w-8 h-8 text-[#143A50]" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Program Messaging</h1>
            <p className="text-slate-600">Connect with program staff and participants</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <CardTitle>Conversations</CardTitle>
              </div>
              <div className="mt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="space-y-2">
                {conversationList.map((conv) => (
                  <button
                    key={conv.email}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-3 rounded-lg transition hover:bg-slate-50 ${
                      selectedConversation?.email === conv.email ? 'bg-slate-100' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-900 truncate">{conv.name}</p>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-[#AC1A5B]">{conv.unreadCount}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mb-1">{conv.role} • {conv.cohort_name}</p>
                        <p className="text-sm text-slate-600 truncate">
                          {conv.latestMessage.message_body}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 whitespace-nowrap">
                        {format(new Date(conv.latestMessage.created_date), 'MMM d')}
                      </p>
                    </div>
                  </button>
                ))}
                
                {conversationList.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No conversations yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Select a contact from below to start
                    </p>
                  </div>
                )}
              </div>

              {/* Available Contacts to Start New Conversation */}
              {availableContacts.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm font-medium text-slate-700 mb-3">Available Contacts</p>
                  <div className="space-y-2">
                    {availableContacts
                      .filter(contact => !conversationList.find(conv => conv.email === contact.email))
                      .slice(0, 5)
                      .map(contact => (
                        <button
                          key={contact.email}
                          onClick={() => setSelectedConversation({
                            email: contact.email,
                            name: contact.name,
                            role: contact.role,
                            cohort_name: contact.cohort_name,
                            messages: [],
                            unreadCount: 0
                          })}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition"
                        >
                          <p className="text-sm font-medium text-slate-900">{contact.name}</p>
                          <p className="text-xs text-slate-500">{contact.role}</p>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div>
                    <CardTitle>{selectedConversation.name}</CardTitle>
                    <p className="text-sm text-slate-600">
                      {selectedConversation.role} • {selectedConversation.cohort_name}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Messages */}
                  <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                    {selectedConversation.messages.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600">No messages yet</p>
                        <p className="text-sm text-slate-500">Start the conversation below</p>
                      </div>
                    ) : (
                      selectedConversation.messages.map((msg) => {
                        const isOwnMessage = msg.sender_email === user.email;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isOwnMessage
                                  ? 'bg-[#143A50] text-white'
                                  : 'bg-slate-100 text-slate-900'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.message_body}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-slate-300' : 'text-slate-500'
                              }`}>
                                {format(new Date(msg.created_date), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message..."
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="bg-[#143A50]"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Select a conversation to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}