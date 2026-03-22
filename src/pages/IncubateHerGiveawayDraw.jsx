import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Gift, Trophy, Users, Shuffle, CheckCircle2, AlertCircle, Eye, EyeOff, Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function IncubateHerGiveawayDraw() {
  const queryClient = useQueryClient();
  const [winner, setWinner] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: cohort } = useQuery({
    queryKey: ['incubateher-cohort'],
    queryFn: async () => {
      const cohorts = await base44.entities.ProgramCohort.filter({
        program_code: 'incubateher_funding_readiness'
      });
      return cohorts[0];
    }
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['giveaway-applications'],
    queryFn: () => base44.entities.GiveawayEligiblePool.list(),
  });

  const { data: existingWinners = [] } = useQuery({
    queryKey: ['giveaway-winners'],
    queryFn: () => base44.entities.GiveawayWinner.list(),
  });

  // Toggle giveaway reveal on the cohort
  const toggleRevealMutation = useMutation({
    mutationFn: async (reveal) => {
      await base44.entities.ProgramCohort.update(cohort.id, {
        giveaway_revealed: reveal,
        giveaway_enabled: true
      });
    },
    onSuccess: (_, reveal) => {
      queryClient.invalidateQueries(['incubateher-cohort']);
      toast.success(reveal ? 'Giveaway revealed to participants!' : 'Giveaway hidden from participants.');
    }
  });

  // Randomly draw a winner from submitted applications
  const handleDraw = () => {
    const eligible = applications.filter(a => a.status !== 'disqualified');
    if (eligible.length === 0) {
      toast.error('No eligible applications to draw from.');
      return;
    }
    setIsDrawing(true);
    // Animate for suspense
    let count = 0;
    const interval = setInterval(() => {
      const random = eligible[Math.floor(Math.random() * eligible.length)];
      setWinner(random);
      count++;
      if (count >= 20) {
        clearInterval(interval);
        const finalWinner = eligible[Math.floor(Math.random() * eligible.length)];
        setWinner(finalWinner);
        setIsDrawing(false);
        setConfirmed(false);
      }
    }, 80);
  };

  // Confirm and save the winner
  const confirmWinnerMutation = useMutation({
    mutationFn: async () => {
      // Save to GiveawayWinner
      await base44.entities.GiveawayWinner.create({
        cohort_id: cohort?.id || '',
        enrollment_id: winner.enrollment_id,
        participant_email: winner.participant_email,
        participant_name: winner.participant_name,
        draw_timestamp: new Date().toISOString(),
        drawn_by: user?.email,
        prize_description: cohort?.giveaway_prize_description || '',
        admin_notes: adminNotes,
        winner_contacted: false,
        prize_accepted: false
      });

      // Update enrollment
      if (winner.enrollment_id) {
        await base44.entities.ProgramEnrollment.update(winner.enrollment_id, {
          giveaway_winner: true
        });
      }

      // Notify winner by email
      await base44.integrations.Core.SendEmail({
        to: winner.participant_email,
        subject: '🎉 Congratulations! You Won the IncubateHer Giveaway!',
        body: `Dear ${winner.participant_name},\n\nCongratulations! You have been selected as the winner of the IncubateHer Program Giveaway!\n\nPrize: ${cohort?.giveaway_prize_description || 'Comprehensive grant writing support'}\n\nAn EIS team member will contact you within 48 hours to get started. Please check your portal for more details.\n\nThank you for your dedication and participation in the IncubateHer program.\n\nWarm regards,\nElbert Innovative Solutions Team`
      });

      // Notify all active cohort participants
      const allEnrollments = await base44.entities.ProgramEnrollment.filter({
        cohort_id: cohort?.id || '',
        role: 'participant'
      });
      const activeParticipants = allEnrollments.filter(e => e.enrollment_status !== 'withdrawn' && e.enrollment_status !== 'inactive');
      await Promise.all(
        activeParticipants
          .filter(e => e.participant_email !== winner.participant_email)
          .map(e =>
            base44.integrations.Core.SendEmail({
              to: e.participant_email,
              subject: '🏆 IncubateHer Giveaway Winner Announced!',
              body: `Dear ${e.participant_name || 'Participant'},\n\nWe are excited to announce that ${winner.participant_name} has been selected as the winner of the IncubateHer Program Giveaway!\n\nThank you to everyone who participated. Your dedication to building your funding readiness is truly inspiring.\n\nLog in to your portal to see the winner announcement on your dashboard.\n\nWarm regards,\nElbert Innovative Solutions Team`
            })
          )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['giveaway-winners']);
      setConfirmed(true);
      toast.success(`Winner confirmed! ${winner.participant_name} has been notified.`);
    }
  });

  const alreadyHasWinner = existingWinners.length > 0;
  const eligibleCount = applications.filter(a => a.status !== 'disqualified').length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-[#AC1A5B]" />
          <div>
            <h1 className="text-2xl font-bold text-[#143A50]">Giveaway Draw</h1>
            <p className="text-sm text-slate-500">Manage applications and draw a winner</p>
          </div>
        </div>

        {/* Giveaway Reveal Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {cohort?.giveaway_revealed ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              Giveaway Visibility
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">
                {cohort?.giveaway_revealed
                  ? 'Participants can see the giveaway page and submit applications.'
                  : 'Giveaway is hidden. Participants see a "Coming Soon" message.'}
              </p>
            </div>
            <Button
              variant={cohort?.giveaway_revealed ? 'outline' : 'default'}
              className={cohort?.giveaway_revealed ? 'border-red-300 text-red-600 hover:bg-red-50' : 'bg-[#143A50] hover:bg-[#1E4F58] text-white'}
              onClick={() => toggleRevealMutation.mutate(!cohort?.giveaway_revealed)}
              disabled={!cohort || toggleRevealMutation.isPending}
            >
              {cohort?.giveaway_revealed ? 'Hide Giveaway' : 'Reveal Giveaway to Participants'}
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 text-center">
              <Users className="w-6 h-6 text-[#143A50] mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#143A50]">{applications.length}</p>
              <p className="text-xs text-slate-500">Total Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-600">{eligibleCount}</p>
              <p className="text-xs text-slate-500">Eligible to Draw</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <Trophy className="w-6 h-6 text-[#AC1A5B] mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#AC1A5B]">{existingWinners.length}</p>
              <p className="text-xs text-slate-500">Winners Drawn</p>
            </CardContent>
          </Card>
        </div>

        {/* Previous Winners */}
        {alreadyHasWinner && (
          <Card className="border-2 border-yellow-400 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Trophy className="w-5 h-5" /> Previous Winner(s)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {existingWinners.map((w) => (
                <div key={w.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-yellow-200">
                  <div>
                    <p className="font-semibold text-slate-900">{w.participant_name}</p>
                    <p className="text-sm text-slate-500">{w.participant_email}</p>
                    <p className="text-xs text-slate-400">Drawn: {w.draw_timestamp ? format(new Date(w.draw_timestamp), 'MMM d, yyyy h:mm a') : 'N/A'} by {w.drawn_by}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge className={w.winner_contacted ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}>
                      {w.winner_contacted ? 'Contacted' : 'Not Contacted'}
                    </Badge>
                    <Badge className={w.prize_accepted ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}>
                      {w.prize_accepted ? 'Prize Accepted' : 'Pending Acceptance'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Draw Section */}
        <Card className="border-2 border-[#AC1A5B]/30">
          <CardHeader className="bg-gradient-to-r from-[#AC1A5B] to-[#A65D40] text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5" /> Random Draw
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {eligibleCount === 0 ? (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>No eligible applications yet. Participants need to submit their giveaway applications first.</AlertDescription>
              </Alert>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  <strong>{eligibleCount}</strong> eligible applicant(s) in the pool. Click the button below to randomly draw a winner.
                </p>

                {/* Winner Display */}
                {winner && (
                  <div className={`rounded-xl border-2 p-6 text-center transition-all ${isDrawing ? 'border-[#E5C089] bg-[#E5C089]/10 animate-pulse' : 'border-green-400 bg-green-50'}`}>
                    <Gift className={`w-12 h-12 mx-auto mb-3 ${isDrawing ? 'text-[#E5C089]' : 'text-green-600'}`} />
                    <p className="text-2xl font-bold text-slate-900">{winner.participant_name}</p>
                    <p className="text-slate-500">{winner.participant_email}</p>
                    {!isDrawing && (
                      <div className="mt-3 text-left bg-white rounded-lg p-3 border border-green-200 text-sm space-y-1">
                        <p><span className="font-medium">Sessions attended:</span> {winner.sessions_attended_live || '—'}</p>
                        <p><span className="font-medium">Videos watched:</span> {winner.videos_watched || '—'}</p>
                        <p><span className="font-medium">Workbook:</span> {winner.workbook_percent ? `${winner.workbook_percent}%` : '—'}</p>
                        <p><span className="font-medium">Documents:</span> {winner.has_documents ? 'Yes' : 'No'}</p>
                        {winner.additional_notes && <p><span className="font-medium">Notes:</span> {winner.additional_notes}</p>}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full bg-[#AC1A5B] hover:bg-[#8e1549] text-white"
                  onClick={handleDraw}
                  disabled={isDrawing}
                >
                  <Shuffle className="w-5 h-5 mr-2" />
                  {isDrawing ? 'Drawing...' : winner ? 'Draw Again' : 'Draw a Winner'}
                </Button>

                {/* Confirm Section */}
                {winner && !isDrawing && !confirmed && (
                  <div className="space-y-3 border-t pt-4">
                    <p className="text-sm font-semibold text-slate-700">Confirm this winner?</p>
                    <Textarea
                      placeholder="Admin notes (optional) — e.g. tie-breaking rationale, special circumstances"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => confirmWinnerMutation.mutate()}
                        disabled={confirmWinnerMutation.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {confirmWinnerMutation.isPending ? 'Saving...' : 'Confirm & Notify Winner'}
                      </Button>
                      <Button variant="outline" onClick={handleDraw} disabled={isDrawing}>
                        <Shuffle className="w-4 h-4 mr-2" /> Re-draw
                      </Button>
                    </div>
                  </div>
                )}

                {confirmed && (
                  <Alert className="border-green-400 bg-green-50">
                    <Mail className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Winner confirmed and notified by email! Update their contact/prize status in the winners list above.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* All Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" /> All Applications ({applications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No applications submitted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-500 text-left">
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2 pr-4">Sessions</th>
                      <th className="pb-2 pr-4">Videos</th>
                      <th className="pb-2 pr-4">Workbook</th>
                      <th className="pb-2 pr-4">Docs</th>
                      <th className="pb-2">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="py-2 pr-4">
                          <p className="font-medium text-slate-900">{app.participant_name}</p>
                          <p className="text-xs text-slate-400">{app.participant_email}</p>
                        </td>
                        <td className="py-2 pr-4 text-slate-700">{app.sessions_attended_live || '—'}</td>
                        <td className="py-2 pr-4 text-slate-700">{app.videos_watched || '—'}</td>
                        <td className="py-2 pr-4 text-slate-700">{app.workbook_percent ? `${app.workbook_percent}%` : '—'}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={app.has_documents ? 'default' : 'secondary'} className="text-xs">
                            {app.has_documents ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                        <td className="py-2 text-xs text-slate-400">
                          {app.applied_date ? format(new Date(app.applied_date), 'MMM d') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}