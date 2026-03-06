import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Copy, Trash2, GripVertical, ChevronDown, ChevronRight, Save, X, Eye } from 'lucide-react';
import { toast } from 'sonner';

// The built-in surveys — loaded from a static definition that admin can view/edit/duplicate
const BUILT_IN_SURVEYS = [
  {
    id: 'incubateher_pre',
    name: 'IncubateHer Pre-Assessment',
    type: 'pre',
    program: 'IncubateHer',
    description: 'Baseline readiness assessment given at program start. Measures grants/contracts knowledge, legal readiness, financial readiness, and confidence.',
    sections: [
      {
        id: 's1',
        title: 'Grants vs Contracts Knowledge',
        questions: [
          {
            id: 'q1', type: 'multiple_choice', text: 'What is the primary difference between grants and contracts?',
            options: [
              { value: 'a', text: 'Grants are for nonprofits only, contracts are for businesses', points: 25 },
              { value: 'b', text: 'Grants fund your mission, contracts pay for specific deliverables', points: 100 },
              { value: 'c', text: 'Grants are easier to get than contracts', points: 0 },
              { value: 'd', text: 'There is no real difference', points: 0 },
            ]
          },
          {
            id: 'q2', type: 'multiple_choice', text: 'Who typically reviews grant applications?',
            options: [
              { value: 'a', text: 'Procurement officers', points: 0 },
              { value: 'b', text: 'Program officers and review committees', points: 100 },
              { value: 'c', text: 'Legal departments', points: 25 },
              { value: 'd', text: 'Not sure', points: 0 },
            ]
          },
        ]
      },
      {
        id: 's2',
        title: 'Legal Structure Readiness',
        questions: [
          {
            id: 'q3', type: 'multiple_choice', text: 'What is your current business legal structure?',
            options: [
              { value: 'a', text: '501(c)(3) nonprofit with EIN', points: 100 },
              { value: 'b', text: 'LLC or Corporation with EIN', points: 75 },
              { value: 'c', text: 'Sole proprietor with EIN', points: 50 },
              { value: 'd', text: 'No formal structure yet', points: 0 },
            ]
          },
          {
            id: 'q4', type: 'multiple_choice', text: 'Do you have a governing board or advisory committee?',
            options: [
              { value: 'a', text: 'Yes, with regular meetings and minutes', points: 100 },
              { value: 'b', text: 'Yes, but informal', points: 50 },
              { value: 'c', text: 'Working on forming one', points: 25 },
              { value: 'd', text: 'No', points: 0 },
            ]
          },
        ]
      },
      {
        id: 's3',
        title: 'Financial & Document Readiness',
        questions: [
          {
            id: 'q5', type: 'multiple_choice', text: 'Do you have financial statements (budget, balance sheet)?',
            options: [
              { value: 'a', text: 'Yes, professionally prepared and current', points: 100 },
              { value: 'b', text: 'Yes, but need updating', points: 50 },
              { value: 'c', text: 'I have basic tracking', points: 25 },
              { value: 'd', text: 'No formal financial documents', points: 0 },
            ]
          },
          {
            id: 'q6', type: 'multiple_choice', text: 'Can you track expenses by program or project?',
            options: [
              { value: 'a', text: 'Yes, with accounting software', points: 100 },
              { value: 'b', text: 'Yes, using spreadsheets', points: 75 },
              { value: 'c', text: 'Somewhat', points: 25 },
              { value: 'd', text: 'No', points: 0 },
            ]
          },
        ]
      },
      {
        id: 's4',
        title: 'Confidence Level',
        questions: [
          { id: 'q7', type: 'scale', text: 'How confident are you in explaining your business mission to a funder?', scale: { min: 1, max: 10 } },
          { id: 'q8', type: 'scale', text: 'How confident are you in preparing a grant proposal?', scale: { min: 1, max: 10 } },
        ]
      },
    ]
  },
  {
    id: 'incubateher_post',
    name: 'IncubateHer Post-Assessment',
    type: 'post',
    program: 'IncubateHer',
    description: 'End-of-program assessment mirroring the pre-assessment. Measures growth and collects next steps from participants. Can be adapted for any workshop.',
    sections: [
      {
        id: 's1', title: 'Grants vs Contracts Knowledge',
        questions: [
          { id: 'q1', type: 'multiple_choice', text: 'What is the primary difference between grants and contracts?', options: [{ value: 'a', text: 'Grants are for nonprofits only, contracts are for businesses', points: 25 }, { value: 'b', text: 'Grants fund your mission, contracts pay for specific deliverables', points: 100 }, { value: 'c', text: 'Grants are easier to get than contracts', points: 0 }, { value: 'd', text: 'There is no real difference', points: 0 }] },
          { id: 'q2', type: 'multiple_choice', text: 'Who typically reviews grant applications?', options: [{ value: 'a', text: 'Procurement officers', points: 0 }, { value: 'b', text: 'Program officers and review committees', points: 100 }, { value: 'c', text: 'Legal departments', points: 25 }, { value: 'd', text: 'Not sure', points: 0 }] },
        ]
      },
      {
        id: 's2', title: 'Legal Structure Readiness',
        questions: [
          { id: 'q3', type: 'multiple_choice', text: 'What is your current business legal structure?', options: [{ value: 'a', text: '501(c)(3) nonprofit with EIN', points: 100 }, { value: 'b', text: 'LLC or Corporation with EIN', points: 75 }, { value: 'c', text: 'Sole proprietor with EIN', points: 50 }, { value: 'd', text: 'No formal structure yet', points: 0 }] },
          { id: 'q4', type: 'multiple_choice', text: 'Do you have a governing board or advisory committee?', options: [{ value: 'a', text: 'Yes, with regular meetings and minutes', points: 100 }, { value: 'b', text: 'Yes, but informal', points: 50 }, { value: 'c', text: 'Working on forming one', points: 25 }, { value: 'd', text: 'No', points: 0 }] },
        ]
      },
      {
        id: 's3', title: 'Financial & Document Readiness',
        questions: [
          { id: 'q5', type: 'multiple_choice', text: 'Do you have financial statements (budget, balance sheet)?', options: [{ value: 'a', text: 'Yes, professionally prepared and current', points: 100 }, { value: 'b', text: 'Yes, but need updating', points: 50 }, { value: 'c', text: 'I have basic tracking', points: 25 }, { value: 'd', text: 'No formal financial documents', points: 0 }] },
          { id: 'q6', type: 'multiple_choice', text: 'Can you track expenses by program or project?', options: [{ value: 'a', text: 'Yes, with accounting software', points: 100 }, { value: 'b', text: 'Yes, using spreadsheets', points: 75 }, { value: 'c', text: 'Somewhat', points: 25 }, { value: 'd', text: 'No', points: 0 }] },
        ]
      },
      {
        id: 's4', title: 'Confidence Level',
        questions: [
          { id: 'q7', type: 'scale', text: 'How confident are you in explaining your business mission to a funder?', scale: { min: 1, max: 10 } },
          { id: 'q8', type: 'scale', text: 'How confident are you in preparing a grant proposal?', scale: { min: 1, max: 10 } },
        ]
      },
      {
        id: 's5', title: 'Reflection',
        questions: [
          { id: 'q9', type: 'open_text', text: 'What are your next 3 action steps based on what you\'ve learned?' },
        ]
      },
    ]
  },
  {
    id: 'incubateher_eval',
    name: 'IncubateHer Program Evaluation',
    type: 'evaluation',
    program: 'IncubateHer',
    description: 'Program satisfaction survey completed by participants at the end. Collects overall rating, session feedback, and testimonials.',
    sections: [
      {
        id: 's1', title: 'Overall Experience',
        questions: [
          { id: 'e1', type: 'scale', text: 'Overall, how would you rate the IncubateHer program?', scale: { min: 1, max: 10 } },
          { id: 'e2', type: 'multiple_choice', text: 'How likely are you to recommend this program to a colleague?', options: [{ value: 'a', text: 'Very likely', points: 0 }, { value: 'b', text: 'Somewhat likely', points: 0 }, { value: 'c', text: 'Unlikely', points: 0 }, { value: 'd', text: 'Very unlikely', points: 0 }] },
        ]
      },
      {
        id: 's2', title: 'Learning & Application',
        questions: [
          { id: 'e3', type: 'open_text', text: 'What was the most valuable thing you learned?' },
          { id: 'e4', type: 'open_text', text: 'What would you improve about the program?' },
          { id: 'e5', type: 'open_text', text: 'What is one action you will take as a result of this program?' },
        ]
      },
    ]
  },
];

// ─── Question Editor ──────────────────────────────────────────────────────────
function QuestionEditor({ question, onChange, onDelete }) {
  const [expanded, setExpanded] = useState(true);

  const updateOption = (idx, field, val) => {
    const opts = [...(question.options || [])];
    opts[idx] = { ...opts[idx], [field]: field === 'points' ? parseInt(val) || 0 : val };
    onChange({ ...question, options: opts });
  };

  const addOption = () => {
    const opts = [...(question.options || []), { value: String.fromCharCode(97 + (question.options?.length || 0)), text: '', points: 0 }];
    onChange({ ...question, options: opts });
  };

  const removeOption = (idx) => {
    onChange({ ...question, options: question.options.filter((_, i) => i !== idx) });
  };

  return (
    <div className="border border-slate-200 rounded-lg bg-white">
      <div className="flex items-center gap-2 p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <GripVertical className="w-4 h-4 text-slate-300" />
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        <span className="text-sm font-medium text-slate-700 flex-1 truncate">{question.text || '(untitled question)'}</span>
        <Badge variant="outline" className="text-xs">{question.type}</Badge>
        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          <div>
            <Label className="text-xs">Question Text</Label>
            <Textarea value={question.text} onChange={e => onChange({ ...question, text: e.target.value })} rows={2} className="text-sm mt-1" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs">Question Type</Label>
              <Select value={question.type} onValueChange={val => onChange({ ...question, type: val, options: val === 'multiple_choice' ? (question.options || []) : undefined })}>
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="scale">Scale (1–10)</SelectItem>
                  <SelectItem value="open_text">Open Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {question.type === 'multiple_choice' && (
            <div>
              <Label className="text-xs mb-2 block">Answer Options</Label>
              <div className="space-y-2">
                {(question.options || []).map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-4">{opt.value}.</span>
                    <Input value={opt.text} onChange={e => updateOption(idx, 'text', e.target.value)} placeholder="Option text" className="h-7 text-xs flex-1" />
                    <Input type="number" value={opt.points} onChange={e => updateOption(idx, 'points', e.target.value)} className="h-7 text-xs w-16" placeholder="pts" />
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400" onClick={() => removeOption(idx)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={addOption} className="text-xs h-7">
                  <Plus className="w-3 h-3 mr-1" /> Add Option
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section Editor ────────────────────────────────────────────────────────────
function SectionEditor({ section, onChange, onDelete }) {
  const updateQuestion = (idx, q) => {
    const qs = [...section.questions];
    qs[idx] = q;
    onChange({ ...section, questions: qs });
  };

  const deleteQuestion = (idx) => {
    onChange({ ...section, questions: section.questions.filter((_, i) => i !== idx) });
  };

  const addQuestion = (type) => {
    const id = `q_${Date.now()}`;
    const newQ = type === 'multiple_choice'
      ? { id, type, text: '', options: [{ value: 'a', text: '', points: 0 }, { value: 'b', text: '', points: 0 }] }
      : { id, type, text: '', ...(type === 'scale' ? { scale: { min: 1, max: 10 } } : {}) };
    onChange({ ...section, questions: [...section.questions, newQ] });
  };

  return (
    <Card className="border border-slate-300">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center gap-3">
          <Input
            value={section.title}
            onChange={e => onChange({ ...section, title: e.target.value })}
            className="font-semibold text-sm h-8 flex-1"
            placeholder="Section title"
          />
          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 h-7 px-2" onClick={onDelete}>
            <Trash2 className="w-3 h-3 mr-1" /> Remove Section
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4">
        {section.questions.map((q, idx) => (
          <QuestionEditor
            key={q.id}
            question={q}
            onChange={(updated) => updateQuestion(idx, updated)}
            onDelete={() => deleteQuestion(idx)}
          />
        ))}
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={() => addQuestion('multiple_choice')} className="text-xs h-7">
            <Plus className="w-3 h-3 mr-1" /> Multiple Choice
          </Button>
          <Button size="sm" variant="outline" onClick={() => addQuestion('scale')} className="text-xs h-7">
            <Plus className="w-3 h-3 mr-1" /> Scale
          </Button>
          <Button size="sm" variant="outline" onClick={() => addQuestion('open_text')} className="text-xs h-7">
            <Plus className="w-3 h-3 mr-1" /> Open Text
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Survey Edit Dialog ────────────────────────────────────────────────────────
function SurveyEditDialog({ survey, onSave, onClose }) {
  const [draft, setDraft] = useState(JSON.parse(JSON.stringify(survey)));

  const updateSection = (idx, s) => {
    const sections = [...draft.sections];
    sections[idx] = s;
    setDraft({ ...draft, sections });
  };

  const deleteSection = (idx) => {
    setDraft({ ...draft, sections: draft.sections.filter((_, i) => i !== idx) });
  };

  const addSection = () => {
    setDraft({
      ...draft,
      sections: [...draft.sections, { id: `s_${Date.now()}`, title: 'New Section', questions: [] }]
    });
  };

  const handleSave = () => {
    onSave(draft);
    toast.success('Survey saved!');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-4 h-4" /> Edit Survey: {draft.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Survey Name</Label>
              <Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Program / Context</Label>
              <Input value={draft.program} onChange={e => setDraft({ ...draft, program: e.target.value })} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} rows={2} className="mt-1 text-sm" />
          </div>

          <div className="space-y-3">
            {draft.sections.map((section, idx) => (
              <SectionEditor
                key={section.id}
                section={section}
                onChange={(s) => updateSection(idx, s)}
                onDelete={() => deleteSection(idx)}
              />
            ))}
            <Button variant="outline" onClick={addSection} className="w-full border-dashed">
              <Plus className="w-4 h-4 mr-2" /> Add Section
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[#143A50] text-white hover:bg-[#1E4F58]">
              <Save className="w-4 h-4 mr-2" /> Save Survey
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Survey Preview Dialog ─────────────────────────────────────────────────────
function SurveyPreviewDialog({ survey, onClose }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{survey.name} — Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {survey.sections.map((section, si) => (
            <div key={si}>
              <h3 className="font-semibold text-slate-800 mb-2">{section.title}</h3>
              <div className="space-y-3 pl-3">
                {section.questions.map((q, qi) => (
                  <div key={qi} className="border-l-2 border-slate-200 pl-3">
                    <p className="font-medium text-slate-700">{qi + 1}. {q.text}</p>
                    {q.type === 'multiple_choice' && (
                      <ul className="mt-1 space-y-0.5">
                        {(q.options || []).map((opt, oi) => (
                          <li key={oi} className="text-slate-500 flex items-center gap-2">
                            <span className="w-5 text-xs text-slate-400">{opt.value}.</span>
                            {opt.text}
                            {opt.points > 0 && <Badge className="text-xs bg-green-100 text-green-800">{opt.points} pts</Badge>}
                          </li>
                        ))}
                      </ul>
                    )}
                    {q.type === 'scale' && <p className="text-slate-400 text-xs mt-1">Scale: 1–10</p>}
                    {q.type === 'open_text' && <p className="text-slate-400 text-xs mt-1">Open text response</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main SurveyBuilder ────────────────────────────────────────────────────────
export default function SurveyBuilder() {
  const [surveys, setSurveys] = useState(BUILT_IN_SURVEYS);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [previewSurvey, setPreviewSurvey] = useState(null);

  const handleSave = (updated) => {
    setSurveys(prev => prev.map(s => s.id === updated.id ? updated : s));
    setEditingSurvey(null);
  };

  const handleDuplicate = (survey) => {
    const copy = {
      ...JSON.parse(JSON.stringify(survey)),
      id: `custom_${Date.now()}`,
      name: `${survey.name} (Copy)`,
      type: 'custom',
    };
    setSurveys(prev => [...prev, copy]);
    toast.success(`Duplicated "${survey.name}" — you can now edit the copy.`);
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this survey template?')) return;
    setSurveys(prev => prev.filter(s => s.id !== id));
    toast.success('Survey deleted.');
  };

  const handleCreate = () => {
    const newSurvey = {
      id: `custom_${Date.now()}`,
      name: 'New Survey',
      type: 'custom',
      program: '',
      description: '',
      sections: [{ id: 's1', title: 'Section 1', questions: [] }],
    };
    setSurveys(prev => [...prev, newSurvey]);
    setEditingSurvey(newSurvey);
  };

  const typeColor = {
    pre: 'bg-blue-100 text-blue-800',
    post: 'bg-green-100 text-green-800',
    evaluation: 'bg-purple-100 text-purple-800',
    custom: 'bg-amber-100 text-amber-800',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Survey & Assessment Templates</h2>
          <p className="text-sm text-slate-500">View, edit, and duplicate your assessment templates. Changes here are local to your admin session.</p>
        </div>
        <Button onClick={handleCreate} className="bg-[#143A50] text-white hover:bg-[#1E4F58]">
          <Plus className="w-4 h-4 mr-2" /> New Survey
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {surveys.map((survey) => {
          const totalQuestions = survey.sections.reduce((acc, s) => acc + s.questions.length, 0);
          return (
            <Card key={survey.id} className="border border-slate-200">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{survey.name}</h3>
                      <Badge className={typeColor[survey.type] || typeColor.custom}>{survey.type}</Badge>
                      {survey.program && <Badge variant="outline" className="text-xs">{survey.program}</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 mb-2">{survey.description}</p>
                    <div className="flex gap-4 text-xs text-slate-400">
                      <span>{survey.sections.length} sections</span>
                      <span>{totalQuestions} questions</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setPreviewSurvey(survey)} title="Preview">
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingSurvey(survey)} title="Edit">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDuplicate(survey)} title="Duplicate for another workshop">
                      <Copy className="w-3 h-3" />
                    </Button>
                    {survey.type === 'custom' && (
                      <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(survey.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editingSurvey && (
        <SurveyEditDialog
          survey={editingSurvey}
          onSave={handleSave}
          onClose={() => setEditingSurvey(null)}
        />
      )}
      {previewSurvey && (
        <SurveyPreviewDialog
          survey={previewSurvey}
          onClose={() => setPreviewSurvey(null)}
        />
      )}
    </div>
  );
}