import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProgramModuleManager() {
  const queryClient = useQueryClient();
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: cohorts = [] } = useQuery({
    queryKey: ['program-cohorts'],
    queryFn: () => base44.entities.ProgramCohort.list()
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['program-modules', selectedCohort],
    queryFn: async () => {
      if (!selectedCohort) return [];
      return await base44.entities.ProgramModule.filter({
        cohort_id: selectedCohort
      });
    },
    enabled: !!selectedCohort
  });

  const { data: learningContent = [] } = useQuery({
    queryKey: ['learning-content'],
    queryFn: () => base44.entities.LearningContent.list()
  });

  const saveModuleMutation = useMutation({
    mutationFn: async (moduleData) => {
      if (editingModule) {
        return await base44.entities.ProgramModule.update(editingModule.id, moduleData);
      }
      return await base44.entities.ProgramModule.create({
        ...moduleData,
        cohort_id: selectedCohort,
        module_number: modules.length + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-modules'] });
      toast.success(editingModule ? 'Module updated' : 'Module created');
      setShowForm(false);
      setEditingModule(null);
    }
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId) => base44.entities.ProgramModule.delete(moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-modules'] });
      toast.success('Module deleted');
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#143A50] mb-2">Program Module Manager</h1>
          <p className="text-slate-600">Define and organize program modules</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cohort Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cohorts.map(cohort => (
                <button
                  key={cohort.id}
                  onClick={() => {
                    setSelectedCohort(cohort.id);
                    setShowForm(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedCohort === cohort.id
                      ? 'border-[#143A50] bg-[#E5C089]/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium">{cohort.program_name}</div>
                  <div className="text-xs text-slate-500">{cohort.program_code}</div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Modules List */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCohort && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Modules ({modules.length})</h2>
                  <Button
                    onClick={() => {
                      setEditingModule(null);
                      setShowForm(true);
                    }}
                    className="bg-[#143A50] hover:bg-[#1E4F58]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Module
                  </Button>
                </div>

                {showForm && (
                  <ModuleForm
                    module={editingModule}
                    learningContent={learningContent}
                    onSave={(data) => saveModuleMutation.mutate(data)}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingModule(null);
                    }}
                  />
                )}

                {modules.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-slate-500">No modules yet. Create your first module!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {modules
                      .sort((a, b) => a.module_number - b.module_number)
                      .map((module) => (
                        <Card key={module.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <GripVertical className="w-5 h-5 text-slate-400 mt-1" />
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">Module {module.module_number}</Badge>
                                    {module.required_for_completion && (
                                      <Badge className="bg-red-100 text-red-800">Required</Badge>
                                    )}
                                    {module.assessment_required && (
                                      <Badge className="bg-blue-100 text-blue-800">Assessment</Badge>
                                    )}
                                  </div>
                                  <CardTitle className="text-lg">{module.module_name}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {module.description}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingModule(module);
                                    setShowForm(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteModuleMutation.mutate(module.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              {module.duration_hours && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {module.duration_hours}h
                                </div>
                              )}
                              {module.content_ids?.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <BookOpen className="w-4 h-4" />
                                  {module.content_ids.length} resources
                                </div>
                              )}
                              {module.learning_objectives?.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  {module.learning_objectives.length} objectives
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </>
            )}

            {!selectedCohort && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500">Select a program to manage its modules</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleForm({ module, learningContent, onSave, onCancel }) {
  const [formData, setFormData] = useState(module || {
    module_name: '',
    description: '',
    duration_hours: 0,
    learning_objectives: [],
    content_ids: [],
    required_for_completion: true,
    assessment_required: false,
    passing_score: 70
  });

  const [objectiveInput, setObjectiveInput] = useState('');

  return (
    <Card className="border-2 border-[#143A50]">
      <CardHeader>
        <CardTitle>{module ? 'Edit Module' : 'New Module'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Module Name *</label>
          <Input
            value={formData.module_name}
            onChange={(e) => setFormData({ ...formData, module_name: e.target.value })}
            placeholder="e.g., Introduction to Grant Writing"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Describe what participants will learn..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Duration (Hours)</label>
            <Input
              type="number"
              value={formData.duration_hours}
              onChange={(e) => setFormData({ ...formData, duration_hours: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Passing Score (%)</label>
            <Input
              type="number"
              value={formData.passing_score}
              onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
              disabled={!formData.assessment_required}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={formData.required_for_completion}
              onCheckedChange={(checked) => setFormData({ ...formData, required_for_completion: checked })}
            />
            <span className="text-sm font-medium">Required for certificate</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={formData.assessment_required}
              onCheckedChange={(checked) => setFormData({ ...formData, assessment_required: checked })}
            />
            <span className="text-sm font-medium">Assessment required</span>
          </label>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Learning Objectives</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={objectiveInput}
              onChange={(e) => setObjectiveInput(e.target.value)}
              placeholder="Add learning objective..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && objectiveInput) {
                  setFormData({
                    ...formData,
                    learning_objectives: [...(formData.learning_objectives || []), objectiveInput]
                  });
                  setObjectiveInput('');
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                if (objectiveInput) {
                  setFormData({
                    ...formData,
                    learning_objectives: [...(formData.learning_objectives || []), objectiveInput]
                  });
                  setObjectiveInput('');
                }
              }}
            >
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {formData.learning_objectives?.map((obj, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                <span>{obj}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newObjectives = [...formData.learning_objectives];
                    newObjectives.splice(idx, 1);
                    setFormData({ ...formData, learning_objectives: newObjectives });
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => onSave(formData)}
            disabled={!formData.module_name}
            className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]"
          >
            {module ? 'Update Module' : 'Create Module'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}