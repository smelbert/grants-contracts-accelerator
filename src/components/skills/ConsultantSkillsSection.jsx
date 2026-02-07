import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, TrendingUp, Award, CheckCircle2, 
  AlertCircle, Calendar, Sparkles, BarChart3 
} from 'lucide-react';
import { motion } from 'framer-motion';
import SkillAssessmentModal from './SkillAssessmentModal';
import SkillProgressChart from './SkillProgressChart';

const skillCategories = {
  grant_writing: { label: 'Grant Writing', icon: '📝', color: 'bg-blue-500' },
  proposal_development: { label: 'Proposal Development', icon: '📄', color: 'bg-purple-500' },
  budget_development: { label: 'Budget Development', icon: '💰', color: 'bg-green-500' },
  contract_management: { label: 'Contract Management', icon: '📋', color: 'bg-orange-500' },
  pitch_coaching: { label: 'Pitch Coaching', icon: '🎤', color: 'bg-pink-500' },
  compliance: { label: 'Compliance', icon: '✓', color: 'bg-indigo-500' },
  report_writing: { label: 'Report Writing', icon: '📊', color: 'bg-cyan-500' },
  client_communication: { label: 'Client Communication', icon: '💬', color: 'bg-teal-500' },
  research: { label: 'Research', icon: '🔍', color: 'bg-yellow-500' },
  project_management: { label: 'Project Management', icon: '📅', color: 'bg-red-500' }
};

const levelLabels = {
  1: 'Beginner',
  2: 'Developing',
  3: 'Proficient',
  4: 'Advanced',
  5: 'Expert'
};

export default function ConsultantSkillsSection({ consultantEmail }) {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const queryClient = useQueryClient();

  const { data: skills = [] } = useQuery({
    queryKey: ['consultantSkills', consultantEmail],
    queryFn: () => base44.entities.ConsultantSkill.filter({ consultant_email: consultantEmail }),
  });

  const { data: onboarding } = useQuery({
    queryKey: ['consultantOnboarding', consultantEmail],
    queryFn: () => base44.entities.ConsultantOnboarding.filter({ consultant_email: consultantEmail }).then(r => r[0]),
  });

  const updateSkillMutation = useMutation({
    mutationFn: ({ skillId, data }) => base44.entities.ConsultantSkill.update(skillId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['consultantSkills']);
    },
  });

  const getSkillLevel = (skill) => {
    if (skill.coach_validated_level) return { level: skill.coach_validated_level, source: 'Coach Validated' };
    if (skill.ai_projected_level) return { level: skill.ai_projected_level, source: 'AI Projected' };
    if (skill.self_assessment_level) return { level: skill.self_assessment_level, source: 'Self Assessed' };
    return { level: 0, source: 'Not Assessed' };
  };

  const getValidationStatus = (skill) => {
    if (!skill.self_assessment_level) return 'not_assessed';
    if (!skill.coach_validated_level) return 'pending_validation';
    const diff = Math.abs(skill.self_assessment_level - skill.coach_validated_level);
    if (diff <= 0.5) return 'validated';
    return 'misaligned';
  };

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.skill_category]) acc[skill.skill_category] = [];
    acc[skill.skill_category].push(skill);
    return acc;
  }, {});

  const overallProgress = skills.length > 0
    ? skills.reduce((sum, s) => sum + (getSkillLevel(s).level || 0), 0) / (skills.length * 5) * 100
    : 0;

  const validatedSkills = skills.filter(s => s.coach_validated_level).length;
  const pendingValidation = skills.filter(s => s.self_assessment_level && !s.coach_validated_level).length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Overall Progress</p>
                <p className="text-2xl font-bold text-slate-900">{Math.round(overallProgress)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Skills Tracked</p>
                <p className="text-2xl font-bold text-slate-900">{skills.length}</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Validated Skills</p>
                <p className="text-2xl font-bold text-slate-900">{validatedSkills}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Validation</p>
                <p className="text-2xl font-bold text-slate-900">{pendingValidation}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills by Category */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Skills</CardTitle>
          <Button onClick={() => setShowAssessment(true)} size="sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Self-Assess
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Skills</TabsTrigger>
              <TabsTrigger value="progress">Progress View</TabsTrigger>
              <TabsTrigger value="targets">Development Targets</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{skillCategories[category]?.icon}</span>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {skillCategories[category]?.label}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {categorySkills.map((skill) => {
                      const { level, source } = getSkillLevel(skill);
                      const status = getValidationStatus(skill);
                      return (
                        <motion.div
                          key={skill.id}
                          className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          onClick={() => setSelectedSkill(skill)}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-medium text-slate-900">{skill.skill_name}</p>
                                {status === 'validated' && (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                )}
                                {status === 'pending_validation' && (
                                  <AlertCircle className="w-4 h-4 text-amber-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <Badge variant="outline" className="text-xs">
                                  {levelLabels[level] || 'Not Assessed'}
                                </Badge>
                                <span className="text-slate-500">{source}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-slate-700">{level.toFixed(1)}</div>
                              <div className="text-xs text-slate-500">/ 5.0</div>
                            </div>
                          </div>
                          
                          {skill.target_level && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Target className="w-3 h-3" />
                                  <span>Target: Level {skill.target_level}</span>
                                </div>
                                {skill.target_date && (
                                  <div className="flex items-center gap-1 text-slate-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(skill.target_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {skills.length === 0 && (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">No skills assessed yet</p>
                  <Button onClick={() => setShowAssessment(true)} variant="outline">
                    Start Your First Assessment
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="progress">
              {selectedSkill ? (
                <SkillProgressChart skill={selectedSkill} />
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Select a skill to view progress chart</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="targets" className="space-y-4">
              {skills.filter(s => s.target_level).map((skill) => {
                const { level } = getSkillLevel(skill);
                const progress = (level / skill.target_level) * 100;
                return (
                  <Card key={skill.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-slate-900">{skill.skill_name}</p>
                          <p className="text-sm text-slate-600">{skillCategories[skill.skill_category]?.label}</p>
                        </div>
                        <Badge>{Math.round(progress)}%</Badge>
                      </div>
                      <Progress value={progress} className="mb-2" />
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>Current: {level.toFixed(1)}</span>
                        <span>Target: {skill.target_level}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {skills.filter(s => s.target_level).length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No development targets set</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Assessment Modal */}
      {showAssessment && (
        <SkillAssessmentModal
          consultantEmail={consultantEmail}
          existingSkills={skills}
          onClose={() => setShowAssessment(false)}
        />
      )}
    </div>
  );
}