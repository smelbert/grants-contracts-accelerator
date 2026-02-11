import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Clock, MapPin, Users, BookOpen, ExternalLink } from 'lucide-react';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function IncubateHerAgenda() {
  const [expandedSections, setExpandedSections] = useState({});

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

  const { data: cohort } = useQuery({
    queryKey: ['cohort', enrollment?.cohort_id],
    queryFn: async () => {
      return await base44.entities.ProgramCohort.filter({ id: enrollment.cohort_id });
    },
    enabled: !!enrollment?.cohort_id
  });

  const { data: learningContent } = useQuery({
    queryKey: ['incubateher-learning'],
    queryFn: async () => {
      const content = await base44.entities.LearningContent.filter({
        incubateher_only: true
      });
      return content;
    }
  });

  const isFacilitator = user?.role === 'admin' || user?.role === 'coach';

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getLinkedContent = (sectionId) => {
    return learningContent?.filter(content => content.agenda_section === sectionId) || [];
  };

  const agendaSections = [
    {
      id: 'intro',
      title: 'Introduction & Orientation',
      duration: '45 minutes',
      topics: [
        'Welcome and program overview',
        'Understanding grants vs. contracts',
        'Success metrics and completion requirements',
        'Tour of the workbook and resources'
      ],
      facilitatorNotes: 'Emphasize the difference between grants and contracts early. Use the visual comparison chart.'
    },
    {
      id: 'legal',
      title: 'Legal & Organizational Readiness',
      duration: '90 minutes',
      topics: [
        'Required documentation checklist',
        'Nonprofit status and compliance',
        'Board governance requirements',
        'Insurance and liability considerations',
        'Record-keeping best practices'
      ],
      facilitatorNotes: 'Many participants struggle with governance. Have the board assessment tool ready.'
    },
    {
      id: 'financial',
      title: 'Financial Management & Budgeting',
      duration: '90 minutes',
      topics: [
        'Financial systems and controls',
        'Budget development for proposals',
        'Indirect cost rates explained',
        'Cash flow and fund accounting',
        'Audit readiness'
      ],
      facilitatorNotes: 'Use the budget template during this session. Walk through a sample budget line by line.'
    },
    {
      id: 'grants',
      title: 'Grant Writing Fundamentals',
      duration: '120 minutes',
      topics: [
        'Finding the right opportunities',
        'Reading and responding to guidelines',
        'Narrative development strategies',
        'Logic models and outcomes',
        'Common pitfalls and how to avoid them'
      ],
      facilitatorNotes: 'Participants often underestimate timeline. Stress the 6-8 week preparation period.'
    },
    {
      id: 'contracts',
      title: 'RFPs and Contract Proposals',
      duration: '120 minutes',
      topics: [
        'Understanding RFP requirements',
        'Competitive vs. collaborative proposals',
        'Pricing and cost structure',
        'Past performance documentation',
        'Proposal compliance checklist',
        'Contract negotiation basics'
      ],
      facilitatorNotes: 'Emphasize the binding nature of contracts vs. grants. Use real RFP examples.'
    },
    {
      id: 'strategy',
      title: 'Funding Strategy & Sustainability',
      duration: '60 minutes',
      topics: [
        'Building a diversified funding portfolio',
        'Grant lifecycle management',
        'Relationship-building with funders',
        'Reporting and stewardship',
        'Long-term sustainability planning'
      ],
      facilitatorNotes: 'Connect back to their individual goals from pre-assessment.'
    },
    {
      id: 'consultation',
      title: 'One-on-One Consultations',
      duration: 'Scheduled individually',
      topics: [
        'Personalized readiness assessment',
        'Document review and feedback',
        'Next steps and action planning',
        'Q&A specific to your organization'
      ],
      facilitatorNotes: 'Review pre-assessment scores before each consultation. Have checklist ready.'
    },
    {
      id: 'wrap',
      title: 'Wrap-Up & Next Steps',
      duration: '45 minutes',
      topics: [
        'Post-assessment completion',
        'Certificate of completion',
        'Ongoing support resources',
        'Giveaway announcement (if applicable)',
        'Alumni network information'
      ],
      facilitatorNotes: 'Ensure all participants have completed post-assessment before revealing giveaway eligibility.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader 
        title="Program Agenda"
        subtitle="Detailed session breakdown and learning outcomes"
      />

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#143A50]" />
              Important Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              <strong>No Wednesday sessions.</strong> All sessions are scheduled on alternate days to accommodate participant availability.
            </p>
          </CardContent>
        </Card>

        {agendaSections.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedSections[section.id] ? (
                    <ChevronDown className="w-5 h-5 text-[#143A50]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#143A50]" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {section.duration}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            {expandedSections[section.id] && (
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

                {getLinkedContent(section.id).length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Learning Resources
                    </h4>
                    <div className="space-y-2">
                      {getLinkedContent(section.id).map(content => (
                        <div key={content.id} className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              {content.content_type}
                            </Badge>
                            <span className="text-sm text-slate-700">{content.title}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => window.open(content.content_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isFacilitator && section.facilitatorNotes && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Facilitator Notes
                    </h4>
                    <p className="text-amber-800 text-sm">{section.facilitatorNotes}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <CoBrandedFooter />
    </div>
  );
}