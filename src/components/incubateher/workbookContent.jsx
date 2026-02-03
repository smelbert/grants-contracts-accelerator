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
      <div class="text-center space-y-6 py-8">
        <h1 class="text-4xl font-bold text-[#143A50]">IncubateHer Funding Readiness Workbook</h1>
        <h2 class="text-2xl text-[#AC1A5B]">Preparing for Grants & Contracts</h2>
        <p class="text-lg text-slate-600">Co-branded: Elbert Innovative Solutions × Columbus Urban League</p>
        <div class="mt-8 text-sm text-slate-500">
          <p>Funded by Columbus Urban League | Delivered by Elbert Innovative Solutions</p>
        </div>
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
      <h3 class="font-semibold text-lg mb-3">Purpose</h3>
      <p class="mb-4">This workbook is your companion guide for building funding readiness. It connects directly to your group sessions, assessments, and one-on-one consultation.</p>
      
      <h3 class="font-semibold text-lg mb-3">What This Workbook IS</h3>
      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li>A self-assessment tool to identify your readiness gaps</li>
        <li>A preparation guide for grants and contracts</li>
        <li>A planning framework for your funding journey</li>
      </ul>
      
      <h3 class="font-semibold text-lg mb-3">What This Workbook IS NOT</h3>
      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li>A grant writing service or proposal template</li>
        <li>A grant search or funding database</li>
        <li>A guarantee of funding success</li>
      </ul>
      
      <h3 class="font-semibold text-lg mb-3">Icon Guide</h3>
      <div class="space-y-2">
        <p><strong>📝 Worksheet</strong> - Fill in your responses</p>
        <p><strong>📄 Handout</strong> - Reference material</p>
        <p><strong>💡 Tips-Only</strong> - Guidance and orientation</p>
        <p><strong>🎯 Consultation Tool</strong> - Preparation for your 1:1 session</p>
      </div>
    `
  },
  {
    id: 'learning_outcomes',
    section: 'front_matter',
    title: 'Learning Outcomes & Completion Criteria',
    type: 'handout',
    content: `
      <h3 class="font-semibold text-lg mb-3">Learning Outcomes</h3>
      <ul class="list-disc ml-6 mb-6 space-y-2">
        <li>Understand the real difference between grants and contracts</li>
        <li>Assess your funding readiness honestly and strategically</li>
        <li>Identify what documents and systems funders expect to see</li>
        <li>Align your business story for funding opportunities</li>
        <li>Recognize common pitfalls that cost time and reputation</li>
        <li>Read and respond to RFPs and contract solicitations</li>
      </ul>
      
      <h3 class="font-semibold text-lg mb-3">Completion Checklist</h3>
      <div class="space-y-2">
        <p>✅ Attend all program sessions</p>
        <p>✅ Complete pre-assessment</p>
        <p>✅ Complete one-on-one consultation</p>
        <p>✅ Submit required documents</p>
        <p>✅ Complete post-assessment</p>
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
    content: `
      <h3 class="font-semibold text-lg mb-3">Grants vs. Contracts</h3>
      
      <table class="w-full border-collapse mb-6">
        <thead>
          <tr class="bg-slate-100">
            <th class="border p-3 text-left">Aspect</th>
            <th class="border p-3 text-left">Grants</th>
            <th class="border p-3 text-left">Contracts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border p-3"><strong>Purpose</strong></td>
            <td class="border p-3">Fund your mission and programs</td>
            <td class="border p-3">Pay for specific deliverables</td>
          </tr>
          <tr>
            <td class="border p-3"><strong>Who Reviews</strong></td>
            <td class="border p-3">Program officers, review committees</td>
            <td class="border p-3">Procurement officers, program managers</td>
          </tr>
          <tr>
            <td class="border p-3"><strong>Flexibility</strong></td>
            <td class="border p-3">Some flexibility in execution</td>
            <td class="border p-3">Strict deliverables and timelines</td>
          </tr>
          <tr>
            <td class="border p-3"><strong>Reporting</strong></td>
            <td class="border p-3">Narrative progress reports</td>
            <td class="border p-3">Detailed performance metrics</td>
          </tr>
        </tbody>
      </table>
      
      <h3 class="font-semibold text-lg mb-3">Common Myths</h3>
      <ul class="list-disc ml-6 space-y-2">
        <li><strong>Myth:</strong> "Grants are free money" → Reality: Grants require significant work and accountability</li>
        <li><strong>Myth:</strong> "Contracts are only for big organizations" → Reality: Many contracts are sized for small providers</li>
        <li><strong>Myth:</strong> "Nonprofits can't do contracts" → Reality: Many nonprofits successfully execute contracts</li>
      </ul>
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
    content: `
      <p class="mb-4">Funding readiness is about <strong>systems, documentation, and capacity</strong> — not passion or need.</p>
      
      <h3 class="font-semibold text-lg mb-3">Core Readiness Areas</h3>
      
      <div class="space-y-4">
        <div class="p-4 bg-blue-50 rounded-lg">
          <h4 class="font-semibold mb-2">Legal Structure</h4>
          <p>Formal business entity (LLC, Corp, 501c3) with EIN, bank account, and governing documents</p>
        </div>
        
        <div class="p-4 bg-green-50 rounded-lg">
          <h4 class="font-semibold mb-2">Financial Systems</h4>
          <p>Budget, financial statements, expense tracking by program/project</p>
        </div>
        
        <div class="p-4 bg-purple-50 rounded-lg">
          <h4 class="font-semibold mb-2">Documentation</h4>
          <p>Mission statement, program descriptions, outcomes data, policies</p>
        </div>
        
        <div class="p-4 bg-amber-50 rounded-lg">
          <h4 class="font-semibold mb-2">Capacity & Operations</h4>
          <p>Staff/volunteer time, ability to deliver services, reporting capacity</p>
        </div>
        
        <div class="p-4 bg-red-50 rounded-lg">
          <h4 class="font-semibold mb-2">Compliance & Reporting</h4>
          <p>Ability to track outcomes, submit reports, meet deadlines</p>
        </div>
      </div>
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
      <h3 class="font-semibold text-lg mb-3">Essential Documents</h3>
      
      <div class="space-y-3">
        <div class="p-3 border-l-4 border-blue-500 bg-slate-50">
          <h4 class="font-semibold">Business/Organization Overview</h4>
          <p class="text-sm text-slate-600">Mission, history, who you serve, impact to date</p>
        </div>
        
        <div class="p-3 border-l-4 border-green-500 bg-slate-50">
          <h4 class="font-semibold">Program/Service Description</h4>
          <p class="text-sm text-slate-600">What you do, how you do it, who benefits</p>
        </div>
        
        <div class="p-3 border-l-4 border-purple-500 bg-slate-50">
          <h4 class="font-semibold">Budget</h4>
          <p class="text-sm text-slate-600">Annual operating budget, program-specific budgets</p>
        </div>
        
        <div class="p-3 border-l-4 border-amber-500 bg-slate-50">
          <h4 class="font-semibold">Outcomes/Deliverables</h4>
          <p class="text-sm text-slate-600">What results you've achieved, what you can deliver</p>
        </div>
        
        <div class="p-3 border-l-4 border-red-500 bg-slate-50">
          <h4 class="font-semibold">Policies/Processes</h4>
          <p class="text-sm text-slate-600">Governance, financial management, HR (as applicable)</p>
        </div>
      </div>
      
      <div class="mt-6 p-4 bg-amber-50 rounded-lg">
        <p class="font-semibold mb-2">Note:</p>
        <p class="text-sm">Grant applications emphasize <strong>mission and impact</strong>. Contract proposals emphasize <strong>capacity and deliverables</strong>.</p>
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
      <h3 class="font-semibold text-lg mb-3">What Budgets Communicate to Funders</h3>
      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li>You understand the true cost of your work</li>
        <li>You can manage money responsibly</li>
        <li>You've thought through realistic needs</li>
        <li>You can track expenses by program</li>
      </ul>
      
      <h3 class="font-semibold text-lg mb-3">Common Budget Mistakes</h3>
      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li>Underestimating indirect costs (admin, overhead)</li>
        <li>Forgetting evaluation or reporting costs</li>
        <li>Not including key personnel time realistically</li>
        <li>Copying someone else's budget without understanding it</li>
      </ul>
      
      <h3 class="font-semibold text-lg mb-3">Grants vs. Contracts Budget Differences</h3>
      <table class="w-full border-collapse">
        <tr>
          <td class="border p-3"><strong>Grants</strong></td>
          <td class="border p-3">May allow flexible line items, often fund general operating costs</td>
        </tr>
        <tr>
          <td class="border p-3"><strong>Contracts</strong></td>
          <td class="border p-3">Fixed price for specific deliverables, less flexibility</td>
        </tr>
      </table>
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
      <h3 class="font-semibold text-lg mb-3">What is an RFP?</h3>
      <p class="mb-4">A <strong>Request for Proposals (RFP)</strong> is how government agencies and large organizations solicit bids for contracted services. It's a formal process with strict requirements.</p>
      
      <h3 class="font-semibold text-lg mb-3">How Contracts Differ from Grants</h3>
      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li>Contracts are <strong>payment for services delivered</strong>, not support for your mission</li>
        <li>You must meet specific deliverables and deadlines</li>
        <li>Performance is monitored closely</li>
        <li>Non-performance can result in penalties</li>
      </ul>
      
      <h3 class="font-semibold text-lg mb-3">Why RFPs Are Capacity Tests</h3>
      <p class="mb-4">RFPs test whether you:</p>
      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li>Can read complex requirements carefully</li>
        <li>Have the systems to deliver what's asked</li>
        <li>Can meet strict deadlines</li>
        <li>Understand pricing and budgeting</li>
      </ul>
      
      <h3 class="font-semibold text-lg mb-3">Red Flags to Watch For</h3>
      <ul class="list-disc ml-6 space-y-2">
        <li>Unrealistic timelines or budgets</li>
        <li>Vague deliverables or expectations</li>
        <li>Requirements you can't meet</li>
        <li>No clear payment terms</li>
      </ul>
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

  // SECTION 5: BUSINESS STORY
  {
    id: 'business_story_alignment',
    section: 'story',
    title: 'Business Story Alignment',
    type: 'handout',
    content: `
      <h3 class="font-semibold text-lg mb-3">Mission vs. Execution</h3>
      <p class="mb-4">Funders care about <strong>both</strong>. Your mission drives why you exist. Your execution proves you can deliver.</p>
      
      <h3 class="font-semibold text-lg mb-3">Outcomes vs. Deliverables</h3>
      <table class="w-full border-collapse mb-4">
        <tr>
          <td class="border p-3"><strong>Outcomes</strong></td>
          <td class="border p-3">The change you create (grants focus)</td>
        </tr>
        <tr>
          <td class="border p-3"><strong>Deliverables</strong></td>
          <td class="border p-3">The specific products/services you provide (contracts focus)</td>
        </tr>
      </table>
      
      <h3 class="font-semibold text-lg mb-3">Grant Language vs. Contract Language</h3>
      <div class="space-y-3">
        <div class="p-3 bg-blue-50 rounded">
          <p><strong>Grant Language:</strong> "We will reduce food insecurity by serving 500 families..."</p>
        </div>
        <div class="p-3 bg-green-50 rounded">
          <p><strong>Contract Language:</strong> "We will provide 10,000 meals per month to eligible participants..."</p>
        </div>
      </div>
      
      <div class="mt-4 p-4 bg-amber-50 rounded-lg">
        <p class="font-semibold mb-2">Why Clarity Matters More Than Passion</p>
        <p class="text-sm">Funders respect passion, but they fund <strong>clarity, capacity, and consistency</strong>.</p>
      </div>
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
      <h3 class="font-semibold text-lg mb-3">Pitfalls to Avoid</h3>
      
      <div class="space-y-4">
        <div class="p-4 border-l-4 border-red-500 bg-red-50">
          <h4 class="font-semibold mb-2">Applying Too Early</h4>
          <p class="text-sm">Submitting proposals before you have the legal structure, systems, or capacity in place wastes time and damages credibility.</p>
        </div>
        
        <div class="p-4 border-l-4 border-orange-500 bg-orange-50">
          <h4 class="font-semibold mb-2">Overpromising</h4>
          <p class="text-sm">Promising what you can't deliver leads to stress, burnout, and relationship damage with funders.</p>
        </div>
        
        <div class="p-4 border-l-4 border-yellow-500 bg-yellow-50">
          <h4 class="font-semibold mb-2">Underestimating Reporting</h4>
          <p class="text-sm">Grants and contracts require regular reporting. If you can't track and report outcomes, don't apply.</p>
        </div>
        
        <div class="p-4 border-l-4 border-blue-500 bg-blue-50">
          <h4 class="font-semibold mb-2">Chasing Misaligned Dollars</h4>
          <p class="text-sm">Applying for funding that doesn't align with your mission or capacity dilutes your focus and wastes resources.</p>
        </div>
      </div>
      
      <div class="mt-6 p-4 bg-green-50 rounded-lg">
        <p class="font-semibold mb-2">Remember:</p>
        <p class="text-sm">Everyone makes mistakes when learning. The goal is to recognize pitfalls early and adjust before they become costly.</p>
      </div>
    `
  },

  // SECTION 7: TOOLS ORIENTATION
  {
    id: 'tools_orientation',
    section: 'tools',
    title: 'Tools Orientation',
    type: 'tips',
    content: `
      <div class="p-4 bg-red-50 border-2 border-red-500 rounded-lg mb-6">
        <h3 class="font-semibold text-lg mb-3 text-red-900">🚫 What This Section Does NOT Include</h3>
        <ul class="list-disc ml-6 space-y-2 text-red-800">
          <li>Grant proposal templates</li>
          <li>Application outlines or samples</li>
          <li>Grant search databases or lists</li>
          <li>Advanced project tracking systems</li>
          <li>AI writing walkthroughs</li>
        </ul>
      </div>
      
      <h3 class="font-semibold text-lg mb-3">What This Section IS</h3>
      <p class="mb-4">An <strong>orientation</strong> to the types of tools that exist for funding work, when to explore them, and when NOT to.</p>
      
      <h3 class="font-semibold text-lg mb-3">Types of Tools You'll Encounter</h3>
      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li><strong>Grant databases</strong> (Foundation Directory, Grants.gov)</li>
        <li><strong>Proposal software</strong> (project management, collaboration tools)</li>
        <li><strong>Budget templates</strong> (Excel, accounting software)</li>
        <li><strong>AI writing assistants</strong> (use with caution and fact-checking)</li>
      </ul>
      
      <h3 class="font-semibold text-lg mb-3">When to Explore Tools</h3>
      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li>After you've built readiness foundations</li>
        <li>When you have a specific need and know what you're looking for</li>
        <li>When you have capacity to learn and implement</li>
      </ul>
      
      <h3 class="font-semibold text-lg mb-3">When NOT to Explore Tools</h3>
      <ul class="list-disc ml-6 space-y-2">
        <li>Before you have basic readiness in place</li>
        <li>As a substitute for strategy and planning</li>
        <li>When you're hoping the tool will "do it for you"</li>
      </ul>
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
      <h3 class="font-semibold text-lg mb-3">What to Bring</h3>
      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li>1-2 core documents (mission statement, program description, budget)</li>
        <li>Your completed pre-assessment</li>
        <li>Your top questions or concerns about funding readiness</li>
      </ul>
      
      <h3 class="font-semibold text-lg mb-3">What the Session Will Focus On</h3>
      <ul class="list-disc ml-6 mb-4 space-y-2">
        <li>Honest assessment of your readiness level</li>
        <li>Identification of strengths and gaps</li>
        <li>Specific next steps and timeline recommendations</li>
        <li>Answering your strategic questions</li>
      </ul>
      
      <h3 class="font-semibold text-lg mb-3">What the Session Will NOT Include</h3>
      <ul class="list-disc ml-6 space-y-2">
        <li>Writing your grant proposal for you</li>
        <li>Searching for funding opportunities</li>
        <li>Legal or financial advisory services</li>
        <li>Advanced technical training</li>
      </ul>
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
      <h3 class="font-semibold text-lg mb-3">Completion Requirements Recap</h3>
      <div class="space-y-2 mb-6">
        <p>✅ Attended all required sessions</p>
        <p>✅ Completed pre-assessment and post-assessment</p>
        <p>✅ Participated in one-on-one consultation</p>
        <p>✅ Submitted required organizational documents</p>
      </div>
      
      <h3 class="font-semibold text-lg mb-3">Certificate of Completion</h3>
      <p class="mb-4">Upon completing all requirements, you'll receive a certificate recognizing your participation in the IncubateHer Funding Readiness program.</p>
      
      <h3 class="font-semibold text-lg mb-3">Moving Forward</h3>
      <p class="mb-4">Remember: Funding readiness is a <strong>journey, not a destination</strong>. Continue building your systems, refining your documents, and pursuing opportunities that align with your capacity.</p>
      
      <div class="p-4 bg-green-50 rounded-lg">
        <p class="font-semibold mb-2">You've Got This!</p>
        <p class="text-sm">The work you've done in this program positions you to pursue funding strategically and confidently. Keep going!</p>
      </div>
    `
  },
  {
    id: 'completion_incentive',
    section: 'completion',
    title: 'Completion Incentive',
    type: 'handout',
    content: `
      <div class="text-center py-8">
        <h3 class="text-2xl font-bold text-[#E5C089] mb-4">🎁 Completion Giveaway</h3>
        
        <p class="text-lg mb-6">All participants who complete program requirements are eligible for a randomized drawing!</p>
        
        <h4 class="font-semibold text-lg mb-3">Prize Details</h4>
        <p class="mb-6">Winner receives a complimentary grant-writing consultation session with EIS.</p>
        
        <h4 class="font-semibold text-lg mb-3">Eligibility Requirements</h4>
        <ul class="text-left max-w-md mx-auto list-disc ml-6 space-y-2 mb-6">
          <li>Complete all program sessions</li>
          <li>Complete pre and post assessments</li>
          <li>Complete one-on-one consultation</li>
          <li>Submit required documents</li>
        </ul>
        
        <div class="p-4 bg-amber-50 rounded-lg max-w-md mx-auto">
          <p class="text-sm"><strong>Important:</strong> Federal grants are excluded from this giveaway. Winner selection is random. No funding is guaranteed.</p>
        </div>
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