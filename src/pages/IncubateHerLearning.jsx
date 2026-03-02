import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award, 
  Trophy,
  Target,
  Lock,
  Play,
  Sparkles,
  FileText,
  Video,
  Download,
  ChevronDown,
  ChevronRight,
  MapPin,
  ExternalLink
} from 'lucide-react';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function IncubateHerLearning() {
  const [expandedSections, setExpandedSections] = useState({});

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
      return cohorts[0] || null;
    }
  });

  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      // Find any IncubateHer enrollment for this user
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
      return enrollments.find(e => e.cohort_id) || null;
    },
    enabled: !!user?.email
  });

  const { data: learningContent, isLoading } = useQuery({
    queryKey: ['incubateher-learning'],
    queryFn: async () => {
      const content = await base44.entities.LearningContent.filter({
        incubateher_only: true
      });
      return content;
    }
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', enrollment?.id],
    queryFn: async () => {
      if (!enrollment?.id) return [];
      return await base44.entities.UserProgress.filter({
        enrollment_id: enrollment.id
      });
    },
    enabled: !!enrollment?.id
  });

  const { data: badges } = useQuery({
    queryKey: ['user-badges', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.UserBadge.filter({
        user_email: user.email,
        program: 'incubateher'
      });
    },
    enabled: !!user?.email
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

  if (!enrollment) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
        <CoBrandedHeader title="IncubateHer Learning Hub" />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card className="text-center">
            <CardContent className="py-12">
              <Lock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4" style={{ color: BRAND_COLORS.culRed }}>
                Enrollment Required
              </h2>
              <p className="text-slate-600 mb-6">
                This learning hub is exclusive to IncubateHer program participants.
              </p>
              <Button asChild style={{ backgroundColor: BRAND_COLORS.culRed, color: 'white' }}>
                <a href={createPageUrl('IncubateHerSchedule')}>
                  Enroll in IncubateHer
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <CoBrandedFooter />
      </div>
    );
  }

  const isCULObserver = enrollment?.role === 'cul_observer';
  const completedCourses = userProgress?.filter(p => p.is_completed) || [];
  const totalCourses = learningContent?.length || 0;
  const completionPercent = totalCourses > 0 ? Math.round((completedCourses.length / totalCourses) * 100) : 0;
  const totalPoints = enrollment?.gamification_points || 0;

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
          ]
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
          ]
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
          ]
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
          ]
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
          ]
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
          ]
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
          ]
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
          ]
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
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
      <CoBrandedHeader 
        title="IncubateHer Learning Hub"
        subtitle="Your path to funding readiness mastery"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* CUL Observer Badge */}
        {isCULObserver && (
          <Card className="mb-6" style={{ backgroundColor: BRAND_COLORS.eisGold + '15', borderColor: BRAND_COLORS.eisGold }}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Badge style={{ backgroundColor: BRAND_COLORS.eisGold, color: 'white' }}>
                  CUL Observer
                </Badge>
                <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                  You have observer access. You can participate and access all materials, but completion is not required.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Overview - Hide for CUL Observers */}
        {!isCULObserver && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card style={{ borderColor: BRAND_COLORS.culRed, borderWidth: 2 }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-8 h-8" style={{ color: BRAND_COLORS.eisGold }} />
                  <span className="text-3xl font-bold" style={{ color: BRAND_COLORS.culRed }}>
                    {totalPoints}
                  </span>
                </div>
                <p className="text-sm font-medium" style={{ color: BRAND_COLORS.eisNavy }}>
                  Total Points Earned
                </p>
              </CardContent>
            </Card>

            <Card style={{ borderColor: BRAND_COLORS.eisGold, borderWidth: 2 }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-8 h-8" style={{ color: BRAND_COLORS.eisGold }} />
                  <span className="text-3xl font-bold" style={{ color: BRAND_COLORS.eisGold }}>
                    {completedCourses.length}/{totalCourses}
                  </span>
                </div>
                <p className="text-sm font-medium" style={{ color: BRAND_COLORS.eisNavy }}>
                  Courses Completed
                </p>
                <Progress value={completionPercent} className="mt-2" />
              </CardContent>
            </Card>

            <Card style={{ borderColor: BRAND_COLORS.eisNavy, borderWidth: 2 }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8" style={{ color: BRAND_COLORS.eisNavy }} />
                  <span className="text-3xl font-bold" style={{ color: BRAND_COLORS.eisNavy }}>
                    {badges?.length || 0}
                  </span>
                </div>
                <p className="text-sm font-medium" style={{ color: BRAND_COLORS.eisNavy }}>
                  Badges Earned
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gamification Notice - Hide for CUL Observers */}
        {!isCULObserver && (
          <Card className="mb-8" style={{ backgroundColor: BRAND_COLORS.eisGold + '15', borderColor: BRAND_COLORS.eisGold }}>
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 flex-shrink-0" style={{ color: BRAND_COLORS.eisGold }} />
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: BRAND_COLORS.neutralDark }}>
                    How to Earn Points & Badges
                  </h3>
                  <ul className="space-y-1 text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                    <li>• Complete each course section: <strong>+10 points</strong></li>
                    <li>• Complete a full course: <strong>+50 bonus points</strong></li>
                    <li>• Unlock special badges at milestones (1, 3, and 6 courses completed)</li>
                    <li>• Complete all courses to be eligible for the program giveaway</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Program Schedule Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: BRAND_COLORS.culRed }}>
              <Clock className="w-5 h-5" />
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
                  <Badge style={{ backgroundColor: BRAND_COLORS.culRed, color: 'white' }} className="mt-1">
                    {idx + 1}
                  </Badge>
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

        {/* Day-by-Day Curriculum */}
        {sessionDays.map((day, dayIdx) => {
          return (
          <div key={dayIdx} className="mb-6">
            <Card className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
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
                    {day.meeting_link && (
                      <a 
                        href={day.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        <span className="text-sm font-medium">Join Google Meet</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {day.sections.map((section, sectionIdx) => {
              const linkedContent = getLinkedContent(section.id);
              
              return (
              <Card key={`${dayIdx}-${sectionIdx}`} className="overflow-hidden ml-4 mb-3">
                <CardHeader 
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleSection(`${dayIdx}-${section.id}-${sectionIdx}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedSections[`${dayIdx}-${section.id}-${sectionIdx}`] ? (
                        <ChevronDown className="w-5 h-5" style={{ color: BRAND_COLORS.culRed }} />
                      ) : (
                        <ChevronRight className="w-5 h-5" style={{ color: BRAND_COLORS.culRed }} />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge style={{ backgroundColor: BRAND_COLORS.eisGold, color: 'white' }}>
                            {sectionIdx + 1}
                          </Badge>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                        </div>
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
                            <span style={{ color: BRAND_COLORS.eisGold }} className="mt-1">•</span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4" />
                        Learning Resources
                      </h4>
                      {getLinkedContent(section.id).length > 0 ? (
                        <div className="space-y-2">
                          {getLinkedContent(section.id).map(content => (
                           <div key={content.id} className="flex items-center justify-between p-3 bg-white rounded border border-blue-100">
                             <div className="flex items-center gap-3 flex-1">
                               <div className="flex-1">
                                 <p className="text-sm font-medium text-slate-900">{content.title}</p>
                                 <p className="text-xs text-slate-600 mt-1">{content.description}</p>
                               </div>
                             </div>
                              <Link to={createPageUrl('IncubateHerCourse') + '?id=' + content.id + '&from=learning'}>
                                <Button 
                                  size="sm" 
                                  style={{ backgroundColor: BRAND_COLORS.culRed, color: 'white' }}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600 italic">No courses linked yet</p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
            })}
          </div>
        );
        })}

        {/* Completion Status - Hide for CUL Observers */}
        {!isCULObserver && completionPercent === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8"
          >
            <Card style={{ backgroundColor: BRAND_COLORS.eisGold + '20', borderColor: BRAND_COLORS.eisGold, borderWidth: 2 }}>
              <CardContent className="py-8 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.eisGold }} />
                <h2 className="text-2xl font-bold mb-2" style={{ color: BRAND_COLORS.culRed }}>
                  🎉 Congratulations!
                </h2>
                <p className="text-lg mb-4" style={{ color: BRAND_COLORS.eisNavy }}>
                  You've completed all IncubateHer courses and earned your certificate!
                </p>
                <Button asChild size="lg" style={{ backgroundColor: BRAND_COLORS.culRed, color: 'white' }}>
                  <a href={createPageUrl('IncubateHerCompletion')}>
                    View Certificate & Giveaway Status
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <CoBrandedFooter />
    </div>
  );
}