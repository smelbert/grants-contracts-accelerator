// EIS Funding Readiness Assessment — Scoring, Holds, Action Plan Logic
import { BANDS, LEVEL_BANDS, LEVEL_NAMES, HOLDS_CONFIG, RECOMMENDED_DOCUMENTS, NEXT_STEPS } from './assessmentConfig';

// Check if an item applies to a given legal structure
export function itemApplies(item, structure) {
  if (!structure) return true;
  if (item.applies_to && item.applies_to.length > 0) {
    return item.applies_to.includes(structure);
  }
  if (item.na_structures && item.na_structures.length > 0) {
    return !item.na_structures.includes(structure);
  }
  return true;
}

// Get applicable items for a specific track and structure
export function getTrackLevelItems(allItems, trackKey, level, structure) {
  return allItems
    .filter(item => item.track === trackKey && item.level === level && itemApplies(item, structure))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

// Score a single track (grant or proposal)
export function scoreTrack(allItems, responses, trackKey, structure) {
  const trackItems = allItems.filter(item => item.track === trackKey && itemApplies(item, structure));

  let earned = 0, available = 0;
  const levelData = { 1: { earned: 0, available: 0 }, 2: { earned: 0, available: 0 }, 3: { earned: 0, available: 0 } };

  trackItems.forEach(item => {
    available += item.points;
    levelData[item.level].available += item.points;
    if (responses[item.id]) {
      earned += item.points;
      levelData[item.level].earned += item.points;
    }
  });

  const percent = available > 0 ? Math.round((earned / available) * 100) : 0;
  const band = getBand(percent);

  const levelScores = [1, 2, 3].map(level => {
    const ld = levelData[level];
    const lp = ld.available > 0 ? Math.round((ld.earned / ld.available) * 100) : 0;
    return {
      level,
      earned: ld.earned,
      available: ld.available,
      percent: lp,
      band: getLevelBand(lp),
      scoreString: `${ld.earned}/${ld.available}`,
    };
  });

  return { percent, earned, available, band, levelScores };
}

// Map a percentage to a band
export function getBand(percent) {
  if (percent >= BANDS.ready.min) return BANDS.ready;
  if (percent >= BANDS.promising.min) return BANDS.promising;
  return BANDS.foundation;
}

// Map a level percentage to a level band
export function getLevelBand(percent) {
  if (percent >= LEVEL_BANDS.solid.min) return LEVEL_BANDS.solid;
  if (percent >= LEVEL_BANDS.developing.min) return LEVEL_BANDS.developing;
  return LEVEL_BANDS.needs_work;
}

// Get the strongest band across tracks
export function getBestBand(trackResults) {
  const bands = Object.values(trackResults).map(r => r.band);
  const order = { ready: 3, promising: 2, foundation: 1 };
  return bands.sort((a, b) => order[b.key] - order[a.key])[0] || BANDS.foundation;
}

// Compute eligibility holds
export function computeHolds(allItems, responses, structure, track) {
  const holds = [];

  // Structure-based holds
  if (structure === 'notformed') {
    holds.push({ id: 'struct_notformed', text: HOLDS_CONFIG.struct_notformed });
  }
  if (structure === 'notsure') {
    holds.push({ id: 'struct_notsure', text: HOLDS_CONFIG.struct_notsure });
  }
  if (track !== 'proposals' && ['sole', 'llc', 'corp'].includes(structure)) {
    holds.push({ id: 'struct_grant_restriction', text: HOLDS_CONFIG.struct_grant_restriction });
  }
  if (structure === 'fiscal') {
    holds.push({ id: 'struct_fiscal', text: HOLDS_CONFIG.struct_fiscal });
  }

  // Item-based holds (unchecked applicable gate items)
  const checkTrack = (holdTrack) => {
    if (track === 'grant' && holdTrack === 'proposal') return false;
    if (track === 'proposals' && holdTrack === 'grant') return false;
    return true;
  };

  HOLDS_CONFIG.item_holds.forEach(holdConfig => {
    if (!checkTrack(holdConfig.track)) return;

    const matchingItem = allItems.find(item => {
      if (item.track !== holdConfig.track) return false;
      if (!itemApplies(item, structure)) return false;
      if (holdConfig.matchType === 'partial') {
        return item.text.includes(holdConfig.matchText);
      }
      return item.text === holdConfig.matchText;
    });

    if (matchingItem && !responses[matchingItem.id]) {
      holds.push({ id: holdConfig.id, text: holdConfig.holdText });
    }
  });

  return holds;
}

// Build the prioritized action plan from unchecked applicable items
export function buildActionPlan(allItems, responses, structure, track) {
  const trackKeys = track === 'both' ? ['grant', 'proposal'] : [track === 'proposals' ? 'proposal' : track];
  const actions = [];

  trackKeys.forEach(t => {
    const trackItems = allItems.filter(item => item.track === t && itemApplies(item, structure));
    trackItems.forEach(item => {
      if (!responses[item.id]) {
        let rank;
        if (item.is_gate && item.level === 1) rank = 0;
        else if (item.is_gate) rank = 1;
        else if (item.level === 1) rank = 2;
        else if (item.level === 2) rank = 3;
        else rank = 4;

        actions.push({
          rank,
          track: t,
          level: item.level,
          text: item.text,
          is_gate: item.is_gate,
          levelName: LEVEL_NAMES[t]?.[item.level] || `Level ${item.level}`,
          trackName: t === 'grant' ? 'Grant Funding' : 'Proposals & Contracts',
        });
      }
    });
  });

  actions.sort((a, b) => a.rank - b.rank);
  return actions;
}

// Get open (unchecked) items grouped by track and level
export function getOpenItems(allItems, responses, structure, track) {
  const trackKeys = track === 'both' ? ['grant', 'proposal'] : [track === 'proposals' ? 'proposal' : track];
  const openItems = [];

  trackKeys.forEach(t => {
    [1, 2, 3].forEach(level => {
      const levelItems = allItems.filter(item =>
        item.track === t && item.level === level && itemApplies(item, structure) && !responses[item.id]
      );
      levelItems.forEach(item => {
        openItems.push({
          track: t,
          level,
          text: item.text,
          is_gate: item.is_gate,
          levelName: LEVEL_NAMES[t]?.[level] || `Level ${level}`,
        });
      });
    });
  });

  return openItems;
}

// Get recommended documents for a structure
export function getRecommendedDocuments(structure) {
  return RECOMMENDED_DOCUMENTS[structure] || [];
}

// Get next steps for a band
export function getNextSteps(band) {
  const steps = NEXT_STEPS[band?.key] || NEXT_STEPS.default;
  return steps.slice(0, 3);
}

// Generate the personalized Dr. E opening message
export function getDrEMessage(firstName, organization) {
  const name = firstName || 'Friend';
  const org = organization || 'your organization';
  return `${name}, thank you for taking the time to be honest about where ${org} stands. That honesty is exactly what makes an organization fundable. Here's what I see — and what I'd tell you if we were sitting together.`;
}

// Main entry point: compute all results from the assessment
export function computeResults(allItems, responses, track, structure, orgProfile = {}) {
  const trackKeys = track === 'both' ? ['grant', 'proposal'] : [track === 'proposals' ? 'proposal' : track];

  const trackResults = {};
  trackKeys.forEach(t => {
    trackResults[t] = scoreTrack(allItems, responses, t, structure);
  });

  const holds = computeHolds(allItems, responses, structure, track);
  const actionPlan = buildActionPlan(allItems, responses, structure, track);
  const openItems = getOpenItems(allItems, responses, structure, track);
  const recommendedDocs = getRecommendedDocuments(structure);
  const bestBand = getBestBand(trackResults);
  const nextSteps = getNextSteps(bestBand);
  const drEMessage = getDrEMessage(orgProfile.first_name, orgProfile.organization);

  return {
    trackResults,
    holds,
    actionPlan,
    openItems,
    recommendedDocs,
    bestBand,
    nextSteps,
    drEMessage,
  };
}