import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Award, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';

export default function IncubateHerCompletion() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', user?.email],
    queryFn: async () => {
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
      return enrollments[0];
    },
    enabled: !!user?.email
  });

  const milestones = [
    {
      id: 'attendance',
      title: 'Session Attendance',
      description: 'Attend all required program sessions',
      completed: enrollment?.attendance_complete || false,
      required: true
    },
    {
      id: 'pre_assessment',
      title: 'Pre-Assessment',
      description: 'Complete the pre-program assessment',
      completed: enrollment?.pre_assessment_completed || false,
      required: true
    },
    {
      id: 'consultation',
      title: 'One-on-One Consultation',
      description: 'Complete your personalized consultation',
      completed: enrollment?.consultation_completed || false,
      required: true
    },
    {
      id: 'documents',
      title: 'Document Submission',
      description: 'Upload required organizational documents',
      completed: enrollment?.documents_uploaded || false,
      required: true
    },
    {
      id: 'post_assessment',
      title: 'Post-Assessment',
      description: 'Complete the post-program assessment',
      completed: enrollment?.post_assessment_completed || false,
      required: true
    }
  ];

  const completedCount = milestones.filter(m => m.completed).length;
  const totalCount = milestones.filter(m => m.required).length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  const allComplete = completedCount === totalCount;

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader 
        title="Completion Tracker"
        subtitle="Your progress toward program completion"
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="border-l-4 border-l-[#143A50]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Overall Progress</CardTitle>
              <Badge variant="outline" className="text-lg px-4 py-1">
                {completedCount} / {totalCount}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={completionPercentage} className="h-3" />
            <p className="text-sm text-slate-600">
              You have completed <strong>{completionPercentage}%</strong> of the program requirements
            </p>
          </CardContent>
        </Card>

        {allComplete && (
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Award className="w-6 h-6" />
                Congratulations! Program Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-green-800">
                You have successfully completed all requirements for the IncubateHer Funding Readiness program. Your certificate is now available!
              </p>
              <div className="flex gap-3">
                <Button className="bg-green-700 hover:bg-green-800">
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
                <Button variant="outline">
                  View Giveaway Status
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {milestones.map((milestone) => (
            <Card 
              key={milestone.id}
              className={milestone.completed ? 'bg-green-50 border-green-200' : ''}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 ${milestone.completed ? 'text-green-600' : 'text-slate-300'}`}>
                    {milestone.completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {milestone.title}
                      {milestone.required && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Required
                        </Badge>
                      )}
                    </h3>
                    <p className="text-slate-600 text-sm">{milestone.description}</p>
                  </div>
                  {milestone.completed && (
                    <Badge className="bg-green-600">
                      Complete
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            {!allComplete ? (
              <div className="space-y-2">
                <p className="text-slate-700 mb-3">To complete the program, you still need to:</p>
                <ul className="space-y-2">
                  {milestones
                    .filter(m => !m.completed && m.required)
                    .map(m => (
                      <li key={m.id} className="flex items-start gap-2 text-slate-600">
                        <span className="text-[#E5C089] mt-1">•</span>
                        <span>{m.title}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ) : (
              <p className="text-slate-700">
                Check the Giveaway page to see your eligibility status for the funding opportunity drawing.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <CoBrandedFooter />
    </div>
  );
}