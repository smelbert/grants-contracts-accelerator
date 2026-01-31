import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Plus, Download, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AIContentCreator() {
  const [activeTab, setActiveTab] = useState('module');
  const queryClient = useQueryClient();

  // Module Generation
  const [moduleData, setModuleData] = useState({
    topic: '',
    targetAudience: '',
    fundingLane: 'general',
    duration: 60
  });
  const [generatedModule, setGeneratedModule] = useState(null);

  // Quiz Generation
  const [quizData, setQuizData] = useState({
    moduleContent: '',
    numQuestions: 5
  });
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  // Flashcard Generation
  const [flashcardData, setFlashcardData] = useState({
    moduleContent: '',
    numCards: 10
  });
  const [generatedFlashcards, setGeneratedFlashcards] = useState(null);

  // Generate Module
  const generateModuleMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Create a comprehensive learning module for grant writing and nonprofit capacity building.

Topic: ${moduleData.topic}
Target Audience: ${moduleData.targetAudience}
Funding Lane: ${moduleData.fundingLane}
Duration: ${moduleData.duration} minutes

Generate a structured learning module with:
1. Module title and description
2. 3-5 curriculum sections with:
   - Section title
   - Description
   - Duration in minutes
   - Detailed content (instructional text)
3. 3-5 practical tips categorized as best_practice, common_mistake, or pro_tip
4. 2-3 suggested external resources with titles, descriptions, and URLs

Format the response as JSON.`;

      return await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            curriculum_sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  duration_minutes: { type: "number" },
                  content: { type: "string" }
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
            external_resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  url: { type: "string" }
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

  // Generate Quiz
  const generateQuizMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Based on this learning module content, create ${quizData.numQuestions} multiple-choice quiz questions to assess understanding.

Module Content:
${quizData.moduleContent}

For each question provide:
- Question text
- 4 answer options
- Correct answer index (0-3)
- Brief explanation

Format as JSON array.`;

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
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_index: { type: "number" },
                  explanation: { type: "string" }
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

  // Generate Flashcards
  const generateFlashcardsMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Create ${flashcardData.numCards} flashcard pairs for studying this content:

${flashcardData.moduleContent}

Each flashcard should have:
- A clear question or term
- A concise, informative answer or definition
- Focus on key concepts, definitions, and best practices

Format as JSON array.`;

      return await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            cards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedFlashcards(data);
      toast.success('Flashcards generated!');
    }
  });

  // Save Module
  const saveModuleMutation = useMutation({
    mutationFn: async () => {
      const moduleToSave = {
        title: generatedModule.title,
        description: generatedModule.description,
        content_type: 'course',
        funding_lane: moduleData.fundingLane,
        duration_minutes: moduleData.duration,
        curriculum_sections: generatedModule.curriculum_sections,
        tips: generatedModule.tips,
        is_premium: false
      };
      return await base44.entities.LearningContent.create(moduleToSave);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning'] });
      toast.success('Module saved to Learning Hub!');
      setGeneratedModule(null);
      setModuleData({ topic: '', targetAudience: '', fundingLane: 'general', duration: 60 });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Content Creator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="module">Generate Module</TabsTrigger>
            <TabsTrigger value="quiz">Generate Quiz</TabsTrigger>
            <TabsTrigger value="flashcards">Generate Flashcards</TabsTrigger>
          </TabsList>

          {/* Module Tab */}
          <TabsContent value="module" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Topic</label>
                <Input
                  placeholder="e.g., Writing Compelling Needs Statements"
                  value={moduleData.topic}
                  onChange={(e) => setModuleData({...moduleData, topic: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target Audience</label>
                <Input
                  placeholder="e.g., Early-stage nonprofits, grant beginners"
                  value={moduleData.targetAudience}
                  onChange={(e) => setModuleData({...moduleData, targetAudience: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Funding Lane</label>
                  <Select value={moduleData.fundingLane} onValueChange={(v) => setModuleData({...moduleData, fundingLane: v})}>
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
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={moduleData.duration}
                    onChange={(e) => setModuleData({...moduleData, duration: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <Button
                onClick={() => generateModuleMutation.mutate()}
                disabled={!moduleData.topic || generateModuleMutation.isPending}
                className="w-full"
              >
                {generateModuleMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate Module</>
                )}
              </Button>
            </div>

            {generatedModule && (
              <div className="border rounded-lg p-4 space-y-3 bg-purple-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{generatedModule.title}</h3>
                    <p className="text-sm text-slate-600">{generatedModule.description}</p>
                  </div>
                  <Button size="sm" onClick={() => saveModuleMutation.mutate()}>
                    <Download className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Sections: {generatedModule.curriculum_sections?.length || 0}</p>
                  <p className="font-medium">Tips: {generatedModule.tips?.length || 0}</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Module Content</label>
                <Textarea
                  placeholder="Paste module content here..."
                  value={quizData.moduleContent}
                  onChange={(e) => setQuizData({...quizData, moduleContent: e.target.value})}
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Number of Questions</label>
                <Input
                  type="number"
                  value={quizData.numQuestions}
                  onChange={(e) => setQuizData({...quizData, numQuestions: parseInt(e.target.value)})}
                  min="3"
                  max="20"
                />
              </div>
              <Button
                onClick={() => generateQuizMutation.mutate()}
                disabled={!quizData.moduleContent || generateQuizMutation.isPending}
                className="w-full"
              >
                {generateQuizMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate Quiz</>
                )}
              </Button>
            </div>

            {generatedQuiz && (
              <div className="border rounded-lg p-4 space-y-2 bg-blue-50 max-h-96 overflow-y-auto">
                <p className="font-semibold">{generatedQuiz.questions?.length} Questions Generated</p>
                {generatedQuiz.questions?.map((q, idx) => (
                  <div key={idx} className="text-sm bg-white p-2 rounded">
                    <p className="font-medium">{idx + 1}. {q.question}</p>
                    <p className="text-xs text-green-600 mt-1">✓ {q.options?.[q.correct_index]}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Module Content</label>
                <Textarea
                  placeholder="Paste module content here..."
                  value={flashcardData.moduleContent}
                  onChange={(e) => setFlashcardData({...flashcardData, moduleContent: e.target.value})}
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Number of Cards</label>
                <Input
                  type="number"
                  value={flashcardData.numCards}
                  onChange={(e) => setFlashcardData({...flashcardData, numCards: parseInt(e.target.value)})}
                  min="5"
                  max="30"
                />
              </div>
              <Button
                onClick={() => generateFlashcardsMutation.mutate()}
                disabled={!flashcardData.moduleContent || generateFlashcardsMutation.isPending}
                className="w-full"
              >
                {generateFlashcardsMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate Flashcards</>
                )}
              </Button>
            </div>

            {generatedFlashcards && (
              <div className="border rounded-lg p-4 space-y-2 bg-amber-50 max-h-96 overflow-y-auto">
                <p className="font-semibold">{generatedFlashcards.cards?.length} Flashcards Generated</p>
                {generatedFlashcards.cards?.map((card, idx) => (
                  <div key={idx} className="text-sm bg-white p-2 rounded">
                    <p className="font-medium">Q: {card.question}</p>
                    <p className="text-slate-600 text-xs mt-1">A: {card.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}