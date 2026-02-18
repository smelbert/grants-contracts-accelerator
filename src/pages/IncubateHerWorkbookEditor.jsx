import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Save, 
  FileText, 
  Eye, 
  Loader2, 
  Plus,
  Undo,
  CheckCircle2
} from 'lucide-react';
import { WORKBOOK_PAGES } from '@/components/incubateher/workbookContent';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function IncubateHerWorkbookEditor() {
  const queryClient = useQueryClient();
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [editMode, setEditMode] = useState('preview');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [takeaways, setTakeaways] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [requiredForConsultation, setRequiredForConsultation] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch all custom page content
  const { data: customPages = [] } = useQuery({
    queryKey: ['workbook-custom-pages'],
    queryFn: () => base44.entities.WorkbookPageContent.list(),
  });

  // Get selected page data
  const selectedDefaultPage = WORKBOOK_PAGES.find(p => p.id === selectedPageId);
  const selectedCustomPage = customPages.find(p => p.page_id === selectedPageId);

  // Load page data when selected
  React.useEffect(() => {
    if (selectedPageId) {
      const custom = customPages.find(p => p.page_id === selectedPageId);
      const defaultPage = WORKBOOK_PAGES.find(p => p.id === selectedPageId);
      
      const pageData = custom || defaultPage;
      
      setTitle(pageData?.title || '');
      setSubtitle(pageData?.subtitle || '');
      setContent(pageData?.content || '');
      setVideoUrl(pageData?.video_url || '');
      setVideoDescription(pageData?.video_description || '');
      setTakeaways(pageData?.takeaways || []);
      setActionItems(pageData?.actionItems || pageData?.action_items || []);
      setRequiredForConsultation(pageData?.required_for_consultation || false);
    }
  }, [selectedPageId, customPages]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const existing = customPages.find(p => p.page_id === selectedPageId);
      
      if (existing) {
        return base44.entities.WorkbookPageContent.update(existing.id, data);
      } else {
        return base44.entities.WorkbookPageContent.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workbook-custom-pages'] });
      toast.success('Page content saved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to save: ' + error.message);
    }
  });

  // Reset to default mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      const existing = customPages.find(p => p.page_id === selectedPageId);
      if (existing) {
        return base44.entities.WorkbookPageContent.delete(existing.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workbook-custom-pages'] });
      toast.success('Reset to default content');
      
      // Reload default content
      const defaultPage = WORKBOOK_PAGES.find(p => p.id === selectedPageId);
      if (defaultPage) {
        setTitle(defaultPage.title || '');
        setSubtitle(defaultPage.subtitle || '');
        setContent(defaultPage.content || '');
        setVideoUrl(defaultPage.video_url || '');
        setVideoDescription(defaultPage.video_description || '');
        setTakeaways(defaultPage.takeaways || []);
        setActionItems(defaultPage.actionItems || []);
      }
    }
  });

  const handleSave = () => {
    if (!selectedPageId) {
      toast.error('Please select a page first');
      return;
    }

    saveMutation.mutate({
      page_id: selectedPageId,
      title: title || null,
      subtitle: subtitle || null,
      content: content || null,
      video_url: videoUrl || null,
      video_description: videoDescription || null,
      takeaways: takeaways.length > 0 ? takeaways : null,
      action_items: actionItems.length > 0 ? actionItems : null,
      required_for_consultation: requiredForConsultation,
      last_edited_by: user?.email
    });
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional educational content writer for the IncubateHer Funding Readiness program. 
        
Context: This is page "${selectedDefaultPage?.title}" (${selectedDefaultPage?.type}) in section "${selectedDefaultPage?.section}".

Current content:
${content}

User request: ${aiPrompt}

Generate improved HTML content that is:
- Concise and focused (follow character count guidelines for ${selectedDefaultPage?.type} pages)
- Professional and actionable
- Uses proper HTML formatting (paragraphs, lists, divs with appropriate classes)
- Includes Tailwind CSS classes for styling (text-sm, mb-3, font-semibold, etc.)
- Educational and empowering in tone

Return only the HTML content, no explanations.`,
        response_json_schema: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            suggested_takeaways: { 
              type: 'array',
              items: { type: 'string' }
            },
            suggested_action_items: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      setContent(response.content);
      
      if (response.suggested_takeaways?.length > 0) {
        setTakeaways(response.suggested_takeaways);
      }
      
      if (response.suggested_action_items?.length > 0) {
        setActionItems(response.suggested_action_items);
      }
      
      toast.success('AI content generated!');
      setAiPrompt('');
    } catch (error) {
      toast.error('AI generation failed: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const isCustomized = customPages.some(p => p.page_id === selectedPageId);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Workbook Content Editor</h1>
            <p className="text-slate-600">Customize workbook pages and section headers with AI assistance or manual editing</p>
          </div>
          <Button
            onClick={() => window.location.href = '/pages/WorkbookSectionEditor'}
            variant="outline"
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Edit Section Headers
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Page List */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workbook Pages</CardTitle>
                <CardDescription>Select a page to edit</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1 p-4">
                    {WORKBOOK_PAGES.map((page) => {
                      const isCustom = customPages.some(p => p.page_id === page.id);
                      return (
                        <button
                          key={page.id}
                          onClick={() => setSelectedPageId(page.id)}
                          className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                            selectedPageId === page.id
                              ? 'bg-[#143A50] text-white'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">{page.title}</span>
                            {isCustom && <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />}
                          </div>
                          <div className="text-xs opacity-70 mt-1">{page.type}</div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="col-span-9">
            {selectedPageId ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedDefaultPage?.title}</CardTitle>
                      <CardDescription>
                        {selectedDefaultPage?.section} • {selectedDefaultPage?.type}
                        {isCustomized && (
                          <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                            Customized
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCustomized && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetMutation.mutate()}
                          disabled={resetMutation.isPending}
                        >
                          <Undo className="w-4 h-4 mr-2" />
                          Reset to Default
                        </Button>
                      )}
                      <Button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="bg-[#143A50] hover:bg-[#1E4F58]"
                      >
                        {saveMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={editMode} onValueChange={setEditMode}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="edit">
                        <FileText className="w-4 h-4 mr-2" />
                        Edit
                      </TabsTrigger>
                      <TabsTrigger value="ai">
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Assistant
                      </TabsTrigger>
                      <TabsTrigger value="preview">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Page Title</label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Page title"
                        />
                      </div>

                      {selectedDefaultPage?.subtitle !== undefined && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Subtitle</label>
                          <Input
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="Page subtitle"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium mb-2 block">Content (HTML)</label>
                        <Textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows={15}
                          className="font-mono text-xs"
                          placeholder="HTML content..."
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Use Tailwind CSS classes for styling. Current length: {content.length} characters
                        </p>
                      </div>

                      {selectedDefaultPage?.video_url !== undefined && (
                        <>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Video URL</label>
                            <Input
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              placeholder="YouTube or Vimeo URL"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Video Description</label>
                            <Input
                              value={videoDescription}
                              onChange={(e) => setVideoDescription(e.target.value)}
                              placeholder="Brief description of video content"
                            />
                          </div>
                        </>
                      )}

                      {selectedDefaultPage?.takeaways !== undefined && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Key Takeaways</label>
                          <Textarea
                            value={takeaways.join('\n')}
                            onChange={(e) => setTakeaways(e.target.value.split('\n').filter(Boolean))}
                            rows={4}
                            placeholder="One takeaway per line..."
                          />
                        </div>
                      )}

                      {selectedDefaultPage?.actionItems !== undefined && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Action Items</label>
                          <Textarea
                            value={actionItems.join('\n')}
                            onChange={(e) => setActionItems(e.target.value.split('\n').filter(Boolean))}
                            rows={4}
                            placeholder="One action item per line..."
                          />
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={requiredForConsultation}
                            onCheckedChange={setRequiredForConsultation}
                          />
                          <div>
                            <label className="text-sm font-medium">Required for Consultation</label>
                            <p className="text-xs text-slate-500">
                              Participants must complete this page before booking a one-on-one consultation
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="ai" className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-sm mb-2 flex items-center">
                          <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                          AI Content Assistant
                        </h3>
                        <p className="text-xs text-slate-600 mb-4">
                          Describe what you want to improve or generate for this page. The AI will maintain the educational tone and proper formatting.
                        </p>
                        
                        <Textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          rows={4}
                          placeholder="Example: Make the content more concise and action-oriented, focusing on practical steps..."
                          className="mb-3"
                        />
                        
                        <Button
                          onClick={handleAIGenerate}
                          disabled={isGenerating || !aiPrompt.trim()}
                          className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate with AI
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg border">
                        <h4 className="font-medium text-sm mb-2">Quick AI Prompts:</h4>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAiPrompt('Make the content more concise while maintaining all key information')}
                            className="w-full justify-start text-xs"
                          >
                            Make it more concise
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAiPrompt('Add more actionable steps and practical examples')}
                            className="w-full justify-start text-xs"
                          >
                            Add practical examples
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAiPrompt('Simplify the language for better accessibility')}
                            className="w-full justify-start text-xs"
                          >
                            Simplify language
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAiPrompt('Make it more empowering and encouraging in tone')}
                            className="w-full justify-start text-xs"
                          >
                            More empowering tone
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="preview">
                      <div className="border rounded-lg p-6 bg-white">
                        <h2 className="text-2xl font-bold text-[#143A50] mb-4">{title}</h2>
                        {subtitle && <p className="text-lg text-[#AC1A5B] mb-4">{subtitle}</p>}
                        
                        {takeaways?.length > 0 && (
                          <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <h3 className="font-semibold text-sm mb-2">Key Takeaways</h3>
                            <ul className="list-disc ml-5 text-sm space-y-1">
                              {takeaways.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: content }}
                        />
                        
                        {actionItems?.length > 0 && (
                          <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                            <h3 className="font-semibold text-sm mb-2">Action Items</h3>
                            <ul className="list-disc ml-5 text-sm space-y-1">
                              {actionItems.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-[600px]">
                  <div className="text-center text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Select a page from the list to start editing</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}