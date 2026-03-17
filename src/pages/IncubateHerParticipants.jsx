import React, { useState, useRef, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import ParticipantAggregates from '@/components/incubateher/ParticipantAggregates';
import JotFormProfile from '@/components/incubateher/JotFormProfile';
import BulkEnrolleAccessManager from '@/components/admin/BulkEnrolleAccessManager';
import { CheckCircle2, XCircle, Search, Award, Upload, FileText, Loader2, X, CheckCircle, ChevronDown, ChevronUp, Activity, AlertTriangle, Info, CalendarCheck, CalendarX } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import ParticipantActivityDetail from '@/components/incubateher/ParticipantActivityDetail';
import EmailRelinkTool from '@/components/incubateher/EmailRelinkTool';
import { format } from 'date-fns';

export default function IncubateHerParticipants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProfiles, setExpandedProfiles] = useState({});
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [filterExtractors, setFilterExtractors] = useState({});
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const toggleBookingMutation = useMutation({
    mutationFn: async ({ enrollment, booked, notes }) => {
      await base44.entities.ProgramEnrollment.update(enrollment.id, {
        consultation_booked: booked,
        consultation_booked_date: booked ? new Date().toISOString() : null,
        consultation_booked_notes: notes || null,
      });
    },
    onSuccess: (_, { booked, enrollment }) => {
      queryClient.invalidateQueries({ queryKey: ['all-enrollments'] });
      toast.success(`${enrollment.participant_name}: 1:1 booking ${booked ? 'marked as booked' : 'cleared'}`);
    }
  });

  const handleFilter = (key, val, extractor) => {
    setActiveFilters(prev => ({ ...prev, [key]: val }));
    setFilterExtractors(prev => ({ ...prev, [key]: extractor }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setFilterExtractors({});
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
    const newItems = files.map(file => ({ file, status: 'pending', result: null, error: null }));
    setUploadQueue(prev => [...prev, ...newItems]);
    e.target.value = '';
  };

  const processQueue = async () => {
    setIsProcessing(true);
    const pending = uploadQueue.filter(item => item.status === 'pending');

    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      const idx = uploadQueue.findIndex(q => q.file === item.file);

      // Mark as processing
      setUploadQueue(prev => prev.map((q, j) => 
        q.file === item.file ? { ...q, status: 'processing' } : q
      ));

      try {
        // Upload to storage first
        const { file_url } = await base44.integrations.Core.UploadFile({ file: item.file });

        // Process via backend function
        const response = await base44.functions.invoke('importJotformPDF', {
          file_url,
          file_name: item.file.name
        });

        setUploadQueue(prev => prev.map(q =>
          q.file === item.file ? { ...q, status: 'success', result: response.data } : q
        ));
      } catch (err) {
        setUploadQueue(prev => prev.map(q =>
          q.file === item.file ? { ...q, status: 'error', error: err.message } : q
        ));
      }
    }

    setIsProcessing(false);
    queryClient.invalidateQueries({ queryKey: ['all-enrollments'] });
  };

  const removeFromQueue = (file) => {
    setUploadQueue(prev => prev.filter(q => q.file !== file));
  };

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: async () => {
      return await base44.entities.ProgramEnrollment.filter({ role: 'participant' });
    }
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['program-cohorts'],
    queryFn: () => base44.entities.ProgramCohort.list()
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['all-assessments'],
    queryFn: () => base44.entities.ProgramAssessment.list()
  });

  // Map enrollmentId -> completed assessment types
  const assessmentMap = React.useMemo(() => {
    const map = {};
    assessments.forEach(a => {
      if (!a.is_draft) {
        if (!map[a.enrollment_id]) map[a.enrollment_id] = new Set();
        map[a.enrollment_id].add(a.assessment_type);
      }
    });
    return map;
  }, [assessments]);

  // Helper: get cohort for an enrollment
  const getCohort = (enrollment) => cohorts.find(c => c.id === enrollment.cohort_id);

  // Helper: get reminder banner info for a participant
  const getParticipantReminder = (enrollment) => {
    const cohort = getCohort(enrollment);
    const completed = assessmentMap[enrollment.id] || new Set();
    const hasEvaluation = completed.has('evaluation');
    const hasPost = completed.has('post') || enrollment.post_assessment_completed;
    const hasPre = completed.has('pre') || enrollment.pre_assessment_completed;
    const allThreeDone = hasPre && hasPost && hasEvaluation;

    // Never logged in
    if (!enrollment.user_id) {
      const msg = cohort?.no_login_message ||
        `Thank you for your interest in the Grants and Contracts Accelerator! Upon reviewing the app, we noticed you haven't logged in yet. If you haven't logged in by ${cohort?.access_removal_date ? format(new Date(cohort.access_removal_date), 'MMMM d, yyyy') : '3/20/2026'}, your access to the platform will be removed.`;
      return { type: 'danger', message: msg };
    }

    // All done — no reminder needed
    if (allThreeDone) return null;

    // Has pre but missing post or evaluation (drawing reminder)
    if (hasPre && (!hasPost || !hasEvaluation)) {
      const drawingDate = cohort?.drawing_date ? format(new Date(cohort.drawing_date), 'MMMM d, yyyy') : 'this Friday';
      const missing = [];
      if (!hasPost) missing.push('Post-Assessment');
      if (!hasEvaluation) missing.push('Evaluation');
      const msg = cohort?.drawing_reminder_message ||
        `📋 You're almost there! Please complete your ${missing.join(' and ')} to be automatically entered into EIS's free grant writing drawing on ${drawingDate}. All three stages (Pre-Assessment, Post-Assessment, and Evaluation) must be completed to book your 1-on-1 coaching session.`;
      return { type: 'warning', message: msg };
    }

    // No pre at all — basic reminder
    return null;
  };

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = !searchTerm ||
      e.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.participant_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = Object.entries(activeFilters).every(([key, val]) => {
      if (!val) return true;
      const extractor = filterExtractors[key];
      return extractor ? extractor(e) === val : true;
    });

    return matchesSearch && matchesFilters;
  }).sort((a, b) => (a.participant_name || '').localeCompare(b.participant_name || ''));

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
      <CoBrandedHeader 
        title="Participant Management"
        subtitle="Track individual progress and completion"
      />

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* PDF Upload Section */}
        <Card className="mb-6 border-2 border-dashed border-slate-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: BRAND_COLORS.eisNavy }}>
              <Upload className="w-5 h-5" />
              Import JotForm Registrations via PDF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="application/pdf"
                multiple
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Select PDF(s)
              </Button>
              {uploadQueue.some(q => q.status === 'pending') && (
                <Button
                  onClick={processQueue}
                  disabled={isProcessing}
                  style={{ backgroundColor: BRAND_COLORS.eisNavy, color: 'white' }}
                >
                  {isProcessing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    `Import ${uploadQueue.filter(q => q.status === 'pending').length} File(s)`
                  )}
                </Button>
              )}
            </div>

            {uploadQueue.length > 0 && (
              <div className="space-y-2">
                {uploadQueue.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border">
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm flex-1 truncate">{item.file.name}</span>
                    {item.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Pending</Badge>
                        <button onClick={() => removeFromQueue(item.file)} className="text-slate-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {item.status === 'processing' && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    {item.status === 'success' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600">{item.result?.name || item.result?.email} enrolled</span>
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-500">{item.error}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Access Manager */}
        {enrollments.length > 0 && (
          <BulkEnrolleAccessManager enrollments={enrollments} />
        )}

        {/* Aggregates */}
        {enrollments.length > 0 && (
          <ParticipantAggregates
            enrollments={enrollments}
            onFilter={handleFilter}
            activeFilters={activeFilters}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Search & Quick Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={activeFilters.never_logged_in ? 'default' : 'outline'}
                onClick={() => {
                  if (activeFilters.never_logged_in) {
                    setActiveFilters(prev => { const n = {...prev}; delete n.never_logged_in; return n; });
                    setFilterExtractors(prev => { const n = {...prev}; delete n.never_logged_in; return n; });
                  } else {
                    handleFilter('never_logged_in', 'yes', (e) => !e.user_id ? 'yes' : 'no');
                  }
                }}
                style={activeFilters.never_logged_in ? { backgroundColor: BRAND_COLORS.culRed, color: 'white' } : {}}
              >
                {activeFilters.never_logged_in ? <XCircle className="w-3 h-3 mr-1" /> : null}
                Never Logged In ({enrollments.filter(e => !e.user_id).length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Participants List */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>
              All Participants ({filteredEnrollments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEnrollments.map((enrollment) => (
                <div 
                  key={enrollment.id}
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: BRAND_COLORS.neutralLight }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: BRAND_COLORS.neutralDark }}>
                        {enrollment.participant_name}
                      </h3>
                      <p className="text-sm text-slate-600">{enrollment.participant_email}</p>
                      {enrollment.phone_number && (
                        <p className="text-sm text-slate-500">{enrollment.phone_number}</p>
                      )}
                      <Badge className="mt-1" style={{ backgroundColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.neutralLight }}>
                        {enrollment.role}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col gap-1 items-end">
                      {!enrollment.user_id && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 text-xs">
                          Never Logged In
                        </Badge>
                      )}
                      {enrollment.giveaway_eligible && (
                        <Badge style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                          <Award className="w-3 h-3 mr-1" />
                          Giveaway Eligible
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* JotForm details */}
                  {(enrollment.organization_name || enrollment.enrollment_notes) && (
                    <div className="mb-3 p-3 rounded bg-white border text-xs text-slate-600 space-y-1">
                      {enrollment.organization_name && (
                        <p><span className="font-semibold">Cohort/Org:</span> {enrollment.organization_name}</p>
                      )}
                      {enrollment.enrollment_notes && (
                        <p><span className="font-semibold">Notes:</span> {enrollment.enrollment_notes}</p>
                      )}
                    </div>
                  )}

                  {/* Progress Checklist */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="flex items-center gap-2">
                      {enrollment.pre_assessment_completed ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">Pre-Assessment</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {enrollment.attendance_complete ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">Attendance</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {enrollment.consultation_completed ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">1:1 Consultation</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {enrollment.documents_uploaded ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">Documents</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {enrollment.post_assessment_completed ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">Post-Assessment</span>
                    </div>
                  </div>

                  {/* Profile & Activity Toggles */}
                  <div className="mt-3 flex gap-3 flex-wrap">
                    <button
                      onClick={() => setExpandedProfiles(prev => ({ ...prev, [enrollment.id]: !prev[enrollment.id] }))}
                      className="flex items-center gap-1 text-xs font-medium hover:underline"
                      style={{ color: BRAND_COLORS.eisNavy }}
                    >
                      {expandedProfiles[enrollment.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {expandedProfiles[enrollment.id] ? 'Hide' : 'View'} Registration Profile
                    </button>
                    <button
                      onClick={() => setExpandedProfiles(prev => ({ ...prev, [`activity_${enrollment.id}`]: !prev[`activity_${enrollment.id}`] }))}
                      className="flex items-center gap-1 text-xs font-medium hover:underline"
                      style={{ color: BRAND_COLORS.culRed }}
                    >
                      <Activity className="w-3 h-3" />
                      {expandedProfiles[`activity_${enrollment.id}`] ? 'Hide' : 'View'} Activity Detail
                    </button>
                    <EmailRelinkTool enrollment={enrollment} />
                  </div>
                  {expandedProfiles[enrollment.id] && (
                    <div className="mt-3">
                      <JotFormProfile enrollment={enrollment} />
                    </div>
                  )}
                  {expandedProfiles[`activity_${enrollment.id}`] && (
                    <ParticipantActivityDetail enrollment={enrollment} />
                  )}

                  {/* Stage Reminder Banner */}
                  {(() => {
                    const reminder = getParticipantReminder(enrollment);
                    if (!reminder) return null;
                    const isDanger = reminder.type === 'danger';
                    return (
                      <div
                        className={`mt-3 p-3 rounded-lg text-sm flex gap-2 items-start ${
                          isDanger
                            ? 'bg-red-50 border border-red-200 text-red-800'
                            : 'bg-amber-50 border border-amber-200 text-amber-800'
                        }`}
                      >
                        {isDanger
                          ? <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                          : <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                        }
                        <span>{reminder.message}</span>
                      </div>
                    );
                  })()}

                  {/* Overall Status */}
                  <div className="mt-3 pt-3 border-t">
                    {enrollment.program_completed ? (
                      <Badge style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Program Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline">In Progress</Badge>
                    )}
                  </div>
                </div>
              ))}

              {filteredEnrollments.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500">No participants found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <CoBrandedFooter />
    </div>
  );
}