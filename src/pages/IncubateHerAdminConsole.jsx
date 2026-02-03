import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { Settings, Download, Gift, Users, FileText, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function IncubateHerAdminConsole() {
  const queryClient = useQueryClient();

  const { data: cohort } = useQuery({
    queryKey: ['admin-cohort'],
    queryFn: async () => {
      const cohorts = await base44.entities.ProgramCohort.filter({
        program_code: 'incubateher_funding_readiness'
      });
      return cohorts[0];
    }
  });

  const { data: enrollments } = useQuery({
    queryKey: ['admin-enrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.list()
  });

  const { data: eligiblePool } = useQuery({
    queryKey: ['eligible-pool'],
    queryFn: () => base44.entities.GiveawayEligiblePool.list()
  });

  const toggleGiveawayMutation = useMutation({
    mutationFn: async (revealed) => {
      return await base44.entities.ProgramCohort.update(cohort.id, {
        giveaway_revealed: revealed
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-cohort']);
      toast.success('Giveaway visibility updated');
    }
  });

  const drawWinnerMutation = useMutation({
    mutationFn: async () => {
      // Get eligible participants
      const eligible = enrollments.filter(e => e.giveaway_eligible);
      
      if (eligible.length === 0) {
        throw new Error('No eligible participants');
      }

      // Random selection
      const winner = eligible[Math.floor(Math.random() * eligible.length)];
      
      // Create winner record
      await base44.entities.GiveawayWinner.create({
        cohort_id: cohort.id,
        enrollment_id: winner.id,
        participant_email: winner.participant_email,
        participant_name: winner.participant_name,
        draw_timestamp: new Date().toISOString(),
        drawn_by: 'admin@example.com', // TODO: Get from logged-in user
        prize_description: cohort.giveaway_prize_description
      });

      // Update enrollment
      await base44.entities.ProgramEnrollment.update(winner.id, {
        giveaway_winner: true
      });

      return winner;
    },
    onSuccess: (winner) => {
      queryClient.invalidateQueries(['admin-enrollments']);
      toast.success(`Winner selected: ${winner.participant_name}`);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const exportAttendance = async () => {
    toast.info('Export functionality requires backend function');
  };

  const exportAssessments = async () => {
    toast.info('Export functionality requires backend function');
  };

  const exportMetrics = async () => {
    toast.info('Export functionality requires backend function');
  };

  const completedCount = enrollments?.filter(e => e.program_completed).length || 0;
  const totalEnrolled = enrollments?.length || 0;
  const eligibleCount = enrollments?.filter(e => e.giveaway_eligible).length || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader 
        title="Admin Console"
        subtitle="Program management and operations"
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Enrolled</p>
                  <p className="text-3xl font-bold text-[#143A50]">{totalEnrolled}</p>
                </div>
                <Users className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{completedCount}</p>
                </div>
                <Award className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-[#AC1A5B]">
                    {totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0}%
                  </p>
                </div>
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Giveaway Eligible</p>
                  <p className="text-3xl font-bold text-[#E5C089]">{eligibleCount}</p>
                </div>
                <Gift className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="settings">
          <TabsList>
            <TabsTrigger value="settings">Program Settings</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
            <TabsTrigger value="giveaway">Giveaway Management</TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Program Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Program Name</label>
                  <Input value={cohort?.program_name || ''} disabled />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Program Code</label>
                  <Input value={cohort?.program_code || ''} disabled />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Giveaway Revealed to Participants</p>
                    <p className="text-sm text-slate-600">Toggle visibility of giveaway page</p>
                  </div>
                  <Switch
                    checked={cohort?.giveaway_revealed || false}
                    onCheckedChange={(checked) => toggleGiveawayMutation.mutate(checked)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Giveaway Prize Description</label>
                  <Input 
                    value={cohort?.giveaway_prize_description || ''} 
                    placeholder="Enter prize description..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exports Tab */}
          <TabsContent value="exports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Attendance Report</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Export attendance records for all sessions (no PII for CUL view)
                  </p>
                  <Button onClick={exportAttendance} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Attendance
                  </Button>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Assessment Summary</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Aggregate pre/post assessment scores and deltas
                  </p>
                  <Button onClick={exportAssessments} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Assessments
                  </Button>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Completion Metrics</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Completion rates, consultation counts, document submission rates
                  </p>
                  <Button onClick={exportMetrics} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Metrics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Giveaway Tab */}
          <TabsContent value="giveaway">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Giveaway Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-900">
                    <strong>Important:</strong> Federal grants are excluded. Only eligible participants who completed all requirements can win.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Eligible Pool ({eligibleCount} participants)</h4>
                  <div className="space-y-2">
                    {enrollments?.filter(e => e.giveaway_eligible).map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <p className="font-medium">{enrollment.participant_name}</p>
                          <p className="text-sm text-slate-600">{enrollment.participant_email}</p>
                        </div>
                        {enrollment.giveaway_winner && (
                          <Badge className="bg-yellow-500">Winner</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {eligibleCount > 0 && !enrollments?.some(e => e.giveaway_winner) && (
                  <Button
                    onClick={() => drawWinnerMutation.mutate()}
                    size="lg"
                    className="w-full bg-[#E5C089] hover:bg-[#d4af78] text-[#143A50]"
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    Draw Random Winner
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CoBrandedFooter />
    </div>
  );
}