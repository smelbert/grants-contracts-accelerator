import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, Copy, CheckCircle2, BookOpen, Link, FileText, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AIContentAssistant({ open, onOpenChange, onApplyContent, mode = 'create' }) {
  const [activeTab, setActiveTab] = useState('outline');
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [contentToImprove, setContentToImprove] = useState('');

  const generateOutline = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a topic or objective');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert instructional designer for nonprofit funding readiness training. Generate a comprehensive course outline for: "${prompt}".

Include:
1. Course title and description (2-3 sentences)
2. Learning objectives (3-5 bullet points)
3. 4-6 lesson sections, each with:
   - Section title
   - Section description (2-3 sentences)
   - Duration estimate (in minutes)
   - Key topics to cover (3-5 bullet points)

Make it practical, actionable, and focused on nonprofit funding challenges.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            learning_objectives: { type: 'array', items: { type: 'string' } },
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  duration_minutes: { type: 'number' },
                  topics: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });

      setGeneratedContent(response);
      toast.success('Course outline generated!');
    } catch (error) {
      toast.error('Failed to generate outline');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateResources = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a lesson topic');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert in nonprofit funding resources. For the lesson topic: "${prompt}", suggest relevant learning resources.

Provide:
1. Video recommendations (3-5): Real YouTube videos or educational platforms about this topic
2. Handout suggestions (3-5): Document types that would support learning (templates, checklists, guides)
3. External resource links (3-5): Reputable websites, tools, or articles related to this topic

Focus on practical, actionable resources for nonprofit professionals.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            videos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  url: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            handouts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  type: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            external_links: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  url: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setGeneratedContent(response);
      toast.success('Resources generated!');
    } catch (error) {
      toast.error('Failed to generate resources');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const improveContent = async () => {
    if (!contentToImprove.trim()) {
      toast.error('Please enter content to improve');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert editor for nonprofit training content. Improve the following content by making it clearer, more concise, and more engaging while maintaining the key information:

"${contentToImprove}"

Provide:
1. Improved version (rewritten for clarity and engagement)
2. Summary version (condensed to key points)
3. Formal version (professional tone for official materials)
4. Casual version (conversational tone for participant-facing content)`,
        response_json_schema: {
          type: 'object',
          properties: {
            improved: { type: 'string' },
            summary: { type: 'string' },
            formal: { type: 'string' },
            casual: { type: 'string' }
          }
        }
      });

      setGeneratedContent(response);
      toast.success('Content improved!');
    } catch (error) {
      toast.error('Failed to improve content');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a lesson topic');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert in nonprofit funding education assessment. Create quiz questions for: "${prompt}".

Generate:
1. 5 multiple-choice questions (with 4 options each, indicate correct answer)
2. 3 short-answer questions
3. 2 scenario-based questions (real-world application)

Make questions practical and test understanding, not memorization.`,
        response_json_schema: {
          type: 'object',
          properties: {
            multiple_choice: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  correct_answer: { type: 'number' },
                  explanation: { type: 'string' }
                }
              }
            },
            short_answer: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  sample_answer: { type: 'string' }
                }
              }
            },
            scenarios: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  scenario: { type: 'string' },
                  question: { type: 'string' },
                  sample_answer: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setGeneratedContent(response);
      toast.success('Quiz generated!');
    } catch (error) {
      toast.error('Failed to generate quiz');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleApply = () => {
    if (generatedContent) {
      onApplyContent(generatedContent, activeTab);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Content Assistant
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="outline" className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Outline
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-1">
              <Link className="w-4 h-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="improve" className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Improve
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="outline" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">What topic or objective?</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Grant Writing for Beginners, Budget Development for Nonprofits, Understanding RFPs"
                rows={3}
              />
            </div>
            <Button onClick={generateOutline} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Course Outline
            </Button>

            {generatedContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{generatedContent.title}</CardTitle>
                  <p className="text-sm text-slate-600 mt-2">{generatedContent.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Learning Objectives:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {generatedContent.learning_objectives?.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Sections ({generatedContent.sections?.length}):</h4>
                    <div className="space-y-3">
                      {generatedContent.sections?.map((section, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium">{section.title}</h5>
                            <span className="text-xs text-slate-600">{section.duration_minutes} min</span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{section.description}</p>
                          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                            {section.topics?.map((topic, tidx) => (
                              <li key={tidx}>{topic}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">What lesson topic?</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Financial Management for Nonprofits, Understanding 501(c)(3) Status"
                rows={3}
              />
            </div>
            <Button onClick={generateResources} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Find Resources
            </Button>

            {generatedContent && (
              <div className="space-y-4">
                {generatedContent.videos?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Video Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {generatedContent.videos.map((video, idx) => (
                        <div key={idx} className="p-2 border rounded hover:bg-slate-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <a href={video.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline text-sm">
                                {video.title}
                              </a>
                              <p className="text-xs text-slate-600 mt-1">{video.description}</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(video.url)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {generatedContent.handouts?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Handout Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {generatedContent.handouts.map((handout, idx) => (
                        <div key={idx} className="p-2 border rounded">
                          <div className="font-medium text-sm">{handout.title}</div>
                          <div className="text-xs text-slate-500">{handout.type}</div>
                          <p className="text-xs text-slate-600 mt-1">{handout.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {generatedContent.external_links?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        External Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {generatedContent.external_links.map((link, idx) => (
                        <div key={idx} className="p-2 border rounded hover:bg-slate-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline text-sm">
                                {link.title}
                              </a>
                              <p className="text-xs text-slate-600 mt-1">{link.description}</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(link.url)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="improve" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Content to improve</label>
              <Textarea
                value={contentToImprove}
                onChange={(e) => setContentToImprove(e.target.value)}
                placeholder="Paste the content you want to rephrase or summarize..."
                rows={6}
              />
            </div>
            <Button onClick={improveContent} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Improve Content
            </Button>

            {generatedContent && (
              <div className="space-y-3">
                {['improved', 'summary', 'formal', 'casual'].map((key) => (
                  <Card key={key}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm capitalize">{key} Version</CardTitle>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedContent[key])}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{generatedContent[key]}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">What topic for the quiz?</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Grant Writing Best Practices, Budget Development Fundamentals"
                rows={3}
              />
            </div>
            <Button onClick={generateQuiz} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Quiz Questions
            </Button>

            {generatedContent && (
              <div className="space-y-4">
                {generatedContent.multiple_choice?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Multiple Choice Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {generatedContent.multiple_choice.map((q, idx) => (
                        <div key={idx} className="p-3 border rounded">
                          <div className="font-medium text-sm mb-2">{idx + 1}. {q.question}</div>
                          <div className="space-y-1 ml-4 mb-2">
                            {q.options?.map((opt, oidx) => (
                              <div key={oidx} className={`text-sm ${oidx === q.correct_answer ? 'text-green-700 font-medium' : 'text-slate-600'}`}>
                                {String.fromCharCode(65 + oidx)}. {opt} {oidx === q.correct_answer && '✓'}
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-slate-500 italic">Explanation: {q.explanation}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {generatedContent.short_answer?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Short Answer Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {generatedContent.short_answer.map((q, idx) => (
                        <div key={idx} className="p-3 border rounded">
                          <div className="font-medium text-sm mb-2">{q.question}</div>
                          <div className="text-xs text-slate-600">
                            <strong>Sample answer:</strong> {q.sample_answer}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {generatedContent.scenarios?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Scenario-Based Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {generatedContent.scenarios.map((s, idx) => (
                        <div key={idx} className="p-3 border rounded">
                          <div className="text-sm mb-2 bg-slate-50 p-2 rounded italic">{s.scenario}</div>
                          <div className="font-medium text-sm mb-2">{s.question}</div>
                          <div className="text-xs text-slate-600">
                            <strong>Sample answer:</strong> {s.sample_answer}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {generatedContent && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleApply} className="bg-purple-600 hover:bg-purple-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Apply to Course
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}