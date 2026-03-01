import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function BlogAIAssistant({ isOpen, onOpenChange, onApplyResult, currentPost }) {
  const [activeTab, setActiveTab] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [result, setResult] = useState(null);

  const generateDraft = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a comprehensive blog post about "${topic}". 
        
        Structure it with:
        - A compelling title
        - An introduction that hooks the reader
        - 3-4 main sections with subheadings
        - Real examples and practical insights
        - A strong conclusion
        
        Make it engaging, informative, and well-organized. Write in HTML format suitable for a blog post.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            excerpt: { type: 'string' },
            content: { type: 'string' },
            suggested_tags: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      setResult(res);
      toast.success('Blog draft generated!');
    } catch (err) {
      toast.error('Failed to generate draft');
    }
    setLoading(false);
  };

  const refineTone = async () => {
    if (!currentPost?.content) {
      toast.error('No post content to refine');
      return;
    }
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Please refine this blog post to improve its tone and style. Make it more:
        - Professional yet approachable
        - Clear and concise
        - Engaging and compelling
        - Well-organized and easy to follow
        
        Current content:
        ${currentPost.content}
        
        Return only the refined content in HTML format, maintaining the structure.`,
        response_json_schema: {
          type: 'object',
          properties: {
            refined_content: { type: 'string' }
          }
        }
      });
      setResult({ content: res.refined_content });
      toast.success('Tone refined!');
    } catch (err) {
      toast.error('Failed to refine tone');
    }
    setLoading(false);
  };

  const suggestMetadata = async () => {
    const contentToAnalyze = currentPost?.title || topic;
    if (!contentToAnalyze.trim()) {
      toast.error('Enter a title or topic');
      return;
    }
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `For a blog post about "${contentToAnalyze}", suggest:
        1. SEO meta title (50-60 characters, compelling)
        2. SEO meta description (155-160 characters, descriptive)
        3. 5-7 relevant tags for categorization
        4. Suggested category
        
        Focus on SEO best practices and relevance.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            seo_title: { type: 'string' },
            seo_description: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            category: { type: 'string' }
          }
        }
      });
      setResult(res);
      toast.success('Metadata suggestions generated!');
    } catch (err) {
      toast.error('Failed to generate suggestions');
    }
    setLoading(false);
  };

  const handleApply = () => {
    if (result) {
      onApplyResult(result);
      setResult(null);
      setTopic('');
      setKeywords('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Blog AI Assistant
          </DialogTitle>
          <DialogDescription>
            Use AI to draft posts, refine tone, and optimize for SEO
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draft">Draft Post</TabsTrigger>
            <TabsTrigger value="refine" disabled={!currentPost?.content}>Refine Tone</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="draft" className="space-y-4">
            <div>
              <Label htmlFor="topic">Blog Topic or Keyword</Label>
              <Input
                id="topic"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g., Grant Writing Tips for Nonprofits"
                onKeyDown={e => e.key === 'Enter' && generateDraft()}
              />
            </div>
            <Button onClick={generateDraft} disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700">
              {loading ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Draft</>}
            </Button>
          </TabsContent>

          <TabsContent value="refine" className="space-y-4">
            <p className="text-sm text-slate-600">Your post will be refined to improve tone, clarity, and engagement.</p>
            <Button onClick={refineTone} disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700">
              {loading ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Refining...</> : <><Sparkles className="w-4 h-4 mr-2" /> Refine Tone & Style</>}
            </Button>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4">
            <div>
              <Label htmlFor="keywords">Title or Topic</Label>
              <Input
                id="keywords"
                value={currentPost?.title || topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Enter title to analyze"
              />
            </div>
            <Button onClick={suggestMetadata} disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700">
              {loading ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Suggest Metadata</>}
            </Button>
          </TabsContent>
        </Tabs>

        {result && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg space-y-3 border border-slate-200">
            <h3 className="font-semibold text-slate-800 text-sm">Generated Content</h3>
            {result.title && <div><strong>Title:</strong> <span className="text-slate-700 text-sm">{result.title}</span></div>}
            {result.excerpt && <div><strong>Excerpt:</strong> <span className="text-slate-700 text-sm">{result.excerpt}</span></div>}
            {result.seo_title && <div><strong>SEO Title:</strong> <span className="text-slate-700 text-sm">{result.seo_title}</span></div>}
            {result.seo_description && <div><strong>SEO Description:</strong> <span className="text-slate-700 text-sm line-clamp-2">{result.seo_description}</span></div>}
            {result.category && <div><strong>Category:</strong> <span className="text-slate-700 text-sm">{result.category}</span></div>}
            {result.tags && <div><strong>Tags:</strong> <span className="text-slate-700 text-sm">{result.tags?.join(', ')}</span></div>}
            {result.content && <div><strong>Content Preview:</strong> <div className="text-slate-700 text-xs bg-white p-2 rounded border border-slate-100 max-h-40 overflow-y-auto line-clamp-4">{result.content.replace(/<[^>]*>/g, '').substring(0, 300)}...</div></div>}
            {result.refined_content && <div><strong>Refined Content Preview:</strong> <div className="text-slate-700 text-xs bg-white p-2 rounded border border-slate-100 max-h-40 overflow-y-auto line-clamp-4">{result.refined_content.replace(/<[^>]*>/g, '').substring(0, 300)}...</div></div>}
            <Button onClick={handleApply} className="w-full bg-green-600 hover:bg-green-700">
              Apply to Post
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}