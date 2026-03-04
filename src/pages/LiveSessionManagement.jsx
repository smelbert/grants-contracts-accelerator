import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Calendar, Clock, Users, Video, Plus, Edit, Trash2,
  BookOpen, Target, CheckCircle2, ArrowRight, FileText,
  Play, Download, ChevronDown, ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// ─── Schedule Manager Data ───────────────────────────────────────────────────
const sessionTypes = {
  strategy_lab: 'Strategy Lab',
  simulation: 'Simulation',
  qa_calibration: 'QA Calibration',
  coaching_roleplay: 'Coaching Role-Play',
  budget_workshop: 'Budget Workshop',
  reviewer_scoring: 'Reviewer Scoring',
  discovery_debrief: 'Discovery Debrief',
  escalation_training: 'Escalation Training'
};

// ─── Session Outlines Data ────────────────────────────────────────────────────
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
        description: 'A structured annotation template for breaking down any RFP into its strategic components.',
        content: `<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 32px; color: #1a1a1a;"><div style="border-top: 4px solid #143A50; padding-top: 20px; margin-bottom: 24px;"><h1 style="font-size: 22px; font-weight: bold; color: #143A50; margin: 0 0 4px;">RFP Annotation Worksheet</h1><p style="font-size: 13px; color: #6b7280; margin: 0;">EIS Consultant Training — Session 1 Handout</p></div><div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin-bottom: 24px;"><p style="font-size: 13px; color: #166534; margin: 0;"><strong>Instructions:</strong> Use this worksheet while reading any RFP. Complete every section before beginning to write. A completed worksheet is required evidence for Module 1 and 2 outputs.</p></div><h2 style="font-size: 16px; font-weight: bold; color: #143A50; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px;">Section 1: Basic Classification</h2><table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;"><tr><td style="padding: 8px 12px; border: 1px solid #d1d5db; background: #f9fafb; width: 200px; font-weight: 600;">Funder Name</td><td style="padding: 8px 12px; border: 1px solid #d1d5db; min-height: 32px;">&nbsp;</td></tr><tr><td style="padding: 8px 12px; border: 1px solid #d1d5db; background: #f9fafb; font-weight: 600;">Mechanism Type</td><td style="padding: 8px 12px; border: 1px solid #d1d5db;">☐ Grant &nbsp; ☐ Contract &nbsp; ☐ RFP &nbsp; ☐ RFQ &nbsp; ☐ RFI</td></tr><tr><td style="padding: 8px 12px; border: 1px solid #d1d5db; background: #f9fafb; font-weight: 600;">Deadline</td><td style="padding: 8px 12px; border: 1px solid #d1d5db;">&nbsp;</td></tr><tr><td style="padding: 8px 12px; border: 1px solid #d1d5db; background: #f9fafb; font-weight: 600;">Award Amount Range</td><td style="padding: 8px 12px; border: 1px solid #d1d5db;">&nbsp;</td></tr><tr><td style="padding: 8px 12px; border: 1px solid #d1d5db; background: #f9fafb; font-weight: 600;">Go / No-Go</td><td style="padding: 8px 12px; border: 1px solid #d1d5db;">☐ GO &nbsp; ☐ NO-GO &nbsp; ☐ ESCALATE</td></tr></table><div style="border-top: 2px solid #143A50; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">EIS Consultant Training Framework — Session 1 Handout | Proprietary</div></div>`
      },
      {
        title: 'Top 10 RFP Misreading Errors — Reference Card',
        description: 'Quick-reference card of the most common errors when analyzing a funding opportunity.',
        content: `<div style="font-family: Georgia, serif; max-width: 680px; margin: 0 auto; padding: 32px; color: #1a1a1a;"><div style="border-top: 4px solid #AC1A5B; padding-top: 20px; margin-bottom: 24px;"><h1 style="font-size: 22px; font-weight: bold; color: #143A50; margin: 0 0 4px;">Top 10 RFP Misreading Errors</h1><p style="font-size: 13px; color: #6b7280; margin: 0;">EIS Consultant Training — Session 1 Reference Card</p></div>${[['Applying to the wrong mechanism','Treating a contract RFP like a grant, or vice versa. Classification is the first step — never skip it.'],['Skimming the eligibility section','Organizations have been disqualified for missing a single eligibility requirement buried on page 12. Read every word.'],['Ignoring the scoring rubric','The scoring rubric tells you what the funder values most. Your writing should reflect that ratio.'],['Writing to internal language, not funder language','Use the funder\'s language — not your client\'s internal branding.'],['Treating formatting requirements as optional','Font size, margin width, page limits, and file format requirements are NOT suggestions.'],['Assuming the evaluator knows the context','Write as if this is their first encounter with everything you\'re describing.'],['Confusing program description with needs statement','The needs statement describes the PROBLEM. The program description describes the SOLUTION.'],['Using unverified statistics','Unverified statistics are worse than no statistics — they signal carelessness to evaluators.'],['Missing the implicit question behind the section','Make sure your writing answers the question the evaluator is actually holding.'],['Treating the deadline as the end','Plan backward from the deadline. Internal drafts and QA review all need to happen first.']].map(([e,d],i)=>`<div style="display:flex;gap:16px;padding:14px;border-radius:8px;border:1px solid ${i<3?'#fca5a5':'#e5e7eb'};margin-bottom:10px;background:${i<3?'#fff1f2':'#fff'};"><div style="width:32px;height:32px;border-radius:50%;background:${i<3?'#AC1A5B':'#143A50'};color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:15px;flex-shrink:0;">${i+1}</div><div><p style="font-weight:bold;font-size:14px;color:#111827;margin:0 0 4px;">${e}</p><p style="font-size:13px;color:#4b5563;margin:0;">${d}</p></div></div>`).join('')}<div style="border-top: 2px solid #143A50; padding-top: 16px; margin-top: 8px; font-size: 11px; color: #9ca3af; text-align: center;">EIS Consultant Training Framework — Session 1 | Proprietary</div></div>`
      }
    ],
    videoGuide: {
      title: 'Pre-Session Video: Reading an RFP Like a Strategist (15 min)',
      description: 'Watch before attending Session 1. Covers the difference between reading for content vs. reading for strategy.',
      topics: ['The 3-pass reading method for any RFP', 'How to identify the evaluator\'s implicit questions', 'Live annotation demo using a real foundation grant', 'Template selection decision tree walkthrough']
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
    overview: 'This is the writing session — participants draft real proposal sections under timed, realistic conditions, then receive structured peer and facilitator feedback. It is uncomfortable by design. The goal is to identify gaps before a real deadline does.',
    objectives: [
      'Draft a SMART outcomes section in under 20 minutes from provided program data',
      'Write a needs statement that uses data without trauma-dumping',
      'Identify and correct EIS voice violations in peer drafts',
      'Complete and apply the EIS QA checklist to a live draft',
      'Give and receive professional feedback using the EIS feedback model'
    ],
    agenda: [
      { time: '0:00 – 0:08', activity: 'Framing: Why Timed Drafting Matters', description: 'Real proposals are written under deadline pressure. This session simulates that. Brief overview of the session structure and expectations.', type: 'intro' },
      { time: '0:08 – 0:25', activity: 'Sprint 1: Needs Statement (17 min)', description: 'Participants receive a one-page client profile and a funder\'s stated priorities. They have 17 minutes to write a 300-word needs statement. Facilitator times the room.', type: 'activity' },
      { time: '0:25 – 0:40', activity: 'Peer Review Round 1 — Needs Statements', description: 'Drafts are swapped. Reviewers have 10 minutes to annotate using the EIS Voice Checklist. Focus: data citations, tone, trauma language, and funder alignment.', type: 'activity' },
      { time: '0:40 – 0:55', activity: 'Sprint 2: Outcomes Section (15 min)', description: 'Using the same client profile, participants write 3 SMART outcomes. Facilitator calls time at 15 minutes — no extensions.', type: 'activity' },
      { time: '0:55 – 1:10', activity: 'Facilitator Demo: Before / After', description: 'Facilitator shares 2 participant drafts (anonymized or with permission) and rewrites them in real time, narrating every decision.', type: 'activity' },
      { time: '1:10 – 1:22', activity: 'QA Checklist Application', description: 'Each participant applies the EIS QA checklist to their own needs statement draft. Identify minimum 2 items that fail the checklist. Write corrections.', type: 'activity' },
      { time: '1:22 – 1:30', activity: 'Debrief + Required Outputs Review', description: 'What was hard? What surprised you? Facilitator connects the experience to Module 6 and 7 exercises.', type: 'wrap' }
    ],
    handouts: [
      {
        title: 'EIS Voice Compliance Checklist',
        description: 'Use this checklist to self-review any draft before submitting for internal review.',
        content: `<div style="font-family: Georgia, serif; max-width: 680px; margin: 0 auto; padding: 32px; color: #1a1a1a;"><div style="border-top: 4px solid #1E4F58; padding-top: 20px; margin-bottom: 24px;"><h1 style="font-size: 22px; font-weight: bold; color: #143A50; margin: 0 0 4px;">EIS Voice Compliance Checklist</h1><p style="font-size: 13px; color: #6b7280; margin: 0;">EIS Consultant Training — Session 2 Handout | Required self-review before submitting any draft</p></div>${[{cat:'Tone & Framing',color:'#1E4F58',items:['Writing is strategic and purposeful — no filler sentences','Claims are specific, not vague ("75% of participants" not "most participants")','No "passion statements" — NOT EIS voice','No trauma dumping — need is established with data, not suffering narratives','No savior framing — the organization supports the community, it does not rescue it']},{cat:'Evidence & Data',color:'#143A50',items:['Every statistic has an in-line citation (Source, Year)','Data is localized — national stats are supplemented by state/local data','No unverifiable claims remain in the draft','Evidence connects directly to the population the funder cares about']},{cat:'SMART Outcomes',color:'#AC1A5B',items:['Each outcome specifies WHO will achieve it (population + sample size)','Each outcome specifies WHAT will change (measurable indicator)','Each outcome specifies HOW MUCH change is expected (target %)','Each outcome specifies BY WHEN (specific date, not "by program end")','No aspirational outcomes remain']},{cat:'Structure & Compliance',color:'#1E4F58',items:['All required sections are present and in the correct order','Page / word limits are respected for each section','No placeholder text ([INSERT], TBD, XX) remains anywhere','Font, margins, and formatting follow the RFP requirements']}].map(s=>`<div style="margin-bottom:20px;"><h2 style="font-size:15px;font-weight:bold;color:${s.color};background:${s.color}18;padding:10px 14px;border-radius:6px;margin-bottom:10px;">${s.cat}</h2>${s.items.map(i=>`<div style="display:flex;gap:10px;align-items:flex-start;padding:7px 4px;border-bottom:1px solid #f3f4f6;"><div style="width:16px;height:16px;border:2px solid #d1d5db;border-radius:3px;flex-shrink:0;margin-top:2px;"></div><span style="font-size:13px;color:#374151;">${i}</span></div>`).join('')}</div>`).join('')}<div style="border-top: 2px solid #143A50; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">EIS Consultant Training Framework — Session 2 Handout | Proprietary</div></div>`
      },
      {
        title: 'SMART Outcomes Builder Worksheet',
        description: 'Step-by-step worksheet for transforming vague program goals into scoreable SMART outcomes.',
        content: `<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 32px; color: #1a1a1a;"><div style="border-top: 4px solid #AC1A5B; padding-top: 20px; margin-bottom: 24px;"><h1 style="font-size: 22px; font-weight: bold; color: #143A50; margin: 0 0 4px;">SMART Outcomes Builder</h1><p style="font-size: 13px; color: #6b7280; margin: 0;">EIS Consultant Training — Session 2 Handout</p></div><div style="background:#fef2f2;border-left:4px solid #AC1A5B;padding:16px;margin-bottom:24px;border-radius:0 8px 8px 0;"><p style="font-size:14px;font-weight:bold;color:#991b1b;margin:0 0 8px;">The SMART Formula</p><p style="font-size:13px;color:#7f1d1d;margin:0;"><strong>By [DATE],</strong> [NUMBER/PERCENTAGE] of [WHO] will [WHAT WILL CHANGE] as measured by [HOW — data source or assessment tool].</p></div>${[1,2,3].map(n=>`<div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:20px;"><h3 style="font-size:15px;font-weight:bold;color:#143A50;margin:0 0 14px;">Outcome ${n}</h3><table style="width:100%;border-collapse:collapse;font-size:13px;"><tr style="background:#f9fafb;"><td style="padding:9px;border:1px solid #e5e7eb;font-weight:600;width:160px;">🎯 By when?</td><td style="padding:9px;border:1px solid #e5e7eb;height:32px;">&nbsp;</td></tr><tr><td style="padding:9px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">👥 Who? (n=?)</td><td style="padding:9px;border:1px solid #e5e7eb;">&nbsp;</td></tr><tr style="background:#f9fafb;"><td style="padding:9px;border:1px solid #e5e7eb;font-weight:600;">📈 What changes?</td><td style="padding:9px;border:1px solid #e5e7eb;">&nbsp;</td></tr><tr><td style="padding:9px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">📋 Measured how?</td><td style="padding:9px;border:1px solid #e5e7eb;">&nbsp;</td></tr></table></div>`).join('')}<div style="border-top: 2px solid #143A50; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">EIS Consultant Training Framework — Session 2 Handout | Proprietary</div></div>`
      }
    ],
    videoGuide: {
      title: 'Pre-Session Video: The EIS Writing Standard — What "Good" Actually Looks Like (12 min)',
      description: 'Watch before Session 2. Demonstrates the difference between acceptable and excellent at the sentence level.',
      topics: ['Annotated before/after: needs statement', 'Annotated before/after: outcomes section', 'How to read your own draft like an evaluator', 'The change log process — why it matters']
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
    overview: 'This session is for consultants who are taking on review and QA authority. Participants evaluate real proposal drafts, identify risks, make escalation decisions, and calibrate their QA standards against EIS benchmarks.',
    objectives: [
      'Conduct a complete risk audit of a multi-section proposal draft',
      'Categorize risks as Strategic, Compliance, Organizational, or Reputational',
      'Make and document a "stop work" vs. "proceed" decision with justification',
      'Calibrate QA standards against EIS benchmarks through group discussion',
      'Write a risk escalation memo that is actionable and professionally presented'
    ],
    agenda: [
      { time: '0:00 – 0:10', activity: 'The Weight of Final Authority', description: 'Opening framing: what it means when your name is on the QA approval. One real (anonymized) case study of what happens when QA fails.', type: 'intro' },
      { time: '0:10 – 0:30', activity: 'Individual Risk Audit — Round 1', description: 'Each participant independently reviews the same 5-page proposal excerpt. Using the EIS Risk Audit framework, each identifies and categorizes every risk they find. No discussion during this phase.', type: 'activity' },
      { time: '0:30 – 0:50', activity: 'Calibration Discussion', description: 'Group compares findings. Facilitator introduces the EIS benchmark — what risks were actually present and which category each belongs to.', type: 'activity' },
      { time: '0:50 – 1:05', activity: 'Escalation Decision Exercise', description: 'Each participant receives 3 escalation scenarios. For each: write your decision (proceed, revise, stop), your rationale, and your escalation memo.', type: 'activity' },
      { time: '1:05 – 1:20', activity: 'Level 3 Calibration Panel', description: 'Level 3 consultants share their escalation decisions and memos. Facilitator presents the EIS standard response for each scenario.', type: 'activity' },
      { time: '1:20 – 1:30', activity: 'Wrap-Up: The QA Pledge', description: 'Every Level 3 consultant articulates — out loud — their commitment to exercising QA authority fully and without exception.', type: 'wrap' }
    ],
    handouts: [
      {
        title: 'EIS Risk Audit Framework',
        description: 'Complete framework for conducting a risk audit on any proposal draft. Required for Level 2+ module completion.',
        content: `<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 32px; color: #1a1a1a;"><div style="border-top: 4px solid #7c3aed; padding-top: 20px; margin-bottom: 24px;"><h1 style="font-size: 22px; font-weight: bold; color: #143A50; margin: 0 0 4px;">EIS Risk Audit Framework</h1><p style="font-size: 13px; color: #6b7280; margin: 0;">EIS Consultant Training — Session 3 Handout | Level 2+ Required</p></div>${[{type:'Strategic Risk',color:'#1E4F58',desc:'The proposal is technically compliant but unlikely to score competitively.',examples:['Weak theory of change not connected to evidence base','Outcomes that are achievable but not impressive relative to the award size','Organizational capacity section that is generic rather than specific']},{type:'Compliance Risk',color:'#b45309',desc:'The proposal may violate a funder requirement and face disqualification.',examples:['Section exceeds page limit by any amount','Required attachment missing or incorrectly formatted','Proposed budget includes potentially unallowable cost category']},{type:'Organizational Risk',color:'#DC2626',desc:'The proposal overpromises what the client can actually deliver post-award.',examples:['Staffing plan requires hiring before award notification','Outcomes targets exceed what the client\'s capacity supports','Budget assumes matching funds not yet confirmed']},{type:'Reputational Risk',color:'#7c3aed',desc:'The proposal contains language or claims that could embarrass EIS or the client.',examples:['Unverified statistics or data from unreliable sources','Claims about program uniqueness that are not verifiable','Advocacy statements that cross into lobbying territory']}].map(c=>`<div style="margin-bottom:18px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;"><div style="background:#f9fafb;padding:14px 16px;border-bottom:1px solid #e5e7eb;"><h3 style="font-size:15px;font-weight:bold;color:${c.color};margin:0 0 4px;">${c.type}</h3><p style="font-size:13px;color:#4b5563;margin:0;">${c.desc}</p></div><div style="padding:14px 16px;">${c.examples.map(e=>`<div style="display:flex;gap:8px;padding:4px 0;font-size:13px;color:#4b5563;"><span style="color:${c.color};font-weight:bold;">→</span>${e}</div>`).join('')}</div></div>`).join('')}<div style="border-top: 2px solid #143A50; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">EIS Consultant Training Framework — Session 3 Handout | Proprietary</div></div>`
      },
      {
        title: 'Escalation Decision Scenarios — Answer Key',
        description: 'The 3 escalation scenarios from Session 3 with the EIS standard response and reasoning.',
        content: `<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 32px; color: #1a1a1a;"><div style="border-top: 4px solid #7c3aed; padding-top: 20px; margin-bottom: 24px;"><h1 style="font-size: 22px; font-weight: bold; color: #143A50; margin: 0 0 4px;">Escalation Decision Scenarios</h1><p style="font-size: 13px; color: #6b7280; margin: 0;">EIS Consultant Training — Session 3 Facilitator Guide | Level 3 Distribution Only</p></div>${[{n:1,title:'Scenario A: Budget-Narrative Misalignment',scenario:'The narrative describes hiring a full-time Program Director. The budget shows 0.5 FTE for a "Program Coordinator" at $28,000 annually. The deadline is in 6 hours.',decision:'Escalate Immediately — Do Not Submit Without Resolution',reasoning:'Budget-narrative misalignment is a compliance risk AND an organizational risk. The deadline pressure does not change this. Contact EIS leadership immediately.',color:'#DC2626'},{n:2,title:'Scenario B: Unverifiable Impact Claim',scenario:'"Our program has achieved a 92% job placement rate for all participants over the past three years." No citation. No sample size. No definition of "job placement."',decision:'Revise or Remove Before Submission',reasoning:'An unverified claim of this specificity is a reputational risk. If the data cannot be substantiated, the claim must be removed. Do not submit unverifiable statistics under EIS review.',color:'#b45309'},{n:3,title:'Scenario C: Potential Conflict of Interest',scenario:'A Level 2 consultant just revealed her spouse sits on the board of the foundation this proposal is being submitted to. She did not disclose this at project kickoff.',decision:'Stop — Escalate to EIS Leadership Before Proceeding',reasoning:'This is an ethics and compliance issue that cannot be resolved at the consultant level. EIS leadership must be notified immediately. Document the disclosure immediately.',color:'#7c3aed'}].map(s=>`<div style="border:2px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:20px;"><div style="background:#f9fafb;padding:16px;border-bottom:1px solid #e5e7eb;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><div style="width:28px;height:28px;background:${s.color};border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;flex-shrink:0;">${s.n}</div><h3 style="font-size:15px;font-weight:bold;color:${s.color};margin:0;">${s.title}</h3></div><p style="font-size:13px;color:#374151;margin:0;font-style:italic;">${s.scenario}</p></div><div style="padding:16px;"><div style="padding:10px 14px;background:#f9fafb;border-radius:6px;margin-bottom:12px;border-left:4px solid ${s.color};"><p style="font-size:13px;font-weight:bold;color:${s.color};margin:0;">EIS Decision: ${s.decision}</p></div><p style="font-size:13px;color:#4b5563;margin:0;">${s.reasoning}</p></div></div>`).join('')}<div style="border-top: 2px solid #143A50; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">EIS Consultant Training Framework — Session 3 | Level 3 Only | Proprietary</div></div>`
      }
    ],
    videoGuide: {
      title: 'Pre-Session Video: The QA Mindset — Why Final Authority Is a Different Responsibility (18 min)',
      description: 'Required for all Level 2+ participants. Covers the institutional weight of QA authority and two real escalation decision case studies.',
      topics: ['The difference between reviewing and approving', 'Case study: what happened when QA failed (anonymized)', 'The EIS risk categorization system in practice', 'Writing escalation memos that get action']
    }
  }
];

const agendaColors = {
  intro: 'border-slate-300 bg-slate-50',
  activity: 'border-[#1E4F58] bg-[#1E4F58]/5',
  qa: 'border-blue-300 bg-blue-50',
  wrap: 'border-[#E5C089] bg-amber-50'
};

// ─── Handout Viewer ──────────────────────────────────────────────────────────
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
          <Button size="sm" variant="ghost" onClick={() => {
            const w = window.open('', '_blank');
            w.document.write(handout.content);
            w.document.close();
          }}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-200">
          <div
            className="bg-white"
            style={{ maxHeight: '500px', overflowY: 'auto' }}
            dangerouslySetInnerHTML={{ __html: handout.content }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Session Outline View ────────────────────────────────────────────────────
function SessionOutlineView({ session }) {
  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Objectives */}
      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-[#143A50] flex items-center gap-2 text-lg"><Target className="w-5 h-5" /> Learning Objectives</CardTitle>
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
      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-[#143A50] flex items-center gap-2 text-lg"><Clock className="w-5 h-5" /> Session Agenda</CardTitle>
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
        </CardContent>
      </Card>

      {/* Handouts */}
      <Card>
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
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LiveSessionManagementPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [activeOutline, setActiveOutline] = useState('1');
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({
    queryKey: ['liveSessions'],
    queryFn: () => base44.entities.LiveTrainingSession.list('-session_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LiveTrainingSession.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['liveSessions']); toast.success('Session created'); setShowDialog(false); setEditingSession(null); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LiveTrainingSession.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['liveSessions']); toast.success('Session updated'); setShowDialog(false); setEditingSession(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LiveTrainingSession.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['liveSessions']); toast.success('Session deleted'); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      session_title: formData.get('title'),
      session_type: formData.get('type'),
      level_required: formData.get('level'),
      session_date: new Date(formData.get('date') + 'T' + formData.get('time')).toISOString(),
      duration_minutes: parseInt(formData.get('duration')),
      facilitator_email: formData.get('facilitator'),
      max_participants: parseInt(formData.get('maxParticipants')),
      description: formData.get('description'),
      is_mandatory: formData.get('mandatory') === 'on'
    };
    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Live Training Sessions</h1>
            <p className="text-slate-600">Manage scheduled sessions and view session outlines</p>
          </div>
        </div>

        <Tabs defaultValue="outlines">
          <TabsList className="mb-6">
            <TabsTrigger value="outlines" className="flex items-center gap-2"><BookOpen className="w-4 h-4" />Session Outlines</TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2"><Calendar className="w-4 h-4" />Schedule Manager</TabsTrigger>
          </TabsList>

          {/* ── Session Outlines Tab ── */}
          <TabsContent value="outlines">
            <Tabs value={activeOutline} onValueChange={setActiveOutline}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="1">Session 1: Strategy</TabsTrigger>
                <TabsTrigger value="2">Session 2: Writing</TabsTrigger>
                <TabsTrigger value="3">Session 3: QA & Risk</TabsTrigger>
              </TabsList>
              {LIVE_SESSIONS.map(s => (
                <TabsContent key={s.id} value={String(s.id)}>
                  <SessionOutlineView session={s} />
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* ── Schedule Manager Tab ── */}
          <TabsContent value="schedule">
            <div className="flex justify-end mb-4">
              <Button onClick={() => { setEditingSession(null); setShowDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Session
              </Button>
            </div>

            {sessions.length === 0 && (
              <div className="text-center py-20 text-slate-400">
                <Video className="w-14 h-14 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-slate-500">No live sessions scheduled yet</p>
                <p className="text-sm mt-1">Click "Create Session" to schedule your first live training session.</p>
              </div>
            )}

            <div className="grid gap-4">
              {sessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{session.session_title}</h3>
                          <Badge>{sessionTypes[session.session_type]}</Badge>
                          <Badge variant="outline">{session.level_required}</Badge>
                          {session.is_mandatory && <Badge className="bg-red-600">Required</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                          <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{format(new Date(session.session_date), 'MMM d, yyyy h:mm a')}</div>
                          <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{session.duration_minutes} min</div>
                          <div className="flex items-center gap-1"><Users className="w-4 h-4" />{session.participants?.length || 0} / {session.max_participants}</div>
                        </div>
                        {session.description && <p className="text-sm text-slate-600">{session.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingSession(session); setShowDialog(true); }}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(session.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSession ? 'Edit' : 'Create'} Live Session</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Session Title</Label>
                <Input name="title" defaultValue={editingSession?.session_title} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Session Type</Label>
                  <Select name="type" defaultValue={editingSession?.session_type} required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(sessionTypes).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level Required</Label>
                  <Select name="level" defaultValue={editingSession?.level_required} required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="level-1">Level 1</SelectItem>
                      <SelectItem value="level-2">Level 2</SelectItem>
                      <SelectItem value="level-3">Level 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" name="date" defaultValue={editingSession ? format(new Date(editingSession.session_date), 'yyyy-MM-dd') : ''} required />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input type="time" name="time" defaultValue={editingSession ? format(new Date(editingSession.session_date), 'HH:mm') : ''} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input type="number" name="duration" defaultValue={editingSession?.duration_minutes || 60} required />
                </div>
                <div>
                  <Label>Max Participants</Label>
                  <Input type="number" name="maxParticipants" defaultValue={editingSession?.max_participants || 12} required />
                </div>
              </div>
              <div>
                <Label>Facilitator Email</Label>
                <Input type="email" name="facilitator" defaultValue={editingSession?.facilitator_email} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea name="description" defaultValue={editingSession?.description} rows={3} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="mandatory" defaultChecked={editingSession?.is_mandatory} />
                <Label>Mandatory for level progression</Label>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button type="submit">Save Session</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}