import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, AlertTriangle, TrendingUp, 
  MessageSquare, Calendar, Target 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CoachSkillValidation({ consultantEmail }) {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [validatedLevel, setValidatedLevel] = useState([3]);
  const [coachNotes, setCoachNotes] = useState('');
  const [targetLevel, setTargetLevel] = useState([4]);
  const [targetDate, setTargetDate] = useState('');
  const queryClient = useQueryClient();

  const { data: skills = [] } = useQuery({
    queryKey: ['consultantSkills', consultantEmail],
    queryFn: () => base44.entities.ConsultantSkill.filter({ consultant_email: consultantEmail }),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const validateSkillMutation = useMutation({
    mutationFn: ({ skillId, data }) => base44.entities.ConsultantSkill.update(skillId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['consultantSkills']);
      toast.success('Skill validation saved');
      setSelectedSkill(null);
      setCoachNotes('');
    },
  });

  const handleValidate = (skill) => {
    setSelectedSkill(skill);
    setValidatedLevel([skill.coach_validated_level || skill.self_assessment_level || 3]);
    setCoachNotes(skill.coach_notes || '');
    setTargetLevel([skill.target_level || 4]);
    setTargetDate(skill.target_date || '');
  };

  const handleSaveValidation = () => {
    if (!selectedSkill) return;

    const progressionEntry = {
      date: new Date().toISOString(),
      level: validatedLevel[0],
      source: 'coach_validation',
      notes: coachNotes
    };

    const updatedHistory = [...(selectedSkill.progression_history || []), progressionEntry];

    validateSkillMutation.mutate({
      skillId: selectedSkill.id,
      data: {
        coach_validated_level: validatedLevel[0],
        coach_notes: coachNotes,
        target_level: targetLevel[0],
        target_date: targetDate || null,
        last_coach_validated: new Date().toISOString(),
        progression_history: updatedHistory
      }
    });
  };

  const pendingValidation = skills.filter(s => s.self_assessment_level && !s.coach_validated_level);
  const validated = skills.filter(s => s.coach_validated_level);
  const misaligned = validated.filter(s => Math.abs(s.self_assessment_level - s.coach_validated_level) > 1);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Validation</p>
                <p className="text-2xl font-bold text-slate-900">{pendingValidation.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Validated Skills</p>
                <p className="text-2xl font-bold text-slate-900">{validated.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Needs Attention</p>
                <p className="text-2xl font-bold text-slate-900">{misaligned.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skill Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingValidation.length})</TabsTrigger>
              <TabsTrigger value="validated">Validated ({validated.length})</TabsTrigger>
              <TabsTrigger value="all">All Skills ({skills.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3 mt-4">
              {pendingValidation.map(skill => (
                <div key={skill.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{skill.skill_name}</p>
                      <p className="text-sm text-slate-600 mb-2">{skill.skill_category.replace('_', ' ')}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Self-Assessed: </span>
                          <span className="font-semibold">{skill.self_assessment_level}</span>
                        </div>
                        {skill.last_self_assessed && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(skill.last_self_assessed), 'MMM d')}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleValidate(skill)}>
                      Validate
                    </Button>
                  </div>
                </div>
              ))}
              {pendingValidation.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">All skills validated!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="validated" className="space-y-3 mt-4">
              {validated.map(skill => {
                const diff = skill.self_assessment_level - skill.coach_validated_level;
                const isMisaligned = Math.abs(diff) > 1;
                return (
                  <div key={skill.id} className={`p-4 rounded-lg border ${isMisaligned ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-900">{skill.skill_name}</p>
                          {isMisaligned && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{skill.skill_category.replace('_', ' ')}</p>
                        <div className="flex items-center gap-4 text-sm mb-2">
                          <div>
                            <span className="text-slate-600">Self: </span>
                            <span className="font-semibold">{skill.self_assessment_level}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Coach: </span>
                            <span className="font-semibold">{skill.coach_validated_level}</span>
                          </div>
                          {skill.ai_projected_level && (
                            <div>
                              <span className="text-slate-600">AI: </span>
                              <span className="font-semibold">{skill.ai_projected_level.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        {skill.coach_notes && (
                          <div className="flex items-start gap-2 text-sm text-slate-600 bg-white/50 p-2 rounded">
                            <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{skill.coach_notes}</span>
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleValidate(skill)}>
                        Update
                      </Button>
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="all" className="space-y-3 mt-4">
              {skills.map(skill => (
                <div key={skill.id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{skill.skill_name}</p>
                      <p className="text-sm text-slate-600">{skill.skill_category.replace('_', ' ')}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleValidate(skill)}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Validation Modal */}
      {selectedSkill && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>Validate: {selectedSkill.skill_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-600">Consultant's Self-Assessment</p>
                <p className="text-2xl font-bold text-slate-900">{selectedSkill.self_assessment_level}</p>
              </div>
              {selectedSkill.ai_projected_level && (
                <div>
                  <p className="text-sm text-slate-600">AI Projected Level</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedSkill.ai_projected_level.toFixed(1)}</p>
                </div>
              )}
            </div>

            <div>
              <Label>Your Validated Level: {validatedLevel[0]}</Label>
              <div className="pt-6 pb-2">
                <Slider
                  value={validatedLevel}
                  onValueChange={setValidatedLevel}
                  min={1}
                  max={5}
                  step={0.5}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>

            <div>
              <Label>Coach Notes</Label>
              <Textarea
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                placeholder="Add notes about your validation and recommendations..."
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <p className="font-semibold text-slate-900 mb-3">Development Target</p>
              <div className="space-y-4">
                <div>
                  <Label>Target Level: {targetLevel[0]}</Label>
                  <div className="pt-6 pb-2">
                    <Slider
                      value={targetLevel}
                      onValueChange={setTargetLevel}
                      min={validatedLevel[0]}
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <Label>Target Date</Label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedSkill(null)}>Cancel</Button>
              <Button onClick={handleSaveValidation}>Save Validation</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}