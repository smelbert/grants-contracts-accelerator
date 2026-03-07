import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen, Target, Award, Sparkles, CheckCircle2,
  TrendingUp, Users, Loader2, Lightbulb, FileText, AlertTriangle,
  Shield, Star, ArrowRight, Clock, Briefcase, Layers, ChevronRight
} from 'lucide-react';
import VisualCurriculumMap from '@/components/training/VisualCurriculumMap';
import ModuleDetailView, { MODULES_DATA } from '@/components/training/ModuleDetailView';

const LEVEL_COLORS = {
  'level-1': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', badge: 'bg-green-600', icon: '🟢', light: 'bg-green-100' },
  'level-2': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', badge: 'bg-blue-600', icon: '🔵', light: 'bg-blue-100' },
  'level-3': { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', badge: 'bg-purple-600', icon: '🟣', light: 'bg-purple-100' }
};

const PHILOSOPHY = [
  {
    icon: <Target className="w-6 h-6 text-[#1E4F58]" />,
    title: 'We Train Strategic Translators, Not Just Writers',
    body: 'EIS consultants are not ghostwriters. They are strategic translators who take a client\'s vision, mission, and programs — and translate them into the language of funders, evaluators, and procurement officers. Writing is the delivery mechanism. Strategy is the product. Consultants who only know how to write will produce generic proposals. Consultants who understand strategy will produce winning ones.'
  },
  {
    icon: <Shield className="w-6 h-6 text-[#AC1A5B]" />,
    title: 'Quality Is Non-Negotiable — At Every Level',
    body: 'The EIS name goes on every submission. Every proposal, every contract response, every narrative section is a representation of our institution. Quality standards are not aspirational — they are baseline. A consultant who cannot meet the quality bar does not advance. A proposal that does not clear QA does not submit. No exceptions, no shortcuts, no "good enough."'
  },
  {
    icon: <Layers className="w-6 h-6 text-[#143A50]" />,
    title: 'Competency Is Built Through Practice and Feedback',
    body: 'Reading about grant writing is not the same as writing grants. This training framework is designed around doing — exercises, drafts, feedback cycles, and real-world application. Every module includes required outputs. Consulting experience is earned through practice under supervision, not accumulated through observation. Feedback is a tool, not a judgment.'
  },
  {
    icon: <Briefcase className="w-6 h-6 text-[#1E4F58]" />,
    title: 'Advancement Is Earned, Not Assumed',
    body: 'Progression from Level 1 to Level 2 to Level 3 is based on demonstrated competency — not time served, not self-assessment, not relationship with leadership. Promotion gates exist to protect clients, protect EIS, and protect consultants from being placed in roles they are not yet prepared for. Consultants who meet the gates advance. Those who need more development get it, without judgment.'
  },
  {
    icon: <Users className="w-6 h-6 text-[#AC1A5B]" />,
    title: 'We Develop Each Other',
    body: 'Mentorship is a formal responsibility at Levels 2 and 3 — not an informal courtesy. Senior consultants are expected to develop junior ones. The institutional investment in training is returned through the multiplication of quality consulting capacity. A Level 3 consultant who hoards knowledge has missed the point. One who develops two strong Level 2 consultants has created lasting institutional value.'
  },
  {
    icon: <Star className="w-6 h-6 text-[#E5C089]" />,
    title: 'Equity Is Embedded — Not an Add-On',
    body: 'EIS serves organizations working at the intersection of social need, underfunding, and systemic inequity. Our consultants must understand the communities they serve, write with dignity and accuracy about those communities, and recognize the difference between equitable framing and performative language. Equity competency is woven through every module — it is not a standalone topic.'
  }
];

const LEVELS_DATA = {
  'level-1': {
    title: 'Level 1: Foundation Consultants',
    tagline: 'Brand new to grants, proposals, or contracts',
    description: 'Level 1 consultants are building foundational knowledge and supervised competency in the full spectrum of EIS consulting work. They work under direct supervision on assigned sections and tasks, and are not yet authorized to communicate directly with clients, approve deliverables, or work independently.',
    profile: [
      'Brand new to grant writing, proposal development, or contract responses',
      'May have strong writing skills but no strategic or compliance framework',
      'May have some familiarity with nonprofits or public sector without writing experience',
      'Eager to learn and open to structured feedback and supervision'
    ],
    canDo: [
      'Draft assigned narrative sections under supervisor direction',
      'Use EIS templates as provided (no customization)',
      'Complete the EIS QA checklist after review',
      'Conduct research assigned by supervisor',
      'Attend client meetings as observers only',
      'Complete all Modules 1–7 exercises'
    ],
    cannotDo: [
      'Communicate directly with clients without authorization',
      'Modify templates or change proposal structure',
      'Submit or approve any work independently',
      'Make strategic decisions about proposal content',
      'Access Level 2+ modules until promoted',
      'Work on budgets or pricing'
    ],
    promotionGates: [
      'Complete all required outputs for Modules 1–7',
      'Demonstrate consistent voice compliance across 3+ projects',
      'Complete the EIS Level 1 → 2 Competency Assessment',
      'Receive positive evaluation from supervising Level 3 consultant',
      'Demonstrate professional conduct in feedback and revision cycles',
      'Complete at least one full proposal cycle under supervision'
    ],
    modules: [1, 2, 3, 4, 5, 6, 7]
  },
  'level-2': {
    title: 'Level 2: Intermediate Consultants',
    tagline: 'Experienced enough to lead — structured enough to scale',
    description: 'Level 2 consultants lead proposal development for assigned opportunities with supervisor oversight. They have demonstrated foundational competency and are now developing strategic and leadership skills. They begin mentoring Level 1 consultants and take on greater QA responsibility.',
    profile: [
      'Completed Modules 1–7 and Level 1 competency gate',
      'Has experience across at least one full grant and one full proposal cycle',
      'Demonstrates consistent voice, QA discipline, and professional conduct',
      'Ready to begin working more independently with structured supervision'
    ],
    canDo: [
      'Lead proposal development for assigned opportunities with supervisor oversight',
      'Communicate with clients (CC protocols required)',
      'Adapt template language (not structure) with documented rationale',
      'Develop strategy briefs and proposal architectures',
      'Conduct self-QA and peer review of Level 1 work',
      'Formally mentor Level 1 consultants with documentation',
      'Advise on budget-narrative alignment'
    ],
    cannotDo: [
      'Give final QA approval for submission',
      'Approve template structural changes',
      'Make commitments to clients without EIS authorization',
      'Modify budgets independently',
      'Work on Level 3+ modules without advancement',
      'Certify or promote Level 1 consultants'
    ],
    promotionGates: [
      'Complete all required outputs for Modules 8–14',
      'Lead at least 3 successful proposal processes end-to-end',
      'Complete the EIS Level 2 → 3 Competency Assessment',
      'Demonstrate effective mentorship of at least one Level 1 consultant',
      'Receive Level 3 consultant evaluation recommending advancement',
      'Complete advanced strategy brief and capture strategy submissions'
    ],
    modules: [8, 9, 10, 11, 12, 13, 14, 20]
  },
  'level-3': {
    title: 'Level 3: Senior Consultants',
    tagline: 'Trusted, experienced, and institutionally accountable',
    description: 'Level 3 consultants hold final QA authority, lead capture strategy, coach consultants at all levels, and represent EIS in client strategy conversations. They are institutional stewards — responsible for quality, ethics, and the development of the consulting team.',
    profile: [
      'Completed all modules and Level 2 competency gate',
      'Extensive experience across grants, contracts, RFPs, and complex multi-funder projects',
      'Demonstrated mentorship and leadership capacity',
      'Trusted with final QA authority and institutional decision-making'
    ],
    canDo: [
      'Hold final QA authority — no proposal submits without Level 3 clearance',
      'Lead client strategy conversations and make commitments within approved scope',
      'Approve template structural adaptations',
      'Approve strategy briefs and proposal architectures',
      'Design and deliver coaching for Level 1 and 2 consultants',
      'Conduct risk audits and stop submissions when necessary',
      'Advise on pricing, scope, and feasibility',
      'Support EIS training activities under leadership direction'
    ],
    cannotDo: [
      'Independently certify or promote other consultants',
      'Set final EIS pricing without leadership approval',
      'Represent EIS in training authorization independently',
      'Modify training materials without EIS approval',
      'Act outside the scope of authorized EIS work'
    ],
    promotionGates: [
      'Complete all required outputs for Modules 15–19',
      'Lead complex multi-consultant, multi-funder projects successfully',
      'Demonstrate final QA authority competency across 5+ submissions',
      'Receive EIS leadership confirmation of Level 3 authorization',
      'Complete comprehensive competency portfolio review'
    ],
    modules: [15, 16, 17, 18, 19]
  }
};

const EXPECTATIONS_DATA = [
  {
    icon: <Clock className="w-5 h-5 text-[#1E4F58]" />,
    title: 'Timeline & Deadline Discipline',
    content: 'Late work in consulting is not a minor inconvenience — it is a professional failure with cascading consequences. Grant and procurement deadlines are immovable. A proposal submitted 1 minute after deadline is treated identically to one never submitted. Internal deadlines exist to create buffer for review, QA, and revision. Missing internal deadlines removes that buffer and puts the entire submission at risk.',
    items: [
      'Meet all internal deadlines without exception — communicate delays 24+ hours in advance',
      'Build personal calendars around project milestones, not just submission dates',
      'Notify your supervisor immediately if you anticipate a delay — do not wait until it is too late',
      'Treat a missed internal deadline as a serious professional concern, not an administrative issue',
      'Understand that "I was busy" is not an explanation accepted by funders or EIS leadership'
    ]
  },
  {
    icon: <Shield className="w-5 h-5 text-[#AC1A5B]" />,
    title: 'Communication Standards',
    content: 'All client communication is governed by level-based protocols. There are no exceptions based on relationships, convenience, or urgency. The protocols exist to protect the client, protect EIS, and ensure consistent professional representation in every interaction.',
    items: [
      'Follow communication authorization levels without deviation (see Module 11)',
      'CC your EIS supervisor on all client communications until Level 3 authorization',
      'Never make commitments on behalf of EIS without explicit authorization',
      'Document all significant conversations — verbal commitments become institutional risks',
      'Respond to internal communications within 24 business hours',
      'Professional tone is non-negotiable — no casual language in client-facing communications'
    ]
  },
  {
    icon: <BookOpen className="w-5 h-5 text-[#143A50]" />,
    title: 'Quality Standards',
    content: 'Every consultant is responsible for the quality of their work before it reaches a supervisor or client. Submitting work that has not been self-reviewed is a professional standard violation. EIS operates a zero-tolerance policy for placeholder text, RFP non-compliance, and uncited claims in final submissions.',
    items: [
      'Complete the EIS QA checklist before submitting any draft for internal review',
      'Never submit work with placeholder text, incomplete sections, or unanswered prompts',
      'All factual claims must be cited — no unverifiable statements in final drafts',
      'Voice compliance (Module 4) is required in all submissions',
      'Revision is not optional — incomplete revision is a professional standard violation',
      'Quality is the floor, not the ceiling — always aim to exceed it'
    ]
  },
  {
    icon: <Users className="w-5 h-5 text-[#1E4F58]" />,
    title: 'Collaboration & Team Conduct',
    content: 'Consulting at EIS is team-based. Even solo projects exist within an institutional framework of review, mentorship, and quality oversight. Consultants who cannot collaborate effectively — who resist feedback, guard their work, or undermine peers — are not effective EIS consultants, regardless of their individual writing skill.',
    items: [
      'Receive and act on feedback professionally — defensiveness is not acceptable',
      'Maintain complete change logs for all revisions',
      'Support junior consultants actively — mentorship is a professional responsibility',
      'Share institutional knowledge — knowledge hoarding weakens the team',
      'Escalate concerns through appropriate channels rather than working around them',
      'Represent EIS\'s values in all professional interactions'
    ]
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    title: 'Non-Negotiable Conduct Rules',
    content: 'The following conduct standards apply to all consultants at all levels. Violation of these standards is grounds for immediate removal from active projects and may result in removal from the EIS consulting team.',
    critical: true,
    items: [
      '❌ Do not submit any work under your own name that was produced by another person without disclosure',
      '❌ Do not accept contingency fees based on award outcomes — this is an ethics violation',
      '❌ Do not disclose client information to unauthorized parties',
      '❌ Do not communicate with funders on behalf of a client without EIS authorization',
      '❌ Do not represent yourself as holding certifications or authorizations you do not have',
      '❌ Do not use EIS intellectual property (templates, frameworks, curricula) outside of authorized EIS work'
    ]
  }
];

const FORMAT_DATA = [
  {
    title: 'Training Delivery Model',
    icon: <Layers className="w-5 h-5 text-[#1E4F58]" />,
    description: 'EIS consultant training is delivered through a blended, competency-based model. It is not a class you attend — it is a progression you earn.',
    items: [
      { label: 'Self-Study Modules', detail: 'Each module includes readings, frameworks, and examples accessed asynchronously through this platform. Consultants complete modules at their own pace within program timelines.' },
      { label: 'Applied Exercises', detail: 'Every module requires at least one practical output — a draft, an analysis, a plan, or a simulation exercise. Exercises are reviewed by a supervising consultant.' },
      { label: 'Live Project Integration', detail: 'Learning is accelerated through real project assignments. Level 1 consultants begin working on supervised tasks as early as Week 2 of onboarding.' },
      { label: 'Competency Assessments', detail: 'Level advancement requires passing a formal competency assessment designed by EIS leadership. Assessments are not self-reported — they are evaluated by a qualified reviewer.' },
      { label: 'Mentorship Pairing', detail: 'All Level 1 consultants are paired with a Level 2 or 3 mentor for the duration of their Level 1 training. Mentor assignments are made by EIS leadership.' }
    ]
  },
  {
    title: 'Module Completion Requirements',
    icon: <CheckCircle2 className="w-5 h-5 text-[#AC1A5B]" />,
    description: 'A module is considered "complete" only when all required outputs have been submitted and reviewed. Reading a module does not constitute completion.',
    items: [
      { label: 'Required Outputs', detail: 'Each module specifies required deliverables. These must be submitted through the designated EIS tracking system and reviewed by an authorized reviewer.' },
      { label: 'Revision Policy', detail: 'Outputs may be returned for revision. Revision is expected and does not indicate failure — it indicates that the consultant is learning. Failure to revise is the concern.' },
      { label: 'Timeline Expectations', detail: 'Level 1 consultants are expected to complete Modules 1–7 within their first 60 days of engagement. Level 2 modules (8–14) within 90 days of Level 1 promotion.' },
      { label: 'Documentation', detail: 'All module completions are documented in the consultant\'s training record maintained by EIS leadership. This record informs promotion decisions.' }
    ]
  },
  {
    title: 'Assessment & Promotion Process',
    icon: <TrendingUp className="w-5 h-5 text-[#143A50]" />,
    description: 'Promotion from one level to the next is a structured, evidence-based process. It is not automatic, not negotiated, and not based on time alone.',
    items: [
      { label: 'Self-Assessment Submission', detail: 'Consultants seeking promotion submit a self-assessment documenting completion of all module outputs and satisfaction of all promotion gates.' },
      { label: 'Supervisor Review', detail: 'The supervising Level 3 consultant or EIS leadership reviews the self-assessment against the consultant\'s actual work product and professional conduct record.' },
      { label: 'Formal Assessment', detail: 'An EIS-designed competency assessment is administered. The assessment includes written exercises, case analysis, and knowledge verification relevant to the target level.' },
      { label: 'Promotion Decision', detail: 'Promotion decisions are made by EIS leadership. There is no appeal process, but consultants may request written feedback on any area needing development.' },
      { label: 'Timeline', detail: 'Assessments are offered quarterly. Consultants who do not pass may reapply at the next assessment cycle with documented evidence of development.' }
    ]
  },
  {
    title: 'Use of AI Tools in Consulting Work',
    icon: <Sparkles className="w-5 h-5 text-[#E5C089] fill-[#E5C089]" />,
    description: 'EIS permits the use of AI tools as research and drafting support instruments. AI tools do not replace consultant judgment, compliance responsibility, or quality standards.',
    items: [
      { label: 'Permitted Uses', detail: 'AI tools may be used for: initial research support, outlining narrative structure, checking draft language for clarity, and grammar review. All AI-assisted content must be reviewed, fact-checked, and rewritten to meet EIS voice standards.' },
      { label: 'Prohibited Uses', detail: 'AI tools may NOT be used to: generate data or statistics presented as verified fact, produce compliance language without human verification, replace the consultant\'s strategic thinking, or submit work that has not been substantively reviewed.' },
      { label: 'Disclosure', detail: 'AI-assisted work must be disclosed in the consultant\'s internal submission notes. Clients are informed of EIS\'s AI use policy at engagement initiation.' },
      { label: 'Quality Standard Still Applies', detail: 'AI-generated content that does not meet EIS quality standards is rejected — regardless of how quickly it was produced. The quality bar does not change based on the production method.' }
    ]
  }
];

export default function TrainingFrameworkPage() {
  const [activeTab, setActiveTab] = useState('philosophy');
  const [expandedModules, setExpandedModules] = useState(new Set());

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: onboarding } = useQuery({
    queryKey: ['consultant-onboarding', user?.email],
    queryFn: () => base44.entities.ConsultantOnboarding.filter({ consultant_email: user?.email }).then(r => r[0]),
    enabled: !!user?.email,
  });

  const currentLevel = onboarding?.current_level;

  const toggleAllModules = (expand) => {
    if (expand) {
      setExpandedModules(new Set(MODULES_DATA.map(m => m.number)));
    } else {
      setExpandedModules(new Set());
    }
  };

  const level1Modules = MODULES_DATA.filter(m => !m.levelRequired);
  const level2Modules = MODULES_DATA.filter(m => m.levelRequired === 'level-2');
  const level3Modules = MODULES_DATA.filter(m => m.levelRequired === 'level-3');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E4F58] to-[#143A50] flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#143A50]">EIS Consultant Training Framework</h1>
              <p className="text-slate-600 mt-1">Grant Writing, Proposals & Procurement — Pitches to Contracts</p>
            </div>
          </div>

          {currentLevel && (
            <div className="flex items-center gap-3 mt-4 p-3 bg-white rounded-xl border border-slate-200 shadow-sm w-fit">
              <span className="text-sm text-slate-500">Your Current Level:</span>
              <Badge className={LEVEL_COLORS[currentLevel].badge + ' text-white px-3 py-1'}>
                {LEVEL_COLORS[currentLevel].icon} {currentLevel === 'level-1' ? 'Level 1: Foundation' : currentLevel === 'level-2' ? 'Level 2: Intermediate' : 'Level 3: Senior'}
              </Badge>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1 h-auto">
            <TabsTrigger value="curriculum-map" className="text-xs py-2">Curriculum Map</TabsTrigger>
            <TabsTrigger value="philosophy" className="text-xs py-2">Philosophy</TabsTrigger>
            <TabsTrigger value="levels" className="text-xs py-2">Levels</TabsTrigger>
            <TabsTrigger value="modules" className="text-xs py-2">Modules</TabsTrigger>
            <TabsTrigger value="expectations" className="text-xs py-2">Expectations</TabsTrigger>
            <TabsTrigger value="format" className="text-xs py-2">Format</TabsTrigger>
          </TabsList>

          {/* ── CURRICULUM MAP ── */}
          <TabsContent value="curriculum-map">
            <VisualCurriculumMap currentLevel={currentLevel} />
          </TabsContent>

          {/* ── PHILOSOPHY ── */}
          <TabsContent value="philosophy" className="space-y-6">
            <Card className="border-2 border-[#1E4F58] shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-7 h-7 text-[#E5C089]" />
                  <div>
                    <CardTitle className="text-2xl text-white">Training Philosophy</CardTitle>
                    <p className="text-white/80 text-sm mt-1">The foundational beliefs that govern how we develop consultants at EIS</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="p-6 bg-[#143A50]/5 border-b border-[#1E4F58]/20">
                  <p className="text-slate-700 text-base leading-relaxed italic">
                    "EIS trains consultants to translate vision into fundable strategy — not just to write well, but to think strategically, act ethically, and deliver results that create lasting institutional value for the organizations we serve."
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6 pt-6">
                  {PHILOSOPHY.map((p, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                        {p.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#143A50] mb-2">{p.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{p.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Core Commitments */}
            <Card className="border border-slate-200 shadow-md">
              <CardHeader className="bg-slate-50">
                <CardTitle className="text-[#143A50] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Core Commitments of an EIS Consultant
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'I write for the evaluator, not for myself',
                    'I protect client dignity in every word I write',
                    'I follow protocols because they exist for a reason',
                    'I receive feedback as professional development',
                    'I escalate concerns rather than work around them',
                    'I hold myself to the same standards I hold others',
                    'I never let a deadline pass without communication',
                    'I treat quality as a baseline, not a stretch goal',
                    'I develop the consultants around me'
                  ].map((commitment, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-[#143A50]/5 rounded-lg">
                      <ChevronRight className="w-4 h-4 text-[#1E4F58] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700 font-medium">{commitment}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── LEVELS ── */}
          <TabsContent value="levels" className="space-y-6">
            {(['level-1', 'level-2', 'level-3']).map((level) => {
              const data = LEVELS_DATA[level];
              const colors = LEVEL_COLORS[level];
              const isCurrentLevel = currentLevel === level;

              return (
                <Card key={level} className={`border-2 ${colors.border} shadow-lg ${isCurrentLevel ? 'ring-2 ring-offset-2 ring-[#AC1A5B]' : ''}`}>
                  <CardHeader className={`${colors.bg}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        {level === 'level-1' && <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center"><Target className="w-6 h-6 text-white" /></div>}
                        {level === 'level-2' && <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-white" /></div>}
                        {level === 'level-3' && <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center"><Award className="w-6 h-6 text-white" /></div>}
                        <div>
                          <CardTitle className={`text-2xl ${colors.text}`}>{colors.icon} {data.title}</CardTitle>
                          <p className="text-sm text-slate-600 mt-0.5 italic">{data.tagline}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {isCurrentLevel && <Badge className="bg-[#AC1A5B] text-white">Your Level</Badge>}
                        <Badge variant="outline" className={`${colors.text} border-current`}>Modules {data.modules[0]}–{data.modules[data.modules.length - 1]}</Badge>
                      </div>
                    </div>
                    <p className="text-slate-700 mt-3 leading-relaxed">{data.description}</p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Who This Level Is */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                          <Users className="w-4 h-4 text-slate-500" /> Consultant Profile
                        </h4>
                        <ul className="space-y-2">
                          {data.profile.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                              <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Can Do */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                          <CheckCircle2 className="w-4 h-4 text-green-600" /> Authorized Activities
                        </h4>
                        <ul className="space-y-2">
                          {data.canDo.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Cannot Do */}
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <AlertTriangle className="w-4 h-4" /> Not Yet Authorized
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {data.cannotDo.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-red-800">
                            <span className="text-red-400 font-bold flex-shrink-0">✗</span>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Promotion Gates */}
                    <div className="mt-6 p-4 bg-slate-900 rounded-xl">
                      <h4 className="font-bold text-[#E5C089] mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <ArrowRight className="w-4 h-4" /> Promotion Gates to Next Level
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {data.promotionGates.map((gate, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-200">
                            <span className="text-[#E5C089] font-bold flex-shrink-0">→</span>
                            {gate}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* ── MODULES ── */}
          <TabsContent value="modules" className="space-y-6">
            {/* Summary header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Level 1 Modules', count: level1Modules.length, desc: 'All Consultants', color: 'border-green-300 bg-green-50', text: 'text-green-800' },
                { label: 'Level 2 Modules', count: level2Modules.length, desc: 'Intermediate+', color: 'border-blue-300 bg-blue-50', text: 'text-blue-800' },

                { label: 'Level 3 Modules', count: level3Modules.length, desc: 'Senior Only', color: 'border-purple-300 bg-purple-50', text: 'text-purple-800' }
              ].map(item => (
                <Card key={item.label} className={`border-2 ${item.color}`}>
                  <CardContent className="p-4 text-center">
                    <p className={`text-4xl font-bold ${item.text}`}>{item.count}</p>
                    <p className={`font-semibold ${item.text}`}>{item.label}</p>
                    <p className="text-slate-500 text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => toggleAllModules(true)} className="text-xs text-[#1E4F58] underline hover:no-underline">Expand All</button>
              <span className="text-slate-300">|</span>
              <button onClick={() => toggleAllModules(false)} className="text-xs text-[#1E4F58] underline hover:no-underline">Collapse All</button>
            </div>

            {/* Level 1 Group */}
            <div>
              <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center"><span className="text-white text-sm font-bold">1</span></div>
                <div>
                  <h3 className="font-bold text-green-900">Level 1 — Foundation Modules (Modules 1–7)</h3>
                  <p className="text-sm text-green-700">Required for all consultants. Complete before advancing to Level 2.</p>
                </div>
              </div>
              <div className="space-y-3">
                {level1Modules.map(m => (
                  <ModuleDetailView key={m.number} moduleNumber={m.number} currentLevel={currentLevel} defaultExpanded={expandedModules.has(m.number)} />
                ))}
              </div>
            </div>

            {/* Level 2 Group */}
            <div>
              <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center"><span className="text-white text-sm font-bold">2</span></div>
                <div>
                  <h3 className="font-bold text-blue-900">Level 2 — Intermediate Modules (Modules 8–14)</h3>
                  <p className="text-sm text-blue-700">Requires Level 1 promotion gate completion.</p>
                </div>
              </div>
              <div className="space-y-3">
                {level2Modules.map(m => (
                  <ModuleDetailView key={m.number} moduleNumber={m.number} currentLevel={currentLevel} defaultExpanded={expandedModules.has(m.number)} />
                ))}
              </div>
            </div>

            {/* Level 3 Group */}
            <div>
              <div className="flex items-center gap-3 mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center"><span className="text-white text-sm font-bold">3</span></div>
                <div>
                  <h3 className="font-bold text-purple-900">Level 3 — Senior Modules (Modules 15–19)</h3>
                  <p className="text-sm text-purple-700">Requires Level 2 promotion gate completion.</p>
                </div>
              </div>
              <div className="space-y-3">
                {level3Modules.map(m => (
                  <ModuleDetailView key={m.number} moduleNumber={m.number} currentLevel={currentLevel} defaultExpanded={expandedModules.has(m.number)} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── EXPECTATIONS ── */}
          <TabsContent value="expectations" className="space-y-6">
            <Card className="border-2 border-[#143A50] shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-7 h-7 text-[#E5C089]" />
                  <div>
                    <CardTitle className="text-2xl text-white">Consultant Expectations</CardTitle>
                    <p className="text-white/80 text-sm mt-1">What EIS expects from every consultant, at every level, every day</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-700 leading-relaxed mb-6">
                  These expectations are not aspirational — they are the minimum standard of professional conduct required to remain an active EIS consultant. They apply regardless of level, project complexity, or workload. Expectations that are met consistently result in advancement. Expectations that are violated consistently result in removal from projects and review by EIS leadership.
                </p>
              </CardContent>
            </Card>

            {EXPECTATIONS_DATA.map((section, idx) => (
              <Card key={idx} className={`shadow-md ${section.critical ? 'border-2 border-red-300 bg-red-50/20' : 'border border-slate-200'}`}>
                <CardHeader className={section.critical ? 'bg-red-50' : 'bg-slate-50'}>
                  <CardTitle className={`flex items-center gap-3 ${section.critical ? 'text-red-900' : 'text-[#143A50]'}`}>
                    {section.icon}
                    {section.title}
                    {section.critical && <Badge className="bg-red-600">Non-Negotiable</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <p className="text-slate-700 leading-relaxed mb-5">{section.content}</p>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className={`flex items-start gap-3 p-3 rounded-lg ${section.critical ? 'bg-red-50 border border-red-200' : 'bg-slate-50 border border-slate-100'}`}>
                        {section.critical
                          ? <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          : <CheckCircle2 className="w-4 h-4 text-[#1E4F58] flex-shrink-0 mt-0.5" />
                        }
                        <span className={`text-sm ${section.critical ? 'text-red-800 font-medium' : 'text-slate-700'}`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ── FORMAT ── */}
          <TabsContent value="format" className="space-y-6">
            <Card className="border-2 border-[#1E4F58] shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Layers className="w-7 h-7 text-[#E5C089]" />
                  <div>
                    <CardTitle className="text-2xl text-white">Training Format & Structure</CardTitle>
                    <p className="text-white/80 text-sm mt-1">How this training works, what is required, and how advancement is determined</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-700 leading-relaxed">
                  EIS training is competency-based, not time-based. You advance when you demonstrate the competencies required for the next level — not when a fixed period of time has passed. This framework is designed to develop real consulting capability through structured learning, practical exercises, and live project experience.
                </p>
              </CardContent>
            </Card>

            {FORMAT_DATA.map((section, idx) => (
              <Card key={idx} className="shadow-md border border-slate-200">
                <CardHeader className="bg-slate-50">
                  <CardTitle className="text-[#143A50] flex items-center gap-3">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 mt-1">{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="space-y-4">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-[#143A50] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm mb-1">{item.label}</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Quick Reference */}
            <Card className="border-2 border-[#E5C089] bg-amber-50/30 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#143A50] flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#E5C089]" />
                  Quick Reference: Module Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#143A50] text-white">
                        <th className="p-3 text-left rounded-tl-lg">Level</th>
                        <th className="p-3 text-left">Modules</th>
                        <th className="p-3 text-left">Target Completion</th>
                        <th className="p-3 text-left rounded-tr-lg">Gate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200 bg-green-50/50">
                        <td className="p-3 font-semibold text-green-800">🟢 Level 1</td>
                        <td className="p-3 text-slate-700">Modules 1–7</td>
                        <td className="p-3 text-slate-700">Within 60 days of onboarding</td>
                        <td className="p-3 text-slate-700">Level 1 Competency Assessment</td>
                      </tr>
                      <tr className="border-b border-slate-200 bg-blue-50/50">
                        <td className="p-3 font-semibold text-blue-800">🔵 Level 2</td>
                        <td className="p-3 text-slate-700">Modules 8–14</td>
                        <td className="p-3 text-slate-700">Within 90 days of Level 1 promotion</td>
                        <td className="p-3 text-slate-700">Level 2 Competency Assessment</td>
                      </tr>
                      <tr className="bg-purple-50/50">
                        <td className="p-3 font-semibold text-purple-800">🟣 Level 3</td>
                        <td className="p-3 text-slate-700">Modules 15–19</td>
                        <td className="p-3 text-slate-700">Within 120 days of Level 2 promotion</td>
                        <td className="p-3 text-slate-700">Level 3 Competency Assessment + Portfolio Review</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}