import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Users, Calendar, Download, Eye, Edit, Trash2, CheckCircle2, XCircle, TrendingUp, Bell } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';
import AssessmentDetailModal from '@/components/incubateher/AssessmentDetailModal';
import SurveyBuilder from '@/components/incubateher/SurveyBuilder';
import EvaluationEditorModal from '@/components/admin/EvaluationEditorModal';

export default function AssessmentSurveyAdmin() {
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedParticipantName, setSelectedParticipantName] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all assessment types
  const { data: grantWritingAssessments = [] } = useQuery({
    queryKey: ['all-grant-assessments'],
    queryFn: () => base44.entities.GrantWritingAssessment.list('-assessment_date')
  });

  const { data: eventSurveys = [] } = useQuery({
    queryKey: ['all-event-surveys'],
    queryFn: () => base44.entities.EventSurveyResponse.list('-submitted_date')
  });

  const { data: competencyAssessments = [] } = useQuery({
    queryKey: ['all-competency-assessments'],
    queryFn: () => base44.entities.CompetencyAssessment.list('-created_date')
  });

  const { data: coachIntakes = [] } = useQuery({
    queryKey: ['all-coach-intakes'],
    queryFn: () => base44.entities.CoachIntakeAssessment.list('-created_date')
  });

  const { data: readinessAssessments = [] } = useQuery({
    queryKey: ['all-readiness-assessments'],
    queryFn: () => base44.entities.FundingReadinessAssessment.list('-created_date')
  });

  const updateGrantAssessmentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GrantWritingAssessment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-grant-assessments']);
      toast.success('Assessment updated');
      setSelectedAssessment(null);
      setEditMode(false);
    }
  });

  const deleteGrantAssessmentMutation = useMutation({
    mutationFn: (id) => base44.entities.GrantWritingAssessment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-grant-assessments']);
      toast.success('Assessment deleted');
      setSelectedAssessment(null);
    }
  });

  const handleExportCSV = (data, filename) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const preAssessments = grantWritingAssessments.filter(a => a.assessment_type === 'pre');
  const postAssessments = grantWritingAssessments.filter(a => a.assessment_type === 'post');

  // IncubateHer / AccelerateHer program assessments
  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-program-enrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.filter({ role: 'participant' })
  });

  const { data: programAssessments = [] } = useQuery({
    queryKey: ['all-program-assessments'],
    queryFn: () => base44.entities.ProgramAssessment.list('-created_date')
  });

  const totalParticipants = enrollments.length;
  const incubatePre = programAssessments.filter(a => a.assessment_type === 'pre');
  const incubatePost = programAssessments.filter(a => a.assessment_type === 'post');
  const incubateEval = programAssessments.filter(a => a.assessment_type === 'evaluation');

  const sendPreAssessmentReminders = async () => {
    setSendingReminder(true);
    const nonCompleters = enrollments.filter(e => !incubatePre.find(a => a.participant_email === e.participant_email));
    await base44.functions.invoke('incubateHerEmailNotifications', {
      notification_type: 'pre_assessment_reminder',
      participants: nonCompleters.map(e => ({ email: e.participant_email, name: e.participant_name }))
    });
    setSendingReminder(false);
    toast.success(`Reminders sent to ${nonCompleters.length} participant(s) who haven't completed the pre-assessment.`);
  };

  const preRate = totalParticipants > 0 ? Math.round((incubatePre.length / totalParticipants) * 100) : 0;
  const postRate = totalParticipants > 0 ? Math.round((incubatePost.length / totalParticipants) * 100) : 0;
  const evalRate = totalParticipants > 0 ? Math.round((incubateEval.length / totalParticipants) * 100) : 0;

  const avgPre = incubatePre.length > 0 ? Math.round(incubatePre.reduce((s, a) => s + (a.total_score || 0), 0) / incubatePre.length) : 0;
  const avgPost = incubatePost.length > 0 ? Math.round(incubatePost.reduce((s, a) => s + (a.total_score || 0), 0) / incubatePost.length) : 0;
  const avgEvalRating = incubateEval.length > 0
    ? (incubateEval.reduce((s, a) => s + (a.responses?.overall_rating || 0), 0) / incubateEval.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Assessment & Survey Management</h1>
            <p className="text-slate-600">View, edit, and manage all assessments and surveys</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Training Assessments</p>
                  <p className="text-2xl font-bold text-slate-900">{grantWritingAssessments.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Event Surveys</p>
                  <p className="text-2xl font-bold text-slate-900">{eventSurveys.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Competency Assessments</p>
                  <p className="text-2xl font-bold text-slate-900">{competencyAssessments.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Readiness Assessments</p>
                  <p className="text-2xl font-bold text-slate-900">{readinessAssessments.length}</p>
                </div>
                <FileText className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="incubateher">
          <TabsList className="flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="incubateher">IncubateHer Program</TabsTrigger>
            <TabsTrigger value="training">Training Pre/Post</TabsTrigger>
            <TabsTrigger value="events">Event Surveys</TabsTrigger>
            <TabsTrigger value="competency">Competency</TabsTrigger>
            <TabsTrigger value="readiness">Readiness</TabsTrigger>
            <TabsTrigger value="coach">Coach Intakes</TabsTrigger>
            <TabsTrigger value="builder">Survey Builder</TabsTrigger>
          </TabsList>

          {/* IncubateHer Program Tab */}
          <TabsContent value="incubateher" className="mt-6">
            {/* Completion Rate Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Pre-Assessment', count: incubatePre.length, rate: preRate, avg: avgPre, color: 'blue', avgLabel: 'Avg Score' },
                { label: 'Post-Assessment', count: incubatePost.length, rate: postRate, avg: avgPost, color: 'green', avgLabel: 'Avg Score' },
                { label: 'Program Evaluation', count: incubateEval.length, rate: evalRate, avg: avgEvalRating, color: 'purple', avgLabel: 'Avg Rating (/10)' },
              ].map(({ label, count, rate, avg, color, avgLabel }) => (
                <Card key={label}>
                  <CardContent className="pt-5">
                    <p className="text-sm font-semibold text-slate-700 mb-3">{label}</p>
                    <div className="flex items-end gap-3 mb-3">
                      <p className="text-4xl font-bold" style={{ color: color === 'blue' ? '#3b82f6' : color === 'green' ? '#22c55e' : '#a855f7' }}>
                        {rate}%
                      </p>
                      <p className="text-sm text-slate-500 mb-1">{count} / {totalParticipants} participants</p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${rate}%`, backgroundColor: color === 'blue' ? '#3b82f6' : color === 'green' ? '#22c55e' : '#a855f7' }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">{avgLabel}: <span className="font-semibold text-slate-700">{avg}</span></p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Growth Indicator */}
            {incubatePre.length > 0 && incubatePost.length > 0 && (
              <Card className="mb-6 bg-slate-900 text-white">
                <CardContent className="pt-5 flex items-center justify-center gap-10">
                  <div className="text-center">
                    <p className="text-sm text-slate-400 mb-1">Pre-Assessment Avg</p>
                    <p className="text-4xl font-bold">{avgPre}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-yellow-400" />
                  <div className="text-center">
                    <p className="text-sm text-slate-400 mb-1">Post-Assessment Avg</p>
                    <p className="text-4xl font-bold text-green-400">{avgPost}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400 mb-1">Growth</p>
                    <p className="text-4xl font-bold text-yellow-400">+{avgPost - avgPre}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Per-participant table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                     <CardTitle>Per-Participant Breakdown</CardTitle>
                     <div className="flex gap-2 flex-wrap">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={sendPreAssessmentReminders}
                       disabled={sendingReminder}
                       className="border-amber-400 text-amber-700 hover:bg-amber-50"
                     >
                       <Bell className="w-4 h-4 mr-1" />
                       {sendingReminder ? 'Sending...' : `Remind Non-Completers (${enrollments.filter(e => !incubatePre.find(a => a.participant_email === e.participant_email)).length})`}
                     </Button>
                     <Button variant="outline" size="sm" onClick={() => {
                    const rows = enrollments.map(e => {
                      const pre = incubatePre.find(a => a.participant_email === e.participant_email);
                      const post = incubatePost.find(a => a.participant_email === e.participant_email);
                      const ev = incubateEval.find(a => a.participant_email === e.participant_email);
                      return {
                        name: e.participant_name,
                        email: e.participant_email,
                        pre_score: pre?.total_score || '',
                        post_score: post?.total_score || '',
                        growth: (pre && post) ? (post.total_score - pre.total_score) : '',
                        eval_rating: ev?.responses?.overall_rating || '',
                      };
                    });
                    handleExportCSV(rows, 'incubateher-assessments.csv');
                  }}>
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                    </div>
                    </div>
                    </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-slate-600 font-medium">Participant</th>
                        <th className="text-center py-2 px-3 text-slate-600 font-medium">Pre-Assessment</th>
                        <th className="text-center py-2 px-3 text-slate-600 font-medium">Post-Assessment</th>
                        <th className="text-center py-2 px-3 text-slate-600 font-medium">Growth</th>
                        <th className="text-center py-2 px-3 text-slate-600 font-medium">Evaluation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((e) => {
                        const pre = incubatePre.find(a => a.participant_email === e.participant_email);
                        const post = incubatePost.find(a => a.participant_email === e.participant_email);
                        const ev = incubateEval.find(a => a.participant_email === e.participant_email);
                        const growth = (pre && post) ? post.total_score - pre.total_score : null;
                        return (
                          <tr key={e.id} className="border-b hover:bg-slate-50">
                            <td className="py-2 px-3">
                              <p className="font-medium text-slate-800">{e.participant_name}</p>
                              <p className="text-xs text-slate-500">{e.participant_email}</p>
                            </td>
                            <td className="py-2 px-3 text-center">
                              {pre ? (
                                <button onClick={() => { setSelectedAssessment(pre); setSelectedParticipantName(e.participant_name); }}>
                                  <Badge className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200">{pre.total_score} pts <Eye className="w-3 h-3 inline ml-1" /></Badge>
                                </button>
                              ) : (
                                <button onClick={() => {
                                  // Show a placeholder with any jotform-inferred data
                                  setSelectedAssessment({
                                    assessment_type: 'pre',
                                    participant_email: e.participant_email,
                                    prefilled: true,
                                    responses: {},
                                    total_score: null,
                                    jotform_data: e.jotform_data
                                  });
                                  setSelectedParticipantName(e.participant_name);
                                }}>
                                  <Badge className="bg-slate-100 text-slate-500 cursor-pointer hover:bg-slate-200 text-xs">Not submitted <Eye className="w-3 h-3 inline ml-1" /></Badge>
                                </button>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {post ? (
                                <button onClick={() => { setSelectedAssessment(post); setSelectedParticipantName(e.participant_name); }}>
                                  <Badge className="bg-green-100 text-green-800 cursor-pointer hover:bg-green-200">{post.total_score} pts <Eye className="w-3 h-3 inline ml-1" /></Badge>
                                </button>
                              ) : (
                                <button onClick={() => {
                                  setSelectedAssessment({
                                    assessment_type: 'post',
                                    participant_email: e.participant_email,
                                    prefilled: true,
                                    responses: {},
                                    total_score: null
                                  });
                                  setSelectedParticipantName(e.participant_name);
                                }}>
                                  <Badge className="bg-slate-100 text-slate-500 cursor-pointer hover:bg-slate-200 text-xs">Not submitted <Eye className="w-3 h-3 inline ml-1" /></Badge>
                                </button>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {growth !== null ? (
                                <span className={`font-bold text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  {growth >= 0 ? '+' : ''}{growth}
                                </span>
                              ) : <span className="text-slate-300">—</span>}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {ev ? (
                                <button onClick={() => { setSelectedAssessment(ev); setSelectedParticipantName(e.participant_name); }}>
                                  <Badge className="bg-purple-100 text-purple-800 cursor-pointer hover:bg-purple-200">{ev.responses?.overall_rating || '?'}/10 <Eye className="w-3 h-3 inline ml-1" /></Badge>
                                </button>
                              ) : (
                                <button onClick={() => {
                                  setSelectedAssessment({
                                    assessment_type: 'evaluation',
                                    participant_email: e.participant_email,
                                    prefilled: true,
                                    responses: {}
                                  });
                                  setSelectedParticipantName(e.participant_name);
                                }}>
                                  <Badge className="bg-slate-100 text-slate-500 cursor-pointer hover:bg-slate-200 text-xs">Not submitted <Eye className="w-3 h-3 inline ml-1" /></Badge>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {enrollments.length === 0 && (
                    <p className="text-center text-slate-400 py-8">No participants found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Training Pre/Post Assessments</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCSV(grantWritingAssessments.map(a => ({
                      email: a.user_email,
                      name: a.user_name,
                      type: a.assessment_type,
                      date: a.assessment_date,
                      completed: a.completed
                    })), 'training-assessments.csv')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="font-semibold mb-3">Pre-Assessments ({preAssessments.length})</h3>
                    <div className="space-y-2">
                      {preAssessments.slice(0, 10).map((assessment) => (
                        <div key={assessment.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{assessment.user_name}</p>
                              <p className="text-sm text-slate-600">{assessment.user_email}</p>
                              <p className="text-xs text-slate-500">{moment(assessment.assessment_date).format('MMM D, YYYY')}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setSelectedAssessment(assessment)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                setSelectedAssessment(assessment);
                                setEditMode(true);
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Post-Assessments ({postAssessments.length})</h3>
                    <div className="space-y-2">
                      {postAssessments.slice(0, 10).map((assessment) => (
                        <div key={assessment.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{assessment.user_name}</p>
                              <p className="text-sm text-slate-600">{assessment.user_email}</p>
                              <p className="text-xs text-slate-500">{moment(assessment.assessment_date).format('MMM D, YYYY')}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setSelectedAssessment(assessment)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                setSelectedAssessment(assessment);
                                setEditMode(true);
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-slate-900 mb-2">Program Evaluations</h3>
                  <p className="text-sm text-slate-600 mb-4">Edit the IncubateHer program evaluation form questions and options.</p>
                  <EvaluationEditorModal />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Event Survey Responses</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCSV(eventSurveys.map(s => ({
                      email: s.user_email,
                      name: s.user_name,
                      event_id: s.event_id,
                      rating: s.overall_rating,
                      date: s.submitted_date
                    })), 'event-surveys.csv')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {eventSurveys.map((survey) => (
                  <div key={survey.id} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{survey.user_name}</p>
                        <p className="text-sm text-slate-600">{survey.user_email}</p>
                        <p className="text-xs text-slate-500">{moment(survey.submitted_date).format('MMM D, YYYY')}</p>
                        <Badge className="mt-2">Rating: {survey.overall_rating}/5</Badge>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setSelectedAssessment(survey)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competency" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Consultant Competency Assessments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {competencyAssessments.map((assessment) => (
                  <div key={assessment.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{assessment.assessment_title}</p>
                        <p className="text-sm text-slate-600">{assessment.consultant_email}</p>
                        <Badge className="mt-2">{assessment.status}</Badge>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setSelectedAssessment(assessment)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="readiness" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle>Funding Readiness Assessments</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleExportCSV(readinessAssessments.map(a => ({
                    email: a.user_email,
                    score: a.overall_score,
                    level: a.readiness_level,
                    legal_status: a.legal_status,
                    financial_records: a.financial_records,
                    program_clarity: a.program_clarity,
                    capacity: a.capacity,
                    date: a.assessment_date,
                    notes: a.notes,
                  })), 'readiness-assessments.csv')}>
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {readinessAssessments.length === 0 && (
                  <p className="text-center text-slate-400 py-8">No readiness assessments on file.</p>
                )}
                {readinessAssessments.map((assessment) => (
                  <div key={assessment.id} className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{assessment.user_email}</p>
                        {assessment.assessment_date && (
                          <p className="text-xs text-slate-500">{moment(assessment.assessment_date).format('MMM D, YYYY')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {assessment.readiness_level && (
                          <Badge className={{
                            highly_ready: 'bg-green-100 text-green-800',
                            ready: 'bg-blue-100 text-blue-800',
                            building_readiness: 'bg-amber-100 text-amber-800',
                            not_ready: 'bg-red-100 text-red-800',
                          }[assessment.readiness_level] || 'bg-slate-100 text-slate-700'}>
                            {assessment.readiness_level?.replace(/_/g, ' ')}
                          </Badge>
                        )}
                        <Badge className="bg-amber-200 text-amber-900 font-bold">{assessment.overall_score ?? '—'}%</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {[
                        { label: 'Legal Status', value: assessment.legal_status },
                        { label: 'Financial Records', value: assessment.financial_records },
                        { label: 'Program Clarity', value: assessment.program_clarity },
                        { label: 'Capacity', value: assessment.capacity },
                      ].map(({ label, value }) => value ? (
                        <div key={label} className="bg-white rounded-lg px-3 py-2 border border-amber-100">
                          <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                          <p className="font-medium text-slate-800 capitalize">{value.replace(/_/g, ' ')}</p>
                        </div>
                      ) : null)}
                    </div>
                    {assessment.notes && (
                      <div className="bg-white rounded-lg px-3 py-2 border border-amber-100 text-sm">
                        <p className="text-xs text-slate-500 mb-0.5">Notes</p>
                        <p className="text-slate-700">{assessment.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builder" className="mt-6">
            <SurveyBuilder />
          </TabsContent>

          <TabsContent value="coach" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Coach Intake Assessments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {coachIntakes.map((intake) => (
                  <div key={intake.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{intake.coach_email}</p>
                        <p className="text-sm text-slate-600">{moment(intake.created_date).format('MMM D, YYYY')}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setSelectedAssessment(intake)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* IncubateHer assessment modal — shown when assessment has assessment_type of pre/post/evaluation */}
        {selectedAssessment && ['pre', 'post', 'evaluation'].includes(selectedAssessment.assessment_type) && (
          <AssessmentDetailModal
            assessment={selectedAssessment}
            participantName={selectedParticipantName}
            onClose={() => { setSelectedAssessment(null); setSelectedParticipantName(null); }}
          />
        )}

        {/* Generic modal for other assessment types (training, coach, etc.) */}
        {selectedAssessment && !['pre', 'post', 'evaluation'].includes(selectedAssessment.assessment_type) && (
          <Dialog open onOpenChange={() => {
            setSelectedAssessment(null);
            setEditMode(false);
          }}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editMode ? 'Edit Assessment' : 'Assessment Details'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <pre className="text-xs bg-slate-50 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(selectedAssessment, null, 2)}
                </pre>
                {editMode && (
                  <div className="space-y-4">
                    <div>
                      <Label>Notes/Comments</Label>
                      <Textarea
                        defaultValue={selectedAssessment.reviewer_notes || ''}
                        rows={4}
                        id="notes"
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this assessment?')) {
                            deleteGrantAssessmentMutation.mutate(selectedAssessment.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                        <Button onClick={() => {
                          const notes = document.getElementById('notes').value;
                          updateGrantAssessmentMutation.mutate({ id: selectedAssessment.id, data: { reviewer_notes: notes } });
                        }}>Save Changes</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}