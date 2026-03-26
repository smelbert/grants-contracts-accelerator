import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const API_KEY = Deno.env.get("GRANTED_AI_API_KEY") || "ga_live_c1eee54a9ad8753126b303aeafed3621dd563f67fcc77c74c8b150a028dc42ea";
const BASE_URL = "https://grantedai.com/api/v1";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, state, source, org_type, limit } = await req.json();

    if (!query || query.length < 3) {
      return Response.json({ error: 'Query must be at least 3 characters' }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.set('q', query);
    params.set('api_key', API_KEY);
    if (state && state !== 'all_states') params.set('state', state);
    if (source && source !== 'all_sources') params.set('source', source);
    if (org_type && org_type !== 'all_orgs') params.set('org_type', org_type);
    if (limit) params.set('limit', String(limit));

    const url = `${BASE_URL}/discover?${params.toString()}`;
    console.log("[GrantedAI] Fetching:", url.replace(API_KEY, 'REDACTED'));

    const response = await fetch(url);
    const responseText = await response.text();

    if (!response.ok) {
      console.error("[GrantedAI] Error:", response.status, responseText);
      return Response.json({ error: `Granted API error: ${response.status}` }, { status: response.status });
    }

    const data = JSON.parse(responseText);
    
    return Response.json({
      ...data,
      rateLimitInfo: {
        limit: response.headers.get('X-RateLimit-Limit'),
        tier: response.headers.get('X-Api-Tier'),
      }
    });
  } catch (error) {
    console.error('[GrantedAI] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});