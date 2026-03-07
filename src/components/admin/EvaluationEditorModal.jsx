import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Edit } from 'lucide-react';

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
    question: 'How effective was the facilitator?',
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
  post_support: {
    label: 'Post-Incubator Support',
    question: 'After completing the incubator, what support would help you most?',
    type: 'multiselect',
    options: [
      'Accountability sessions',
      'Working sessions',
      'Expert workshops',
      'Funding support',
      'Networking',
      'Emotional support/community',
      'Mentorship'
    ],
    required: true
  },
  participation_frequency: {
    label: 'Participation Frequency',
    question: 'How often would you participate in ongoing support sessions?',
    type: 'multiselect',
    options: [
      'Monthly',
      'Quarterly',
      'Only when I need it'
    ],
    required: true
  },
  implementation_challenges: {
    label: 'Implementation Challenges',
    question: 'What are your biggest challenges implementing what you learned?',
    type: 'multiselect',
    options: [
      'Time',
      'Systems',
      'Funding',
      'Marketing',
      'Strategy',
      'Confidence',
      'Accountability'
    ],
    required: true
  },
  ongoing_topics: {
    label: 'Ongoing Session Topics',
    question: 'What topics would you want covered in ongoing sessions?',
    type: 'multiselect_custom',
    options: [
      'Grant writing and compliance',
      'Financial management and systems',
      'Strategic planning',
      'Marketing and fundraising',
      'Team building and leadership',
      'Operations and scaling',
      'Social impact measurement',
      'Legal and governance'
    ],
    required: true
  },
  community_interest: {
    label: 'Community Interest',
    question: 'Would you be interested in joining an ongoing entrepreneurial community after the incubator ends?',
    type: 'yesno',
    required: true
  },
  community_entailment: {
    label: 'Community Details',
    question: 'What should an ongoing entrepreneurial community entail?',
    type: 'multiselect',
    options: [
      'Monthly virtual meetups',
      'Peer mentoring partnerships',
      'Resource library access',
      'Expert speaker series',
      'Accountability partnerships',
      'Funding opportunities board',
      'Collaborative projects',
      'Social events and networking'
    ],
    required: false
  }
};

export default function EvaluationEditorModal() {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState(DEFAULT_EVALUATION_QUESTIONS);

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

  const handleSave = () => {
    localStorage.setItem('eis_evaluation_questions', JSON.stringify(questions));
    toast.success('Evaluation questions saved successfully');
    setOpen(false);
  };

  const handleReset = () => {
    if (window.confirm('Reset to default questions?')) {
      setQuestions(DEFAULT_EVALUATION_QUESTIONS);
      localStorage.removeItem('eis_evaluation_questions');
      toast.success('Reset to default questions');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          <Edit className="w-4 h-4 mr-2" />
          Edit Evaluation Form
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evaluation Form Editor</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(questions).map(([key, question]) => (
            <div key={key} className="border rounded-lg p-4 bg-slate-50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-slate-900">{question.label}</p>
                  <div className="flex gap-2 mt-1">
                    {question.required && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Required</span>
                    )}
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{question.type}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Label</Label>
                  <Input
                    value={question.label}
                    onChange={(e) => handleUpdateQuestion(key, 'label', e.target.value)}
                    size="sm"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm">Question</Label>
                  <Textarea
                    value={question.question}
                    onChange={(e) => handleUpdateQuestion(key, 'question', e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                {question.type === 'multiselect' && question.options && (
                  <div>
                    <Label className="text-sm">Options</Label>
                    <div className="space-y-2 mt-2">
                      {question.options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => handleUpdateOption(key, index, e.target.value)}
                            size="sm"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
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
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Option
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset to Default
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}