import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronDown, ChevronRight, Clock, MapPin, Users, BookOpen, ExternalLink, Plus, Edit, Trash2, Settings } from 'lucide-react';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import ProgramAgendaEditor from '@/components/admin/ProgramAgendaEditor';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function IncubateHerAgenda() {
  const queryClient = useQueryClient();
  const [expandedSections, setExpandedSections] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [agendaEditorOpen, setAgendaEditorOpen] = useState(false);

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

  const { data: cohorts } = useQuery({
    queryKey: ['incubateher-cohort'],
    queryFn: async () => {
      return await base44.entities.ProgramCohort.filter({ 
        program_code: 'incubateher_funding_readiness' 
      });
    }
  });

  const cohort = cohorts?.[0];

  const { data: learningContent } = useQuery({
    queryKey: ['incubateher-learning'],
    queryFn: async () => {
      const content = await base44.entities.LearningContent.filter({
        incubateher_only: true
      });
      return content;
    }
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  const isFacilitator = enrollment?.role === 'facilitator' || enrollment?.role === 'admin';
  const showAdminControls = isAdmin || isFacilitator;

  const updateCohortMutation = useMutation({
    mutationFn: (cohortData) => base44.entities.ProgramCohort.update(cohort.id, cohortData),
    onSuccess: () => {
      queryClient.invalidateQueries(['incubateher-cohort']);
      setAgendaEditorOpen(false);
      toast.success('Program agenda updated');
    }
  });

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getLinkedContent = (sectionId) => {
    return learningContent?.filter(content => content.agenda_section === sectionId) || [];
  };

  const deleteMutation = useMutation({
    mutationFn: (courseId) => base44.entities.LearningContent.delete(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries(['incubateher-learning']);
      toast.success('Course deleted');
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingCourse) {
        return await base44.entities.LearningContent.update(editingCourse.id, data);
      } else {
        return await base44.entities.LearningContent.create({
          ...data,
          incubateher_only: true,
          content_type: 'course',
          funding_lane: 'general'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['incubateher-learning']);
      setEditDialogOpen(false);
      setEditingCourse(null);
      toast.success(editingCourse ? 'Course updated' : 'Course created');
    }
  });

  const handleAddCourse = (sectionId) => {
    setSelectedSection(sectionId);
    setEditingCourse(null);
    setEditDialogOpen(true);
  };

  const handleEditCourse = (course, sectionId) => {
    setSelectedSection(sectionId);
    setEditingCourse(course);
    setEditDialogOpen(true);
  };

  const handleDeleteCourse = (courseId) => {
    if (confirm('Are you sure you want to delete this course?')) {
      deleteMutation.mutate(courseId);
    }
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveMutation.mutate({
      title: formData.get('title'),
      description: formData.get('description'),
      content_url: formData.get('content_url'),
      duration_minutes: parseInt(formData.get('duration_minutes')),
      agenda_section: selectedSection
    });
  };

  const sessionDays = cohort?.session_days || [
    {
      date: 'Monday – March 2',
      time: '5:30–7:30 PM (Virtual – Google Meet)',
      meeting_link: '',
      sections: [
        {
          id: 'intro',
          title: 'Program Orientation & Funding Foundations',
          duration_minutes: 30,
          topics: [
            'Welcome & expectations',
            'Completion requirements',
            'Consultation cap explanation',
            'Overview of grants, proposals, and contracts',
            'Understanding funding landscapes for early-stage vs. growth-phase businesses'
          ],
          facilitator_notes: 'Set clear expectations early. Explain the consultation process and cap.'
        },
        {
          id: 'legal',
          title: 'Legal Structure & Organizational Compliance',
          duration_minutes: 45,
          topics: [
            'Business structure eligibility (LLC, nonprofit, sole prop, etc.)',
            'Formation vs. readiness',
            'Required documentation basics',
            'Insurance, governance (if applicable), compliance realities',
            'Common structural mistakes'
          ],
          facilitator_notes: 'Many participants struggle with structural requirements. Clarify LLC vs nonprofit eligibility.'
        },
        {
          id: 'intro',
          title: 'Funding Readiness Reality Check',
          duration_minutes: 45,
          topics: [
            'What "ready" actually means',
            'Assessing documentation gaps',
            'Capacity alignment',
            'When NOT to pursue funding',
            'Pre-assessment reflection'
          ],
          facilitator_notes: 'Help participants self-assess realistically. Some may not be ready yet - that\'s okay.'
        }
      ]
    },
    {
      date: 'Thursday – March 5',
      time: '5:30–7:30 PM (Virtual – Google Meet)',
      meeting_link: '',
      sections: [
        {
          id: 'financial',
          title: 'Financial Management & Budget Development',
          duration_minutes: 60,
          topics: [
            'Basic financial systems for entrepreneurs',
            'Budget building fundamentals',
            'Revenue vs. reimbursement',
            'Indirect costs (simple explanation)',
            'Cash flow awareness',
            'Common financial red flags'
          ],
          facilitator_notes: 'Use the budget template during this session. Walk through a sample budget line by line.'
        },
        {
          id: 'grants',
          title: 'Grants, Proposals & RFP Fundamentals',
          duration_minutes: 60,
          topics: [
            'How to find opportunities',
            'Reading guidelines correctly',
            'Grants vs. competitive proposals',
            'RFP structure overview',
            'Deliverables vs. outcomes',
            'Avoiding common application mistakes'
          ],
          facilitator_notes: 'Clarify the difference between grants and contracts. Show real examples.'
        }
      ]
    },
    {
      date: 'Saturday – March 7',
      time: '9:00 AM–12:00 PM (In Person)',
      location: 'Columbus Metropolitan Library – Shepard Location, Meeting Room 1',
      meeting_link: '',
      sections: [
        {
          id: 'grants',
          title: 'Deep Dive: Grant Writing Fundamentals',
          duration_minutes: 60,
          topics: [
            'Narrative components',
            'Problem statements',
            'Goals & measurable outcomes',
            'Logic model basics (simple)',
            'Alignment language'
          ],
          facilitator_notes: 'Participants often underestimate timeline. Stress the 6-8 week preparation period.'
        },
        {
          id: 'contracts',
          title: 'RFPs & Contract Proposals in Practice',
          duration_minutes: 45,
          topics: [
            'Competitive positioning',
            'Pricing considerations',
            'Capability statements',
            'Past performance documentation',
            'Evaluating bid feasibility'
          ],
          facilitator_notes: 'Emphasize the binding nature of contracts vs. grants. Use real RFP examples.'
        },
        {
          id: 'strategy',
          title: 'Funding Strategy & Long-Term Sustainability',
          duration_minutes: 30,
          topics: [
            'Diversified funding portfolio',
            'Contracts vs. grants in growth strategy',
            'Relationship building',
            'Grant lifecycle awareness'
          ],
          facilitator_notes: 'Connect back to their individual goals from pre-assessment.'
        },
        {
          id: 'consultation',
          title: 'Consultation Preparation Lab',
          duration_minutes: 30,
          topics: [
            'What to bring to your 1:1',
            'Document checklist',
            'How to maximize advisory time',
            'Booking instructions'
          ],
          facilitator_notes: 'Provide consultation booking link. Clarify expectations and preparation requirements.'
        }
      ]
    }
  ];

  const calculateDayTotal = (sections) => {
    return sections?.reduce((total, section) => total + (section.duration_minutes || 0), 0) || 0;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader 
        title="Program Agenda"
        subtitle="Detailed session breakdown and learning outcomes"
      />

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {showAdminControls && (
          <div className="flex justify-end">
            <Button onClick={() => setAgendaEditorOpen(true)} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Edit Agenda Structure
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#143A50]" />
              Program Schedule Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4">
              The IncubateHer program is structured across three sessions with a total of 7 hours of instruction plus individual consultations.
            </p>
            <div className="space-y-2">
              {sessionDays.map((day, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Badge className="bg-[#143A50] mt-1">{idx + 1}</Badge>
                  <div>
                    <p className="font-medium text-slate-900">{day.date}</p>
                    <p className="text-sm text-slate-600">{day.time}</p>
                    {day.location && (
                      <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {day.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {sessionDays.map((day, dayIdx) => {
          const dayTotal = calculateDayTotal(day.sections);
          
          return (
          <div key={dayIdx} className="space-y-4">
            <Card className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-1">{day.date}</CardTitle>
                    <div className="flex items-center gap-3 text-white/90">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {day.time}
                      </span>
                      {day.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {day.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-white text-[#143A50]">
                    {dayTotal} minutes
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {day.sections.map((section, sectionIdx) => (
              <Card key={`${dayIdx}-${sectionIdx}`} className="overflow-hidden ml-4">
                <CardHeader 
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleSection(`${dayIdx}-${section.id}-${sectionIdx}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedSections[`${dayIdx}-${section.id}-${sectionIdx}`] ? (
                        <ChevronDown className="w-5 h-5 text-[#143A50]" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[#143A50]" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#E5C089] text-[#143A50]">
                            {sectionIdx + 1}
                          </Badge>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {section.duration_minutes} minutes
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {expandedSections[`${dayIdx}-${section.id}-${sectionIdx}`] && (
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Topics Covered:</h4>
                  <ul className="space-y-1">
                    {section.topics.map((topic, idx) => (
                      <li key={idx} className="text-slate-600 flex items-start gap-2">
                        <span className="text-[#E5C089] mt-1">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Learning Resources
                    </h4>
                    {showAdminControls && (
                      <Button
                        size="sm"
                        onClick={() => handleAddCourse(section.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Course
                      </Button>
                    )}
                  </div>
                  {getLinkedContent(section.id).length > 0 ? (
                    <div className="space-y-2">
                      {getLinkedContent(section.id).map(content => (
                        <div key={content.id} className="flex items-center justify-between p-3 bg-white rounded border border-blue-100">
                          <div className="flex items-center gap-3 flex-1">
                            <Badge variant="outline" className="text-xs">
                              {content.duration_minutes}min
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">{content.title}</p>
                              <p className="text-xs text-slate-600 mt-1">{content.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                           <Link to={createPageUrl('IncubateHerCourse') + '?id=' + content.id + '&from=agenda'}>
                             <Button 
                               size="sm" 
                               variant="ghost"
                             >
                               <ExternalLink className="w-4 h-4" />
                             </Button>
                           </Link>
                            {showAdminControls && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditCourse(content, section.id)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteCourse(content.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 italic">No courses linked yet</p>
                  )}
                </div>

                {showAdminControls && section.facilitator_notes && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Facilitator Notes
                    </h4>
                    <p className="text-amber-800 text-sm">{section.facilitator_notes}</p>
                  </div>
                )}
                </CardContent>
              )}
              </Card>
            ))}
          </div>
        );
        })}
      </div>

      <CoBrandedFooter />

      {/* Edit/Add Course Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCourse} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Course Title</label>
              <Input
                name="title"
                defaultValue={editingCourse?.title}
                required
                placeholder="e.g., Financial Management & Budgeting"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                name="description"
                defaultValue={editingCourse?.description}
                required
                rows={3}
                placeholder="Brief description of what participants will learn"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Course URL</label>
              <Input
                name="content_url"
                type="url"
                defaultValue={editingCourse?.content_url}
                required
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <Input
                name="duration_minutes"
                type="number"
                defaultValue={editingCourse?.duration_minutes || 60}
                required
                min="1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#143A50]">
                {editingCourse ? 'Update' : 'Create'} Course
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Agenda Editor Dialog */}
      <Dialog open={agendaEditorOpen} onOpenChange={setAgendaEditorOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <ProgramAgendaEditor
            cohort={cohort}
            onSave={(updatedCohort) => updateCohortMutation.mutate(updatedCohort)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}