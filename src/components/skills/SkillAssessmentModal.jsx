import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

const skillCategories = {
  grant_writing: 'Grant Writing',
  proposal_development: 'Proposal Development',
  budget_development: 'Budget Development',
  contract_management: 'Contract Management',
  pitch_coaching: 'Pitch Coaching',
  compliance: 'Compliance',
  report_writing: 'Report Writing',
  client_communication: 'Client Communication',
  research: 'Research',
  project_management: 'Project Management'
};

const predefinedSkills = {
  grant_writing: ['Needs Assessment', 'Logic Model Development', 'Budget Narrative', 'Project Narrative', 'Evaluation Planning'],
  proposal_development: ['Executive Summary', 'Problem Statement', 'Solution Design', 'Timeline Creation', 'Stakeholder Engagement'],
  budget_development: ['Line Item Budgeting', 'Indirect Cost Calculation', 'Budget Justification', 'Cost Allocation', 'Financial Forecasting'],
  contract_management: ['Contract Review', 'Negotiation', 'Compliance Monitoring', 'Amendment Management', 'Closeout Procedures'],
  pitch_coaching: ['Presentation Skills', 'Q&A Facilitation', 'Storytelling', 'Visual Design', 'Audience Engagement'],
  compliance: ['Regulatory Requirements', 'Reporting Standards', 'Documentation', 'Audit Preparation', 'Risk Management'],
  report_writing: ['Progress Reports', 'Impact Measurement', 'Data Visualization', 'Narrative Writing', 'Executive Summaries'],
  client_communication: ['Needs Assessment', 'Active Listening', 'Written Communication', 'Meeting Facilitation', 'Relationship Building'],
  research: ['Funder Research', 'Market Analysis', 'Data Collection', 'Literature Review', 'Competitive Analysis'],
  project_management: ['Planning', 'Task Delegation', 'Timeline Management', 'Risk Mitigation', 'Team Coordination']
};

const levelDescriptions = {
  1: 'Beginner - Learning the basics',
  2: 'Developing - Can perform with guidance',
  3: 'Proficient - Can work independently',
  4: 'Advanced - Can mentor others',
  5: 'Expert - Recognized authority'
};

export default function SkillAssessmentModal({ consultantEmail, existingSkills = [], onClose }) {
  const [category, setCategory] = useState('');
  const [skillName, setSkillName] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [level, setLevel] = useState([3]);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const createSkillMutation = useMutation({
    mutationFn: (data) => base44.entities.ConsultantSkill.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['consultantSkills']);
      toast.success('Skill assessment saved');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save assessment');
    }
  });

  const updateSkillMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ConsultantSkill.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['consultantSkills']);
      toast.success('Skill assessment updated');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update assessment');
    }
  });

  const handleSubmit = () => {
    if (!category || (!skillName && !customSkill)) {
      toast.error('Please select a category and skill');
      return;
    }

    const finalSkillName = skillName === 'custom' ? customSkill : skillName;
    const existingSkill = existingSkills.find(
      s => s.skill_category === category && s.skill_name === finalSkillName
    );

    const progressionEntry = {
      date: new Date().toISOString(),
      level: level[0],
      source: 'self_assessment',
      notes
    };

    if (existingSkill) {
      const updatedHistory = [...(existingSkill.progression_history || []), progressionEntry];
      updateSkillMutation.mutate({
        id: existingSkill.id,
        data: {
          self_assessment_level: level[0],
          last_self_assessed: new Date().toISOString(),
          progression_history: updatedHistory
        }
      });
    } else {
      createSkillMutation.mutate({
        consultant_email: consultantEmail,
        skill_category: category,
        skill_name: finalSkillName,
        self_assessment_level: level[0],
        last_self_assessed: new Date().toISOString(),
        progression_history: [progressionEntry]
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Self-Assess Your Skills
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Skill Category</Label>
            <Select value={category} onValueChange={(v) => { setCategory(v); setSkillName(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(skillCategories).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category && (
            <div>
              <Label>Specific Skill</Label>
              <Select value={skillName} onValueChange={setSkillName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedSkills[category]?.map((skill) => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Skill...</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {skillName === 'custom' && (
            <div>
              <Label>Custom Skill Name</Label>
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Enter skill name"
              />
            </div>
          )}

          <div>
            <Label>Skill Level: {level[0]} - {levelDescriptions[level[0]]}</Label>
            <div className="pt-6 pb-2">
              <Slider
                value={level}
                onValueChange={setLevel}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>Beginner</span>
              <span>Developing</span>
              <span>Proficient</span>
              <span>Advanced</span>
              <span>Expert</span>
            </div>
          </div>

          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any context about your assessment..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Save Assessment</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}