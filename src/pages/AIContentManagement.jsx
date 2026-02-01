import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Save, Plus, Tag, ExternalLink, Brain, Wand2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ContentWorkflowAutomation from '@/components/admin/ContentWorkflowAutomation';

export default function AIContentManagementPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('generate');

  // Generate Module State
  const [moduleInput, setModuleInput] = useState({
    topic: '',
    objectives: '',
    targetAudience: '',
    fundingLane: 'general',
    skillLevel: 'beginner',
    duration: 60,
    courseType: 'self_paced',
    scheduledStartDate: '',
    dripSchedule: []
  });
  const [generatedModule, setGeneratedModule] = useState(null);

  // Quiz Generation State
  const [quizInput, setQuizInput] = useState({
    contentId: '',
    numQuestions: 10,
    questionTypes: ['multiple_choice', 'true_false']
  });
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  // Resource Enrichment State
  const [enrichInput, setEnrichInput] = useState({
    contentId: '',
    currentContent: ''
  });
  const [suggestedResources, setSuggestedResources] = useState(null);

  // Auto-Categorization State
  const [categorizationInput, setCategorizationInput] = useState({
    contentId: '',
    title: '',
    description: ''
  });
  const [suggestedTags, setSuggestedTags] = useState(null);

  // Content Refresh State
  const [refreshAnalysis, setRefreshAnalysis] = useState(null);
  const [selectedRefreshContent, setSelectedRefreshContent] = useState(null);
  const [proposedUpdates, setProposedUpdates] = useState(null);

  const { data: allContent = [] } = useQuery({
    queryKey: ['all-learning-content'],
    queryFn: () => base44.entities.LearningContent.list(),
  });

  // Generate Full Module
  const generateModuleMutation = useMutation({
    mutationFn: async () => {
      const prompt = `You are an expert instructional designer for nonprofit capacity building and grant writing education.

Create a comprehensive learning module with the following specifications:

Topic: ${moduleInput.topic}
Learning Objectives: ${moduleInput.objectives}
Target Audience: ${moduleInput.targetAudience}
Funding Lane: ${moduleInput.fundingLane}
Skill Level: ${moduleInput.skillLevel}
Duration: ${moduleInput.duration} minutes

Generate a complete learning module with:

1. MODULE METADATA:
   - Engaging title
   - Clear, compelling description
   - List of 3-5 specific learning objectives

2. CURRICULUM SECTIONS (4-6 sections):
   Each section should include:
   - Section title
   - Brief description
   - Duration in minutes
   - Detailed instructional content (500-800 words per section)
   - Key takeaways

3. PRACTICAL TIPS (5-7 tips):
   - Mix of best_practice, common_mistake, pro_tip, and warning categories
   - Actionable, specific advice
   - Real-world examples

4. ASSESSMENT ITEMS:
   - 3 discussion questions
   - 3 reflection prompts

5. HANDOUTS:
   - 2-3 downloadable resource suggestions (title and description)

Format as JSON with clear structure.`;

      return await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            learning_objectives: {
              type: "array",
              items: { type: "string" }
            },
            curriculum_sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  duration_minutes: { type: "number" },
                  content: { type: "string" },
                  key_takeaways: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            tips: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  category: { type: "string" }
                }
              }
            },
            discussion_questions: {
              type: "array",
              items: { type: "string" }
            },
            reflection_prompts: {
              type: "array",
              items: { type: "string" }
            },
            handouts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedModule(data);
      toast.success('Module generated successfully!');
    }
  });

  // Generate Diverse Quiz Questions
  const generateQuizMutation = useMutation({
    mutationFn: async () => {
      const selectedContent = allContent.find(c => c.id === quizInput.contentId);
      if (!selectedContent) throw new Error('Content not found');

      const contentText = selectedContent.curriculum_sections
        ?.map(s => s.content)
        .join('\n\n') || selectedContent.description;

      const prompt = `Based on this learning module, create ${quizInput.numQuestions} diverse quiz questions.

Module: ${selectedContent.title}
Content:
${contentText}

Generate a mix of question types: ${quizInput.questionTypes.join(', ')}

For each question provide:
- question_type: "multiple_choice", "true_false", or "fill_in_blank"
- question_text: Clear, specific question
- For multiple_choice: 4 options array and correct_index (0-3)
- For true_false: correct_answer (true/false)
- For fill_in_blank: correct_answer (the missing word/phrase)
- explanation: Why this answer is correct
- difficulty: "easy", "medium", or "hard"

Ensure questions test comprehension, application, and analysis - not just recall.`;

      return await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question_type: { type: "string" },
                  question_text: { type: "string" },
                  options: {
                    type: "array",
                    items: { type: "string" }
                  },
                  correct_index: { type: "number" },
                  correct_answer: { type: "string" },
                  explanation: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedQuiz(data);
      toast.success('Quiz questions generated!');
    }
  });

  // Enrich with External Resources
  const enrichResourcesMutation = useMutation({
    mutationFn: async () => {
      const selectedContent = allContent.find(c => c.id === enrichInput.contentId);
      if (!selectedContent) throw new Error('Content not found');

      const prompt = `Analyze this learning module and suggest relevant external resources to enrich the learning experience.

Module: ${selectedContent.title}
Description: ${selectedContent.description}
Funding Lane: ${selectedContent.funding_lane}

Suggest 5-8 high-quality resources including:
- Official guides and toolkits
- Reputable nonprofit organizations
- Government resources
- Academic articles or research
- Video tutorials or webinars
- Templates and worksheets

For each resource provide:
- title: Resource name
- type: "article", "guide", "video", "template", "tool", or "organization"
- description: Why this resource is valuable (1-2 sentences)
- url: Direct link (use real, commonly available resources)
- relevance: How it relates to the module content

Also suggest 2-3 related modules that could complement this content.`;

      return await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            external_resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  url: { type: "string" },
                  relevance: { type: "string" }
                }
              }
            },
            related_topics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  rationale: { type: "string" }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setSuggestedResources(data);
      toast.success('Resource suggestions generated!');
    }
  });

  // Auto-Categorize Content
  const categorizeMutation = useMutation({
    mutationFn: async () => {
      const selectedContent = allContent.find(c => c.id === categorizationInput.contentId);
      
      const title = selectedContent?.title || categorizationInput.title;
      const description = selectedContent?.description || categorizationInput.description;

      const prompt = `Analyze this learning content and suggest optimal categorization and tags for discoverability.

Title: ${title}
Description: ${description}

Provide recommendations for:

1. FUNDING LANE (grants, contracts, donors, public_funds, or general)
2. SKILL LEVEL (beginner, intermediate, or advanced)
3. TARGET AUDIENCE (array of: nonprofit, for_profit, solopreneur, community_based)
4. ORGANIZATIONAL STAGES (array of: idea, early, operating, scaling)
5. CONTENT TAGS (8-12 relevant tags for searchability)
6. RELATED CATEGORIES (areas this content covers)
7. RECOMMENDED PREREQUISITES (if any)

Base recommendations on content analysis and best practices for nonprofit capacity building.`;

      return await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            funding_lane: { type: "string" },
            skill_level: { type: "string" },
            target_audience: {
              type: "array",
              items: { type: "string" }
            },
            target_stages: {
              type: "array",
              items: { type: "string" }
            },
            content_tags: {
              type: "array",
              items: { type: "string" }
            },
            categories: {
              type: "array",
              items: { type: "string" }
            },
            prerequisites: {
              type: "array",
              items: { type: "string" }
            },
            rationale: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setSuggestedTags(data);
      toast.success('Categorization suggestions generated!');
    }
  });

  // Analyze Content for Refresh Needs
  const analyzeRefreshMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const analysisPrompt = `Analyze these learning modules and identify which ones need content refreshes based on their age and topic relevance.

Current Date: ${now.toISOString().split('T')[0]}

Modules:
${allContent.map(c => `
- ID: ${c.id}
- Title: ${c.title}
- Created: ${c.created_date}
- Updated: ${c.updated_date || c.created_date}
- Topic: ${c.funding_lane}
`).join('\n')}

For each module that needs updating, provide:
1. Why it needs refresh (age, outdated practices, new regulations, etc.)
2. Priority level (high/medium/low)
3. Specific areas to update

Focus on:
- Content older than 12 months
- Topics related to regulations, technology, or best practices that frequently change
- Grant writing guidelines that may have evolved`;

      return await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            modules_needing_refresh: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  content_id: { type: "string" },
                  priority: { type: "string" },
                  reason: { type: "string" },
                  areas_to_update: {
                    type: "array",
                    items: { type: "string" }
                  },
                  age_in_months: { type: "number" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setRefreshAnalysis(data);
      toast.success('Content refresh analysis complete!');
    }
  });

  // Generate Proposed Updates
  const generateUpdatesMutation = useMutation({
    mutationFn: async () => {
      const content = allContent.find(c => c.id === selectedRefreshContent);
      if (!content) throw new Error('Content not found');

      const contentText = content.curriculum_sections
        ?.map(s => `${s.title}: ${s.content}`)
        .join('\n\n') || content.description;

      const prompt = `Review this learning module and propose comprehensive updates to refresh the content with current best practices, recent developments, and improved clarity.

Module: ${content.title}
Last Updated: ${content.updated_date || content.created_date}
Current Date: 2026-01-31

Current Content:
${contentText}

Tips:
${content.tips?.map(t => `${t.title}: ${t.content}`).join('\n')}

Provide:
1. UPDATED CURRICULUM SECTIONS - refresh all sections with:
   - Current best practices and guidelines
   - Recent developments in the field
   - Updated examples and case studies
   - Improved clarity and structure
   
2. NEW/UPDATED TIPS - add or revise tips based on:
   - Recent trends
   - Common mistakes identified
   - Pro tips from current practices

3. CHANGE SUMMARY - brief description of what was updated and why

4. ADDITIONAL RESOURCES - suggest 3-5 current external resources

Ensure all information is accurate as of 2026.`;

      return await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            updated_curriculum_sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  duration_minutes: { type: "number" },
                  content: { type: "string" },
                  key_updates: { 
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            updated_tips: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  category: { type: "string" },
                  is_new: { type: "boolean" }
                }
              }
            },
            change_summary: { type: "string" },
            additional_resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  url: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            update_date: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setProposedUpdates(data);
      toast.success('Proposed updates generated!');
    }
  });

  // Apply Updates
  const applyUpdatesMutation = useMutation({
    mutationFn: async () => {
      const content = allContent.find(c => c.id === selectedRefreshContent);
      return await base44.entities.LearningContent.update(content.id, {
        curriculum_sections: proposedUpdates.updated_curriculum_sections,
        tips: proposedUpdates.updated_tips,
        updated_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-learning-content'] });
      toast.success('Content updated successfully!');
      setProposedUpdates(null);
      setSelectedRefreshContent(null);
    }
  });

  // Save Generated Module
  const saveModuleMutation = useMutation({
    mutationFn: async () => {
      const moduleData = {
        title: generatedModule.title,
        description: generatedModule.description,
        content_type: 'course',
        course_type: moduleInput.courseType,
        funding_lane: moduleInput.fundingLane,
        duration_minutes: moduleInput.duration,
        curriculum_sections: generatedModule.curriculum_sections,
        tips: generatedModule.tips,
        handouts: generatedModule.handouts,
        target_stages: [moduleInput.skillLevel],
        is_premium: false
      };

      // Add scheduled start date if course type is scheduled
      if (moduleInput.courseType === 'scheduled' && moduleInput.scheduledStartDate) {
        moduleData.scheduled_start_date = new Date(moduleInput.scheduledStartDate).toISOString();
      }

      // Generate drip schedule for structured/scheduled courses
      if (moduleInput.courseType !== 'self_paced' && generatedModule.curriculum_sections) {
        moduleData.drip_schedule = generatedModule.curriculum_sections.map((_, index) => ({
          section_index: index,
          unlock_after_days: index * 7 // Unlock each section after 7 days
        }));
      }

      return await base44.entities.LearningContent.create(moduleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-learning-content'] });
      toast.success('Module saved to Learning Hub!');
      setGeneratedModule(null);
      setModuleInput({
        topic: '',
        objectives: '',
        targetAudience: '',
        fundingLane: 'general',
        skillLevel: 'beginner',
        duration: 60,
        courseType: 'self_paced',
        scheduledStartDate: '',
        dripSchedule: []
      });
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Content Management</h1>
          <p className="text-slate-600">Leverage AI to create, enhance, and organize learning content</p>
        </div>

        {/* Workflow Automation */}
        <ContentWorkflowAutomation />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="generate">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Module
            </TabsTrigger>
            <TabsTrigger value="quiz">
              <Brain className="w-4 h-4 mr-2" />
              Create Quiz
            </TabsTrigger>
            <TabsTrigger value="enrich">
              <ExternalLink className="w-4 h-4 mr-2" />
              Enrich Resources
            </TabsTrigger>
            <TabsTrigger value="categorize">
              <Tag className="w-4 h-4 mr-2" />
              Auto-Categorize
            </TabsTrigger>
            <TabsTrigger value="refresh">
              <Wand2 className="w-4 h-4 mr-2" />
              Refresh Content
            </TabsTrigger>
          </TabsList>

          {/* Generate Module Tab */}
          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Module Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Topic *</label>
                    <Input
                      placeholder="e.g., Writing Compelling Grant Narratives"
                      value={moduleInput.topic}
                      onChange={(e) => setModuleInput({...moduleInput, topic: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Learning Objectives *</label>
                    <Textarea
                      placeholder="List the key skills or knowledge learners should gain..."
                      value={moduleInput.objectives}
                      onChange={(e) => setModuleInput({...moduleInput, objectives: e.target.value})}
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Target Audience</label>
                    <Input
                      placeholder="e.g., Early-stage nonprofit leaders"
                      value={moduleInput.targetAudience}
                      onChange={(e) => setModuleInput({...moduleInput, targetAudience: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Funding Lane</label>
                      <Select value={moduleInput.fundingLane} onValueChange={(v) => setModuleInput({...moduleInput, fundingLane: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="grants">Grants</SelectItem>
                          <SelectItem value="contracts">Contracts</SelectItem>
                          <SelectItem value="donors">Donors</SelectItem>
                          <SelectItem value="public_funds">Public Funds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Skill Level</label>
                      <Select value={moduleInput.skillLevel} onValueChange={(v) => setModuleInput({...moduleInput, skillLevel: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={moduleInput.duration}
                      onChange={(e) => setModuleInput({...moduleInput, duration: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <label className="text-sm font-medium mb-3 block">Course Type</label>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                        <input
                          type="radio"
                          name="courseType"
                          value="self_paced"
                          checked={moduleInput.courseType === 'self_paced'}
                          onChange={(e) => setModuleInput({...moduleInput, courseType: e.target.value})}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-medium text-sm">Self-paced</p>
                          <p className="text-xs text-slate-600">Course starts when a member enrolls. All content is available immediately.</p>
                        </div>
                      </label>
                      
                      <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                        <input
                          type="radio"
                          name="courseType"
                          value="structured"
                          checked={moduleInput.courseType === 'structured'}
                          onChange={(e) => setModuleInput({...moduleInput, courseType: e.target.value})}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-medium text-sm">Structured</p>
                          <p className="text-xs text-slate-600">Course starts when a member enrolls. Sections are dripped relative to their enrollment date.</p>
                        </div>
                      </label>
                      
                      <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                        <input
                          type="radio"
                          name="courseType"
                          value="scheduled"
                          checked={moduleInput.courseType === 'scheduled'}
                          onChange={(e) => setModuleInput({...moduleInput, courseType: e.target.value})}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-medium text-sm">Scheduled</p>
                          <p className="text-xs text-slate-600">Course starts on a specific date. Sections are dripped relative to that date.</p>
                        </div>
                      </label>
                    </div>

                    {moduleInput.courseType === 'scheduled' && (
                      <div className="mt-3">
                        <label className="text-sm font-medium">Start Date</label>
                        <Input
                          type="datetime-local"
                          value={moduleInput.scheduledStartDate}
                          onChange={(e) => setModuleInput({...moduleInput, scheduledStartDate: e.target.value})}
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => generateModuleMutation.mutate()}
                    disabled={!moduleInput.topic || !moduleInput.objectives || generateModuleMutation.isPending}
                    className="w-full"
                  >
                    {generateModuleMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                    ) : (
                      <><Wand2 className="w-4 h-4 mr-2" /> Generate Complete Module</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {generatedModule && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{generatedModule.title}</CardTitle>
                        <p className="text-sm text-slate-600 mt-2">{generatedModule.description}</p>
                      </div>
                      <Button size="sm" onClick={() => saveModuleMutation.mutate()}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Module
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">Learning Objectives:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {generatedModule.learning_objectives?.map((obj, idx) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-white p-2 rounded">
                        <p className="font-medium">{generatedModule.curriculum_sections?.length || 0}</p>
                        <p className="text-xs text-slate-600">Sections</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="font-medium">{generatedModule.tips?.length || 0}</p>
                        <p className="text-xs text-slate-600">Tips</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="font-medium">{generatedModule.handouts?.length || 0}</p>
                        <p className="text-xs text-slate-600">Handouts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Quiz Generation Tab */}
          <TabsContent value="quiz">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Module *</label>
                    <Select value={quizInput.contentId} onValueChange={(v) => setQuizInput({...quizInput, contentId: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a module..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allContent.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Number of Questions</label>
                    <Input
                      type="number"
                      value={quizInput.numQuestions}
                      onChange={(e) => setQuizInput({...quizInput, numQuestions: parseInt(e.target.value)})}
                      min="5"
                      max="30"
                    />
                  </div>
                  <Button
                    onClick={() => generateQuizMutation.mutate()}
                    disabled={!quizInput.contentId || generateQuizMutation.isPending}
                    className="w-full"
                  >
                    {generateQuizMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                    ) : (
                      <><Brain className="w-4 h-4 mr-2" /> Generate Diverse Quiz</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {generatedQuiz && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle>Generated Questions ({generatedQuiz.questions?.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[600px] overflow-y-auto space-y-3">
                    {generatedQuiz.questions?.map((q, idx) => (
                      <div key={idx} className="bg-white p-3 rounded">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {q.question_type.replace('_', ' ')}
                          </Badge>
                          <Badge className={
                            q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {q.difficulty}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm mb-2">{idx + 1}. {q.question_text}</p>
                        {q.options && (
                          <div className="text-xs space-y-1">
                            {q.options.map((opt, i) => (
                              <p key={i} className={i === q.correct_index ? 'text-green-600 font-medium' : ''}>
                                {i === q.correct_index ? '✓ ' : ''}{opt}
                              </p>
                            ))}
                          </div>
                        )}
                        {q.correct_answer && q.question_type !== 'multiple_choice' && (
                          <p className="text-xs text-green-600 font-medium">Answer: {q.correct_answer}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Enrich Resources Tab */}
          <TabsContent value="enrich">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Enrichment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Module *</label>
                    <Select value={enrichInput.contentId} onValueChange={(v) => setEnrichInput({...enrichInput, contentId: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a module..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allContent.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => enrichResourcesMutation.mutate()}
                    disabled={!enrichInput.contentId || enrichResourcesMutation.isPending}
                    className="w-full"
                  >
                    {enrichResourcesMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                    ) : (
                      <><ExternalLink className="w-4 h-4 mr-2" /> Suggest Resources</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {suggestedResources && (
                <Card className="border-emerald-200 bg-emerald-50">
                  <CardHeader>
                    <CardTitle>Suggested Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[600px] overflow-y-auto space-y-3">
                    {suggestedResources.external_resources?.map((resource, idx) => (
                      <div key={idx} className="bg-white p-3 rounded">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-sm">{resource.title}</p>
                          <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                        </div>
                        <p className="text-xs text-slate-600 mb-1">{resource.description}</p>
                        <p className="text-xs text-blue-600 truncate">{resource.url}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Auto-Categorize Tab */}
          <TabsContent value="categorize">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Auto-Categorization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Module *</label>
                    <Select value={categorizationInput.contentId} onValueChange={(v) => setCategorizationInput({...categorizationInput, contentId: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a module..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allContent.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => categorizeMutation.mutate()}
                    disabled={!categorizationInput.contentId || categorizeMutation.isPending}
                    className="w-full"
                  >
                    {categorizeMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Tag className="w-4 h-4 mr-2" /> Generate Tags & Categories</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {suggestedTags && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <CardTitle>Categorization Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Funding Lane:</p>
                      <Badge className="bg-blue-100 text-blue-800">{suggestedTags.funding_lane}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Skill Level:</p>
                      <Badge className="bg-purple-100 text-purple-800">{suggestedTags.skill_level}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Content Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestedTags.content_tags?.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Target Audience:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestedTags.target_audience?.map((aud, idx) => (
                          <Badge key={idx} className="bg-emerald-100 text-emerald-800 text-xs">{aud}</Badge>
                        ))}
                      </div>
                    </div>
                    {suggestedTags.rationale && (
                      <div className="bg-white p-3 rounded">
                        <p className="text-xs text-slate-600 italic">{suggestedTags.rationale}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Content Refresh Tab */}
          <TabsContent value="refresh">
            <div className="space-y-6">
              {!refreshAnalysis ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Analyze Content for Updates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">
                      AI will analyze all learning modules to identify which ones need content refreshes based on age, 
                      topic relevance, and current best practices.
                    </p>
                    <Button
                      onClick={() => analyzeRefreshMutation.mutate()}
                      disabled={analyzeRefreshMutation.isPending}
                      className="w-full"
                    >
                      {analyzeRefreshMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Wand2 className="w-4 h-4 mr-2" /> Analyze All Modules</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle>Content Refresh Analysis</CardTitle>
                        <Button size="sm" variant="ghost" onClick={() => setRefreshAnalysis(null)}>
                          Re-analyze
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 mb-4">{refreshAnalysis.summary}</p>
                      <p className="text-sm font-medium mb-3">
                        {refreshAnalysis.modules_needing_refresh?.length} modules need updating
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 gap-4">
                    {refreshAnalysis.modules_needing_refresh?.map((item) => {
                      const module = allContent.find(c => c.id === item.content_id);
                      return module ? (
                        <Card key={item.content_id} className="border-l-4 border-l-orange-400">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">{module.title}</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                  Age: {item.age_in_months} months • Priority: {item.priority}
                                </p>
                              </div>
                              <Badge className={
                                item.priority === 'high' ? 'bg-red-100 text-red-800' :
                                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }>
                                {item.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{item.reason}</p>
                            <div className="mb-3">
                              <p className="text-xs font-medium text-slate-700 mb-1">Areas to update:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.areas_to_update?.map((area, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRefreshContent(item.content_id);
                                generateUpdatesMutation.mutate();
                              }}
                              disabled={generateUpdatesMutation.isPending}
                            >
                              {generateUpdatesMutation.isPending && selectedRefreshContent === item.content_id ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                              ) : (
                                <><Sparkles className="w-4 h-4 mr-2" /> Generate Updates</>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {proposedUpdates && (
                <Card className="border-emerald-200 bg-emerald-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>Proposed Content Updates</CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setProposedUpdates(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => applyUpdatesMutation.mutate()}>
                          <Save className="w-4 h-4 mr-2" />
                          Apply Updates
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Change Summary:</p>
                      <p className="text-sm text-slate-700">{proposedUpdates.change_summary}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Updated Sections ({proposedUpdates.updated_curriculum_sections?.length})
                      </p>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {proposedUpdates.updated_curriculum_sections?.map((section, idx) => (
                          <div key={idx} className="bg-white p-3 rounded">
                            <p className="font-medium text-sm">{section.title}</p>
                            <p className="text-xs text-slate-600 mt-1">{section.description}</p>
                            {section.key_updates?.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-emerald-700">Key updates:</p>
                                <ul className="text-xs text-slate-600 list-disc list-inside">
                                  {section.key_updates.map((update, i) => (
                                    <li key={i}>{update}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}