import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { project_id, template_id, organization_id, customizations } = await req.json();

    // Fetch project, template, and organization data
    const [project, template, organization] = await Promise.all([
      base44.entities.Project.filter({ id: project_id }).then(r => r[0]),
      base44.entities.Template.filter({ id: template_id }).then(r => r[0]),
      base44.entities.Organization.filter({ id: organization_id }).then(r => r[0])
    ]);

    if (!project || !template || !organization) {
      return Response.json({ error: 'Missing project, template, or organization data' }, { status: 400 });
    }

    // Fetch awarded projects for success stories
    const awardedProjects = await base44.entities.Project.filter({
      organization_id,
      proposal_stage: 'awarded'
    });

    const successStories = awardedProjects.slice(0, 2).map(p => `- ${p.project_name}: Awarded $${(p.amount_awarded || 0) / 1000000} million`).join('\n');

    // Build the proposal content using LLM
    const prompt = `You are an expert grant writer. Generate a professional proposal document using the following information:

ORGANIZATION:
- Name: ${organization.organization_name}
- Type: ${organization.organization_type}
- Mission: ${organization.mission_statement}
- Annual Budget: ${organization.annual_budget || 'Not specified'}
- Employees: ${organization.staff_count || 'Not specified'}
- Target Population: ${organization.target_population || 'Not specified'}

PROJECT:
- Name: ${project.project_name}
- Description: ${project.description}
- Amount Requested: $${(project.amount_asked || 0) / 1000000} million
- Funder: ${project.funder_name}

TEMPLATE STRUCTURE:
${template.template_content || template.template_name}

CUSTOMIZATIONS:
${customizations.projectDescription ? `Project Details: ${customizations.projectDescription}` : ''}
${customizations.specificFocus ? `Focus Areas: ${customizations.specificFocus}` : ''}
${customizations.additionalDetails ? `Additional Info: ${customizations.additionalDetails}` : ''}

PAST SUCCESSES (reference examples):
${successStories || 'No previous awards to reference'}

Please generate a compelling, professional proposal that:
1. Uses the provided template structure as the outline
2. Incorporates the organization's mission and capabilities
3. Highlights past successes and demonstrates competence
4. Directly addresses the project scope and funding amount
5. Is ready for review and submission

Format the output as a complete, formatted proposal document with clear sections and professional language. Make it approximately 3-5 pages when printed.`;

    // Call LLM to generate proposal
    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5'
    });

    // Format and prepare document
    const proposalContent = response || '';

    // Create downloadable file
    const fileName = `${project.project_name.replace(/\s+/g, '_')}_Proposal_${new Date().getFullYear()}.txt`;

    // For now, return content that can be saved as document
    // In production, you might want to generate actual PDF via the PDF exporter
    return Response.json({
      success: true,
      content: proposalContent,
      project_name: project.project_name,
      funder_name: project.funder_name,
      amount_asked: project.amount_asked,
      fileName: fileName
    });
  } catch (error) {
    console.error('assembleProposal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});