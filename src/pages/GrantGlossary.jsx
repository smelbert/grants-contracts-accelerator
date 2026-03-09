import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen } from 'lucide-react';

const GLOSSARY_TERMS = [
  // IRS / Legal / Organizational
  { term: '501(c)(3)', category: 'Legal', definition: 'Section of IRS code that exempts charitable, religious, scientific, literary, and educational organizations from federal taxation and enables them to receive tax-deductible donations.' },
  { term: '990', category: 'Legal', definition: 'IRS return for exempt organizations with more than $50,000 in revenue to report information annually.' },
  { term: '990-N (E-Postcard)', category: 'Legal', definition: 'IRS e-return for exempt organizations with less than $50,000 in revenue to report information annually.' },
  { term: '990-PF', category: 'Legal', definition: 'IRS return for exempt organizations with private foundation status to report information annually.' },
  { term: '990-T', category: 'Legal', definition: 'IRS form for nonprofits to report unrelated business income.' },
  { term: 'Bylaws', category: 'Legal', definition: 'Rules governing the internal operation of a corporation or nonprofit organization. They determine the method for selection of directors, committees, and conduct of board meetings.' },
  { term: 'Determination Letter', category: 'Legal', definition: 'Letter from the IRS to a nonprofit organization notifying them that the nonprofit has achieved "exempt" status.' },
  { term: 'Unrelated Business Income (UBI)', category: 'Legal', definition: 'Income earned by a nonprofit from activities not substantially related to its tax-exempt mission, which may be subject to taxation.' },
  { term: 'CAGE Code', category: 'Legal', definition: 'A five-character code that identifies organizations planning to do business with the federal government, assigned through SAM.gov.' },
  { term: 'SAM.gov', category: 'Legal', definition: 'System for Award Management — the official U.S. government website where organizations must register to do business with the federal government or apply for federal grants and contracts.' },

  // Grant Fundamentals
  { term: 'Grant', category: 'Grants', definition: 'A financial donation that becomes a legal contract between a grantor and grantee for the grantee to carry out proposed activities within a certain time frame.' },
  { term: 'Award', category: 'Grants', definition: 'Agreements including grants, cooperative agreements, and contracts — but not technical assistance.' },
  { term: 'Award Letter', category: 'Grants', definition: 'Letter from a grantor to a grantee committing grant funds.' },
  { term: 'Grantor', category: 'Grants', definition: 'A user registered on behalf of their federal grant-making agency to post funding opportunities or manage submissions to those opportunities.' },
  { term: 'Grantee', category: 'Grants', definition: 'An organization or individual that receives a grant from a grantor and is responsible for implementing the funded project or program.' },
  { term: 'Grant Writer', category: 'Grants', definition: 'A person who writes proposals, applications, or letters for an organization to receive a grant award.' },
  { term: 'E-Grant', category: 'Grants', definition: 'An online application submitted to receive a grant.' },
  { term: 'Foundation', category: 'Grants', definition: 'A legal entity created from donated funds which are distributed as grants to nonprofit organizations or individuals. Contributions to the foundation are tax-deductible to the donor (within limits); must pay out 5% of last year\'s assets.' },
  { term: 'Close Date', category: 'Grants', definition: 'Designated deadline by which applications or proposals will be accepted.' },
  { term: 'Cover Letter', category: 'Grants', definition: 'Written on letterhead from the organization applying for a grant; accompanies a full proposal.' },
  { term: 'Letter of Inquiry (LOI)', category: 'Grants', definition: 'A brief letter or document submitted to a funder before a full proposal to gauge interest in funding a project. Many foundations require an LOI before inviting a full application.' },
  { term: 'Letter of Intent', category: 'Grants', definition: 'A formal notice submitted to a funder indicating your organization plans to apply for a specific grant opportunity.' },
  { term: 'Budget', category: 'Grants', definition: 'The financial plan for the project or organization, outlining projected revenues and expenditures.' },
  { term: 'Budget Narrative', category: 'Grants', definition: 'A written explanation that justifies each line item in a grant budget, providing context for how funds will be used.' },
  { term: 'Match / Cost Share', category: 'Grants', definition: 'Funds or in-kind contributions provided by the grantee or a third party to supplement grant funds. Some funders require a match as a condition of the award.' },
  { term: 'In-Kind Contributions', category: 'Grants', definition: 'Non-cash contributions (such as volunteer time, donated goods, or services) that support a project and may count toward match requirements.' },
  { term: 'Indirect Costs', category: 'Grants', definition: 'Organizational overhead costs (e.g., rent, utilities, administrative staff) not directly tied to a project but necessary for operations. Often expressed as a percentage called the indirect cost rate.' },
  { term: 'Direct Costs', category: 'Grants', definition: 'Costs that are specifically attributable to a grant-funded project, such as salaries for project staff, supplies, and travel.' },

  // Proposal & Application
  { term: 'Grant Proposal', category: 'Proposals', definition: 'A formal written request submitted to a funder requesting financial support for a specific project, program, or organizational need.' },
  { term: 'Request for Proposals (RFP)', category: 'Proposals', definition: 'A formal document issued by a funder or government agency soliciting proposals from organizations that can meet specified requirements.' },
  { term: 'Request for Qualifications (RFQ)', category: 'Proposals', definition: 'A document requesting information about an organization\'s qualifications and experience, often a precursor to an RFP in government contracting.' },
  { term: 'Request for Information (RFI)', category: 'Proposals', definition: 'A preliminary document used to gather information from potential vendors or applicants before issuing a formal solicitation.' },
  { term: 'Statement of Need', category: 'Proposals', definition: 'A section of a grant proposal that articulates the problem or gap in services the project will address, supported by data and evidence.' },
  { term: 'Program Narrative', category: 'Proposals', definition: 'The main written body of a grant application describing the project\'s goals, objectives, activities, timeline, and evaluation plan.' },
  { term: 'Logic Model', category: 'Proposals', definition: 'A visual or written framework that shows the logical relationships between inputs, activities, outputs, and outcomes of a program.' },
  { term: 'Outputs', category: 'Proposals', definition: 'The direct products or deliverables of grant-funded activities (e.g., number of workshops held, people trained).' },
  { term: 'Outcomes', category: 'Proposals', definition: 'The short- or long-term changes or benefits that result from grant-funded activities (e.g., increased knowledge, improved skills, policy change).' },
  { term: 'Impact', category: 'Proposals', definition: 'The long-term, lasting change in conditions resulting from a program or project, often broader than immediate outcomes.' },
  { term: 'Evaluation Plan', category: 'Proposals', definition: 'A description of how the project will measure its success, including data collection methods, metrics, and who is responsible for evaluation.' },
  { term: 'SMART Goals', category: 'Proposals', definition: 'Goals that are Specific, Measurable, Achievable, Relevant, and Time-bound — commonly required in grant proposals.' },
  { term: 'Sustainability Plan', category: 'Proposals', definition: 'A section of a grant proposal explaining how the organization will continue the project or its impact after grant funding ends.' },
  { term: 'Boilerplate', category: 'Proposals', definition: 'Standard pre-written text about an organization (mission, history, capacity) used across multiple grant applications.' },
  { term: 'Capability Statement', category: 'Proposals', definition: 'A document that outlines an organization\'s qualifications, experience, and capacity to perform the work described in a proposal or contract.' },

  // Contracts
  { term: 'Contract', category: 'Contracts', definition: 'A legally binding agreement between two or more parties in which services are delivered in exchange for payment. Unlike grants, contracts involve procurement of specific deliverables.' },
  { term: 'Cooperative Agreement', category: 'Contracts', definition: 'A type of federal award similar to a grant, but where the federal agency has substantial involvement in the program activities.' },
  { term: 'Sole Source Contract', category: 'Contracts', definition: 'A contract awarded without competitive bidding because only one vendor can fulfill the requirements.' },
  { term: 'Subcontract', category: 'Contracts', definition: 'An agreement between a prime contractor and a third party (subcontractor) to perform a portion of the work outlined in the original contract.' },
  { term: 'Memorandum of Understanding (MOU)', category: 'Contracts', definition: 'A formal agreement between two or more parties outlining roles, responsibilities, and expectations for collaboration — often required in grant applications as evidence of partnerships.' },
  { term: 'Scope of Work (SOW)', category: 'Contracts', definition: 'A detailed description of the tasks, deliverables, timelines, and responsibilities associated with a contract or grant-funded project.' },
  { term: 'Deliverables', category: 'Contracts', definition: 'Specific, tangible products or results that must be completed and submitted as part of a contract or grant agreement.' },
  { term: 'Performance Period', category: 'Contracts', definition: 'The designated time frame during which grant or contract activities must be completed.' },
  { term: 'No-Cost Extension', category: 'Contracts', definition: 'A formal request to extend the performance period of a grant or contract without additional funding, typically to complete project activities.' },

  // Reporting & Compliance
  { term: 'Progress Report', category: 'Reporting', definition: 'A regular report submitted by a grantee to a funder documenting activities completed, outcomes achieved, and funds expended during a reporting period.' },
  { term: 'Final Report', category: 'Reporting', definition: 'A comprehensive report submitted at the end of a grant period summarizing all activities, outcomes, and financial expenditures.' },
  { term: 'Financial Report', category: 'Reporting', definition: 'A report detailing how grant funds were spent, often required at set intervals and at grant close-out.' },
  { term: 'Audit', category: 'Reporting', definition: 'An independent examination of an organization\'s financial records to verify accuracy and compliance. Organizations spending $750,000+ in federal funds annually must have a Single Audit.' },
  { term: 'Single Audit (A-133 Audit)', category: 'Reporting', definition: 'A comprehensive audit required for non-federal entities that expend $750,000 or more in federal awards in a year.' },
  { term: 'Grant Close-Out', category: 'Reporting', definition: 'The process of wrapping up a grant, including submitting final reports, returning unused funds, and confirming all requirements have been met.' },

  // Funders & Eligibility
  { term: 'Private Foundation', category: 'Funders', definition: 'A nonprofit organization that makes grants to other organizations or individuals. Typically funded by a single source (family, corporation) and required to distribute 5% of assets annually.' },
  { term: 'Community Foundation', category: 'Funders', definition: 'A public charity that manages charitable funds and endowments created by many donors to support a specific geographic community.' },
  { term: 'Corporate Foundation', category: 'Funders', definition: 'A private foundation established and funded by a corporation to carry out charitable giving, separate from corporate giving programs.' },
  { term: 'Fiscal Sponsor', category: 'Funders', definition: 'A nonprofit organization that provides legal and financial oversight for a project or group that does not have its own 501(c)(3) status, allowing them to receive tax-deductible donations and grants.' },
  { term: 'Eligibility', category: 'Funders', definition: 'The criteria an organization must meet to apply for a specific grant or contract, which may include organization type, location, size, and mission focus.' },
  { term: 'DUNS Number / UEI', category: 'Funders', definition: 'Unique Entity Identifier (UEI) — replaced the DUNS number as the standard identifier for organizations doing business with the federal government via SAM.gov.' },
];

const CATEGORIES = ['All', 'Legal', 'Grants', 'Proposals', 'Contracts', 'Reporting', 'Funders'];

const CATEGORY_COLORS = {
  Legal: 'bg-purple-100 text-purple-800',
  Grants: 'bg-blue-100 text-blue-800',
  Proposals: 'bg-green-100 text-green-800',
  Contracts: 'bg-orange-100 text-orange-800',
  Reporting: 'bg-red-100 text-red-800',
  Funders: 'bg-teal-100 text-teal-800',
};

export default function GrantGlossary() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = GLOSSARY_TERMS.filter(item => {
    const matchSearch = !search ||
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    return matchSearch && matchCat;
  }).sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#143A50] text-white px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-[#E5C089]" />
            <h1 className="text-3xl font-bold">Grant Glossary</h1>
          </div>
          <p className="text-slate-300 text-sm">
            Key terms and definitions for grants, contracts, proposals, and nonprofit compliance.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms or definitions..."
            className="pl-10 bg-white"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat
                  ? 'bg-[#143A50] text-white border-[#143A50]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500">{filtered.length} term{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Terms */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.term} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-[#143A50] text-base">{item.term}</h3>
                <Badge className={`${CATEGORY_COLORS[item.category]} text-xs flex-shrink-0`}>
                  {item.category}
                </Badge>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">{item.definition}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No terms match your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}