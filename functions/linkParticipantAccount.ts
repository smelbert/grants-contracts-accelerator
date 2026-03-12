/**
 * linkParticipantAccount
 * Called on login to match the logged-in user to their ProgramEnrollment.
 * Matching strategy (in order):
 *   1. Exact email match on participant_email
 *   2. Exact email match on login_email
 *   3. First+last name fuzzy match (handles email change case)
 * If a match is found, saves login_email + user_id on the enrollment.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function normalizeName(name) {
  return (name || '').toLowerCase().replace(/[^a-z\s]/g, '').trim();
}

function namesMatch(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  // Check if all words in the shorter name appear in the longer name
  const wordsA = na.split(/\s+/);
  const wordsB = nb.split(/\s+/);
  const shorter = wordsA.length <= wordsB.length ? wordsA : wordsB;
  const longer = wordsA.length <= wordsB.length ? wordsB : wordsA;
  return shorter.every(w => longer.includes(w));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cohort_id } = await req.json().catch(() => ({}));

    // Find all active enrollments for this cohort (or all cohorts if not specified)
    const filter = { enrollment_status: 'active', role: 'participant' };
    if (cohort_id) filter.cohort_id = cohort_id;

    const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter(filter);

    // 1. Exact email match
    let match = enrollments.find(e =>
      e.participant_email?.toLowerCase() === user.email?.toLowerCase() ||
      e.login_email?.toLowerCase() === user.email?.toLowerCase()
    );

    // 2. Already linked by user_id
    if (!match) {
      match = enrollments.find(e => e.user_id === user.id);
    }

    // 3. Name-based fuzzy match (catches different email scenario)
    if (!match && user.full_name) {
      match = enrollments.find(e => namesMatch(e.participant_name, user.full_name));
    }

    if (!match) {
      return Response.json({ linked: false, message: 'No matching enrollment found' });
    }

    // Update the enrollment with the login account info
    const updates = {};
    if (!match.user_id) updates.user_id = user.id;
    if (!match.login_email || match.login_email !== user.email) updates.login_email = user.email;

    if (Object.keys(updates).length > 0) {
      await base44.asServiceRole.entities.ProgramEnrollment.update(match.id, updates);
      console.log(`[linkParticipant] Linked user ${user.email} (id: ${user.id}) to enrollment ${match.id} (${match.participant_name})`);
    }

    return Response.json({
      linked: true,
      enrollment_id: match.id,
      participant_name: match.participant_name,
      participant_email: match.participant_email,
      login_email: user.email,
      was_email_mismatch: match.participant_email?.toLowerCase() !== user.email?.toLowerCase()
    });

  } catch (error) {
    console.error('[linkParticipantAccount] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});