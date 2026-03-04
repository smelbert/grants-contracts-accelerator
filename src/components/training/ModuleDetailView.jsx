import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, Target, CheckCircle2, FileText, ChevronDown, ChevronUp, Lightbulb, Pen, Users, Shield } from 'lucide-react';

const MODULES_DATA = [
  {
    number: 1,
    title: 'The Funding & Procurement Ecosystem',
    subtitle: 'Understanding how money actually moves',
    levelRequired: null,
    critical: false,
    purpose: 'Establish foundational literacy in how funding decisions are structured, governed, and executed across public and private sectors. This module prevents misclassification errors that lead to compliance failures and strategic misalignment.',
    rationale: 'Strong programs fail when consultants misunderstand how money moves, who decides, and what rules govern access. This module establishes the non-negotiable baseline for all subsequent strategy and writing work.',
    competencies: [
      'Distinguish grants, contracts, RFPs, RFQs, RFIs, and sponsorships — and why the distinction matters',
      'Differentiate public vs. private funding structures and their governance implications',
      'Understand reimbursement vs. upfront funding models and their organizational impact',
      'Identify structural reasons proposals fail regardless of merit',
      'Recognize the difference between a funder\'s stated priorities and actual decision criteria',
      'Map the typical lifecycle of a grant or procurement cycle from release to award'
    ],
    keyContent: [
      {
        title: 'The Big Four: Grants, Contracts, RFPs, RFQs',
        body: 'Grants are charitable transfers of funds with no direct return expected. Contracts are legally binding agreements for deliverables with legal consequences for non-performance. RFPs (Requests for Proposals) solicit competitive bids for services. RFQs (Requests for Quotations) are primarily price-driven. Confusing these mechanisms leads to mismatch in tone, compliance requirements, and expectations.'
      },
      {
        title: 'Public vs. Private Funding Architecture',
        body: 'Public funding (federal, state, local government) is governed by procurement law, open records, and often rigid compliance structures. Private funding (foundations, corporations) is relationship-driven with more flexible processes. Each requires a different strategic approach — and failing to recognize which you are working in creates avoidable errors.'
      },
      {
        title: 'Why Good Programs Don\'t Get Funded',
        body: 'Common structural failure modes include: applying to the wrong mechanism, misreading eligibility, submitting out-of-cycle, failing to demonstrate community need with data, not reading the RFP thoroughly, and writing to an internal audience rather than the evaluator. Program quality is necessary but not sufficient.'
      }
    ],
    exercises: [
      { title: 'Mechanism Classification Exercise', description: 'Given 10 real-world funding scenarios, classify each as grant, contract, RFP, RFQ, sponsorship, or other. Justify your classification and identify the governing rules.' },
      { title: 'Failure Analysis Case Study', description: 'Review two sample proposals that were rejected. Identify the structural failure that likely caused rejection. Write a 1-paragraph analysis of what should have been done differently.' }
    ],
    levels: { level1: 'Identify and accurately classify funding mechanisms', level2: 'Compare strategic implications across mechanisms for a client', level3: 'Advise pursue/no-pursue decisions with documented rationale' },
    outputs: ['Funding mechanism classification exercise (completed)', 'Failure analysis case study (1 paragraph written analysis)']
  },
  {
    number: 2,
    title: 'How Funders & Evaluators Think',
    subtitle: 'Applying reviewer logic to proposal design',
    levelRequired: null,
    critical: false,
    purpose: 'Shift consultants from "writer mindset" to "evaluator mindset" by grounding proposal decisions in scoring logic, risk tolerance, and cognitive load. Every structural, tonal, and strategic decision in a proposal should be made with the evaluator\'s experience in mind.',
    rationale: 'Most unsuccessful proposals fail not because of poor content but because of poor positioning. Writers think about what they want to say; evaluators experience what they\'re forced to read. Understanding the evaluator\'s job transforms proposal quality.',
    competencies: [
      'Understand how reviewer scoring criteria are designed and applied',
      'Identify red flags that trigger rejection instincts in evaluators',
      'Apply funder priorities to structural and tonal design decisions',
      'Conduct a reviewer-perspective analysis of any proposal draft',
      'Understand the role of cognitive load in proposal readability and scoring',
      'Recognize the difference between what a funder says they want and what they actually score'
    ],
    keyContent: [
      {
        title: 'The Evaluator\'s Reality',
        body: 'Most grant evaluators review 20–50 proposals in a compressed period, often as volunteers or part-time reviewers. They are looking for reasons to score quickly, not reasons to engage deeply. Proposals that require effort to understand are penalized even when the content is strong. Design your proposal so the evaluator can locate, verify, and score each section with minimal effort.'
      },
      {
        title: 'How Scoring Rubrics Work',
        body: 'Most funders use a point-weighted rubric. Understanding the rubric reveals what they value most. If "Community Need" is worth 30 points and "Organizational Capacity" is worth 10, allocate your writing accordingly. When in doubt, mirror the funder\'s language directly in your headers and section titles — this is not plagiarism, it is alignment.'
      },
      {
        title: 'Red Flag Triggers',
        body: 'Common rejection triggers include: vague outcome statements ("we will help the community"), unsupported data claims, organizational bragging without evidence of results, requesting funds for activities already funded elsewhere, failure to explicitly connect program design to stated need, and overuse of jargon or insider language unfamiliar to evaluators.'
      }
    ],
    exercises: [
      { title: 'Annotated Reviewer Scorecard', description: 'Using a real grant RFP, create an annotated scorecard that maps each scoring criterion to the corresponding section of a sample proposal. Note where the proposal earns full points, partial points, or loses points.' },
      { title: 'Rejection Trigger Hunt', description: 'Review a sample proposal draft and identify at least 5 rejection triggers. For each trigger, write a corrected version that eliminates the problem.' }
    ],
    levels: { level1: 'Recognize scoring criteria and evaluator language in an RFP', level2: 'Draft proposal sections explicitly designed to satisfy evaluator priorities', level3: 'Engineer a scoring advantage through strategic positioning and language choices' },
    outputs: ['Annotated reviewer scorecard', 'Rejection trigger identification exercise with corrections']
  },
  {
    number: 3,
    title: 'Ethics, Compliance & Professional Standards',
    subtitle: 'Protecting integrity, credibility, and eligibility',
    levelRequired: null,
    critical: true,
    warning: 'NON-NEGOTIABLE: Failure to demonstrate ethics competency is grounds for removal from any active project.',
    purpose: 'Codify ethical conduct, compliance discipline, and professional boundaries as mandatory — not optional — consultant behavior. Every EIS consultant is responsible for upholding institutional integrity, regardless of level.',
    rationale: 'A single ethics violation can disqualify a client from future funding, expose EIS to legal liability, and permanently damage professional relationships. Ethics is not a module to check off — it is a filter through which every decision must pass.',
    competencies: [
      'Apply Grant Professionals Association (GPA) ethics framework to real situations',
      'Apply EIS internal quality standards and conduct protocols',
      'Identify, disclose, and manage conflicts of interest',
      'Maintain professional boundaries with clients at all times',
      'Recognize the difference between advocacy and misrepresentation',
      'Understand confidentiality obligations and data protection in grant work'
    ],
    keyContent: [
      {
        title: 'GPA Code of Ethics — Key Principles',
        body: 'The Grant Professionals Association Code of Ethics includes: Act with integrity in all professional relationships. Disclose and manage conflicts of interest. Never misrepresent qualifications, experience, or results. Maintain confidentiality. Refuse to accept contingency fees tied to award outcomes (percentage-based fees are unethical). EIS aligns with these principles as baseline standards.'
      },
      {
        title: 'EIS Internal Standards',
        body: 'EIS standards include: all client communications must be CC\'d to the supervising EIS lead. No consultant may submit a proposal without EIS review and approval. Consultants may not represent themselves as the author of EIS-owned work without explicit authorization. Templates and proprietary methodologies remain EIS intellectual property. All QA steps are mandatory, not optional.'
      },
      {
        title: 'Conflicts of Interest',
        body: 'A conflict of interest exists when a consultant\'s personal or financial relationships could influence — or appear to influence — their professional judgment. This includes: personal relationships with funder staff, financial interests in a competing applicant, prior work with the same funder as a reviewer. All potential conflicts must be disclosed immediately to EIS leadership.'
      }
    ],
    exercises: [
      { title: 'Ethics Scenario Analysis', description: 'Review 5 ethics scenarios drawn from real grant professional situations. For each, identify: the ethical issue, the correct response, and the long-term risk of the wrong response.' },
      { title: 'Conflict of Interest Identification', description: 'Given a client profile and your personal background, identify any actual or perceived conflicts of interest and write a formal disclosure statement.' }
    ],
    levels: { level1: 'Follow all compliance standards without exception', level2: 'Proactively identify and flag ethical risks before they escalate', level3: 'Exercise compliance authority — stop work if ethical standards are not met' },
    outputs: ['Ethics scenario analysis (5 scenarios)', 'Conflict of interest identification exercise']
  },
  {
    number: 4,
    title: 'EIS Voice, Style & Brand Protection',
    subtitle: 'Writing that protects institutional credibility',
    levelRequired: null,
    critical: false,
    purpose: 'Standardize the EIS voice to ensure consistency, credibility, and risk mitigation across all submissions. Every proposal submitted under the EIS name is a representation of EIS — not just the client.',
    rationale: 'Inconsistent voice, inflated claims, or credibility-damaging language can undermine a submission even when the content is technically sound. Brand protection is a quality control issue.',
    competencies: [
      'Understand EIS writing voice: strategic, clear, grounded, confident without being boastful',
      'Apply data-supported storytelling in all narrative sections',
      'Identify and remove inflated claims, vague outcomes, and unverifiable statements',
      'Recognize and eliminate red-flag language (trauma dumping, savior framing, overpromising)',
      'Write for external audiences — not internal staff or board members',
      'Match tone to funder type (government vs. foundation vs. corporate)'
    ],
    keyContent: [
      {
        title: 'The EIS Voice Principles',
        body: 'EIS proposals are: Strategic (every word serves a purpose), Evidence-based (claims are backed by data or direct experience), Equity-centered (language respects the dignity of communities served), Concise (no filler, no fluff, no repetition), and Confident (not arrogant — we know what we\'re doing, we don\'t need to oversell it).'
      },
      {
        title: 'Language to Avoid',
        body: 'NEVER use: "We are passionate about..." (overused, unmeasurable), "Our clients are in desperate need of..." (trauma dumping), "No one else is doing this work" (almost never true), "We will change lives" without specifying how and for whom, or superlative claims like "the most innovative program in the state" without evidence.'
      },
      {
        title: 'Matching Tone to Funder Type',
        body: 'Government RFPs require precise, technical language with heavy attention to compliance and deliverables. Private foundations prefer narrative warmth balanced with outcome clarity. Corporate funders want to understand impact in business-adjacent terms and want to know how the partnership reflects on their brand. One-size writing does not fit all funders.'
      }
    ],
    exercises: [
      { title: 'Voice Compliance Edit', description: 'Review a 2-page proposal section and edit it to meet EIS voice standards. Track every change you make and explain the reason for each edit.' },
      { title: 'Red Flag Language Correction', description: 'Given a list of 10 problematic sentences, rewrite each one in EIS-compliant language while preserving the core intent.' }
    ],
    levels: { level1: 'Apply approved EIS voice consistently in all assigned sections', level2: 'Adjust tone and framing strategically based on funder type', level3: 'Enforce brand standards across all team submissions — flag and correct non-compliant writing' },
    outputs: ['Voice compliance editing exercise (2-page section)', 'Red flag language correction (10 sentences)']
  },
  {
    number: 5,
    title: 'Using Templates Strategically',
    subtitle: 'Compliance before customization',
    levelRequired: null,
    critical: false,
    purpose: 'Prevent misuse of templates while teaching disciplined, compliant adaptation. Templates are tools — not finished products. Understanding when and how to adapt them — and when not to — is a critical competency.',
    rationale: 'Over-reliance on templates produces generic, low-scoring proposals. Under-utilization of templates wastes time and introduces inconsistency. Strategic use — compliant, intentional, funder-responsive — is the goal.',
    competencies: [
      'Understand the purpose, structure, and approved use of each EIS template category',
      'Distinguish between using a template (correct) and treating it as a finished product (incorrect)',
      'Identify when a template must be adapted vs. used as-is',
      'Maintain compliance requirements during customization',
      'Avoid common template misuse errors (copy-paste without reading, skipping sections, changing structure without justification)',
      'Know when to escalate a customization request to a senior consultant or EIS leadership'
    ],
    keyContent: [
      {
        title: 'What Templates Are (and Aren\'t)',
        body: 'EIS templates are pre-approved structural frameworks that reflect institutional best practices. They ensure quality floors, protect against compliance errors, and save time. They are NOT final drafts. They do NOT replace strategic thinking. They do NOT automatically make a proposal competitive — the client-specific content, evidence, and framing must still be added by the consultant.'
      },
      {
        title: 'Customization Rules',
        body: 'Level 1 consultants use templates as provided. Level 2 consultants may adapt language (not structure) with documented justification. Level 3 consultants may approve structural adaptations. Any adaptation that changes a required compliance element must be reviewed before submission, regardless of level. When in doubt, do not change it — ask first.'
      },
      {
        title: 'Common Template Misuse Errors',
        body: 'Most common errors: (1) Placeholder text left in the final submission. (2) Deleting required sections because they felt redundant. (3) Reordering sections to match a different funder\'s RFP without adjusting the rest. (4) Using a grants template for a contract RFP. (5) Adding unauthorized sections that exceed page limits.'
      }
    ],
    exercises: [
      { title: 'Template Alignment Exercise', description: 'Map an EIS needs statement template to a specific RFP\'s requirements. Identify where the template meets the RFP, where it must be adapted, and where it needs entirely new content.' },
      { title: 'Customization Risk Analysis', description: 'Review 3 customized proposal sections submitted by hypothetical consultants. Identify which customizations are appropriate, which are risky, and which must be escalated or reversed.' }
    ],
    levels: { level1: 'Use all templates correctly — do not deviate without authorization', level2: 'Adapt template language (not structure) with documented rationale', level3: 'Approve or reject structural adaptations made by Level 1 and 2 consultants' },
    outputs: ['Template alignment exercise', 'Customization risk analysis (3 sections reviewed)']
  },
  {
    number: 6,
    title: 'Drafting Core Narrative Sections',
    subtitle: 'From need to outcomes — the writing core',
    levelRequired: null,
    critical: false,
    purpose: 'Build foundational narrative writing competence aligned to funder logic. This is the core writing module — the skills built here are used in every single project.',
    rationale: 'Narrative quality is the primary differentiator between funded and unfunded proposals with equivalent program merit. Writing well is not enough — writing strategically for a specific evaluator is the skill.',
    competencies: [
      'Write compelling, data-grounded needs statements that establish urgency without trauma-dumping',
      'Craft program descriptions that connect design to need and outcomes to evaluation',
      'Write SMART outcomes (Specific, Measurable, Achievable, Relevant, Time-bound)',
      'Align every section explicitly to funder priorities and stated criteria',
      'Write executive summaries that work as standalone persuasive documents',
      'Draft organizational capacity sections that demonstrate without boasting'
    ],
    keyContent: [
      {
        title: 'The Needs Statement: Setting the Stage',
        body: 'A strong needs statement does three things: (1) establishes the problem with verified data, (2) localizes the problem to the target population the funder cares about, and (3) creates urgency without manufacturing despair. Structure: National → State → Local data. Gap analysis. Why existing solutions are insufficient. Why NOW. Every claim needs a citation.'
      },
      {
        title: 'Writing SMART Outcomes',
        body: 'Vague: "Participants will improve their financial skills." SMART: "By December 31, 2025, 75% of program participants (n=40) will increase their personal savings rate by at least 10% as measured by pre/post financial assessment surveys administered by a certified financial coach." The SMART version is scoreable, auditable, and credible. The vague version is worthless to a funder.'
      },
      {
        title: 'Program Descriptions That Score',
        body: 'A strong program description answers: What will you do? Who will do it? How many people will you serve? Over what timeframe? With what intensity? Why will this approach produce the stated outcomes (the theory of change)? What evidence base supports this model? Each answer must connect back to the stated need. Structure before narrative — outline first, always.'
      }
    ],
    exercises: [
      { title: 'Needs Statement Draft', description: 'Using provided client data and a real grant RFP, write a 500-word needs statement that meets all quality criteria. Submit for peer review and incorporate feedback.' },
      { title: 'SMART Outcomes Transformation', description: 'Given 5 vague outcome statements, rewrite each as a SMART outcome. Then write 3 original SMART outcomes for a fictional program serving your assigned client population.' }
    ],
    levels: { level1: 'Draft assigned sections (needs statement, outcomes) with supervision', level2: 'Lead full narrative development independently — all sections', level3: 'Set strategic framing, approve final narrative voice and structure' },
    outputs: ['Needs statement draft (500 words)', 'Program narrative with 5 SMART outcomes']
  },
  {
    number: 7,
    title: 'Internal Review & Revision Cycles',
    subtitle: 'Professional response to feedback',
    levelRequired: null,
    critical: false,
    purpose: 'Normalize revision as a quality control process — not a personal critique. Professional consultants improve their work through structured feedback. Defensive or incomplete revision is a performance issue.',
    rationale: 'The quality of final submissions depends entirely on the quality of the revision process. Consultants who cannot receive and act on feedback are a liability, not an asset. This module establishes revision as a discipline.',
    competencies: [
      'Conduct a self-quality-check before submitting any draft for internal review',
      'Use the EIS QA checklist accurately and completely',
      'Respond to reviewer feedback professionally and completely',
      'Maintain a change log that documents every revision made and why',
      'Distinguish between feedback that requires action and feedback that requires discussion',
      'Meet internal deadlines consistently — late drafts delay final submissions'
    ],
    keyContent: [
      {
        title: 'The Pre-Review Self-Check',
        body: 'Before submitting any draft for internal review, a consultant must verify: Does every section address the RFP requirements? Are all page limits and formatting requirements met? Are all outcomes SMART? Are all data claims cited? Is the EIS voice consistent throughout? Has the QA checklist been completed? Submitting without completing this check is a professional standard violation.'
      },
      {
        title: 'How to Receive and Use Feedback',
        body: 'Feedback is a gift, not an attack. Professional response includes: reading all feedback before responding, not defending the original draft, tracking every change in the change log, and responding to 100% of reviewer comments (either by making the change or explaining why it was not appropriate). "I disagree" is not a sufficient response — propose an alternative.'
      },
      {
        title: 'The Change Log Protocol',
        body: 'Every revision cycle requires a change log. Format: Section | Reviewer Comment | Action Taken | Reason. This log serves multiple purposes: it proves revision was complete, it creates institutional memory, and it allows supervisors to assess your judgment in revision decisions. The change log is a required output, not optional documentation.'
      }
    ],
    exercises: [
      { title: 'Revision with Change Log', description: 'Receive a marked-up draft from your supervisor. Complete all revisions, maintain a change log documenting every change, and resubmit with the log attached.' },
      { title: 'QA Checklist Audit', description: 'Complete the EIS QA checklist for a sample proposal. Identify 3 areas that fail the checklist and write the corrections needed.' }
    ],
    levels: { level1: 'Revise responsively and completely — no incomplete revisions', level2: 'Self-QA before every submission — review before handing off', level3: 'Final QA authority — issue final approval or rejection before submission' },
    outputs: ['Revised draft with completed change log', 'QA checklist completion with identified failures and corrections']
  },
  {
    number: 8,
    title: 'Translating Vision into Fundable Strategy',
    subtitle: 'Strategy before writing',
    levelRequired: 'level-2',
    critical: false,
    purpose: 'Shift consultants from transcription to strategic interpretation. Level 2 consultants are not just writers — they are strategic translators who take raw client input and identify what is fundable, what needs development, and what must be reframed.',
    rationale: 'Clients often present their vision in internal language — jargon, aspirational statements, and program logic that makes sense to their staff but not to funders. Strategic translation is the skill that turns good intentions into competitive proposals.',
    competencies: [
      'Conduct a strategic discovery conversation with a client',
      'Identify fundable elements within a client\'s raw vision and program ideas',
      'Develop a strategy brief that translates client input into funder-ready framing',
      'Align the client\'s theory of change to the funder\'s stated priorities',
      'Identify gaps in client readiness (missing data, weak outcomes logic, capacity concerns)',
      'Write recommendations that are honest, constructive, and actionable'
    ],
    keyContent: [
      {
        title: 'The Strategic Discovery Process',
        body: 'Before writing begins, Level 2 consultants conduct a structured discovery: What is the client trying to accomplish? Who are they serving? What evidence do they have that their approach works? What have they tried before? What does success look like in 1 year? 3 years? What are they NOT willing to change? The answers to these questions form the raw material for the strategy brief.'
      },
      {
        title: 'What Makes Something "Fundable"',
        body: 'Fundable elements share characteristics: demonstrated need backed by data, a plausible theory of change, measurable outcomes, organizational capacity to execute, and alignment to a specific funder\'s priorities. A passionate program with no data, no clear outcomes, and no funder alignment is not fundable — regardless of its impact. Part of the consultant\'s job is to say so, clearly and professionally.'
      },
      {
        title: 'The Strategy Brief',
        body: 'The strategy brief is the pre-writing document that sets direction for the proposal. It includes: Program name and description, Target population and geography, Theory of change summary, 3-5 proposed outcomes, Funder alignment analysis, Gaps to address before writing, Recommended framing approach. The strategy brief must be approved by EIS leadership before full drafting begins.'
      }
    ],
    exercises: [
      { title: 'Strategy Brief from Raw Client Input', description: 'Given a 2-page "brain dump" from a fictional client describing their program ideas, write a complete strategy brief. Identify fundable elements, gaps, and your recommended framing approach.' }
    ],
    levels: { level1: 'N/A — receives strategic direction, does not set it', level2: 'Develop strategy briefs independently with supervisor review', level3: 'Approve strategy briefs — advise on pursue/no-pursue at the portfolio level' },
    outputs: ['Strategy brief (completed from raw client input)', 'Gap analysis with recommendations']
  },
  {
    number: 9,
    title: 'Proposal Architecture & Story Spine',
    subtitle: 'Designing the reviewer journey',
    levelRequired: 'level-2',
    critical: false,
    purpose: 'Teach Level 2 consultants to design proposals holistically — not as a collection of sections, but as a unified argument that guides the reviewer from problem to solution to confidence in the organization.',
    rationale: 'Winning proposals feel inevitable by the conclusion. Every section prepares the reader for the next. This is not accidental — it is the result of deliberate architectural planning before a word of narrative is written.',
    competencies: [
      'Design a proposal architecture (outline with section logic, not just section list)',
      'Create a story spine that connects need → solution → outcomes → organizational fit',
      'Map the reviewer journey from first read to scoring decision',
      'Ensure logical flow and internal consistency across all sections',
      'Identify structural weaknesses in others\' proposal drafts',
      'Use transitional strategy between sections to maintain coherence'
    ],
    keyContent: [
      {
        title: 'Story Spine Structure',
        body: 'The story spine for a grant proposal follows a predictable logic: (1) Once upon a time, there was a real, documented problem... (2) Because of this problem, a specific population experiences harm... (3) Until now, existing approaches have been insufficient because... (4) Our organization, positioned in this community, designed this approach specifically to... (5) We measure success by... (6) Our track record demonstrates we can deliver because... This isn\'t a writing formula — it\'s a logic test. Each section must connect to the next.'
      },
      {
        title: 'Architecture vs. Outline',
        body: 'An outline lists sections. An architecture explains the logic between sections. Architecture thinking asks: Why does this section come before that one? What does the reader need to believe before they reach the budget? How do I use the executive summary to prime the reviewer\'s expectations? Consultants who think architecturally produce dramatically stronger proposals.'
      }
    ],
    exercises: [
      { title: 'Proposal Outline + Spine Rationale', description: 'For a provided grant opportunity, create a full proposal outline AND a written rationale (2-3 sentences per section) explaining the architectural logic — why each section is positioned where it is.' }
    ],
    levels: { level1: 'N/A — follows provided outline structure', level2: 'Create full proposal architecture with documented rationale', level3: 'Approve, redesign, or restructure proposal architectures for competitive advantage' },
    outputs: ['Proposal outline with architectural rationale (all sections)', 'Story spine narrative (500 words)']
  },
  {
    number: 10,
    title: 'Budgets, Scopes & Narrative Alignment',
    subtitle: 'Numbers tell a story too',
    levelRequired: 'level-2',
    critical: true,
    warning: 'HIGH RISK: Budget errors can disqualify proposals or create post-award compliance violations. Always escalate budget questions to EIS leadership.',
    purpose: 'Ensure consultants understand how budgets function as strategic and compliance documents — not just financial summaries. The budget must tell the same story as the narrative.',
    rationale: 'Budget-narrative misalignment is one of the most common causes of post-award compliance issues and funder relationship damage. The consultant\'s role is to ensure every budget line is justified, every cost is allowable, and the overall budget makes the program design credible.',
    competencies: [
      'Understand how grant budgets function differently from organizational operating budgets',
      'Identify allowable vs. unallowable costs under common grant regulations',
      'Write clear, compelling budget narratives that justify every line item',
      'Identify and resolve misalignments between narrative scope and budget costs',
      'Understand reimbursement logic and cash flow implications for client organizations',
      'Recognize when a budget must be escalated to EIS leadership (always for Level 1 and 2)'
    ],
    keyContent: [
      {
        title: 'The Budget as a Compliance Document',
        body: 'A grant budget is not a wish list — it is a binding commitment. Every line item in a submitted budget represents a promise to the funder. Post-award, organizations must spend money in alignment with the approved budget or request formal modifications. Consultants who treat budgets casually create serious compliance risks for their clients. At EIS, all budget work is reviewed by a senior consultant before submission.'
      },
      {
        title: 'Budget-Narrative Alignment',
        body: 'The narrative says you will hire a program coordinator. The budget must show the coordinator\'s salary, benefits, and FTE percentage. The narrative says you will conduct 12 community workshops. The budget must show the cost of space, materials, food (if allowable), and facilitator time for 12 events. If it\'s in the narrative, it must be in the budget. If it\'s in the budget, it must be in the narrative. No exceptions.'
      },
      {
        title: 'Common Unallowable Costs',
        body: 'Common unallowable costs in government grants include: alcoholic beverages, entertainment, lobbying activities, costs already covered by other funding sources (double-dipping), and depreciation on equipment purchased before the grant period. Private foundations vary significantly — always check the funder\'s guidelines. When in doubt: ask EIS leadership before including any uncertain cost.'
      }
    ],
    exercises: [
      { title: 'Budget-Narrative Alignment Exercise', description: 'Review a sample proposal narrative and corresponding budget. Identify every misalignment — where the narrative promises something not in the budget, or the budget includes something not justified in the narrative. Write corrections for each.' }
    ],
    levels: { level1: 'Understand budget logic — do not write or modify budgets independently', level2: 'Align narrative to provided budget, flag concerns to supervisor', level3: 'Advise on budget feasibility and scope — approve before submission' },
    outputs: ['Budget-narrative alignment analysis', 'Budget narrative justification for 5 line items']
  },
  {
    number: 11,
    title: 'Client Communication Protocols',
    subtitle: 'Boundaries protect quality and credibility',
    levelRequired: 'level-2',
    critical: false,
    purpose: 'Establish and enforce professional communication boundaries that protect the client relationship, the quality of the work, and EIS\'s institutional credibility.',
    rationale: 'Unauthorized client communication is one of the most common sources of project confusion, expectation mismanagement, and relationship damage. Clear protocols protect everyone — client, consultant, and EIS.',
    competencies: [
      'Understand EIS communication authorization levels by consultant level',
      'Apply CC and approval protocols for all client correspondence',
      'Manage client expectations professionally — especially around timelines and outcomes',
      'Enforce communication boundaries without damaging client relationships',
      'Escalate client concerns appropriately through EIS channels',
      'Document all significant client communications for institutional record'
    ],
    keyContent: [
      {
        title: 'Communication Authorization by Level',
        body: 'Level 1 Consultants: Receive and read client communications. Do NOT respond directly. Forward all client communications to the supervising EIS lead immediately. Level 2 Consultants: May respond to routine status questions with CC to EIS lead. May NOT make commitments about deliverables, timelines, or outcomes without authorization. Level 3 Consultants: May lead strategy conversations and make commitments within approved scope. Must document all significant commitments made.'
      },
      {
        title: 'Managing Client Expectations',
        body: 'Clients frequently have unrealistic expectations about funding timelines, award probabilities, and the proposal process. It is the consultant\'s job to manage these expectations professionally and proactively. Telling a client what they want to hear is NOT client service — it sets them up for disappointment and damages EIS credibility. Saying "I don\'t know — let me check with my supervisor" is always better than guessing.'
      }
    ],
    exercises: [
      { title: 'Client Email Simulation', description: 'Given a series of 5 fictional client emails with various requests and questions, write your response for each — following the appropriate authorization level protocol. Identify which emails require escalation.' }
    ],
    levels: { level1: 'Observe only — no direct client communication without authorization', level2: 'Limited communication with CC protocol — escalate commitments and concerns', level3: 'Lead client strategy conversations — document all significant commitments' },
    outputs: ['Client email simulation (5 responses with protocol documentation)', 'Communication escalation decision framework']
  },
  {
    number: 12,
    title: 'QA, Risk & Self-Review',
    subtitle: 'Catching issues before they escalate',
    levelRequired: 'level-2',
    critical: false,
    purpose: 'Build advanced quality assurance discipline in Level 2 consultants who are taking on greater responsibility for proposal quality before senior review.',
    rationale: 'Every layer of quality review that catches an error before final submission is exponentially more valuable than catching it after. Level 2 consultants are the second line of defense — and must operate with that seriousness.',
    competencies: [
      'Apply advanced QA frameworks beyond the basic checklist',
      'Conduct systematic risk identification in proposal drafts',
      'Identify legal, compliance, and strategic risks in client materials',
      'Exercise self-review discipline — catch your own errors first',
      'Conduct peer review of Level 1 consultant work with professional, constructive feedback',
      'Escalate risk findings appropriately and promptly'
    ],
    keyContent: [
      {
        title: 'The Risk Audit Process',
        body: 'A risk audit goes beyond checklist compliance. It asks: What in this proposal could embarrass EIS if made public? What claims cannot be verified? What commitments will this client struggle to keep post-award? What compliance requirements could be violated? What is the weakest section — and is it the most heavily weighted? Risk identification is not pessimism — it is professional due diligence.'
      },
      {
        title: 'Types of Proposal Risk',
        body: 'Strategic risk: The proposal is technically compliant but strategically weak — unlikely to score well. Compliance risk: The proposal violates a funder requirement — may be disqualified. Organizational risk: The proposal overpromises what the client can actually deliver — post-award compliance failure. Reputational risk: The proposal contains language or claims that could damage EIS or the client if questioned.'
      }
    ],
    exercises: [
      { title: 'Risk Audit of Sample Proposal', description: 'Conduct a full risk audit of a provided 10-page sample proposal. Categorize each risk as Strategic, Compliance, Organizational, or Reputational. Write a risk summary memo with escalation recommendations.' }
    ],
    levels: { level1: 'N/A — receives QA feedback, does not conduct it', level2: 'Conduct self-QA and peer review of Level 1 work', level3: 'Full risk audit authority — final QA before all submissions' },
    outputs: ['Risk audit of sample proposal with risk memo', 'Peer review of Level 1 consultant draft with feedback']
  },
  {
    number: 13,
    title: 'Mentoring Level 1 Consultants',
    subtitle: 'Developing others without lowering standards',
    levelRequired: 'level-2',
    critical: false,
    purpose: 'Prepare Level 2 consultants to provide professional, effective mentorship to Level 1 consultants without compromising quality standards, timelines, or institutional expectations.',
    rationale: 'Level 2 consultants who cannot mentor effectively create a bottleneck in the consulting pipeline. Good mentors multiply institutional capacity — poor mentors create dependencies and inconsistency.',
    competencies: [
      'Distinguish between coaching (developing capacity) and fixing (doing it for them)',
      'Deliver feedback that is direct, specific, and actionable — not vague or demoralizing',
      'Maintain quality standards while giving Level 1 consultants room to learn',
      'Document mentorship activities for institutional records',
      'Recognize when to escalate Level 1 performance concerns to EIS leadership',
      'Model the professional behaviors EIS expects at all levels'
    ],
    keyContent: [
      {
        title: 'Coaching vs. Fixing',
        body: 'The most common mentoring error: rewriting the mentee\'s work instead of teaching them to improve it. Fixing is faster in the short term and creates dependency in the long term. Coaching is harder and slower but develops capacity. At EIS, we develop consultants — we do not create ghost-writers who replace the mentee\'s work without their understanding. If a Level 1 consultant cannot produce acceptable work after coaching, that is a performance concern to escalate — not a reason to do the work for them.'
      },
      {
        title: 'Giving Effective Feedback',
        body: 'Effective feedback is: Specific ("The needs statement on page 2 lacks local data — here\'s what\'s needed"), Actionable ("Add the 2023 poverty rate for [county] from the Census Bureau"), Framed constructively ("This section will be stronger when..."), and Timely (within 24-48 hours of draft submission). Vague feedback ("This needs more work") is not mentoring — it is frustration expressed ineffectively.'
      }
    ],
    exercises: [
      { title: 'Mentorship Plan', description: 'Create a 30-day mentorship plan for a fictional Level 1 consultant who has just been assigned to their first project. Include weekly check-ins, learning goals, and success metrics.' },
      { title: 'Feedback Sample', description: 'Review a Level 1 draft section and write a feedback memo that includes specific, actionable corrections for every problem identified.' }
    ],
    levels: { level1: 'Receives mentorship — participates actively and applies feedback', level2: 'Provides formal mentorship to Level 1 consultants with documentation', level3: 'Oversees mentorship quality — reviews and approves mentorship plans' },
    outputs: ['30-day mentorship plan', 'Feedback memo for Level 1 draft']
  },
  {
    number: 14,
    title: 'Leading Proposal & Capture Strategy',
    subtitle: 'Setting direction, not just drafting',
    levelRequired: 'level-2',
    critical: false,
    purpose: 'Prepare Level 2 consultants to lead proposal processes end-to-end — not just write sections — including client strategy, team coordination, and submission management.',
    rationale: 'Level 2 consultants who can only execute assigned tasks are half as valuable as those who can lead a proposal team. Leadership at this level is about coordination, clarity, and accountability — not authority over others.',
    competencies: [
      'Develop and manage a capture strategy for a specific funding opportunity',
      'Coordinate cross-functional proposal teams (consultant, client, SMEs)',
      'Create and maintain a proposal schedule with built-in review cycles',
      'Lead kickoff and check-in meetings with defined agendas and outcomes',
      'Make and communicate strategic decisions about proposal content',
      'Manage deadline pressure while maintaining quality standards'
    ],
    keyContent: [
      {
        title: 'Capture Strategy',
        body: 'A capture strategy is the plan to win a specific opportunity before the proposal is written. It includes: Funder research and relationship mapping, Competitive landscape analysis (who else is likely applying?), Alignment assessment (how well do we fit this opportunity?), Go/No-go recommendation, and Win themes (the 2-3 most compelling reasons we should win this award). Capture strategy is done BEFORE the RFP drops or immediately upon release — not during the writing sprint.'
      },
      {
        title: 'Leading Without Authority',
        body: 'Proposal team leadership often means coordinating people who are not direct reports — including clients, subject matter experts, and senior colleagues. Leading without authority requires: clear role definition from the start, documented timelines with named owners, consistent communication about status and blockers, and the confidence to escalate when someone is off-track. You do not need to be the most senior person in the room to lead the proposal process effectively.'
      }
    ],
    exercises: [
      { title: 'Proposal Calendar', description: 'Given a grant deadline 30 days out, create a complete proposal calendar with milestones, review cycles, named owners for each section, and buffer time for revisions.' },
      { title: 'Capture Strategy', description: 'Develop a one-page capture strategy for a fictional $250,000 grant opportunity, including go/no-go recommendation and win themes.' }
    ],
    levels: { level1: 'N/A — follows the schedule, does not lead the process', level2: 'Leads proposal process for assigned opportunities with supervisor oversight', level3: 'Approves capture strategies and proposal calendars — advises on portfolio strategy' },
    outputs: ['30-day proposal calendar', 'One-page capture strategy with go/no-go recommendation']
  },
  {
    number: 15,
    title: 'Advanced Reviewer Psychology',
    subtitle: 'Competitive positioning at scale',
    levelRequired: 'level-3',
    critical: false,
    purpose: 'Develop senior-level understanding of reviewer psychology, competitive dynamics, and advanced positioning strategies that create scoring advantages in highly competitive funding environments.',
    rationale: 'At the senior level, the difference between winning and losing is rarely technical compliance — it\'s strategic positioning. This module develops the analytical skills to gain competitive advantage through deep understanding of how evaluators experience and score proposals.',
    competencies: [
      'Analyze and counter evaluator cognitive biases that affect scoring',
      'Develop competitive positioning strategies based on landscape analysis',
      'Design proposals that create differentiation in crowded fields',
      'Use advanced language and structural techniques to maximize scoring',
      'Coach Level 1 and 2 consultants on positioning strategy',
      'Conduct win/loss analysis on submitted proposals'
    ],
    keyContent: [
      {
        title: 'Evaluator Cognitive Biases',
        body: 'Evaluators are human. Common biases include: Anchoring (first impression strongly influences all subsequent scoring), Familiarity bias (organizations the evaluator has heard of get benefit of the doubt), Recency bias (the last proposal read influences perception of earlier ones), and Confirmation bias (evaluators look for evidence that confirms their initial impression). Senior consultants design proposals that exploit positive biases and counter negative ones.'
      },
      {
        title: 'Strategic Differentiation',
        body: 'In a field of 50 applications, differentiation means: a distinctive theory of change that isn\'t generic, outcome targets that are specific enough to be credible, organizational evidence that is specific and verifiable (not generic capacity claims), and framing that makes the funder feel that this application was written specifically for them (because it was). Generic applications score generically. Strategic applications win.'
      }
    ],
    exercises: [
      { title: 'Win/Loss Analysis', description: 'Analyze 3 proposals — 1 known winner, 1 known runner-up, 1 known rejection. Using the advanced reviewer psychology framework, identify what drove each outcome.' },
      { title: 'Competitive Positioning Brief', description: 'For a competitive federal grant opportunity, write a positioning brief that identifies likely competitors and recommends strategic differentiation approaches.' }
    ],
    levels: { level1: 'N/A', level2: 'Apply basic positioning principles with direction', level3: 'Design advanced competitive positioning — coach others on strategy' },
    outputs: ['Win/loss analysis (3 proposals)', 'Competitive positioning brief']
  },
  {
    number: 16,
    title: 'Final QA & Risk Management',
    subtitle: 'Institutional protection is the role',
    levelRequired: 'level-3',
    critical: false,
    purpose: 'Define and develop the final QA and risk management role of Level 3 consultants — the last line of institutional defense before any proposal is submitted.',
    rationale: 'Level 3 consultants hold final QA authority because they have the experience and judgment to identify issues that junior consultants miss. This authority comes with absolute responsibility. A proposal that leaves EIS with a Level 3 approval is a proposal EIS stands behind.',
    competencies: [
      'Conduct comprehensive final QA across all proposal dimensions',
      'Exercise risk escalation authority — stop submissions with serious concerns',
      'Validate compliance with all funder requirements before submission',
      'Review and approve budget-narrative alignment',
      'Ensure EIS brand and voice standards are maintained throughout',
      'Certify proposal readiness for submission'
    ],
    keyContent: [
      {
        title: 'The Final QA Protocol',
        body: 'Level 3 final QA is a structured review covering: (1) Compliance check — every funder requirement met, (2) Narrative quality — voice, evidence, outcomes, alignment, (3) Budget accuracy — all line items justified, allowable, and aligned, (4) Risk identification — any concerns that could embarrass EIS or harm the client post-award, (5) Brand compliance — EIS standards maintained throughout, (6) Submission readiness — all attachments complete, correct file formats, within limits.'
      },
      {
        title: 'Risk Escalation Authority',
        body: 'Level 3 consultants have the authority — and responsibility — to stop a submission if serious concerns are identified. This authority is not to be used lightly, but it must be used when necessary. Stopping a problematic submission before it goes out is exponentially better than managing the consequences after. Document every escalation decision clearly and immediately notify EIS leadership.'
      }
    ],
    exercises: [
      { title: 'Final QA Certification', description: 'Conduct a full final QA review of a 15-page sample proposal using the Level 3 QA protocol. Write a QA certification memo that either clears the proposal for submission or identifies issues requiring resolution.' }
    ],
    levels: { level1: 'N/A', level2: 'N/A', level3: 'Final QA authority — no proposal submits without Level 3 clearance' },
    outputs: ['QA certification memo', 'Risk escalation documentation sample']
  },
  {
    number: 17,
    title: 'Coaching Across Skill Levels',
    subtitle: 'Systematic consultant development',
    levelRequired: 'level-3',
    critical: false,
    purpose: 'Prepare Level 3 consultants to provide structured, effective coaching to consultants at all levels — including Level 2 consultants who need development beyond basic mentorship.',
    rationale: 'The quality of the EIS consulting team depends on the quality of coaching provided by senior consultants. Level 3 consultants are the primary developers of institutional talent.',
    competencies: [
      'Conduct skills assessments for Level 1 and 2 consultants',
      'Create individual development plans based on performance data',
      'Deliver coaching sessions that develop specific competencies',
      'Evaluate consulting performance against level expectations',
      'Identify and escalate chronic performance concerns',
      'Document development progress for institutional records'
    ],
    keyContent: [
      {
        title: 'Skills Assessment Framework',
        body: 'A structured skills assessment for consultants evaluates: Technical competency (can they produce the required outputs at the required quality?), Process compliance (do they follow EIS protocols consistently?), Professional conduct (do they communicate, revise, and collaborate professionally?), and Development trajectory (are they improving over time?). Assessment results inform development plans, project assignments, and promotion decisions.'
      },
      {
        title: 'Coaching for Performance vs. Development',
        body: 'Performance coaching addresses a specific gap: "You consistently miss deadlines. Here is a concrete plan to address this in the next 30 days." Development coaching builds future capacity: "You are ready to begin taking on strategy work. Here is how we will structure that learning over the next quarter." Both are important. Confusing them — treating a performance problem as a development opportunity — delays necessary action.'
      }
    ],
    exercises: [
      { title: 'Individual Development Plan', description: 'Based on a provided performance assessment profile for a fictional Level 2 consultant, create a 90-day individual development plan with specific learning activities, milestones, and success metrics.' },
      { title: 'Coaching Session Simulation', description: 'Conduct (or role-play) a 30-minute coaching session with a Level 1 consultant using the EIS coaching framework. Submit a written summary of the session, goals set, and follow-up actions.' }
    ],
    levels: { level1: 'N/A', level2: 'N/A', level3: 'Design and deliver coaching for Level 1 and 2 consultants — document all coaching activity' },
    outputs: ['90-day individual development plan', 'Coaching session summary with goals and follow-up']
  },
  {
    number: 18,
    title: 'Pricing, Scope & Feasibility',
    subtitle: 'Business-minded consulting',
    levelRequired: 'level-3',
    critical: false,
    purpose: 'Develop Level 3 consultants\' ability to advise on project pricing, scope definition, and feasibility — ensuring EIS takes on work that is executable, appropriately priced, and aligned with organizational capacity.',
    rationale: 'Taking on the wrong projects at the wrong price creates downstream problems for clients, consultants, and EIS. Senior consultants must have the business acumen to identify good opportunities and pass on bad ones.',
    competencies: [
      'Evaluate grant and contract opportunities for organizational feasibility',
      'Understand EIS pricing models and when to recommend exceptions',
      'Assess client organizational capacity relative to proposed program scope',
      'Write scope of work documents that are protective for EIS and fair to clients',
      'Advise on resource planning for multi-consultant proposals',
      'Make go/no-go recommendations with documented rationale'
    ],
    keyContent: [
      {
        title: 'Feasibility Assessment',
        body: 'Feasibility assessment asks: Can this client actually execute this program if funded? Does the client have the staff, systems, and track record to manage this award? Is the project timeline realistic? Are the budget amounts adequate to deliver the scope? Are there compliance requirements the client is not currently meeting? A consultant who recommends pursuing an unfeasible opportunity has done their client a disservice — winning a grant you cannot execute is worse than not winning it.'
      },
      {
        title: 'EIS Pricing Principles',
        body: 'EIS pricing reflects the value of strategic consulting, not just writing hours. Pricing factors include: complexity of the opportunity (federal > foundation > local), length and volume of required deliverables, client readiness (more work = higher cost), timeline pressure, and estimated total project hours. Level 3 consultants advise on pricing — they do not set final prices without EIS leadership approval.'
      }
    ],
    exercises: [
      { title: 'Feasibility Assessment', description: 'Evaluate a fictional client profile against a $500,000 federal grant opportunity. Write a formal feasibility assessment memo with a go/no-go recommendation and supporting rationale.' },
      { title: 'Scope of Work Draft', description: 'Draft a scope of work document for a consulting engagement covering grant writing services for one foundation application and one government RFP.' }
    ],
    levels: { level1: 'N/A', level2: 'N/A', level3: 'Advise on pricing, scope, and feasibility — make go/no-go recommendations with documentation' },
    outputs: ['Feasibility assessment memo', 'Scope of work document']
  },
  {
    number: 19,
    title: 'Training & Onboarding New Consultants',
    subtitle: 'Support role — NOT independent trainer authorization',
    levelRequired: 'level-3',
    critical: true,
    warning: '⚠ CRITICAL INSTITUTIONAL RULE: Completion of this module does NOT authorize independent training or certification of other consultants. Training authorization is held exclusively by EIS leadership. Level 3 consultants SUPPORT training — they do not DELIVER it independently.',
    purpose: 'Prepare Level 3 consultants to serve as effective onboarding support resources under EIS leadership direction — without crossing into unauthorized independent training delivery.',
    rationale: 'EIS maintains exclusive authority over the training and certification of consultants. This protects institutional quality, ensures consistency of standards, and preserves the integrity of the certification process. Level 3 consultants who understand this boundary are more valuable, not less.',
    competencies: [
      'Understand the distinction between training support and independent training delivery',
      'Facilitate onboarding activities under EIS leadership direction',
      'Provide structured orientation support to new Level 1 consultants',
      'Contribute to assessment support under EIS leadership supervision',
      'Model professional standards and culture for new consultants',
      'Escalate onboarding concerns to EIS leadership immediately'
    ],
    keyContent: [
      {
        title: 'What Level 3 Consultants CAN Do in Training',
        body: 'Level 3 consultants may: Host orientation conversations with new consultants. Answer questions about processes and protocols. Provide examples of high-quality work. Offer mentorship within the context of live projects. Flag concerns about a new consultant\'s readiness to EIS leadership. Participate in structured training activities designed and led by EIS leadership.'
      },
      {
        title: 'What Level 3 Consultants CANNOT Do',
        body: 'Level 3 consultants may NOT: Certify a new consultant as ready for any level. Modify training materials without EIS approval. Represent EIS\'s training standards to external parties. Grant or deny access to training resources. Create their own training programs or curricula outside of EIS-authorized materials. These activities require explicit EIS leadership authorization — not consulting experience, however extensive.'
      }
    ],
    exercises: [
      { title: 'Onboarding Support Plan', description: 'Create a 2-week onboarding support plan for a new Level 1 consultant joining a live project. Identify your support role activities versus activities that require EIS leadership involvement.' },
      { title: 'Culture Stewardship Statement', description: 'Write a 1-page statement (as if speaking to a new consultant) explaining what it means to be an EIS consultant — the values, standards, and conduct that define the institution.' }
    ],
    levels: { level1: 'N/A', level2: 'N/A', level3: 'Training SUPPORT role only — under EIS leadership direction' },
    outputs: ['2-week onboarding support plan', 'Culture stewardship statement (1 page)']
  }
];

const levelColors = {
  'level-1': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-600' },
  'level-2': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-600' },
  'level-3': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-600' },
};

export default function ModuleDetailView({ moduleNumber, currentLevel, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const module = MODULES_DATA.find(m => m.number === moduleNumber);

  if (!module) return null;

  const canAccess = !module.levelRequired || (currentLevel &&
    ['level-1', 'level-2', 'level-3'].indexOf(currentLevel) >=
    ['level-1', 'level-2', 'level-3'].indexOf(module.levelRequired));

  const levelLabel = module.levelRequired
    ? module.levelRequired === 'level-2' ? 'Level 2+' : 'Level 3'
    : 'All Levels';

  const badgeColor = module.levelRequired === 'level-3' ? 'bg-purple-600' :
    module.levelRequired === 'level-2' ? 'bg-blue-600' : 'bg-green-600';

  return (
    <Card className={`${module.critical ? 'border-2 border-amber-400 shadow-amber-100' : 'border border-slate-200'} shadow-md`}>
      <CardHeader
        className={`${module.critical ? 'bg-amber-50' : 'bg-slate-50'} cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white text-lg shadow-sm
              ${module.levelRequired === 'level-3' ? 'bg-gradient-to-br from-purple-600 to-purple-800' :
                module.levelRequired === 'level-2' ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
                'bg-gradient-to-br from-[#143A50] to-[#1E4F58]'}`}>
              {module.number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${badgeColor}`}>{levelLabel}</span>
                {module.critical && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500 text-white">⚠ Critical</span>}
              </div>
              <CardTitle className="text-lg text-[#143A50] leading-tight">{module.title}</CardTitle>
              <p className="text-sm text-slate-500 mt-0.5">{module.subtitle}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {!expanded && module.competencies && (
          <div className="mt-3 flex flex-wrap gap-1.5 ml-15">
            {module.competencies.slice(0, 3).map((c, i) => (
              <span key={i} className="text-xs bg-white border border-slate-200 text-slate-600 rounded-full px-2 py-0.5">{c.split(' — ')[0].substring(0, 50)}{c.length > 50 ? '…' : ''}</span>
            ))}
            {module.competencies.length > 3 && (
              <span className="text-xs text-slate-400">+{module.competencies.length - 3} more</span>
            )}
          </div>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="pt-6 space-y-8">
          {/* Warning */}
          {module.warning && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-semibold">{module.warning}</p>
            </div>
          )}

          {/* Purpose & Rationale */}
          {(module.purpose || module.rationale) && (
            <div className="grid md:grid-cols-2 gap-4">
              {module.purpose && (
                <div className="p-4 bg-[#143A50]/5 border border-[#143A50]/20 rounded-xl">
                  <h4 className="font-semibold text-sm text-[#143A50] mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Module Purpose
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{module.purpose}</p>
                </div>
              )}
              {module.rationale && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Why This Module Exists
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">{module.rationale}</p>
                </div>
              )}
            </div>
          )}

          {/* Key Learning Content */}
          {module.keyContent && module.keyContent.length > 0 && (
            <div>
              <h4 className="font-semibold text-[#143A50] mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Core Learning Content
              </h4>
              <div className="space-y-4">
                {module.keyContent.map((section, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <h5 className="font-semibold text-slate-900 mb-2 text-sm">{section.title}</h5>
                    <p className="text-sm text-slate-700 leading-relaxed">{section.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Competencies */}
          <div>
            <h4 className="font-semibold text-[#143A50] mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Key Competencies
            </h4>
            <div className="grid sm:grid-cols-2 gap-2">
              {module.competencies.map((comp, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1E4F58] mt-1.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{comp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Level Expectations */}
          {module.levels && (
            <div>
              <h4 className="font-semibold text-[#143A50] mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" /> Level-Based Expectations
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-base flex-shrink-0">🟢</span>
                  <div><span className="font-semibold text-sm text-green-900">Level 1: </span><span className="text-sm text-green-800">{module.levels.level1}</span></div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-base flex-shrink-0">🔵</span>
                  <div><span className="font-semibold text-sm text-blue-900">Level 2: </span><span className="text-sm text-blue-800">{module.levels.level2}</span></div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <span className="text-base flex-shrink-0">🟣</span>
                  <div><span className="font-semibold text-sm text-purple-900">Level 3: </span><span className="text-sm text-purple-800">{module.levels.level3}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Exercises */}
          {module.exercises && module.exercises.length > 0 && (
            <div>
              <h4 className="font-semibold text-[#143A50] mb-3 flex items-center gap-2">
                <Pen className="w-4 h-4" /> Learning Exercises
              </h4>
              <div className="space-y-3">
                {module.exercises.map((exercise, idx) => (
                  <div key={idx} className="p-4 border-l-4 border-[#AC1A5B] bg-[#AC1A5B]/5 rounded-r-lg">
                    <p className="font-semibold text-sm text-[#AC1A5B] mb-1">Exercise {idx + 1}: {exercise.title}</p>
                    <p className="text-sm text-slate-700">{exercise.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Outputs */}
          {module.outputs && module.outputs.length > 0 && (
            <div className="p-4 bg-slate-900 rounded-xl text-white">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-[#E5C089]" />
                <span className="text-[#E5C089]">Required Outputs to Complete This Module</span>
              </h4>
              <ul className="space-y-2">
                {module.outputs.map((output, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-200">
                    <span className="text-[#E5C089] font-bold flex-shrink-0">→</span>
                    {output}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export { MODULES_DATA };