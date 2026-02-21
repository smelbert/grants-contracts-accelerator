import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { opportunity_ids, since_date } = await req.json();

    // Get user's profile
    const profiles = await base44.entities.UserOpportunityProfile.filter({
      user_email: user.email
    });

    if (profiles.length === 0) {
      return Response.json({
        success: true,
        matches: [],
        message: 'No profile found. Create a profile to get matched opportunities.'
      });
    }

    const profile = profiles[0];

    // Get opportunities to match
    let opportunities;
    if (opportunity_ids && opportunity_ids.length > 0) {
      // Match specific opportunities
      opportunities = await Promise.all(
        opportunity_ids.map(id => base44.entities.FundingOpportunity.get(id))
      );
    } else if (since_date) {
      // Get opportunities created/updated since date
      const allOpps = await base44.entities.FundingOpportunity.filter({
        status: 'active'
      });
      opportunities = allOpps.filter(o => 
        new Date(o.created_date) >= new Date(since_date) ||
        new Date(o.updated_date) >= new Date(since_date)
      );
    } else {
      // Get all active opportunities
      opportunities = await base44.entities.FundingOpportunity.filter({
        status: 'active'
      });
    }

    console.log(`Matching ${opportunities.length} opportunities against profile`);

    // Calculate match scores
    const matches = [];
    for (const opp of opportunities) {
      const score = calculateMatchScore(opp, profile);
      
      if (score >= (profile.minimum_match_score || 70)) {
        matches.push({
          opportunity: opp,
          score: score,
          reasons: getMatchReasons(opp, profile)
        });
      }
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    console.log(`Found ${matches.length} matches above threshold`);

    return Response.json({
      success: true,
      matches: matches,
      total_opportunities: opportunities.length,
      profile_summary: {
        sectors: profile.sector_focus || [],
        geographic: profile.geographic_focus || [],
        min_score: profile.minimum_match_score || 70
      }
    });

  } catch (error) {
    console.error('Match opportunities error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});

function calculateMatchScore(opportunity, profile) {
  let score = 0;
  let maxScore = 0;

  // Sector match (30 points)
  maxScore += 30;
  if (profile.sector_focus && profile.sector_focus.length > 0) {
    const oppSectors = [...(opportunity.sector_focus || []), ...(opportunity.categories || [])];
    const sectorMatches = profile.sector_focus.filter(s => 
      oppSectors.some(os => os.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(os.toLowerCase()))
    );
    score += (sectorMatches.length / profile.sector_focus.length) * 30;
  }

  // Geographic match (20 points)
  maxScore += 20;
  if (profile.geographic_focus && profile.geographic_focus.length > 0 && opportunity.geographic_focus) {
    const geoMatches = profile.geographic_focus.some(g => 
      opportunity.geographic_focus.toLowerCase().includes(g.toLowerCase()) ||
      opportunity.geographic_restrictions?.toLowerCase().includes(g.toLowerCase())
    );
    if (geoMatches) score += 20;
  }

  // Funding amount match (15 points)
  maxScore += 15;
  if (profile.funding_preferences?.min_amount && opportunity.amount_max) {
    if (opportunity.amount_max >= profile.funding_preferences.min_amount) {
      score += 15;
    }
  } else {
    score += 7.5; // partial credit if no preference set
  }

  // Funding lane/type match (15 points)
  maxScore += 15;
  if (profile.funding_preferences?.preferred_lanes?.includes(opportunity.funding_lane)) {
    score += 10;
  }
  if (profile.funding_preferences?.preferred_types?.includes(opportunity.type)) {
    score += 5;
  }

  // Keyword match in title/description (20 points)
  maxScore += 20;
  if (profile.keywords && profile.keywords.length > 0) {
    const text = `${opportunity.title} ${opportunity.description}`.toLowerCase();
    const keywordMatches = profile.keywords.filter(k => text.includes(k.toLowerCase()));
    score += (keywordMatches.length / profile.keywords.length) * 20;
  }

  // Excluded keywords penalty
  if (profile.excluded_keywords && profile.excluded_keywords.length > 0) {
    const text = `${opportunity.title} ${opportunity.description}`.toLowerCase();
    const hasExcluded = profile.excluded_keywords.some(k => text.includes(k.toLowerCase()));
    if (hasExcluded) {
      score = Math.max(0, score - 30);
    }
  }

  // Mission alignment (bonus via AI if available)
  // This would be enhanced with AI comparison in production

  return Math.round((score / maxScore) * 100);
}

function getMatchReasons(opportunity, profile) {
  const reasons = [];

  // Sector matches
  if (profile.sector_focus && profile.sector_focus.length > 0) {
    const oppSectors = [...(opportunity.sector_focus || []), ...(opportunity.categories || [])];
    const matches = profile.sector_focus.filter(s => 
      oppSectors.some(os => os.toLowerCase().includes(s.toLowerCase()))
    );
    if (matches.length > 0) {
      reasons.push(`Matches your sectors: ${matches.join(', ')}`);
    }
  }

  // Geographic match
  if (profile.geographic_focus && profile.geographic_focus.length > 0 && opportunity.geographic_focus) {
    const matches = profile.geographic_focus.filter(g => 
      opportunity.geographic_focus.toLowerCase().includes(g.toLowerCase())
    );
    if (matches.length > 0) {
      reasons.push(`Serves your area: ${matches.join(', ')}`);
    }
  }

  // Amount match
  if (opportunity.amount_max && profile.funding_preferences?.min_amount) {
    if (opportunity.amount_max >= profile.funding_preferences.min_amount) {
      reasons.push(`Award amount meets your needs ($${opportunity.amount_max.toLocaleString()})`);
    }
  }

  // Keyword matches
  if (profile.keywords && profile.keywords.length > 0) {
    const text = `${opportunity.title} ${opportunity.description}`.toLowerCase();
    const matches = profile.keywords.filter(k => text.includes(k.toLowerCase()));
    if (matches.length > 0) {
      reasons.push(`Keywords: ${matches.slice(0, 3).join(', ')}`);
    }
  }

  return reasons;
}