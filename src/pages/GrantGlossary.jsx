import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Lightbulb, AlertTriangle, Info } from 'lucide-react';

const GLOSSARY_TERMS = [
  // IRS / Legal
  { term: '501(c)(3)', category: 'Legal', definition: 'Section of IRS code that exempts charitable, religious, scientific, literary, and educational organizations from federal taxation and enables them to receive tax-deductible donations.', tip: 'Having 501(c)(3) status is a requirement for most private foundation grants and many government grants.' },
  { term: '990', category: 'Legal', definition: 'IRS return for exempt organizations with more than $50,000 in revenue to report information annually. This is a public document — funders regularly review 990s to assess organizational health.', tip: 'Funders use your 990 to verify financial stability, leadership salaries, and program expenses before making a grant decision.' },
  { term: '990-N (E-Postcard)', category: 'Legal', definition: 'IRS e-return for exempt organizations with less than $50,000 in revenue to report information annually. Failure to file for 3 consecutive years results in automatic revocation of tax-exempt status.' },
  { term: '990-PF', category: 'Legal', definition: 'IRS return for exempt organizations with private foundation status to report information annually, including all grants made.' },
  { term: '990-T', category: 'Legal', definition: 'IRS form for nonprofits to report unrelated business income (UBI) — income generated from activities not related to the organization\'s tax-exempt mission.' },
  { term: 'Bylaws', category: 'Legal', definition: 'Rules governing the internal operation of a corporation or nonprofit organization. They determine the method for selection of directors, committees, and conduct of board meetings.', tip: 'Most funders require a copy of your bylaws as part of a grant application. Keep them current and board-approved.' },
  { term: 'Determination Letter', category: 'Legal', definition: 'Letter from the IRS to a nonprofit organization confirming the organization has achieved "exempt" status under 501(c)(3). This is one of the most requested documents in grant applications.', tip: 'Always keep a digital copy of your determination letter — you will need it for nearly every grant application.' },
  { term: 'Unrelated Business Income (UBI)', category: 'Legal', definition: 'Income earned by a nonprofit from activities not substantially related to its tax-exempt mission. UBI may be subject to federal income tax and must be reported on Form 990-T.' },
  { term: 'CAGE Code', category: 'Legal', definition: 'A five-character alphanumeric code assigned through SAM.gov that identifies organizations planning to do business with the federal government. Required for federal contracts and grants.' },
  { term: 'SAM.gov', category: 'Legal', definition: 'System for Award Management — the official U.S. government website where organizations must register to do business with the federal government, apply for federal grants, and receive federal contracts. Registration must be renewed annually.', tip: 'Allow 7–10 business days for new SAM.gov registrations to activate. An expired SAM registration can delay or disqualify a federal application.' },
  { term: 'DUNS Number / UEI', category: 'Legal', definition: 'Unique Entity Identifier (UEI) — replaced the DUNS number in April 2022 as the standard identifier for organizations doing business with the federal government via SAM.gov. Required for all federal grants and contracts.' },

  // Grant Fundamentals
  { term: 'Grant', category: 'Grants', definition: 'A financial award that becomes a legal contract between a grantor and grantee obligating the grantee to carry out proposed activities within a defined time frame. Unlike loans, grants do not need to be repaid if terms are met.' },
  { term: 'Award', category: 'Grants', definition: 'An agreement including grants, cooperative agreements, and contracts — but not technical assistance. The term "award" is often used broadly to refer to any funding received.' },
  { term: 'Award Letter', category: 'Grants', definition: 'Official letter from a grantor to a grantee committing grant funds. This letter typically outlines the grant amount, purpose, performance period, and key reporting requirements.', tip: 'Review your award letter carefully before accepting — it may include conditions you must fulfill before funds are released.' },
  { term: 'Grantor', category: 'Grants', definition: 'The funding organization (government agency, foundation, corporation, or individual) that awards grant funds. Also called a "funder" or "funding agency."' },
  { term: 'Grantee', category: 'Grants', definition: 'An organization or individual that receives grant funds from a grantor and is legally responsible for implementing the funded project or program and meeting all reporting requirements.' },
  { term: 'Grant Writer', category: 'Grants', definition: 'A professional who researches funding opportunities and writes proposals, applications, or letters of inquiry on behalf of an organization. Can be a staff member, contractor, or consultant.' },
  { term: 'E-Grant', category: 'Grants', definition: 'An online grant application submitted through an electronic portal such as Grants.gov, GrantsConnect, or a funder\'s proprietary system.' },
  { term: 'Foundation', category: 'Grants', definition: 'A legal entity created from donated funds which distributes grants to nonprofits or individuals. Must pay out at least 5% of assets annually. Contributions are tax-deductible to donors (within IRS limits).' },
  { term: 'Close Date', category: 'Grants', definition: 'The designated deadline by which all applications or proposals must be received. Late submissions are typically rejected without review.', tip: 'Plan to submit at least 48 hours before the close date to avoid technical issues.' },
  { term: 'Cover Letter', category: 'Grants', definition: 'A one-page letter written on organizational letterhead that accompanies a full grant proposal. It introduces your organization, summarizes the funding request, and establishes a personal connection with the funder.' },
  { term: 'Letter of Inquiry (LOI)', category: 'Grants', definition: 'A 1–3 page document submitted to a funder before a full proposal to gauge interest in funding a project. Many private foundations require an LOI before inviting a full application.', tip: 'An LOI is your first impression. Keep it concise, compelling, and clearly aligned with the funder\'s priorities.' },
  { term: 'Letter of Intent', category: 'Grants', definition: 'A formal notice indicating your organization plans to apply for a specific grant opportunity. Unlike a LOI, it does not request feedback — it simply notifies the funder of your intent.' },
  { term: 'Budget', category: 'Grants', definition: 'The detailed financial plan for a grant project showing projected revenues and expenditures. A well-organized budget demonstrates fiscal responsibility and planning capacity.' },
  { term: 'Budget Narrative', category: 'Grants', definition: 'A written explanation that justifies each line item in a grant budget, explaining how costs were calculated and why they are necessary for the project.', tip: 'A strong budget narrative connects every cost to a specific project activity and demonstrates thoughtful financial planning.' },
  { term: 'Match / Cost Share', category: 'Grants', definition: 'Funds or in-kind contributions provided by the grantee or a third party to supplement grant funds. Many funders require a match (often 1:1) as a condition of the award, demonstrating organizational investment.' },
  { term: 'In-Kind Contributions', category: 'Grants', definition: 'Non-cash resources (volunteer time, donated space, equipment, or services) that support a project. These can often count toward match requirements and must be documented at fair market value.' },
  { term: 'Indirect Costs', category: 'Grants', definition: 'Organizational overhead costs (rent, utilities, HR, accounting) not directly tied to a specific project but necessary for operations. Often expressed as a percentage rate (e.g., 15% of direct costs).', tip: 'Negotiate a federally negotiated indirect cost rate (NICRA) with your cognizant federal agency to unlock overhead reimbursement from federal grants.' },
  { term: 'Direct Costs', category: 'Grants', definition: 'Costs directly attributable to a grant-funded project — such as project staff salaries, program supplies, travel, and participant costs.' },
  { term: 'Restricted Funds', category: 'Grants', definition: 'Grant funds designated by the funder for a specific purpose or project. These funds cannot legally be redirected to other uses without funder approval.', warning: 'Misuse of restricted funds is a serious legal and ethical violation that can result in grant termination and repayment demands.' },
  { term: 'Unrestricted Funds', category: 'Grants', definition: 'Funds that can be used at the organization\'s discretion for any legitimate organizational purpose. These are rarer in grant funding but highly valuable for operational flexibility.' },

  // Proposals
  { term: 'Grant Proposal', category: 'Proposals', definition: 'A formal written document submitted to a funder requesting financial support for a specific project, program, or organizational need. Typically includes a narrative, budget, and supporting attachments.' },
  { term: 'Request for Proposals (RFP)', category: 'Proposals', definition: 'A formal solicitation document issued by a funder or government agency inviting organizations to submit proposals. RFPs specify eligibility requirements, scope of work, evaluation criteria, and deadlines.', tip: 'Read the entire RFP before writing a single word. Funders use scoring rubrics — missing a required section can disqualify your application.' },
  { term: 'Request for Qualifications (RFQ)', category: 'Proposals', definition: 'A solicitation document requesting information about an organization\'s qualifications, experience, and capacity. Often used in government contracting as a precursor to an RFP.' },
  { term: 'Request for Information (RFI)', category: 'Proposals', definition: 'A preliminary document used to gather market intelligence before issuing a formal solicitation. Responding to an RFI does not guarantee an invitation to bid or apply.' },
  { term: 'Statement of Need', category: 'Proposals', definition: 'A section of a grant proposal that clearly articulates the problem or service gap the project will address, supported by current data, research, and community voice.', tip: 'Use local, current data (within 3–5 years) to demonstrate need. Generic or outdated statistics weaken your case.' },
  { term: 'Program Narrative', category: 'Proposals', definition: 'The main written body of a grant application describing the project\'s goals, objectives, activities, timeline, staffing, and evaluation plan. This is the core of your proposal.' },
  { term: 'Logic Model', category: 'Proposals', definition: 'A visual or written framework that maps the logical relationships between inputs (resources), activities, outputs (deliverables), and outcomes (changes). Many funders require a logic model as a proposal attachment.' },
  { term: 'Outputs', category: 'Proposals', definition: 'The direct, countable products of grant-funded activities — such as number of workshops delivered, participants served, or materials produced. Outputs are what you do, not the change that results.' },
  { term: 'Outcomes', category: 'Proposals', definition: 'The short- or long-term changes, benefits, or conditions that result from grant-funded activities — such as increased knowledge, improved skills, or changed behavior. Outcomes are what changes because of what you do.', tip: 'Funders increasingly prioritize outcomes over outputs. Show how your activities lead to measurable, meaningful change.' },
  { term: 'Impact', category: 'Proposals', definition: 'The broader, long-term change in conditions for a community or population that results from sustained program efforts. Impact is the "so what" beyond immediate outcomes.' },
  { term: 'Evaluation Plan', category: 'Proposals', definition: 'A section of a proposal describing how the project will measure its success, including data collection methods, evaluation tools, baseline data, and who is responsible for evaluation.' },
  { term: 'SMART Goals', category: 'Proposals', definition: 'Goals that are Specific, Measurable, Achievable, Relevant, and Time-bound. Funders expect SMART objectives that clearly define what will be accomplished and by when.', tip: 'Avoid vague language like "improve" or "increase awareness." Instead: "75% of participants will demonstrate a 20% increase in knowledge by December 2025."' },
  { term: 'Sustainability Plan', category: 'Proposals', definition: 'A section of a grant proposal explaining how the organization will continue the project\'s impact after grant funding ends — through diversified funding, earned revenue, partnerships, or institutionalization.', tip: 'Funders want to invest in lasting change, not dependency. Show a realistic, diversified plan for long-term sustainability.' },
  { term: 'Boilerplate', category: 'Proposals', definition: 'Standard, pre-written organizational content (mission, history, key accomplishments, demographics served) used across multiple grant applications with minor modifications.' },
  { term: 'Capability Statement', category: 'Proposals', definition: 'A concise document (typically 1–2 pages) showcasing an organization\'s qualifications, core competencies, past performance, and capacity to deliver on a proposal or contract.' },
  { term: 'Theory of Change', category: 'Proposals', definition: 'A comprehensive description of how and why a set of activities are expected to lead to desired outcomes. More detailed than a logic model, it explains the assumptions and preconditions behind your approach.' },

  // Contracts
  { term: 'Contract', category: 'Contracts', definition: 'A legally binding agreement in which an organization delivers specified services or products in exchange for payment. Unlike grants, contracts are procurement vehicles — the government or entity is purchasing a service.', tip: 'Understand the difference: Grants fund your mission; contracts purchase a specific outcome. Compliance obligations differ significantly.' },
  { term: 'Cooperative Agreement', category: 'Contracts', definition: 'A federal award similar to a grant, but where the funding agency maintains substantial involvement in the program activities — not just monitoring compliance.' },
  { term: 'Sole Source Contract', category: 'Contracts', definition: 'A contract awarded without a competitive bidding process because only one vendor can meet the unique requirements. Requires justification documentation.' },
  { term: 'Subcontract', category: 'Contracts', definition: 'An agreement between a prime contractor or grantee and a third party (subcontractor) to perform a defined portion of the work. The prime contractor remains responsible to the funder for all deliverables.' },
  { term: 'Memorandum of Understanding (MOU)', category: 'Contracts', definition: 'A formal written agreement between two or more organizations outlining roles, responsibilities, and expectations for a collaboration or partnership. Often required as evidence of community partnerships in grant applications.' },
  { term: 'Scope of Work (SOW)', category: 'Contracts', definition: 'A detailed description of the specific tasks, deliverables, timelines, and responsibilities for a contract or grant-funded project. The SOW is the foundation of any contract.' },
  { term: 'Deliverables', category: 'Contracts', definition: 'Specific, tangible products or results (reports, trainings, services) that must be completed and documented as part of a contract or grant agreement.' },
  { term: 'Performance Period', category: 'Contracts', definition: 'The official start and end dates during which all grant or contract activities must be completed and funds must be expended. Activities outside the performance period are not reimbursable.' },
  { term: 'No-Cost Extension (NCE)', category: 'Contracts', definition: 'A formal request to extend the performance period of a grant without additional funding — typically to allow time to complete activities delayed by unforeseen circumstances.', tip: 'Request an NCE well before the grant end date. Most funders require 30–90 days advance notice.' },
  { term: 'Liquidated Damages', category: 'Contracts', definition: 'Pre-determined financial penalties specified in a contract for failure to meet deliverables or deadlines. Common in government contracts.' },
  { term: 'Prime Contractor / Prime Grantee', category: 'Contracts', definition: 'The organization that holds the direct agreement with the funding entity and is ultimately responsible for performance, compliance, and reporting — even when work is subcontracted.' },

  // Reporting & Compliance
  { term: 'Progress Report', category: 'Reporting', definition: 'A periodic report (monthly, quarterly, or semi-annual) submitted by a grantee documenting activities completed, data collected, funds expended, and any challenges encountered.' },
  { term: 'Final Report', category: 'Reporting', definition: 'A comprehensive report submitted at grant close-out summarizing all activities, outcomes achieved, lessons learned, and a final financial accounting of all funds spent.' },
  { term: 'Financial Report', category: 'Reporting', definition: 'A report detailing actual expenditures of grant funds compared to the approved budget. Required at regular intervals and at grant close-out.' },
  { term: 'Audit', category: 'Reporting', definition: 'An independent examination of an organization\'s financial statements and internal controls to verify accuracy and compliance with applicable regulations.', warning: 'Organizations expending $750,000 or more in federal funds in a fiscal year must undergo a Single Audit (Uniform Guidance).' },
  { term: 'Single Audit (Uniform Guidance)', category: 'Reporting', definition: 'A comprehensive audit required for organizations that expend $750,000 or more in federal awards in a single year. Formerly known as the A-133 Audit, now governed by 2 CFR Part 200.' },
  { term: 'Grant Close-Out', category: 'Reporting', definition: 'The formal process of ending a grant, including submitting all required reports, returning any unexpended funds, reconciling financial records, and confirming compliance with all grant terms.' },
  { term: 'Grant Compliance', category: 'Reporting', definition: 'Adherence to all terms, conditions, and regulations associated with a grant award — including financial management, reporting deadlines, allowable costs, and program performance requirements.' },
  { term: 'Allowable Costs', category: 'Reporting', definition: 'Expenses that can be charged to a grant according to the funder\'s guidelines and applicable federal cost principles (2 CFR Part 200 for federal grants).', tip: 'Always verify cost allowability before incurring an expense. "Allowable" costs must be necessary, reasonable, and allocable to the grant.' },

  // Funders
  { term: 'Private Foundation', category: 'Funders', definition: 'A nonprofit funded primarily by one source (family, individual, or corporation) that makes grants to charitable organizations. Required to distribute at least 5% of assets annually and file Form 990-PF.' },
  { term: 'Community Foundation', category: 'Funders', definition: 'A public charity that manages charitable funds and endowments contributed by many donors to benefit a specific geographic community. Often a great first stop for local nonprofit funding.' },
  { term: 'Corporate Foundation', category: 'Funders', definition: 'A private foundation established and funded by a corporation, separate from the company\'s direct corporate giving program. Subject to the same 5% distribution requirement as other private foundations.' },
  { term: 'Fiscal Sponsor', category: 'Funders', definition: 'A 501(c)(3) organization that provides legal and financial oversight for a project or group that does not have its own nonprofit status, allowing them to receive tax-deductible grants and donations.', tip: 'Fiscal sponsorship is a legitimate path to funding for new initiatives — but choose your sponsor carefully and review the fee structure.' },
  { term: 'Eligibility', category: 'Funders', definition: 'The specific criteria an organization must meet to apply for a grant or contract — which may include organization type (nonprofit, government), geographic location, annual budget size, years in operation, and mission alignment.' },
  { term: 'Due Diligence', category: 'Funders', definition: 'The process funders use to evaluate a grant applicant\'s organizational capacity, financial health, governance, and track record before making a funding decision.' },
  { term: 'Grants.gov', category: 'Funders', definition: 'The central online portal where federal grant-making agencies post funding opportunities. All federal discretionary grants are listed here. Organizations must have a UEI and SAM.gov registration to apply.' },
  { term: 'Program Officer', category: 'Funders', definition: 'A foundation or agency staff member who manages grant programs, reviews applications, and serves as the primary contact for grantees. Building a relationship with program officers is a key fundraising strategy.', tip: 'When allowed, call or email the program officer before applying. A brief conversation can clarify priorities and strengthen your proposal.' },

  // Additional Legal & Governance
  { term: 'Board of Directors', category: 'Legal', definition: 'The governing body of a nonprofit organization responsible for strategic oversight, fiduciary responsibility, and legal compliance. Funders assess board strength and diversity as part of due diligence.' },
  { term: 'Fiscal Responsibility', category: 'Legal', definition: 'The legal and ethical obligation to manage funds appropriately, maintain accurate financial records, prevent fraud, and comply with all funder requirements.' },
  { term: 'Conflict of Interest Policy', category: 'Legal', definition: 'A written policy requiring board members and staff to disclose potential conflicts and recuse themselves from decisions involving personal benefit. Many funders require this document.' },
  { term: 'Insurance Coverage', category: 'Legal', definition: 'Protection against organizational liability, including general liability, directors & officers (D&O) insurance, and professional liability. Some funders require proof of adequate coverage.' },
  { term: 'Data Privacy / FERPA / HIPAA', category: 'Legal', definition: 'Federal regulations protecting sensitive information. FERPA protects student records; HIPAA protects health information. Nonprofits handling such data must comply and document safeguards.' },

  // Additional Grant Types & Funding
  { term: 'Government Grant', category: 'Grants', definition: 'Funding awarded by federal, state, or local government agencies for specific programs or projects. Typically highly competitive with stringent compliance requirements.' },
  { term: 'Discretionary Grant', category: 'Grants', definition: 'A federal grant where agencies have discretion in selecting winners from competing applications (unlike mandatory entitlements). More competitive but more flexible.' },
  { term: 'Entitlement Grant', category: 'Grants', definition: 'Federal funding allocated to states or localities based on a formula (population, poverty levels, etc.) rather than competitive selection. More predictable but less flexible.' },
  { term: 'Pass-Through Funding', category: 'Grants', definition: 'Funds that flow from a federal agency to state agencies, which then sub-grant to eligible nonprofits. Common in block grants.' },
  { term: 'Block Grant', category: 'Grants', definition: 'Federal funding consolidated from multiple categorical programs, awarded to states with flexibility in how funds are allocated, as long as they meet broad goals.' },
  { term: 'Seed Funding', category: 'Grants', definition: 'Initial funding to launch a new project or organization, typically smaller in amount and often from foundations focused on innovation.' },
  { term: 'Capacity Building Grant', category: 'Grants', definition: 'Funding specifically designed to strengthen organizational infrastructure — such as strategic planning, technology upgrades, staff training, or governance development.' },
  { term: 'Endowment', category: 'Grants', definition: 'A permanent fund established to generate ongoing income for an organization through investment returns. An endowment provides stable, long-term revenue.' },
  { term: 'Fiscal Year', category: 'Grants', definition: 'The 12-month period used for budgeting and financial reporting. Federal fiscal year runs October 1 – September 30. Organizations often use calendar or different fiscal years.' },

  // Additional Proposal & Project Terms
  { term: 'Evidence-Based Program', category: 'Proposals', definition: 'A program with documented effectiveness through rigorous research or evaluation. Funders increasingly prioritize evidence-based approaches over innovative but unproven models.', tip: 'If your approach is innovative, frame it as "evidence-informed" and show your evaluation plan for measuring results.' },
  { term: 'Equity / Equitable Outcomes', category: 'Proposals', definition: 'Ensuring fair and just distribution of benefits, services, and outcomes across demographic groups. Funders now prioritize equity and want to see how you address disparities.' },
  { term: 'Cultural Competency', category: 'Proposals', definition: 'The ability of an organization to serve people from different cultural backgrounds respectfully and effectively. Important for proposals serving diverse populations.' },
  { term: 'Community Engagement', category: 'Proposals', definition: 'Active involvement of community members in designing, implementing, and evaluating programs. Funders value authentic community voice, not token participation.' },
  { term: 'Leverage', category: 'Proposals', definition: 'Using grant funds as a catalyst to attract additional funding from other sources. A strong leverage strategy demonstrates your ability to mobilize resources.' },
  { term: 'Sustainability', category: 'Proposals', definition: 'The ability to continue and expand program impact beyond the grant period through diversified funding, partnerships, or earned revenue.' },
  { term: 'Return on Investment (ROI)', category: 'Proposals', definition: 'The measurable benefit or impact achieved relative to the investment. Common in outcome evaluations to demonstrate program effectiveness and value.' },

  // Additional Compliance & Reporting
  { term: 'Grant Agreement', category: 'Reporting', definition: 'The legally binding document between grantor and grantee outlining terms, conditions, deliverables, budget, and compliance requirements.' },
  { term: 'Drawdown', category: 'Reporting', definition: 'The process of requesting reimbursement or access to grant funds based on documented expenses and progress.' },
  { term: 'Expenditure Report', category: 'Reporting', definition: 'A detailed accounting of how grant funds were spent, typically submitted monthly or quarterly, with supporting documentation.' },
  { term: 'Indirect Cost Rate (IDC)', category: 'Reporting', definition: 'A federally negotiated percentage applied to direct grant costs to cover organizational overhead. Can significantly increase total grant recovery.' },
  { term: 'Audit Findings', category: 'Reporting', definition: 'Deficiencies identified during an audit related to financial management, compliance, or internal controls. Must be remedied and documented.' },
  { term: 'Monitoring Visit', category: 'Reporting', definition: 'A visit by funder staff or an independent monitor to review grant implementation, compliance, financial records, and program quality.' },
  { term: 'Grant Period', category: 'Reporting', definition: 'The approved timeframe during which grant activities must occur and funds must be expended. Activities outside this window are not eligible.' },

  // Additional Funder Types
  { term: 'Government Agency', category: 'Funders', definition: 'Federal, state, or local government entity that awards grants and contracts. Examples: HUD, NSF, NIH, state health departments.' },
  { term: 'Catalyst Foundation', category: 'Funders', definition: 'A foundation focused on seeding innovation and systemic change in a specific issue area or geography.' },
  { term: 'Place-Based Foundation', category: 'Funders', definition: 'A foundation focused on specific geographic communities, often addressing local issues and supporting community-led solutions.' },
  { term: 'Operating Foundation', category: 'Funders', definition: 'A private foundation that primarily operates its own programs rather than making grants to other organizations. Rare but worth knowing.' },
  { term: 'Donor-Advised Fund (DAF)', category: 'Funders', definition: 'An investment account where donors receive tax deductions upfront but recommend grants over time. Growing funding source for nonprofits.' },

  // Contracts & Procurement
  { term: 'Procurement', category: 'Contracts', definition: 'The process by which governments and organizations purchase goods or services. Government procurement is highly regulated and competitive.' },
  { term: 'Vendor Registration', category: 'Contracts', definition: 'The process of registering your organization with government systems (SAM.gov, state procurement databases) to be eligible for contracts.' },
  { term: 'W-9 Form', category: 'Contracts', definition: 'A tax form providing your Taxpayer Identification Number (TIN) or Social Security Number. Required by contractors before payment.' },
  { term: 'Contract Terms & Conditions', category: 'Contracts', definition: 'Legal obligations in a contract including payment terms, performance standards, insurance requirements, and liability limitations.' },
  { term: 'Invoice / Invoicing', category: 'Contracts', definition: 'A request for payment detailing services rendered or goods delivered, including dates, descriptions, amounts, and payment instructions.' },
  { term: 'Payment Schedule', category: 'Contracts', definition: 'The timing and conditions for receiving contract payments — often tied to milestone completion or monthly invoicing.' },

  // Small Business / Solopreneur / Entrepreneur Language
  { term: 'Small Business', category: 'Common', definition: 'A for-profit business with fewer than 500 employees. Small businesses are often excluded from nonprofit grants but may be eligible for SBA loans and contracts.' },
  { term: 'Solopreneur', category: 'Common', definition: 'An individual running a business alone, without employees. May struggle to meet grant eligibility requirements designed for larger organizations.' },
  { term: 'Minority-Owned Business Enterprise (MBE)', category: 'Common', definition: 'A for-profit business at least 51% owned and controlled by individuals from underrepresented groups. Eligible for set-asides and contracts with governments and large corporations.' },
  { term: 'Women-Owned Business Enterprise (WBE)', category: 'Common', definition: 'A for-profit business at least 51% owned and controlled by women. Eligible for federal contracts, SBA loans, and corporate supplier diversity programs.' },
  { term: 'Service-Disabled Veteran-Owned Small Business (SDVOSB)', category: 'Common', definition: 'A small business owned by a veteran with a service-connected disability. Eligible for federal contracting set-asides and specialized SBA programs.' },
  { term: 'Business Plan', category: 'Common', definition: 'A formal document outlining your business model, market analysis, operations, and financial projections. Required for most SBA loans and some grants.' },
  { term: 'Proof of Concept', category: 'Common', definition: 'Evidence that your business idea or product works and has market demand. Funders want to see proof before investing in scaling.' },
  { term: 'Pitch / Elevator Pitch', category: 'Common', definition: 'A 30-60 second compelling summary of your business, problem you solve, and why you\'re the right person to solve it.' },
  { term: 'Lean Business Model', category: 'Common', definition: 'A flexible, low-cost approach to testing and validating a business idea before major investment. Popular with startups and entrepreneurs.' },
  { term: 'Social Enterprise', category: 'Common', definition: 'A for-profit or nonprofit business structured to generate revenue while addressing a social or environmental problem. May be eligible for impact investing or mission-aligned grants.' },

  // SBA & Small Business Grants
  { term: 'SBA Loan', category: 'Grants', definition: 'Loans from the Small Business Administration that help small businesses access capital for equipment, inventory, working capital, and expansion at favorable terms.' },
  { term: 'Microgrant', category: 'Grants', definition: 'Small grants (typically under $10,000) often used to seed new initiatives, support underrepresented entrepreneurs, or provide emergency relief.' },
  { term: 'SBIR / STTR', category: 'Grants', definition: 'Small Business Innovation Research and Small Business Technology Transfer — federal programs funding small businesses doing innovative R&D with commercial potential.' },
  { term: 'Economic Development Grant', category: 'Grants', definition: 'Funding from government or foundations to support small business growth, job creation, and economic revitalization in specific regions.' },

  // Common Concepts for Entrepreneurs
  { term: 'Market Research', category: 'Proposals', definition: 'Systematic investigation of your target market, competitors, and customer needs. Demonstrates viability in proposals and business plans.' },
  { term: 'Target Market', category: 'Proposals', definition: 'The specific group of customers or organizations you intend to serve. Clear definition of target market strengthens proposals and business plans.' },
  { term: 'Unique Value Proposition (UVP)', category: 'Proposals', definition: 'What makes your product, service, or organization distinctly different and better than alternatives. Critical for standing out to funders.' },
  { term: 'Competitive Advantage', category: 'Proposals', definition: 'Specific strengths or resources that position your organization to outperform competitors or deliver superior results.' },
  { term: 'Scalability', category: 'Proposals', definition: 'The ability to grow your program or business without proportional increases in cost. Funders value scalable models.' },
  { term: 'Pilot Program', category: 'Proposals', definition: 'A small-scale test of your program or product with a limited group before full launch. Shows funders you\'re testing and learning.' },
  { term: 'Intellectual Property (IP)', category: 'Proposals', definition: 'Creations of the mind you own or control (patents, trademarks, copyrights, trade secrets). Important to clarify ownership in contracts.' },
  { term: 'Revenue Stream', category: 'Proposals', definition: 'Sources of income for your organization or business. Multiple revenue streams reduce dependency on any single funder.' },
  ];

const CATEGORIES = ['All', 'Legal', 'Grants', 'Proposals', 'Contracts', 'Reporting', 'Funders', 'Common'];

const CATEGORY_COUNTS = {
  All: GLOSSARY_TERMS.length,
  Legal: GLOSSARY_TERMS.filter(t => t.category === 'Legal').length,
  Grants: GLOSSARY_TERMS.filter(t => t.category === 'Grants').length,
  Proposals: GLOSSARY_TERMS.filter(t => t.category === 'Proposals').length,
  Contracts: GLOSSARY_TERMS.filter(t => t.category === 'Contracts').length,
  Reporting: GLOSSARY_TERMS.filter(t => t.category === 'Reporting').length,
  Funders: GLOSSARY_TERMS.filter(t => t.category === 'Funders').length,
};

const CATEGORY_COLORS = {
  Legal: 'bg-purple-100 text-purple-800 border-purple-200',
  Grants: 'bg-blue-100 text-blue-800 border-blue-200',
  Proposals: 'bg-green-100 text-green-800 border-green-200',
  Contracts: 'bg-orange-100 text-orange-800 border-orange-200',
  Reporting: 'bg-red-100 text-red-800 border-red-200',
  Funders: 'bg-teal-100 text-teal-800 border-teal-200',
};

const CATEGORY_BORDER = {
  Legal: 'border-l-purple-400',
  Grants: 'border-l-blue-400',
  Proposals: 'border-l-green-400',
  Contracts: 'border-l-orange-400',
  Reporting: 'border-l-red-400',
  Funders: 'border-l-teal-400',
};

export default function GrantGlossary() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const letterRefs = useRef({});

  const filtered = GLOSSARY_TERMS.filter(item => {
    const matchSearch = !search ||
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    return matchSearch && matchCat;
  }).sort((a, b) => a.term.localeCompare(b.term));

  // Group by first letter
  const grouped = filtered.reduce((acc, item) => {
    const letter = item.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(item);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  const scrollToLetter = (letter) => {
    if (letterRefs.current[letter]) {
      letterRefs.current[letter].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#143A50] text-white px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-[#E5C089]" />
            <h1 className="text-3xl font-bold">Grant Glossary</h1>
          </div>
          <p className="text-[#E5C089]/80 text-sm">
            {GLOSSARY_TERMS.length} essential terms covering grants, contracts, proposals, legal compliance, reporting, and funders.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms or definitions..."
            className="pl-10 bg-white text-base h-11"
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
                   : 'bg-white text-slate-600 border-slate-200 hover:border-[#143A50] hover:text-[#143A50]'
               }`}
             >
               {cat} {cat !== 'All' && <span className="text-xs opacity-75">({CATEGORY_COUNTS[cat]})</span>}
             </button>
           ))}
         </div>

        {/* A-Z Jump Nav */}
        {!search && letters.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {letters.map(letter => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                className="w-8 h-8 rounded-md text-xs font-bold border bg-white text-[#143A50] border-slate-200 hover:bg-[#143A50] hover:text-white transition-all"
              >
                {letter}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-slate-500">{filtered.length} term{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Terms grouped by letter */}
        <div className="space-y-8">
          {letters.map(letter => (
            <div key={letter} ref={el => letterRefs.current[letter] = el}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#143A50] text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
                  {letter}
                </div>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="space-y-3">
                {grouped[letter].map((item) => (
                  <div
                    key={item.term}
                    className={`bg-white rounded-xl border border-slate-200 border-l-4 ${CATEGORY_BORDER[item.category]} p-5 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-[#143A50] text-base leading-tight">{item.term}</h3>
                      <Badge className={`${CATEGORY_COLORS[item.category]} text-xs flex-shrink-0 border`}>
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{item.definition}</p>

                    {item.tip && (
                      <div className="mt-3 flex gap-2 bg-[#E5C089]/15 rounded-lg p-3">
                        <Lightbulb className="w-4 h-4 text-[#A65D40] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-[#A65D40] leading-relaxed font-medium"><span className="font-bold">Pro Tip:</span> {item.tip}</p>
                      </div>
                    )}
                    {item.warning && (
                      <div className="mt-3 flex gap-2 bg-red-50 rounded-lg p-3">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 leading-relaxed font-medium"><span className="font-bold">Important:</span> {item.warning}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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