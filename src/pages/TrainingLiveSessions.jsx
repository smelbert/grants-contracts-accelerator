import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Video, Clock, Users, BookOpen, Target, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronUp, FileText, Play, Download, Lightbulb, ArrowRight,
  Star, Shield, Layers
} from 'lucide-react';

const LIVE_SESSIONS = [
  {
    id: 1,
    title: 'Session 1: From RFP to Strategy — Reading What Funders Actually Mean',
    type: 'Strategy Lab',
    level: 'All Levels (Level 1 Required)',
    levelBadge: 'bg-green-600',
    duration: '90 minutes',
    maxParticipants: 12,
    targetModules: [1, 2, 5],
    overview: 'This live session bridges Modules 1, 2, and 5 — moving consultants from theoretical knowledge of funding mechanisms to applied strategic analysis. Participants will work through a real RFP together, translating funder language into actionable proposal strategy. The session is fast-paced and hands-on: bring your annotating instincts.',
    objectives: [
      'Accurately classify a funding opportunity (grant vs. contract vs. RFP) in under 60 seconds',
      'Identify the top 3 scoring priorities hidden in funder language',
      'Translate vague funder prose into concrete proposal decisions',
      'Apply template selection logic to a specific opportunity',
      'Conduct a quick "reviewer lens" analysis on any section'
    ],
    agenda: [
      { time: '0:00 – 0:10', activity: 'Welcome & Framing', description: 'Why this session exists: the gap between reading an RFP and understanding what it\'s actually asking for. Quick poll: what\'s the hardest part of reading an RFP?', type: 'intro' },
      { time: '0:10 – 0:25', activity: 'Live RFP Teardown — Part 1', description: 'Facilitator walks through a real federal or foundation RFP (provided in advance). Group identifies: mechanism type, funder priorities, eligibility flags, and evaluation criteria weighting. Consultants annotate their own copy in real time.', type: 'activity' },
      { time: '0:25 – 0:45', activity: 'Small Group: Strategy Translation Exercise', description: 'Groups of 3 receive the same RFP section and independently draft a 3-bullet "strategic response brief" — what this section is really asking for, what the evaluator will score on, and what template approach to use. Groups share and compare.', type: 'activity' },
      { time: '0:45 – 1:00', activity: 'Reviewer Mindset Simulation', description: 'Facilitator reveals 3 sample proposal excerpts responding to the same section — one strong, one weak, one with compliance risk. Groups score each using the RFP rubric. Debrief on what made the difference.', type: 'activity' },
      { time: '1:00 – 1:15', activity: 'Template Selection Workshop', description: 'Given 4 different funding scenarios, participants select the appropriate EIS template and justify their choice. Common misselection errors are reviewed and corrected.', type: 'activity' },
      { time: '1:15 – 1:25', activity: 'Live Q&A + Common Mistakes', description: 'Open floor for questions. Facilitator shares the top 5 RFP misreading errors seen in real proposals — with anonymized examples.', type: 'qa' },
      { time: '1:25 – 1:30', activity: 'Wrap-Up & Assignments', description: 'Review required outputs. Participants commit to completing Module 1 and 2 exercises using the RFP reviewed in this session.', type: 'wrap' }
    ],
    handouts: [
      {
        title: 'RFP Annotation Worksheet',
        type: 'html',
        description: 'A structured annotation template for breaking down any RFP into its strategic components.',
        content: `<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 32px; color: #1a1a1a;">
  <div style="border-top: 4px solid #143A50; padding-top: 20px; margin-bottom: 24px;">
    <h1 style="font-size: 22px; font-weight: bold; color: #143A50; margin: 0 0 4px;">RFP Annotation Worksheet</h1>
    <p style="font-size: 13px; color: #6b7280; margin: 0;">EIS Consultant Training — Session 1 Handout</p>
  </div>

  <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <p style="font-size: 13px; color: #166534; margin: 0;"><strong>Instructions:</strong> Use this worksheet while reading any RFP. Complete every section before beginning to write. A completed worksheet is required evidence for Module 1 and 2 outputs.</p>
  </div>

  <h2 style="font-size: 16px; font-weight: bold; color: #143A50; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px;">Section 1: Basic Classification</h2>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
    <tr><td style="padding: 8px 12px; border: 1px solid #d1d5db; background: #f9fafb; width: 200px; font-weight: 600;">Funder Name</td><td style="padding: 8px 12px; border: 1px solid #d1d5db; min-height: 32px;">&nbsp;</td></tr>
    <tr><td style="padding: 8px 12px; border: 1px solid #d1d5db; background: #f9fafb; font-weight: 600;">Mechanism Type</td><td style="padding: 8px 12px; border: 1px solid #d1d5db;">☐ Grant &nbsp;&nbsp; ☐ Contract &nbsp;&nbsp; ☐ RFP &nbsp;&nbsp; ☐ RFQ &nbsp;&nbsp; ☐ RFI &nbsp;&nbsp; ☐ Other: ______</td></tr>
    <tr><td style="padding: 8px 12px; border: 1px solid #d1d5db; background: #f9fafb; font-weight: 600;">Funding Sector</td><td style="padding: 8px 12px; border: 1px solid #d1d5db;">☐ Federal &nbsp;&nbsp; ☐ State &nbsp;&nbsp; ☐ Local Gov &nbsp;&nbsp; ☐ Private Foundation &nbsp;&nbsp; ☐ Corporate</td></tr>
    <tr><td style="padding: 8px 12px; border: 1px solid #d1d5db; background: #f9fafb; font-weight: 600;">Deadline</td><td style="padding: 8px 12px; border: 1px solid #d1d5db;">&nbsp;</td></tr>
    <tr><td style="padding: 8px 12px; border: 1px solid #d1d5db; background: #f9fafb; font-weight: 600;">Award Amount Range</td><td style="padding: 8px 12px; border: 1px solid #d1d5db;">&nbsp;</td></tr>
    <tr><td style="padding: 8px 12px; border: 1px solid #d1d5db; background: #f9fafb; font-weight: 600;">Eligible Applicants</td><td style="padding: 8px 12px; border: 1px solid #d1d5db;">&nbsp;</td></tr>
  </table>

  <h2 style="font-size: 16px; font-weight: bold; color: #143A50; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px;">Section 2: Scoring Priority Analysis</h2>
  <p style="font-size: 13px; color: #6b7280; margin-bottom: 12px;">List each scored section, its point value, and the key evaluator question it answers.</p>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
    <thead>
      <tr style="background: #143A50; color: white;">
        <th style="padding: 10px; text-align: left; border: 1px solid #1e4f58;">Section Name</th>
        <th style="padding: 10px; text-align: center; border: 1px solid #1e4f58; width: 80px;">Points</th>
        <th style="padding: 10px; text-align: left; border: 1px solid #1e4f58;">What the Evaluator Wants to Know</th>
        <th style="padding: 10px; text-align: center; border: 1px solid #1e4f58; width: 80px;">Priority</th>
      </tr>
    </thead>
    <tbody>
      ${Array(6).fill(null).map((_, i) => `<tr><td style="padding: 10px; border: 1px solid #d1d5db; height: 36px;">&nbsp;</td><td style="padding: 10px; border: 1px solid #d1d5db;">&nbsp;</td><td style="padding: 10px; border: 1px solid #d1d5db;">&nbsp;</td><td style="padding: 10px; border: 1px solid #d1d5db; text-align: center;">☐ H &nbsp;☐ M &nbsp;☐ L</td></tr>`).join('')}
    </tbody>
  </table>

  <h2 style="font-size: 16px; font-weight: bold; color: #143A50; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px;">Section 3: Eligibility & Compliance Flags</h2>
  <div style="margin-bottom: 24px;">
    <p style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #374151;">Required attachments / certifications:</p>
    <div style="border: 1px solid #d1d5db; border-radius: 6px; padding: 48px 12px; color: #9ca3af; font-size: 13px; text-align: center;">Write required attachments here</div>
    <p style="font-size: 14px; font-weight: 600; margin: 16px 0 8px; color: #374151;">Page / word limits by section:</p>
    <div style="border: 1px solid #d1d5db; border-radius: 6px; padding: 48px 12px; color: #9ca3af; font-size: 13px; text-align: center;">Write page/word limits here</div>
    <p style="font-size: 14px; font-weight: 600; margin: 16px 0 8px; color: #dc2626;">⚠ Potential disqualifiers identified:</p>
    <div style="border: 1px solid #fca5a5; border-radius: 6px; padding: 48px 12px; background: #fff1f2; color: #9ca3af; font-size: 13px; text-align: center;">Write any disqualifier risks here</div>
  </div>

  <h2 style="font-size: 16px; font-weight: bold; color: #143A50; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px;">Section 4: Strategic Framing Notes</h2>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
    <tr><td style="padding: 10px 12px; border: 1px solid #d1d5db; background: #f9fafb; width: 220px; font-weight: 600;">Top funder priority in plain language</td><td style="padding: 10px 12px; border: 1px solid #d1d5db; height: 48px;">&nbsp;</td></tr>
    <tr><td style="padding: 10px 12px; border: 1px solid #d1d5db; background: #f9fafb; font-weight: 600;">Our strongest alignment point</td><td style="padding: 10px 12px; border: 1px solid #d1d5db; height: 48px;">&nbsp;</td></tr>
    <tr><td style="padding: 10px 12px; border: 1px solid #d1d5db; background: #f9fafb; font-weight: 600;">Our weakest section (needs most work)</td><td style="padding: 10px 12px; border: 1px solid #d1d5db; height: 48px;">&nbsp;</td></tr>
    <tr><td style="padding: 10px 12px; border: 1px solid #d1d5db; background: #f9fafb; font-weight: 600;">Recommended EIS template</td><td style="padding: 10px 12px; border: 1px solid #d1d5db; height: 48px;">&nbsp;</td></tr>
    <tr><td style="padding: 10px 12px; border: 1px solid #d1d5db; background: #f9fafb; font-weight: 600;">Go / No-Go Recommendation</td><td style="padding: 10px 12px; border: 1px solid #d1d5db;">☐ GO &nbsp;&nbsp; ☐ NO-GO &nbsp;&nbsp; ☐ ESCALATE</td></tr>
  </table>

  <div style="border-top: 2px solid #143A50; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">
    EIS Consultant Training Framework — Session 1 Handout &nbsp;|&nbsp; Proprietary — Not for External Distribution
  </div>
</div>`
      },
      {
        title: 'Top 10 RFP Misreading Errors — Reference Card',
        type: 'html',
        description: 'Quick-reference card of the most common errors when analyzing a funding opportunity.',
        content: `<div style="font-family: Georgia, serif; max-width: 680px; margin: 0 auto; padding: 32px; color: #1a1a1a;">
  <div style="border-top: 4px solid #AC1A5B; padding-top: 20px; margin-bottom: 24px;">
    <h1 style="font-size: 22px; font-weight: bold; color: #143A50; margin: 0 0 4px;">Top 10 RFP Misreading Errors</h1>
    <p style="font-size: 13px; color: #6b7280; margin: 0;">EIS Consultant Training — Session 1 Reference Card</p>
  </div>
  ${[
    { n: 1, error: 'Applying to the wrong mechanism', detail: 'Treating a contract RFP like a grant, or vice versa. These have fundamentally different compliance requirements, evaluation criteria, and post-award obligations. Classification is the first step — never skip it.' },
    { n: 2, error: 'Skimming the eligibility section', detail: 'Organizations have been disqualified for missing a single eligibility requirement buried on page 12. Read every word of the eligibility section before investing time in the proposal.' },
    { n: 3, error: 'Ignoring the scoring rubric', detail: 'The scoring rubric tells you what the funder values most. If "Community Need" is 30 points and "Org Capacity" is 10, your writing should reflect that ratio — not be evenly distributed.' },
    { n: 4, error: 'Writing to internal language, not funder language', detail: 'Your client calls their program "The Bridge Initiative." The funder calls it "workforce reentry services." Use the funder\'s language — not your client\'s internal branding.' },
    { n: 5, error: 'Treating formatting requirements as optional', detail: 'Font size, margin width, page limits, and file format requirements are NOT suggestions. Proposals that violate them are routinely rejected without scoring.' },
    { n: 6, error: 'Assuming the evaluator knows the context', detail: 'Evaluators often know nothing about your client\'s community, organization, or program history. Write as if this is their first encounter with everything you\'re describing.' },
    { n: 7, error: 'Confusing program description with needs statement', detail: 'The needs statement describes the PROBLEM. The program description describes the SOLUTION. They are separate sections for a reason. Mixing them dilutes both.' },
    { n: 8, error: 'Using unverified statistics', detail: '"Approximately 80% of youth in our area face poverty." Where is this from? When was it collected? Unverified statistics are worse than no statistics — they signal carelessness to evaluators.' },
    { n: 9, error: 'Missing the implicit question behind the section', detail: 'Budget narrative sections often implicitly ask: "Can this organization manage federal funds responsibly?" Make sure your writing answers the question the evaluator is actually holding.' },
    { n: 10, error: 'Treating the deadline as the end', detail: 'The submission deadline is the EARLIEST you can submit — not the target. Internal drafts, QA review, and leadership sign-off all need to happen before the submission date. Plan backward from the deadline.' }
  ].map(item => `
  <div style="display: flex; gap: 16px; padding: 16px; border-radius: 8px; border: 1px solid ${item.n <= 3 ? '#fca5a5' : '#e5e7eb'}; margin-bottom: 12px; background: ${item.n <= 3 ? '#fff1f2' : '#ffffff'};">
    <div style="width: 36px; height: 36px; border-radius: 50%; background: ${item.n <= 3 ? '#AC1A5B' : '#143A50'}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; flex-shrink: 0;">${item.n}</div>
    <div>
      <p style="font-weight: bold; font-size: 15px; color: #111827; margin: 0 0 6px;">${item.error}</p>
      <p style="font-size: 13px; color: #4b5563; margin: 0; line-height: 1.6;">${item.detail}</p>
    </div>
  </div>`).join('')}
  <div style="border-top: 2px solid #143A50; padding-top: 16px; margin-top: 8px; font-size: 11px; color: #9ca3af; text-align: center;">
    EIS Consultant Training Framework — Session 1 Reference Card &nbsp;|&nbsp; Proprietary — Not for External Distribution
  </div>
</div>`
      }
    ],
    videoGuide: {
      title: 'Pre-Session Video: Reading an RFP Like a Strategist (15 min)',
      description: 'Watch before attending Session 1. Covers the difference between reading for content vs. reading for strategy, and walks through one annotated RFP example.',
      topics: [
        'The 3-pass reading method for any RFP',
        'How to identify the evaluator\'s implicit questions',
        'Live annotation demo using a real foundation grant',
        'Template selection decision tree walkthrough'
      ]
    }
  },
  {
    id: 2,
    title: 'Session 2: Writing Under Pressure — Drafting Core Sections That Score',
    type: 'Simulation',
    level: 'Level 1 (Required) + Level 2 (Review)',
    levelBadge: 'bg-blue-600',
    duration: '90 minutes',
    maxParticipants: 10,
    targetModules: [4, 6, 7],
    overview: 'This is the writing session — the one where consultants stop reading about grant writing and actually do it. Participants draft real proposal sections under timed, realistic conditions, then receive structured peer and facilitator feedback. It is uncomfortable by design. The goal is to identify gaps before a real deadline does.',
    objectives: [
      'Draft a SMART outcomes section in under 20 minutes from provided program data',
      'Write a needs statement that uses data without trauma-dumping',
      'Identify and correct EIS voice violations in peer drafts',
      'Complete and apply the EIS QA checklist to a live draft',
      'Give and receive professional feedback using the EIS feedback model'
    ],
    agenda: [
      { time: '0:00 – 0:08', activity: 'Framing: Why Timed Drafting Matters', description: 'Real proposals are written under deadline pressure. This session simulates that. Consultants learn faster when the stakes feel real. Brief overview of the session structure and expectations.', type: 'intro' },
      { time: '0:08 – 0:25', activity: 'Sprint 1: Needs Statement (17 min)', description: 'Participants receive a one-page client profile and a funder\'s stated priorities. They have 17 minutes to write a 300-word needs statement. No pre-writing, no discussion — just draft. Facilitator times the room.', type: 'activity' },
      { time: '0:25 – 0:40', activity: 'Peer Review Round 1 — Needs Statements', description: 'Drafts are swapped. Reviewers have 10 minutes to annotate using the EIS Voice Checklist. Focus: data citations, tone, trauma language, and funder alignment. Verbal feedback exchange follows.', type: 'activity' },
      { time: '0:40 – 0:55', activity: 'Sprint 2: Outcomes Section (15 min)', description: 'Using the same client profile, participants write 3 SMART outcomes. Common failure: writing aspirational statements. Facilitator calls time at 15 minutes — no extensions.', type: 'activity' },
      { time: '0:55 – 1:10', activity: 'Facilitator Demo: Before / After', description: 'Facilitator shares 2 participant drafts (anonymized or with permission) and rewrites them in real time, narrating every decision. Group identifies what changed and why.', type: 'activity' },
      { time: '1:10 – 1:22', activity: 'QA Checklist Application', description: 'Each participant applies the EIS QA checklist to their own needs statement draft. Identify minimum 2 items that fail the checklist. Write corrections.', type: 'activity' },
      { time: '1:22 – 1:30', activity: 'Debrief + Required Outputs Review', description: 'What was hard? What surprised you? Facilitator connects the experience to Module 6 and 7 exercises. Assignments reviewed.', type: 'wrap' }
    ],
    handouts: [
      {
        title: 'EIS Voice Compliance Checklist',
        type: 'html',
        description: 'Use this checklist to self-review any draft before submitting for internal review.',
        content: `<div style="font-family: Georgia, serif; max-width: 680px; margin: 0 auto; padding: 32px; color: #1a1a1a;">
  <div style="border-top: 4px solid #1E4F58; padding-top: 20px; margin-bottom: 24px;">
    <h1 style="font-size: 22px; font-weight: bold; color: #143A50; margin: 0 0 4px;">EIS Voice Compliance Checklist</h1>
    <p style="font-size: 13px; color: #6b7280; margin: 0;">EIS Consultant Training — Session 2 Handout &nbsp;|&nbsp; Required self-review before submitting any draft</p>
  </div>

  ${[
    { category: 'Tone & Framing', color: '#1E4F58', items: [
      'Writing is strategic and purposeful — no filler sentences',
      'Claims are specific, not vague ("75% of participants" not "most participants")',
      'No "passion statements" ("We are passionate about..." is NOT EIS voice)',
      'No trauma dumping — need is established with data, not suffering narratives',
      'No savior framing — the organization supports the community, it does not rescue it',
      'No superlative claims without evidence ("most innovative," "only program in the state")'
    ]},
    { category: 'Evidence & Data', color: '#143A50', items: [
      'Every statistic has an in-line citation (Source, Year)',
      'Data is localized — national stats are supplemented by state/local data',
      'No unverifiable claims remain in the draft',
      'Evidence connects directly to the population the funder cares about',
      'The data gap analysis explicitly justifies why existing solutions are insufficient'
    ]},
    { category: 'SMART Outcomes', color: '#AC1A5B', items: [
      'Each outcome specifies WHO will achieve it (population + sample size)',
      'Each outcome specifies WHAT will change (measurable indicator)',
      'Each outcome specifies HOW MUCH change is expected (target %)',
      'Each outcome specifies BY WHEN (specific date, not "by program end")',
      'Each outcome specifies HOW it will be measured (assessment tool / data source)',
      'No aspirational outcomes ("participants will improve their skills") remain'
    ]},
    { category: 'Structure & Compliance', color: '#1E4F58', items: [
      'All required sections are present and in the correct order',
      'Page / word limits are respected for each section',
      'No placeholder text ([INSERT], TBD, XX) remains anywhere',
      'All headers match the funder\'s language where specified',
      'Font, margins, and formatting follow the RFP requirements'
    ]},
    { category: 'Final Check', color: '#374151', items: [
      'I have read this draft as if I were the evaluator — not the author',
      'I would submit this section under the EIS name without embarrassment',
      'I have documented all changes in my change log if this is a revision'
    ]}
  ].map(section => `
  <div style="margin-bottom: 24px;">
    <h2 style="font-size: 15px; font-weight: bold; color: ${section.color}; background: ${section.color}15; padding: 10px 14px; border-radius: 6px; margin-bottom: 12px;">${section.category}</h2>
    ${section.items.map(item => `
    <div style="display: flex; gap: 10px; align-items: flex-start; padding: 8px 4px; border-bottom: 1px solid #f3f4f6;">
      <div style="width: 18px; height: 18px; border: 2px solid #d1d5db; border-radius: 3px; flex-shrink: 0; margin-top: 1px;"></div>
      <span style="font-size: 13px; color: #374151; line-height: 1.5;">${item}</span>
    </div>`).join('')}
  </div>`).join('')}

  <div style="background: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 16px; margin-top: 8px;">
    <p style="font-size: 13px; font-weight: bold; color: #713f12; margin: 0 0 4px;">Self-Certification</p>
    <p style="font-size: 13px; color: #92400e; margin: 0;">By submitting this draft for review, I confirm that I have completed this checklist and addressed every item. I have not submitted work that I have not personally reviewed.</p>
  </div>

  <div style="border-top: 2px solid #143A50; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #9ca3af; text-align: center;">
    EIS Consultant Training Framework — Session 2 Handout &nbsp;|&nbsp; Proprietary — Not for External Distribution
  </div>
</div>`
      },
      {
        title: 'SMART Outcomes Builder Worksheet',
        type: 'html',
        description: 'Step-by-step worksheet for transforming vague program goals into scoreable SMART outcomes.',
        content: `<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 32px; color: #1a1a1a;">
  <div style="border-top: 4px solid #AC1A5B; padding-top: 20px; margin-bottom: 24px;">
    <h1 style="font-size: 22px; font-weight: bold; color: #143A50; margin: 0 0 4px;">SMART Outcomes Builder</h1>
    <p style="font-size: 13px; color: #6b7280; margin: 0;">EIS Consultant Training — Session 2 Handout</p>
  </div>

  <div style="background: #fef2f2; border-left: 4px solid #AC1A5B; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
    <p style="font-size: 14px; font-weight: bold; color: #991b1b; margin: 0 0 8px;">The SMART Formula</p>
    <p style="font-size: 13px; color: #7f1d1d; margin: 0; line-height: 1.8;">
      <strong>By [DATE],</strong> [NUMBER/PERCENTAGE] of [WHO — population + sample size] will [WHAT WILL CHANGE — specific, measurable indicator] as measured by [HOW — data source or assessment tool].
    </p>
    <div style="margin-top: 12px; padding: 12px; background: white; border-radius: 6px; border: 1px solid #fca5a5;">
      <p style="font-size: 12px; color: #374151; margin: 0; font-style: italic;">"By December 31, 2025, 75% of program participants (n=40) will increase their personal savings rate by at least 10% as measured by pre/post financial health assessments administered by a certified financial coach."</p>
    </div>
  </div>

  ${[1, 2, 3].map(n => `
  <div style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
    <h3 style="font-size: 15px; font-weight: bold; color: #143A50; margin: 0 0 16px;">Outcome ${n}</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <tr style="background: #f9fafb;"><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 160px;">🎯 By when?</td><td style="padding: 10px; border: 1px solid #e5e7eb; height: 36px;">&nbsp;</td></tr>
      <tr><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151; background: #f9fafb;">👥 Who? (n=?)</td><td style="padding: 10px; border: 1px solid #e5e7eb; height: 36px;">&nbsp;</td></tr>
      <tr style="background: #f9fafb;"><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">📈 What will change?</td><td style="padding: 10px; border: 1px solid #e5e7eb; height: 36px;">&nbsp;</td></tr>
      <tr><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151; background: #f9fafb;">% How much change?</td><td style="padding: 10px; border: 1px solid #e5e7eb; height: 36px;">&nbsp;</td></tr>
      <tr style="background: #f9fafb;"><td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">📋 Measured how?</td><td style="padding: 10px; border: 1px solid #e5e7eb; height: 36px;">&nbsp;</td></tr>
    </table>
    <div style="margin-top: 12px;">
      <p style="font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">Write your complete SMART outcome sentence:</p>
      <div style="border: 1px solid #d1d5db; border-radius: 6px; padding: 48px 12px; font-size: 13px; color: #9ca3af;">&nbsp;</div>
    </div>
    <div style="display: flex; gap: 16px; margin-top: 12px;">
      <div style="flex: 1; padding: 10px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px;">
        <p style="font-size: 11px; font-weight: bold; color: #166534; margin: 0 0 4px;">✓ SMART Check</p>
        <div style="font-size: 11px; color: #166534;">☐ Specific &nbsp;☐ Measurable &nbsp;☐ Achievable &nbsp;☐ Relevant &nbsp;☐ Time-bound</div>
      </div>
      <div style="flex: 1; padding: 10px; background: #fff1f2; border: 1px solid #fca5a5; border-radius: 6px;">
        <p style="font-size: 11px; font-weight: bold; color: #991b1b; margin: 0 0 4px;">✗ Vague Language Check</p>
        <div style="font-size: 11px; color: #991b1b;">☐ No "improve" without a metric &nbsp;☐ No "most" or "many" &nbsp;☐ No vague dates</div>
      </div>
    </div>
  </div>`).join('')}

  <div style="border-top: 2px solid #143A50; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">
    EIS Consultant Training Framework — Session 2 Handout &nbsp;|&nbsp; Proprietary — Not for External Distribution
  </div>
</div>`
      }
    ],
    videoGuide: {
      title: 'Pre-Session Video: The EIS Writing Standard — What "Good" Actually Looks Like (12 min)',
      description: 'Watch before Session 2. Demonstrates the difference between acceptable and excellent at the sentence level, with live examples.',
      topics: [
        'Annotated before/after: needs statement',
        'Annotated before/after: outcomes section',
        'How to read your own draft like an evaluator',
        'The change log process — why it matters'
      ]
    }
  },
  {
    id: 3,
    title: 'Session 3: QA, Risk & The Final Review Authority',
    type: 'QA Calibration',
    level: 'Level 2 (Required) + Level 3 (Calibration)',
    levelBadge: 'bg-purple-600',
    duration: '90 minutes',
    maxParticipants: 8,
    targetModules: [12, 16, 3],
    overview: 'This session is for consultants who are taking on review and QA authority. It\'s not a writing session — it\'s a judgment session. Participants evaluate real proposal drafts, identify risks, make escalation decisions, and calibrate their QA standards against each other and against EIS benchmarks. By the end, every participant should know exactly what their QA authority requires of them.',
    objectives: [
      'Conduct a complete risk audit of a multi-section proposal draft',
      'Categorize risks as Strategic, Compliance, Organizational, or Reputational',
      'Make and document a "stop work" vs. "proceed" decision with justification',
      'Calibrate QA standards against EIS benchmarks through group discussion',
      'Write a risk escalation memo that is actionable and professionally presented'
    ],
    agenda: [
      { time: '0:00 – 0:10', activity: 'The Weight of Final Authority', description: 'Opening framing: what it means when your name is on the QA approval. The institutional stakes of letting a problematic proposal proceed. One real (anonymized) case study of what happens when QA fails.', type: 'intro' },
      { time: '0:10 – 0:30', activity: 'Individual Risk Audit — Round 1', description: 'Each participant independently reviews the same 5-page proposal excerpt. Using the EIS Risk Audit framework, each identifies and categorizes every risk they find. No discussion during this phase — individual assessment only.', type: 'activity' },
      { time: '0:30 – 0:50', activity: 'Calibration Discussion', description: 'Group compares findings. Where did everyone agree? Where did people diverge? Facilitator introduces the EIS benchmark — what risks were actually present and which category each belongs to. Disagreements are discussed, not resolved by authority.', type: 'activity' },
      { time: '0:50 – 1:05', activity: 'Escalation Decision Exercise', description: 'Each participant receives 3 escalation scenarios. For each: write your decision (proceed, revise, stop), your rationale, and your escalation memo. Scenarios include: budget-narrative misalignment, an unverifiable impact claim, and a potential conflict of interest.', type: 'activity' },
      { time: '1:05 – 1:20', activity: 'Level 3 Calibration Panel', description: 'Level 3 consultants share their escalation decisions and memos. Group discusses differences in judgment. Facilitator presents the EIS standard response for each scenario and explains the reasoning.', type: 'activity' },
      { time: '1:20 – 1:30', activity: 'Wrap-Up: The QA Pledge + Required Outputs', description: 'Every Level 3 consultant articulates — out loud — their commitment to exercising QA authority fully and without exception. Required outputs reviewed. Session closes.', type: 'wrap' }
    ],
    handouts: [
      {
        title: 'EIS Risk Audit Framework',
        type: 'html',
        description: 'Complete framework for conducting a risk audit on any proposal draft. Required for Level 2+ module completion.',
        content: `<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 32px; color: #1a1a1a;">
  <div style="border-top: 4px solid #7c3aed; padding-top: 20px; margin-bottom: 24px;">
    <h1 style="font-size: 22px; font-weight: bold; color: #143A50; margin: 0 0 4px;">EIS Risk Audit Framework</h1>
    <p style="font-size: 13px; color: #6b7280; margin: 0;">EIS Consultant Training — Session 3 Handout &nbsp;|&nbsp; Level 2+ Required</p>
  </div>

  <div style="background: #faf5ff; border: 1px solid #c4b5fd; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <p style="font-size: 13px; color: #4c1d95; margin: 0;"><strong>Purpose:</strong> A risk audit goes beyond checklist compliance. It asks what in this proposal could harm the client, expose EIS to liability, or damage professional relationships — before submission. Every Level 2+ consultant completes a risk audit before handing off to Level 3.</p>
  </div>

  <h2 style="font-size: 16px; font-weight: bold; color: #143A50; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px;">The Four Risk Categories</h2>

  ${[
    { type: 'Strategic Risk', color: '#1E4F58', bg: '#f0fdf4', border: '#86efac', description: 'The proposal is technically compliant but unlikely to score competitively.', examples: ['Weak theory of change not connected to evidence base', 'Outcomes that are achievable but not impressive relative to the award size', 'Organizational capacity section that is generic rather than specific', 'No differentiation from likely competitors in the field'] },
    { type: 'Compliance Risk', color: '#b45309', bg: '#fffbeb', border: '#fde047', description: 'The proposal may violate a funder requirement and face disqualification or post-award consequence.', examples: ['Section exceeds page limit by any amount', 'Required attachment missing or incorrectly formatted', 'Proposed budget includes potentially unallowable cost category', 'Eligibility requirement not explicitly addressed in the narrative'] },
    { type: 'Organizational Risk', color: '#DC2626', bg: '#fff1f2', border: '#fca5a5', description: 'The proposal overpromises what the client can actually deliver post-award.', examples: ['Staffing plan requires hiring before award notification', 'Outcomes targets exceed what the client\'s capacity supports', 'Timeline is unrealistic given client\'s current program infrastructure', 'Budget assumes matching funds not yet confirmed'] },
    { type: 'Reputational Risk', color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd', description: 'The proposal contains language or claims that could embarrass EIS or the client if scrutinized.', examples: ['Unverified statistics or data from unreliable sources', 'Language that could be perceived as culturally insensitive', 'Claims about program uniqueness that are not verifiable', 'Advocacy statements that cross into lobbying territory'] }
  ].map(cat => `
  <div style="margin-bottom: 20px; border: 1px solid ${cat.border}; border-radius: 10px; overflow: hidden;">
    <div style="background: ${cat.bg}; padding: 14px 16px; border-bottom: 1px solid ${cat.border};">
      <h3 style="font-size: 15px; font-weight: bold; color: ${cat.color}; margin: 0 0 4px;">${cat.type}</h3>
      <p style="font-size: 13px; color: #4b5563; margin: 0;">${cat.description}</p>
    </div>
    <div style="padding: 14px 16px; background: white;">
      <p style="font-size: 12px; font-weight: bold; color: #374151; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.05em;">Common Indicators:</p>
      ${cat.examples.map(ex => `<div style="display: flex; gap: 8px; padding: 5px 0; font-size: 13px; color: #4b5563;"><span style="color: ${cat.color}; font-weight: bold;">→</span>${ex}</div>`).join('')}
    </div>
  </div>`).join('')}

  <h2 style="font-size: 16px; font-weight: bold; color: #143A50; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px; margin-top: 8px;">Risk Audit Log</h2>
  <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px;">
    <thead>
      <tr style="background: #143A50; color: white;">
        <th style="padding: 10px; border: 1px solid #1e4f58; text-align: left; width: 60px;">#</th>
        <th style="padding: 10px; border: 1px solid #1e4f58; text-align: left; width: 80px;">Section</th>
        <th style="padding: 10px; border: 1px solid #1e4f58; text-align: left;">Risk Description</th>
        <th style="padding: 10px; border: 1px solid #1e4f58; text-align: center; width: 100px;">Category</th>
        <th style="padding: 10px; border: 1px solid #1e4f58; text-align: center; width: 100px;">Severity</th>
        <th style="padding: 10px; border: 1px solid #1e4f58; text-align: center; width: 120px;">Action</th>
      </tr>
    </thead>
    <tbody>
      ${Array(8).fill(null).map((_, i) => `<tr><td style="padding: 8px; border: 1px solid #e5e7eb;">${i + 1}</td><td style="padding: 8px; border: 1px solid #e5e7eb;">&nbsp;</td><td style="padding: 8px; border: 1px solid #e5e7eb; height: 36px;">&nbsp;</td><td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-size: 11px;">☐ S ☐ C<br>☐ O ☐ R</td><td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-size: 11px;">☐ H ☐ M ☐ L</td><td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-size: 11px;">☐ Revise<br>☐ Escalate<br>☐ Stop</td></tr>`).join('')}
    </tbody>
  </table>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
    <div style="padding: 14px; border: 1px solid #d1d5db; border-radius: 8px;">
      <p style="font-size: 13px; font-weight: bold; margin: 0 0 8px; color: #374151;">Overall Risk Assessment</p>
      <div style="font-size: 13px; color: #4b5563;">
        <div>☐ Clear to Submit</div>
        <div>☐ Revise Before Submit</div>
        <div>☐ Escalate to EIS Leadership</div>
        <div>☐ Stop — Do Not Submit</div>
      </div>
    </div>
    <div style="padding: 14px; border: 1px solid #d1d5db; border-radius: 8px;">
      <p style="font-size: 13px; font-weight: bold; margin: 0 0 8px; color: #374151;">Reviewer Information</p>
      <div style="font-size: 13px; color: #4b5563;">
        <div>Name: ________________________</div>
        <div style="margin-top: 8px;">Level: ☐ L2 &nbsp;&nbsp; ☐ L3</div>
        <div style="margin-top: 8px;">Date: _________________________</div>
      </div>
    </div>
  </div>

  <div style="border-top: 2px solid #143A50; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">
    EIS Consultant Training Framework — Session 3 Handout &nbsp;|&nbsp; Proprietary — Not for External Distribution
  </div>
</div>`
      },
      {
        title: 'Escalation Decision Scenarios — Answer Key',
        type: 'html',
        description: 'The 3 escalation scenarios from Session 3 with the EIS standard response and reasoning.',
        content: `<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 32px; color: #1a1a1a;">
  <div style="border-top: 4px solid #7c3aed; padding-top: 20px; margin-bottom: 24px;">
    <h1 style="font-size: 22px; font-weight: bold; color: #143A50; margin: 0 0 4px;">Escalation Decision Scenarios</h1>
    <p style="font-size: 13px; color: #6b7280; margin: 0;">EIS Consultant Training — Session 3 Facilitator Guide &nbsp;|&nbsp; Level 3 Distribution Only</p>
  </div>

  <div style="background: #faf5ff; border: 1px solid #c4b5fd; border-radius: 8px; padding: 16px; margin-bottom: 28px;">
    <p style="font-size: 13px; color: #4c1d95; margin: 0;"><strong>Note:</strong> These are the standard EIS responses to the Session 3 escalation scenarios. Reasonable professionals may reach different conclusions — the key is that every decision is documented with a clear rationale. Undocumented decisions are not acceptable regardless of outcome.</p>
  </div>

  ${[
    {
      n: 1,
      title: 'Scenario A: Budget-Narrative Misalignment',
      scenario: 'The narrative describes hiring a full-time Program Director. The budget shows 0.5 FTE for a "Program Coordinator" at $28,000 annually. The award is $175,000 for a 2-year program. The deadline is in 6 hours.',
      decision: 'Escalate Immediately — Do Not Submit Without Resolution',
      reasoning: 'Budget-narrative misalignment is a compliance risk AND an organizational risk. The funder may reject the proposal for internal inconsistency, or post-award, the client may find themselves accountable to a staffing commitment they cannot fulfill. The deadline pressure does not change this. A proposal submitted with a known budget-narrative misalignment is a professional and ethical failure, regardless of timeline. Contact EIS leadership immediately. If resolution is impossible before deadline, recommend a no-go rather than submit a flawed proposal.',
      color: '#DC2626',
      bg: '#fff1f2',
      border: '#fca5a5'
    },
    {
      n: 2,
      title: 'Scenario B: Unverifiable Impact Claim',
      scenario: '"Our program has achieved a 92% job placement rate for all participants over the past three years." No citation. No sample size. No definition of "job placement." The program director says this is from internal tracking but cannot provide documentation before the deadline.',
      decision: 'Revise or Remove Before Submission',
      reasoning: 'An unverified claim of this specificity is a reputational risk. Evaluators who question this claim and cannot verify it will discount every other data point in the proposal. If the data exists, the consultant must obtain the supporting documentation or reframe the statement to what can be supported: "Internal program data indicates strong employment outcomes — our impact evaluation framework tracks participant employment status at 90-day follow-up." If the data cannot be substantiated, the claim must be removed. Do not submit unverifiable statistics under EIS review.',
      color: '#b45309',
      bg: '#fffbeb',
      border: '#fde047'
    },
    {
      n: 3,
      title: 'Scenario C: Potential Conflict of Interest',
      scenario: 'A Level 2 consultant on your team just revealed, during the QA review, that her spouse sits on the board of the foundation this proposal is being submitted to. She did not disclose this at project kickoff. The submission is tomorrow.',
      decision: 'Stop — Escalate to EIS Leadership Before Proceeding',
      reasoning: 'This is an ethics and compliance issue that cannot be resolved at the consultant level — regardless of timeline. The Level 2 consultant should have disclosed this at project initiation. The fact that it emerged during QA does not reduce its seriousness. EIS leadership must be notified immediately to make an informed decision about: (1) whether the consultant can continue on this project, (2) whether the submission should proceed, and (3) whether the funder must be notified. Do not submit this proposal without EIS leadership direction. Document the disclosure immediately.',
      color: '#7c3aed',
      bg: '#faf5ff',
      border: '#c4b5fd'
    }
  ].map(s => `
  <div style="border: 2px solid ${s.border}; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
    <div style="background: ${s.bg}; padding: 16px; border-bottom: 1px solid ${s.border};">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="width: 28px; height: 28px; background: ${s.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; flex-shrink: 0;">${s.n}</div>
        <h3 style="font-size: 16px; font-weight: bold; color: ${s.color}; margin: 0;">${s.title}</h3>
      </div>
      <p style="font-size: 13px; color: #374151; margin: 0; line-height: 1.6; font-style: italic;">${s.scenario}</p>
    </div>
    <div style="padding: 16px; background: white;">
      <div style="padding: 10px 14px; background: ${s.bg}; border-radius: 6px; margin-bottom: 14px; border-left: 4px solid ${s.color};">
        <p style="font-size: 13px; font-weight: bold; color: ${s.color}; margin: 0;">EIS Standard Decision: ${s.decision}</p>
      </div>
      <p style="font-size: 13px; color: #4b5563; line-height: 1.7; margin: 0;">${s.reasoning}</p>
    </div>
  </div>`).join('')}

  <div style="border-top: 2px solid #143A50; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">
    EIS Consultant Training Framework — Session 3 Facilitator Guide &nbsp;|&nbsp; Level 3 Distribution Only &nbsp;|&nbsp; Proprietary
  </div>
</div>`
      }
    ],
    videoGuide: {
      title: 'Pre-Session Video: The QA Mindset — Why Final Authority Is a Different Responsibility (18 min)',
      description: 'Required for all Level 2+ participants. Covers the institutional weight of QA authority and walks through two real escalation decision case studies.',
      topics: [
        'The difference between reviewing and approving',
        'Case study: what happened when QA failed (anonymized)',
        'The EIS risk categorization system in practice',
        'Writing escalation memos that get action'
      ]
    }
  }
];

const typeColors = {
  'Strategy Lab': 'bg-[#1E4F58] text-white',
  'Simulation': 'bg-[#AC1A5B] text-white',
  'QA Calibration': 'bg-purple-700 text-white'
};

const agendaColors = {
  intro: 'border-slate-300 bg-slate-50',
  activity: 'border-[#1E4F58] bg-[#1E4F58]/5',
  qa: 'border-blue-300 bg-blue-50',
  wrap: 'border-[#E5C089] bg-amber-50'
};

function HandoutViewer({ handout }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{handout.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{handout.description}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Badge variant="outline" className="text-xs">HTML</Badge>
          <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
            {open ? <ChevronUp className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="ml-1 text-xs">{open ? 'Close' : 'Preview'}</span>
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-200">
          <div className="bg-slate-50 px-4 py-2 flex justify-between items-center">
            <span className="text-xs text-slate-500">Handout Preview</span>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => {
              const w = window.open('', '_blank');
              w.document.write(handout.content);
              w.document.close();
            }}>
              <Download className="w-3 h-3 mr-1" /> Open in New Tab
            </Button>
          </div>
          <div
            className="bg-white"
            style={{ maxHeight: '600px', overflowY: 'auto' }}
            dangerouslySetInnerHTML={{ __html: handout.content }}
          />
        </div>
      )}
    </div>
  );
}

export default function TrainingLiveSessions() {
  const [activeSession, setActiveSession] = useState('1');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E4F58] to-[#143A50] flex items-center justify-center shadow-lg">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#143A50]">Live Training Session Outlines</h1>
              <p className="text-slate-600 mt-1">Three required live sessions for EIS consultant training — agendas, handouts, and video guides</p>
            </div>
          </div>

          {/* Session Overview Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {LIVE_SESSIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSession(String(s.id))}
                className={`text-left p-4 rounded-xl border-2 transition-all ${activeSession === String(s.id) ? 'border-[#143A50] bg-[#143A50]/5 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.levelBadge} text-white`}>{s.type}</span>
                </div>
                <p className="font-bold text-[#143A50] text-sm leading-tight">Session {s.id}</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {s.duration} &nbsp;·&nbsp; <Users className="w-3 h-3" /> Max {s.maxParticipants}
                </p>
              </button>
            ))}
          </div>
        </div>

        <Tabs value={activeSession} onValueChange={setActiveSession}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1">Session 1: Strategy</TabsTrigger>
            <TabsTrigger value="2">Session 2: Writing</TabsTrigger>
            <TabsTrigger value="3">Session 3: QA & Risk</TabsTrigger>
          </TabsList>

          {LIVE_SESSIONS.map(session => (
            <TabsContent key={session.id} value={String(session.id)} className="space-y-6 mt-6">
              {/* Session Header */}
              <Card className="border-2 border-[#143A50] shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] rounded-t-lg text-white">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${session.levelBadge} text-white border border-white/30`}>{session.type}</span>
                        <span className="text-white/70 text-xs">{session.level}</span>
                      </div>
                      <CardTitle className="text-xl text-white leading-tight">{session.title}</CardTitle>
                    </div>
                    <div className="flex gap-4 text-sm text-white/80">
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{session.duration}</div>
                      <div className="flex items-center gap-1"><Users className="w-4 h-4" />Max {session.maxParticipants}</div>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mt-3 leading-relaxed">{session.overview}</p>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-semibold text-slate-500 mr-1">Covers Modules:</span>
                    {session.targetModules.map(m => (
                      <Badge key={m} className="bg-[#143A50] text-white">Module {m}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Learning Objectives */}
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50">
                  <CardTitle className="text-[#143A50] flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5" /> Session Learning Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid sm:grid-cols-2 gap-2">
                    {session.objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-[#143A50]/5 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-[#1E4F58] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{obj}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pre-Session Video */}
              <Card className="border border-slate-200 bg-gradient-to-br from-slate-900 to-[#143A50] text-white shadow-lg">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Play className="w-6 h-6 text-[#E5C089]" />
                    </div>
                    <div>
                      <Badge className="bg-[#E5C089] text-[#143A50] mb-2 text-xs font-bold">PRE-SESSION VIDEO REQUIRED</Badge>
                      <h3 className="font-bold text-white mb-1">{session.videoGuide.title}</h3>
                      <p className="text-white/70 text-sm mb-4">{session.videoGuide.description}</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {session.videoGuide.topics.map((topic, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                            <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#E5C089]" />
                            {topic}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agenda */}
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50">
                  <CardTitle className="text-[#143A50] flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5" /> Session Agenda — {session.duration}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="space-y-3">
                    {session.agenda.map((item, i) => (
                      <div key={i} className={`flex gap-4 p-4 rounded-xl border-l-4 ${agendaColors[item.type]}`}>
                        <div className="flex-shrink-0 text-xs font-mono font-bold text-slate-500 pt-0.5 min-w-[90px]">{item.time}</div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm mb-1">{item.activity}</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#1E4F58]/20 border-l-2 border-[#1E4F58] inline-block"></span> Activity</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-100 border-l-2 border-slate-400 inline-block"></span> Intro/Wrap</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-50 border-l-2 border-[#E5C089] inline-block"></span> Q&A/Close</span>
                  </div>
                </CardContent>
              </Card>

              {/* Handouts */}
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50">
                  <CardTitle className="text-[#143A50] flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5" /> Session Handouts
                    <Badge variant="outline" className="ml-1 text-xs">{session.handouts.length} documents</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  {session.handouts.map((handout, i) => (
                    <HandoutViewer key={i} handout={handout} />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}