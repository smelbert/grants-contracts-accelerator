import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, CheckCircle2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import EditableDocumentTemplate from './EditableDocumentTemplate';

const DOCUMENT_TEMPLATES = {
  day1: [
    {
      id: 'org-overview',
      title: 'One-Page Organizational Overview',
      description: 'Reusable for grants, contracts, capability statements, and partnerships',
      includes: ['Mission/service focus', 'Target population', 'Services/products', 'Geographic area', 'Years in operation', 'Leadership', 'Contact information']
    },
    {
      id: 'capability-statement',
      title: 'Capability Statement',
      description: 'Essential for LLCs pursuing contracts and subcontracts',
      includes: ['Core competencies', 'Differentiators', 'Past performance', 'Certifications', 'Contact information']
    },
    {
      id: 'funding-pathway',
      title: 'Funding Pathway Strategy Worksheet',
      description: 'Clarify your path: grants, contracts, subcontracts, or mix',
      includes: ['Pathway assessment', 'Capacity evaluation', 'Timeline planning', 'Decision framework']
    },
    {
      id: 'policy-starter',
      title: 'Basic Policy Starter List',
      description: 'Essential policies for fundable organizations',
      includes: ['Conflict of interest policy', 'Financial controls', 'Board governance outline', 'Non-discrimination statement']
    }
  ],
  day2: [
    {
      id: 'program-description',
      title: 'Program/Service Description Sheet',
      description: 'Clear program descriptions for grant narratives',
      includes: ['Problem addressed', 'Target population', 'Activities', 'Intended outcomes']
    },
    {
      id: 'budget-template',
      title: 'Basic Budget Template',
      description: 'Program-level budget with proper categories',
      includes: ['Personnel costs', 'Supplies', 'Program costs', 'Indirect costs', 'Total budget']
    },
    {
      id: 'expense-tracking',
      title: 'Expense Tracking Log',
      description: 'Track spending by project and funding source',
      includes: ['Date', 'Vendor', 'Category', 'Project', 'Amount', 'Funding source']
    },
    {
      id: 'data-collection',
      title: 'Data Collection Plan',
      description: 'System for collecting and reporting outcomes',
      includes: ['Data to collect', 'Collection methods', 'Roles', 'Storage', 'Review frequency']
    },
    {
      id: 'client-intake',
      title: 'Client Intake Form',
      description: 'Capture demographics and service data',
      includes: ['Demographics', 'Service provided', 'Date', 'Consent', 'Outcome tracking']
    },
    {
      id: 'inkind-tracker',
      title: 'In-Kind Donation Tracker',
      description: 'Track non-cash contributions required for reporting and matching funds',
      includes: ['Volunteer hours (with hourly rate)', 'Donated goods & materials', 'Pro-bono services', 'Donated space/facilities', 'Equipment loans', 'Total estimated value']
    }
  ],
  day3: [
    {
      id: 'logic-model',
      title: 'Logic Model Template',
      description: 'Visual map of your program theory',
      includes: ['Inputs', 'Activities', 'Outputs', 'Outcomes', 'Impact']
    },
    {
      id: 'sustainability-plan',
      title: 'Sustainability Plan Outline',
      description: 'Long-term funding strategy framework',
      includes: ['Revenue mix', 'Renewal strategy', 'Partnership plan', 'Cost containment']
    },
    {
      id: 'subcontracting-sheet',
      title: 'Subcontracting Positioning Sheet',
      description: 'Showcase capacity to prime contractors',
      includes: ['Services offered', 'Past performance', 'Capacity', 'Insurance', 'Certifications']
    },
    {
      id: 'rfp-outline',
      title: 'RFP Response Outline',
      description: 'Standard structure for solicitations',
      includes: ['Executive summary', 'Scope response', 'Staffing plan', 'Budget summary', 'Compliance attachments']
    },
    {
      id: 'reporting-calendar',
      title: 'Reporting Calendar',
      description: 'Track all deadlines and requirements',
      includes: ['Application deadlines', 'Report due dates', 'Renewal windows', 'Board review cycles']
    }
  ]
};

const DOCUMENTS_TO_GATHER = {
  day1: {
    title: 'Legal & Structure Documents',
    items: [
      'EIN confirmation letter',
      'Articles of incorporation/formation',
      'Operating agreement (LLC) or Bylaws (nonprofit)',
      'W-9',
      'Business license (if required)',
      'Certificate of Good Standing',
      'Insurance certificate',
      'SAM.gov registration (if applicable)',
      '501(c)(3) determination letter (nonprofits)',
      'Most recent 990 (nonprofits)',
      'Board list and minutes (nonprofits)'
    ]
  },
  day2: {
    title: 'Financial & Data Documents',
    items: [
      'Last 6-12 months bank statements',
      'Most recent financial statements',
      'Profit & Loss statement',
      'Balance sheet',
      'Payroll records (if applicable)',
      'Vendor agreements',
      'Lease agreement',
      'Annual budget (nonprofits)',
      'Audit (if applicable)',
      'Board-approved financials'
    ]
  },
  day3: {
    title: 'Strategy & Positioning Documents',
    items: [
      'Letters of support',
      'Partnership MOUs',
      'Staff resumes',
      'Contractor agreements',
      'Insurance riders',
      'Photo consent forms',
      'Client testimonial releases',
      'Data privacy statement',
      'Board conflict of interest disclosures',
      'Vendor registration confirmations',
      'UEI number'
    ]
  }
};

export default function DocumentTemplates({ day }) {
  const templates = DOCUMENT_TEMPLATES[day] || [];
  const gatherDocs = DOCUMENTS_TO_GATHER[day];
  const [editingTemplate, setEditingTemplate] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: enrollment } = useQuery({
    queryKey: ['incubateher-enrollment', user?.email],
    queryFn: async () => {
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
      return enrollments[0];
    },
    enabled: !!user?.email
  });

  const { data: organizationProfile } = useQuery({
    queryKey: ['organization-profile', enrollment?.id, user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      if (enrollment?.id) {
        const byEnrollment = await base44.entities.Organization.filter({ enrollment_id: enrollment.id });
        if (byEnrollment[0]) return byEnrollment[0];
      }
      const byEmail = await base44.entities.Organization.filter({ primary_contact_email: user.email });
      return byEmail[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: workbookResponses = [] } = useQuery({
    queryKey: ['workbook-responses', enrollment?.id],
    queryFn: async () => {
      if (!enrollment?.id) return [];
      return await base44.entities.WorkbookResponse.filter({
        enrollment_id: enrollment.id
      });
    },
    enabled: !!enrollment?.id
  });

  const { data: uploadedDocs = [] } = useQuery({
    queryKey: ['uploaded-docs', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.DocumentSubmission.filter({
        user_email: user.email,
        program_id: 'incubateher'
      });
    },
    enabled: !!user?.email
  });

  // Merge all workbook responses into one object
  const allWorkbookData = workbookResponses.reduce((acc, resp) => {
    return { ...acc, [resp.page_id]: resp.responses };
  }, {});

  // Merge extracted data from uploaded documents
  const extractedDocData = uploadedDocs.reduce((acc, doc) => {
    if (doc.extracted_data) {
      return { ...acc, ...doc.extracted_data };
    }
    return acc;
  }, {});

  const { data: customTemplates = [] } = useQuery({
    queryKey: ['document-templates'],
    queryFn: () => base44.entities.DocumentTemplate.filter({ day })
  });

  const handleEdit = (template) => {
    // Check if custom template exists from admin
    const customTemplate = customTemplates.find(ct => ct.template_id === template.id);
    
    if (customTemplate) {
      // Use custom template with fields from admin or fallback to predefined
      const templateWithFields = {
        ...template,
        ...customTemplate,
        fields: customTemplate.fields || getTemplateFields(template.id)
      };
      setEditingTemplate(templateWithFields);
    } else {
      // Use predefined template structure
      const templateWithFields = {
        ...template,
        fields: getTemplateFields(template.id)
      };
      setEditingTemplate(templateWithFields);
    }
  };

  const getTemplateFields = (templateId) => {
    const fieldMappings = {
      'org-overview': [
        { id: 'organization_name', label: 'Organization Name', type: 'input', required: true, placeholder: 'Enter organization name' },
        { id: 'mission', label: 'Mission Statement', type: 'textarea', required: true, rows: 3, placeholder: 'Your mission statement', aiPrompt: 'Write a compelling mission statement' },
        { id: 'target_population', label: 'Target Population', type: 'textarea', required: true, rows: 2, placeholder: 'Who do you serve?' },
        { id: 'programs', label: 'Services/Programs Offered', type: 'textarea', required: true, rows: 3, placeholder: 'Describe your programs' },
        { id: 'service_area', label: 'Geographic Area Served', type: 'input', required: true, placeholder: 'e.g., Franklin County, Ohio' },
        { id: 'years_operating', label: 'Years in Operation', type: 'input', placeholder: 'e.g., Since 2015' },
        { id: 'executive_director', label: 'Executive Director/CEO', type: 'input', placeholder: 'Name' },
        { id: 'phone', label: 'Contact Phone', type: 'input', placeholder: '(555) 123-4567' },
        { id: 'address', label: 'Mailing Address', type: 'textarea', rows: 2, placeholder: 'Full address' }
      ],
      'capability-statement': [
        { id: 'organization_name', label: 'Organization Name', type: 'input', required: true, placeholder: 'Your organization name' },
        { id: 'duns', label: 'DUNS Number', type: 'input', placeholder: 'e.g., 215803654' },
        { id: 'cage', label: 'CAGE Code', type: 'input', placeholder: 'e.g., 8GLI5' },
        { id: 'naics_codes', label: 'NAICS Codes', type: 'textarea', rows: 6, placeholder: 'Enter each code with description on separate lines:\n541330 - Engineering Services\n561110 - Office Administrative Services' },
        { id: 'certifications', label: 'Certifications', type: 'textarea', rows: 4, placeholder: 'List certifications (one per line):\nAWS Certified Solutions Architect\nLean Six Sigma Green Belt\nISO 9001 Certification' },
        { id: 'about_us', label: 'About Us', type: 'textarea', required: true, rows: 6, aiPrompt: 'Write a compelling 2-3 paragraph description of the organization, its history, mission, and what it does' },
        { id: 'core_competencies', label: 'Core Competencies', type: 'textarea', required: true, rows: 6, placeholder: 'List core competencies (one per line):\nProject Management\nTechnical Expertise\nStrategic Planning\nData Analysis', aiPrompt: 'List 5-8 core competencies that demonstrate organizational capabilities' },
        { id: 'differentiators', label: 'Differentiators (What Sets You Apart)', type: 'textarea', required: true, rows: 8, placeholder: 'List with brief descriptions:\n• Innovative Solutions: We use cutting-edge technology for tailored client solutions.\n• Experienced Team: Our veterans provide extensive expertise across sectors.', aiPrompt: 'Describe 5-10 key differentiators that make this organization unique, with brief explanations for each' },
        { id: 'past_performance_1_title', label: 'Project 1 - Title', type: 'input', placeholder: 'Smart City Infrastructure Development' },
        { id: 'past_performance_1_client', label: 'Project 1 - Client', type: 'input', placeholder: 'City of Springfield' },
        { id: 'past_performance_1_location', label: 'Project 1 - Location', type: 'input', placeholder: 'Springfield, IL' },
        { id: 'past_performance_1_duration', label: 'Project 1 - Duration', type: 'input', placeholder: 'January 2021 - December 2022' },
        { id: 'past_performance_1_description', label: 'Project 1 - Description', type: 'textarea', rows: 3, placeholder: 'Developed smart traffic systems to optimize flow and reduce congestion with IoT integration.' },
        { id: 'past_performance_2_title', label: 'Project 2 - Title', type: 'input', placeholder: 'Renewable Energy Integration' },
        { id: 'past_performance_2_client', label: 'Project 2 - Client', type: 'input', placeholder: 'GreenTech Solutions' },
        { id: 'past_performance_2_location', label: 'Project 2 - Location', type: 'input', placeholder: 'Denver, CO' },
        { id: 'past_performance_2_duration', label: 'Project 2 - Duration', type: 'input', placeholder: 'March 2020 - June 2021' },
        { id: 'past_performance_2_description', label: 'Project 2 - Description', type: 'textarea', rows: 3, placeholder: 'Implemented renewable energy solutions that reduced client energy costs by 30%.' },
        { id: 'past_performance_3_title', label: 'Project 3 - Title', type: 'input', placeholder: 'Advanced Data Analytics for Healthcare' },
        { id: 'past_performance_3_client', label: 'Project 3 - Client', type: 'input', placeholder: 'HealthFirst Medical Center' },
        { id: 'past_performance_3_location', label: 'Project 3 - Location', type: 'input', placeholder: 'Austin, TX' },
        { id: 'past_performance_3_duration', label: 'Project 3 - Duration', type: 'input', placeholder: 'August 2019 - February 2020' },
        { id: 'past_performance_3_description', label: 'Project 3 - Description', type: 'textarea', rows: 3, placeholder: 'Developed and implemented data analytics solutions to improve patient care and operational efficiency.' },
        { id: 'website', label: 'Website', type: 'input', placeholder: 'www.yourorganization.com' },
        { id: 'address', label: 'Address', type: 'input', placeholder: '2416 Stallion Road, Winchester, KY' },
        { id: 'phone', label: 'Phone', type: 'input', placeholder: '(555) 825-8926' },
        { id: 'email', label: 'Email', type: 'input', placeholder: 'info@yourorganization.com' }
      ],
      'program-description': [
        { id: 'program_name', label: 'Program Name', type: 'input', required: true },
        { id: 'problem_addressed', label: 'Problem/Need Addressed', type: 'textarea', required: true, rows: 4, aiPrompt: 'Describe the community problem this program addresses' },
        { id: 'target_population', label: 'Target Population', type: 'textarea', required: true, rows: 2 },
        { id: 'activities', label: 'Program Activities', type: 'textarea', required: true, rows: 4, aiPrompt: 'Describe key program activities and how they work' },
        { id: 'outcomes', label: 'Intended Outcomes', type: 'textarea', required: true, rows: 3, aiPrompt: 'List measurable outcomes this program will achieve' }
      ],
      'logic-model': [
        { id: 'program_name', label: 'Program Name', type: 'input', required: true },
        { id: 'inputs', label: 'Inputs (Resources)', type: 'textarea', required: true, rows: 3, placeholder: 'Staff, funding, space, equipment' },
        { id: 'activities', label: 'Activities (What You Do)', type: 'textarea', required: true, rows: 3, placeholder: 'Services provided, actions taken' },
        { id: 'outputs', label: 'Outputs (Direct Results)', type: 'textarea', required: true, rows: 3, placeholder: 'Number served, sessions held, materials distributed' },
        { id: 'outcomes', label: 'Outcomes (Changes)', type: 'textarea', required: true, rows: 3, placeholder: 'Knowledge, skills, behaviors changed' },
        { id: 'impact', label: 'Long-Term Impact', type: 'textarea', required: true, rows: 2, placeholder: 'Community-level change' }
      ],
      'inkind-tracker': [
        { id: 'organization_name', label: 'Organization Name', type: 'input', required: true },
        { id: 'reporting_period', label: 'Reporting Period', type: 'input', placeholder: 'e.g., January 2026 – March 2026' },
        { id: 'volunteer_hours', label: 'Volunteer Hours Log', type: 'textarea', required: true, rows: 6, placeholder: 'Date | Volunteer Name | Activity | Hours | Hourly Rate | Value\n2026-01-05 | Jane Doe | Grant Writing Support | 4 hrs | $50/hr | $200\n2026-01-12 | John Smith | Event Setup | 3 hrs | $25/hr | $75' },
        { id: 'donated_goods', label: 'Donated Goods & Materials', type: 'textarea', rows: 5, placeholder: 'Date | Donor Name | Item(s) | Estimated Fair Market Value\n2026-01-10 | Office Depot | Office Supplies | $150\n2026-01-20 | Community Church | Folding Tables x10 | $300' },
        { id: 'probono_services', label: 'Pro-Bono / Professional Services', type: 'textarea', rows: 5, placeholder: 'Date | Provider | Service | Hours | Rate | Value\n2026-02-01 | ABC Law Firm | Legal Review | 2 hrs | $200/hr | $400' },
        { id: 'donated_space', label: 'Donated Space / Facilities', type: 'textarea', rows: 4, placeholder: 'Date(s) | Location | Purpose | Hours Used | Market Rate | Value\n2026-01-15 | Community Center Room B | Training Session | 3 hrs | $75/hr | $225' },
        { id: 'equipment_loans', label: 'Equipment / Technology Loans', type: 'textarea', rows: 4, placeholder: 'Date | Donor | Item | Duration | Estimated Value\n2026-02-10 | TechCorp | Laptop x2 | 1 month | $200' },
        { id: 'total_summary', label: 'Summary Notes / Total Estimated Value', type: 'textarea', rows: 3, placeholder: 'Add up all categories and note how this in-kind support connects to your grant match requirements or program costs.' }
      ],
      'sustainability-plan': [
        { id: 'organization_name', label: 'Organization Name', type: 'input', required: true },
        { id: 'revenue_mix', label: 'Revenue Diversification Strategy', type: 'textarea', required: true, rows: 4, aiPrompt: 'Describe how you will diversify funding sources over 3 years' },
        { id: 'renewal_strategy', label: 'Funder Renewal Strategy', type: 'textarea', required: true, rows: 3, aiPrompt: 'How will you maintain relationships with current funders?' },
        { id: 'partnerships', label: 'Strategic Partnerships', type: 'textarea', required: true, rows: 3, aiPrompt: 'Identify potential partners to strengthen sustainability' },
        { id: 'cost_containment', label: 'Cost Containment Measures', type: 'textarea', required: true, rows: 3, aiPrompt: 'How will you control costs and operate efficiently?' }
      ]
    };

    return fieldMappings[templateId] || [
      { id: 'organization_name', label: 'Organization Name', type: 'input', required: true },
      { id: 'content', label: 'Document Content', type: 'textarea', required: true, rows: 10 }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Templates to Create */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#143A50]" />
          📁 Documents to CREATE (Templates Provided)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template, idx) => (
            <Card key={template.id} className="border-l-4 border-[#E5C089]">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-[#143A50] text-white">{idx + 1}️⃣</Badge>
                </div>
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Includes:</p>
                  <ul className="text-sm space-y-1">
                    {template.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  onClick={() => handleEdit(template)}
                  className="w-full bg-[#E5C089] text-[#143A50] hover:bg-[#E5C089]/90"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit & Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Documents to Gather */}
      {gatherDocs && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#AC1A5B]" />
            📎 Documents to GATHER
          </h3>
          <Card className="border-l-4 border-[#AC1A5B]">
            <CardHeader>
              <CardTitle>{gatherDocs.title}</CardTitle>
              <CardDescription>
                Organize these in your Funding Readiness Vault
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {gatherDocs.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#AC1A5B] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Funding Readiness Vault Structure */}
      {day === 'day3' && (
        <Card className="bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white">
          <CardHeader>
            <CardTitle className="text-2xl">📂 Your Funding Readiness Vault</CardTitle>
            <CardDescription className="text-white/80">
              Organize everything in this folder structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <p className="text-[#E5C089]">📁 Funding Readiness Vault/</p>
              <p className="ml-4">├─ 📁 Legal & Structure</p>
              <p className="ml-4">├─ 📁 Financial</p>
              <p className="ml-4">├─ 📁 Program & Data</p>
              <p className="ml-4">├─ 📁 Policies</p>
              <p className="ml-4">├─ 📁 Proposals & Applications</p>
              <p className="ml-4">├─ 📁 Contracts</p>
              <p className="ml-4">└─ 📁 Certifications</p>
            </div>
            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <p className="font-semibold mb-2">By the end of this training, you should have:</p>
              <ul className="space-y-1 text-sm">
                <li>✔ A completed document inventory</li>
                <li>✔ At least 3-5 newly drafted templates</li>
                <li>✔ A structured funding folder</li>
                <li>✔ A clarified funding pathway</li>
                <li>✔ A budget draft</li>
                <li>✔ A logic model draft</li>
                <li>✔ A sustainability outline</li>
                <li>✔ A data collection plan</li>
              </ul>
              <p className="mt-4 text-[#E5C089] font-bold text-center">That is real readiness.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editable Template Dialog */}
      {editingTemplate && (
        <EditableDocumentTemplate
          template={editingTemplate}
          open={!!editingTemplate}
          onOpenChange={(open) => !open && setEditingTemplate(null)}
          organizationProfile={organizationProfile}
          workbookResponses={allWorkbookData}
          uploadedDocsData={extractedDocData}
        />
      )}
    </div>
  );
}