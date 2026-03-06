import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import {
  CheckCircle2, XCircle, Clock, BookOpen, FileText,
  Calendar, MessageSquare, BarChart2, Activity, User, TrendingUp
} from 'lucide-react';

const StatusIcon = ({ done }) => done
  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: BRAND_COLORS.eisGold }} />
  : <XCircle className="w-4 h-4 flex-shrink-0 text-slate-300" />;

export default function ParticipantActivityDetail({ enrollment }) {
  const email = enrollment?.participant_email;

  const { data: assessments = [] } = useQuery({
    queryKey: ['participant-assessments', email],
    queryFn: () => base44.entities.ProgramAssessment.filter({ participant_email: email }),
    enabled: !!email
  });

  const { data: workbookResponses = [] } = useQuery({
    queryKey: ['participant-workbook', email],
    queryFn: () => base44.entities.WorkbookResponse.filter({ created_by: email }),
    enabled: !!email
  });

  const { data: docSubmissions = [] } = useQuery({
    queryKey: ['participant-docs', email],
    queryFn: () => base44.entities.DocumentSubmission.filter({ participant_email: email }),
    enabled: !!email
  });

  const { data: consultations = [] } = useQuery({
    queryKey: ['participant-consultations', email],
    queryFn: () => base44.entities.ConsultationBooking.filter({ participant_email: email }),
    enabled: !!email
  });

  const preAssessment = assessments.find(a => a.assessment_type === 'pre');
  const postAssessment = assessments.find(a => a.assessment_type === 'post');
  const evaluation = assessments.find(a => a.assessment_type === 'evaluation');

  const attendedSessions = enrollment?.attendance_sessions || [];
  const completedWorkbookPages = workbookResponses.filter(r => r.completed).length;

  // Derive score label
  const getReadinessLabel = (score) => {
    if (!score) return null;
    if (score >= 80) return { label: 'High', color: '#22c55e' };
    if (score >= 50) return { label: 'Medium', color: BRAND_COLORS.eisGold };
    return { label: 'Low', color: BRAND_COLORS.culRed };
  };

  const preProfile = getReadinessLabel(preAssessment?.total_score);
  const postProfile = getReadinessLabel(postAssessment?.total_score);
  const delta = postAssessment?.total_score && preAssessment?.total_score
    ? postAssessment.total_score - preAssessment.total_score
    : null;

  return (
    <div className="space-y-4 mt-4">
      {/* Identity */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border">
        <User className="w-5 h-5" style={{ color: BRAND_COLORS.eisNavy }} />
        <div>
          <p className="font-semibold text-sm" style={{ color: BRAND_COLORS.eisNavy }}>{enrollment.participant_name}</p>
          <p className="text-xs text-slate-500">{enrollment.participant_email}</p>
          {enrollment.organization_name && (
            <p className="text-xs text-slate-400">{enrollment.organization_name}</p>
          )}
        </div>
        <div className="ml-auto flex gap-2">
          {enrollment.program_completed && (
            <Badge style={{ backgroundColor: BRAND_COLORS.eisGold, color: '#fff' }}>Program Complete</Badge>
          )}
          {enrollment.giveaway_eligible && (
            <Badge style={{ backgroundColor: BRAND_COLORS.culRed, color: '#fff' }}>Giveaway Eligible</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assessment Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: BRAND_COLORS.eisNavy }}>
              <BarChart2 className="w-4 h-4" /> Assessments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Pre-Assessment */}
            <div className="p-2 rounded bg-slate-50 border">
              <div className="flex items-center gap-2 mb-1">
                <StatusIcon done={!!preAssessment} />
                <span className="text-sm font-medium">Pre-Assessment</span>
                {preAssessment && (
                  <Badge className="ml-auto text-xs" style={{ backgroundColor: preProfile?.color, color: '#fff' }}>
                    {preAssessment.total_score} pts · {preProfile?.label}
                  </Badge>
                )}
              </div>
              {preAssessment?.created_date && (
                <p className="text-xs text-slate-400 pl-6">
                  Completed {new Date(preAssessment.created_date).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Post-Assessment */}
            <div className="p-2 rounded bg-slate-50 border">
              <div className="flex items-center gap-2 mb-1">
                <StatusIcon done={!!postAssessment} />
                <span className="text-sm font-medium">Post-Assessment</span>
                {postAssessment && (
                  <Badge className="ml-auto text-xs" style={{ backgroundColor: postProfile?.color, color: '#fff' }}>
                    {postAssessment.total_score} pts · {postProfile?.label}
                  </Badge>
                )}
              </div>
              {delta !== null && (
                <p className="text-xs pl-6" style={{ color: delta >= 0 ? '#22c55e' : BRAND_COLORS.culRed }}>
                  Growth: {delta >= 0 ? '+' : ''}{delta} points
                </p>
              )}
              {postAssessment?.created_date && (
                <p className="text-xs text-slate-400 pl-6">
                  Completed {new Date(postAssessment.created_date).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Evaluation */}
            <div className="p-2 rounded bg-slate-50 border">
              <div className="flex items-center gap-2">
                <StatusIcon done={!!evaluation} />
                <span className="text-sm font-medium">Program Evaluation</span>
                {evaluation?.responses?.overall_rating && (
                  <Badge className="ml-auto text-xs" style={{ backgroundColor: BRAND_COLORS.eisNavy, color: '#fff' }}>
                    Rating: {evaluation.responses.overall_rating}/10
                  </Badge>
                )}
              </div>
              {evaluation?.created_date && (
                <p className="text-xs text-slate-400 pl-6">
                  Submitted {new Date(evaluation.created_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Program Requirements */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: BRAND_COLORS.eisNavy }}>
              <Activity className="w-4 h-4" /> Program Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 py-1.5 border-b">
              <StatusIcon done={enrollment.pre_assessment_completed} />
              <span className="text-sm">Pre-Assessment</span>
              {enrollment.pre_assessment_date && (
                <span className="ml-auto text-xs text-slate-400">{new Date(enrollment.pre_assessment_date).toLocaleDateString()}</span>
              )}
            </div>
            <div className="flex items-center gap-2 py-1.5 border-b">
              <StatusIcon done={enrollment.attendance_complete} />
              <span className="text-sm">Session Attendance</span>
              <span className="ml-auto text-xs text-slate-500">{attendedSessions.length} session{attendedSessions.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 py-1.5 border-b">
              <StatusIcon done={enrollment.consultation_completed} />
              <span className="text-sm">1:1 Consultation</span>
              {enrollment.consultation_date && (
                <span className="ml-auto text-xs text-slate-400">{new Date(enrollment.consultation_date).toLocaleDateString()}</span>
              )}
            </div>
            <div className="flex items-center gap-2 py-1.5 border-b">
              <StatusIcon done={enrollment.documents_uploaded} />
              <span className="text-sm">Documents Uploaded</span>
              <span className="ml-auto text-xs text-slate-500">{docSubmissions.length} doc{docSubmissions.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 py-1.5">
              <StatusIcon done={enrollment.post_assessment_completed} />
              <span className="text-sm">Post-Assessment</span>
              {enrollment.post_assessment_date && (
                <span className="ml-auto text-xs text-slate-400">{new Date(enrollment.post_assessment_date).toLocaleDateString()}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workbook Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2" style={{ color: BRAND_COLORS.eisNavy }}>
            <BookOpen className="w-4 h-4" /> Workbook Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workbookResponses.length === 0 ? (
            <p className="text-sm text-slate-400">No workbook activity yet.</p>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (completedWorkbookPages / Math.max(workbookResponses.length, 1)) * 100)}%`,
                      backgroundColor: BRAND_COLORS.eisGold
                    }}
                  />
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {completedWorkbookPages} / {workbookResponses.length} pages marked complete
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {workbookResponses.slice(0, 12).map((r, i) => (
                  <div key={r.id || i} className="flex items-center gap-1.5 p-1.5 rounded border bg-slate-50 text-xs">
                    {r.completed
                      ? <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: BRAND_COLORS.eisGold }} />
                      : <Clock className="w-3 h-3 flex-shrink-0 text-slate-300" />}
                    <span className="truncate text-slate-600">{r.page_title || r.section_id || `Page ${i + 1}`}</span>
                  </div>
                ))}
                {workbookResponses.length > 12 && (
                  <div className="flex items-center justify-center p-1.5 rounded border bg-slate-50 text-xs text-slate-400">
                    +{workbookResponses.length - 12} more
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attended Sessions */}
      {attendedSessions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: BRAND_COLORS.eisNavy }}>
              <Calendar className="w-4 h-4" /> Sessions Attended ({attendedSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {attendedSessions.map((s, i) => (
                <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consultation Bookings */}
      {consultations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: BRAND_COLORS.eisNavy }}>
              <MessageSquare className="w-4 h-4" /> Consultation Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {consultations.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-2 rounded bg-slate-50 border text-xs">
                <div className="flex-1">
                  <p className="font-medium text-slate-700">{c.session_type || 'Consultation'}</p>
                  {c.scheduled_date && <p className="text-slate-400">{new Date(c.scheduled_date).toLocaleDateString()}</p>}
                </div>
                <Badge variant="outline">{c.status || 'booked'}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Document Submissions */}
      {docSubmissions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: BRAND_COLORS.eisNavy }}>
              <FileText className="w-4 h-4" /> Documents Submitted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {docSubmissions.map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-2 rounded bg-slate-50 border text-xs">
                <FileText className="w-3 h-3 text-slate-400" />
                <div className="flex-1">
                  <p className="text-slate-700">{d.document_requirement_id || 'Document'}</p>
                  {d.created_date && <p className="text-slate-400">{new Date(d.created_date).toLocaleDateString()}</p>}
                </div>
                <Badge variant="outline" className={
                  d.submission_status === 'approved' ? 'border-green-400 text-green-600' :
                  d.submission_status === 'needs_revision' ? 'border-red-400 text-red-600' : ''
                }>{d.submission_status || 'submitted'}</Badge>
                {d.document_url && (
                  <a href={d.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View</a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}