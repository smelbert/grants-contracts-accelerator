import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen } from 'lucide-react';

const TERMS = [
  // Grant Writing & Fundraising
  { term: 'Abstract', definition: 'A brief summary of a grant proposal, typically 1–2 paragraphs, highlighting the project purpose, goals, and requested amount.', category: 'Grant Writing' },
  { term: 'Annual Fund', definition: 'A yearly fundraising campaign that provides unrestricted operating support for an organization.', category: 'Fundraising' },
  { term: 'Bequest', definition: 'A gift left to a nonprofit through a donor\'s will or estate plan.', category: 'Advancement' },
  { term: 'Boilerplate', definition: 'Standard, reusable text describing an organization\'s mission, history, and programs used across multiple grant applications.', category: 'Grant Writing' },
  { term: 'Budget Narrative', definition: 'A written explanation of each line item in a grant budget, justifying costs and linking them to project activities.', category: 'Grant Writing' },
  { term: 'Capacity Building', definition: 'Funding or activities that strengthen an organization\'s infrastructure, systems, or staff capabilities rather than direct program delivery.', category: 'Grants' },
  { term: 'Capital Campaign', definition: 'A time-limited, intensive fundraising effort to raise a specific amount for a major project such as a building or endowment.', category: 'Fundraising' },
  { term: 'Challenge Grant', definition: 'A grant that requires the recipient to raise matching funds from other sources before the grant is released.', category: 'Grants' },
  { term: 'Community Foundation', definition: 'A public charity that manages charitable funds and makes grants to nonprofits in a specific geographic area.', category: 'Funders' },
  { term: 'Competitive Grant', definition: 'A grant awarded through a merit-based review process where multiple applicants compete for limited funding.', category: 'Grants' },
  { term: 'Contract', definition: 'An agreement in which an organization is paid to deliver specific services or products, unlike a grant which is a gift.', category: 'Contracts' },
  { term: 'Corporate Foundation', definition: 'A private foundation established and funded by a for-profit corporation to make charitable grants.', category: 'Funders' },
  { term: 'Cultivation', definition: 'The process of building relationships with prospective donors or funders before making a formal ask.', category: 'Advancement' },
  { term: 'Deliverables', definition: 'Specific, measurable outputs or outcomes that a grantee agrees to produce as part of a funded project.', category: 'Grant Writing' },
  { term: 'Direct Costs', definition: 'Expenses that can be specifically attributed to a grant-funded project, such as staff salaries and supplies.', category: 'Finance' },
  { term: 'Discretionary Grant', definition: 'A grant awarded at the discretion of a program officer or board, not through a competitive process.', category: 'Grants' },
  { term: 'Donor Stewardship', definition: 'Ongoing relationship management with donors to express gratitude, report impact, and encourage future giving.', category: 'Advancement' },
  { term: 'EIN', definition: 'Employer Identification Number — a federal tax ID number required for nonprofits to receive grants and conduct financial transactions.', category: 'Compliance' },
  { term: 'Endowment', definition: 'A fund where the principal is invested and only the interest/earnings are used, providing long-term financial stability.', category: 'Finance' },
  { term: 'Evaluation Plan', definition: 'A description of how a project\'s success will be measured, including methods, data collection, and reporting.', category: 'Grant Writing' },
  { term: 'Family Foundation', definition: 'A private foundation funded and often governed by members of a single family.', category: 'Funders' },
  { term: 'Feasibility Study', definition: 'Research conducted before a capital campaign to assess donor readiness and the likelihood of reaching a fundraising goal.', category: 'Fundraising' },
  { term: 'Fiscal Sponsorship', definition: 'An arrangement where an established nonprofit extends its tax-exempt status to a project or group that lacks its own 501(c)(3) status.', category: 'Compliance' },
  { term: 'Formula Grant', definition: 'A grant distributed according to a set formula, often based on population, poverty rate, or other data.', category: 'Grants' },
  { term: 'Funder', definition: 'An organization or individual that provides financial support through grants, contracts, or donations.', category: 'Funders' },
  { term: 'General Operating Support', definition: 'Unrestricted funding that can be used for any organizational expense, including overhead, staff, or administration.', category: 'Grants' },
  { term: 'Gift Range Chart', definition: 'A table used in campaign planning that shows the number and size of gifts needed at each level to reach a fundraising goal.', category: 'Fundraising' },
  { term: 'Grant Cycle', definition: 'The recurring process a funder uses to accept, review, and award grants, typically on annual or quarterly schedules.', category: 'Process' },
  { term: 'Grant Management', definition: 'The process of tracking, reporting, and complying with requirements associated with awarded grant funds.', category: 'Process' },
  { term: 'Grantee', definition: 'The organization or individual that receives grant funding.', category: 'Process' },
  { term: 'Grantor', definition: 'The organization or individual that awards grant funding.', category: 'Process' },
  { term: 'Impact Metrics', definition: 'Quantitative and qualitative measures used to demonstrate the outcomes and effectiveness of a program.', category: 'Grant Writing' },
  { term: 'In-Kind Contribution', definition: 'Non-cash support such as donated goods, services, or volunteer time that can count toward a match requirement.', category: 'Finance' },
  { term: 'Indirect Costs', definition: 'Overhead expenses shared across multiple projects, such as rent, utilities, and administrative salaries.', category: 'Finance' },
  { term: 'Institutional Funder', definition: 'A foundation, government agency, or corporation that awards grants, as opposed to an individual donor.', category: 'Funders' },
  { term: 'Invitational Grant', definition: 'A grant where an organization must be invited by the funder to submit a proposal.', category: 'Grants' },
  { term: 'LGBTQ+ Affirming Funder', definition: 'A funder that explicitly supports organizations serving LGBTQ+ communities or led by LGBTQ+ individuals.', category: 'Equity' },
  { term: 'LOI (Letter of Inquiry)', definition: 'A brief document submitted to a funder to gauge interest before submitting a full proposal.', category: 'Process' },
  { term: 'Logic Model', definition: 'A visual framework showing the logical links between a program\'s inputs, activities, outputs, and outcomes.', category: 'Grant Writing' },
  { term: 'Major Gift', definition: 'A significant donation, the threshold for which varies by organization, typically requiring personalized cultivation and solicitation.', category: 'Fundraising' },
  { term: 'Matching Grant', definition: 'A grant that requires the recipient to raise equal or proportional funds from other sources.', category: 'Grants' },
  { term: 'Memorandum of Understanding (MOU)', definition: 'A formal agreement between organizations outlining roles, responsibilities, and expectations in a partnership.', category: 'Compliance' },
  { term: 'Mission Alignment', definition: 'The degree to which a grant opportunity\'s goals match the applicant organization\'s stated mission and work.', category: 'Strategy' },
  { term: 'Moves Management', definition: 'A systematic approach to moving donors through stages of engagement — from identification to cultivation to solicitation to stewardship.', category: 'Advancement' },
  { term: 'Narrative', definition: 'The written portion of a grant application that tells the story of an organization\'s need, plan, and capacity.', category: 'Grant Writing' },
  { term: 'Needs Statement', definition: 'A section of a grant proposal that documents the problem or need the project will address, supported by data.', category: 'Grant Writing' },
  { term: 'Non-Competing Continuation', definition: 'A renewal of grant funding that does not require recompetition, typically contingent on satisfactory progress.', category: 'Process' },
  { term: 'Nonprofit Status', definition: 'A tax-exempt designation under IRS section 501(c)(3) allowing organizations to receive tax-deductible donations and most grants.', category: 'Compliance' },
  { term: 'Objectives', definition: 'Specific, measurable steps that will lead to achieving a project\'s broader goals.', category: 'Grant Writing' },
  { term: 'Overhead', definition: 'Administrative and operational costs not directly tied to programs, including rent, utilities, and general staff.', category: 'Finance' },
  { term: 'Pass-Through Funding', definition: 'Federal or state funds distributed to subgrantees through an intermediary organization.', category: 'Grants' },
  { term: 'Philanthropic Investment', definition: 'Charitable giving viewed through the lens of expected social return rather than financial profit.', category: 'Advancement' },
  { term: 'Planned Giving', definition: 'Charitable donations made through estate plans, trusts, or other deferred financial instruments.', category: 'Advancement' },
  { term: 'Private Foundation', definition: 'A nonprofit funded primarily by a single source (individual, family, or corporation) that makes grants to public charities.', category: 'Funders' },
  { term: 'Program Officer', definition: 'A staff member at a foundation who reviews applications, advises applicants, and recommends grants for approval.', category: 'Process' },
  { term: 'Program-Related Investment (PRI)', definition: 'A loan or investment from a foundation used to advance its charitable mission, not counted against payout requirements.', category: 'Finance' },
  { term: 'Project Budget', definition: 'A detailed financial plan showing all income and expenses for a grant-funded project.', category: 'Finance' },
  { term: 'Prospect Research', definition: 'The process of identifying and gathering information about potential donors or funders to assess giving capacity and interest.', category: 'Advancement' },
  { term: 'Public Charity', definition: 'A nonprofit that receives substantial funding from the public, government, or a variety of sources — eligible for most grants.', category: 'Compliance' },
  { term: 'Public Fund', definition: 'Money administered by a government agency or public institution and distributed through competitive or formula processes.', category: 'Grants' },
  { term: 'RFP (Request for Proposals)', definition: 'A formal announcement by a funder inviting organizations to submit proposals for a specific funding opportunity.', category: 'Process' },
  { term: 'RFQ (Request for Qualifications)', definition: 'A solicitation asking organizations to demonstrate their qualifications before being invited to submit a full proposal or bid.', category: 'Contracts' },
  { term: 'Readiness Assessment', definition: 'An evaluation of an organization\'s capacity, compliance, and documentation needed to successfully apply for and manage grants.', category: 'Strategy' },
  { term: 'Recurring Giving', definition: 'Automatic, scheduled donations made by supporters on a monthly, quarterly, or annual basis.', category: 'Fundraising' },
  { term: 'Reporting Requirements', definition: 'Funder-mandated updates and documentation demonstrating how grant funds were used and what was accomplished.', category: 'Process' },
  { term: 'Restricted Funds', definition: 'Donations or grants that must be used for a specific purpose designated by the funder.', category: 'Finance' },
  { term: 'Rolling Deadline', definition: 'A grant with no fixed deadline — applications are accepted and reviewed on an ongoing basis.', category: 'Process' },
  { term: 'SMART Goals', definition: 'Goals that are Specific, Measurable, Achievable, Relevant, and Time-bound — a standard framework in grant writing.', category: 'Grant Writing' },
  { term: 'Seed Funding', definition: 'Initial grant funding provided to launch a new project, program, or organization.', category: 'Grants' },
  { term: 'Social Return on Investment (SROI)', definition: 'A framework for measuring the social, environmental, and economic value created by a program relative to its cost.', category: 'Strategy' },
  { term: 'Solicitation', definition: 'A formal or informal request for a gift or grant, tailored to a specific donor or funder.', category: 'Advancement' },
  { term: 'Statement of Need', definition: 'Another term for Needs Statement — evidence that a community problem exists and requires intervention.', category: 'Grant Writing' },
  { term: 'Subgrant', definition: 'A grant awarded by a primary grantee to another organization to carry out part of the funded project.', category: 'Grants' },
  { term: 'Sustainability Plan', definition: 'A description of how a project or program will continue to operate after grant funding ends.', category: 'Grant Writing' },
  { term: 'Theory of Change', definition: 'A detailed explanation of how and why a set of activities is expected to lead to desired long-term outcomes.', category: 'Strategy' },
  { term: 'Unrestricted Funds', definition: 'Donations or grants with no designated purpose — the organization can use them for any legitimate expense.', category: 'Finance' },
  { term: 'Work Plan', definition: 'A timeline and task list showing how and when grant-funded activities will be completed.', category: 'Grant Writing' },
];

const CATEGORIES = ['All', ...Array.from(new Set(TERMS.map(t => t.category))).sort()];

const CATEGORY_COLORS = {
  'Grant Writing': 'bg-blue-100 text-blue-700',
  'Fundraising': 'bg-pink-100 text-pink-700',
  'Advancement': 'bg-purple-100 text-purple-700',
  'Grants': 'bg-green-100 text-green-700',
  'Funders': 'bg-amber-100 text-amber-700',
  'Finance': 'bg-teal-100 text-teal-700',
  'Compliance': 'bg-red-100 text-red-700',
  'Process': 'bg-slate-100 text-slate-700',
  'Contracts': 'bg-orange-100 text-orange-700',
  'Strategy': 'bg-indigo-100 text-indigo-700',
  'Equity': 'bg-rose-100 text-rose-700',
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GrantGlossary() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [activeLetter, setActiveLetter] = useState(null);

  const filtered = TERMS.filter(t => {
    const matchSearch = !search || t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || t.category === category;
    const matchLetter = !activeLetter || t.term.toUpperCase().startsWith(activeLetter);
    return matchSearch && matchCat && matchLetter;
  }).sort((a, b) => a.term.localeCompare(b.term));

  const availableLetters = new Set(TERMS.map(t => t.term[0].toUpperCase()));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-[#143A50] text-white px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-7 h-7 text-[#E5C089]" />
            <h1 className="text-3xl font-bold">Grant & Fundraising Glossary</h1>
          </div>
          <p className="text-white/70 text-sm max-w-xl">
            A comprehensive reference of grant writing, fundraising, and advancement terminology.
          </p>
          <p className="text-[#E5C089] text-sm mt-2 font-medium">{TERMS.length} terms across {CATEGORIES.length - 1} categories</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Search & Filter */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search terms..."
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveLetter(null); }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-[#143A50] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* A-Z Nav */}
        <div className="flex flex-wrap gap-1">
          {ALPHABET.map(letter => (
            <button
              key={letter}
              disabled={!availableLetters.has(letter)}
              onClick={() => setActiveLetter(activeLetter === letter ? null : letter)}
              className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                activeLetter === letter
                  ? 'bg-[#E5C089] text-[#143A50]'
                  : availableLetters.has(letter)
                  ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-50 text-slate-300 cursor-not-allowed'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500">{filtered.length} term{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Terms */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No terms found. Try adjusting your search.</p>
            </div>
          ) : (
            filtered.map(term => (
              <div key={term.term} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-[#143A50] text-base">{term.term}</h3>
                  <Badge className={`${CATEGORY_COLORS[term.category] || 'bg-slate-100 text-slate-600'} border-0 text-xs flex-shrink-0`}>
                    {term.category}
                  </Badge>
                </div>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">{term.definition}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}