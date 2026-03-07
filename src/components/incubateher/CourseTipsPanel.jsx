import React from 'react';
import { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import { 
  Lightbulb, AlertTriangle, Star, CheckCircle2, 
  Zap, ThumbsUp, BookOpen, Target, Clock, Users
} from 'lucide-react';

// Per-module robust tip sets keyed by agenda_section or title keywords
const BUILT_IN_TIPS = {
  consultation: [
    {
      category: 'pro_tip',
      title: 'Write your questions BEFORE the session — not during',
      content: 'If you wait until you\'re in the room to formulate your questions, you will ask weak ones. The night before your consultation, write down your top 3 questions in priority order. Read them aloud. Refine them. A crisp, specific question gets a crisp, specific answer.',
    },
    {
      category: 'best_practice',
      title: 'Lead with your most important question first',
      content: 'Consultants sometimes run long on early points. If you save your most important question for last, time may run out. State it first: "My number one question today is…" This ensures you always leave with the answer that matters most.',
    },
    {
      category: 'best_practice',
      title: 'Bring specific documents — not just ideas',
      content: 'A consultant can give you 5x more value when reviewing an actual document than when reviewing a concept in your head. Bring 1–2 pages maximum — a rough draft is perfectly fine. The more specific, the better the feedback.',
    },
    {
      category: 'common_mistake',
      title: 'Don\'t spend the session describing your organization',
      content: 'You have limited time. Don\'t spend the first 10 minutes explaining your background — the consultant reviewed your enrollment profile. Get directly to your questions. If context is needed, give it in one sentence: "I run a 3-year-old 501(c)(3) focused on workforce development, and I need help with…"',
    },
    {
      category: 'pro_tip',
      title: 'Take notes — even if you think you\'ll remember',
      content: 'Consultations generate dense, personalized advice. Trying to remember everything is a losing strategy. Bring a notebook or have a notes app ready. Aim to write down 3 concrete action items you will act on within 30 days.',
    },
    {
      category: 'warning',
      title: 'The consultation is not a grant writing session',
      content: 'Asking "can you help me write my grant?" is not an appropriate use of this session. This is a strategic advisory session. Use it to get clarity on direction, gaps, and priorities — then use program templates to do the writing yourself.',
    },
    {
      category: 'best_practice',
      title: 'Be honest about your current state — not aspirational',
      content: 'Say what you currently have, not what you plan to have. "I\'m building a strategic plan" is less useful than "I don\'t have a strategic plan yet." Honest gaps lead to honest guidance. Aspirational descriptions lead to advice that doesn\'t fit your reality.',
    },
    {
      category: 'pro_tip',
      title: 'End the session by summarizing your 3 action items out loud',
      content: 'In the last 2 minutes, say: "Let me confirm — the three things I\'m going to do next are…" This locks in your commitments and gives the consultant a chance to correct any misunderstandings before you leave.',
    },
  ],
  wrap: [
    {
      category: 'best_practice',
      title: 'File your program materials within 48 hours of completion',
      content: 'Within 48 hours of the program ending, organize everything: workbook, templates, notes, assessment results. Create one folder — digital or physical — labeled "IncubateHer Funding Readiness." Six months from now, you will thank yourself.',
    },
    {
      category: 'pro_tip',
      title: 'Submit something within 90 days — even if it\'s not perfect',
      content: 'The number one post-program failure is waiting until you\'re "fully ready." Funders evaluate applications from organizations at all stages. An honest, well-written application from a newer organization beats a polished application with inflated claims. Submit and improve.',
    },
    {
      category: 'best_practice',
      title: 'Your first application should match your current capacity',
      content: 'Don\'t apply for $500K when you have a $50K budget. Funders do the math. Start with appropriately-scaled opportunities. A $5,000–$25,000 award builds your track record and positions you for larger awards in subsequent cycles.',
    },
    {
      category: 'common_mistake',
      title: 'Don\'t ghost funders who decline you',
      content: 'A declined application is not a closed door. Send a brief, professional email thanking them for their review and asking if feedback is available. Many funders provide written feedback on request. This relationship, maintained over 2–3 cycles, often leads to an eventual award.',
    },
    {
      category: 'pro_tip',
      title: 'Set compliance calendar alerts immediately',
      content: 'SAM.gov registrations expire annually. State charitable registrations have annual renewal deadlines. 990s have filing deadlines. One missed compliance deadline can disqualify you from an otherwise strong application. Set calendar alerts 30 days in advance for every compliance item.',
    },
    {
      category: 'warning',
      title: 'Update your organizational overview before your first application',
      content: 'If your org overview was last updated more than 6 months ago, it\'s already outdated. Update your people-served numbers, programs, and any leadership changes before attaching it to any application. Stale data sends a bad signal.',
    },
    {
      category: 'best_practice',
      title: 'Build a "funding portfolio" mindset — not a "one big grant" mindset',
      content: 'The most sustainable organizations pursue multiple, diverse funding sources simultaneously. One large grant that ends can devastate operations. Aim to build a portfolio: 2–3 small grants, 1 contract, 1 individual donor program. Diversification is stability.',
    },
  ],
  monday: [
    {
      category: 'best_practice',
      title: 'Know the difference between a grant and a contract before applying',
      content: 'Grants are philanthropic gifts — funders give money to support your mission with limited deliverable accountability. Contracts are procurement agreements — funders pay you to perform specific, measurable services. Your documentation requirements, reporting obligations, and cash flow implications are completely different. Applying with the wrong expectation is one of the most common early mistakes.',
    },
    {
      category: 'pro_tip',
      title: 'Your legal structure directly affects your eligibility',
      content: 'Many federal and foundation grants require 501(c)(3) status. Many government contracts are open to for-profit and nonprofit businesses. If you\'re an LLC pursuing foundation grants, you may face eligibility barriers. Know your structure and research eligibility before spending time on an application.',
    },
    {
      category: 'common_mistake',
      title: 'SAM.gov is not optional for government funding — register now',
      content: 'SAM.gov (System for Award Management) is required for all federal grant and contract funding. Registrations can take 7–14 business days to process. If you haven\'t registered, do it now — before you find an opportunity with a tight deadline.',
    },
    {
      category: 'best_practice',
      title: 'Your EIN is your funding identity number — know it by heart',
      content: 'Your Employer Identification Number (EIN) appears on virtually every funding application. It\'s also used to verify your IRS status, check your 990 history on ProPublica, and confirm your SAM.gov registration. Know it. Protect it. Include it on your organizational profile.',
    },
    {
      category: 'warning',
      title: 'Founding year affects what you can realistically apply for',
      content: 'Many funders have minimum organizational age requirements (1 year, 2 years, sometimes 3+). A 6-month-old organization applying for a grant requiring 2 years of operation will be disqualified automatically. Know your founding date and always check eligibility requirements before starting an application.',
    },
  ],
  thursday: [
    {
      category: 'best_practice',
      title: 'Funders read your budget as carefully as your narrative',
      content: 'A compelling narrative attached to an unrealistic budget is a red flag. Funders have approved dozens of budgets — they can spot inflated indirect costs, missing line items, and math errors immediately. Your budget should tell the same story as your narrative, with numbers.',
    },
    {
      category: 'pro_tip',
      title: 'Program income and restricted funds are not the same as operating revenue',
      content: 'Many organizations confuse restricted grant income with unrestricted operating revenue. Restricted funds can only be spent on what they were awarded for. Report your financials accurately — funders and auditors can tell the difference.',
    },
    {
      category: 'common_mistake',
      title: 'Indirect costs are legitimate — but must be documented',
      content: 'Indirect costs (overhead, administration, facilities) are real costs of running programs. Many organizations under-charge them to appear lean, then run out of operating funds mid-grant. Know your indirect cost rate. Federal grants have specific rules for how indirect costs must be calculated and approved.',
    },
    {
      category: 'best_practice',
      title: 'A board-approved budget signals organizational maturity',
      content: 'When a funder asks for your current fiscal year budget, they expect a document that has been reviewed and approved by your board of directors. An operating budget that shows board oversight demonstrates financial governance — a core factor in fundability.',
    },
    {
      category: 'warning',
      title: 'Late 990 filings can disqualify you from grants automatically',
      content: 'Funders routinely check IRS records. A 990 filed late — or worse, not filed — raises immediate questions about organizational compliance. The IRS can revoke your tax-exempt status after 3 consecutive years of non-filing. Stay current with all filing requirements.',
    },
  ],
  saturday: [
    {
      category: 'best_practice',
      title: 'Read the full RFP before writing a single word',
      content: 'The most common error applicants make is starting to write without reading the entire RFP. The eligibility section, formatting requirements, page limits, and required attachments — all matter. Read it once to understand. Read it again to plan. Then write.',
    },
    {
      category: 'pro_tip',
      title: 'Answer every question the funder asks — in the order they ask it',
      content: 'Reviewers follow scoring rubrics. If your answer to question 3 is buried in your answer to question 1, it may not be scored. Structure your narrative to mirror the RFP structure. Use their exact section headings when permitted.',
    },
    {
      category: 'common_mistake',
      title: 'A needs statement about your organization is not a needs statement',
      content: 'The needs statement answers: "Why does this problem exist and why does it matter?" It is about the community or population you serve — not about your organization\'s funding needs. The funder is funding a solution to a problem, not filling a gap in your budget.',
    },
    {
      category: 'best_practice',
      title: 'Use data in your needs section — even one strong statistic matters',
      content: 'Unsupported claims ("many people in our community struggle with…") are weaker than cited statistics ("according to the 2023 Census, 34% of households in Franklin County are food insecure"). Find local, state, or national data that validates your community need.',
    },
    {
      category: 'warning',
      title: 'Submit at least 5 business days before the deadline',
      content: 'Online grant portals crash near deadlines. Uploaded documents fail. Emails bounce. A submission problem on deadline day is your problem — not the funder\'s. Set your internal deadline for 5 business days before the official deadline. No exceptions.',
    },
    {
      category: 'pro_tip',
      title: 'Have someone outside your organization read your application before submitting',
      content: 'You know your organization so well that you will skip context readers need. Ask someone unfamiliar with your work to read your application and identify: (1) what is confusing, and (2) what questions are left unanswered. Then answer those.',
    },
  ],
};

const CATEGORY_CONFIG = {
  pro_tip:        { icon: Zap,           label: 'Pro Tip',        bg: 'bg-[#143A50]/5',  border: 'border-[#143A50]/25', iconColor: '#143A50',    labelColor: '#143A50' },
  best_practice:  { icon: ThumbsUp,      label: 'Best Practice',  bg: 'bg-emerald-50',   border: 'border-emerald-200',  iconColor: '#15803d',    labelColor: '#15803d' },
  common_mistake: { icon: AlertTriangle, label: 'Common Mistake', bg: 'bg-amber-50',     border: 'border-amber-300',    iconColor: '#b45309',    labelColor: '#b45309' },
  warning:        { icon: AlertTriangle, label: 'Watch Out',      bg: 'bg-red-50',       border: 'border-red-300',      iconColor: '#dc2626',    labelColor: '#dc2626' },
};

export default function CourseTipsPanel({ course }) {
  // Merge built-in tips (per agenda_section) with any admin-entered tips
  const moduleKey = course?.agenda_section || '';
  const builtInTips = BUILT_IN_TIPS[moduleKey] || [];
  const adminTips = course?.tips || [];
  const allTips = [...builtInTips, ...adminTips];

  if (allTips.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <Lightbulb className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="text-sm">Tips for this module are coming soon.</p>
      </div>
    );
  }

  // Group by category
  const grouped = {
    pro_tip: allTips.filter(t => t.category === 'pro_tip'),
    best_practice: allTips.filter(t => t.category === 'best_practice'),
    common_mistake: allTips.filter(t => t.category === 'common_mistake'),
    warning: allTips.filter(t => t.category === 'warning'),
    other: allTips.filter(t => !['pro_tip','best_practice','common_mistake','warning'].includes(t.category)),
  };

  const renderTip = (tip, idx) => {
    const cfg = CATEGORY_CONFIG[tip.category] || {
      icon: Star, label: 'Tip', bg: 'bg-slate-50', border: 'border-slate-200', iconColor: BRAND_COLORS.eisGold, labelColor: '#64748b'
    };
    const Icon = cfg.icon;
    return (
      <div key={idx} className={`rounded-xl border-l-4 p-4 ${cfg.bg}`} style={{ borderLeftColor: cfg.iconColor }}>
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: cfg.iconColor }} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.iconColor + '18', color: cfg.iconColor }}>
                {cfg.label}
              </span>
            </div>
            <h4 className="font-semibold text-slate-900 text-sm mb-1.5 leading-snug">{tip.title}</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{tip.content}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {grouped.pro_tip.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-[#143A50] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Pro Tips ({grouped.pro_tip.length})
          </h3>
          <div className="space-y-3">{grouped.pro_tip.map(renderTip)}</div>
        </section>
      )}
      {grouped.best_practice.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4" /> Best Practices ({grouped.best_practice.length})
          </h3>
          <div className="space-y-3">{grouped.best_practice.map(renderTip)}</div>
        </section>
      )}
      {grouped.common_mistake.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Common Mistakes to Avoid ({grouped.common_mistake.length})
          </h3>
          <div className="space-y-3">{grouped.common_mistake.map(renderTip)}</div>
        </section>
      )}
      {grouped.warning.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Watch Out ({grouped.warning.length})
          </h3>
          <div className="space-y-3">{grouped.warning.map(renderTip)}</div>
        </section>
      )}
      {grouped.other.length > 0 && (
        <section>
          <div className="space-y-3">{grouped.other.map(renderTip)}</div>
        </section>
      )}
    </div>
  );
}