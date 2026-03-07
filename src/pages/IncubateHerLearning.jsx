import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen, CheckCircle2, Clock, Award, Trophy, Lock, Play,
  Video, ChevronRight, Circle, RotateCcw, Calendar, MapPin,
  ExternalLink, ChevronDown, ArrowRight, Star, FileText, Users, Target, MessageSquare, Lightbulb, Briefcase, Globe, Shield, Zap
} from 'lucide-react';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

// ─── Session schedule data ───────────────────────────────────────────────────
const SESSIONS = [
  {
    number: 1,
    title: 'Funding Foundations & Readiness',
    date: 'Monday, March 2, 2026',
    time: '5:30–7:30 PM',
    duration: '2 hrs',
    format: 'virtual',
    sessionKey: 0,
  },
  {
    number: 2,
    title: 'Financial Systems & Funding Mechanics',
    date: 'Thursday, March 5, 2026',
    time: '5:30–7:30 PM',
    duration: '2 hrs',
    format: 'virtual',
    sessionKey: 1,
  },
  {
    number: 3,
    title: 'Application Strategy & Integration',
    date: 'Saturday, March 7, 2026',
    time: '9:00 AM–12:00 PM',
    duration: '3 hrs',
    format: 'in-person',
    location: 'Columbus Metropolitan Library – Shepard Location, Meeting Room 1',
    sessionKey: 2,
  },
];

// ─── Module config ────────────────────────────────────────────────────────────
const MODULE_ORDER = ['monday', 'thursday', 'saturday', 'intro', 'legal', 'financial', 'grants', 'contracts', 'strategy', 'consultation', 'wrap'];
const MODULE_LABELS = {
  monday: 'Session 1 – Foundations & Compliance',
  thursday: 'Session 2 – Financial & Funding Strategy',
  saturday: 'Session 3 – Grant Writing & Planning',
  intro: 'Program Orientation & Funding Foundations',
  legal: 'Legal Structure & Organizational Compliance',
  financial: 'Financial Management & Budget Development',
  grants: 'Grants, Proposals & RFP Fundamentals',
  contracts: 'RFPs & Contract Proposals in Practice',
  strategy: 'Funding Strategy & Long-Term Sustainability',
  consultation: 'Consultation Preparation Lab',
  wrap: 'Program Wrap-Up & Next Steps',
};

// ─── Session Strip ────────────────────────────────────────────────────────────
function SessionStrip({ cohortSessionDays = [] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-8 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 text-white text-left"
        style={{ backgroundColor: BRAND_COLORS.eisNavy }}
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
          <span className="font-semibold text-lg">Program Schedule & Recordings</span>
          <Badge className="text-xs" style={{ backgroundColor: BRAND_COLORS.eisGold + '30', color: BRAND_COLORS.eisGold, border: `1px solid ${BRAND_COLORS.eisGold}50` }}>
            3 Sessions · 7 Hours
          </Badge>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} style={{ color: BRAND_COLORS.eisGold }} />
      </button>

      {/* Session cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white">
        {SESSIONS.map((session) => {
          const cohortDay = cohortSessionDays[session.sessionKey];
          const hasRecording = !!cohortDay?.video_url;
          const hasMeetingLink = !!cohortDay?.meeting_link;

          return (
            <div key={session.number} className="p-5">
              {/* Session number + title */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: BRAND_COLORS.culRed }}
                >
                  {session.number}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm leading-snug">{session.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{session.date}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{session.time}</span>
                <Badge
                  className="text-xs"
                  style={session.format === 'in-person'
                    ? { backgroundColor: BRAND_COLORS.eisGold + '30', color: '#7a5c1e', border: `1px solid ${BRAND_COLORS.eisGold}` }
                    : { backgroundColor: BRAND_COLORS.culRed + '15', color: BRAND_COLORS.culRed, border: `1px solid ${BRAND_COLORS.culRed}30` }
                  }
                >
                  {session.format === 'in-person' ? '📍 In Person' : '💻 Virtual'}
                </Badge>
              </div>

              {session.location && (
                <p className="text-xs text-slate-500 flex items-start gap-1 mb-3">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {session.location}
                </p>
              )}

              {/* Actions */}
              {hasRecording ? (
                <div>
                  <Badge className="bg-green-100 text-green-700 text-xs mb-2">
                    <CheckCircle2 className="w-3 h-3 mr-1" />Recording Available
                  </Badge>
                  {expanded && (
                    <div className="mt-2 rounded-lg overflow-hidden bg-slate-900">
                      <video controls className="w-full" src={cohortDay.video_url}>
                        Your browser does not support video playback.
                      </video>
                    </div>
                  )}
                </div>
              ) : hasMeetingLink ? (
                <a href={cohortDay.meeting_link} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="w-full text-white" style={{ backgroundColor: BRAND_COLORS.culRed }}>
                    <Video className="w-3.5 h-3.5 mr-2" />
                    Join Google Meet
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">Link coming soon</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ content, progress }) {
  const isCompleted = progress?.is_completed;
  const hasStarted = progress && !isCompleted;
  const pct = progress?.progress_percentage || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group">
      <Card className={`h-full border-2 transition-all duration-200 ${isCompleted ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-[#143A50] hover:shadow-md'}`}>
        <CardContent className="p-5 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              {isCompleted ? (
                <Badge className="bg-green-100 text-green-700 border-green-200 mb-2">
                  <CheckCircle2 className="w-3 h-3 mr-1" />Completed
                </Badge>
              ) : hasStarted ? (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-2">
                  <RotateCcw className="w-3 h-3 mr-1" />In Progress
                </Badge>
              ) : (
                <Badge variant="outline" className="mb-2 text-slate-500">
                  <Circle className="w-3 h-3 mr-1" />Not Started
                </Badge>
              )}
            </div>
            {content.duration_minutes && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />{content.duration_minutes}m
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900 mb-2 leading-snug">{content.title}</h3>
          {content.description && (
            <p className="text-sm text-slate-600 mb-4 flex-1 leading-relaxed line-clamp-3">{content.description}</p>
          )}
          {hasStarted && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span><span>{pct}%</span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          )}
          <Link to={`${createPageUrl('IncubateHerCourse')}?id=${content.id}&from=learning`} className="mt-auto">
            <Button
              className="w-full" size="sm"
              style={isCompleted
                ? { backgroundColor: '#e2f4ea', color: '#15803d', border: '1px solid #86efac' }
                : { backgroundColor: BRAND_COLORS.culRed, color: 'white' }
              }
            >
              {isCompleted ? <><RotateCcw className="w-3 h-3 mr-2" />Review</> :
               hasStarted ? <><Play className="w-3 h-3 mr-2" />Continue</> :
               <><Play className="w-3 h-3 mr-2" />Start Course</>}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Consultation Prep Guide (inline) ────────────────────────────────────────
function ConsultationGuideInline() {
  const sections = [
    {
      title: 'What the Consultation IS (and Is NOT)',
      content: (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <h4 className="font-semibold text-green-900 mb-2 text-sm">✓ What IS Included</h4>
            <ul className="space-y-1 text-xs text-green-800">
              {['Review/feedback on 1–2 documents you bring','Strategic guidance on grants vs. contracts alignment','Honest assessment of your funding readiness','Personalized next-step recommendations','Answers to your 2–3 most important questions — in depth'].map((i,k)=><li key={k} className="flex gap-1.5"><span>✓</span>{i}</li>)}
            </ul>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <h4 className="font-semibold text-red-900 mb-2 text-sm">✗ What Is NOT Included</h4>
            <ul className="space-y-1 text-xs text-red-800">
              {['Writing or rewriting grant applications for you','Conducting grant searches on your behalf','Ongoing consulting beyond the booked time','Legal, accounting, or financial advice','A guarantee of funding readiness or award outcomes'].map((i,k)=><li key={k} className="flex gap-1.5"><span>✗</span>{i}</li>)}
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'Eligibility Requirements',
      content: (
        <div className="space-y-2">
          <p className="text-sm text-slate-600 mb-3">You must complete all three before booking:</p>
          {[{r:'Pre-Assessment',d:'Establishes your baseline readiness for the consultant to benchmark growth.'},{r:'Post-Assessment',d:'Demonstrates you engaged with program content — sessions build on what you learned.'},{r:'Program Evaluation',d:'Required for all post-program benefits including the consultation.'}].map((item,i)=>(
            <div key={i} className="flex items-start gap-3 p-3 bg-[#143A50]/5 border border-[#143A50]/20 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-[#143A50] mt-0.5 flex-shrink-0"/>
              <div><span className="font-semibold text-sm text-[#143A50]">{item.r}</span><p className="text-xs text-slate-600 mt-0.5">{item.d}</p></div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Full Preparation Checklist',
      content: (
        <div className="space-y-3">
          {[{label:'Business & Legal',color:'bg-blue-50 border-blue-200',items:['Know your legal structure (LLC, nonprofit 501(c)(3), sole proprietor, etc.)','Confirm your business is registered and in good standing','Know your EIN (Employer Identification Number)','Know your SAM.gov registration status if pursuing federal funding']},{label:'Funding Goals',color:'bg-purple-50 border-purple-200',items:['Identify whether you are pursuing grants, contracts, or both','Have a specific program or initiative in mind to fund','Know the approximate funding amount you are seeking','Identify 1–2 specific funders or opportunity types you are interested in']},{label:'Documents to Bring (1–2 max)',color:'bg-green-50 border-green-200',items:['Business/organizational overview (1–2 pages — drafts OK)','Draft project description or scope of work','Budget outline or budget narrative (even rough numbers)','Any existing grant application or proposal draft']},{label:'Your Questions (exactly 2–3)',color:'bg-amber-50 border-amber-200',items:['Write your questions down — do not try to remember them','Prioritize: your most important question is Question #1','Focus on strategy and readiness, not "where do I find grants?"','Example: "Am I better positioned for grants or contracts right now, and why?"']}].map((s,si)=>(
            <div key={si} className={`p-4 border rounded-xl ${s.color}`}>
              <h5 className="font-bold text-sm text-slate-800 mb-2">{s.label}</h5>
              <ul className="space-y-1">{s.items.map((it,ii)=><li key={ii} className="flex items-start gap-2 text-xs text-slate-700"><div className="w-3.5 h-3.5 rounded border-2 border-slate-400 flex-shrink-0 mt-0.5"/>{it}</li>)}</ul>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'During & After Your Consultation',
      content: (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-bold text-sm text-[#143A50] mb-2">During the Session</h5>
            <ul className="space-y-1.5">{['Lead with your most important question first','Be specific and honest — not optimistic','Take notes in real time','Ask for clarification when unclear','End by summarizing your 3 action items out loud'].map((t,i)=><li key={i} className="text-xs text-slate-700 flex gap-2"><ArrowRight className="w-3 h-3 text-[#1E4F58] mt-0.5 flex-shrink-0"/>{t}</li>)}</ul>
          </div>
          <div>
            <h5 className="font-bold text-sm text-[#143A50] mb-2">After the Session</h5>
            <ul className="space-y-1.5">{['Within 24 hrs: organize notes into an action list','Within 48 hrs: send a brief thank-you email','Create a 30-day action plan with specific deadlines','Connect guidance back to your workbook and documents','Follow up on any resources or referrals mentioned'].map((t,i)=><li key={i} className="text-xs text-slate-700 flex gap-2"><ArrowRight className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0"/>{t}</li>)}</ul>
          </div>
        </div>
      )
    },
    {
      title: 'Sample Strong Questions',
      content: (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="font-semibold text-xs text-green-900 mb-2">✓ Strong Questions</p>
            {['"Based on my profile, am I better positioned for foundation grants or government contracts right now?"','"Here is my project description. What is the weakest section from a funder\'s perspective?"','"What is the single most important thing I need to fix before applying anywhere?"'].map((q,i)=><p key={i} className="text-xs text-green-800 italic mb-1.5 border-l-2 border-green-400 pl-2">{q}</p>)}
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="font-semibold text-xs text-red-900 mb-2">✗ Weak Questions (avoid)</p>
            {['"Where do I find grants?" — too broad, use databases for this','"Can you write my grant for me?" — not in scope','"Am I ready to apply?" — without documents and context, unanswerable'].map((q,i)=><p key={i} className="text-xs text-red-800 mb-1.5 border-l-2 border-red-400 pl-2">{q}</p>)}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="p-5 bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white rounded-xl">
        <h3 className="text-lg font-bold mb-1">Your consultation is a premium program benefit — arrive prepared.</h3>
        <p className="text-white/80 text-sm">Work through this guide before booking your one-on-one session with Dr. Elbert or an EIS consultant.</p>
      </div>
      {sections.map((s, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h4 className="font-bold text-[#143A50] mb-3">{s.title}</h4>
          {s.content}
        </div>
      ))}
      <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-center">
        <p className="text-sm font-semibold text-amber-900 mb-2">Ready to book your consultation?</p>
        <Link to={createPageUrl('IncubateHerConsultations')} className="inline-block">
          <Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58] text-white">Go to Consultations Booking</Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Post-Program / Wrap Guide (inline) ──────────────────────────────────────
function WrapGuideInline() {
  const sections = [
    {
      title: "What You've Accomplished",
      content: (
        <div className="grid md:grid-cols-2 gap-2">
          {['Built foundational literacy in how grants and contracts work','Learned how funders evaluate applicants','Developed or strengthened your funding documents','Completed pre/post assessments and tracked your growth','Received personalized consultation feedback','Connected with peers navigating the same landscape','Established knowledge most competitors in the funding space lack','Demonstrated discipline to complete a structured program'].map((item,i)=>(
            <div key={i} className="flex items-start gap-2 p-2.5 bg-[#E5C089]/20 border border-[#E5C089]/40 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#143A50] mt-0.5 flex-shrink-0"/>
              <span className="text-xs text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Your First 30 Days: Priority Actions',
      content: (
        <div className="space-y-3">
          {[{days:'Days 1–7',color:'bg-green-50 border-green-300',title:'Consolidate & Organize',actions:['Gather all program materials into one funding readiness file','Review post-assessment results and identify areas still needing work','Write down the 3 most important things from your consultation','Identify any unfinished documents that need to be completed']},{days:'Days 8–14',color:'bg-blue-50 border-blue-300',title:'Finish What You Started',actions:['Complete any program documents still in draft form','Finalize your organizational overview','Clean up your project description so it is submission-ready','Identify your single most important compliance gap and plan to close it']},{days:'Days 15–21',color:'bg-purple-50 border-purple-300',title:'Research & Identify',actions:['Search for 2–3 funding opportunities aligned to your goals (Grants.gov, Foundation Directory)','For each: read the full RFP, check eligibility, note the deadline','Make an honest go/no-go assessment for each opportunity','If you find a strong opportunity with a near deadline — prioritize it']},{days:'Days 22–30',color:'bg-rose-50 border-rose-300',title:'Pursue & Submit',actions:['Start your application for the highest-priority opportunity','Use EIS templates as structural frameworks','Apply the needs statement and outcomes writing practices from the program','Set an internal deadline 5 days before the actual deadline','Submit — even imperfect. A submitted application beats a perfect one never sent']}].map((phase,i)=>(
            <div key={i} className={`p-3 border-2 rounded-xl ${phase.color}`}>
              <div className="flex items-center gap-2 mb-2"><Badge className="bg-slate-800 text-white text-xs">{phase.days}</Badge><span className="font-bold text-sm text-slate-900">{phase.title}</span></div>
              <ul className="space-y-1">{phase.actions.map((a,ai)=><li key={ai} className="flex items-start gap-1.5 text-xs text-slate-700"><ArrowRight className="w-2.5 h-2.5 text-slate-500 mt-0.5 flex-shrink-0"/>{a}</li>)}</ul>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Key Funding Research Resources',
      content: (
        <div className="grid md:grid-cols-2 gap-3">
          {[{name:'Grants.gov',desc:'All federal grant opportunities. Create a free account and set up alerts.',url:'https://www.grants.gov'},{name:'SAM.gov',desc:'Required for federal grants and contracts. Register your organization here.',url:'https://sam.gov'},{name:'Candid / Foundation Directory',desc:'Most comprehensive foundation grants database. Check your library for free access.',url:'https://candid.org'},{name:'SBA.gov',desc:'Loans, surety bonds, and small business programs from the federal government.',url:'https://www.sba.gov/funding-programs'},{name:'MBDA.gov',desc:'Grants, contracts, and resources specifically for minority-owned businesses.',url:'https://www.mbda.gov'},{name:'GrantSpace (Candid Learning)',desc:'Free webinars, guides, and templates covering proposal writing and funder research.',url:'https://grantspace.org'}].map((r,i)=>(
            <div key={i} className="p-3 bg-white border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-1"><span className="font-semibold text-sm text-slate-900">{r.name}</span><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#143A50] underline">Visit →</a></div>
              <p className="text-xs text-slate-600">{r.desc}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Maintaining Organizational Readiness',
      content: (
        <div className="space-y-3">
          {[{cat:'Documentation Hygiene',items:['Keep your org overview current — update whenever programs, leadership, or data change','Maintain a current, board-approved strategic plan — funders ask for this routinely','Keep financial statements audit-ready at all times (current year + 2 prior years)','Maintain a running outcomes database: people served, changes, measurements']},{cat:'Compliance Calendar',items:['Track: state registration renewal dates, SAM.gov expiration (annual), 990 filing deadlines','Set 30-day advance alerts for every compliance deadline — late filings disqualify you','Track your indirect cost rate if pursuing federal grants regularly']},{cat:'Funder Relationship Development',items:['Follow funders on social media. Read their annual reports. Attend their info sessions','If you receive funding: report on time, spend correctly, communicate proactively','If declined, ask professionally for feedback — often more valuable than a small award']}].map((s,si)=>(
            <div key={si} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <h5 className="font-bold text-xs text-slate-800 mb-2 uppercase tracking-wide">{s.cat}</h5>
              <ul className="space-y-1">{s.items.map((it,ii)=><li key={ii} className="flex items-start gap-1.5 text-xs text-slate-700"><div className="w-1.5 h-1.5 rounded-full bg-[#1E4F58] mt-1.5 flex-shrink-0"/>{it}</li>)}</ul>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'The Long-Game Mindset',
      content: (
        <div className="space-y-2">
          {[{t:'Rejection is data, not failure',b:'Ask for reviewer feedback, study funded applications, improve and reapply. An organization that stops after one rejection will never win.'},{t:'Start with smaller, accessible opportunities',b:'Build your track record with appropriately-scaled opportunities. Funders look for track record. You build it by winning smaller awards and executing them well.'},{t:'Relationships compound over time',b:'Funders who see your name and quality work consistently over 2–3 years look at your applications differently. One touchpoint rarely creates a relationship.'},{t:'Quality is always worth the extra hour',b:'The difference between funded and unfunded is often one vague section or one unsupported claim. Don\'t rush the final review.'},{t:'Celebrate every win',b:'A $5,000 seed grant is a win. It\'s a line on your track record and proof your application quality is award-worthy.'}].map((insight,i)=>(
            <div key={i} className="p-3 border-l-4 border-[#E5C089] bg-amber-50/40 rounded-r-lg">
              <p className="font-semibold text-xs text-[#143A50] mb-0.5">{insight.t}</p>
              <p className="text-xs text-slate-700">{insight.b}</p>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="p-5 bg-gradient-to-br from-[#143A50] to-[#AC1A5B]/40 text-white rounded-xl">
        <h3 className="text-lg font-bold mb-1">The program ends. Your journey doesn't.</h3>
        <p className="text-white/80 text-sm">Use this guide to apply what you learned, find opportunities, and stay connected with EIS beyond the program.</p>
      </div>
      {sections.map((s, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h4 className="font-bold text-[#143A50] mb-3">{s.title}</h4>
          {s.content}
        </div>
      ))}
      <div className="p-4 bg-[#143A50]/5 border border-[#143A50]/20 rounded-xl">
        <p className="text-sm font-semibold text-[#143A50] mb-3">Stay connected with EIS</p>
        <div className="flex flex-wrap gap-2">
          <a href="https://www.elbertinnovativesolutions.org/" target="_blank" rel="noopener noreferrer"><Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58] text-white text-xs">Visit EIS Website</Button></a>
          <a href="mailto:info@elbertinnovativesolutions.org"><Button size="sm" variant="outline" className="text-xs">Email EIS</Button></a>
          <Link to={createPageUrl('ResourceLibrary')}><Button size="sm" variant="outline" className="text-xs">Resource Library</Button></Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IncubateHerLearning() {
  const [activeModule, setActiveModule] = useState('all');

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const enrollments = await base44.entities.ProgramEnrollment.filter({ participant_email: user.email });
      return enrollments.find(e => e.cohort_id) || null;
    },
    enabled: !!user?.email
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['incubateher-cohorts'],
    queryFn: () => base44.entities.ProgramCohort.filter({ program_code: 'incubateher_funding_readiness' })
  });
  const cohortSessionDays = cohorts[0]?.session_days || [];

  const { data: learningContent = [], isLoading } = useQuery({
    queryKey: ['incubateher-learning'],
    queryFn: () => base44.entities.LearningContent.filter({ incubateher_only: true })
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', user?.email],
    queryFn: () => base44.entities.UserBadge.filter({ user_email: user.email, program: 'incubateher' }),
    enabled: !!user?.email
  });

  if (!enrollmentLoading && !enrollment) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
        <CoBrandedHeader title="IncubateHer Learning Hub" />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <Card>
            <CardContent className="py-12">
              <Lock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4" style={{ color: BRAND_COLORS.culRed }}>Enrollment Required</h2>
              <p className="text-slate-600">This learning hub is exclusive to IncubateHer program participants.</p>
            </CardContent>
          </Card>
        </div>
        <CoBrandedFooter />
      </div>
    );
  }

  const progressMap = {};
  userProgress.forEach(p => { progressMap[p.content_id] = p; });

  const completedCount = learningContent.filter(c => progressMap[c.id]?.is_completed).length;
  const totalCount = learningContent.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isCULObserver = enrollment?.role === 'cul_observer';

  const grouped = {};
  learningContent.forEach(c => {
    const key = c.agenda_section || 'other';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });

  const availableModules = Object.keys(grouped);
  const sortedModules = [
    ...MODULE_ORDER.filter(k => availableModules.includes(k)),
    ...availableModules.filter(k => !MODULE_ORDER.includes(k))
  ];

  const filteredContent = activeModule === 'all' ? learningContent : (grouped[activeModule] || []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <CoBrandedHeader title="Learning Hub" subtitle="Your IncubateHer curriculum — sessions, recordings & courses" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* CUL Observer Banner */}
        {isCULObserver && (
          <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: BRAND_COLORS.eisGold + '20', borderLeft: `4px solid ${BRAND_COLORS.eisGold}` }}>
            <Badge style={{ backgroundColor: BRAND_COLORS.eisGold, color: 'white' }}>CUL Observer</Badge>
            <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
              You have observer access. You can participate and access all materials, but completion is not required.
            </p>
          </div>
        )}

        {/* ── HERO: Schedule & Sessions ───────────────────────────────────── */}
        <SessionStrip cohortSessionDays={cohortSessionDays} />

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        {!isCULObserver && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Courses Done', value: `${completedCount}/${totalCount}`, icon: BookOpen, color: BRAND_COLORS.culRed },
                { label: 'Points', value: enrollment?.gamification_points || 0, icon: Trophy, color: BRAND_COLORS.eisGold },
                { label: 'Badges', value: badges.length, icon: Award, color: BRAND_COLORS.eisNavy },
                { label: 'Complete', value: `${completionPct}%`, icon: CheckCircle2, color: '#16a34a' },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="border-0 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{value}</p>
                      <p className="text-xs text-slate-500">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Overall Progress</span>
                <span className="text-sm text-slate-500">{completedCount} of {totalCount} courses completed</span>
              </div>
              <Progress value={completionPct} className="h-3 rounded-full" />
            </div>
          </>
        )}

        {/* ── LMS Layout: Sidebar + Courses ───────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <Card className="border-0 shadow-sm sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Modules</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <button
                  onClick={() => setActiveModule('all')}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-1 flex items-center justify-between"
                  style={activeModule === 'all' ? { backgroundColor: BRAND_COLORS.eisNavy, color: 'white' } : { color: '#475569' }}
                >
                  <span>All Courses</span>
                  <Badge className="text-xs" style={activeModule === 'all' ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' } : { backgroundColor: '#f1f5f9', color: '#64748b' }}>
                    {totalCount}
                  </Badge>
                </button>
                {sortedModules.map(key => {
                  const count = grouped[key]?.length || 0;
                  const doneInModule = (grouped[key] || []).filter(c => progressMap[c.id]?.is_completed).length;
                  const isActive = activeModule === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveModule(key)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all mb-1"
                      style={isActive ? { backgroundColor: BRAND_COLORS.culRed, color: 'white' } : { color: '#475569' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate pr-2 font-medium leading-snug">{MODULE_LABELS[key] || key}</span>
                        <span className="text-xs flex-shrink-0" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>{doneInModule}/{count}</span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse" />)}
              </div>
            ) : filteredContent.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-700 mb-2">No courses yet</h3>
                  <p className="text-sm text-slate-500">Courses for this module haven't been added yet. Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-slate-900">
                    {activeModule === 'all' ? 'All Courses' : MODULE_LABELS[activeModule] || activeModule}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{filteredContent.length} course{filteredContent.length !== 1 ? 's' : ''}</p>
                </div>

                {activeModule === 'all' ? (
                  <div className="space-y-8">
                    {sortedModules.map(key => (
                      <div key={key}>
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="font-semibold text-slate-800">{MODULE_LABELS[key] || key}</h3>
                          <div className="flex-1 h-px bg-slate-200" />
                          <span className="text-xs text-slate-400">
                            {(grouped[key] || []).filter(c => progressMap[c.id]?.is_completed).length}/{(grouped[key] || []).length} done
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {(grouped[key] || []).map(content => (
                            <CourseCard key={content.id} content={content} progress={progressMap[content.id]} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredContent.map(content => (
                      <CourseCard key={content.id} content={content} progress={progressMap[content.id]} />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {/* Completion Banner */}
        {!isCULObserver && completionPct === 100 && totalCount > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-10">
            <Card className="border-2 text-center" style={{ borderColor: BRAND_COLORS.eisGold, backgroundColor: BRAND_COLORS.eisGold + '10' }}>
              <CardContent className="py-10">
                <Trophy className="w-14 h-14 mx-auto mb-4" style={{ color: BRAND_COLORS.eisGold }} />
                <h2 className="text-2xl font-bold mb-2" style={{ color: BRAND_COLORS.culRed }}>🎉 You've completed all courses!</h2>
                <p className="text-slate-600 mb-6">You're eligible for your program certificate and the giveaway.</p>
                <Link to={createPageUrl('IncubateHerCompletion')}>
                  <Button size="lg" style={{ backgroundColor: BRAND_COLORS.culRed, color: 'white' }}>
                    View Certificate & Giveaway Status <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <CoBrandedFooter />
    </div>
  );
}