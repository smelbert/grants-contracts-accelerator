import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader2, RefreshCw, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function AITrainingContentAssistant({ 
  onContentGenerated, 
  existingContent = null,
  moduleNumber = null 
}) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  // Generate state
  const [keywords, setKeywords] = useState('');
  const [objectives, setObjectives] = useState('');
  const [level, setLevel] = useState('all');

  // Refine state
  const [contentToRefine, setContentToRefine] = useState(existingContent?.content || '');
  const [refinementGoal, setRefinementGoal] = useState('clarity');

  // Exercise state
  const [learningObjectives, setLearningObjectives] = useState('');

  const handleGenerateContent = async () => {
    if (!keywords && !objectives) {
      toast.error('Please provide keywords or objectives');
      return;
    }

    setLoading(true);
    try {
      const prompt = `You are an expert training content designer for grant writing and consulting professionals.

Generate comprehensive training module content with the following specifications:

${moduleNumber ? `Module Number: ${moduleNumber}` : ''}
Level: ${level === 'all' ? 'All levels (Foundation, Intermediate, Senior)' : level}
Keywords: ${keywords}
Learning Objectives: ${objectives}

Please generate:
1. A compelling module title
2. A clear purpose statement
3. Institutional rationale for why this module matters
4. Detailed content covering the topic
5. 3-5 key competencies this module develops
6. Level-specific expectations (Level 1, 2, and 3)
7. 3-5 required outputs or deliverables

Format the response as a structured training module suitable for professional consultants.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            subtitle: { type: 'string' },
            purpose: { type: 'string' },
            rationale: { type: 'string' },
            content: { type: 'string' },
            competencies: { type: 'array', items: { type: 'string' } },
            level_expectations: {
              type: 'object',
              properties: {
                level1: { type: 'string' },
                level2: { type: 'string' },
                level3: { type: 'string' }
              }
            },
            required_outputs: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      onContentGenerated(response);
      toast.success('Content generated successfully');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleRefineContent = async () => {
    if (!contentToRefine) {
      toast.error('Please provide content to refine');
      return;
    }

    setLoading(true);
    try {
      const refinementPrompts = {
        clarity: 'Improve clarity and readability while maintaining professional tone',
        consistency: 'Ensure consistent terminology and formatting across levels',
        tone: 'Adjust tone to be more professional and engaging',
        conciseness: 'Make the content more concise without losing key information'
      };

      const prompt = `You are an expert content editor for professional training materials.

Original Content:
${contentToRefine}

Task: ${refinementPrompts[refinementGoal]}

Please refine the content and return the improved version. Maintain the original structure but enhance quality.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            refined_content: { type: 'string' },
            improvements_made: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      onContentGenerated({ content: response.refined_content });
      toast.success(`Content refined for ${refinementGoal}`);
    } catch (error) {
      console.error('AI refinement error:', error);
      toast.error('Failed to refine content');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestExercises = async () => {
    if (!learningObjectives) {
      toast.error('Please provide learning objectives');
      return;
    }

    setLoading(true);
    try {
      const prompt = `You are an instructional designer specializing in grant writing and consulting training.

Learning Objectives:
${learningObjectives}

Generate 3-5 practical exercises or assessments that help learners achieve these objectives. Each exercise should include:
- A clear title
- Detailed description of the activity
- Expected outcomes
- Difficulty level (beginner/intermediate/advanced)

Focus on real-world application and skill development.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            exercises: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  outcomes: { type: 'string' },
                  difficulty: { type: 'string' }
                }
              }
            }
          }
        }
      });

      onContentGenerated({ exercises: response.exercises });
      toast.success('Exercise suggestions generated');
    } catch (error) {
      console.error('AI exercise generation error:', error);
      toast.error('Failed to generate exercises');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Sparkles className="w-5 h-5" />
          AI Content Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="refine">Refine</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 mt-4">
            <div>
              <Label>Keywords (comma-separated)</Label>
              <Input
                placeholder="e.g., grant writing, budget development, compliance"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
            <div>
              <Label>Learning Objectives</Label>
              <Textarea
                placeholder="What should learners be able to do after completing this module?"
                rows={3}
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
              />
            </div>
            <div>
              <Label>Target Level</Label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="level-1">Level 1 - Foundation</option>
                <option value="level-2">Level 2 - Intermediate</option>
                <option value="level-3">Level 3 - Senior</option>
              </select>
            </div>
            <Button
              onClick={handleGenerateContent}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Module Content
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="refine" className="space-y-4 mt-4">
            <div>
              <Label>Content to Refine</Label>
              <Textarea
                placeholder="Paste content to refine..."
                rows={6}
                value={contentToRefine}
                onChange={(e) => setContentToRefine(e.target.value)}
              />
            </div>
            <div>
              <Label>Refinement Goal</Label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={refinementGoal}
                onChange={(e) => setRefinementGoal(e.target.value)}
              >
                <option value="clarity">Improve Clarity</option>
                <option value="consistency">Ensure Consistency</option>
                <option value="tone">Adjust Tone</option>
                <option value="conciseness">Make Concise</option>
              </select>
            </div>
            <Button
              onClick={handleRefineContent}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refine Content
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-4 mt-4">
            <div>
              <Label>Module Learning Objectives</Label>
              <Textarea
                placeholder="Describe what learners should achieve in this module..."
                rows={5}
                value={learningObjectives}
                onChange={(e) => setLearningObjectives(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSuggestExercises}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Suggest Exercises
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}