import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const regions = [
      { label: 'Ohio Statewide', query: 'small business funding grants opportunities Ohio 2026' },
      { label: 'Columbus / Franklin County', query: 'small business grants opportunities Columbus Franklin County Ohio 2026' },
      { label: 'Central Ohio', query: 'small business entrepreneur opportunities Central Ohio 2026' },
    ];

    const categories = ['funding', 'grants', 'policy', 'events', 'trends'];
    const allArticles = [];

    for (const region of regions) {
      const prompt = `
You are a business intelligence researcher. Search the web for the LATEST news, grants, funding opportunities, and resources for small business owners in ${region.label}.

Focus on:
- New grant or funding programs available
- Government or nonprofit small business support programs
- Policy changes affecting small businesses
- Upcoming events or workshops for entrepreneurs
- General business trends in the region

Return a JSON array of up to 6 relevant items. Each item must have:
- title: clear, specific headline (string)
- summary: 2-3 sentence description of the opportunity or news item (string)
- source: organization or publication name (string)
- url: source URL if available, otherwise empty string (string)
- category: one of "funding", "grants", "policy", "events", "trends", "general" (string)
- published_date: estimated date in YYYY-MM-DD format (string)

Only include items that are current, relevant, and actionable for small business owners in ${region.label}.
      `;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            articles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  summary: { type: 'string' },
                  source: { type: 'string' },
                  url: { type: 'string' },
                  category: { type: 'string' },
                  published_date: { type: 'string' }
                }
              }
            }
          }
        }
      });

      const articles = result?.articles || [];
      for (const article of articles) {
        allArticles.push({
          ...article,
          region: region.label,
          fetched_date: new Date().toISOString(),
          is_active: true
        });
      }

      console.log(`Fetched ${articles.length} items for ${region.label}`);
    }

    // Clear old articles and insert fresh ones
    const existing = await base44.asServiceRole.entities.LocalBusinessNews.list();
    for (const old of existing) {
      await base44.asServiceRole.entities.LocalBusinessNews.delete(old.id);
    }

    for (const article of allArticles) {
      await base44.asServiceRole.entities.LocalBusinessNews.create(article);
    }

    return Response.json({
      success: true,
      total: allArticles.length,
      message: `Fetched and saved ${allArticles.length} news items across ${regions.length} regions.`
    });

  } catch (error) {
    console.error('fetchLocalBusinessNews error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});