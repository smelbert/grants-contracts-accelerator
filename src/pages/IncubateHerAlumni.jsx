import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import {
  Star, TrendingUp, BookOpen, Users, Target, CheckCircle2,
  ArrowRight, Lightbulb, Briefcase, Globe, Award,
  ChevronDown, ChevronUp, Mail, Heart, Zap, Shield
} from 'lucide-react';

const SECTIONS = [
  {
    id: 'congratulations',
    icon: <Award className="w-5 h-5 text-[#E5C089]" />,
    title: 'Completing the Program: What You've Accomplished',
    color: 'border-l-[#E5C089]',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          Finishing IncubateHer is not a small thing. You invested time, energy, and intellectual work in developing skills that most business owners never get access to in a structured, guided environment. That effort matters — and so does what comes next.
        </p>
        <p className="text-slate-700 leading-relaxed">
          Completing the program means you have:
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            'Built foundational literacy in how grants and contracts actually work',
            'Learned how funders and procurement officers evaluate applicants',
            'Developed or strengthened your organizational funding documents',
            'Assessed your starting readiness and tracked your growth through the post-assessment',
            'Received personalized feedback on your readiness and strategy direction',
            'Connected with peers navigating the same landscape',
            'Established a baseline of knowledge that most of your competitors in the funding space do not have',
            'Demonstrated the discipline and commitment to complete a structured program'
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-[#E5C089]/20 border border-[#E5C089]/40 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-[#143A50] mt-0.5 flex-shrink-0" />
              <span className="text-sm text-slate-700">{item}</span>
            </div>
          ))}
        </div>
        <div className="p-4 bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white rounded-xl">
          <p className="font-semibold text-lg mb-1">The program gave you a foundation. What happens next depends on you.</p>
          <p className="text-white/80 text-sm leading-relaxed">
            Knowledge without application fades. The resources in this guide are designed to help you take what you learned and build something real with it — applications submitted, contracts pursued, funding received.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'immediate-actions',
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    title: 'Your First 30 Days: Immediate Priority Actions',
    color: 'border-l-amber-500',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          The most common mistake program graduates make is waiting too long to apply what they learned. Knowledge decays without use. Here is a concrete sequence for your first 30 days post-program.
        </p>
        <div className="space-y-3">
          {[
            {
              days: 'Days 1–7',
              color: 'bg-green-50 border-green-300',
              title: 'Consolidate & Organize',
              actions: [
                'Gather everything you produced during the program: workbook pages, document drafts, assessment results, consultation notes',
                'Create a single folder (physical or digital) with all of it — this is your funding readiness file',
                'Review your post-assessment results and identify the areas that still need the most development',
                'Write down the 3 most important things you learned from your one-on-one consultation (if completed)',
                'Identify any unfinished documents — project descriptions, budget outlines, or organizational overviews that need to be completed'
              ]
            },
            {
              days: 'Days 8–14',
              color: 'bg-blue-50 border-blue-300',
              title: 'Finish What You Started',
              actions: [
                'Complete any program documents that are in draft form — do not let unfinished work sit',
                'Finalize your organizational overview if it is not yet complete',
                'Clean up your project description so it is submission-ready',
                'If you have a budget outline, convert it to a proper budget narrative format',
                'Identify the single most important compliance or readiness gap you have and make a plan to close it'
              ]
            },
            {
              days: 'Days 15–21',
              color: 'bg-purple-50 border-purple-300',
              title: 'Research & Identify',
              actions: [
                'Conduct a targeted search for funding opportunities aligned to your organization and goals (use Grants.gov, Foundation Directory, your state\'s economic development office)',
                'Identify 2–3 specific opportunities you could realistically pursue in the next 90 days',
                'For each opportunity: read the full RFP or guidelines, check eligibility requirements, note the deadline',
                'Make an honest go/no-go assessment for each: Are you ready? Do you have the documents required? Can you meet the deadline?',
                'If you identify a strong opportunity with a near deadline, prioritize it — the best time to apply is before you feel fully ready'
              ]
            },
            {
              days: 'Days 22–30',
              color: 'bg-rose-50 border-rose-300',
              title: 'Pursue & Submit',
              actions: [
                'Start your application for the highest-priority opportunity you identified',
                'Use the EIS templates (accessible through your program portal) as structural frameworks',
                'Apply the needs statement, outcomes writing, and voice standards you practiced in the program',
                'If you are pursuing a contract or RFP, use the proposal architecture framework from your training',
                'Set an internal deadline 5 business days before the actual deadline to allow for review and revision',
                'Submit — even if it\'s not perfect. A submitted imperfect application is infinitely more valuable than a perfect one never sent'
              ]
            }
          ].map((phase, i) => (
            <div key={i} className={`p-4 border-2 rounded-xl ${phase.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-slate-800 text-white text-xs">{phase.days}</Badge>
                <span className="font-bold text-slate-900">{phase.title}</span>
              </div>
              <ul className="space-y-2">
                {phase.actions.map((action, ai) => (
                  <li key={ai} className="flex items-start gap-2 text-sm text-slate-700">
                    <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0 text-slate-500" />
                    {action}
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
    id: 'funding-resources',
    icon: <Globe className="w-5 h-5 text-[#1E4F58]" />,
    title: 'Funding Research Resources',
    color: 'border-l-[#1E4F58]',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          Now that you understand how funding works, you need tools to find opportunities. These are the most reliable, high-quality sources for grants, contracts, and related funding across different sectors.
        </p>

        <div className="space-y-4">
          {[
            {
              category: 'Federal Grants',
              color: 'border-blue-300 bg-blue-50',
              titleColor: 'text-blue-900',
              resources: [
                { name: 'Grants.gov', url: 'https://www.grants.gov', desc: 'The official federal grants portal. All federal grant opportunities required to be listed here. Create a free account and set up email alerts for categories relevant to your work.' },
                { name: 'SAM.gov', url: 'https://sam.gov', desc: 'Required for federal grants and contracts. Register your organization here. Also search for federal contracting opportunities under the "Contract Opportunities" section (formerly FedBizOpps).' },
                { name: 'SBIR/STTR Program', url: 'https://www.sbir.gov', desc: 'Small Business Innovation Research and Small Business Technology Transfer programs. If your work has an innovation or research component, this is worth exploring.' }
              ]
            },
            {
              category: 'State & Local Funding',
              color: 'border-green-300 bg-green-50',
              titleColor: 'text-green-900',
              resources: [
                { name: 'Your State\'s Economic Development Office', url: null, desc: 'Every state has an economic development or small business development office that administers state-level grants and contracts. Search "[your state] small business grants" or "[your state] SBDC."' },
                { name: 'Ohio Small Business Development Center (SBDC)', url: 'https://www.ohiosbdc.org', desc: 'For Ohio-based participants. Free advising, access to state funding opportunities, and referral to appropriate resources.' },
                { name: 'City and County Procurement Portals', url: null, desc: 'Most mid-to-large cities have a vendor/contractor portal where contracts and RFPs are posted. Search "[your city] procurement" or "[your county] bids."' }
              ]
            },
            {
              category: 'Foundation & Private Grants',
              color: 'border-purple-300 bg-purple-50',
              titleColor: 'text-purple-900',
              resources: [
                { name: 'Candid / Foundation Directory', url: 'https://candid.org', desc: 'The most comprehensive foundation grants database. Some features require a paid subscription, but many public libraries offer free access. Search by keyword, geography, and funding type.' },
                { name: 'Foundation websites directly', url: null, desc: 'Identify foundations that fund work in your sector and visit their websites directly. Most post their grant guidelines, deadlines, and contact information publicly.' },
                { name: 'Community Foundation of your region', url: null, desc: 'Community foundations exist in most metropolitan areas and fund local nonprofits and sometimes for-profit businesses with community benefit missions. Search "[your city] community foundation."' }
              ]
            },
            {
              category: 'Nonprofit-Specific Resources',
              color: 'border-rose-300 bg-rose-50',
              titleColor: 'text-rose-900',
              resources: [
                { name: 'GuideStar (now Candid)', url: 'https://candid.org', desc: 'Research nonprofit organizations and funders. Use this to research funders\' giving history and identify whether your organization aligns with their portfolio.' },
                { name: 'GrantStation', url: 'https://grantstation.com', desc: 'Subscription-based database with federal, state, foundation, and corporate grants. Many library systems offer free access.' },
                { name: 'Nonprofit Finance Fund', url: 'https://nff.org', desc: 'Financial health resources, lending, and tools specifically for nonprofits. Useful for capacity building and financial literacy beyond grant writing.' }
              ]
            },
            {
              category: 'For-Profit & Small Business Funding',
              color: 'border-amber-300 bg-amber-50',
              titleColor: 'text-amber-900',
              resources: [
                { name: 'SBA (Small Business Administration)', url: 'https://www.sba.gov/funding-programs', desc: 'Loans, surety bonds, investment capital, and some grant programs. Not a grant clearinghouse, but a critical resource for small business funding readiness.' },
                { name: 'MBDA (Minority Business Development Agency)', url: 'https://www.mbda.gov', desc: 'Grants, contracts, and resources specifically for minority-owned businesses. Check their MBDA Business Center locator for local support.' },
                { name: 'WBCs (Women\'s Business Centers)', url: 'https://www.sba.gov/local-assistance/find', desc: 'SBA-funded centers providing advising, training, and access to capital for women-owned businesses. Free or low-cost support.' }
              ]
            }
          ].map((cat, i) => (
            <div key={i} className={`p-4 border rounded-xl ${cat.color}`}>
              <h4 className={`font-bold mb-3 ${cat.titleColor}`}>{cat.category}</h4>
              <div className="space-y-3">
                {cat.resources.map((r, ri) => (
                  <div key={ri} className="p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-900">{r.name}</span>
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#143A50] underline">
                          Visit →
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'continuing-education',
    icon: <BookOpen className="w-5 h-5 text-[#143A50]" />,
    title: 'Continuing Education & Skill Development',
    color: 'border-l-[#143A50]',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          IncubateHer gave you a foundation. The grant writing and procurement landscape changes — regulations evolve, funder priorities shift, new tools emerge. Continuing to develop your skills is not optional for serious practitioners.
        </p>
        <div className="space-y-3">
          {[
            {
              title: 'Grant Professionals Association (GPA)',
              badge: 'Professional Association',
              badgeColor: 'bg-blue-100 text-blue-800',
              body: 'The primary professional association for grant writers. Offers the Grant Professional Certified (GPC) credential, professional development events, a national conference, and a network of practitioners. Membership provides access to ethical standards documentation, job boards, and peer support. grantprofessionals.org'
            },
            {
              title: 'American Grant Writers\' Association (AGWA)',
              badge: 'Certification',
              badgeColor: 'bg-purple-100 text-purple-800',
              body: 'Offers the Certified Grant Writer (CGW) credential. Provides training, certification, and a membership community. americangrantwritersassociation.org'
            },
            {
              title: 'National Grants Management Association (NGMA)',
              badge: 'Grants Management',
              badgeColor: 'bg-green-100 text-green-800',
              body: 'Focused on grants management (the post-award side: compliance, reporting, financial management). If you receive funding and need to manage it, NGMA offers the Certified Grants Management Specialist (CGMS) credential. ngma.us'
            },
            {
              title: 'Coursera / edX — Nonprofit Management & Grant Writing Courses',
              badge: 'Online Learning',
              badgeColor: 'bg-amber-100 text-amber-800',
              body: 'Multiple universities offer nonprofit management, grant writing, and social enterprise courses on Coursera and edX — many free to audit. Look for courses from Duke, Johns Hopkins, and Michigan. Great for deepening specific skills at your own pace.'
            },
            {
              title: 'GrantSpace (Candid Learning)',
              badge: 'Free Resources',
              badgeColor: 'bg-rose-100 text-rose-800',
              body: 'Free webinars, guides, and templates from Candid (formerly Foundation Center). Topics include proposal writing, nonprofit sustainability, and funder research. grantspace.org'
            },
            {
              title: 'EIS Platform — Ongoing Access',
              badge: 'Your Platform',
              badgeColor: 'bg-[#E5C089]/30 text-[#143A50]',
              body: 'Your access to the EIS platform and its resources does not end when the program does. The Resource Library, Learning Hub, template library, and AI document tools remain available to support your ongoing work. Log in whenever you need strategic support tools.'
            }
          ].map((item, i) => (
            <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-semibold text-slate-900">{item.title}</span>
                <Badge className={`text-xs ${item.badgeColor}`}>{item.badge}</Badge>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'maintaining-readiness',
    icon: <Shield className="w-5 h-5 text-[#1E4F58]" />,
    title: 'Maintaining Organizational Readiness',
    color: 'border-l-[#1E4F58]',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          Funding readiness is not a one-time achievement — it is an ongoing organizational discipline. Organizations that consistently win grants and contracts maintain specific practices that less-funded organizations neglect. Here is what that looks like in practice.
        </p>
        <div className="space-y-4">
          {[
            {
              category: 'Documentation Hygiene',
              icon: '📄',
              practices: [
                'Keep your organizational overview current — update it whenever your programs, leadership, or key data change (at minimum, annually)',
                'Maintain a current, board-approved strategic plan. Funders ask for this routinely and an outdated or absent plan is a readiness red flag',
                'Keep financial statements audit-ready at all times — current fiscal year and at least 2 prior years',
                'Maintain a running outcomes database: how many people served, what changed for them, how you measured it. Don\'t wait for a grant deadline to compile this data',
                'Store all corporate documents (articles of incorporation, bylaws, IRS determination letter, state registrations) in one accessible location and renew registrations before they lapse'
              ]
            },
            {
              category: 'Compliance Calendar',
              icon: '📅',
              practices: [
                'Build a compliance calendar that tracks: state registration renewal dates, SAM.gov registration expiration (renews annually), IRS Form 990 filing deadlines (nonprofits), any grant reporting deadlines for current awards',
                'Set 30-day and 60-day advance alerts for every compliance deadline — late filings disqualify organizations from future funding',
                'Track your indirect cost rate and negotiate a negotiated indirect cost rate agreement (NICRA) with a federal agency if you plan to pursue federal grants regularly',
                'If you have outstanding audit findings or compliance issues, address them before applying — many funders require attestation of no outstanding compliance issues'
              ]
            },
            {
              category: 'Continuous Outcome Tracking',
              icon: '📊',
              practices: [
                'Track program data consistently — not just when a grant requires it. Organizations with strong data systems win more funding because they can prove what they say',
                'Design your data collection around SMART outcomes (from your program training). If you can\'t measure it, you can\'t report on it',
                'Conduct simple pre/post assessments for your own programs — even informal ones create a track record of impact that funders find compelling',
                'Document anecdotal stories alongside quantitative data — both matter to funders, but quantitative data must come first'
              ]
            },
            {
              category: 'Funder Relationship Development',
              icon: '🤝',
              practices: [
                'Treat funding as a relationship, not a transaction. Follow funders you are interested in on social media. Read their annual reports. Attend their information sessions',
                'Attend community events where funders are present — not to pitch, but to build genuine familiarity',
                'If you receive funding, report on time, spend correctly, and communicate proactively. Funders remember organizations that make their lives easy',
                'If you are declined, ask (professionally) for feedback. Many funders will provide it, and the feedback is often more valuable than a small award would have been',
                'Express genuine gratitude for opportunities — funders are also humans who make difficult decisions with limited resources'
              ]
            }
          ].map((section, i) => (
            <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-xl">{section.icon}</span>
                {section.category}
              </h4>
              <ul className="space-y-2">
                {section.practices.map((p, pi) => (
                  <li key={pi} className="flex items-start gap-2 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1E4F58] mt-1.5 flex-shrink-0" />
                    {p}
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
    id: 'eis-community',
    icon: <Users className="w-5 h-5 text-[#AC1A5B]" />,
    title: 'Staying Connected with EIS & the IncubateHer Community',
    color: 'border-l-[#AC1A5B]',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          The IncubateHer program is a point of entry into a broader community — not just a standalone event. EIS is invested in the long-term success of its program graduates. Here is how to stay connected and continue accessing the value of that relationship.
        </p>
        <div className="space-y-3">
          {[
            {
              icon: <Globe className="w-5 h-5 text-[#143A50]" />,
              title: 'EIS Website & Newsletter',
              body: 'Visit elbertinnovativesolutions.org to access public resources, stay informed about upcoming programs, and learn about new services. Subscribe to the EIS newsletter to receive funding opportunities, capacity building tips, and program announcements directly in your inbox.',
              link: 'https://www.elbertinnovativesolutions.org/',
              linkLabel: 'Visit EIS Website'
            },
            {
              icon: <BookOpen className="w-5 h-5 text-[#1E4F58]" />,
              title: 'EIS Platform — Continued Access',
              body: 'Your platform account remains active after the program. The Resource Library, Learning Hub, AI Document Review, and template tools are available to support your ongoing work. Log in whenever you need a strategic tool or want to refresh your knowledge on a specific topic.',
              link: null,
              linkLabel: null
            },
            {
              icon: <Heart className="w-5 h-5 text-[#AC1A5B]" />,
              title: 'Refer Others to IncubateHer',
              body: 'One of the most impactful things a graduate can do is refer another business owner, nonprofit leader, or community entrepreneur to the next cohort. You know what you received from this program. If you know someone who needs it, tell them. Word-of-mouth from participants is how programs like this grow and continue serving communities.',
              link: null,
              linkLabel: null
            },
            {
              icon: <Star className="w-5 h-5 text-amber-500" />,
              title: 'Share Your Success',
              body: 'If you apply for and receive funding, win a contract, or make significant progress toward your goals using what you learned in IncubateHer — tell EIS. Your success story helps future participants understand what is possible, helps funders see the program\'s impact, and contributes to the continuation of the program itself.',
              link: null,
              linkLabel: null
            },
            {
              icon: <Target className="w-5 h-5 text-[#143A50]" />,
              title: 'EIS Boutique Consulting Services',
              body: 'For participants who are ready to pursue funding aggressively and want expert support beyond a single consultation, EIS offers boutique consulting services — including grant writing, proposal development, strategy retreats, and document review. These are fee-based services designed for organizations with active funding pursuits.',
              link: null,
              linkLabel: null
            },
            {
              icon: <Mail className="w-5 h-5 text-[#1E4F58]" />,
              title: 'Stay in Touch',
              body: 'If you have a question, need guidance, or just want to share an update — reach out. EIS is a relationship-based organization. The team that delivered this program wants to hear from you long after it ends.',
              link: 'mailto:info@elbertinnovativesolutions.org',
              linkLabel: 'Email EIS'
            }
          ].map((item, i) => (
            <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 mb-1">{item.title}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#143A50] underline font-semibold mt-2 inline-block">
                      {item.linkLabel} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'mindset',
    icon: <Lightbulb className="w-5 h-5 text-[#E5C089]" />,
    title: 'The Long-Game Mindset: What Sustained Success Looks Like',
    color: 'border-l-[#E5C089]',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          Grant writing and funding development are long-game disciplines. Most organizations submit 5–10 applications before receiving their first award. Contract wins often come after multiple unsuccessful bids. Understanding this is not discouraging — it is clarifying. Here is what the long game looks like in practice.
        </p>
        <div className="space-y-3">
          {[
            {
              title: 'Rejection is data, not failure',
              body: 'When you are declined, ask for reviewer feedback (many funders provide it if asked professionally). Study what the funded applications had in common. Improve and reapply. An organization that stops applying after one rejection will never win. An organization that treats every rejection as feedback will eventually.'
            },
            {
              title: 'Start with smaller, more accessible opportunities',
              body: 'Many new applicants aim too high too fast — pursuing $500,000 federal grants when they have never received $10,000 from a community foundation. Build your track record with appropriately-scaled opportunities. Funders look for track record. You build track record by winning smaller awards and executing them well.'
            },
            {
              title: 'Timing matters as much as quality',
              body: 'A great application submitted to the wrong funder at the wrong time will not win. Follow funding calendars. Set up alerts. Know when funders typically release RFPs. Applications submitted in the first week after an RFP drops are often scored higher than ones submitted in the final hours.'
            },
            {
              title: 'Relationships compound over time',
              body: 'Funders and procurement officers who see your name, organization, and quality work consistently over 2–3 years begin to look at your applications differently. One touchpoint rarely creates a relationship. Consistent, professional presence builds one.'
            },
            {
              title: 'Quality is always worth the extra hour',
              body: 'The difference between a funded and unfunded application is often one section that is vague instead of specific, one outcome that is aspirational instead of measurable, or one claim that is unsupported instead of cited. Do not rush the final hour. The extra review catches the thing that would have cost you the award.'
            },
            {
              title: 'Celebrate wins — no matter the size',
              body: 'A $5,000 seed grant is a win. It represents a funder\'s confidence in your organization. It is a line on your track record. It is proof that your application quality is award-worthy. Celebrate it, report on it excellently, and use it to pursue the next one.'
            }
          ].map((insight, i) => (
            <div key={i} className="p-4 border-l-4 border-[#E5C089] bg-amber-50/40 rounded-r-lg">
              <p className="font-semibold text-[#143A50] mb-1">{insight.title}</p>
              <p className="text-sm text-slate-700 leading-relaxed">{insight.body}</p>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'tools-checklist',
    icon: <Briefcase className="w-5 h-5 text-[#143A50]" />,
    title: 'Post-Program Toolkit Checklist',
    color: 'border-l-[#143A50]',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700 leading-relaxed">
          Use this checklist to confirm you have what you need before you start pursuing funding opportunities. Organizations that check off all of these items are positioned to compete — those with multiple gaps are not yet ready for major opportunities.
        </p>
        <div className="space-y-4">
          {[
            {
              category: 'Organizational Documents',
              items: [
                'Articles of incorporation / business registration (current and in good standing)',
                'EIN / Tax ID (on file and confirmed with IRS)',
                'IRS 501(c)(3) determination letter (nonprofits only)',
                'Bylaws (current, board-approved)',
                'Board roster with contact information (nonprofits)',
                'Most recent Form 990 (nonprofits — or IRS 990-N for small orgs)',
                'Certificate of Good Standing from Secretary of State (within last 12 months)',
                'SAM.gov registration (for federal grants and contracts)'
              ]
            },
            {
              category: 'Financial Documents',
              items: [
                'Most recent audited financial statements (or reviewed financials for smaller orgs)',
                'Current fiscal year operating budget',
                'Most recent bank statements (typically last 3 months)',
                'W-9 form (current and ready to submit)',
                'Chart of accounts and financial system in place',
                'Any current grant agreements and associated reports (if applicable)'
              ]
            },
            {
              category: 'Program Documents',
              items: [
                'Current organizational overview or capability statement (1–2 pages)',
                'At least one complete project or program description with clear outcomes',
                'Outcome data — participant counts, demographics, measurable impact evidence',
                'Logic model or theory of change for your primary program',
                'Testimonials or case studies (optional but valuable)'
              ]
            },
            {
              category: 'Readiness Indicators',
              items: [
                'You can articulate your mission, programs, and target population in 2–3 clear sentences',
                'You have identified 2–3 specific funding opportunities you are targeting',
                'You understand the difference between grants and contracts and which is appropriate for your organization now',
                'You have at least one complete, submission-ready project description',
                'You know your most significant readiness gap and have a plan to address it'
              ]
            }
          ].map((section, i) => (
            <div key={i} className="p-4 border border-slate-200 rounded-xl bg-white">
              <h4 className="font-bold text-slate-900 mb-3">{section.category}</h4>
              <div className="space-y-2">
                {section.items.map((item, ii) => (
                  <div key={ii} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
];

export default function IncubateHerAlumni() {
  const [expandedSections, setExpandedSections] = useState(new Set(['congratulations', 'immediate-actions']));

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
        title="Post-Program Success & Alumni Resources"
        subtitle="What to do next — and how EIS supports you beyond the program"
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Hero Banner */}
        <div className="p-6 bg-gradient-to-br from-[#143A50] via-[#1E4F58] to-[#AC1A5B]/40 text-white rounded-2xl shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-[#E5C089]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">The program ends. Your journey doesn't.</h2>
              <p className="text-white/90 leading-relaxed">
                This guide is your roadmap for what comes after IncubateHer — how to apply what you learned, where to find funding opportunities, how to maintain your readiness, and how to stay connected to the EIS community. Everything in here is designed to help you convert your program investment into real funding outcomes.
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

        {/* Final CTA */}
        <Card className="border-2 border-[#143A50] shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#143A50] to-[#AC1A5B] flex items-center justify-center">
                <Star className="w-8 h-8 text-[#E5C089]" />
              </div>
              <h3 className="text-2xl font-bold text-[#143A50]">You've got what it takes.</h3>
              <p className="text-slate-600 max-w-lg mx-auto leading-relaxed">
                The knowledge, the documents, the strategy — you built all of it in this program. Now go use it. EIS is rooting for you, and we're here when you need us.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a href="https://www.elbertinnovativesolutions.org/" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#143A50] hover:bg-[#1E4F58]">
                    Visit EIS Website
                  </Button>
                </a>
                <Link to={createPageUrl('ResourceLibrary')}>
                  <Button variant="outline">
                    Access Resource Library
                  </Button>
                </Link>
                <a href="mailto:info@elbertinnovativesolutions.org">
                  <Button variant="outline">
                    Contact EIS
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
      <CoBrandedFooter />
    </div>
  );
}