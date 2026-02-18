import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

export default function PostEventSurveyForm({ formData, setFormData }) {
  const survey = formData.post_event_survey || {
    enabled: false,
    survey_title: '',
    questions: [],
    send_after_hours: 2
  };

  const updateSurvey = (updates) => {
    setFormData({
      ...formData,
      post_event_survey: { ...survey, ...updates }
    });
  };

  const addQuestion = () => {
    updateSurvey({
      questions: [
        ...survey.questions,
        { question: '', type: 'text', required: false, options: [] }
      ]
    });
  };

  const updateQuestion = (index, updates) => {
    const questions = [...survey.questions];
    questions[index] = { ...questions[index], ...updates };
    updateSurvey({ questions });
  };

  const removeQuestion = (index) => {
    updateSurvey({
      questions: survey.questions.filter((_, i) => i !== index)
    });
  };

  const addOption = (questionIndex) => {
    const option = prompt('Enter option:');
    if (option) {
      const questions = [...survey.questions];
      questions[questionIndex].options = [...(questions[questionIndex].options || []), option];
      updateSurvey({ questions });
    }
  };

  return (
    <div className="space-y-6 border-t pt-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Post-Event Survey</Label>
          <p className="text-sm text-slate-600">Automatically send surveys to attendees after the event</p>
        </div>
        <Switch
          checked={survey.enabled}
          onCheckedChange={(checked) => updateSurvey({ enabled: checked })}
        />
      </div>

      {survey.enabled && (
        <div className="space-y-6">
          <div>
            <Label>Survey Title</Label>
            <Input
              value={survey.survey_title}
              onChange={(e) => updateSurvey({ survey_title: e.target.value })}
              placeholder="e.g., Event Feedback Survey"
            />
          </div>

          <div>
            <Label>Send Survey After Event Ends</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                value={survey.send_after_hours}
                onChange={(e) => updateSurvey({ send_after_hours: parseInt(e.target.value) })}
                className="w-24"
              />
              <span className="text-sm text-slate-600">hours</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Survey Questions</Label>
              <Button onClick={addQuestion} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {survey.questions.map((question, index) => (
              <Card key={index}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-3">
                      <Input
                        value={question.question}
                        onChange={(e) => updateQuestion(index, { question: e.target.value })}
                        placeholder="Enter your question"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          value={question.type}
                          onValueChange={(value) => updateQuestion(index, { type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Answer</SelectItem>
                            <SelectItem value="rating">Rating (1-5)</SelectItem>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="checkbox">Checkboxes</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={question.required}
                            onCheckedChange={(checked) => updateQuestion(index, { required: checked })}
                          />
                          <Label className="text-sm">Required</Label>
                        </div>
                      </div>

                      {(question.type === 'multiple_choice' || question.type === 'checkbox') && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm">Options</Label>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => addOption(index)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="space-y-1">
                            {question.options?.map((opt, i) => (
                              <div key={i} className="text-sm text-slate-600 pl-3">
                                • {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}