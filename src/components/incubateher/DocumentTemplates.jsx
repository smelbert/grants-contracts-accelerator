import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, CheckCircle2 } from 'lucide-react';

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

  const handleDownload = (templateId) => {
    // Placeholder for download functionality
    console.log(`Downloading template: ${templateId}`);
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
                  onClick={() => handleDownload(template.id)}
                  className="w-full bg-[#E5C089] text-[#143A50] hover:bg-[#E5C089]/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
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
    </div>
  );
}