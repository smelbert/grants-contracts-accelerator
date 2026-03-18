import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PROPUBLICA_BASE = 'https://projects.propublica.org/nonprofits/api/v2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, query, ein } = await req.json();

    // Search organizations by name
    if (action === 'search') {
      if (!query) return Response.json({ error: 'query is required' }, { status: 400 });

      const url = `${PROPUBLICA_BASE}/search.json?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const data = await res.json();

      const orgs = (data.organizations || []).map(org => ({
        ein: org.ein,
        name: org.name,
        city: org.city,
        state: org.state,
        ntee_code: org.ntee_code,
        subsection_code: org.subsection_code,
        filing_count: org.filing_count,
      }));

      return Response.json({ organizations: orgs, total: data.total_results });
    }

    // Get org details + filings by EIN
    if (action === 'get_org') {
      if (!ein) return Response.json({ error: 'ein is required' }, { status: 400 });

      const cleanEin = ein.replace(/\D/g, '');
      const url = `${PROPUBLICA_BASE}/organizations/${cleanEin}.json`;
      const res = await fetch(url);

      if (!res.ok) {
        return Response.json({ error: `ProPublica returned ${res.status} for EIN ${cleanEin}` }, { status: 404 });
      }

      const data = await res.json();
      const org = data.organization || {};
      const filings = (data.filings_with_data || []).map(f => ({
        tax_prd_yr: f.tax_prd_yr,
        totrevenue: f.totrevenue,
        totfuncexpns: f.totfuncexpns,
        totassetsend: f.totassetsend,
        totliabend: f.totliabend,
        prgmservrev: f.prgmservrev,
        invstmntinc: f.invstmntinc,
        grntspaidnet: f.grntspaidnet,
        grscontrib: f.grscontrib,
        pdf_url: f.pdf_url,
      }));

      return Response.json({
        organization: {
          ein: org.ein,
          name: org.name,
          city: org.city,
          state: org.state,
          address: org.address,
          zipcode: org.zipcode,
          ntee_code: org.ntee_code,
          subsection_code: org.subsection_code,
          ruling: org.ruling,
          foundation: org.foundation,
          activity: org.activity,
          ntee_common_code: org.ntee_common_code,
          classification: org.classification,
        },
        filings,
        most_recent: filings[0] || null,
      });
    }

    return Response.json({ error: 'Invalid action. Use "search" or "get_org".' }, { status: 400 });

  } catch (error) {
    console.error('ProPublica lookup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});