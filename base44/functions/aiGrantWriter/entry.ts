import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      action, // 'generate', 'refine', 'suggest_keywords', 'strengthen'
      organization_id,
      project_description,
      existing_text,
      section_name,
      character_limit,
      rfp_guidelines,
      target_audience,
      tone_preference,
      funder_research_data
    } = await req.json();

    console.log(`AI Grant Writer - Action: ${action}`);

    // Fetch organization data for context
    let organization = null;
    if (organization_id) {
      organization = await base44.entities.Organization.get(organization_id);
    } else {
      const orgs = await base44.entities.Organization.filter({ created_by: user.email });
      organization = orgs[0];
    }

    if (!organization && action !== 'refine') {
      return Response.json({ 
        error: 'Organization profile required. Please complete your profile first.' 
      }, { status: 404 });
    }

    const organizationContext = organization ? `
ORGANIZATION PROFILE:
Name: ${organization.organization_name}
Mission: ${organization.mission_statement}
Budget Size: $${organization.annual_budget?.toLocaleString() || 'N/A'}
Location: ${organization.location}
Sector: ${organization.sector}
Focus Areas: ${organization.focus_areas?.join(', ') || 'N/A'}
Years in Operation: ${organization.years_in_operation || 'N/A'}
Staff Count: ${organization.staff_count || 'N/A'}
` : '';

    // ACTION: Generate draft proposal
    if (action === 'generate') {
      const generatePrompt = `You are an expert grant writer with 20+ years of experience winning competitive federal, state, and foundation grants. Generate a compelling, narrative grant proposal section.

${organizationContext}

PROJECT DESCRIPTION:
${project_description}

SECTION TO WRITE: ${section_name || 'Narrative'}
${character_limit ? `CHARACTER LIMIT: ${character_limit} characters (be close to limit but don't exceed)` : ''}
${rfp_guidelines ? `\nRFP GUIDELINES:\n${rfp_guidelines}` : ''}
${target_audience ? `\nTARGET AUDIENCE: ${target_audience}` : ''}
${funder_research_data ? `\nFUNDER RESEARCH:\n${funder_research_data}` : ''}

GRANT WRITING BEST PRACTICES TO FOLLOW:
1. Start with a compelling hook that demonstrates urgency and impact
2. Use specific data, statistics, and quantifiable outcomes
3. Tell a story that connects emotionally while maintaining professionalism
4. Clearly articulate the problem, solution, and expected impact
5. Demonstrate organizational capacity and track record
6. Use active voice and strong action verbs
7. Address all RFP requirements explicitly
8. Maintain appropriate tone: ${tone_preference || 'professional yet passionate'}
9. Include measurable goals and evaluation methods
10. Align with funder's mission and priorities

Write a complete, polished narrative that reads naturally and meets all requirements. Make it compelling enough to stand out from hundreds of applications.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: generatePrompt,
        response_json_schema: {
          type: "object",
          properties: {
            draft_text: { type: "string" },
            character_count: { type: "number" },
            key_strengths: { type: "array", items: { type: "string" } },
            alignment_notes: { type: "string" },
            suggested_edits: { type: "array", items: { type: "string" } }
          }
        }
      });

      console.log(`Generated draft: ${result.character_count} characters`);
      return Response.json({ success: true, ...result });
    }

    // ACTION: Refine existing text
    if (action === 'refine') {
      const refinePrompt = `You are an expert grant editor. Refine this grant proposal text to maximize impact and clarity.

ORIGINAL TEXT:
${existing_text}

${organizationContext}
${character_limit ? `CHARACTER LIMIT: ${character_limit} characters` : ''}
${rfp_guidelines ? `\nRFP GUIDELINES:\n${rfp_guidelines}` : ''}

REFINEMENT GOALS:
1. Improve clarity and flow
2. Strengthen impact statements with more compelling language
3. Add specific data points where generic statements exist
4. Ensure active voice throughout
5. Eliminate jargon and wordiness
6. Enhance emotional resonance while maintaining professionalism
7. Ensure all RFP requirements are explicitly addressed
8. Meet character limit while maximizing content
9. Strengthen opening and closing statements
10. Add transitional phrases for better readability

Provide both the refined text and detailed feedback on changes made.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: refinePrompt,
        response_json_schema: {
          type: "object",
          properties: {
            refined_text: { type: "string" },
            character_count: { type: "number" },
            changes_made: { type: "array", items: { type: "string" } },
            improvement_summary: { type: "string" },
            additional_suggestions: { type: "array", items: { type: "string" } }
          }
        }
      });

      console.log(`Refined text: ${result.character_count} characters`);
      return Response.json({ success: true, ...result });
    }

    // ACTION: Suggest keywords and data points
    if (action === 'suggest_keywords') {
      const keywordPrompt = `Analyze this grant proposal text and suggest strategic improvements.

TEXT TO ANALYZE:
${existing_text || project_description}

${organizationContext}
${rfp_guidelines ? `\nRFP GUIDELINES:\n${rfp_guidelines}` : ''}
${funder_research_data ? `\nFUNDER RESEARCH:\n${funder_research_data}` : ''}

Provide:
1. KEYWORDS: Important terms and phrases that should be included to align with RFP and funder priorities
2. DATA POINTS: Specific statistics, metrics, or quantifiable information that would strengthen the proposal
3. IMPACT PHRASES: Compelling language that demonstrates outcomes and transformation
4. MISSING ELEMENTS: Critical components that should be added based on RFP requirements
5. FUNDER ALIGNMENT: Specific ways to better align with funder's stated priorities`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: keywordPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_keywords: { type: "array", items: { type: "string" } },
            recommended_data_points: { type: "array", items: { type: "string" } },
            impact_phrases: { type: "array", items: { type: "string" } },
            missing_elements: { type: "array", items: { type: "string" } },
            funder_alignment_tips: { type: "array", items: { type: "string" } }
          }
        }
      });

      console.log('Keyword suggestions generated');
      return Response.json({ success: true, ...result });
    }

    // ACTION: Strengthen specific section
    if (action === 'strengthen') {
      const strengthenPrompt = `You are a grant writing expert. Strengthen this specific section of a grant proposal.

SECTION NAME: ${section_name}
CURRENT TEXT:
${existing_text}

${organizationContext}
${character_limit ? `CHARACTER LIMIT: ${character_limit} characters` : ''}
${rfp_guidelines ? `\nRFP REQUIREMENTS FOR THIS SECTION:\n${rfp_guidelines}` : ''}

STRENGTHENING STRATEGIES:
1. Add compelling statistics and quantifiable outcomes
2. Include specific examples and case studies
3. Use more powerful action verbs and impact language
4. Address potential funder concerns proactively
5. Demonstrate unique value proposition
6. Show alignment with funder's mission
7. Include evidence of organizational capacity
8. Strengthen the call to action or urgency
9. Add relevant research or literature citations
10. Make the impact more tangible and measurable

Provide the strengthened version with explanations of key improvements.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: strengthenPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            strengthened_text: { type: "string" },
            character_count: { type: "number" },
            key_improvements: { type: "array", items: { type: "string" } },
            impact_analysis: { type: "string" },
            before_after_comparison: { type: "string" }
          }
        }
      });

      console.log('Section strengthened');
      return Response.json({ success: true, ...result });
    }

    return Response.json({ 
      error: 'Invalid action. Must be: generate, refine, suggest_keywords, or strengthen' 
    }, { status: 400 });

  } catch (error) {
    console.error('Error in AI grant writer:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});