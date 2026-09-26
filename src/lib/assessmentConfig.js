// EIS Funding Readiness Assessment — Configuration & Static Data

export const BRAND = {
  navy: '#143A50',
  gold: '#E5C089',
  goldDeep: '#7E5F22',
  berry: '#AC1A5B',
  teal: '#1E4F58',
  cream: '#F9F4EF',
  rust: '#A65D40',
};

export const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png';
export const CALENDLY_URL = 'https://calendly.com/elbertinnovativesolutions/30min';
export const DR_E_SIGNATURE = '— Dr. Shawnté Elbert, Founder & CEO, Elbert Innovative Solutions';

export const STRUCTURES = {
  sole: 'Sole proprietor',
  llc: 'LLC',
  corp: 'Corporation',
  '501c3': '501(c)(3) nonprofit',
  othernp: 'Other nonprofit',
  church: 'Church or religious organization',
  gov: 'Government or public agency',
  fiscal: 'Fiscally sponsored project',
  notformed: 'Not yet legally formed',
  notsure: 'Not sure',
};

export const TRACKS = [
  { value: 'grant', label: 'Grant Funding', description: 'Federal, state, foundation, and corporate grants' },
  { value: 'proposals', label: 'Proposals & Contracts', description: 'RFPs, government contracts, and procurement' },
  { value: 'both', label: 'Both', description: 'Comprehensive readiness across grants and contracts' },
];

export const OUTREACH_OPTIONS = [
  { value: 'results_only', label: 'Just send me my results', description: 'No call needed — I want the report and the nurture sequence.' },
  { value: 'consultation', label: "I'd like a consultation call", description: 'Dr. Elbert, please reach out to schedule a 30-minute review.' },
  { value: 'calendly_booked', label: "I've already booked via Calendly", description: 'I booked a meeting through your Calendly — prepare for our call.' },
];

export const ROLE_OPTIONS = [
  'Owner or founder', 'Executive director', 'Board member', 'Development staff',
  'Business development staff', 'Program staff', 'Consultant', 'Other',
];

export const HEARD_ABOUT_OPTIONS = [
  'Referral', 'LinkedIn', 'Website', 'Event or workshop', 'Columbus Urban League', 'Other',
];

export const YEARS_OPTIONS = [
  'Less than 1 year', '1–3 years', '4–7 years', '8–15 years', 'More than 15 years',
];

export const BUDGET_OPTIONS = [
  'Under $100,000', '$100,000 – $500,000', '$500,000 – $1,000,000',
  '$1,000,000 – $5,000,000', '$5,000,000 – $10,000,000', 'Over $10,000,000',
];

export const LARGEST_AWARD_OPTIONS = [
  'None — first-time applicant', 'Under $25,000', '$25,000 – $100,000',
  '$100,000 – $500,000', '$500,000 – $1,000,000', 'Over $1,000,000',
];

export const FEDERAL_EXPERIENCE_OPTIONS = [
  'None', 'Applied but not awarded', 'Awarded one federal grant or contract',
  'Multiple federal awards', 'Ongoing federal awards',
];

export const TARGET_AMOUNT_OPTIONS = [
  'Under $50,000', '$50,000 – $250,000', '$250,000 – $1,000,000',
  '$1,000,000 – $5,000,000', 'Over $5,000,000',
];

export const TIMELINE_OPTIONS = [
  { value: 'immediate', label: 'Immediate (0–3 months)' },
  { value: 'near_term', label: 'Near-term (3–6 months)' },
  { value: 'mid_term', label: 'Mid-term (6–12 months)' },
  { value: 'long_term', label: 'Long-term (12+ months)' },
];

export const PROPOSAL_WRITER_OPTIONS = [
  'Internal staff (non-dedicated)', 'Executive leadership', 'Dedicated grant writer or proposal team',
  'External consultant', 'Board member or volunteer', 'Not yet determined',
];

export const FUNDING_SOURCES_OPTIONS = [
  'Grants', 'Individual donations', 'Government contracts', 'Fee-for-service / earned revenue',
  'Corporate sponsorships', 'Membership dues', 'Investment / equity', 'None yet',
];

export const BANDS = {
  ready: {
    key: 'ready',
    label: 'Ready & Competitive',
    min: 73, max: 100,
    colorKey: 'green',
    textColorClass: 'text-green-700',
    bgColorClass: 'bg-green-50',
    dotClass: 'bg-green-600',
    description: 'Your organization is well-positioned to pursue funding. Focus on targeting the right opportunities and refining your submissions.',
    interpretation: "When I see an organization score here, I see one that's done the quiet, unglamorous work most skip. You're fundable — that's not nothing. What I watch for now is discipline: are you chasing the right opportunities, or just the ones in front of you? The organizations that win repeatedly don't just submit well; they target well. Don't coast on a strong foundation — sharpen it.",
    cta: "You're ready to compete — now let's make sure you're competing for the right things. EIS works with organizations at this stage on proposal development, submission review, and opportunity targeting. Engagements begin at $2,500; federal work is custom-scoped. Over $22.4 million secured for clients — let's add yours.",
  },
  promising: {
    key: 'promising',
    label: 'Promising, With Gaps to Address',
    min: 45, max: 72,
    colorKey: 'gold',
    textColorClass: 'text-[#7E5F22]',
    bgColorClass: 'bg-[#E5C089]/20',
    dotClass: 'bg-[#E5C089]',
    description: 'You have a solid foundation but key gaps need attention before you are fully competitive. Targeted improvements can close these gaps quickly.',
    interpretation: "When an organization lands here, I see one that's close — closer than it probably feels. The gap between where you are and competitive is real, but it's closeable, and it's worth closing now, not later. Most of what's missing is paperwork and process, not mission or capacity. A few focused months of cleanup changes your standing. This is the moment where the right help pays for itself.",
    cta: "This is where a readiness review earns its keep. EIS turns this report into a sequenced plan — what to fix first, what can wait, and what to pursue now. Over $22.4 million secured for clients, and most of those organizations started right where you are. Let's close the gap.",
  },
  foundation: {
    key: 'foundation',
    label: 'Foundation-Building Required',
    min: 0, max: 44,
    colorKey: 'berry',
    textColorClass: 'text-[#AC1A5B]',
    bgColorClass: 'bg-[#AC1A5B]/10',
    dotClass: 'bg-[#AC1A5B]',
    description: 'Grant funding should not be your primary strategy yet. This is a timing finding, not a judgment of your work — pursuing awards from here tends to produce compliance exposure and burnout rather than revenue.',
    interpretation: "When I see a score here, I want to be honest with you: this is about timing, not failure. Your work matters. But grants chased too early don't just fail — they create compliance exposure, audit risk, and burnout that sets you back further than if you'd waited. I'd rather see you build the foundation first and win on your first real attempt than rush, lose, and doubt yourself. There's a path here, and it starts with the basics.",
    cta: "This is exactly the stage the EIS Grants & Contracts Accelerator was built for. It's a structured path from foundation to fundable — no grants chased before you're ready, no wasted submissions. Let's build the foundation the right way, on your timeline.",
  },
};

export const LEVEL_BANDS = {
  solid: { label: 'Solid', min: 80, max: 100 },
  developing: { label: 'Developing', min: 55, max: 79 },
  needs_work: { label: 'Needs work', min: 0, max: 54 },
};

export const LEVEL_NAMES = {
  grant: { 1: 'Foundational Readiness', 2: 'Fundability Readiness', 3: 'Competitive Readiness' },
  proposal: { 1: 'Foundational Readiness', 2: 'Bid Readiness', 3: 'Performance Readiness' },
};

export const LEVEL_DESCRIPTIONS = {
  grant: {
    1: 'What a funder assumes exists before reading a single word of your proposal.',
    2: 'What makes the request credible: defensible program design and the ability to steward restricted funds.',
    3: 'What separates organizations that win once from organizations that build a portfolio and survive the audit.',
  },
  proposal: {
    1: 'The paperwork a buyer will ask for before they will even open your bid.',
    2: 'What it takes to find the right solicitation and respond to it on time, priced correctly, and compliant.',
    3: 'What determines whether a first contract becomes a renewal instead of a cautionary tale.',
  },
};

export const ACKNOWLEDGMENTS = [
  'I understand that funding is competitive and that a strong submission does not guarantee an award.',
  'I understand that most grants reimburse after spending, and most contracts pay on net-30 to net-60 terms — neither is a substitute for startup capital or operating reserves.',
  'I understand that proposal development is paid for by my organization rather than from the award being requested, and that Elbert Innovative Solutions does not work on contingency or take a percentage of an award.',
  'I understand that alignment with the funder\'s or buyer\'s stated priorities influences the outcome as much as the quality of the writing.',
  'I understand that pursuing an award my organization is not ready to manage creates compliance and reputational risk.',
];

export const RECOMMENDED_DOCUMENTS = {
  sole: ['Capability statement', 'Rate sheet or pricing schedule', 'W-9 ready to send', 'Standard service agreement', 'Three client references', 'Past-performance summaries', 'Dedicated business bank account', 'Bookkeeping and invoicing system'],
  llc: ['Capability statement', 'Operating agreement or corporate records', 'Certificate of good standing', 'Certificate of insurance', 'Loaded rate and pricing structure', 'Past-performance portfolio', 'Vendor registration checklist', 'Contract management workflow'],
  corp: ['Capability statement', 'Operating agreement or corporate records', 'Certificate of good standing', 'Certificate of insurance', 'Loaded rate and pricing structure', 'Past-performance portfolio', 'Vendor registration checklist', 'Contract management workflow'],
  '501c3': ['IRS determination or tax-exemption documentation', 'Bylaws', 'Board roster and governance checklist', 'Conflict of interest policy', 'Board-approved operating budget', 'Form 990 and current financial statements', 'Program description sheet', 'Logic model', 'Grant document vault'],
  othernp: ['IRS determination or tax-exemption documentation', 'Bylaws', 'Board roster and governance checklist', 'Conflict of interest policy', 'Board-approved operating budget', 'Form 990 and current financial statements', 'Program description sheet', 'Logic model', 'Grant document vault'],
  church: ['Governing documents or constitution', 'Leadership or board roster', 'Financial accountability procedures', 'Restricted fund tracking', 'Safeguarding and child protection policies', 'Program budget', 'Documented community need', 'Proof of tax-exempt treatment or IRS determination'],
  gov: ['Authorized signatory documentation', 'Approved agency budget', 'Procurement and grants management policies', 'Indirect cost documentation', 'Recent audit materials', 'Departmental organizational chart', 'Internal control documentation', 'SAM.gov and UEI records'],
  fiscal: ['Signed fiscal sponsorship agreement', 'Sponsor determination letter and W-9', 'Sponsor approval workflow', 'Administrative fee structure in writing', 'Project-specific budget', 'Roles and responsibilities matrix', 'Fund disbursement process', 'Reporting responsibility checklist'],
  notformed: ['Legal structure decision guide', 'Entity formation checklist', 'Fiscal sponsorship comparison', 'Mission and service definition worksheet', 'Startup budget', 'Initial leadership structure', 'Funding pathway roadmap'],
  notsure: ['Legal structure decision guide', 'Entity formation checklist', 'Fiscal sponsorship comparison', 'Mission and service definition worksheet', 'Startup budget', 'Initial leadership structure', 'Funding pathway roadmap'],
};

export const NEXT_STEPS = {
  ready: [
    'Identify and shortlist target funding opportunities that match your profile and mission.',
    'Assemble your proposal team and clearly assign roles and responsibilities.',
    'Develop a submission calendar tracking upcoming deadlines and requirements.',
    'Schedule proposal reviews and build in time for quality assurance before submission.',
    'Consider partnering with EIS for proposal development, technical writing, and submission review.',
  ],
  promising: [
    'Address your eligibility holds before investing time in a submission.',
    'Strengthen your financial documentation and accounting systems.',
    'Build partnership relationships and secure memoranda of understanding.',
    'Develop your program model, outcomes framework, and evaluation plan.',
    'Work with EIS to create a targeted readiness improvement plan and timeline.',
  ],
  foundation: [
    'Fix your foundational gaps before anything else — whatever your total, incomplete foundational items will disqualify you before anyone evaluates your work.',
    'Complete the foundational items first. These are threshold requirements. Until they are done, the quality of your writing does not matter.',
    'Build a mixed funding base while readiness develops: earned revenue, individual giving, corporate sponsorship, and fee-for-service work are faster, less restricted, and build the financial history funders want to see.',
    'Reassess in six months and measure the movement. Save this plan. Score movement is the clearest evidence of organizational growth you can show a funder or a board.',
  ],
  default: [
    'Review your assessment results and identify priority gaps.',
    'Contact EIS to discuss a customized readiness plan.',
  ],
};

export const HOLDS_CONFIG = {
  struct_notformed: 'Not yet legally formed — keep building your program, budget and narrative; most applications should wait until your entity exists or a fiscal sponsor is confirmed.',
  struct_notsure: 'Structure unconfirmed — nearly every funder asks you to state and prove your structure; your Secretary of State registry and IRS letters will tell you.',
  struct_grant_restriction: 'Most charitable grants are restricted to nonprofits — your realistic pathways are small-business and economic development programs, innovation and research awards, workforce funding, corporate supplier programs, contracts and subcontracts.',
  struct_fiscal: 'Confirm your sponsor arrangement — a signed agreement, sponsor authorization to apply, and a funder that accepts fiscally sponsored applicants.',
  item_holds: [
    { id: 'g_good_standing', track: 'grant', matchText: 'Organization in good standing with the state and the IRS', matchType: 'exact', holdText: 'Good standing unconfirmed — verified before award; a lapsed filing disqualifies an otherwise strong application.' },
    { id: 'g_bank', track: 'grant', matchText: 'Dedicated business or organizational bank account established', matchType: 'exact', holdText: 'No dedicated bank account — awards cannot be paid into a personal account.' },
    { id: 'g_fund_acct', track: 'grant', matchText: 'Able to track and report grant funds separately (fund accounting)', matchType: 'exact', holdText: 'No way to track award funds separately — resolve before accepting money, not after.' },
    { id: 'p_good_standing', track: 'proposal', matchText: 'Business legally registered and in good standing with the state', matchType: 'exact', holdText: 'Registration or good standing unconfirmed — verified at award and often at bid.' },
    { id: 'p_insurance', track: 'proposal', matchText: 'Required insurance in place', matchType: 'partial', holdText: 'Required insurance not in place — most solicitations require proof at submission or shortly after award.' },
    { id: 'p_segregate', track: 'proposal', matchText: 'Able to segregate and report costs by contract', matchType: 'exact', holdText: 'No way to segregate costs by contract — you cannot invoice defensibly or survive a cost review.' },
  ],
};

export const PROOF_STRIP = [
  { stat: '$22.4M+', label: 'secured for clients' },
  { stat: '55+', label: 'grants awarded' },
  { stat: '67.9%', label: 'award rate vs. 20–30% national average' },
  { stat: 'Federal · State · Foundation', label: 'experience across all three' },
];

export const CONSULTATION_CARD = {
  title: "Let's talk it through.",
  body: "Book your 30-minute consultation with Dr. Shawnté Elbert directly — pick a time below and she'll walk through your results and map your next move.",
};

export const PRIORITY_LABELS = {
  0: { label: 'Fix first — required', badgeClass: 'bg-[#AC1A5B] text-white' },
  1: { label: 'Required before submission', badgeClass: 'bg-[#AC1A5B]/90 text-white' },
  2: { label: 'Foundational', badgeClass: 'bg-[#7E5F22] text-white' },
  3: { label: 'Strengthen', badgeClass: 'bg-[#1E4F58] text-white' },
  4: { label: 'Competitive edge', badgeClass: 'bg-[#143A50]/70 text-white' },
};