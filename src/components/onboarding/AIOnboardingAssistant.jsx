import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Sparkles, X, Send, Loader2, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIOnboardingAssistant({ userRole, currentPage, userProgress }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  // Role-based context
  const getRoleContext = () => {
    const contexts = {
      admin: 'platform administrator managing spaces, content, and users',
      coach: 'coach working with organizations and providing guidance',
      user: 'community member accessing learning resources and community spaces'
    };
    return contexts[userRole] || contexts.user;
  };

  // Page-based proactive tips
  const getPageTips = () => {
    const tips = {
      Home: {
        title: 'Welcome to Your Dashboard',
        tips: [
          'Check your readiness status to see where your organization stands',
          'Explore recommended funding lanes that match your stage',
          'Complete your onboarding checklist to unlock all features'
        ]
      },
      Community: {
        title: 'Getting Started with Community',
        tips: [
          'Browse different spaces to find communities that match your interests',
          'Introduce yourself in the welcome post to connect with others',
          'Join discussions to ask questions and share insights'
        ]
      },
      Learning: {
        title: 'Maximize Your Learning Experience',
        tips: [
          'Start with courses matched to your funding lane',
          'Download handouts and templates for offline reference',
          'Track your progress and earn badges as you complete modules'
        ]
      },
      Templates: {
        title: 'Working with Templates',
        tips: [
          'Filter templates by your funding lane and organization stage',
          'Use AI assistance to customize templates for your needs',
          'Save favorites for quick access later'
        ]
      }
    };
    return tips[currentPage] || null;
  };

  // Show welcome message on first load
  useEffect(() => {
    if (!hasShownWelcome && !isOpen) {
      setTimeout(() => {
        const welcomeMessage = getWelcomeMessage();
        setMessages([{ role: 'assistant', content: welcomeMessage }]);
        setIsOpen(true);
        setHasShownWelcome(true);
      }, 2000);
    }
  }, [hasShownWelcome]);

  // Show contextual tips when page changes
  useEffect(() => {
    if (hasShownWelcome && currentPage) {
      const pageTips = getPageTips();
      if (pageTips && messages.length > 0) {
        const tipMessage = `🎯 **${pageTips.title}**\n\n${pageTips.tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}`;
        setMessages(prev => [...prev, { role: 'assistant', content: tipMessage }]);
        if (!isOpen) {
          setIsOpen(true);
          setIsMinimized(false);
        }
      }
    }
  }, [currentPage]);

  const getWelcomeMessage = () => {
    const roleMessages = {
      admin: `👋 **Welcome, Administrator!**

I'm your AI onboarding assistant, here to help you get the most out of the platform.

As an admin, you have full access to:
- **Community Management**: Create and manage spaces
- **Content Creation**: Build learning modules and templates
- **User Management**: Invite and manage team members
- **Platform Settings**: Customize branding and workflows

**Quick Start Tips:**
1. Set up your first community space
2. Invite team members to collaborate
3. Explore the template library to customize resources

Need help with anything specific? Just ask!`,
      coach: `👋 **Welcome, Coach!**

I'm your AI assistant, ready to help you support your organizations effectively.

As a coach, you can:
- **Review Documents**: Provide feedback on proposals and documents
- **Track Progress**: Monitor organization readiness and milestones
- **Teach & Share**: Create learning content and host sessions
- **Support Growth**: Guide organizations through their funding journey

**Quick Start Tips:**
1. Set up your coach profile
2. Review your assigned organizations
3. Familiarize yourself with the review queue

What would you like to know more about?`,
      user: `👋 **Welcome to EIS!**

I'm your AI onboarding assistant, here to help you navigate the platform and achieve your funding goals.

Here's what you can do:
- **Learn & Grow**: Access courses, workshops, and resources
- **Connect**: Join community spaces and network with peers
- **Build**: Create proposals using proven templates
- **Track Progress**: Monitor your funding readiness

**Quick Start Tips:**
1. Complete your organization profile
2. Join relevant community spaces
3. Explore learning resources for your funding lane

How can I help you get started?`
    };
    return roleMessages[userRole] || roleMessages.user;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const context = `You are an AI onboarding assistant for Elbert Innovative Solutions (EIS), a platform helping organizations secure funding through grants, contracts, and donors.

Current User Context:
- Role: ${getRoleContext()}
- Current Page: ${currentPage || 'Dashboard'}
- Onboarding Progress: ${userProgress || 'Just started'}

Your task is to provide helpful, concise guidance for this user. Focus on:
1. Answering their specific question
2. Providing actionable next steps
3. Pointing them to relevant features or resources
4. Keeping responses friendly and conversational

Be specific to their role and current context. Keep responses under 150 words unless more detail is needed.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${context}\n\nUser Question: ${userMessage}`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { role: 'assistant', content: result }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Sorry, I encountered an error. Please try again or contact support if the issue persists.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
      >
        <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E5C089] rounded-full animate-pulse" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
      >
        <Card className="shadow-2xl border-2 border-[#E5C089]/20">
          <CardHeader className="bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white p-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#E5C089] rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#143A50]" />
                </div>
                <CardTitle className="text-lg">AI Assistant</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 text-white hover:bg-white/10"
                >
                  {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-slate-50 to-white">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-[#143A50] text-white'
                          : 'bg-white border border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-line">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#143A50]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t p-4 bg-white">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask me anything about getting started..."
                    className="min-h-[60px] resize-none"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="bg-[#143A50] hover:bg-[#1E4F58] h-[60px]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}