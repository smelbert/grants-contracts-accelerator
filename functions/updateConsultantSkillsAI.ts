import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { consultant_email } = await req.json();

    if (!consultant_email) {
      return Response.json({ error: 'consultant_email is required' }, { status: 400 });
    }

    // Fetch consultant data
    const [skills, onboarding, trainings, reviewRequests, interactions] = await Promise.all([
      base44.asServiceRole.entities.ConsultantSkill.filter({ consultant_email }),
      base44.asServiceRole.entities.ConsultantOnboarding.filter({ consultant_email }).then(r => r[0]),
      base44.asServiceRole.entities.CoachTraining.list(),
      base44.asServiceRole.entities.ReviewRequest.filter({ consultant_email }),
      base44.asServiceRole.entities.ClientInteraction.filter({ created_by: consultant_email })
    ]);

    // Calculate performance metrics
    const approvedReviews = reviewRequests.filter(r => r.status === 'approved').length;
    const totalReviews = reviewRequests.length;
    const approvalRate = totalReviews > 0 ? approvedReviews / totalReviews : 0;

    const completedTrainings = onboarding?.modules_completed?.length || 0;

    // Build AI prompt with comprehensive data
    const prompt = `You are an AI skill progression analyst. Analyze the consultant's performance data and provide updated skill assessments.

Consultant: ${consultant_email}
Current Level: ${onboarding?.current_level || 'level-1'}

Performance Data:
- Total Reviews: ${totalReviews}
- Approved Reviews: ${approvedReviews}
- Approval Rate: ${(approvalRate * 100).toFixed(1)}%
- Completed Training Modules: ${completedTrainings}
- Drafts Submitted: ${onboarding?.drafts_submitted || 0}
- Drafts Approved: ${onboarding?.drafts_approved || 0}
- Funded Proposals: ${onboarding?.funded_proposals_count || 0}
- Client Interactions: ${interactions.length}

Current Skills Assessment:
${skills.map(s => `- ${s.skill_name} (${s.skill_category}): Self=${s.self_assessment_level || 'N/A'}, Coach=${s.coach_validated_level || 'N/A'}, AI=${s.ai_projected_level || 'N/A'}`).join('\n')}

Recent Review Feedback:
${reviewRequests.slice(-5).map(r => `- ${r.document_type}: ${r.status} - ${r.feedback || 'No feedback'}`).join('\n')}

Based on this data, provide AI-projected skill levels (1-5 scale) for each existing skill. Consider:
1. Performance trends (approval rates, successful deliverables)
2. Training completion aligned with skills
3. Consistency between self-assessment and coach validation
4. Recent feedback patterns

For each skill, provide:
- Updated AI projected level (number between 1-5)
- Confidence score (0-1)
- Key evidence supporting the projection
- Recommended focus areas

Return a JSON object with this structure:
{
  "skills_updates": [
    {
      "skill_id": "skill_id_here",
      "ai_projected_level": 3.5,
      "confidence": 0.85,
      "evidence": ["evidence point 1", "evidence point 2"],
      "recommendations": ["recommendation 1", "recommendation 2"]
    }
  ],
  "overall_analysis": "Brief overall assessment of consultant's skill progression"
}`;

    // Call AI to analyze skills
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          skills_updates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                skill_id: { type: 'string' },
                ai_projected_level: { type: 'number' },
                confidence: { type: 'number' },
                evidence: { type: 'array', items: { type: 'string' } },
                recommendations: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          overall_analysis: { type: 'string' }
        }
      }
    });

    // Update skills with AI projections
    const updates = [];
    for (const update of aiResponse.skills_updates) {
      const skill = skills.find(s => s.id === update.skill_id);
      if (!skill) continue;

      const progressionEntry = {
        date: new Date().toISOString(),
        level: update.ai_projected_level,
        source: 'ai_calculation',
        notes: `AI Analysis (${(update.confidence * 100).toFixed(0)}% confidence): ${update.evidence.join('; ')}`
      };

      const newEvidence = [
        ...(skill.evidence || []),
        {
          type: 'ai_analysis',
          date: new Date().toISOString(),
          impact_score: update.confidence,
          details: update.recommendations.join('; ')
        }
      ];

      const updatedHistory = [...(skill.progression_history || []), progressionEntry];

      await base44.asServiceRole.entities.ConsultantSkill.update(skill.id, {
        ai_projected_level: update.ai_projected_level,
        last_ai_updated: new Date().toISOString(),
        progression_history: updatedHistory,
        evidence: newEvidence
      });

      updates.push({
        skill_name: skill.skill_name,
        previous_level: skill.ai_projected_level,
        new_level: update.ai_projected_level,
        confidence: update.confidence
      });
    }

    return Response.json({
      success: true,
      updates,
      overall_analysis: aiResponse.overall_analysis,
      skills_analyzed: skills.length,
      skills_updated: updates.length
    });

  } catch (error) {
    console.error('Error updating consultant skills:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});