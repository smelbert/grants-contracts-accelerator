import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const {
      content_text,
      content_type,
      content_id,
      space_id,
      space_name,
      author_email,
      author_name
    } = await req.json();

    if (!content_text || !content_type || !content_id) {
      return Response.json(
        { error: 'content_text, content_type, and content_id are required.' },
        { status: 400 }
      );
    }

    console.log(`Analyzing ${content_type} for moderation: ${content_id}`);

    // Use AI to analyze content
    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a content moderation expert. Analyze the following user-generated content and determine if it violates community guidelines.

Content:
"${content_text}"

Evaluate for:
1. Inappropriate/offensive language
2. Spam or advertising
3. Harmful, dangerous, or illegal content
4. Misinformation or conspiracy theories
5. Harassment or threats

Return a JSON response with:
- flag_reason: one of "inappropriate_language", "spam", "harmful_content", "misinformation", "harassment", "other", or "none"
- confidence_score: 0-100 (how confident the content violates policy)
- analysis: brief explanation of findings
- suggested_action: "approve", "hide", or "remove"`,
      response_json_schema: {
        type: 'object',
        properties: {
          flag_reason: { type: 'string' },
          confidence_score: { type: 'number' },
          analysis: { type: 'string' },
          suggested_action: { type: 'string' }
        }
      }
    });

    console.log('AI moderation analysis:', analysisResult);

    // If content violates policies (confidence > 60), create a flag
    if (analysisResult.flag_reason !== 'none' && analysisResult.confidence_score > 60) {
      const flag = await base44.asServiceRole.entities.ContentModerationFlag.create({
        content_type,
        content_id,
        content_text: content_text.substring(0, 500), // Store first 500 chars
        space_id: space_id || null,
        space_name: space_name || null,
        author_email,
        author_name,
        flag_reason: analysisResult.flag_reason,
        ai_confidence_score: analysisResult.confidence_score,
        ai_analysis: analysisResult.analysis,
        ai_suggested_action: analysisResult.suggested_action,
        status: 'pending_review',
        auto_flagged: true
      });

      console.log(`Created moderation flag: ${flag.id}`);

      return Response.json({
        success: true,
        flagged: true,
        flag_id: flag.id,
        reason: analysisResult.flag_reason,
        confidence_score: analysisResult.confidence_score,
        analysis: analysisResult.analysis,
        suggested_action: analysisResult.suggested_action
      });
    }

    console.log('Content passed moderation checks');

    return Response.json({
      success: true,
      flagged: false,
      message: 'Content passed moderation',
      confidence_score: analysisResult.confidence_score
    });

  } catch (error) {
    console.error('Error in moderateContent function:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});