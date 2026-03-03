import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar, Video, MapPin, Clock, ChevronDown, ChevronRight,
  Play, Upload, CheckCircle2, Lock, ExternalLink, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';

const PROGRAM_SCHEDULE = [
  {
    id: 'session-1',
    number: 1,
    date: 'Monday, March 2, 2026',
    time: '5:30–7:30 PM',
    duration: '2 Hours',
    format: 'Virtual – Google Meet',
    location: null,
    sessionTitle: 'Funding Foundations & Readiness',
    topics: [
      { section: 'Program Orientation & Expectations', items: ['Completion requirements', 'Consultation cap explanation', 'Pre- & post-assessment overview', 'How this series supports early-stage and growth-phase businesses'] },
      { section: 'Understanding Funding Pathways', items: ['Grants vs. Proposals vs. Contracts', 'Revenue vs. reimbursement models', 'Public vs. private funding realities'] },
      { section: 'Legal Structure & Organizational Readiness', items: ['Business structure eligibility (LLC, nonprofit, sole prop, etc.)', 'Formation vs. operational readiness', 'Required documentation fundamentals', 'Compliance basics and common structural mistakes'] },
      { section: 'Funding Readiness Reality Check', items: ['What "ready" actually means', 'Identifying documentation gaps', 'Capacity alignment', 'When NOT to pursue funding'] }
    ]
  },
  {
    id: 'session-2',
    number: 2,
    date: 'Thursday, March 5, 2026',
    time: '5:30–7:30 PM',
    duration: '2 Hours',
    format: 'Virtual – Google Meet',
    location: null,
    sessionTitle: 'Financial Systems & Funding Mechanics',
    topics: [
      { section: 'Financial Management & Budget Development', items: ['Basic financial systems for entrepreneurs', 'Budget building fundamentals', 'Cash flow awareness', 'Indirect cost concepts (simplified)', 'Common financial red flags'] },
      { section: 'Grants, Proposals & RFP Fundamentals', items: ['How to find funding opportunities', 'Reading guidelines correctly', 'RFP structure overview', 'Deliverables vs. measurable outcomes', 'Avoiding common application mistakes'] }
    ]
  },
  {
    id: 'session-3',
    number: 3,
    date: 'Saturday, March 7, 2026',
    time: '9:00 AM–12:00 PM',
    duration: '3 Hours',
    format: 'In Person',
    location: 'Columbus Metropolitan Library – Shepard Location, Meeting Room 1',
    sessionTitle: 'Application Strategy & Integration',
    topics: [
      { section: 'Grant Writing Fundamentals (Applied)', items: ['Narrative components', 'Writing strong problem statements', 'Goals & measurable outcomes', 'Logic model basics (practical)', 'Alignment language'] },
      { section: 'RFPs & Contract Proposals in Practice', items: ['Competitive positioning', 'Pricing considerations', 'Capability statements', 'Past performance documentation', 'Evaluating bid feasibility'] },
      { section: 'Funding Strategy & Sustainability', items: ['Diversified funding portfolios', 'Contracts vs. grants in growth strategy', 'Relationship building', 'Understanding the grant lifecycle'] },
      { section: 'Consultation Preparation Lab', items: ['What to bring to your 1:1', 'Document checklist', 'How to maximize advisory time', 'Booking instructions'] }
    ]
  }
];

function SessionCard({ session, cohortDay, sessionIndex, isAdmin, onUploadVideo, expandedTopics, onToggleTopics }) {
  const hasRecording = !!cohortDay?.video_url;
  const hasMeetingLink = !!cohortDay?.meeting_link;
  const isInPerson = session.format === 'In Person';
  const topicsExpanded = expandedTopics[session.id];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Session header bar */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(to right, ${BRAND_COLORS.culRed}, ${BRAND_COLORS.eisNavy})` }}
      />

      <div className="p-6">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-4">
            {/* Session number circle */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
              style={{ backgroundColor: BRAND_COLORS.eisNavy }}
            >
              {session.number}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{session.sessionTitle}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-sm text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {session.date}
                </span>
                <span className="text-sm text-slate-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {session.time}
                </span>
                <Badge
                  className="text-xs"
                  style={isInPerson
                    ? { backgroundColor: BRAND_COLORS.eisGold + '30', color: '#7a5c1e', border: `1px solid ${BRAND_COLORS.eisGold}` }
                    : { backgroundColor: BRAND_COLORS.culRed + '15', color: BRAND_COLORS.culRed, border: `1px solid ${BRAND_COLORS.culRed}30` }
                  }
                >
                  {isInPerson ? '📍 In Person' : '💻 Virtual'}
                </Badge>
                <Badge variant="outline" className="text-xs">{session.duration}</Badge>
              </div>
              {session.location && (
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  {session.location}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          {hasRecording ? (
            <Badge className="bg-green-100 text-green-700 border-green-200 flex-shrink-0">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Recording Available
            </Badge>
          ) : hasMeetingLink ? (
            <Badge className="flex-shrink-0" style={{ backgroundColor: BRAND_COLORS.culRed + '15', color: BRAND_COLORS.culRed }}>
              Live
            </Badge>
          ) : null}
        </div>

        {/* Recording */}
        {hasRecording && (
          <div className="mb-5">
            <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Play className="w-4 h-4" style={{ color: BRAND_COLORS.culRed }} />
              Session Recording
            </p>
            <div className="bg-slate-900 rounded-xl overflow-hidden">
              <video controls className="w-full" src={cohortDay.video_url}>
                Your browser does not support video playback.
              </video>
            </div>
          </div>
        )}

        {/* Join button */}
        {hasMeetingLink && (
          <a href={cohortDay.meeting_link} target="_blank" rel="noopener noreferrer" className="block mb-5">
            <Button className="w-full" style={{ backgroundColor: BRAND_COLORS.culRed, color: 'white' }}>
              <Video className="w-4 h-4 mr-2" />
              Join Google Meet
              <ExternalLink className="w-3.5 h-3.5 ml-2" />
            </Button>
          </a>
        )}

        {/* Admin: upload video */}
        {isAdmin && !hasRecording && (
          <div className="mb-5 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-xs text-slate-500 mb-2 font-medium">Upload Recording (Admin)</p>
            <div className="flex gap-2">
              <input
                type="file"
                accept="video/*"
                className="text-xs flex-1"
                onChange={(e) => onUploadVideo(sessionIndex, e.target.files[0])}
              />
            </div>
          </div>
        )}

        {/* Topics toggle */}
        <button
          onClick={() => onToggleTopics(session.id)}
          className="flex items-center gap-2 text-sm font-medium w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
          style={{ color: BRAND_COLORS.eisNavy }}
        >
          {topicsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <BookOpen className="w-4 h-4" />
          Topics Covered ({session.topics.length} sections)
        </button>

        {topicsExpanded && (
          <div className="mt-3 space-y-3 pl-2">
            {session.topics.map((topic, ti) => (
              <div key={ti} className="pl-4 border-l-2 py-1" style={{ borderColor: BRAND_COLORS.eisGold }}>
                <p className="font-semibold text-slate-800 text-sm mb-1.5">{topic.section}</p>
                <ul className="space-y-1">
                  {topic.items.map((item, ii) => (
                    <li key={ii} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="mt-1 flex-shrink-0" style={{ color: BRAND_COLORS.eisGold }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function IncubateHerSchedule() {
  const [expandedTopics, setExpandedTopics] = useState({});
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['incubateher-cohorts'],
    queryFn: () => base44.entities.ProgramCohort.filter({ program_code: 'incubateher_funding_readiness' })
  });

  const cohort = cohorts[0];
  const sessionDays = cohort?.session_days || [];

  const updateCohortMutation = useMutation({
    mutationFn: (data) => base44.entities.ProgramCohort.update(cohort.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['incubateher-cohorts']);
      toast.success('Recording uploaded successfully');
    }
  });

  const handleUploadVideo = async (dayIndex, file) => {
    if (!file || !cohort) return;
    setUploadingIndex(dayIndex);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const updatedDays = [...sessionDays];
      updatedDays[dayIndex] = { ...updatedDays[dayIndex], video_url: file_url };
      await updateCohortMutation.mutateAsync({ session_days: updatedDays });
    } catch {
      toast.error('Failed to upload recording');
    } finally {
      setUploadingIndex(null);
    }
  };

  const toggleTopics = (id) => {
    setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  const recordingsCount = sessionDays.filter(d => d?.video_url).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <CoBrandedHeader
        title="Schedule & Sessions"
        subtitle="Join live sessions, access recordings, and review topics"
      />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Sessions', value: 3 },
            { label: 'Total Hours', value: '7 hrs' },
            { label: 'Recordings', value: `${recordingsCount}/3` },
          ].map(({ label, value }) => (
            <Card key={label} className="border-0 shadow-sm text-center">
              <CardContent className="py-4">
                <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.eisNavy }}>{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Session cards */}
        <div className="space-y-6">
          {PROGRAM_SCHEDULE.map((session, idx) => (
            <SessionCard
              key={session.id}
              session={session}
              cohortDay={sessionDays[idx]}
              sessionIndex={idx}
              isAdmin={isAdmin}
              onUploadVideo={handleUploadVideo}
              expandedTopics={expandedTopics}
              onToggleTopics={toggleTopics}
            />
          ))}
        </div>

        {/* Program summary */}
        <div className="mt-8 rounded-2xl p-6 text-white" style={{ backgroundColor: BRAND_COLORS.eisNavy }}>
          <h4 className="font-bold text-lg mb-3">Program Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2" style={{ color: BRAND_COLORS.eisGold }}>Instructional Hours: 7 Total</p>
              <ul className="space-y-1 text-white/80">
                <li>• Session 1 (Monday): 2 hours</li>
                <li>• Session 2 (Thursday): 2 hours</li>
                <li>• Session 3 (Saturday): 3 hours</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2" style={{ color: BRAND_COLORS.eisGold }}>Individual Consultations</p>
              <p className="text-white/80">45–60 minutes for the first 20 eligible participants</p>
            </div>
          </div>
        </div>
      </div>

      <CoBrandedFooter />
    </div>
  );
}