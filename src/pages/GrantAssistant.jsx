import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Save, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isTool = message.role === 'assistant' && message.tool_calls?.length > 0;

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#143A50] flex items-center justify-center flex-shrink-0 mt-0.5">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-lg ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isUser
              ? 'bg-[#143A50] text-white rounded-br-none'
              : 'bg-white border border-slate-200 rounded-bl-none'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        {isTool && (
          <div className="mt-2 text-xs text-slate-500">
            {message.tool_calls.map((call, i) => (
              <div key={i} className="flex items-center gap-1">
                {call.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>{call.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const QUICK_PROMPTS = [
  { label: 'Find new opportunities', prompt: 'Show me grants and contracts I might be eligible for based on my organization profile.' },
  { label: 'Show high-priority grants', prompt: 'What are the highest-priority grants closing soon that match my mission?' },
  { label: 'Check upcoming deadlines', prompt: 'What are my upcoming opportunity deadlines in the next 30 days?' },
  { label: 'Pipeline summary', prompt: 'Give me a summary of my current grant pipeline and progress.' },
  { label: 'Capacity check', prompt: 'Based on my organization profile, what\'s my funding readiness level?' },
];

export default function GrantAssistantPage() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const queryClient = useQueryClient();

  // Initialize conversation
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        const conversation = await base44.agents.createConversation({
          agent_name: 'grant_assistant',
          metadata: {
            name: 'Grant Assistant Conversation',
            description: 'Strategic funding discussion'
          }
        });
        setConversationId(conversation.id);
      } catch (err) {
        console.error('Failed to initialize conversation:', err);
        toast.error('Failed to start conversation');
      }
    };

    if (!conversationId && user?.email) {
      initializeConversation();
    }
  }, [user?.email, conversationId]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
    });

    return unsubscribe;
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!conversationId || !text.trim()) return;

    setIsSending(true);
    try {
      const conversation = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: text
      });
      setInput('');
    } catch (err) {
      toast.error('Failed to send message: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const saveConversation = async () => {
    if (!conversationTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      // Save conversation as a Document
      const content = messages
        .map(m => `**${m.role === 'user' ? 'You' : 'Grant Assistant'}**: ${m.content}`)
        .join('\n\n');

      await base44.entities.Document.create({
        title: conversationTitle,
        content,
        document_type: 'grant_assistant_conversation',
        status: 'active'
      });

      toast.success('Conversation saved!');
      setShowSaveDialog(false);
      setConversationTitle('');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    } catch (err) {
      toast.error('Failed to save: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#143A50] flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#E5C089]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#143A50]">Grant Assistant</h1>
              <p className="text-sm text-slate-500">Your AI-powered funding advisor</p>
            </div>
          </div>
          <Button
            onClick={() => setShowSaveDialog(true)}
            variant="outline"
            className="gap-2"
            disabled={messages.length === 0}
          >
            <Save className="w-4 h-4" />
            Save Conversation
          </Button>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#143A50]/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-[#143A50]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Your Grant Assistant</h2>
              <p className="text-slate-600 mb-6">
                I can help you discover opportunities, manage deadlines, track submissions, and make strategic funding decisions.
              </p>

              {/* Quick prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(prompt.prompt)}
                    className="p-4 rounded-lg border border-slate-200 hover:border-[#143A50] hover:bg-slate-50 transition-all text-left"
                  >
                    <p className="font-medium text-slate-900 text-sm">{prompt.label}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prompt.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-slate-200 p-6">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Input
            placeholder="Ask about grants, deadlines, opportunities, or strategy..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            disabled={isSending || !conversationId}
            className="flex-1"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={isSending || !input.trim() || !conversationId}
            className="bg-[#143A50] hover:bg-[#1E4F58]"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Save conversation dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Save Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="e.g., Grant Strategy Discussion"
                  value={conversationTitle}
                  onChange={(e) => setConversationTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={saveConversation} className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]">
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}