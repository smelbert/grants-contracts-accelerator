// Utility functions for building structured content items used by the exportPacket backend function.
// Each item has: { name, title, subtitle, meta, badges, sections: [{ heading, body, listItems, checklistItems }] }

const EIS_FOOTER = 'Elbert Innovative Solutions';

function formatDate() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Build a structured content item for a Resource Library Template entity
export function buildResourceTemplateItem(template) {
  const badges = [
    template.category || 'General',
    template.maturity_level || 'All',
    template.funding_lane || 'General',
  ].filter(Boolean);

  const sections = [];

  if (template.when_to_use) {
    sections.push({ heading: '✓ When to Use', body: template.when_to_use });
  }
  if (template.when_not_to_use) {
    sections.push({ heading: '✗ When NOT to Use', body: template.when_not_to_use });
  }
  if (template.what_funders_look_for) {
    sections.push({ heading: '👁 What Funders Look For', body: template.what_funders_look_for });
  }
  if (template.common_mistakes) {
    sections.push({ heading: '⚠ Common Mistakes to Avoid', body: template.common_mistakes });
  }

  // Strip HTML tags from template_content for the PDF body
  if (template.template_content) {
    const plainContent = template.template_content.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (plainContent) {
      sections.push({ heading: 'Template Content', body: plainContent });
    }
  }

  return {
    name: template.template_name || 'Untitled',
    title: template.template_name || 'Untitled',
    subtitle: template.purpose || '',
    meta: `Exported: ${formatDate()} | From: ${EIS_FOOTER}`,
    badges,
    sections,
  };
}

// Build a structured content item for an IncubateHer document template
export function buildIncubateHerTemplateItem(template, dayLabel) {
  return {
    name: template.title,
    title: template.title,
    subtitle: template.description || '',
    meta: `${dayLabel} | IncubateHer Program | ${EIS_FOOTER}`,
    badges: [dayLabel, 'IncubateHer'],
    sections: template.includes && template.includes.length > 0
      ? [{ heading: 'This Template Includes:', listItems: template.includes }]
      : [],
  };
}

// Build a structured content item for a "Documents to Gather" checklist
export function buildGatherListItem(gatherDocs, dayLabel) {
  return {
    name: `${dayLabel} - Documents to Gather`,
    title: 'Documents to Gather',
    subtitle: gatherDocs.title || '',
    meta: `${dayLabel} | IncubateHer Program | ${EIS_FOOTER}`,
    badges: [dayLabel, 'Checklist'],
    sections: [
      {
        heading: 'Organize these in your Funding Readiness Vault:',
        checklistItems: gatherDocs.items || [],
      },
    ],
  };
}