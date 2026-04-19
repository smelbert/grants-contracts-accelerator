import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, CheckCircle2, Lightbulb, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LogicModelWalkthrough({ onComplete }) {
  const [step, setStep] = useState(0);
  const [logicModel, setLogicModel] = useState({
    theory_of_change: '',
    inputs: { staff: '', budget: '', partnerships: '', technology: '' },
    activities: ['', '', '', ''],
    outputs: ['', '', ''],
    outcomes_short: ['', ''],
    outcomes_medium: ['', ''],
    outcomes_long: [''],
    assumptions: ['', '', '']
  });

  const steps = [
    {
      title: 'Theory of Change',
      description: 'Start with your core theory: If we do X, then Y will happen because Z',
      field: 'theory_of_change',
      tip: "This is your program's fundamental logic. Be specific about the causal relationship.",
      example: 'If we provide job training and mentorship, then participants will gain employment because they will develop in-demand skills and professional networks.'
    },
    {
      title: 'Inputs (Resources)',
      description: 'What resources will you invest in this program?',
      fields: ['staff', 'budget', 'partnerships', 'technology'],
      tip: 'Include all resources you need: people, money, relationships, and tools.',
      examples: {
        staff: '2 FTE instructors, 0.5 FTE coordinator',
        budget: '$150,000 annually',
        partnerships: 'Local employers, community college',
        technology: 'Learning management system, video conferencing'
      }
    },
    {
      title: 'Activities',
      description: 'What specific activities will your staff do with these resources?',
      field: 'activities',
      tip: 'List concrete actions, not outcomes. Use action verbs.',
      examples: ['Deliver 12-week training program', 'Provide 1-on-1 coaching', 'Facilitate employer connections', 'Track participant progress']
    },
    {
      title: 'Outputs',
      description: 'What gets delivered as a result of your activities?',
      field: 'outputs',
      tip: 'Outputs are countable deliverables. Include target numbers.',
      examples: ['50 participants enrolled', '600 training hours delivered', '50 coaching sessions completed']
    },
    {
      title: 'Short-Term Outcomes (0-6 months)',
      description: 'What changes will participants experience in the first 6 months?',
      field: 'outcomes_short',
      tip: 'Focus on knowledge, attitudes, and skills gained.',
      examples: ['Participants will demonstrate proficiency in 3 job skills', 'Participants will report increased confidence']
    },
    {
      title: 'Medium-Term Outcomes (6-18 months)',
      description: 'What changes happen as participants apply what they learned?',
      field: 'outcomes_medium',
      tip: 'Focus on behavior changes and application of skills.',
      examples: ['75% of participants will gain employment', 'Participants will maintain employment for 6+ months']
    },
    {
      title: 'Long-Term Outcomes (18+ months)',
      description: 'What are the ultimate changes you hope to achieve?',
      field: 'outcomes_long',
      tip: 'This is your big-picture impact. Think about systems change or sustained transformation.',
      examples: ['Reduce local unemployment rate by 5%', 'Participants achieve economic self-sufficiency']
    },
    {
      title: 'Key Assumptions',
      description: 'What needs to be true for your logic model to work?',
      field: 'assumptions',
      tip: 'These are conditions outside your control that your success depends on.',
      examples: ['Employers are actively hiring', 'Participants have reliable transportation', 'Economic conditions remain stable']
    }
  ];

  const currentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const handleInputChange = (field, value, index = null) => {
    setLogicModel(prev => {
      if (index !== null && Array.isArray(prev[field])) {
        const newArray = [...prev[field]];
        newArray[index] = value;
        return { ...prev, [field]: newArray };
      } else if (typeof prev[field] === 'object' && !Array.isArray(prev[field])) {
        return { ...prev, [field]: { ...prev[field], [value.key]: value.val } };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete?.(logicModel);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-slate-900">Build Your Logic Model</h2>
          <Badge variant="outline">Step {step + 1} of {steps.length}</Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{currentStep.title}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">{currentStep.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tip */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Tip</p>
                  <p className="text-sm text-blue-700">{currentStep.tip}</p>
                </div>
              </div>

              {/* Example */}
              {currentStep.example && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-emerald-900 mb-1">Example</p>
                  <p className="text-sm text-emerald-700 italic">{currentStep.example}</p>
                </div>
              )}

              {currentStep.examples && !Array.isArray(currentStep.examples) && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-emerald-900 mb-2">Examples</p>
                  <div className="space-y-2">
                    {Object.entries(currentStep.examples).map(([key, val]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium text-emerald-900 capitalize">{key}: </span>
                        <span className="text-emerald-700 italic">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep.examples && Array.isArray(currentStep.examples) && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-emerald-900 mb-1">Examples</p>
                  <ul className="space-y-1">
                    {currentStep.examples.map((ex, idx) => (
                      <li key={idx} className="text-sm text-emerald-700 italic">• {ex}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Input Fields */}
              <div className="space-y-3 pt-2">
                {currentStep.field === 'theory_of_change' && (
                  <Textarea
                    placeholder="If we... then... because..."
                    value={logicModel.theory_of_change}
                    onChange={(e) => handleInputChange('theory_of_change', e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                )}

                {currentStep.fields && (
                  <div className="space-y-3">
                    {currentStep.fields.map((field) => (
                      <div key={field}>
                        <label className="text-sm font-medium text-slate-700 capitalize mb-1 block">
                          {field.replace('_', ' ')}
                        </label>
                        <Input
                          placeholder={currentStep.examples?.[field] || `Enter ${field}`}
                          value={logicModel.inputs[field]}
                          onChange={(e) => handleInputChange('inputs', { key: field, val: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {['activities', 'outputs', 'outcomes_short', 'outcomes_medium', 'outcomes_long', 'assumptions'].includes(currentStep.field) && (
                  <div className="space-y-2">
                    {logicModel[currentStep.field].map((item, idx) => (
                      <Input
                        key={idx}
                        placeholder={currentStep.examples?.[idx] || `Enter item ${idx + 1}`}
                        value={item}
                        onChange={(e) => handleInputChange(currentStep.field, e.target.value, idx)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {step === steps.length - 1 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Visual Logic Model Preview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Your Logic Model So Far</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 text-sm">
            <div className="flex-1 space-y-2">
              <div className="bg-slate-50 rounded p-2">
                <p className="font-medium text-slate-700">Inputs</p>
                <p className="text-xs text-slate-600">Resources invested</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 mx-auto" />
              <div className="bg-blue-50 rounded p-2">
                <p className="font-medium text-blue-700">Activities</p>
                <p className="text-xs text-slate-600">What we do</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 mt-6" />
            <div className="flex-1 space-y-2">
              <div className="bg-green-50 rounded p-2">
                <p className="font-medium text-green-700">Outputs</p>
                <p className="text-xs text-slate-600">What we deliver</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 mx-auto" />
              <div className="bg-emerald-50 rounded p-2">
                <p className="font-medium text-emerald-700">Outcomes</p>
                <p className="text-xs text-slate-600">Changes that result</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}