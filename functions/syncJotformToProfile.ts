import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * syncJotformToProfile
 * Takes enrollment jotform_data and syncs it into the Organization profile.
 * Also pre-populates workbook responses where possible.
 * Can be called:
 *  - by admin for a specific participant: { enrollment_id }
 *  - by admin for all participants: { sync_all: true, cohort_id }
 *  - automatically after JotForm import
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { enrollment_id, sync_all, cohort_id } = body;

    // Determine which enrollments to process
    let enrollments = [];
    if (sync_all && cohort_id) {
      if (user.role !== 'admin' && user.role !== 'owner') {
        return Response.json({ error: 'Admin only' }, { status: 403 });
      }
      enrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({ cohort_id });
    } else if (enrollment_id) {
      const e = await base44.asServiceRole.entities.ProgramEnrollment.get('ProgramEnrollment', enrollment_id);
      if (e) enrollments = [e];
    } else {
      // Sync current user's own enrollment
      const myEnrollments = await base44.entities.ProgramEnrollment.filter({ participant_email: user.email });
      enrollments = myEnrollments.filter(e => e.cohort_id).slice(0, 1);
    }

    if (enrollments.length === 0) {
      return Response.json({ message: 'No enrollments found to sync', synced: 0 });
    }

    const results = [];

    for (const enrollment of enrollments) {
      const jd = enrollment.jotform_data || {};
      const email = enrollment.participant_email;
      if (!email) continue;

      // Map JotForm fields to Organization fields
      const orgData = {
        primary_contact_email: email,
        enrollment_id: enrollment.id,
      };

      if (enrollment.organization_name) orgData.organization_name = enrollment.organization_name;
      if (enrollment.participant_name) orgData.executive_director = enrollment.participant_name;

      // Map from jotform_data fields
      if (jd.org_type) orgData.organization_type = jd.org_type;
      if (jd.annual_revenue) orgData.annual_budget = jd.annual_revenue;
      if (jd.goals) orgData.funding_goals = jd.goals;
      if (jd.existing_items) orgData.programs_offered = jd.existing_items;
      if (jd.grant_experience) orgData.grant_experience_level = mapGrantExperience(jd.grant_experience);
      if (jd.funding_barrier) orgData.capacity_building_needs = jd.funding_barrier;
      if (jd.employees) orgData.staff_count = jd.employees;
      if (jd.years_in_business) orgData.founding_year = estimateFoudingYear(jd.years_in_business);

      // Check if org profile exists
      const existing = await base44.asServiceRole.entities.Organization.filter({
        primary_contact_email: email
      });

      let orgProfile;
      if (existing[0]) {
        // Only update fields that are empty/missing
        const updates = {};
        for (const [key, value] of Object.entries(orgData)) {
          if (!existing[0][key] && value) updates[key] = value;
        }
        if (Object.keys(updates).length > 0) {
          orgProfile = await base44.asServiceRole.entities.Organization.update(existing[0].id, updates);
        } else {
          orgProfile = existing[0];
        }
      } else {
        orgProfile = await base44.asServiceRole.entities.Organization.create(orgData);
      }

      // Also update the User record with org name if missing
      try {
        const users = await base44.asServiceRole.entities.User.filter({ email });
        if (users[0] && !users[0].organization_name && enrollment.organization_name) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            organization_name: enrollment.organization_name
          });
        }
      } catch (e) {
        console.warn('Could not update user org name:', e.message);
      }

      results.push({
        email,
        org_id: orgProfile?.id,
        status: 'synced'
      });

      console.log(`Synced ${email} -> org profile ${orgProfile?.id}`);
    }

    return Response.json({
      message: `Synced ${results.length} profile(s)`,
      synced: results.length,
      results
    });

  } catch (error) {
    console.error('syncJotformToProfile error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function mapGrantExperience(val) {
  if (!val) return '';
  const v = val.toLowerCase();
  if (v.includes('never') || v.includes('no experience') || v.includes('beginner')) return 'beginner';
  if (v.includes('some') || v.includes('tried') || v.includes('little')) return 'intermediate';
  if (v.includes('several') || v.includes('multiple') || v.includes('moderate')) return 'intermediate';
  if (v.includes('extensive') || v.includes('many') || v.includes('advanced')) return 'advanced';
  return 'beginner';
}

function estimateFoudingYear(yearsInBusiness) {
  if (!yearsInBusiness) return '';
  const match = String(yearsInBusiness).match(/\d+/);
  if (!match) return '';
  const years = parseInt(match[0]);
  return String(new Date().getFullYear() - years);
}