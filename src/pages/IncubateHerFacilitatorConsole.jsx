import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { Users, Filter, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function IncubateHerFacilitatorConsole() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [consultationRecap, setConsultationRecap] = useState({
    strengths: '',
    gaps: '',
    readiness_level: '',
    next_steps: '',
    internal_notes: ''
  });

  const { data: cohorts } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => base44.entities.ProgramCohort.list()
  });

  const { data: enrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.list()
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.ProgramSession.list()
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ enrollmentId, sessionId, attended }) => {
      const existing = await base44.entities.SessionAttendance.filter({
        enrollment_id: enrollmentId,
        session_id: sessionId
      });

      if (existing.length > 0) {
        return await base44.entities.SessionAttendance.update(existing[0].id, { attended });
      } else {
        const enrollment = enrollments.find(e => e.id === enrollmentId);
        return await base44.entities.SessionAttendance.create({
          enrollment_id: enrollmentId,
          session_id: sessionId,
          participant_email: enrollment.participant_email,
          attended
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance']);
      toast.success('Attendance updated');
    }
  });

  const submitConsultationRecapMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ConsultationRecap.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['consultations']);
      toast.success('Consultation recap saved');
      setConsultationRecap({ strengths: '', gaps: '', readiness_level: '', next_steps: '', internal_notes: '' });
    }
  });

  const filteredEnrollments = enrollments?.filter(enrollment => {
    const matchesSearch = enrollment.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.participant_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'not_started') return matchesSearch && !enrollment.pre_assessment_completed;
    if (filterStatus === 'in_progress') return matchesSearch && enrollment.pre_assessment_completed && !enrollment.program_completed;
    if (filterStatus === 'complete') return matchesSearch && enrollment.program_completed;
    if (filterStatus === 'missing_pre_test') return matchesSearch && !enrollment.pre_assessment_completed;
    if (filterStatus === 'needs_consultation') return matchesSearch && enrollment.pre_assessment_completed && !enrollment.consultation_completed;
    if (filterStatus === 'missing_docs') return matchesSearch && !enrollment.documents_uploaded;
    
    return matchesSearch;
  }) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader 
        title="Facilitator Console"
        subtitle="Manage participants and program progress"
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Participants</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="missing_pre_test">Missing Pre-Test</SelectItem>
                  <SelectItem value="needs_consultation">Needs Consultation</SelectItem>
                  <SelectItem value="missing_docs">Missing Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Roster */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Participant Roster ({filteredEnrollments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="border-l-4 border-l-[#143A50]">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{enrollment.participant_name}</h4>
                        <p className="text-sm text-slate-600">{enrollment.participant_email}</p>
                        
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {enrollment.pre_assessment_completed ? (
                            <Badge className="bg-green-100 text-green-800">Pre-Test ✓</Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600">Pre-Test Missing</Badge>
                          )}
                          
                          {enrollment.consultation_completed ? (
                            <Badge className="bg-green-100 text-green-800">Consultation ✓</Badge>
                          ) : (
                            <Badge variant="outline">Consultation Pending</Badge>
                          )}
                          
                          {enrollment.documents_uploaded ? (
                            <Badge className="bg-green-100 text-green-800">Docs ✓</Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600">Docs Missing</Badge>
                          )}
                          
                          {enrollment.post_assessment_completed ? (
                            <Badge className="bg-green-100 text-green-800">Post-Test ✓</Badge>
                          ) : (
                            <Badge variant="outline">Post-Test Pending</Badge>
                          )}
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Add Recap
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Consultation Recap: {enrollment.participant_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Strengths Identified</label>
                              <Textarea
                                value={consultationRecap.strengths}
                                onChange={(e) => setConsultationRecap({...consultationRecap, strengths: e.target.value})}
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Gaps Identified</label>
                              <Textarea
                                value={consultationRecap.gaps}
                                onChange={(e) => setConsultationRecap({...consultationRecap, gaps: e.target.value})}
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Readiness Level</label>
                              <Select 
                                value={consultationRecap.readiness_level}
                                onValueChange={(val) => setConsultationRecap({...consultationRecap, readiness_level: val})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not_ready">Not Ready</SelectItem>
                                  <SelectItem value="emerging">Emerging</SelectItem>
                                  <SelectItem value="competitive">Competitive</SelectItem>
                                  <SelectItem value="highly_competitive">Highly Competitive</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Recommended Next Steps</label>
                              <Textarea
                                value={consultationRecap.next_steps}
                                onChange={(e) => setConsultationRecap({...consultationRecap, next_steps: e.target.value})}
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Internal Notes (EIS Only)</label>
                              <Textarea
                                value={consultationRecap.internal_notes}
                                onChange={(e) => setConsultationRecap({...consultationRecap, internal_notes: e.target.value})}
                                rows={2}
                              />
                            </div>
                            <Button
                              onClick={() => submitConsultationRecapMutation.mutate({
                                enrollment_id: enrollment.id,
                                participant_email: enrollment.participant_email,
                                consultant_email: 'facilitator@example.com', // TODO: Get from logged-in user
                                consultation_date: new Date().toISOString(),
                                ...consultationRecap
                              })}
                              className="w-full bg-[#143A50]"
                            >
                              Save Consultation Recap
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Marking */}
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance by Session</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger>
                <SelectValue placeholder="Select a session" />
              </SelectTrigger>
              <SelectContent>
                {sessions?.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.session_title} - {session.session_date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedSession && (
              <div className="mt-4 space-y-2">
                {filteredEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">{enrollment.participant_name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-50"
                        onClick={() => markAttendanceMutation.mutate({ 
                          enrollmentId: enrollment.id, 
                          sessionId: selectedSession, 
                          attended: true 
                        })}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-50"
                        onClick={() => markAttendanceMutation.mutate({ 
                          enrollmentId: enrollment.id, 
                          sessionId: selectedSession, 
                          attended: false 
                        })}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Absent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CoBrandedFooter />
    </div>
  );
}