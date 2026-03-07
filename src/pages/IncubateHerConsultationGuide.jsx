import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, Lightbulb, FileText, Users,
  Target, MessageSquare, ChevronDown, ChevronUp, Clock,
  BookOpen, Briefcase, ArrowRight, Star
} from 'lucide-react';

const SECTIONS = [
  {
    id: 'what-is',
    icon: <BookOpen className="w-5 h-5 text-[#1E4F58]" />,
    title: 'What the One-on-One Consultation Is',
    color: 'border-l-[#143A50]',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          Your one-on-one consultation is a <strong>focused, expert strategy session</strong> with Dr. Elbert (or an authorized EIS consultant) designed to give you personalized guidance based on where you are in your funding readiness journey.
        </p>
        <p className="text-slate-700 leading-relaxed">
          This is not a generic Q&A — it is a structured, professional conversation that only works when <em>you</em> come prepared. The more specifically you can articulate your goals, your current situation, and the questions you need answered, the more value you will walk away with.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> What IS Included
            </h4>
            <ul className="space-y-2 text-sm text-green-800">
              {[
                'Review and feedback on 1–2 documents you bring (drafts welcome)',
                'Strategic guidance on grants vs. contracts alignment for your organization',
                'Honest assessment of your funding readiness and capacity gaps',
                'Clarification of next steps and priority areas for strengthening',
                'Personalized recommendations based on your program, goals, and org type',
                'Answers to your 2–3 most important questions — in depth'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> What Is NOT Included
            </h4>
            <ul className="space-y-2 text-sm text-red-800">
              {[
                'Writing or rewriting grant applications or contracts for you',
                'Conducting grant searches or identifying specific opportunities on your behalf',
                'Ongoing consulting or follow-up sessions beyond the booked time',
                'Finalizing or submitting any documents',
                'Legal, accounting, or financial advice',
                'A guarantee of funding readiness or award outcomes'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500 font-bold flex-shrink-0">✗</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'eligibility',
    icon: <Target className="w-5 h-5 text-[#AC1A5B]" />,
    title: 'Eligibility Requirements',
    color: 'border-l-[#AC1A5B]',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          Consultations are a <strong>program benefit</strong> — not an open booking. To protect the quality and focus of every session, you must complete the following before you can schedule:
        </p>
        <div className="space-y-3">
          {[
            { req: 'Pre-Assessment Completed', why: 'Establishes your baseline funding readiness so the consultant can benchmark your growth.', link: '/IncubateHerPreAssessment' },
            { req: 'Post-Assessment Completed', why: 'Demonstrates that you engaged with the program content — consultations are about applying what you learned, not reviewing it from scratch.', link: '/IncubateHerPostAssessment' },
            { req: 'Program Evaluation Completed', why: 'Your feedback on the program is part of your full participation record and is required for all post-program benefits.', link: '/IncubateHerEvaluation' }
          ].map((item, i) => (
            <div key={i} className="p-4 bg-[#143A50]/5 border border-[#143A50]/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#143A50]" />
                <span className="font-semibold text-[#143A50]">{item.req}</span>
                <Badge className="bg-red-100 text-red-700 text-xs">Required</Badge>
              </div>
              <p className="text-sm text-slate-600 ml-6">{item.why}</p>
            </div>
          ))}
        </div>
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl">
          <p className="text-sm text-amber-900 font-medium">
            ⚠️ You cannot unlock the consultation booking form until all three requirements are complete. Check your status on the <Link to={createPageUrl('IncubateHerCompletion')} className="underline font-semibold">Completion Tracker</Link>.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'prep-checklist',
    icon: <FileText className="w-5 h-5 text-[#1E4F58]" />,
    title: 'The Full Preparation Checklist',
    color: 'border-l-[#1E4F58]',
    content: (
      <div className="space-y-6">
        <p className="text-slate-700 leading-relaxed">
          This checklist exists because <strong>unprepared consultations waste everyone's time</strong> — including yours. Participants who arrive without documents, without clear questions, or without a basic understanding of their organizational structure use their session time on setup rather than strategy. Don't let that be you.
        </p>

        {[
          {
            section: 'Business & Legal Structure',
            color: 'bg-blue-50 border-blue-200',
            titleColor: 'text-blue-900',
            items: [
              { item: 'Know your legal structure (LLC, nonprofit 501(c)(3), sole proprietor, S-Corp, cooperative, etc.)', detail: 'If you\'re unsure, look up your state registration. This determines which funding types you\'re eligible for.' },
              { item: 'Confirm your business or organization is registered and in good standing', detail: 'Check with your Secretary of State. Lapsed registrations disqualify you from most public funding.' },
              { item: 'Know your EIN (Employer Identification Number)', detail: 'Required for virtually all grant and contract applications. Available on your IRS confirmation letter or via IRS.gov.' },
              { item: 'Know your DUNS/SAM.gov registration status (if pursuing federal contracts or grants)', detail: 'Federal procurement requires SAM.gov registration. Allow 10–14 business days if you need to register.' }
            ]
          },
          {
            section: 'Funding Goals & Priorities',
            color: 'bg-purple-50 border-purple-200',
            titleColor: 'text-purple-900',
            items: [
              { item: 'Identify whether you are pursuing grants, contracts, or both', detail: 'Grants and contracts require different readiness profiles. Know which lane(s) apply to you and why.' },
              { item: 'Have a specific program, project, or initiative in mind', detail: 'The more specific your ask, the more useful the guidance. "I want to fund my after-school tutoring program" is infinitely more useful than "I need funding."' },
              { item: 'Know the approximate funding amount you are seeking', detail: 'Funding scale affects strategy. A $10,000 community foundation grant requires a different approach than a $500,000 federal contract.' },
              { item: 'Identify 1–2 specific funders or opportunity types you are interested in', detail: 'If you have already done research, bring it. If not, be prepared to describe your target funder profile.' }
            ]
          },
          {
            section: 'Documents to Bring (1–2 Maximum)',
            color: 'bg-green-50 border-green-200',
            titleColor: 'text-green-900',
            items: [
              { item: 'Business or organizational overview (1–2 pages)', detail: 'A summary of who you are, what you do, who you serve, and how long you\'ve been operating. Drafts are acceptable.' },
              { item: 'Draft project description or scope of work', detail: 'A description of the specific program, service, or project you want to fund. Even a rough outline is helpful.' },
              { item: 'Budget outline or budget narrative (if available)', detail: 'Even a ballpark number with major line items helps. You don\'t need a finished budget — an approximation works.' },
              { item: 'Any existing grant application or proposal draft you want reviewed', detail: 'If you have started writing, bring it — even if it\'s incomplete. Feedback on a draft is more actionable than general advice.' }
            ]
          },
          {
            section: 'Your Questions (Bring Exactly 2–3)',
            color: 'bg-amber-50 border-amber-200',
            titleColor: 'text-amber-900',
            items: [
              { item: 'Write your questions down in advance — do not try to remember them in the moment', detail: 'Specific written questions help the consultant give you specific answers. Vague questions get vague answers.' },
              { item: 'Prioritize: your most important question should be Question #1', detail: 'If time runs short, you will always get the answer that matters most.' },
              { item: 'Focus questions on strategy and readiness, not on "where do I find grants?"', detail: 'The consultant can help you position yourself to win — not conduct a search for you during the session.' },
              { item: 'Example strong questions:', detail: '"Based on my organizational profile, am I better positioned for foundation grants or government contracts right now, and why?" / "Here is my project description — what is the weakest part from a funder\'s perspective?" / "What is the single most important thing I need to strengthen before I apply anywhere?"' }
            ]
          }
        ].map((section, si) => (
          <div key={si} className={`p-5 border rounded-xl ${section.color}`}>
            <h4 className={`font-bold mb-4 ${section.titleColor}`}>{section.section}</h4>
            <div className="space-y-3">
              {section.items.map((it, ii) => (
                <div key={ii} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-current flex-shrink-0 mt-0.5 opacity-60" />
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{it.item}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed italic">{it.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl">
          <p className="text-sm text-red-900 font-semibold">
            ⚠️ Participants who arrive without completing this checklist may be asked to reschedule. The consultant's time is reserved for prepared participants.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'day-of',
    icon: <Clock className="w-5 h-5 text-[#143A50]" />,
    title: 'Day-Of Preparation',
    color: 'border-l-amber-500',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          Preparation doesn't end when you submit your availability. How you show up on the day of the consultation matters just as much as what you prepare in advance.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: '24 Hours Before',
              items: [
                'Confirm your appointment details (date, time, meeting link or address)',
                'Gather and review the documents you plan to bring — re-read them so you can speak to them fluently',
                'Finalize your 2–3 questions — write them on paper or in a note you can reference',
                'Test your technology if meeting virtually (camera, microphone, internet connection)',
                'Block 90 minutes on your calendar — 60 for the session, 30 for notes and debrief after'
              ]
            },
            {
              title: 'Day Of',
              items: [
                'Log in or arrive 5 minutes early — not 15 minutes late',
                'Have your documents open and ready to share',
                'Have your questions visible in front of you',
                'Minimize distractions — close other tabs, silence your phone, find a quiet location',
                'Bring a notepad or open a note-taking app — you will want to capture the guidance you receive',
                'Be prepared to be honest about where you are, not where you wish you were'
              ]
            }
          ].map((col, i) => (
            <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <h4 className="font-bold text-[#143A50] mb-3 text-sm uppercase tracking-wide">{col.title}</h4>
              <ul className="space-y-2">
                {col.items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-2 text-sm text-slate-700">
                    <ArrowRight className="w-3 h-3 text-[#1E4F58] mt-1 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'during',
    icon: <MessageSquare className="w-5 h-5 text-[#AC1A5B]" />,
    title: 'During the Consultation',
    color: 'border-l-[#AC1A5B]',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          The consultation is a professional conversation, not a lecture. You will get more out of it if you are an active, honest participant — not a passive recipient waiting to be told what to do.
        </p>
        <div className="space-y-3">
          {[
            { title: 'Lead with your most important question first', body: 'Don\'t save your biggest question for the end. If you run short on time, you want to have addressed what matters most. State your priority question within the first 5 minutes.' },
            { title: 'Be specific and honest — not optimistic', body: 'Don\'t describe your organization as more ready than it is. If your financials are a mess, say so. If you haven\'t started a project description yet, say so. The consultant\'s guidance is only as good as the reality you give them to work with.' },
            { title: 'Take notes in real time', body: 'You will not remember everything that is said — especially under the intensity of a focused session. Write down key recommendations, specific resources mentioned, and action items as they arise.' },
            { title: 'Ask for clarification when you don\'t understand', body: 'If the consultant uses a term you don\'t know or gives advice that\'s unclear, ask them to explain. This session is for you — there are no wrong questions.' },
            { title: 'Do not spend time narrating your organization\'s full history', body: 'The consultant does not need a comprehensive background presentation. Focus on the specific issue or question you came to address. The more focused your time, the more actionable the outcome.' },
            { title: 'End by summarizing your action items out loud', body: 'Before the session closes, say out loud: "Based on our conversation, here is what I\'m taking away as my top 3 action items." This ensures alignment and gives the consultant a chance to correct or refine your takeaways.' }
          ].map((tip, i) => (
            <div key={i} className="p-4 border-l-4 border-[#143A50] bg-[#143A50]/5 rounded-r-lg">
              <p className="font-semibold text-sm text-[#143A50] mb-1">{tip.title}</p>
              <p className="text-sm text-slate-700">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'after',
    icon: <Star className="w-5 h-5 text-[#E5C089]" />,
    title: 'After the Consultation',
    color: 'border-l-[#E5C089]',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          The consultation is only valuable if you act on what you learned. Most of the impact happens <em>after</em> the session, not during it.
        </p>
        <div className="space-y-3">
          {[
            { title: 'Within 24 hours: Organize your notes', body: 'While the session is fresh, organize your notes into a clean action list. Group items by: (1) Things to do immediately, (2) Things to do within 30 days, (3) Things to research or learn more about.' },
            { title: 'Within 48 hours: Send a brief follow-up thank you', body: 'A short, professional thank-you email to charles@elbertinnovativesolutions.org is appropriate and appreciated. Keep it brief — one or two sentences acknowledging the session and confirming your next step.' },
            { title: 'Create a 30-day action plan', body: 'Pick the top 3 action items from the consultation and assign yourself specific deadlines for each. Write them somewhere you will see them — not just a mental note.' },
            { title: 'Connect what you learned to the rest of the program', body: 'Your consultation guidance should connect to your workbook work, your assessments, and your document development. Use the rest of your program resources to execute the recommendations you received.' },
            { title: 'If you were referred to a resource, actually use it', body: 'Consultants frequently refer participants to specific websites, tools, databases, or documents. Follow through. A referral you never act on is a missed opportunity.' },
            { title: 'Note what is still unclear — and find answers', body: 'The consultation may surface new questions. That\'s good. Write them down and use the program community, EIS resources, or future support opportunities to find answers.' }
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="w-7 h-7 rounded-full bg-[#143A50] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
              <div>
                <p className="font-semibold text-slate-900 text-sm mb-1">{tip.title}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{tip.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'document-types',
    icon: <Briefcase className="w-5 h-5 text-[#1E4F58]" />,
    title: 'Document Guide: What to Bring and Why',
    color: 'border-l-[#1E4F58]',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          Not sure what documents to bring? Here's a plain-language guide to the most common documents participants bring to consultations, what makes each useful, and what the consultant can do with them.
        </p>
        <div className="space-y-3">
          {[
            {
              name: 'Business / Organizational Overview',
              what: 'A 1–2 page document that explains who you are: your mission or purpose, your programs or services, who you serve, your founding year, and your key accomplishments.',
              why: 'Helps the consultant quickly understand your organizational identity and position you for the right funding types.',
              ok: 'A rough draft, a pitch deck summary page, or even a well-organized bullet point list.',
              notOk: 'Nothing — showing up with no written description of your organization forces the consultant to spend session time on basics.'
            },
            {
              name: 'Project Description or Scope of Work',
              what: 'A description of the specific initiative, program, or service you want to fund. Includes: what you\'ll do, who you\'ll serve, how many people, over what timeframe, and expected outcomes.',
              why: 'This is the content the consultant will most directly engage with — assessing its fundability, framing, and alignment to funder priorities.',
              ok: 'An outline, a first draft, or even a detailed paragraph. The more specific, the better.',
              notOk: 'A vague verbal description with no written component — the consultant cannot provide written feedback on content that doesn\'t exist on paper.'
            },
            {
              name: 'Budget Outline or Budget Narrative',
              what: 'A breakdown of how you intend to spend the funding you\'re seeking. Can be as simple as a list of major cost categories with estimated amounts.',
              why: 'Consultants assess whether your budget is realistic, whether costs are allowable for your target funder type, and whether your narrative and budget are aligned.',
              ok: 'A spreadsheet with rough numbers, a narrative list of major cost items, or even a budget from a previous application.',
              notOk: 'A single line saying "we need $50,000" — that is not a budget, it is an amount. The consultant needs to see how you plan to allocate it.'
            },
            {
              name: 'Existing Grant Application or Proposal Draft',
              what: 'A draft of any application you are currently working on or have worked on previously.',
              why: 'Direct feedback on an actual draft is the highest-value use of consultation time. The consultant can identify specific weaknesses, language problems, and compliance concerns.',
              ok: 'Incomplete drafts, rough outlines, or previous applications you want to repurpose.',
              notOk: 'A final, submitted application that cannot be changed — feedback on a closed application has limited actionability.'
            }
          ].map((doc, i) => (
            <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <h5 className="font-bold text-[#143A50] mb-3">{doc.name}</h5>
              <div className="space-y-2 text-sm">
                <div><span className="font-semibold text-slate-800">What it is: </span><span className="text-slate-600">{doc.what}</span></div>
                <div><span className="font-semibold text-slate-800">Why bring it: </span><span className="text-slate-600">{doc.why}</span></div>
                <div className="flex items-start gap-1"><span className="text-green-700 font-semibold">✓ Acceptable: </span><span className="text-slate-600">{doc.ok}</span></div>
                <div className="flex items-start gap-1"><span className="text-red-600 font-semibold">✗ Not sufficient: </span><span className="text-slate-600">{doc.notOk}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'sample-questions',
    icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
    title: 'Sample Questions That Work',
    color: 'border-l-amber-500',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          Not sure how to frame your questions? Here are examples of strong consultation questions and why they work — along with examples of weak questions to avoid.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <h4 className="font-semibold text-green-900 mb-3">Strong Questions</h4>
            <div className="space-y-3">
              {[
                { q: '"Based on my organizational profile, which funding type am I best positioned for right now — foundation grants or government contracts?"', why: 'Specific, strategy-focused, invites expert analysis' },
                { q: '"Here is my project description. What is the weakest section from a funder\'s perspective, and how would you strengthen it?"', why: 'Document-based, actionable, focused' },
                { q: '"What is the single most important thing I need to fix or develop before I apply for any major grant or contract?"', why: 'Priority-focused, honest, leads to a concrete recommendation' },
                { q: '"I\'m interested in this specific funder. What do you know about what they prioritize, and how well do I align?"', why: 'Specific funder context, invites strategic analysis' },
                { q: '"My budget narrative feels weak. Can you help me identify what is missing or unclear?"', why: 'Document-specific, asks for concrete feedback' }
              ].map((item, i) => (
                <div key={i} className="border-l-2 border-green-400 pl-3">
                  <p className="text-sm font-medium text-green-900 italic">{item.q}</p>
                  <p className="text-xs text-green-700 mt-1">→ {item.why}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <h4 className="font-semibold text-red-900 mb-3">Weak Questions (and Why)</h4>
            <div className="space-y-3">
              {[
                { q: '"Where do I find grants?"', why: 'Too broad, not a consultation question — use databases and program resources for this' },
                { q: '"Can you write my grant for me?"', why: 'Not within scope of consultation' },
                { q: '"What grants should I apply for?"', why: 'Too open-ended — you need to bring a target or funding goal for the consultant to work with' },
                { q: '"Am I ready to apply?"', why: 'Without context, this is unanswerable. Bring your documents and a specific opportunity for a real answer' },
                { q: '"Can you explain what a grant is?"', why: 'Background knowledge questions should be addressed through program learning, not consultation time' }
              ].map((item, i) => (
                <div key={i} className="border-l-2 border-red-400 pl-3">
                  <p className="text-sm font-medium text-red-900 italic">{item.q}</p>
                  <p className="text-xs text-red-700 mt-1">→ {item.why}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export default function IncubateHerConsultationGuide() {
  const [expandedSections, setExpandedSections] = useState(new Set(['what-is']));

  const toggleSection = (id) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedSections(new Set(SECTIONS.map(s => s.id)));
  const collapseAll = () => setExpandedSections(new Set());

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader
        title="Consultation Preparation Guide"
        subtitle="Everything you need to know to make the most of your one-on-one session"
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Intro Banner */}
        <div className="p-5 bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white rounded-2xl shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Your consultation is a premium program benefit — treat it that way.</h2>
              <p className="text-white/90 text-sm leading-relaxed">
                Every IncubateHer participant who meets the eligibility requirements earns access to a one-on-one strategy session with an EIS expert. This session is worth hundreds of dollars in consulting value — but only if you arrive prepared. This guide tells you exactly what to do before, during, and after your consultation so you walk away with real, actionable guidance.
              </p>
            </div>
          </div>
        </div>

        {/* Expand/Collapse Controls */}
        <div className="flex justify-end gap-3">
          <button onClick={expandAll} className="text-xs text-[#1E4F58] underline hover:no-underline">Expand All</button>
          <span className="text-slate-300">|</span>
          <button onClick={collapseAll} className="text-xs text-[#1E4F58] underline hover:no-underline">Collapse All</button>
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          return (
            <Card key={section.id} className={`border-l-4 ${section.color} shadow-md`}>
              <CardHeader
                className="cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                      {section.icon}
                    </div>
                    <CardTitle className="text-[#143A50] text-lg">{section.title}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="pt-6">
                  {section.content}
                </CardContent>
              )}
            </Card>
          );
        })}

        {/* CTA */}
        <Card className="border-2 border-[#E5C089] bg-amber-50/30 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#143A50] flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-[#E5C089]" />
              </div>
              <h3 className="text-xl font-bold text-[#143A50]">Ready to Book?</h3>
              <p className="text-slate-600 max-w-lg mx-auto">
                Once you've completed all three required assessments and worked through this preparation guide, head to the Consultations page to submit your availability.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link to={createPageUrl('IncubateHerConsultations')}>
                  <Button className="bg-[#143A50] hover:bg-[#1E4F58]">
                    Go to Consultations Booking
                  </Button>
                </Link>
                <Link to={createPageUrl('IncubateHerCompletion')}>
                  <Button variant="outline">
                    Check My Eligibility Status
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
      <CoBrandedFooter />
    </div>
  );
}