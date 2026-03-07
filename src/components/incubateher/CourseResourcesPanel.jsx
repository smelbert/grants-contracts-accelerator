import React, { useState } from 'react';
import { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Download, ExternalLink, FileText, Video, Globe,
  CheckSquare, BookOpen, ChevronDown, ChevronUp, X
} from 'lucide-react';

// Built-in resources per module
const BUILT_IN_RESOURCES = {
  consultation: [
    {
      title: 'Consultation Preparation Checklist',
      description: 'A printable checklist to complete the night before your session. Covers documents to bring, questions to prepare, and what to confirm about your eligibility.',
      type: 'workbook_link',
      link_page: 'IncubateHerWorkbook',
      icon: CheckSquare,
      color: '#143A50',
    },
    {
      title: 'Consultation Preparation Guide',
      description: 'The complete written guide covering what the consultation is (and is not), eligibility requirements, how to structure your questions, and what to do after the session.',
      type: 'page_link',
      link_page: 'IncubateHerConsultations',
      icon: BookOpen,
      color: '#1E4F58',
    },
    {
      title: 'Sample Questions Template',
      description: 'A downloadable template to pre-write your top 3 consultation questions in priority order, with examples of strong vs. weak question framing.',
      type: 'inline_download',
      content: `CONSULTATION QUESTIONS TEMPLATE
IncubateHer Funding Readiness Program
─────────────────────────────────────

BEFORE YOUR CONSULTATION — Complete this 24 hours in advance.

MY ORGANIZATION:
Name: ___________________________________
Type (LLC / 501c3 / Other): _______________
EIN: _____________________________________
SAM.gov registered? YES / NO

DOCUMENTS I AM BRINGING (1-2 max):
1. ______________________________________
2. ______________________________________

MY TOP 3 QUESTIONS (in priority order):

Question #1 (Most Important):
________________________________________
________________________________________

Question #2:
________________________________________
________________________________________

Question #3:
________________________________________
________________________________________

CONTEXT I NEED TO GIVE:
(In 2–3 sentences, what does the consultant need to know?)
________________________________________
________________________________________

AFTER THE SESSION — Fill in within 24 hours:

Action Item #1: _________________________
Deadline: _______________________________

Action Item #2: _________________________
Deadline: _______________________________

Action Item #3: _________________________
Deadline: _______________________________
`,
      filename: 'Consultation_Questions_Template.txt',
      icon: FileText,
      color: '#AC1A5B',
    },
  ],
  wrap: [
    {
      title: 'Post-Program 30-Day Action Plan Template',
      description: 'A structured 30-day roadmap broken into weekly phases: consolidate, finish documents, research opportunities, and submit your first application.',
      type: 'inline_download',
      content: `30-DAY POST-PROGRAM ACTION PLAN
IncubateHer Alumni Resources
─────────────────────────────────────────────

Days 1–7: CONSOLIDATE & ORGANIZE
□ Gather all program materials into one folder
□ Review post-assessment results
□ Write down the 3 most important takeaways from your consultation
□ List any unfinished program documents

Notes: ___________________________________

Days 8–14: FINISH WHAT YOU STARTED
□ Complete any draft documents from the program
□ Finalize organizational overview (1–2 pages, current data)
□ Update project description to submission-ready state
□ Identify your single most critical compliance gap:
  Gap: ____________________________________
  Plan to close it: ________________________

Notes: ___________________________________

Days 15–21: RESEARCH & IDENTIFY
□ Search Grants.gov for 2–3 aligned opportunities
□ Check Foundation Directory / Candid (library access)
□ For each opportunity: read full RFP, check eligibility, note deadline
□ Make a go/no-go decision for each:
  Opp 1: _______________ GO / NO-GO
  Opp 2: _______________ GO / NO-GO
  Opp 3: _______________ GO / NO-GO

Days 22–30: PURSUE & SUBMIT
□ Start your highest-priority application
□ Use EIS templates as structural frameworks
□ Set internal deadline: 5 days before actual deadline
□ Have one outside reader review before submitting
□ SUBMIT

COMPLIANCE CALENDAR — Set alerts now:
SAM.gov expiration date: ________________
State registration renewal: ______________
990 filing deadline: _____________________
Other: ___________________________________
`,
      filename: '30_Day_Post_Program_Action_Plan.txt',
      icon: FileText,
      color: '#143A50',
    },
    {
      title: 'Key Funding Research Sites',
      description: 'Quick reference list of the most important free and low-cost databases for finding grants, contracts, and public funding opportunities.',
      type: 'reference_list',
      links: [
        { name: 'Grants.gov', desc: 'All federal grant opportunities', url: 'https://www.grants.gov' },
        { name: 'SAM.gov', desc: 'Federal registration & contracts', url: 'https://sam.gov' },
        { name: 'Foundation Directory (Candid)', desc: 'Foundation grants — free via many libraries', url: 'https://candid.org' },
        { name: 'SBA.gov Funding Programs', desc: 'Small business loans, bonds, programs', url: 'https://www.sba.gov/funding-programs' },
        { name: 'MBDA.gov', desc: 'Minority Business Development Agency', url: 'https://www.mbda.gov' },
        { name: 'GrantSpace (Candid Learning)', desc: 'Free proposal writing guides & webinars', url: 'https://grantspace.org' },
        { name: 'EIS ProPublica 990 Lookup', desc: 'Search any foundation\'s 990 financials', page: 'FunderResearch' },
      ],
      icon: Globe,
      color: '#1E4F58',
    },
    {
      title: 'Document Templates Library',
      description: 'Access all EIS grant writing and organizational document templates — org overview, needs statement, project description, budget narrative, and more.',
      type: 'page_link',
      link_page: 'IncubateHerDocuments',
      icon: FileText,
      color: '#AC1A5B',
    },
  ],
  monday: [
    {
      title: 'Funding Readiness Workbook — Session 1 Pages',
      description: 'Access the relevant workbook pages for Night 1: legal structure, EIN, SAM.gov readiness, and funding lane clarity exercises.',
      type: 'page_link',
      link_page: 'IncubateHerWorkbook',
      icon: BookOpen,
      color: '#143A50',
    },
    {
      title: 'Organizational Compliance Quick-Reference',
      description: 'Key compliance items every organization pursuing funding must have in order — legal registration, EIN, SAM.gov, 990 status, state registration.',
      type: 'inline_download',
      content: `ORGANIZATIONAL COMPLIANCE QUICK-REFERENCE
IncubateHer Funding Readiness Program — Session 1
─────────────────────────────────────────────────

LEGAL STRUCTURE
□ Confirm your legal structure: LLC / 501(c)(3) / Sole Proprietor / Other: ______
□ Registered with your state? YES / NO  Date: ________
□ Good standing (no delinquent filings)? YES / NO

FEDERAL IDENTIFIERS
□ Have your EIN (Employer Identification Number): YES / NO
  EIN: _____________________________________
□ DUNS/UEI number (for federal funding): YES / NO
  UEI: _____________________________________

SAM.gov REGISTRATION (required for ALL federal funding)
□ Registered in SAM.gov: YES / NO
□ Registration expiration date: _______________
□ Set 30-day renewal reminder: YES / NO

IRS / TAX COMPLIANCE (nonprofits)
□ Tax-exempt status active (check IRS Tax Exempt Org Search): YES / NO
□ Most recent 990 filed: YES / NO   Year: _______
□ Filed on time: YES / NO

STATE COMPLIANCE
□ State charitable solicitation registration: YES / NO
□ Annual renewal date: ___________________
□ Set reminder 60 days before: YES / NO

WHAT I STILL NEED TO DO:
1. _______________________________________
2. _______________________________________
3. _______________________________________
`,
      filename: 'Compliance_Quick_Reference.txt',
      icon: CheckSquare,
      color: '#1E4F58',
    },
  ],
  thursday: [
    {
      title: 'Funding Readiness Workbook — Session 2 Pages',
      description: 'Access workbook pages for Night 2: financial systems, budget development, funding mechanics, and indirect cost concepts.',
      type: 'page_link',
      link_page: 'IncubateHerWorkbook',
      icon: BookOpen,
      color: '#143A50',
    },
    {
      title: 'Budget Readiness Self-Assessment',
      description: 'A printable checklist covering the financial documents and systems funders expect to see — audit readiness, board-approved budget, financial statements.',
      type: 'inline_download',
      content: `BUDGET READINESS SELF-ASSESSMENT
IncubateHer Funding Readiness Program — Session 2
─────────────────────────────────────────────────────

FINANCIAL DOCUMENTS
□ Current fiscal year budget (board-approved): YES / NO
□ Most recent audited financial statements: YES / NO  Year: ____
□ IRS Form 990 (most recent): YES / NO  Year: ____
□ Profit & loss statement (current YTD): YES / NO
□ Balance sheet (current): YES / NO

FINANCIAL SYSTEMS
□ Using accounting software (QuickBooks, Wave, FreshBooks): YES / NO  Which: _______
□ Separate bank account for the organization: YES / NO
□ Track income and expenses by program: YES / NO
□ Can produce financial statements within 30 days of request: YES / NO

BUDGET KNOWLEDGE
□ Know your current annual operating budget: YES / NO  Amount: $________
□ Know your indirect cost rate: YES / NO  Rate: ______%
□ Can produce a project-specific budget for a grant: YES / NO

FINANCIAL GOVERNANCE
□ Board reviews financial statements at least quarterly: YES / NO
□ Board approves annual budget: YES / NO
□ Have financial policies (expense policy, check-signing policy): YES / NO

AREAS TO STRENGTHEN:
_________________________________________________
_________________________________________________
`,
      filename: 'Budget_Readiness_Self_Assessment.txt',
      icon: FileText,
      color: '#AC1A5B',
    },
  ],
  saturday: [
    {
      title: 'Funding Readiness Workbook — Session 3 Pages',
      description: 'Access workbook pages for Day 3: application strategy, needs statement, outcomes framework, and integration planning.',
      type: 'page_link',
      link_page: 'IncubateHerWorkbook',
      icon: BookOpen,
      color: '#143A50',
    },
    {
      title: 'Document Templates Library',
      description: 'Access all EIS grant writing templates — organizational overview, needs statement, project description, budget narrative, logic model, and more.',
      type: 'page_link',
      link_page: 'IncubateHerDocuments',
      icon: FileText,
      color: '#1E4F58',
    },
    {
      title: 'Application Review Checklist',
      description: 'A pre-submission quality check — 20 items to verify before clicking submit. Covers content, formatting, attachments, and eligibility confirmation.',
      type: 'inline_download',
      content: `PRE-SUBMISSION APPLICATION REVIEW CHECKLIST
IncubateHer Funding Readiness Program — Session 3
─────────────────────────────────────────────────────

ELIGIBILITY (check BEFORE writing)
□ Organization type matches requirements
□ Geographic eligibility confirmed
□ Minimum operating history requirement met
□ No conflict with existing grant restrictions
□ SAM.gov registration active (if federal)

CONTENT QUALITY
□ Every section question answered — in the order asked
□ Needs statement is about community need, not organizational need
□ Uses at least one cited, current data point in needs section
□ Project description clearly states: who, what, how, and measurable outcomes
□ Budget matches narrative (same line items, same amounts)
□ Indirect costs calculated correctly and within funder limits
□ All program staff are named (or roles described if not yet hired)

FORMATTING & SUBMISSION
□ Page limits respected (count pages, not sections)
□ Font size meets requirements (usually 12pt minimum)
□ All required attachments included (IRS determination letter, 990, budget, audit)
□ Signatures obtained if required
□ Submitted with at least 5 business days to spare

FINAL CHECK
□ Had at least one person outside the organization read it
□ All hyperlinks/URLs work
□ Contact information is current and correct

SUBMISSION DATE: ___________________
INTERNAL DEADLINE: _________________ (5 days before)
OFFICIAL DEADLINE: _________________
`,
      filename: 'Pre_Submission_Application_Checklist.txt',
      icon: CheckSquare,
      color: '#143A50',
    },
  ],
};

// Downloadable text as a blob
function downloadTextFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// EIS-branded resource card
function ResourceCard({ resource, idx }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const Icon = resource.icon || FileText;

  if (resource.type === 'reference_list') {
    return (
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="flex items-start gap-4 p-5 border-b border-slate-100" style={{ borderLeftWidth: 4, borderLeftColor: resource.color }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: resource.color + '15' }}>
            <Icon className="w-5 h-5" style={{ color: resource.color }} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 text-sm mb-1">{resource.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{resource.description}</p>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {resource.links.map((link, li) => (
            link.page ? (
              <Link key={li} to={createPageUrl(link.page)}>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg hover:bg-[#143A50]/5 transition-colors cursor-pointer border border-slate-200">
                  <Globe className="w-3.5 h-3.5 text-[#143A50] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{link.name}</p>
                    <p className="text-xs text-slate-500">{link.desc}</p>
                  </div>
                </div>
              </Link>
            ) : (
              <a key={li} href={link.url} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg hover:bg-[#143A50]/5 transition-colors cursor-pointer border border-slate-200">
                  <ExternalLink className="w-3.5 h-3.5 text-[#143A50] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{link.name}</p>
                    <p className="text-xs text-slate-500">{link.desc}</p>
                  </div>
                </div>
              </a>
            )
          ))}
        </div>
      </div>
    );
  }

  if (resource.type === 'page_link') {
    return (
      <Link to={createPageUrl(resource.link_page)}>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer p-5 flex items-start gap-4 group" style={{ borderLeftWidth: 4, borderLeftColor: resource.color }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: resource.color + '15' }}>
            <Icon className="w-5 h-5" style={{ color: resource.color }} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 text-sm mb-1 group-hover:text-[#143A50] transition-colors">{resource.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">{resource.description}</p>
            <span className="text-xs font-semibold text-[#143A50]">Open →</span>
          </div>
        </div>
      </Link>
    );
  }

  if (resource.type === 'workbook_link') {
    return (
      <Link to={createPageUrl(resource.link_page)}>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer p-5 flex items-start gap-4 group" style={{ borderLeftWidth: 4, borderLeftColor: resource.color }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: resource.color + '15' }}>
            <CheckSquare className="w-5 h-5" style={{ color: resource.color }} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 text-sm mb-1 group-hover:text-[#143A50] transition-colors">{resource.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">{resource.description}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ backgroundColor: resource.color }}>
              <CheckSquare className="w-3 h-3" /> Open Workbook →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (resource.type === 'inline_download') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden" style={{ borderLeftWidth: 4, borderLeftColor: resource.color }}>
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: resource.color + '15' }}>
            <Icon className="w-5 h-5" style={{ color: resource.color }} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 text-sm mb-1">{resource.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">{resource.description}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="text-white text-xs gap-1.5"
                style={{ backgroundColor: resource.color }}
                onClick={() => downloadTextFile(resource.content, resource.filename)}
              >
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1.5"
                onClick={() => setPreviewOpen(!previewOpen)}
              >
                {previewOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {previewOpen ? 'Hide Preview' : 'Preview'}
              </Button>
            </div>
          </div>
        </div>
        {previewOpen && (
          <div className="border-t border-slate-100 bg-slate-50 p-5">
            {/* EIS-branded header */}
            <div className="mb-4 pb-3 border-b-2 flex items-center justify-between" style={{ borderBottomColor: BRAND_COLORS.eisGold }}>
              <div>
                <p className="text-xs font-bold text-[#143A50] uppercase tracking-wider">Elbert Innovative Solutions</p>
                <p className="text-xs text-slate-500">IncubateHer Funding Readiness Program</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setPreviewOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">{resource.content}</pre>
            {/* EIS-branded footer */}
            <div className="mt-4 pt-3 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-400">© Elbert Innovative Solutions · elbertinnovativesolutions.org · Proprietary content</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// Admin-entered handout card (existing behavior, enhanced)
function HandoutCard({ handout, idx }) {
  const isHtml = handout.source_type === 'html' || (handout.html_content && !handout.file_url);
  const isVideo = handout.file_url && (
    handout.file_url.match(/\.(mp4|webm|ogg)(\?|$)/i) ||
    handout.file_url.includes('youtube.com') || handout.file_url.includes('youtu.be') ||
    handout.file_url.includes('vimeo.com') ||
    (handout.file_url.includes('drive.google.com') && (handout.file_type || '').includes('video'))
  );
  const isPdfOrDrive = !isVideo && handout.file_url && (
    handout.file_url.includes('drive.google.com') || handout.file_url.match(/\.pdf(\?|$)/i)
  );
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden" style={{ borderLeftWidth: 4, borderLeftColor: BRAND_COLORS.eisNavy }}>
      {/* EIS branded header bar */}
      <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: BRAND_COLORS.eisNavy }}>
        <p className="text-xs font-semibold text-white tracking-wide">EIS · IncubateHer Program Resource</p>
        {(isHtml || isPdfOrDrive) && (
          <button className="text-xs text-white/70 hover:text-white flex items-center gap-1" onClick={() => setExpanded(!expanded)}>
            {expanded ? <><ChevronUp className="w-3 h-3" /> Collapse</> : <><ChevronDown className="w-3 h-3" /> Preview</>}
          </button>
        )}
      </div>

      <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-slate-900 text-sm">{handout.title}</h4>
          {handout.description && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{handout.description}</p>}
        </div>
        {handout.file_url && (
          <div className="flex gap-2 shrink-0">
            <a href={handout.file_url} download target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="text-white gap-1.5 text-xs" style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            </a>
            <a href={handout.file_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <ExternalLink className="w-3.5 h-3.5" /> Open
              </Button>
            </a>
          </div>
        )}
      </div>

      {/* HTML preview */}
      {isHtml && expanded && (
        <div className="p-4 bg-white">
          <div
            className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
            style={{ fontSize: '0.82rem' }}
            dangerouslySetInnerHTML={{ __html: handout.html_content }}
          />
        </div>
      )}

      {/* PDF/Drive preview */}
      {isPdfOrDrive && expanded && (
        <div className="bg-white">
          <iframe
            src={handout.file_url.includes('drive.google.com')
              ? handout.file_url.replace('/view', '/preview').replace(/\/edit.*$/, '/preview')
              : handout.file_url}
            className="w-full"
            style={{ height: '500px', border: 'none' }}
            title={handout.title}
          />
        </div>
      )}

      {/* Video */}
      {isVideo && handout.file_url.match(/\.(mp4|webm|ogg)(\?|$)/i) && (
        <video controls className="w-full bg-black" style={{ maxHeight: '360px' }}>
          <source src={handout.file_url} />
        </video>
      )}

      {/* EIS branded footer */}
      <div className="px-4 py-2 text-center" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #e2e8f0' }}>
        <p className="text-xs text-slate-400">© Elbert Innovative Solutions · Proprietary content protected by intellectual property law</p>
      </div>
    </div>
  );
}

export default function CourseResourcesPanel({ course }) {
  const moduleKey = course?.agenda_section || '';
  const builtInResources = BUILT_IN_RESOURCES[moduleKey] || [];
  const adminHandouts = course?.handouts || [];

  if (builtInResources.length === 0 && adminHandouts.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="text-sm">Resources for this module are coming soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Built-in resources first */}
      {builtInResources.map((resource, idx) => (
        <ResourceCard key={`builtin-${idx}`} resource={resource} idx={idx} />
      ))}

      {/* Admin-uploaded handouts */}
      {adminHandouts.length > 0 && (
        <>
          {builtInResources.length > 0 && (
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Additional Materials</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          )}
          {adminHandouts.map((handout, idx) => (
            <HandoutCard key={`handout-${idx}`} handout={handout} idx={idx} />
          ))}
        </>
      )}
    </div>
  );
}