import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function parseAmount(str) {
  if (!str) return { min: null, max: null };
  const lower = str.toLowerCase();
  if (lower.includes('unspecified') || lower.includes('pending')) return { min: null, max: null };
  const matches = str.match(/\$[\d,]+(?:\.\d+)?/g);
  if (!matches || matches.length === 0) return { min: null, max: null };
  const amounts = matches.map(m => parseFloat(m.replace(/[$,]/g, '')));
  if (amounts.length === 1) return { min: amounts[0], max: amounts[0] };
  return { min: Math.min(...amounts), max: Math.max(...amounts) };
}

function parseDeadline(str) {
  if (!str) return { rolling: false, deadline: null };
  const lower = str.toLowerCase();
  if (lower.includes('rolling') || lower.includes('ongoing') || lower.includes('program-based') || lower.includes('invitation') || lower.includes('relationship')) {
    return { rolling: true, deadline: null };
  }
  const monthMatch = str.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?/i);
  if (monthMatch) {
    const monthStr = monthMatch[1].toLowerCase().substring(0, 3);
    const day = parseInt(monthMatch[2]);
    const year = monthMatch[3] ? parseInt(monthMatch[3]) : null;
    const months = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
    const monthIdx = months[monthStr];
    const now = new Date();
    let targetYear = year || now.getFullYear();
    if (!year) {
      const tentative = new Date(targetYear, monthIdx, day);
      if (tentative < now) targetYear++;
    }
    return { rolling: false, deadline: new Date(targetYear, monthIdx, day).toISOString().split('T')[0] };
  }
  return { rolling: false, deadline: null };
}

function extractUrl(str) {
  if (!str) return null;
  const urlMatch = str.match(/https?:\/\/[^\s,)]+/i);
  return urlMatch ? urlMatch[0] : null;
}

function extractFunderName(title) {
  if (!title) return null;
  const colonIdx = title.indexOf(':');
  if (colonIdx > 0) return title.substring(0, colonIdx).trim();
  // Use full title as funder name if no clear separator
  return title;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { file_url } = await req.json();
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    console.log('Extracting data from file:', file_url);

    const extracted = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          rows: {
            type: "array",
            items: {
              type: "object",
              properties: {
                "Opportunity": { type: "string" },
                "Entrepreneurship Services Fit": { type: "string" },
                "Geographic Fit": { type: "string" },
                "Typical Award": { type: "string" },
                "Recommended Ask": { type: "string" },
                "Due Date / Timing": { type: "string" },
                "Match Requirement": { type: "string" },
                "Application Path / Effort": { type: "string" }
              }
            }
          }
        },
        required: ["rows"]
      }
    });

    console.log('Extraction result status:', extracted.status);

    if (extracted.status !== 'success') {
      return Response.json({ error: 'Failed to extract data', details: extracted.details }, { status: 400 });
    }

    const rows = extracted.output?.rows || (Array.isArray(extracted.output) ? extracted.output : []);
    console.log(`Processing ${rows.length} rows`);

    let created = 0, updated = 0;

    for (const row of rows) {
      if (!row['Opportunity']) continue;

      const title = row['Opportunity'].trim();
      const funderName = extractFunderName(title);
      const amountSource = row['Recommended Ask'] || row['Typical Award'] || '';
      const { min: amountMin, max: amountMax } = parseAmount(amountSource);
      const { rolling, deadline } = parseDeadline(row['Due Date / Timing']);
      const appUrl = extractUrl(row['Application Path / Effort']);

      const opportunityData = {
        title,
        funder_name: funderName,
        description: row['Entrepreneurship Services Fit'] || null,
        eligibility_summary: row['Entrepreneurship Services Fit'] || null,
        geographic_focus: row['Geographic Fit'] || null,
        amount_min: amountMin,
        amount_max: amountMax,
        rolling_deadline: rolling,
        deadline: deadline || null,
        eligibility_requirements: row['Match Requirement'] || null,
        application_url: appUrl,
        internal_notes: row['Application Path / Effort'] || null,
        type: 'grant',
        funding_lane: 'grants',
        is_active: true,
      };

      const existing = await base44.asServiceRole.entities.FundingOpportunity.filter({ title });

      if (existing && existing.length > 0) {
        await base44.asServiceRole.entities.FundingOpportunity.update(existing[0].id, opportunityData);
        updated++;
        console.log(`Updated: ${title}`);
      } else {
        await base44.asServiceRole.entities.FundingOpportunity.create(opportunityData);
        created++;
        console.log(`Created: ${title}`);
      }
    }

    return Response.json({ success: true, created, updated, total: rows.length });
  } catch (error) {
    console.error('parseGrantMemos error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});