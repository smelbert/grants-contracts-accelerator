import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Save } from 'lucide-react';

// Default evaluation structure
const DEFAULT_EVALUATION_QUESTIONS = {
  overall_rating: {
    label: 'Overall Training Rating',
    question: 'How would you rate this training session overall?',
    type: 'scale_1_to_10',
    required: true
  },
  content_quality: {
    label: 'Content Quality',
    question: 'How would you rate the quality and relevance of the content?',
    type: 'multiselect',
    options: [
      'Excellent - Highly relevant and valuable',
      'Good - Mostly relevant and useful',
      'Fair - Some useful information',
      'Poor - Not very relevant or useful'
    ],
    required: true
  },
  facilitation_effectiveness: {
    label: 'Facilitation Effectiveness',
    question: 'How effective was Dr. Shawnte Elbert\'s facilitation?',
    type: 'multiselect',
    options: [
      'Excellent - Very engaging, knowledgeable, and clear',
      'Good - Clear and helpful',
      'Fair - Adequate but could improve',
      'Poor - Unclear or confusing'
    ],
    required: true
  },
  materials_usefulness: {
    label: 'Materials Usefulness',
    question: 'How useful were the learning materials and resources?',
    type: 'multiselect',
    options: [
      'Very useful - Will use regularly',
      'Useful - Good reference materials',
      'Somewhat useful - Limited application',
      'Not useful'
    ],
    required: true
  },
  workbook_quality: {
    label: 'Workbook Quality',
    question: 'How helpful was the workbook?',
    type: 'multiselect',
    options: [
      'Excellent - Very comprehensive and helpful',
      'Good - Helpful guide',
      'Fair - Some useful sections',
      'Poor - Not very helpful'
    ],
    required: true
  },
  schedule_format: {
    label: 'Schedule Format',
    question: 'How well did the schedule format work for you?',
    type: 'multiselect',
    options: [
      'Perfect - Easy to attend all sessions',
      'Good - Worked well overall',
      'Challenging - Had to miss some sessions',
      'Difficult - Hard to attend regularly'
    ],
    required: true
  },
  consultation_experience: {
    label: 'Consultation Experience',
    question: 'How was your consultation experience?',
    type: 'multiselect',
    options: [
      'Excellent - Very valuable and personalized',
      'Good - Helpful guidance',
      'Fair - Some helpful insights',
      'Poor - Not very helpful',
      'Did not attend consultation'
    ],
    required: true
  },
  would_recommend: {
    label: 'Recommendation',
    question: 'Would you recommend this training to other entrepreneurs?',
    type: 'multiselect',
    options: [
      'Definitely - Highly recommend',
      'Probably - Would recommend',
      'Maybe - Depends on their situation',
      'No - Would not recommend'
    ],
    required: true
  },
  most_valuable: {
    label: 'Most Valuable',
    question: 'What was most valuable about this training?',
    type: 'text',
    required: false
  },
  suggestions: {
    label: 'Suggestions',
    question: 'What other training topics would you like to see?',
    type: 'text',
    required: false
  },
  facilitator_feedback: {
    label: 'Facilitator Feedback',
    question: 'Feedback for Dr. Shawnte Elbert (facilitator)',
    type: 'text',
    required: false
  },
  additional_comments: {
    label: 'Additional Comments',
    question: 'Additional comments',
    type: 'text',
    required: false
  }
};

export default function IncubateHerEvaluationEditor() {
  const queryClient = useQueryClient();
  const [questions, setQuestions] = useState(DEFAULT_EVALUATION_QUESTIONS);
  const [editingKey, setEditingKey] = useState(null);
  const [editingField, setEditingField] = useState('');

  const handleUpdateQuestion = (key, field, value) => {
    setQuestions(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleUpdateOption = (key, index, value) => {
    setQuestions(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        options: prev[key].options?.map((opt, i) => i === index ? value : opt) || []
      }
    }));
  };

  const handleAddOption = (key) => {
    setQuestions(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        options: [...(prev[key].options || []), '']
      }
    }));
  };

  const handleRemoveOption = (key, index) => {
    setQuestions(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        options: prev[key].options?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Save to localStorage for now (can be extended to save to database)
      localStorage.setItem('eis_evaluation_questions', JSON.stringify(questions));
      toast.success('Evaluation questions saved successfully');
    } catch (error) {
      toast.error('Failed to save questions');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset to default questions?')) {
      setQuestions(DEFAULT_EVALUATION_QUESTIONS);
      localStorage.removeItem('eis_evaluation_questions');
      toast.success('Reset to default questions');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Evaluation Form Editor</h1>
          <p className="text-slate-600">Edit the IncubateHer program evaluation questions</p>
        </div>

        <div className="space-y-6">
          {Object.entries(questions).map(([key, question]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{question.label}</span>
                  <div className="flex gap-2">
                    {question.required && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Required</span>
                    )}
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{question.type}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="block mb-2 font-semibold">Label</Label>
                  <Input
                    value={question.label}
                    onChange={(e) => handleUpdateQuestion(key, 'label', e.target.value)}
                    placeholder="Section label"
                  />
                </div>

                <div>
                  <Label className="block mb-2 font-semibold">Question</Label>
                  <Textarea
                    value={question.question}
                    onChange={(e) => handleUpdateQuestion(key, 'question', e.target.value)}
                    placeholder="Question text"
                    rows={2}
                  />
                </div>

                {question.type === 'multiselect' && question.options && (
                  <div>
                    <Label className="block mb-2 font-semibold">Options</Label>
                    <div className="space-y-2">
                      {question.options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => handleUpdateOption(key, index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOption(key, index)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddOption(key)}
                        className="w-full mt-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            onClick={handleSave}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
          >
            Reset to Default
          </Button>
        </div>
      </div>
    </div>
  );
}