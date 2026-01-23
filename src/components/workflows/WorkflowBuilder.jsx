import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users, Calendar, FileText, Sparkles } from 'lucide-react';

const SECTION_TEMPLATES = [
  { value: 'executive_summary', label: 'Executive Summary', defaultDays: 3 },
  { value: 'program_description', label: 'Program Description', defaultDays: 7 },
  { value: 'logic_model', label: 'Logic Model', defaultDays: 5 },
  { value: 'budget_narrative', label: 'Budget Narrative', defaultDays: 4 },
  { value: 'budget_detail', label: 'Budget Detail', defaultDays: 3 },
  { value: 'evaluation_plan', label: 'Evaluation Plan', defaultDays: 5 },
  { value: 'sustainability', label: 'Sustainability Plan', defaultDays: 3 },
  { value: 'organizational_capacity', label: 'Organizational Capacity', defaultDays: 2 },
  { value: 'letters_of_support', label: 'Letters of Support', defaultDays: 7 },
  { value: 'other', label: 'Other', defaultDays: 2 }
];

export default function WorkflowBuilder({ opportunities, onComplete }) {
  const [workflowData, setWorkflowData] = useState({
    opportunity_id: '',
    workflow_name: '',
    proposal_lead: '',
    team_members: [],
    final_deadline: '',
    sections: [],
    status: 'planning',
    overall_progress: 0
  });

  const [newTeamMember, setNewTeamMember] = useState('');

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const createWorkflowMutation = useMutation({
    mutationFn: (data) => base44.entities.ProposalWorkflow.create(data),
    onSuccess: () => {
      onComplete?.();
    }
  });

  const handleAddSection = () => {
    setWorkflowData({
      ...workflowData,
      sections: [
        ...workflowData.sections,
        {
          section_id: `section_${Date.now()}`,
          section_name: '',
          section_type: 'other',
          assigned_to: '',
          deadline: '',
          status: 'not_started',
          completion_percentage: 0,
          notes: ''
        }
      ]
    });
  };

  const handleRemoveSection = (index) => {
    setWorkflowData({
      ...workflowData,
      sections: workflowData.sections.filter((_, i) => i !== index)
    });
  };

  const handleUpdateSection = (index, field, value) => {
    const updatedSections = [...workflowData.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value
    };

    // Auto-populate section name when type changes
    if (field === 'section_type') {
      const template = SECTION_TEMPLATES.find(t => t.value === value);
      if (template && !updatedSections[index].section_name) {
        updatedSections[index].section_name = template.label;
      }
    }

    setWorkflowData({
      ...workflowData,
      sections: updatedSections
    });
  };

  const handleAddTeamMember = () => {
    if (newTeamMember && !workflowData.team_members.includes(newTeamMember)) {
      setWorkflowData({
        ...workflowData,
        team_members: [...workflowData.team_members, newTeamMember]
      });
      setNewTeamMember('');
    }
  };

  const handleRemoveTeamMember = (email) => {
    setWorkflowData({
      ...workflowData,
      team_members: workflowData.team_members.filter(m => m !== email)
    });
  };

  const handleUseQuickTemplate = () => {
    const defaultSections = SECTION_TEMPLATES.slice(0, 6).map((template, index) => ({
      section_id: `section_${Date.now()}_${index}`,
      section_name: template.label,
      section_type: template.value,
      assigned_to: '',
      deadline: '',
      status: 'not_started',
      completion_percentage: 0,
      notes: ''
    }));

    setWorkflowData({
      ...workflowData,
      sections: defaultSections
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createWorkflowMutation.mutate(workflowData);
  };

  const selectedOpportunity = opportunities.find(o => o.id === workflowData.opportunity_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">
            Select Grant Opportunity *
          </label>
          <Select 
            value={workflowData.opportunity_id} 
            onValueChange={(val) => {
              const opp = opportunities.find(o => o.id === val);
              setWorkflowData({
                ...workflowData,
                opportunity_id: val,
                workflow_name: opp ? `${opp.title} - Proposal` : '',
                final_deadline: opp?.deadline_full || opp?.deadline || ''
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an opportunity" />
            </SelectTrigger>
            <SelectContent>
              {opportunities.map((opp) => (
                <SelectItem key={opp.id} value={opp.id}>
                  {opp.title} - {opp.funder_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Workflow Name *</label>
          <Input
            required
            value={workflowData.workflow_name}
            onChange={(e) => setWorkflowData({ ...workflowData, workflow_name: e.target.value })}
            placeholder="e.g., Youth Programs Grant - Fall 2026"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Proposal Lead</label>
            <Select 
              value={workflowData.proposal_lead} 
              onValueChange={(val) => setWorkflowData({ ...workflowData, proposal_lead: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select lead" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.email}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Final Deadline</label>
            <Input
              type="date"
              value={workflowData.final_deadline}
              onChange={(e) => setWorkflowData({ ...workflowData, final_deadline: e.target.value })}
            />
          </div>
        </div>

        {/* Team Members */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Team Members</label>
          <div className="flex gap-2 mb-2">
            <Select value={newTeamMember} onValueChange={setNewTeamMember}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Add team member" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter(u => !workflowData.team_members.includes(u.email))
                  .map((user) => (
                    <SelectItem key={user.id} value={user.email}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={handleAddTeamMember} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {workflowData.team_members.map((email) => (
              <Badge key={email} variant="outline" className="pl-2 pr-1">
                {email}
                <button
                  type="button"
                  onClick={() => handleRemoveTeamMember(email)}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-slate-700">Proposal Sections</label>
          <div className="flex gap-2">
            <Button type="button" onClick={handleUseQuickTemplate} variant="outline" size="sm">
              <Sparkles className="w-4 h-4 mr-1" />
              Use Template
            </Button>
            <Button type="button" onClick={handleAddSection} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Section
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {workflowData.sections.map((section, index) => (
            <Card key={section.section_id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Section Type</label>
                        <Select
                          value={section.section_type}
                          onValueChange={(val) => handleUpdateSection(index, 'section_type', val)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SECTION_TEMPLATES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Section Name</label>
                        <Input
                          value={section.section_name}
                          onChange={(e) => handleUpdateSection(index, 'section_name', e.target.value)}
                          placeholder="Custom name..."
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Assign To</label>
                        <Select
                          value={section.assigned_to}
                          onValueChange={(val) => handleUpdateSection(index, 'assigned_to', val)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.email}>
                                {user.full_name || user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Deadline</label>
                        <Input
                          type="date"
                          value={section.deadline}
                          onChange={(e) => handleUpdateSection(index, 'deadline', e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSection(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {workflowData.sections.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">No sections added yet</p>
            <p className="text-xs text-slate-500 mt-1">Add sections to structure your proposal workflow</p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="submit"
          disabled={!workflowData.opportunity_id || !workflowData.workflow_name || createWorkflowMutation.isPending}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {createWorkflowMutation.isPending ? 'Creating...' : 'Create Workflow'}
        </Button>
      </div>
    </form>
  );
}