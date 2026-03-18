import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, participant_email } = await req.json();
    const email = participant_email || user.email;

    // Fetch participant data
    const [enrollment, progress, workbookResponses, assessments, allParticipants, discussions] = await Promise.all([
      base44.entities.ProgramEnrollment.filter({ participant_email: email }),
      base44.entities.UserProgress.filter({ user_email: email }),
      base44.entities.WorkbookResponse.filter({ user_email: email }),
      base44.entities.GrantWritingAssessment.filter({ user_email: email }),
      base44.asServiceRole.entities.ProgramEnrollment.list(),
      base44.entities.Discussion.filter({ space_id: 'incubateher-program' }, '-created_date', 20)
    ]);

    const participant = enrollment[0];
    if (!participant) {
      return Response.json({ error: 'Not enrolled in IncubateHer' }, { status: 404 });
    }

    switch (action) {
      case 'recommend_discussions':
        return await recommendDiscussions(base44, participant, progress, workbookResponses, discussions);
      
      case 'generate_prompts':
        return await generateDiscussionPrompts(base44, participant, allParticipants, discussions);
      
      case 'flag_valuable':
        return await flagValuableDiscussions(base44, discussions);
      
      case 'suggest_connections':
        return await suggestConnections(base44, participant, allParticipants, workbookResponses);
      
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('IncubateHer Community AI Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function recommendDiscussions(base44, participant, progress, workbookResponses, discussions) {
  // Analyze participant's journey
  const completedModules = progress.filter(p => p.is_completed).length;
  const totalProgress = progress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / Math.max(progress.length, 1);
  
  // Extract participant's stated goals and challenges
  const goals = workbookResponses.find(r => r.field_id === 'goals')?.response || '';
  const challenges = workbookResponses.find(r => r.field_id === 'challenges')?.response || '';
  const readinessGaps = workbookResponses.find(r => r.field_id === 'whats_missing')?.response || '';

  const prompt = `Analyze this IncubateHer participant's profile and recommend 3-4 existing community discussions that would be most valuable for them right now.

Participant Profile:
- Progress: ${Math.round(totalProgress)}% complete, ${completedModules} modules finished
- Consultation completed: ${participant.consultation_completed ? 'Yes' : 'Not yet'}
- Goals: ${goals || 'Not specified'}
- Challenges: ${challenges || 'Not specified'}
- Readiness gaps: ${readinessGaps || 'Not specified'}

Available Discussions:
${discussions.map((d, idx) => `${idx + 1}. "${d.title}" - ${d.content?.substring(0, 150)}...`).join('\n')}

Return a JSON array with 3-4 recommendations. Each should have:
- discussion_id: the ID from the list above
- relevance_score: 1-10
- reason: brief explanation why this discussion is relevant to their current stage/goals (1-2 sentences)

Format: {"recommendations": [{"discussion_id": "...", "relevance_score": 8, "reason": "..."}]}`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        recommendations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              discussion_id: { type: 'string' },
              relevance_score: { type: 'number' },
              reason: { type: 'string' }
            }
          }
        }
      }
    }
  });

  // Match recommendations with full discussion data
  const enrichedRecommendations = response.recommendations.map(rec => {
    const discussion = discussions.find(d => d.id === rec.discussion_id);
    return {
      ...rec,
      discussion
    };
  }).filter(r => r.discussion);

  return Response.json({ recommendations: enrichedRecommendations });
}

async function generateDiscussionPrompts(base44, participant, allParticipants, discussions) {
  // Analyze cohort stage
  const cohortSize = allParticipants.length;
  const consultationsCompleted = allParticipants.filter(p => p.consultation_completed).length;
  const assessmentsCompleted = allParticipants.filter(p => p.pre_assessment_completed && p.post_assessment_completed).length;
  
  // Get recent discussion topics
  const recentTopics = discussions.slice(0, 5).map(d => d.title);

  const prompt = `Generate 3 timely discussion prompts for the IncubateHer community based on the cohort's current stage and recent activity.

Cohort Status:
- Total participants: ${cohortSize}
- Consultations completed: ${consultationsCompleted}/${cohortSize}
- Assessments completed: ${assessmentsCompleted}/${cohortSize}
- Recent discussion topics: ${recentTopics.join(', ')}

Requirements:
- Prompts should address common funding readiness challenges
- Encourage peer-to-peer learning and vulnerability
- Be practical and actionable
- Avoid duplicating recent topics
- Focus on building systems, not just getting money

Return JSON with 3 prompts. Each should have:
- title: engaging discussion title (question or statement)
- description: 2-3 sentences explaining what to discuss
- category: one of ["legal_foundations", "financial_systems", "documentation", "capacity_building", "grant_strategy", "contract_readiness", "mindset_shifts"]
- target_stage: one of ["early" (0-30% progress), "mid" (31-70%), "advanced" (71-100%), "all"]

Format: {"prompts": [{"title": "...", "description": "...", "category": "...", "target_stage": "..."}]}`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        prompts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              target_stage: { type: 'string' }
            }
          }
        }
      }
    }
  });

  return Response.json(response);
}

async function flagValuableDiscussions(base44, discussions) {
  // Analyze discussions for high value indicators
  const discussionsData = discussions.map(d => ({
    id: d.id,
    title: d.title,
    content: d.content?.substring(0, 500),
    author: d.author_email,
    replies_count: d.replies_count || 0,
    created_date: d.created_date
  }));

  const prompt = `Analyze these IncubateHer community discussions and identify the top 3-4 that contain the most valuable insights for funding readiness.

High-value indicators:
- Specific, actionable advice (not just general encouragement)
- Real-world examples or case studies
- Expert knowledge or professional experience
- Common pitfalls and how to avoid them
- Systems-building guidance
- Honest vulnerability about challenges

Discussions:
${discussionsData.map((d, idx) => `${idx + 1}. "${d.title}" by ${d.author}\n${d.content}`).join('\n\n')}

Return JSON with 3-4 flagged discussions. Each should have:
- discussion_id: the ID
- value_score: 1-10
- value_type: one of ["expert_insight", "practical_advice", "common_pitfall", "success_story", "systems_guidance"]
- highlight: specific quote or insight that makes this valuable (1 sentence)

Format: {"flagged": [{"discussion_id": "...", "value_score": 9, "value_type": "...", "highlight": "..."}]}`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        flagged: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              discussion_id: { type: 'string' },
              value_score: { type: 'number' },
              value_type: { type: 'string' },
              highlight: { type: 'string' }
            }
          }
        }
      }
    }
  });

  // Enrich with discussion data
  const enriched = response.flagged.map(f => {
    const discussion = discussions.find(d => d.id === f.discussion_id);
    return { ...f, discussion };
  }).filter(f => f.discussion);

  return Response.json({ flagged: enriched });
}

async function suggestConnections(base44, participant, allParticipants, workbookResponses) {
  // Get all participants' workbook responses
  const allResponses = await base44.asServiceRole.entities.WorkbookResponse.list();
  
  // Build profiles for each participant
  const profiles = allParticipants.filter(p => p.participant_email !== participant.participant_email).map(p => {
    const responses = allResponses.filter(r => r.user_email === p.participant_email);
    return {
      email: p.participant_email,
      name: p.participant_name,
      role: p.role,
      challenges: responses.find(r => r.field_id === 'challenges')?.response || '',
      strengths: responses.find(r => r.field_id === 'where_strong_notes')?.response || '',
      goals: responses.find(r => r.field_id === 'goals')?.response || '',
      readiness_gaps: responses.find(r => r.field_id === 'whats_missing')?.response || ''
    };
  });

  // Get current participant's profile
  const myResponses = workbookResponses;
  const myProfile = {
    challenges: myResponses.find(r => r.field_id === 'challenges')?.response || '',
    strengths: myResponses.find(r => r.field_id === 'where_strong_notes')?.response || '',
    goals: myResponses.find(r => r.field_id === 'goals')?.response || '',
    readiness_gaps: myResponses.find(r => r.field_id === 'whats_missing')?.response || ''
  };

  const prompt = `Analyze this IncubateHer participant's profile and suggest 3-4 fellow participants they should connect with based on complementary skills, similar challenges, or mutual benefit.

My Profile:
- Challenges: ${myProfile.challenges || 'Not specified'}
- Strengths: ${myProfile.strengths || 'Not specified'}
- Goals: ${myProfile.goals || 'Not specified'}
- Readiness gaps: ${myProfile.readiness_gaps || 'Not specified'}

Other Participants:
${profiles.slice(0, 15).map((p, idx) => `${idx + 1}. ${p.name}
   Challenges: ${p.challenges?.substring(0, 100) || 'Not specified'}
   Strengths: ${p.strengths?.substring(0, 100) || 'Not specified'}
   Goals: ${p.goals?.substring(0, 100) || 'Not specified'}`).join('\n\n')}

Return JSON with 3-4 connection suggestions. Each should have:
- participant_email: from the list
- match_score: 1-10
- match_type: one of ["similar_challenge", "complementary_skills", "shared_goals", "mutual_learning"]
- connection_reason: why they should connect (2-3 sentences, specific and actionable)

Format: {"connections": [{"participant_email": "...", "match_score": 8, "match_type": "...", "connection_reason": "..."}]}`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        connections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              participant_email: { type: 'string' },
              match_score: { type: 'number' },
              match_type: { type: 'string' },
              connection_reason: { type: 'string' }
            }
          }
        }
      }
    }
  });

  // Enrich with participant data
  const enriched = response.connections.map(c => {
    const participant = profiles.find(p => p.email === c.participant_email);
    return { ...c, participant };
  }).filter(c => c.participant);

  return Response.json({ connections: enriched });
}