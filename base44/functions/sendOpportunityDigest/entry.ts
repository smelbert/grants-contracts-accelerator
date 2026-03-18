import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This is a scheduled automation, use service role
    const { frequency = 'daily' } = await req.json();

    console.log(`Starting ${frequency} opportunity digest...`);

    // Get all users with profiles and notifications enabled
    const profiles = await base44.asServiceRole.entities.UserOpportunityProfile.filter({
      notification_enabled: true,
      notification_frequency: frequency
    });

    console.log(`Found ${profiles.length} users with ${frequency} notifications enabled`);

    // Determine date range based on frequency
    const since = new Date();
    if (frequency === 'daily') {
      since.setDate(since.getDate() - 1);
    } else if (frequency === 'weekly') {
      since.setDate(since.getDate() - 7);
    } else if (frequency === 'biweekly') {
      since.setDate(since.getDate() - 14);
    } else if (frequency === 'monthly') {
      since.setDate(since.getDate() - 30);
    }

    const results = {
      sent: 0,
      skipped: 0,
      errors: []
    };

    for (const profile of profiles) {
      try {
        // Get new opportunities since last digest
        const allOpps = await base44.asServiceRole.entities.FundingOpportunity.filter({
          status: 'active'
        });
        
        const newOpps = allOpps.filter(o => 
          new Date(o.created_date) >= since || new Date(o.updated_date) >= since
        );

        if (newOpps.length === 0) {
          console.log(`No new opportunities for ${profile.user_email}, skipping`);
          results.skipped++;
          continue;
        }

        // Match opportunities
        const matches = [];
        for (const opp of newOpps) {
          const score = calculateMatchScore(opp, profile);
          if (score >= (profile.minimum_match_score || 70)) {
            matches.push({
              opportunity: opp,
              score: score,
              reasons: getMatchReasons(opp, profile)
            });
          }
        }

        if (matches.length === 0) {
          console.log(`No matches for ${profile.user_email}, skipping`);
          results.skipped++;
          continue;
        }

        // Sort by score
        matches.sort((a, b) => b.score - a.score);

        // Send email digest
        const emailBody = buildDigestEmail(matches, profile, frequency);
        
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: profile.user_email,
          subject: `${matches.length} New Funding Opportunities Match Your Profile`,
          body: emailBody
        });

        console.log(`Sent digest to ${profile.user_email} with ${matches.length} matches`);
        results.sent++;

      } catch (err) {
        console.error(`Error processing digest for ${profile.user_email}:`, err);
        results.errors.push({ user: profile.user_email, error: err.message });
      }
    }

    return Response.json({
      success: true,
      frequency: frequency,
      total_users: profiles.length,
      sent: results.sent,
      skipped: results.skipped,
      errors: results.errors
    });

  } catch (error) {
    console.error('Send opportunity digest error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});

function calculateMatchScore(opportunity, profile) {
  let score = 0;
  let maxScore = 0;

  maxScore += 30;
  if (profile.sector_focus && profile.sector_focus.length > 0) {
    const oppSectors = [...(opportunity.sector_focus || []), ...(opportunity.categories || [])];
    const sectorMatches = profile.sector_focus.filter(s => 
      oppSectors.some(os => os.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(os.toLowerCase()))
    );
    score += (sectorMatches.length / profile.sector_focus.length) * 30;
  }

  maxScore += 20;
  if (profile.geographic_focus && profile.geographic_focus.length > 0 && opportunity.geographic_focus) {
    const geoMatches = profile.geographic_focus.some(g => 
      opportunity.geographic_focus.toLowerCase().includes(g.toLowerCase())
    );
    if (geoMatches) score += 20;
  }

  maxScore += 15;
  if (profile.funding_preferences?.min_amount && opportunity.amount_max) {
    if (opportunity.amount_max >= profile.funding_preferences.min_amount) score += 15;
  } else {
    score += 7.5;
  }

  maxScore += 15;
  if (profile.funding_preferences?.preferred_lanes?.includes(opportunity.funding_lane)) score += 10;
  if (profile.funding_preferences?.preferred_types?.includes(opportunity.type)) score += 5;

  maxScore += 20;
  if (profile.keywords && profile.keywords.length > 0) {
    const text = `${opportunity.title} ${opportunity.description}`.toLowerCase();
    const keywordMatches = profile.keywords.filter(k => text.includes(k.toLowerCase()));
    score += (keywordMatches.length / profile.keywords.length) * 20;
  }

  if (profile.excluded_keywords && profile.excluded_keywords.length > 0) {
    const text = `${opportunity.title} ${opportunity.description}`.toLowerCase();
    const hasExcluded = profile.excluded_keywords.some(k => text.includes(k.toLowerCase()));
    if (hasExcluded) score = Math.max(0, score - 30);
  }

  return Math.round((score / maxScore) * 100);
}

function getMatchReasons(opportunity, profile) {
  const reasons = [];

  if (profile.sector_focus && profile.sector_focus.length > 0) {
    const oppSectors = [...(opportunity.sector_focus || []), ...(opportunity.categories || [])];
    const matches = profile.sector_focus.filter(s => 
      oppSectors.some(os => os.toLowerCase().includes(s.toLowerCase()))
    );
    if (matches.length > 0) reasons.push(`Matches your sectors: ${matches.join(', ')}`);
  }

  if (profile.geographic_focus && profile.geographic_focus.length > 0 && opportunity.geographic_focus) {
    const matches = profile.geographic_focus.filter(g => 
      opportunity.geographic_focus.toLowerCase().includes(g.toLowerCase())
    );
    if (matches.length > 0) reasons.push(`Serves your area: ${matches.join(', ')}`);
  }

  if (opportunity.amount_max && profile.funding_preferences?.min_amount) {
    if (opportunity.amount_max >= profile.funding_preferences.min_amount) {
      reasons.push(`Award amount: $${opportunity.amount_max.toLocaleString()}`);
    }
  }

  if (profile.keywords && profile.keywords.length > 0) {
    const text = `${opportunity.title} ${opportunity.description}`.toLowerCase();
    const matches = profile.keywords.filter(k => text.includes(k.toLowerCase()));
    if (matches.length > 0) reasons.push(`Keywords: ${matches.slice(0, 3).join(', ')}`);
  }

  return reasons;
}

function buildDigestEmail(matches, profile, frequency) {
  const frequencyText = frequency === 'daily' ? 'Daily' : frequency === 'weekly' ? 'Weekly' : frequency === 'biweekly' ? 'Bi-Weekly' : 'Monthly';
  
  let html = `
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #143A50 0%, #1E4F58 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .opportunity { background: #f8f9fa; border-left: 4px solid #E5C089; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .score { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
    .score.high { background: #10b981; }
    .score.medium { background: #f59e0b; }
    .reason { color: #666; font-size: 14px; margin: 8px 0; }
    .button { display: inline-block; background: #143A50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${frequencyText} Funding Digest</h1>
      <p>We found ${matches.length} opportunities matching your profile</p>
    </div>
`;

  matches.slice(0, 10).forEach(match => {
    const scoreClass = match.score >= 85 ? 'high' : 'medium';
    html += `
    <div class="opportunity">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
        <h3 style="margin: 0; color: #143A50;">${match.opportunity.title}</h3>
        <span class="score ${scoreClass}">${match.score}% Match</span>
      </div>
      <p style="color: #666; margin: 10px 0;"><strong>${match.opportunity.funder_name}</strong></p>
      <p style="margin: 10px 0;">${match.opportunity.description?.substring(0, 200)}...</p>
      ${match.opportunity.amount_max ? `<p style="margin: 10px 0;"><strong>Award:</strong> Up to $${match.opportunity.amount_max.toLocaleString()}</p>` : ''}
      ${match.opportunity.deadline ? `<p style="margin: 10px 0;"><strong>Deadline:</strong> ${new Date(match.opportunity.deadline).toLocaleDateString()}</p>` : ''}
      <div style="margin-top: 10px;">
        ${match.reasons.map(r => `<div class="reason">✓ ${r}</div>`).join('')}
      </div>
      ${match.opportunity.application_url ? `<a href="${match.opportunity.application_url}" class="button">View Opportunity</a>` : ''}
    </div>
`;
  });

  if (matches.length > 10) {
    html += `<p style="text-align: center; color: #666; margin: 20px 0;">+ ${matches.length - 10} more opportunities in your dashboard</p>`;
  }

  html += `
    <div class="footer">
      <p>You're receiving this ${frequency} digest based on your opportunity profile preferences.</p>
      <p>To adjust your preferences or unsubscribe, visit your account settings.</p>
    </div>
  </div>
</body>
</html>
`;

  return html;
}