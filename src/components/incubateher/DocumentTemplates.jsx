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
    queryKey: ['organization-profile', enrollment?.id],
    queryFn: async () => {
      if (!enrollment?.id) return null;
      const profiles = await base44.entities.Organization.filter({
        enrollment_id: enrollment.id
      });
      return profiles[0];
    },
    enabled: !!enrollment?.id
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

  // Merge all workbook responses into one object
  const allWorkbookData = workbookResponses.reduce((acc, resp) => {
    return { ...acc, [resp.page_id]: resp.responses };
  }, {});

  const { data: customTemplates = [] } = useQuery({
    queryKey: ['document-templates'],
    queryFn: () => base44.entities.DocumentTemplate.filter({ day })
  });

  const handleEdit = (template) => {
    // Add predefined fields based on template type
    const templateWithFields = {
      ...template,
      fields: getTemplateFields(template.id)
    };
    setEditingTemplate(templateWithFields);
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
        { id: 'organization_name', label: 'Organization Name', type: 'input', required: true },
        { id: 'core_competencies', label: 'Core Competencies', type: 'textarea', required: true, rows: 4, aiPrompt: 'List 3-5 core competencies and capabilities' },
        { id: 'differentiators', label: 'What Sets You Apart', type: 'textarea', required: true, rows: 3, aiPrompt: 'Describe unique differentiators' },
        { id: 'past_performance', label: 'Past Performance Examples', type: 'textarea', required: true, rows: 4, aiPrompt: 'Describe 2-3 relevant past projects or contracts' },
        { id: 'certifications', label: 'Certifications & Registrations', type: 'textarea', rows: 2, placeholder: 'e.g., MBE, WBE, SAM.gov UEI' },
        { id: 'contact_info', label: 'Contact Information', type: 'textarea', rows: 2, placeholder: 'Phone, email, website' }
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
        />
      )}
    </div>
  );
}