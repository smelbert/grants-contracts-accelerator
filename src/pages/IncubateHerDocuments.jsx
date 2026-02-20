import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, CheckCircle2, Edit } from 'lucide-react';
import DocumentTemplates from '@/components/incubateher/DocumentTemplates';

export default function IncubateHerDocuments() {
  const [selectedDay, setSelectedDay] = useState('day1');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: enrollment } = useQuery({
    queryKey: ['incubateher-enrollment', user?.email],
    queryFn: async () => {
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
      return enrollments[0];
    },
    enabled: !!user?.email
  });

  const { data: dayModules = [] } = useQuery({
    queryKey: ['incubateher-day-modules'],
    queryFn: () => base44.entities.LearningContent.filter({
      incubateher_only: true,
      program_cohort_id: 'incubateher'
    }, 'order')
  });

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Enrollment Required</h2>
              <p className="text-slate-600">
                This resource is only available to IncubateHer program participants.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const day1Module = dayModules.find(m => m.title?.includes('Day 1'));
  const day2Module = dayModules.find(m => m.title?.includes('Day 2'));
  const day3Module = dayModules.find(m => m.title?.includes('Day 3'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-[#E5C089]/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-[#E5C089]" />
            <h1 className="text-4xl font-bold">Document Templates & Modules</h1>
          </div>
          <p className="text-lg text-[#E5C089]/80 max-w-3xl">
            Three-day structure to build complete funding readiness with templates you can use immediately
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Critical Message */}
        <Card className="mb-8 border-l-4 border-red-500 bg-red-50">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-red-900 mb-2">If you don't have these documents, you are not ready.</p>
                <p className="text-sm text-red-800">
                  Funding readiness is not about passion or urgency. It's about systems, documentation, and capacity. 
                  Complete these modules in order before pursuing any funding opportunities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day1" className="flex flex-col gap-1 py-3">
              <span className="text-lg">🟢 Day 1</span>
              <span className="text-xs">Structure & Eligibility</span>
            </TabsTrigger>
            <TabsTrigger value="day2" className="flex flex-col gap-1 py-3">
              <span className="text-lg">🔵 Day 2</span>
              <span className="text-xs">Financial & Data</span>
            </TabsTrigger>
            <TabsTrigger value="day3" className="flex flex-col gap-1 py-3">
              <span className="text-lg">🟣 Day 3</span>
              <span className="text-xs">Strategy & Positioning</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="day1" className="mt-8">
            <Card className="mb-6 bg-green-50 border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {day1Module?.title || 'Day 1: Structure & Eligibility Documents'}
                    </CardTitle>
                    <p className="text-green-800 font-semibold">
                      Theme: "Are you legally and operationally fundable?"
                    </p>
                  </div>
                  <Badge className="bg-green-600 text-white">Day 1</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  {day1Module?.description || 'Learn what documents you need to have in place before pursuing any funding.'}
                </p>
              </CardContent>
            </Card>

            <DocumentTemplates day="day1" />
          </TabsContent>

          <TabsContent value="day2" className="mt-8">
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {day2Module?.title || 'Day 2: Financial & Data Documents'}
                    </CardTitle>
                    <p className="text-blue-800 font-semibold">
                      Theme: "Can you track and report what you promise?"
                    </p>
                  </div>
                  <Badge className="bg-blue-600 text-white">Day 2</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  {day2Module?.description || 'Build the financial and data systems funders require.'}
                </p>
              </CardContent>
            </Card>

            <DocumentTemplates day="day2" />
          </TabsContent>

          <TabsContent value="day3" className="mt-8">
            <Card className="mb-6 bg-purple-50 border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {day3Module?.title || 'Day 3: Strategy & Positioning Documents'}
                    </CardTitle>
                    <p className="text-purple-800 font-semibold">
                      Theme: "Can you articulate and scale responsibly?"
                    </p>
                  </div>
                  <Badge className="bg-purple-600 text-white">Day 3</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  {day3Module?.description || 'Position yourself strategically for the right opportunities.'}
                </p>
              </CardContent>
            </Card>

            <DocumentTemplates day="day3" />
          </TabsContent>
        </Tabs>

        {/* Final Outcome Card */}
        <Card className="mt-8 bg-gradient-to-br from-[#E5C089] to-[#B5A698] text-[#143A50]">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="w-8 h-8" />
              What You Should Have By The End
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 font-semibold">
              If this training is executed correctly, each participant should leave with:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>A completed document inventory</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>At least 3-5 newly drafted templates</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>A structured funding folder</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>A clarified funding pathway</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>A budget draft</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>A logic model draft</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>A sustainability outline</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>A data collection plan</span>
              </div>
            </div>
            <p className="mt-6 text-center text-xl font-bold">That is real readiness. 🔥</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}