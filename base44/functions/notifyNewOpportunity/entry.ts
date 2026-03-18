import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const payload = await req.json();
        
        // Support both entity automation payload ({ event, data }) and direct calls ({ opportunity_id })
        const opportunity_id = payload.opportunity_id || payload.event?.entity_id;
        const opportunityData = payload.data || null;

        if (!opportunity_id) {
            console.error('Missing opportunity_id. Payload received:', JSON.stringify(payload));
            return Response.json({ error: 'Missing opportunity_id' }, { status: 400 });
        }

        // Use entity data from automation payload if available, otherwise fetch it
        const opportunity = opportunityData || await base44.asServiceRole.entities.FundingOpportunity.get(opportunity_id);
        
        if (!opportunity) {
            return Response.json({ error: 'Opportunity not found' }, { status: 404 });
        }

        // Get all users
        const users = await base44.asServiceRole.entities.User.list();
        
        // Get all notification preferences
        const allPreferences = await base44.asServiceRole.entities.OpportunityNotificationPreference.list();
        
        // Build preference map for quick lookup
        const preferenceMap = {};
        allPreferences.forEach(pref => {
            preferenceMap[pref.user_email] = pref;
        });

        const notifications = [];

        // Check each user to see if they should be notified
        for (const user of users) {
            const preference = preferenceMap[user.email];
            
            // If no preference exists, default is to notify all users
            if (!preference || preference.receive_all_notifications) {
                notifications.push(user.email);
                continue;
            }

            // Check if user has specific filtering preferences
            let shouldNotify = false;

            // Check funding lanes
            if (preference.funding_lanes && preference.funding_lanes.length > 0) {
                if (preference.funding_lanes.includes(opportunity.funding_lane)) {
                    shouldNotify = true;
                }
            }

            // Check grant subtypes
            if (preference.grant_subtypes && preference.grant_subtypes.length > 0 && opportunity.grant_subtype) {
                if (preference.grant_subtypes.includes(opportunity.grant_subtype)) {
                    shouldNotify = true;
                }
            }

            // Check sectors
            if (preference.sectors && preference.sectors.length > 0 && opportunity.sector_focus) {
                const hasMatchingSector = opportunity.sector_focus.some(sector => 
                    preference.sectors.includes(sector)
                );
                if (hasMatchingSector) {
                    shouldNotify = true;
                }
            }

            // Check amount range
            if (preference.min_amount || preference.max_amount) {
                const oppMin = opportunity.amount_min || 0;
                const oppMax = opportunity.amount_max || Infinity;
                const prefMin = preference.min_amount || 0;
                const prefMax = preference.max_amount || Infinity;
                
                // Check if there's overlap in the ranges
                if (oppMin <= prefMax && oppMax >= prefMin) {
                    shouldNotify = true;
                }
            }

            // Check geographic areas
            if (preference.geographic_areas && preference.geographic_areas.length > 0 && opportunity.geographic_focus) {
                const hasMatchingArea = preference.geographic_areas.some(area => 
                    opportunity.geographic_focus.toLowerCase().includes(area.toLowerCase())
                );
                if (hasMatchingArea) {
                    shouldNotify = true;
                }
            }

            if (shouldNotify) {
                notifications.push(user.email);
            }
        }

        // Send email notifications
        const emailPromises = notifications.map(async (email) => {
            const subject = `New Funding Opportunity: ${opportunity.title}`;
            
            const amountRange = opportunity.amount_min && opportunity.amount_max 
                ? `$${opportunity.amount_min.toLocaleString()} - $${opportunity.amount_max.toLocaleString()}`
                : opportunity.amount_min 
                    ? `Starting at $${opportunity.amount_min.toLocaleString()}`
                    : 'Amount not specified';

            const deadline = opportunity.deadline 
                ? new Date(opportunity.deadline).toLocaleDateString()
                : opportunity.rolling_deadline 
                    ? 'Rolling deadline'
                    : 'Not specified';

            const body = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #143A50;">New Funding Opportunity Available</h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #143A50; margin-top: 0;">${opportunity.title}</h3>
                        <p><strong>Funder:</strong> ${opportunity.funder_name || 'Not specified'}</p>
                        <p><strong>Type:</strong> ${opportunity.type} ${opportunity.grant_subtype ? `(${opportunity.grant_subtype})` : ''}</p>
                        <p><strong>Amount:</strong> ${amountRange}</p>
                        <p><strong>Deadline:</strong> ${deadline}</p>
                        ${opportunity.geographic_focus ? `<p><strong>Geographic Focus:</strong> ${opportunity.geographic_focus}</p>` : ''}
                        ${opportunity.sector_focus && opportunity.sector_focus.length > 0 
                            ? `<p><strong>Focus Areas:</strong> ${opportunity.sector_focus.join(', ')}</p>` 
                            : ''}
                    </div>

                    ${opportunity.description ? `
                        <div style="margin: 20px 0;">
                            <h4 style="color: #143A50;">Description</h4>
                            <p>${opportunity.description}</p>
                        </div>
                    ` : ''}

                    ${opportunity.eligibility_summary ? `
                        <div style="margin: 20px 0;">
                            <h4 style="color: #143A50;">Eligibility</h4>
                            <p>${opportunity.eligibility_summary}</p>
                        </div>
                    ` : ''}

                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${Deno.env.get('BASE44_APP_URL') || 'https://app.base44.com'}/Opportunities" 
                           style="background: #143A50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            View Opportunity Details
                        </a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="color: #6b7280; font-size: 12px;">
                        You're receiving this notification because you've opted to receive updates about new funding opportunities. 
                        To manage your notification preferences, visit your Settings page.
                    </p>
                </div>
            `;

            try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: email,
                    subject: subject,
                    body: body,
                    from_name: 'EIS Funding Alerts'
                });
                return { email, success: true };
            } catch (error) {
                console.error(`Failed to send email to ${email}:`, error);
                return { email, success: false, error: error.message };
            }
        });

        const results = await Promise.all(emailPromises);
        const successCount = results.filter(r => r.success).length;

        return Response.json({
            success: true,
            opportunity_title: opportunity.title,
            notifications_sent: successCount,
            total_users_checked: users.length,
            results: results
        });

    } catch (error) {
        console.error('Error in notifyNewOpportunity:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});