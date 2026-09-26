// Funding-lane readiness helpers for the Cohort Readiness Dashboard.

export const FUNDING_LANES = [
  { id: 'grants', label: 'Grants', color: '#143A50', docTypes: ['governance', 'finance', 'narrative', 'proposal'] },
  { id: 'contracts', label: 'Contracts', color: '#AC1A5B', docTypes: ['governance', 'finance', 'contract', 'budget'] },
  { id: 'donors', label: 'Donors', color: '#A65D40', docTypes: ['governance', 'narrative', 'proposal'] },
  { id: 'public_funds', label: 'Public Funds', color: '#1E4F58', docTypes: ['governance', 'finance', 'narrative', 'budget'] },
];

export const DOC_TYPE_LABELS = {
  governance: 'Governance / 501(c)(3)',
  finance: 'Financial Records',
  proposal: 'Proposal Draft',
  contract: 'Contract Template',
  narrative: 'Program Narrative',
  budget: 'Annual Budget',
  other: 'Other',
};

export const LEVEL_CONFIG = {
  highly_ready: { label: 'Highly Ready', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  ready: { label: 'Ready', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
  building_readiness: { label: 'Building', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', dot: 'bg-amber-500' },
  not_ready: { label: 'Not Ready', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' },
};

export const LEVEL_ORDER = ['highly_ready', 'ready', 'building_readiness', 'not_ready'];

export function levelFromScore(score) {
  if (score >= 80) return 'highly_ready';
  if (score >= 60) return 'ready';
  if (score >= 30) return 'building_readiness';
  return 'not_ready';
}

// Composite readiness for one lane: 50% assessment score + 50% document checklist.
export function computeLaneReadiness(lane, documents, assessmentScore) {
  const presentTypes = new Set(
    (documents || []).filter(d => d.status !== 'archived' && d.doc_type).map(d => d.doc_type)
  );
  const required = lane.docTypes;
  const completed = required.filter(t => presentTypes.has(t));
  const missing = required.filter(t => !presentTypes.has(t));
  const docScore = required.length ? (completed.length / required.length) * 100 : 0;
  const aScore = typeof assessmentScore === 'number' ? assessmentScore : 0;
  const laneScore = Math.round(aScore * 0.5 + docScore * 0.5);
  return {
    laneScore,
    laneLevel: levelFromScore(laneScore),
    docScore: Math.round(docScore),
    completed,
    missing,
  };
}

export function avgLaneScore(lanes) {
  if (!lanes || !lanes.length) return 0;
  return Math.round(lanes.reduce((s, l) => s + l.laneScore, 0) / lanes.length);
}