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
        <h2 class="text-xl text-[#AC1A5B]">Preparing for Grants & Contracts</h2>
        <p class="text-sm text-slate-500 mt-6">Funded by Columbus Urban League | Delivered by Elbert Innovative Solutions</p>
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
      <p class="mb-4">Your companion guide for building funding readiness. Connects to sessions, assessments, and consultation.</p>
      
      <h3 class="font-semibold mb-2">What This IS</h3>
      <ul class="list-disc ml-6 mb-4 text-sm">
        <li>Self-assessment tool</li>
        <li>Preparation guide</li>
        <li>Planning framework</li>
      </ul>
      
      <h3 class="font-semibold mb-2">What This IS NOT</h3>
      <ul class="list-disc ml-6 mb-4 text-sm">
        <li>Grant writing service</li>
        <li>Funding database</li>
        <li>Success guarantee</li>
      </ul>
      
      <h3 class="font-semibold mb-2">Icon Guide</h3>
      <div class="text-sm space-y-1">
        <p>📝 <strong>Worksheet</strong> - Fill in responses</p>
        <p>📄 <strong>Handout</strong> - Reference material</p>
        <p>💡 <strong>Tips</strong> - Guidance only</p>
        <p>🎯 <strong>Consultation</strong> - Prep for 1:1</p>
      </div>
    `
  },
  {
    id: 'learning_outcomes',
    section: 'front_matter',
    title: 'Learning Outcomes & Completion Criteria',
    type: 'handout',
    content: `
      <h3 class="font-semibold mb-2">You Will Learn To</h3>
      <ul class="list-disc ml-6 mb-4 text-sm space-y-1">
        <li>Understand grants vs. contracts</li>
        <li>Assess your funding readiness</li>
        <li>Identify required documents and systems</li>
        <li>Align your business story</li>
        <li>Avoid common pitfalls</li>
        <li>Read and respond to RFPs</li>
      </ul>
      
      <h3 class="font-semibold mb-2">To Complete</h3>
      <div class="text-sm space-y-1">
        <p>✅ Attend all sessions</p>
        <p>✅ Complete pre & post assessments</p>
        <p>✅ Complete 1:1 consultation</p>
        <p>✅ Submit required documents</p>
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
      <table class="w-full border-collapse mb-4 text-sm">
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
            <td class="border p-2">Fund mission</td>
            <td class="border p-2">Pay for deliverables</td>
          </tr>
          <tr>
            <td class="border p-2"><strong>Who Reviews</strong></td>
            <td class="border p-2">Program officers</td>
            <td class="border p-2">Procurement staff</td>
          </tr>
          <tr>
            <td class="border p-2"><strong>Flexibility</strong></td>
            <td class="border p-2">Some</td>
            <td class="border p-2">Strict timelines</td>
          </tr>
          <tr>
            <td class="border p-2"><strong>Reporting</strong></td>
            <td class="border p-2">Narrative</td>
            <td class="border p-2">Performance metrics</td>
          </tr>
        </tbody>
      </table>
      
      <h3 class="font-semibold mb-2 text-sm">Common Myths</h3>
      <ul class="list-disc ml-6 text-sm space-y-1">
        <li>"Grants are free money" → They require work</li>
        <li>"Only big orgs do contracts" → False</li>
        <li>"Nonprofits can't contract" → Many do</li>
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
      <p class="mb-4 text-sm">Funding readiness = <strong>systems, documentation, capacity</strong> (not passion or need)</p>
      
      <div class="space-y-3 text-sm">
        <div class="p-3 bg-blue-50 rounded">
          <strong>Legal:</strong> Formal entity, EIN, bank account
        </div>
        <div class="p-3 bg-green-50 rounded">
          <strong>Financial:</strong> Budget, statements, expense tracking
        </div>
        <div class="p-3 bg-purple-50 rounded">
          <strong>Documentation:</strong> Mission, programs, outcomes
        </div>
        <div class="p-3 bg-amber-50 rounded">
          <strong>Capacity:</strong> Staff time, delivery ability
        </div>
        <div class="p-3 bg-red-50 rounded">
          <strong>Compliance:</strong> Reporting, tracking, deadlines
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
      <div class="space-y-2 text-sm">
        <div class="p-2 border-l-4 border-blue-500 bg-slate-50">
          <strong>Business Overview:</strong> Mission, history, impact
        </div>
        <div class="p-2 border-l-4 border-green-500 bg-slate-50">
          <strong>Program Description:</strong> What, how, who benefits
        </div>
        <div class="p-2 border-l-4 border-purple-500 bg-slate-50">
          <strong>Budget:</strong> Operating + program-specific
        </div>
        <div class="p-2 border-l-4 border-amber-500 bg-slate-50">
          <strong>Outcomes:</strong> Results achieved, deliverables
        </div>
        <div class="p-2 border-l-4 border-red-500 bg-slate-50">
          <strong>Policies:</strong> Governance, financial, HR
        </div>
      </div>
      
      <div class="mt-4 p-3 bg-amber-50 rounded text-sm">
        <strong>Key:</strong> Grants emphasize <em>mission</em>. Contracts emphasize <em>capacity</em>.
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
      <h3 class="font-semibold mb-2 text-sm">Budgets Show:</h3>
      <ul class="list-disc ml-6 mb-4 text-sm space-y-1">
        <li>You know true costs</li>
        <li>You manage money responsibly</li>
        <li>You've planned realistically</li>
        <li>You track by program</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">Common Mistakes:</h3>
      <ul class="list-disc ml-6 mb-4 text-sm space-y-1">
        <li>Underestimate indirect costs</li>
        <li>Forget evaluation costs</li>
        <li>Unrealistic personnel time</li>
        <li>Copy without understanding</li>
      </ul>
      
      <div class="text-sm">
        <p><strong>Grants:</strong> Flexible, fund operations</p>
        <p><strong>Contracts:</strong> Fixed price, strict deliverables</p>
      </div>
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
      <p class="mb-3 text-sm"><strong>RFP =</strong> Formal bid process for contracted services (government, large orgs)</p>
      
      <h3 class="font-semibold mb-2 text-sm">Contracts vs. Grants:</h3>
      <ul class="list-disc ml-6 mb-3 text-sm space-y-1">
        <li>Payment for delivery (not mission support)</li>
        <li>Strict deliverables & deadlines</li>
        <li>Close monitoring</li>
        <li>Penalties for non-performance</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">RFPs Test Your:</h3>
      <ul class="list-disc ml-6 mb-3 text-sm space-y-1">
        <li>Ability to read complex requirements</li>
        <li>Systems to deliver</li>
        <li>Deadline management</li>
        <li>Pricing knowledge</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">Red Flags:</h3>
      <ul class="list-disc ml-6 text-sm space-y-1">
        <li>Unrealistic timelines/budgets</li>
        <li>Vague deliverables</li>
        <li>Requirements you can't meet</li>
        <li>Unclear payment terms</li>
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
      <p class="mb-3 text-sm"><strong>Mission</strong> = why you exist. <strong>Execution</strong> = proof you can deliver. Funders need both.</p>
      
      <div class="mb-3 text-sm">
        <p><strong>Outcomes:</strong> Change you create (grants)</p>
        <p><strong>Deliverables:</strong> Products/services (contracts)</p>
      </div>
      
      <div class="space-y-2 text-sm">
        <div class="p-2 bg-blue-50 rounded">
          <strong>Grant:</strong> "Reduce food insecurity for 500 families"
        </div>
        <div class="p-2 bg-green-50 rounded">
          <strong>Contract:</strong> "Provide 10,000 meals/month"
        </div>
      </div>
      
      <div class="mt-3 p-2 bg-amber-50 rounded text-sm">
        <strong>Remember:</strong> Clarity, capacity, consistency > passion
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
      <div class="space-y-2 text-sm">
        <div class="p-2 border-l-4 border-red-500 bg-red-50">
          <strong>Too Early:</strong> Applying before systems are ready damages credibility
        </div>
        <div class="p-2 border-l-4 border-orange-500 bg-orange-50">
          <strong>Overpromise:</strong> Leads to burnout and funder mistrust
        </div>
        <div class="p-2 border-l-4 border-yellow-500 bg-yellow-50">
          <strong>Ignore Reporting:</strong> Can't track = don't apply
        </div>
        <div class="p-2 border-l-4 border-blue-500 bg-blue-50">
          <strong>Misaligned $:</strong> Dilutes focus, wastes resources
        </div>
      </div>
      
      <p class="mt-3 text-sm italic">Learning curve is normal. Recognize pitfalls early.</p>
    `
  },

  // SECTION 7: TOOLS ORIENTATION
  {
    id: 'tools_orientation',
    section: 'tools',
    title: 'Tools Orientation',
    type: 'tips',
    content: `
      <div class="p-3 bg-red-50 border-2 border-red-500 rounded mb-4 text-sm">
        <strong>🚫 NOT Included:</strong> Templates, samples, databases, AI walkthroughs
      </div>
      
      <h3 class="font-semibold mb-2 text-sm">Tool Types:</h3>
      <ul class="list-disc ml-6 mb-3 text-sm space-y-1">
        <li>Grant databases (Grants.gov)</li>
        <li>Proposal software</li>
        <li>Budget templates</li>
        <li>AI assistants (use cautiously)</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">Explore When:</h3>
      <ul class="list-disc ml-6 mb-3 text-sm space-y-1">
        <li>Readiness is built</li>
        <li>You have specific need</li>
        <li>You have capacity to learn</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">Don't Explore When:</h3>
      <ul class="list-disc ml-6 text-sm space-y-1">
        <li>Before basic readiness</li>
        <li>As strategy substitute</li>
        <li>Hoping tool does it for you</li>
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
      <h3 class="font-semibold mb-2 text-sm">Bring:</h3>
      <ul class="list-disc ml-6 mb-3 text-sm space-y-1">
        <li>1-2 core docs</li>
        <li>Pre-assessment</li>
        <li>Top questions</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">We'll Cover:</h3>
      <ul class="list-disc ml-6 mb-3 text-sm space-y-1">
        <li>Honest readiness assessment</li>
        <li>Strengths & gaps</li>
        <li>Next steps & timeline</li>
        <li>Your strategic questions</li>
      </ul>
      
      <h3 class="font-semibold mb-2 text-sm">NOT Included:</h3>
      <ul class="list-disc ml-6 text-sm space-y-1">
        <li>Proposal writing</li>
        <li>Funding searches</li>
        <li>Legal/financial advice</li>
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
      <h3 class="font-semibold mb-2 text-sm">You Completed:</h3>
      <div class="space-y-1 mb-4 text-sm">
        <p>✅ All sessions</p>
        <p>✅ Pre & post assessments</p>
        <p>✅ One-on-one consultation</p>
        <p>✅ Document submission</p>
      </div>
      
      <p class="mb-3 text-sm">You'll receive a certificate of completion.</p>
      
      <p class="mb-3 text-sm"><strong>Remember:</strong> Funding readiness is a journey. Keep building systems and pursuing aligned opportunities.</p>
      
      <div class="p-3 bg-green-50 rounded text-sm">
        <strong>You've Got This!</strong> You're positioned to pursue funding strategically.
      </div>
    `
  },
  {
    id: 'completion_incentive',
    section: 'completion',
    title: 'Completion Incentive',
    type: 'handout',
    content: `
      <div class="p-3 bg-amber-50 border border-amber-200 rounded mb-4 text-xs text-center">
        ⚠️ <strong>ADMIN-CONTROLLED</strong> - Revealed after completion
      </div>
      
      <div class="text-center">
        <h3 class="text-xl font-bold text-[#E5C089] mb-3">🎁 Completion Giveaway</h3>
        <p class="text-sm mb-4">You're eligible for a randomized drawing!</p>
        
        <p class="text-sm mb-3"><strong>Prize:</strong> Complimentary grant-writing consultation with EIS</p>
        
        <div class="p-3 bg-red-50 border border-red-200 rounded text-xs mb-3">
          <strong>Restrictions:</strong> Non-federal only • Random selection • No guarantee • No cash value
        </div>
        
        <p class="text-xs text-slate-600">Winner announced at completion ceremony</p>
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