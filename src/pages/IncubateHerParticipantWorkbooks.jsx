import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WORKBOOK_PAGES, getSections } from '@/components/incubateher/workbookContent';
import { Search, Eye, Download, Users, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export default function IncubateHerParticipantWorkbooks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
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

  const { data: enrollments = [] } = useQuery({
    queryKey: ['incubateher-enrollments', cohort?.id],
    queryFn: async () => {
      return await base44.entities.ProgramEnrollment.filter({
        cohort_id: cohort.id,
        role: 'participant'
      });
    },
    enabled: !!cohort?.id
  });

  const { data: allResponses = [] } = useQuery({
    queryKey: ['all-workbook-responses'],
    queryFn: () => base44.entities.WorkbookResponse.list()
  });

  const getParticipantResponses = (participantEmail) => {
    return allResponses.filter(r => r.participant_email === participantEmail);
  };

  const calculateCompletion = (participantEmail) => {
    const responses = getParticipantResponses(participantEmail);
    const totalPages = WORKBOOK_PAGES.filter(p => p.fields).length;
    return Math.round((responses.length / totalPages) * 100);
  };

  const handleViewWorkbook = (participant) => {
    setSelectedParticipant(participant);
    setViewDialogOpen(true);
  };

  const handleDownloadParticipantWorkbook = async (participant) => {
    const responses = getParticipantResponses(participant.participant_email);
    const responsesMap = {};
    responses.forEach(resp => {
      responsesMap[resp.page_id] = resp.responses;
    });

    const doc = new jsPDF('p', 'mm', 'letter');
    let yPos = 20;

    // Cover page
    doc.setFontSize(24);
    doc.text('IncubateHer Workbook', 108, yPos, { align: 'center' });
    yPos += 15;
    doc.setFontSize(16);
    doc.text(participant.participant_name || participant.participant_email, 108, yPos, { align: 'center' });
    yPos += 10;
    doc.setFontSize(12);
    doc.text(new Date().toLocaleDateString(), 108, yPos, { align: 'center' });

    // Process each page
    WORKBOOK_PAGES.forEach((page, idx) => {
      if (idx > 0) doc.addPage();
      yPos = 20;

      doc.setFontSize(16);
      doc.text(page.title, 20, yPos);
      yPos += 10;

      if (page.fields && responsesMap[page.id]) {
        doc.setFontSize(10);
        page.fields.forEach(field => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFont(undefined, 'bold');
          doc.text(field.label, 20, yPos);
          yPos += 7;

          doc.setFont(undefined, 'normal');
          const response = responsesMap[page.id][field.id];

          if (response) {
            if (typeof response === 'string') {
              const lines = doc.splitTextToSize(response, 170);
              lines.forEach(line => {
                if (yPos > 260) {
                  doc.addPage();
                  yPos = 20;
                }
                doc.text(line, 25, yPos);
                yPos += 5;
              });
            }
          } else {
            doc.text('(No response)', 25, yPos);
            yPos += 5;
          }

          yPos += 5;
        });
      }
    });

    doc.save(`${participant.participant_name}_Workbook_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Workbook downloaded');
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const name = enrollment.participant_name?.toLowerCase() || '';
    const email = enrollment.participant_email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Participant Workbooks</h1>
          <p className="text-slate-600">View and download participant workbook submissions</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by participant name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">Total Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-slate-900">{enrollments.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">Workbook Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold text-slate-900">{WORKBOOK_PAGES.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold text-slate-900">{allResponses.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participants List */}
        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEnrollments.map(enrollment => {
                const completion = calculateCompletion(enrollment.participant_email);
                const responses = getParticipantResponses(enrollment.participant_email);
                const lastSaved = responses.length > 0 ? 
                  new Date(Math.max(...responses.map(r => new Date(r.last_saved)))).toLocaleDateString() : 
                  'Not started';

                return (
                  <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-[#143A50] text-white flex items-center justify-center font-semibold">
                          {enrollment.participant_name?.[0] || enrollment.participant_email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{enrollment.participant_name}</h3>
                          <p className="text-sm text-slate-600">{enrollment.participant_email}</p>
                        </div>
                      </div>
                      <div className="ml-13 flex items-center gap-4 text-sm">
                        <Badge className={completion === 100 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                          {completion}% Complete
                        </Badge>
                        <span className="text-slate-600">Last saved: {lastSaved}</span>
                        <span className="text-slate-600">{responses.length} pages completed</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewWorkbook(enrollment)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadParticipantWorkbook(enrollment)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* View Workbook Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedParticipant?.participant_name}'s Workbook
              </DialogTitle>
            </DialogHeader>
            
            {selectedParticipant && (
              <div className="space-y-6 mt-4">
                {WORKBOOK_PAGES.filter(p => p.fields).map(page => {
                  const responses = getParticipantResponses(selectedParticipant.participant_email);
                  const pageResponse = responses.find(r => r.page_id === page.id);

                  return (
                    <Card key={page.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{page.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {pageResponse ? (
                          <div className="space-y-4">
                            {page.fields.map(field => (
                              <div key={field.id}>
                                <p className="font-semibold text-slate-700 mb-2">{field.label}</p>
                                <div className="p-3 bg-slate-50 rounded border">
                                  {pageResponse.responses[field.id] ? (
                                    <p className="text-slate-900 whitespace-pre-wrap">
                                      {pageResponse.responses[field.id]}
                                    </p>
                                  ) : (
                                    <p className="text-slate-400 italic">No response</p>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div className="text-xs text-slate-500 mt-4">
                              Last saved: {new Date(pageResponse.last_saved).toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">Not yet completed</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}