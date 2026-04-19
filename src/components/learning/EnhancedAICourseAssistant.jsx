import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Sparkles, Lightbulb, BookOpen, Video, CheckSquare, 
  TrendingUp, Award, Loader2, Copy, Download, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function EnhancedAICourseAssistant({ open, onClose, onApplyContent, existingCourse }) {
  const [activeTab, setActiveTab] = useState('outline');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  // Outline Generation
  const [outlineData, setOutlineData] = useState({
    topic: existingCourse?.title || '',
    target_audience: '',
    learning_objectives: '',
    duration: '60',
    difficulty_level: 'intermediate'
  });

  // Content Generation
  const [contentData, setContentData] = useState({
    section_title: '',
    content_type: 'lesson',
    key_points: ''
  });

  const generateCourseOutline = async () => {
    setGenerating(true);
    try {
      const prompt = `You are an expert instructional designer and grant writing educator. Create a comprehensive course outline based on the following requirements.

**Course Topic:** ${outlineData.topic}
**Target Audience:** ${outlineData.target_audience}
**Learning Objectives:** ${outlineData.learning_objectives}
**Total Duration:** ${outlineData.duration} minutes
**Difficulty Level:** ${outlineData.difficulty_level}

**IMPORTANT:** Research and incorporate best practices from:
- National organizations (e.g., National Council of Nonprofits, Grants Professionals Association, Foundation Center)
- Current trends in grant writing and nonprofit capacity building
- Evidence-based teaching methodologies for adult learners

Generate a detailed course outline with:
1. Course title and compelling description
2. Overall learning outcomes
3. 5-8 curriculum sections, each with:
   - Section title
   - Learning objectives (3-5 specific, measurable objectives)
   - Key topics to cover
   - Suggested duration
   - Teaching methods (lecture, discussion, exercise, case study)
   - Assessment ideas

Format the response as JSON.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            learning_outcomes: {
              type: "array",
              items: { type: "string" }
            },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  learning_objectives: {
                    type: "array",
                    items: { type: "string" }
                  },
                  topics: {
                    type: "array",
                    items: { type: "string" }
                  },
                  duration_minutes: { type: "number" },
                  teaching_methods: {
                    type: "array",
                    items: { type: "string" }
                  },
                  assessment_ideas: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            best_practices_sources: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setGeneratedContent(result);
      toast.success('Course outline generated with best practices!');
    } catch (error) {
      toast.error('Failed to generate outline');
    } finally {
      setGenerating(false);
    }
  };

  const generateModuleContent = async () => {
    setGenerating(true);
    try {
      const prompt = `Create engaging ${contentData.content_type} content for a learning module.

**Section Title:** ${contentData.section_title}
**Content Type:** ${contentData.content_type}
**Key Points to Cover:** ${contentData.key_points}

Generate detailed, professional content that includes:
- Clear explanations with real-world examples
- Best practices from leading organizations
- Interactive elements for engagement
- Practical applications

Format appropriately for ${contentData.content_type}.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            content: { type: "string" },
            interactive_elements: {
              type: "array",
              items: { type: "string" }
            },
            discussion_prompts: {
              type: "array",
              items: { type: "string" }
            },
            additional_resources: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setGeneratedContent(result);
      toast.success('Module content generated!');
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const generateQuiz = async () => {
    setGenerating(true);
    try {
      const prompt = `Create an assessment quiz for: ${contentData.section_title}

Generate 5-10 questions that test:
- Understanding of key concepts
- Application of knowledge
- Critical thinking

Include:
- Multiple choice questions (with 4 options each)
- True/false questions
- Short answer prompts
- Correct answers and explanations`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  type: { type: "string" },
                  options: {
                    type: "array",
                    items: { type: "string" }
                  },
                  correct_answer: { type: "string" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGeneratedContent(result);
      toast.success('Quiz questions generated!');
    } catch (error) {
      toast.error('Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const generateVideoScript = async () => {
    setGenerating(true);
    try {
      const prompt = `Create a detailed video script for: ${contentData.section_title}

The script should:
- Be 5-7 minutes long when spoken
- Include visual cue suggestions
- Have clear sections: hook, main content, summary, call-to-action
- Be conversational yet professional
- Include examples and analogies
- Suggest on-screen text and graphics`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            script: { type: "string" },
            visual_cues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            estimated_duration: { type: "string" }
          }
        }
      });

      setGeneratedContent(result);
      toast.success('Video script generated!');
    } catch (error) {
      toast.error('Failed to generate script');
    } finally {
      setGenerating(false);
    }
  };

  const generateExercise = async () => {
    setGenerating(true);
    try {
      const prompt = `Create a hands-on exercise for: ${contentData.section_title}

Design an engaging activity that:
- Takes 15-30 minutes to complete
- Applies concepts learned
- Can be done individually or in groups
- Includes clear instructions
- Has a deliverable/output
- Provides learning value

Include facilitator notes.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            exercise_title: { type: "string" },
            objective: { type: "string" },
            duration: { type: "string" },
            materials_needed: {
              type: "array",
              items: { type: "string" }
            },
            instructions: {
              type: "array",
              items: { type: "string" }
            },
            deliverable: { type: "string" },
            facilitator_notes: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setGeneratedContent(result);
      toast.success('Exercise created!');
    } catch (error) {
      toast.error('Failed to generate exercise');
    } finally {
      setGenerating(false);
    }
  };

  const optimizeLearningFlow = async () => {
    setGenerating(true);
    try {
      const sectionsText = existingCourse?.curriculum_sections?.map(s => 
        `${s.title}: ${s.description}`
      ).join('\n') || 'No sections yet';

      const prompt = `Analyze this course structure and provide recommendations for optimal learning flow:

${sectionsText}

Provide:
1. Suggested reordering of sections (if needed)
2. Pacing recommendations
3. Suggested transitions between sections
4. Missing topics that should be added
5. Suggestions for scaffolding (building complexity)
6. Engagement strategies for each section

Base recommendations on adult learning principles and instructional design best practices.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            reordering_suggestions: {
              type: "array",
              items: { type: "string" }
            },
            pacing_recommendations: {
              type: "array",
              items: { type: "string" }
            },
            missing_topics: {
              type: "array",
              items: { type: "string" }
            },
            engagement_strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section: { type: "string" },
                  strategy: { type: "string" }
                }
              }
            },
            overall_assessment: { type: "string" }
          }
        }
      });

      setGeneratedContent(result);
      toast.success('Learning flow analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze flow');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    toast.success('Copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">AI Course Builder Assistant</DialogTitle>
              <p className="text-sm text-slate-600">Powered by best practices from national organizations</p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Course Outline
            </TabsTrigger>
            <TabsTrigger value="content">
              <Lightbulb className="w-4 h-4 mr-2" />
              Module Content
            </TabsTrigger>
            <TabsTrigger value="activities">
              <CheckSquare className="w-4 h-4 mr-2" />
              Activities & Quizzes
            </TabsTrigger>
            <TabsTrigger value="optimize">
              <TrendingUp className="w-4 h-4 mr-2" />
              Optimize Flow
            </TabsTrigger>
          </TabsList>

          {/* Course Outline Tab */}
          <TabsContent value="outline" className="space-y-4">
            {!generatedContent ? (
              <Card>
                <CardHeader>
                  <CardTitle>Generate Comprehensive Course Outline</CardTitle>
                  <CardDescription>
                    AI will research best practices from national organizations and create a detailed curriculum
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Course Topic *</Label>
                    <Input
                      value={outlineData.topic}
                      onChange={(e) => setOutlineData({ ...outlineData, topic: e.target.value })}
                      placeholder="e.g., Federal Grant Writing for Nonprofits"
                    />
                  </div>

                  <div>
                    <Label>Target Audience *</Label>
                    <Textarea
                      value={outlineData.target_audience}
                      onChange={(e) => setOutlineData({ ...outlineData, target_audience: e.target.value })}
                      placeholder="e.g., Nonprofit executive directors and development staff with basic grant writing knowledge"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Learning Objectives *</Label>
                    <Textarea
                      value={outlineData.learning_objectives}
                      onChange={(e) => setOutlineData({ ...outlineData, learning_objectives: e.target.value })}
                      placeholder="What should students be able to do after completing this course?"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={outlineData.duration}
                        onChange={(e) => setOutlineData({ ...outlineData, duration: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Difficulty Level</Label>
                      <Select 
                        value={outlineData.difficulty_level}
                        onValueChange={(val) => setOutlineData({ ...outlineData, difficulty_level: val })}
                      >
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

                  <Button 
                    onClick={generateCourseOutline}
                    disabled={generating || !outlineData.topic || !outlineData.target_audience}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Researching Best Practices & Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Course Outline
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{generatedContent.title}</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedContent)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy All
                      </Button>
                    </div>
                    <CardDescription>{generatedContent.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {generatedContent.learning_outcomes && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-600" />
                          Learning Outcomes
                        </h4>
                        <ul className="space-y-1">
                          {generatedContent.learning_outcomes.map((outcome, idx) => (
                            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-purple-600">•</span>
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h4 className="font-semibold">Course Sections ({generatedContent.sections?.length})</h4>
                      {generatedContent.sections?.map((section, idx) => (
                        <Card key={idx} className="border-l-4 border-l-purple-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge className="mb-2">Section {idx + 1}</Badge>
                                <CardTitle className="text-lg">{section.title}</CardTitle>
                                <CardDescription>{section.description}</CardDescription>
                              </div>
                              {section.duration_minutes && (
                                <Badge variant="outline">{section.duration_minutes} min</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            {section.learning_objectives && (
                              <div>
                                <p className="font-medium text-slate-700 mb-1">Learning Objectives:</p>
                                <ul className="space-y-1">
                                  {section.learning_objectives.map((obj, i) => (
                                    <li key={i} className="text-slate-600">• {obj}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {section.topics && (
                              <div>
                                <p className="font-medium text-slate-700 mb-1">Key Topics:</p>
                                <div className="flex flex-wrap gap-2">
                                  {section.topics.map((topic, i) => (
                                    <Badge key={i} variant="secondary">{topic}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {generatedContent.best_practices_sources && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-blue-900">Research Sources</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {generatedContent.best_practices_sources.map((source, idx) => (
                            <li key={idx}>• {source}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => {
                          onApplyContent(generatedContent, 'outline');
                          onClose();
                        }}
                        className="flex-1 bg-purple-600"
                      >
                        Apply to Course
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setGeneratedContent(null)}
                      >
                        Generate New
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Module Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Module Content</CardTitle>
                <CardDescription>Create detailed lesson content, video scripts, or presentations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Section Title *</Label>
                  <Input
                    value={contentData.section_title}
                    onChange={(e) => setContentData({ ...contentData, section_title: e.target.value })}
                    placeholder="e.g., Understanding Federal Grant Applications"
                  />
                </div>

                <div>
                  <Label>Content Type</Label>
                  <Select 
                    value={contentData.content_type}
                    onValueChange={(val) => setContentData({ ...contentData, content_type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lesson">Detailed Lesson Content</SelectItem>
                      <SelectItem value="video_script">Video Script</SelectItem>
                      <SelectItem value="presentation">Presentation Outline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Key Points to Cover</Label>
                  <Textarea
                    value={contentData.key_points}
                    onChange={(e) => setContentData({ ...contentData, key_points: e.target.value })}
                    placeholder="List main concepts and topics this section should address..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={generateModuleContent}
                    disabled={generating || !contentData.section_title}
                    className="bg-purple-600"
                  >
                    {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Generate Content
                  </Button>
                  <Button 
                    onClick={generateVideoScript}
                    disabled={generating || !contentData.section_title}
                    variant="outline"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video Script
                  </Button>
                </div>

                {generatedContent && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">Generated Content</h4>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedContent)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700">
                        {JSON.stringify(generatedContent, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities & Quizzes Tab */}
          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Interactive Activities</CardTitle>
                <CardDescription>Create quizzes, exercises, and hands-on activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Section/Topic *</Label>
                  <Input
                    value={contentData.section_title}
                    onChange={(e) => setContentData({ ...contentData, section_title: e.target.value })}
                    placeholder="What topic is this activity for?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={generateQuiz}
                    disabled={generating || !contentData.section_title}
                    className="bg-purple-600"
                  >
                    {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckSquare className="w-4 h-4 mr-2" />}
                    Generate Quiz
                  </Button>
                  <Button 
                    onClick={generateExercise}
                    disabled={generating || !contentData.section_title}
                    variant="outline"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Generate Exercise
                  </Button>
                </div>

                {generatedContent && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">Generated Activity</h4>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedContent)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {generatedContent.questions?.map((q, idx) => (
                        <Card key={idx}>
                          <CardContent className="pt-4">
                            <p className="font-medium mb-2">Q{idx + 1}: {q.question}</p>
                            {q.options && (
                              <div className="space-y-1 mb-2">
                                {q.options.map((opt, i) => (
                                  <p key={i} className="text-sm text-slate-600">
                                    {String.fromCharCode(65 + i)}. {opt}
                                  </p>
                                ))}
                              </div>
                            )}
                            <p className="text-sm text-green-600">✓ {q.correct_answer}</p>
                            <p className="text-xs text-slate-500 mt-2">{q.explanation}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Optimize Flow Tab */}
          <TabsContent value="optimize" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Optimize Learning Flow</CardTitle>
                <CardDescription>Get AI recommendations for improving course structure and engagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  AI will analyze your current course structure based on adult learning principles 
                  and instructional design best practices.
                </p>

                <Button 
                  onClick={optimizeLearningFlow}
                  disabled={generating}
                  className="w-full bg-purple-600"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Course Structure...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Analyze & Optimize
                    </>
                  )}
                </Button>

                {generatedContent && (
                  <div className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Overall Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700">{generatedContent.overall_assessment}</p>
                      </CardContent>
                    </Card>

                    {generatedContent.missing_topics?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Suggested Topics to Add</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {generatedContent.missing_topics.map((topic, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Plus className="w-4 h-4 text-green-600 mt-0.5" />
                                <span className="text-sm">{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}