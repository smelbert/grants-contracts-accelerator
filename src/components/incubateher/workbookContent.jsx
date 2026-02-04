// Complete workbook structure with all 24 pages
export const WORKBOOK_PAGES = [
  // FRONT MATTER
  {
    id: 'cover',
    section: 'front_matter',
    title: 'IncubateHer Funding Readiness Workbook',
    subtitle: 'Preparing for Grants & Contracts',
    type: 'handout',
    content: `
      <div class="text-center space-y-4 py-8">
        <h1 class="text-3xl font-bold text-[#143A50]">IncubateHer Funding Readiness</h1>
        <h2 class="text-xl text-[#AC1A5B]">Your Guide to Grants & Contracts</h2>
      </div>
    `
  },
  {
    id: 'how_to_use',
    section: 'front_matter',
    title: 'How to Use This Workbook',
    type: 'handout',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    video_description: 'Welcome message from Dr. Shawnté Elbert on how to get the most from this workbook',
    content: `
      <p class="mb-4">Self-paced companion for sessions, assessments, and consultation prep.</p>
      
      <h3 class="font-semibold mb-2">What This IS</h3>
      <ul class="list-disc ml-6 mb-3 text-sm">
        <li>Readiness self-assessment</li>
        <li>Planning framework</li>
        <li>Reflection tool</li>
      </ul>
      
      <h3 class="font-semibold mb-2">What This IS NOT</h3>
      <ul class="list-disc ml-6 mb-3 text-sm">
        <li>Grant writing service</li>
        <li>Funding search</li>
        <li>Success guarantee</li>
      </ul>
      
      <p class="text-sm mt-3"><strong>Icons:</strong> 📝 Worksheet | 📄 Handout | 💡 Tips | 🎯 Consultation Prep</p>
    `
  },
  {
    id: 'learning_outcomes',
    section: 'front_matter',
    title: 'Learning Outcomes & Completion Criteria',
    type: 'handout',
    content: `
      <h3 class="font-semibold mb-2">Learning Outcomes</h3>
      <ul class="list-disc ml-6 mb-4 text-sm space-y-1">
        <li>Distinguish grants from contracts</li>
        <li>Assess organizational readiness</li>
        <li>Identify core documentation needs</li>
        <li>Build an aligned business story</li>
        <li>Recognize common pitfalls</li>
        <li>Read RFPs strategically</li>
        <li>Create a realistic action plan</li>
      </ul>
      
      <h3 class="font-semibold mb-2">Completion Criteria</h3>
      <div class="text-sm space-y-1">
        <p>✅ Attend all program sessions</p>
        <p>✅ Complete pre & post assessments</p>
        <p>✅ Finish 1:1 consultation</p>
        <p>✅ Submit required documents</p>
        <p>✅ Participate in post-program survey</p>
      </div>
    `
  },

  // SECTION 1: FUNDING FOUNDATIONS
  {
    id: 'funding_pathways',
    section: 'funding_foundations',
    title: 'Funding Pathways Overview',
    type: 'handout',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    video_description: 'Expert explanation: Understanding the key differences between grants and contracts',
    takeaways: [
      'Grants fund your mission and provide more flexibility',
      'Contracts pay for specific deliverables with strict requirements',
      'Understanding the difference helps you choose the right pathway'
    ],
    actionItems: [
      'Review your business structure and determine which pathway aligns best',
      'Assess your current capacity for each type of funding'
    ],
    content: `
      <p class="mb-3 text-sm">Grants fund your <strong>mission</strong>. Contracts pay for <strong>deliverables</strong>. Know the difference.</p>
      
      <table class="w-full border-collapse mb-3 text-xs">
        <thead>
          <tr class="bg-slate-100">
            <th class="border p-2 text-left">Aspect</th>
            <th class="border p-2 text-left">Grants</th>
            <th class="border p-2 text-left">Contracts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border p-2"><strong>Purpose</strong></td>
            <td class="border p-2">Support mission</td>
            <td class="border p-2">Purchase services</td>
          </tr>
          <tr>
            <td class="border p-2"><strong>Reviewer</strong></td>
            <td class="border p-2">Program officers</td>
            <td class="border p-2">Procurement teams</td>
          </tr>
          <tr>
            <td class="border p-2"><strong>Flexibility</strong></td>
            <td class="border p-2">Moderate</td>
            <td class="border p-2">Strict</td>
          </tr>
          <tr>
            <td class="border p-2"><strong>Reporting</strong></td>
            <td class="border p-2">Narrative outcomes</td>
            <td class="border p-2">Performance data</td>
          </tr>
          <tr>
            <td class="border p-2"><strong>Oversight</strong></td>
            <td class="border p-2">Periodic check-ins</td>
            <td class="border p-2">Close monitoring</td>
          </tr>
        </tbody>
      </table>
      
      <h3 class="font-semibold mb-2 text-sm">Common Myths</h3>
      <ul class="list-disc ml-6 text-xs space-y-1">
        <li><strong>"Grants are free money"</strong> → Require reporting & compliance</li>
        <li><strong>"Only big orgs get contracts"</strong> → Small businesses compete successfully</li>
        <li><strong>"Nonprofits can't do contracts"</strong> → Many organizations do both</li>
        <li><strong>"One is easier than the other"</strong> → Both demand readiness</li>
      </ul>
      
      <p class="text-xs mt-3 text-slate-600"><em>Most organizations pursue both pathways strategically over time.</em></p>
    `
  },
  {
    id: 'which_fits_me',
    section: 'funding_foundations',
    title: 'Grants vs. Contracts: Which Fits Me?',
    type: 'worksheet',
    fields: [
      {
        id: 'business_structure',
        type: 'textarea',
        label: 'My current business/legal structure:',
        rows: 2
      },
      {
        id: 'current_capacity',
        type: 'textarea',
        label: 'My current capacity (staffing, time, systems):',
        rows: 3
      },
      {
        id: 'timeline',
        type: 'textarea',
        label: 'My realistic timeline for pursuing funding:',
        rows: 2
      },
      {
        id: 'best_pathway',
        type: 'textarea',
        label: 'Which pathway makes more sense right now and why:',
        rows: 4
      }
    ]
  },

  // SECTION 2: FUNDING READINESS REALITY CHECK
  {
    id: 'readiness_meaning',
    section: 'readiness',
    title: 'What "Funding Ready" Actually Means',
    type: 'handout',
    takeaways: [
      'Funding readiness requires systems, documentation, and capacity—not just passion',
      'Legal, financial, and organizational foundations are all critical',
      'Build these systems before pursuing major funding opportunities'
    ],
    actionItems: [
      'Complete the readiness self-assessment honestly',
      'Identify your top 2-3 readiness gaps to address first'
    ],
    content: `
      <p class="mb-3 text-sm"><strong>Funding readiness = systems + documentation + capacity.</strong> Not passion. Not need.</p>
      
      <div class="space-y-2 text-sm">
        <div class="p-2 bg-blue-50 rounded">
          <strong>Legal:</strong> Registered entity, EIN, dedicated bank account
        </div>
        <div class="p-2 bg-green-50 rounded">
          <strong>Financial:</strong> Operating budget, financial statements, tracking systems
        </div>
        <div class="p-2 bg-purple-50 rounded">
          <strong>Documentation:</strong> Clear mission statement, program descriptions, measurable outcomes
        </div>
        <div class="p-2 bg-amber-50 rounded">
          <strong>Capacity:</strong> Staff bandwidth, infrastructure to deliver
        </div>
        <div class="p-2 bg-red-50 rounded">
          <strong>Compliance:</strong> Reporting ability, record-keeping, deadline management
        </div>
      </div>
      
      <p class="text-xs mt-3 text-slate-600"><em>Passion matters. But funders assess capacity first.</em></p>
    `
  },
  {
    id: 'readiness_self_assessment',
    section: 'readiness',
    title: 'Funding Readiness Self-Assessment',
    type: 'worksheet',
    fields: [
      {
        id: 'legal_status',
        type: 'radio',
        label: 'Legal Status',
        options: [
          { value: 'full', label: 'Formal entity with EIN and bank account' },
          { value: 'partial', label: 'Formal entity, but missing some pieces' },
          { value: 'none', label: 'No formal legal structure yet' }
        ]
      },
      {
        id: 'financial_records',
        type: 'radio',
        label: 'Financial Records',
        options: [
          { value: 'professional', label: 'Professional financial statements and budget' },
          { value: 'basic', label: 'Basic tracking (spreadsheets)' },
          { value: 'none', label: 'No formal financial tracking' }
        ]
      },
      {
        id: 'program_clarity',
        type: 'radio',
        label: 'Program/Service Clarity',
        options: [
          { value: 'documented', label: 'Clear, documented programs with outcomes' },
          { value: 'developing', label: 'Programs exist but not fully documented' },
          { value: 'exploring', label: 'Still exploring what I offer' }
        ]
      },
      {
        id: 'capacity',
        type: 'radio',
        label: 'Staffing/Time Capacity',
        options: [
          { value: 'ready', label: 'Have capacity to take on funded work' },
          { value: 'tight', label: 'Currently at capacity' },
          { value: 'overextended', label: 'Already overextended' }
        ]
      }
    ]
  },
  {
    id: 'readiness_gaps',
    section: 'readiness',
    title: 'Readiness Gaps & Timing',
    type: 'worksheet',
    fields: [
      {
        id: 'whats_missing',
        type: 'textarea',
        label: "What's missing from my readiness right now?",
        rows: 4
      },
      {
        id: 'in_progress',
        type: 'textarea',
        label: "What's currently in progress?",
        rows: 3
      },
      {
        id: 'harmful_to_apply',
        type: 'textarea',
        label: 'What would make applying for funding harmful to my organization right now?',
        rows: 3
      },
      {
        id: 'realistic_timeline',
        type: 'textarea',
        label: 'My realistic timeline for being funding-ready:',
        rows: 2
      }
    ]
  },

  // SECTION 3: CORE DOCUMENTS
  {
    id: 'core_documents_overview',
    section: 'documents',
    title: 'Core Documents Overview',
    type: 'handout',
    content: `
      <p class="mb-3 text-sm">Most funders expect these core documents. Keep them current and accessible.</p>
      
      <div class="space-y-2 text-sm">
        <div class="p-2 border-l-4 border-blue-500 bg-slate-50">
          <strong>Organizational Overview:</strong> Mission, history, leadership, impact summary
        </div>
        <div class="p-2 border-l-4 border-green-500 bg-slate-50">
          <strong>Program Descriptions:</strong> Services offered, populations served, delivery methods
        </div>
        <div class="p-2 border-l-4 border-purple-500 bg-slate-50">
          <strong>Budgets:</strong> Operating budget, program-specific budgets, cost breakdowns
        </div>
        <div class="p-2 border-l-4 border-amber-500 bg-slate-50">
          <strong>Outcomes & Evidence:</strong> Results achieved, metrics tracked, success stories
        </div>
        <div class="p-2 border-l-4 border-red-500 bg-slate-50">
          <strong>Governance & Policies:</strong> Board roster, bylaws, financial procedures, HR policies
        </div>
        <div class="p-2 border-l-4 border-indigo-500 bg-slate-50">
          <strong>Legal Documents:</strong> IRS determination letter (nonprofits), business licenses, certifications
        </div>
      </div>
      
      <div class="mt-3 p-2 bg-amber-50 rounded text-xs">
        <strong>Remember:</strong> Grants focus on <em>mission alignment</em>. Contracts focus on <em>capacity to deliver</em>.
      </div>
    `
  },
  {
    id: 'document_inventory',
    section: 'documents',
    title: 'Document Inventory',
    type: 'worksheet',
    fields: [
      {
        id: 'inventory_table',
        type: 'table',
        label: 'Track your document readiness:',
        columns: [
          { id: 'document', label: 'Document Name' },
          { id: 'have_it', label: 'I Have It (Y/N)' },
          { id: 'needs_update', label: 'Needs Updating' },
          { id: 'questions', label: 'Questions I Have' }
        ],
        rows: 8
      }
    ]
  },
  {
    id: 'budget_basics',
    section: 'documents',
    title: 'Budget Basics for Readiness',
    type: 'handout',
    content: `
      <p class="mb-3 text-sm">Your budget tells funders you understand true costs and manage money responsibly.</p>
      
      <h3 class="font-semibold mb-2 text-sm">What Good Budgets Include:</h3>
      <ul class="list-disc ml-6 mb-3 text-sm space-y-1">
        <li>Personnel costs (salaries, benefits, payroll taxes)</li>
        <li>Direct program expenses (supplies, materials)</li>
        <li>Indirect/overhead costs (rent, utilities, admin)</li>
        <li>Evaluation costs (data collection, analysis)</li>
        <li>Realistic timelines (avoid overpromising)</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">Common Budget Pitfalls:</h3>
      <ul class="list-disc ml-6 mb-3 text-sm space-y-1">
        <li>Underestimating staff time required</li>
        <li>Forgetting evaluation & reporting costs</li>
        <li>Ignoring indirect cost calculations</li>
        <li>Copying another budget without understanding</li>
        <li>Using inflated or deflated numbers</li>
      </ul>
      
      <div class="p-2 bg-blue-50 rounded text-xs mt-3">
        <p><strong>Grants:</strong> More flexible, fund operations and mission</p>
        <p><strong>Contracts:</strong> Fixed-price, strict scope of work</p>
      </div>
      
      <p class="text-xs mt-2 text-slate-600"><em>Build budgets from actual costs—not guesses.</em></p>
    `
  },

  // SECTION 4: RFPs & CONTRACTS
  {
    id: 'understanding_rfps',
    section: 'rfps',
    title: 'Understanding RFPs & Solicitations',
    type: 'handout',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    video_description: 'Deep dive: How to read and respond to RFPs strategically',
    content: `
      <p class="mb-3 text-sm"><strong>RFP = Request for Proposal.</strong> Formal competitive process for contracts. Common with government and large organizations.</p>
      
      <h3 class="font-semibold mb-2 text-sm">How Contracts Differ from Grants:</h3>
      <ul class="list-disc ml-6 mb-3 text-sm space-y-1">
        <li>You're paid to <strong>deliver services</strong> (not funded for mission)</li>
        <li>Strict deliverables, timelines, and reporting requirements</li>
        <li>Close monitoring and performance evaluations</li>
        <li>Penalties for non-performance or late delivery</li>
        <li>Less flexibility to adjust scope mid-project</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">RFPs Test Your Capacity to:</h3>
      <ul class="list-disc ml-6 mb-3 text-sm space-y-1">
        <li>Understand complex technical requirements</li>
        <li>Deliver on time with existing infrastructure</li>
        <li>Manage budgets and project timelines</li>
        <li>Price services accurately and competitively</li>
        <li>Comply with strict reporting and documentation</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">Red Flags to Watch For:</h3>
      <ul class="list-disc ml-6 text-sm space-y-1">
        <li>Unrealistic timelines or budgets</li>
        <li>Vague or poorly defined deliverables</li>
        <li>Requirements beyond your current capacity</li>
        <li>Unclear payment terms or delayed reimbursement</li>
      </ul>
      
      <p class="text-xs mt-3 text-slate-600"><em>Contracts reward organizations with strong systems and proven delivery capacity.</em></p>
    `
  },
  {
    id: 'rfp_rfq_rfi_breakdown',
    section: 'rfps',
    title: 'RFPs, RFQs, & RFIs: Know the Difference',
    type: 'handout',
    takeaways: [
      'RFPs seek comprehensive proposals with budget and approach',
      'RFQs focus on price comparisons for standardized services',
      'RFIs are information-gathering tools, not funding opportunities'
    ],
    actionItems: [
      'Identify which type of solicitation best fits your services',
      'Review your capacity to respond to each type effectively'
    ],
    content: `
      <p class="mb-3 text-sm">Understanding solicitation types helps you prioritize where to invest your time.</p>
      
      <div class="space-y-3 mb-4">
        <div class="p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
          <h4 class="font-semibold text-sm mb-1">RFP – Request for Proposal</h4>
          <p class="text-xs mb-2"><strong>What it is:</strong> Comprehensive submission including approach, qualifications, timeline, and budget</p>
          <p class="text-xs mb-2"><strong>Selection criteria:</strong> Technical approach (often 60-70%), cost, qualifications, past performance</p>
          <p class="text-xs mb-1"><strong>Best for:</strong> Complex projects, professional services, program delivery</p>
          <p class="text-xs"><strong>Example:</strong> "Provide mentoring services to 100 youth over 12 months with measurable outcomes"</p>
        </div>
        
        <div class="p-3 border-l-4 border-green-500 bg-green-50 rounded">
          <h4 class="font-semibold text-sm mb-1">RFQ – Request for Quotation</h4>
          <p class="text-xs mb-2"><strong>What it is:</strong> Price quote for well-defined goods or standardized services</p>
          <p class="text-xs mb-2"><strong>Selection criteria:</strong> Price is primary factor (70-90%), with basic qualifications</p>
          <p class="text-xs mb-1"><strong>Best for:</strong> Standardized services, equipment, bulk orders, routine contracts</p>
          <p class="text-xs"><strong>Example:</strong> "Provide 50 laptops meeting specific technical specifications"</p>
        </div>
        
        <div class="p-3 border-l-4 border-amber-500 bg-amber-50 rounded">
          <h4 class="font-semibold text-sm mb-1">RFI – Request for Information</h4>
          <p class="text-xs mb-2"><strong>What it is:</strong> Exploratory research to understand market capabilities</p>
          <p class="text-xs mb-2"><strong>Selection criteria:</strong> None—this is NOT a funding opportunity</p>
          <p class="text-xs mb-1"><strong>Best for:</strong> Market research, vendor discovery, future planning</p>
          <p class="text-xs"><strong>Example:</strong> "Tell us about available training programs for small business owners"</p>
        </div>
      </div>
      
      <h3 class="font-semibold mb-2 text-sm">How to Respond Strategically:</h3>
      <table class="w-full border-collapse mb-3 text-xs">
        <thead>
          <tr class="bg-slate-100">
            <th class="border p-2 text-left">Type</th>
            <th class="border p-2 text-left">Time Investment</th>
            <th class="border p-2 text-left">Win Strategy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border p-2"><strong>RFP</strong></td>
            <td class="border p-2">High (40-80 hours)</td>
            <td class="border p-2">Demonstrate innovative approach + proven results</td>
          </tr>
          <tr>
            <td class="border p-2"><strong>RFQ</strong></td>
            <td class="border p-2">Low (2-10 hours)</td>
            <td class="border p-2">Competitive pricing + meet specifications</td>
          </tr>
          <tr>
            <td class="border p-2"><strong>RFI</strong></td>
            <td class="border p-2">Minimal (1-3 hours)</td>
            <td class="border p-2">Build relationship for future opportunities</td>
          </tr>
        </tbody>
      </table>
      
      <div class="p-2 bg-red-50 border border-red-200 rounded text-xs">
        <strong>Critical:</strong> Don't confuse RFIs with RFPs. Responding to an RFI won't result in immediate funding—but may position you for future contracts.
      </div>
    `
  },
  {
    id: 'reading_opportunities',
    section: 'rfps',
    title: 'Reading Opportunities Strategically',
    type: 'worksheet',
    fields: [
      {
        id: 'what_asking',
        type: 'textarea',
        label: 'What is this opportunity really asking for?',
        rows: 3
      },
      {
        id: 'capacity_assumed',
        type: 'textarea',
        label: 'What capacity is assumed? (Do I have it?)',
        rows: 3
      },
      {
        id: 'if_i_win',
        type: 'textarea',
        label: 'What happens if I win? (Can I actually deliver?)',
        rows: 3
      },
      {
        id: 'aligned_or_aspirational',
        type: 'radio',
        label: 'Is this opportunity:',
        options: [
          { value: 'aligned', label: 'Aligned with my current capacity' },
          { value: 'stretch', label: 'A stretch but doable' },
          { value: 'aspirational', label: 'Aspirational (not ready yet)' }
        ]
      }
    ]
  },

  // SECTION 5: FUNDRAISING FUNDAMENTALS
  {
    id: 'making_the_ask',
    section: 'fundraising',
    title: 'Making the Ask: Fundraising 101',
    type: 'handout',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    video_description: 'Expert walkthrough: How to make effective fundraising asks',
    takeaways: [
      'The ask is relationship-based, not transactional',
      'Preparation includes research, cultivation, and timing',
      'Asking is about inviting partnership, not begging for money'
    ],
    actionItems: [
      'Identify 3 potential donors and research their giving priorities',
      'Practice your elevator pitch for different giving levels'
    ],
    content: `
      <p class="mb-3 text-sm"><strong>"Making the ask"</strong> is the moment you invite someone to financially support your mission. It requires preparation, confidence, and clarity.</p>
      
      <h3 class="font-semibold mb-2 text-sm">The Fundraising Ask Framework:</h3>
      <div class="space-y-2 mb-3 text-sm">
        <div class="p-2 bg-blue-50 rounded">
          <strong>1. Research:</strong> Understand donor interests, capacity, and giving history
        </div>
        <div class="p-2 bg-green-50 rounded">
          <strong>2. Cultivation:</strong> Build authentic relationship before asking
        </div>
        <div class="p-2 bg-purple-50 rounded">
          <strong>3. The Ask:</strong> Make specific request tied to impact
        </div>
        <div class="p-2 bg-amber-50 rounded">
          <strong>4. Follow-Up:</strong> Thank, report impact, and steward relationship
        </div>
      </div>
      
      <h3 class="font-semibold mb-2 text-sm">Anatomy of a Strong Ask:</h3>
      <ul class="list-disc ml-6 mb-3 text-xs space-y-1">
        <li><strong>Specific:</strong> "We're seeking $5,000" not "Would you consider supporting us?"</li>
        <li><strong>Tied to Impact:</strong> "$5,000 will provide job training for 25 women entrepreneurs"</li>
        <li><strong>Invitational:</strong> "Would you partner with us?" not "Can you help?"</li>
        <li><strong>Time-Bound:</strong> "For our summer cohort launching June 1st"</li>
        <li><strong>Gratitude-Centered:</strong> Thank them for considering, regardless of response</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">Common Ask Mistakes to Avoid:</h3>
      <ul class="list-disc ml-6 mb-3 text-xs space-y-1">
        <li>Asking too early before relationship is built</li>
        <li>Being vague about amount or purpose</li>
        <li>Apologizing or appearing desperate</li>
        <li>Failing to listen to donor questions/concerns</li>
        <li>Not following up after the ask</li>
      </ul>
      
      <div class="p-2 bg-slate-100 rounded text-xs mb-2">
        <p class="mb-1"><strong>Sample Ask Script:</strong></p>
        <p class="italic">"Thank you for meeting with me today. As you know, [Organization] is addressing [problem] for [community]. We're launching a new program to [specific outcome]. Would you consider a leadership gift of $10,000 to help us serve 50 families this year? Your investment would directly fund [specific deliverable]."</p>
      </div>
      
      <p class="text-xs text-slate-600"><em>Confidence comes from clarity: know your mission, know your ask, know your donor.</em></p>
    `
  },
  {
    id: 'donor_demographics',
    section: 'fundraising',
    title: 'Fundraising Across Age Groups & Demographics',
    type: 'handout',
    takeaways: [
      'Different generations give differently—tailor your approach',
      'Younger donors prefer digital engagement and social impact',
      'Older donors value relationships and legacy giving',
      'Corporate and foundation donors have formal processes'
    ],
    actionItems: [
      'Segment your donor list by age/demographic',
      'Create tailored messaging for each donor segment'
    ],
    content: `
      <p class="mb-3 text-sm">One-size-fits-all fundraising doesn't work. Understanding donor demographics helps you meet them where they are.</p>
      
      <h3 class="font-semibold mb-2 text-sm">Generational Giving Patterns:</h3>
      
      <div class="space-y-3 mb-4">
        <div class="p-3 border-l-4 border-purple-500 bg-purple-50 rounded">
          <h4 class="font-semibold text-sm mb-1">Gen Z & Millennials (Ages 18-43)</h4>
          <p class="text-xs mb-2"><strong>Giving Behavior:</strong> Digital-first, cause-driven, peer-influenced, recurring small gifts</p>
          <p class="text-xs mb-1"><strong>Best Channels:</strong> Social media campaigns, mobile giving, crowdfunding, recurring donations</p>
          <p class="text-xs mb-1"><strong>Values:</strong> Transparency, social justice, measurable impact, authenticity</p>
          <p class="text-xs"><strong>Example Ask:</strong> "Join our monthly giving circle—$25/month provides job training for 1 woman per quarter"</p>
        </div>
        
        <div class="p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
          <h4 class="font-semibold text-sm mb-1">Gen X (Ages 44-59)</h4>
          <p class="text-xs mb-2"><strong>Giving Behavior:</strong> Research-driven, values efficiency, gives to multiple causes</p>
          <p class="text-xs mb-1"><strong>Best Channels:</strong> Email campaigns, personal outreach, workplace giving, online donations</p>
          <p class="text-xs mb-1"><strong>Values:</strong> Fiscal responsibility, proven results, local impact</p>
          <p class="text-xs"><strong>Example Ask:</strong> "Your $500 investment creates measurable outcomes—see our impact dashboard"</p>
        </div>
        
        <div class="p-3 border-l-4 border-green-500 bg-green-50 rounded">
          <h4 class="font-semibold text-sm mb-1">Baby Boomers (Ages 60-78)</h4>
          <p class="text-xs mb-2"><strong>Giving Behavior:</strong> Relationship-focused, larger gifts, legacy giving, board service</p>
          <p class="text-xs mb-1"><strong>Best Channels:</strong> In-person meetings, direct mail, phone calls, planned giving</p>
          <p class="text-xs mb-1"><strong>Values:</strong> Personal connection, mission alignment, community roots</p>
          <p class="text-xs"><strong>Example Ask:</strong> "Would you consider a leadership gift of $5,000 to establish the [Name] Scholarship Fund?"</p>
        </div>
        
        <div class="p-3 border-l-4 border-amber-500 bg-amber-50 rounded">
          <h4 class="font-semibold text-sm mb-1">Silent Generation (Ages 79+)</h4>
          <p class="text-xs mb-2"><strong>Giving Behavior:</strong> Loyal givers, planned giving, estate bequests, memorial gifts</p>
          <p class="text-xs mb-1"><strong>Best Channels:</strong> Personal visits, phone calls, direct mail, legacy society invitations</p>
          <p class="text-xs mb-1"><strong>Values:</strong> Tradition, stewardship, leaving a legacy</p>
          <p class="text-xs"><strong>Example Ask:</strong> "Have you considered including [Organization] in your estate planning?"</p>
        </div>
      </div>
      
      <h3 class="font-semibold mb-2 text-sm">Demographic & Cultural Considerations:</h3>
      <ul class="list-disc ml-6 mb-3 text-xs space-y-1">
        <li><strong>BIPOC Communities:</strong> Often prefer grassroots giving circles, community-based asks, authentic cultural representation</li>
        <li><strong>Women Donors:</strong> Increasingly powerful giving force; seek collaborative approaches, relationship-building, and clear impact</li>
        <li><strong>LGBTQ+ Donors:</strong> Value authentic allyship, inclusive language, and support for intersectional issues</li>
        <li><strong>Religious Communities:</strong> Faith-based giving through congregations, tithing practices, mission alignment</li>
        <li><strong>Corporate Donors:</strong> Follow formal processes, employee engagement programs, matching gifts, sponsorship opportunities</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">Tailoring Your Approach:</h3>
      <table class="w-full border-collapse mb-3 text-xs">
        <thead>
          <tr class="bg-slate-100">
            <th class="border p-2 text-left">Demographic</th>
            <th class="border p-2 text-left">Communication Style</th>
            <th class="border p-2 text-left">Gift Range</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border p-2">Young Professionals</td>
            <td class="border p-2">Text, social media, video</td>
            <td class="border p-2">$10-$100 recurring</td>
          </tr>
          <tr>
            <td class="border p-2">Established Professionals</td>
            <td class="border p-2">Email, phone, in-person</td>
            <td class="border p-2">$500-$5,000</td>
          </tr>
          <tr>
            <td class="border p-2">Major Donors</td>
            <td class="border p-2">Personal meetings, events</td>
            <td class="border p-2">$5,000-$50,000+</td>
          </tr>
          <tr>
            <td class="border p-2">Foundations</td>
            <td class="border p-2">Formal proposals, reports</td>
            <td class="border p-2">$10,000-$500,000+</td>
          </tr>
        </tbody>
      </table>
      
      <div class="p-2 bg-blue-50 rounded text-xs">
        <strong>Remember:</strong> These are patterns, not rules. Each donor is an individual—get to know their personal preferences and motivations.
      </div>
    `
  },
  {
    id: 'fundraising_ask_practice',
    section: 'fundraising',
    title: 'Crafting Your Ask',
    type: 'worksheet',
    fields: [
      {
        id: 'target_donor_profile',
        type: 'textarea',
        label: 'Describe your target donor (age, interests, capacity):',
        rows: 3
      },
      {
        id: 'donor_research',
        type: 'textarea',
        label: "What have you learned about this donor's giving priorities?",
        rows: 3
      },
      {
        id: 'specific_ask_amount',
        type: 'input',
        label: 'Specific amount you will request:'
      },
      {
        id: 'impact_statement',
        type: 'textarea',
        label: 'What will this gift accomplish? (Be specific)',
        rows: 3
      },
      {
        id: 'ask_script',
        type: 'textarea',
        label: 'Write your complete ask script:',
        rows: 6,
        placeholder: 'Thank you for meeting with me today. As you know, [Organization name]...'
      }
    ]
  },

  // SECTION 6: BUSINESS STORY
  {
    id: 'business_story_alignment',
    section: 'story',
    title: 'Business Story Alignment',
    type: 'handout',
    content: `
      <p class="mb-3 text-sm">Your business story must connect <strong>mission</strong> (why you exist) with <strong>execution</strong> (proof you deliver). Funders assess both.</p>
      
      <h3 class="font-semibold mb-2 text-sm">Key Distinction:</h3>
      <div class="mb-3 text-sm space-y-1">
        <p><strong>Outcomes</strong> = Change you create (matters most for grants)</p>
        <p><strong>Deliverables</strong> = Products/services you provide (matters most for contracts)</p>
      </div>
      
      <div class="space-y-2 text-sm mb-3">
        <div class="p-2 bg-blue-50 rounded">
          <strong>Grant Example:</strong> "Reduce food insecurity for 500 families through nutrition education and meal distribution"
        </div>
        <div class="p-2 bg-green-50 rounded">
          <strong>Contract Example:</strong> "Deliver 10,000 prepared meals monthly to designated sites with nutritional tracking"
        </div>
      </div>
      
      <h3 class="font-semibold mb-2 text-sm">What Funders Want to See:</h3>
      <ul class="list-disc ml-6 text-xs space-y-1">
        <li>Clear problem statement</li>
        <li>Defined population served</li>
        <li>Realistic capacity to deliver</li>
        <li>Measurable results or outputs</li>
        <li>Consistency between mission and execution</li>
      </ul>
      
      <p class="text-xs mt-3 p-2 bg-amber-50 rounded"><strong>Remember:</strong> Clarity + capacity + consistency matter more than passion.</p>
    `
  },
  {
    id: 'my_aligned_story',
    section: 'story',
    title: 'My Aligned Business Story',
    type: 'worksheet',
    fields: [
      {
        id: 'problem_solve',
        type: 'textarea',
        label: 'What problem do I solve?',
        rows: 3
      },
      {
        id: 'for_whom',
        type: 'textarea',
        label: 'For whom?',
        rows: 2
      },
      {
        id: 'how_consistently',
        type: 'textarea',
        label: 'How consistently can I deliver?',
        rows: 3
      },
      {
        id: 'evidence',
        type: 'textarea',
        label: 'What evidence do I have of impact/results?',
        rows: 3
      }
    ]
  },

  // SECTION 6: PITFALLS
  {
    id: 'common_pitfalls',
    section: 'pitfalls',
    title: 'Common Funding Pitfalls',
    type: 'handout',
    content: `
      <p class="mb-3 text-sm">Even strong organizations make these mistakes. Awareness helps you avoid them.</p>
      
      <div class="space-y-2 text-sm">
        <div class="p-2 border-l-4 border-red-500 bg-red-50">
          <strong>Applying Too Early:</strong> Submitting proposals before systems and documentation are ready damages credibility and wastes time.
        </div>
        <div class="p-2 border-l-4 border-orange-500 bg-orange-50">
          <strong>Overpromising Capacity:</strong> Committing beyond realistic ability leads to burnout, poor outcomes, and funder mistrust.
        </div>
        <div class="p-2 border-l-4 border-yellow-500 bg-yellow-50">
          <strong>Ignoring Reporting Requirements:</strong> If you can't track and report results, don't pursue funding yet.
        </div>
        <div class="p-2 border-l-4 border-blue-500 bg-blue-50">
          <strong>Chasing Misaligned Money:</strong> Accepting funding that doesn't fit your mission dilutes focus and wastes resources.
        </div>
        <div class="p-2 border-l-4 border-purple-500 bg-purple-50">
          <strong>Copying Without Understanding:</strong> Using templates without customization signals lack of readiness.
        </div>
      </div>
      
      <p class="mt-3 text-xs text-slate-600"><em>The learning curve is normal. Early recognition of pitfalls saves time and protects reputation.</em></p>
    `
  },

  // SECTION 7: TOOLS ORIENTATION
  {
    id: 'tools_orientation',
    section: 'tools',
    title: 'Tools Orientation',
    type: 'tips',
    content: `
      <div class="p-2 bg-red-50 border-2 border-red-500 rounded mb-3 text-xs">
        <strong>🚫 NOT Provided:</strong> Proposal templates, funder databases, AI tool walkthroughs, sample budgets
      </div>
      
      <p class="mb-3 text-sm">Tools support readiness—they don't replace it. Use them strategically.</p>
      
      <h3 class="font-semibold mb-2 text-sm">Common Tool Categories:</h3>
      <ul class="list-disc ml-6 mb-3 text-xs space-y-1">
        <li>Grant databases (Grants.gov, Foundation Directory)</li>
        <li>Proposal management software</li>
        <li>Budget and financial planning tools</li>
        <li>AI writing assistants (use with caution)</li>
        <li>CRM systems for funder relationships</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">When to Explore Tools:</h3>
      <ul class="list-disc ml-6 mb-3 text-xs space-y-1">
        <li>After foundational readiness is established</li>
        <li>When you have a specific, defined need</li>
        <li>When you have capacity to learn and implement</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">When NOT to Explore Tools:</h3>
      <ul class="list-disc ml-6 text-xs space-y-1">
        <li>Before building basic organizational systems</li>
        <li>As a substitute for strategy or capacity</li>
        <li>When hoping the tool will "do it for you"</li>
      </ul>
      
      <p class="text-xs mt-3 text-slate-600"><em>Tools amplify readiness. They don't create it.</em></p>
    `
  },

  // SECTION 8: CONSULTATION PREP
  {
    id: 'consultation_prep',
    section: 'consultation',
    title: 'Preparing for Your Consultation',
    type: 'consultation',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    video_description: 'Facilitator guide: Making the most of your one-on-one consultation session',
    content: `
      <p class="mb-3 text-sm">Your 1:1 consultation is a strategic readiness conversation—not a writing or search session.</p>
      
      <h3 class="font-semibold mb-2 text-sm">What to Bring:</h3>
      <ul class="list-disc ml-6 mb-3 text-xs space-y-1">
        <li>1-2 core organizational documents (mission statement, program description)</li>
        <li>Completed pre-assessment results</li>
        <li>Your top 3 strategic questions</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">What We'll Discuss:</h3>
      <ul class="list-disc ml-6 mb-3 text-xs space-y-1">
        <li>Honest assessment of your current readiness level</li>
        <li>Organizational strengths and capacity gaps</li>
        <li>Recommended next steps with realistic timelines</li>
        <li>Strategic questions about your funding pathway</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">What's NOT Included:</h3>
      <ul class="list-disc ml-6 text-xs space-y-1">
        <li>Proposal writing or editing services</li>
        <li>Funding opportunity searches</li>
        <li>Legal, financial, or tax advice</li>
      </ul>
      
      <p class="text-xs mt-3 p-2 bg-blue-50 rounded">Prepare thoughtfully to maximize your consultation time.</p>
    `
  },
  {
    id: 'consultation_questions',
    section: 'consultation',
    title: 'Consultation Question Planner',
    type: 'consultation',
    fields: [
      {
        id: 'top_questions',
        type: 'textarea',
        label: 'My top 3 questions for the consultant:',
        rows: 6,
        placeholder: '1. &#10;2. &#10;3. '
      },
      {
        id: 'biggest_uncertainty',
        type: 'textarea',
        label: 'My biggest uncertainty about funding readiness:',
        rows: 3
      },
      {
        id: 'feedback_wanted',
        type: 'textarea',
        label: 'Specific feedback I want on my documents or approach:',
        rows: 3
      }
    ]
  },

  // SECTION 9: ACTION PLANNING
  {
    id: 'readiness_action_plan',
    section: 'action',
    title: 'My Readiness Action Plan',
    type: 'worksheet',
    fields: [
      {
        id: 'action_plan_table',
        type: 'table',
        label: 'Create your action plan:',
        columns: [
          { id: 'priority', label: 'Priority (1-3)' },
          { id: 'action', label: 'Action' },
          { id: 'timeline', label: 'Timeline' },
          { id: 'support', label: 'Support Needed' }
        ],
        rows: 6
      }
    ]
  },
  {
    id: 'what_success_looks_like',
    section: 'action',
    title: 'What Success Looks Like for Me',
    type: 'worksheet',
    fields: [
      {
        id: 'ready_means',
        type: 'textarea',
        label: 'What being "funding ready" means for my business:',
        rows: 4
      },
      {
        id: 'will_stop',
        type: 'textarea',
        label: 'What I will STOP doing:',
        rows: 3
      },
      {
        id: 'will_focus',
        type: 'textarea',
        label: 'What I will FOCUS on next:',
        rows: 3
      }
    ]
  },

  // SECTION 10: COMPLETION
  {
    id: 'program_completion',
    section: 'completion',
    title: 'Program Completion & What\'s Next',
    type: 'handout',
    content: `
      <h3 class="font-semibold mb-2 text-sm">Congratulations! You've Completed:</h3>
      <div class="space-y-1 mb-3 text-xs">
        <p>✅ All program sessions</p>
        <p>✅ Pre-assessment and post-assessment</p>
        <p>✅ One-on-one consultation</p>
        <p>✅ Required document submissions</p>
        <p>✅ Post-program feedback survey</p>
      </div>
      
      <p class="mb-3 text-sm">You'll receive a certificate of completion and be eligible for the program giveaway.</p>
      
      <h3 class="font-semibold mb-2 text-sm">What's Next?</h3>
      <ul class="list-disc ml-6 text-xs space-y-1 mb-3">
        <li>Implement your readiness action plan</li>
        <li>Continue building organizational systems</li>
        <li>Pursue aligned funding opportunities strategically</li>
        <li>Stay connected with the IncubateHer community</li>
      </ul>
      
      <div class="p-2 bg-green-50 rounded text-sm">
        <strong>You've Got This!</strong> You're equipped to pursue funding with clarity and confidence.
      </div>
    `
  },
  {
    id: 'completion_incentive',
    section: 'completion',
    title: 'Completion Incentive',
    type: 'handout',
    content: `
      <div class="p-2 bg-amber-50 border border-amber-200 rounded mb-3 text-xs text-center">
        ⚠️ <strong>ADMIN-CONTROLLED</strong> - Revealed after program completion
      </div>
      
      <div class="text-center">
        <h3 class="text-xl font-bold text-[#E5C089] mb-2">🎁 Completion Giveaway</h3>
        <p class="text-sm mb-3">As a program completer, you're eligible for a randomized drawing!</p>
        
        <p class="text-sm mb-2"><strong>Prize:</strong> Complimentary grant-writing consultation session with EIS</p>
        
        <div class="p-2 bg-red-50 border border-red-200 rounded text-xs mb-2">
          <strong>Important:</strong> Non-federal grants only • Random selection • No guarantee of winning • No cash value
        </div>
        
        <p class="text-xs text-slate-600 mb-2">Winner will be announced at the completion ceremony.</p>
        <p class="text-xs text-slate-500">All completion requirements must be met to be eligible.</p>
      </div>
    `
  },

  // BACK MATTER
  {
    id: 'notes',
    section: 'back_matter',
    title: 'Notes & Reflections',
    type: 'worksheet',
    fields: [
      {
        id: 'general_notes',
        type: 'textarea',
        label: 'Use this space for your notes, reflections, and key takeaways:',
        rows: 15,
        placeholder: 'Write your thoughts here...'
      }
    ]
  }
];

// Helper to get pages by section
export const getPagesBySection = (section) => {
  return WORKBOOK_PAGES.filter(page => page.section === section);
};

// Helper to get all sections
export const getSections = () => {
  const sections = [...new Set(WORKBOOK_PAGES.map(page => page.section))];
  return sections.map(section => ({
    id: section,
    name: section.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    pages: getPagesBySection(section)
  }));
};