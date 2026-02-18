import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { event, data } = await req.json();

    // Only process module completion updates
    if (event.type !== 'update' || event.entity_name !== 'ModuleCompletion') {
      return Response.json({ message: 'Not a module completion update' });
    }

    // Check if module was just marked complete
    if (!data.is_completed) {
      return Response.json({ message: 'Module not completed' });
    }

    console.log(`📋 Checking certificate eligibility for enrollment ${data.enrollment_id}`);

    // Get enrollment
    const enrollment = await base44.asServiceRole.entities.ProgramEnrollment.get(data.enrollment_id);
    if (!enrollment) {
      return Response.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Check if certificate already issued
    const existingCerts = await base44.asServiceRole.entities.ProgramCertificate.filter({
      enrollment_id: enrollment.id
    });
    
    if (existingCerts.length > 0) {
      console.log(`✅ Certificate already issued for enrollment ${enrollment.id}`);
      return Response.json({ message: 'Certificate already issued' });
    }

    // Get all modules for this cohort
    const modules = await base44.asServiceRole.entities.ProgramModule.filter({
      cohort_id: enrollment.cohort_id,
      is_active: true
    });

    // Get all module completions for this enrollment
    const completions = await base44.asServiceRole.entities.ModuleCompletion.filter({
      enrollment_id: enrollment.id,
      is_completed: true
    });

    // Check if all required modules are completed
    const requiredModules = modules.filter(m => m.required_for_completion);
    const completedModuleIds = completions.map(c => c.module_id);
    const allRequiredCompleted = requiredModules.every(m => completedModuleIds.includes(m.id));

    if (!allRequiredCompleted) {
      console.log(`⏳ Not all required modules completed yet: ${completions.length}/${requiredModules.length}`);
      return Response.json({ 
        message: 'Not all required modules completed',
        completed: completions.length,
        required: requiredModules.length
      });
    }

    console.log(`🎓 All modules completed! Generating certificate...`);

    // Call generateCertificate function
    const certResponse = await base44.asServiceRole.functions.invoke('generateCertificate', {
      enrollment_id: enrollment.id
    });

    if (certResponse.data.success) {
      console.log(`✅ Certificate automatically generated for ${enrollment.participant_email}`);
      
      // Send notification
      await base44.asServiceRole.entities.UserNotification.create({
        user_email: enrollment.participant_email,
        notification_type: 'program_announcement',
        title: '🎉 Certificate Ready!',
        message: `Congratulations! Your certificate for completing the program is now available.`,
        link: '/issued-certificates',
        priority: 'high'
      });

      return Response.json({
        success: true,
        message: 'Certificate generated and notification sent',
        certificate: certResponse.data.certificate
      });
    } else {
      console.error('❌ Certificate generation failed:', certResponse.data);
      return Response.json({ error: 'Failed to generate certificate' }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in auto-generate certificate:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});