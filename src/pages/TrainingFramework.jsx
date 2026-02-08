import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Target, Award, Sparkles, CheckCircle2, 
  TrendingUp, Users, Loader2, Lightbulb, FileText
} from 'lucide-react';
import VisualCurriculumMap from '@/components/training/VisualCurriculumMap';
import ModuleDetailView, { MODULES_DATA } from '@/components/training/ModuleDetailView';

const LEVEL_COLORS = {
  'level-1': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-600' },
  'level-2': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-600' },
  'level-3': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-600' }
};

export default function TrainingFrameworkPage() {
  const [activeTab, setActiveTab] = useState('philosophy');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: frameworkContent = [], isLoading } = useQuery({
    queryKey: ['training-framework'],
    queryFn: () => base44.entities.TrainingFrameworkContent.filter({ is_published: true }),
  });

  // Real-time subscription for live updates
  React.useEffect(() => {
    const unsubscribe = base44.entities.TrainingFrameworkContent.subscribe((event) => {
      queryClient.invalidateQueries(['training-framework']);
    });
    return unsubscribe;
  }, []);

  const { data: onboarding } = useQuery({
    queryKey: ['consultant-onboarding', user?.email],
    queryFn: () => base44.entities.ConsultantOnboarding.filter({ consultant_email: user?.email }).then(r => r[0]),
    enabled: !!user?.email,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E4F58]" />
      </div>
    );
  }

  const philosophyContent = frameworkContent.filter(c => c.section_type === 'philosophy').sort((a, b) => a.display_order - b.display_order);
  const modules = frameworkContent.filter(c => c.section_type === 'module').sort((a, b) => (a.module_number || 0) - (b.module_number || 0));
  const levelDefinitions = frameworkContent.filter(c => c.section_type === 'level_definition').sort((a, b) => a.display_order - b.display_order);
  const expectations = frameworkContent.filter(c => c.section_type === 'expectations').sort((a, b) => a.display_order - b.display_order);
  const formatContent = frameworkContent.filter(c => c.section_type === 'format').sort((a, b) => a.display_order - b.display_order);

  const currentLevel = onboarding?.current_level;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E4F58] to-[#143A50] flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#143A50]">EIS Consultant Training Framework</h1>
              <p className="text-slate-600">Pitches, Grants, Proposals & Contracts</p>
            </div>
          </div>

          {currentLevel && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-slate-600">Your Current Level:</span>
              <Badge className={LEVEL_COLORS[currentLevel].badge}>
                {currentLevel === 'level-1' ? '🟢 Level 1: Foundation' :
                 currentLevel === 'level-2' ? '🔵 Level 2: Intermediate' :
                 '🟣 Level 3: Senior'}
              </Badge>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="curriculum-map">Curriculum Map</TabsTrigger>
            <TabsTrigger value="philosophy">Philosophy</TabsTrigger>
            <TabsTrigger value="levels">Levels</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="expectations">Expectations</TabsTrigger>
            <TabsTrigger value="format">Format</TabsTrigger>
          </TabsList>

          {/* Curriculum Map Tab */}
          <TabsContent value="curriculum-map" className="space-y-6">
            <VisualCurriculumMap currentLevel={currentLevel} />
          </TabsContent>

          {/* Philosophy Tab */}
          <TabsContent value="philosophy" className="space-y-6">
            <Card className="border-2 border-[#1E4F58] shadow-lg">
              <CardHeader className="bg-[#1E4F58]/5">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-[#1E4F58]" />
                  <CardTitle className="text-2xl text-[#143A50]">Training Philosophy</CardTitle>
                </div>
                <CardDescription className="text-base">The foundation of how we train consultants at EIS</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {philosophyContent.map((section) => (
                  <div key={section.id}>
                    <h3 className="text-lg font-semibold text-[#143A50] mb-3">{section.title}</h3>
                    <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
                    {section.key_points?.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {section.key_points.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-[#1E4F58] mt-0.5 flex-shrink-0" />
                            <span className="text-slate-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Levels Tab */}
          <TabsContent value="levels" className="space-y-6">
            {['level-1', 'level-2', 'level-3'].map((level) => {
              const levelContent = levelDefinitions.filter(l => l.level === level);
              const colors = LEVEL_COLORS[level];
              const isCurrentLevel = currentLevel === level;

              return (
                <Card key={level} className={`border-2 ${colors.border} ${isCurrentLevel ? 'shadow-xl' : 'shadow-lg'}`}>
                  <CardHeader className={colors.bg}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {level === 'level-1' && <Target className="w-6 h-6 text-green-600" />}
                        {level === 'level-2' && <TrendingUp className="w-6 h-6 text-blue-600" />}
                        {level === 'level-3' && <Award className="w-6 h-6 text-purple-600" />}
                        <div>
                          <CardTitle className={`text-2xl ${colors.text}`}>
                            {level === 'level-1' ? '🟢 Level 1: Foundation Consultants' :
                             level === 'level-2' ? '🔵 Level 2: Intermediate Consultants' :
                             '🟣 Level 3: Senior Consultants'}
                          </CardTitle>
                          <CardDescription>
                            {level === 'level-1' ? 'Brand new or limited experience' :
                             level === 'level-2' ? 'Some experience with grants, proposals, or contracts' :
                             'Experienced, trusted, client-facing'}
                          </CardDescription>
                        </div>
                      </div>
                      {isCurrentLevel && (
                        <Badge className="bg-[#AC1A5B]">Your Level</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {levelContent.map((section) => (
                      <div key={section.id}>
                        <h4 className="font-semibold text-[#143A50] mb-2">{section.title}</h4>
                        <div className="prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: section.content }} />
                        {section.key_points?.length > 0 && (
                          <ul className="mt-3 space-y-1">
                            {section.key_points.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-600">{point}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {section.promotion_gates?.length > 0 && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                            <p className="font-medium text-sm text-slate-900 mb-2">Promotion Requirements:</p>
                            <ul className="space-y-1">
                              {section.promotion_gates.map((gate, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                                  <span className="text-slate-700">{gate}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <Card className="border-l-4 border-[#AC1A5B] shadow-lg mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-[#AC1A5B]" />
                  <p className="text-slate-700">
                    <strong>19 Core Training Modules</strong> — Comprehensive curriculum covering all competencies across levels.
                  </p>
                </div>
              </CardContent>
            </Card>

            {MODULES_DATA.map((module) => (
              <ModuleDetailView 
                key={module.number} 
                moduleNumber={module.number}
                currentLevel={currentLevel}
              />
            ))}
          </TabsContent>

          {/* Expectations Tab */}
          <TabsContent value="expectations" className="space-y-6">
            {expectations.map((section) => (
              <Card key={section.id} className="shadow-lg">
                <CardHeader className="bg-slate-50">
                  <CardTitle className="text-xl text-[#143A50]">{section.title}</CardTitle>
                  {section.subtitle && <CardDescription>{section.subtitle}</CardDescription>}
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
                  {section.key_points?.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {section.key_points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#1E4F58] mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Format Tab */}
          <TabsContent value="format" className="space-y-6">
            {formatContent.map((section) => (
              <Card key={section.id} className="shadow-lg">
                <CardHeader className="bg-slate-50">
                  <CardTitle className="text-xl text-[#143A50]">{section.title}</CardTitle>
                  {section.subtitle && <CardDescription>{section.subtitle}</CardDescription>}
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
                  {section.key_points?.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {section.key_points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-[#1E4F58] rounded-full mt-2 flex-shrink-0" />
                          <span className="text-slate-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}