import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate exports for CUL reporting (aggregate data only, no PII)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin only
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { exportType } = await req.json();

    const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.list();
    const assessments = await base44.asServiceRole.entities.ProgramAssessment.list();
    const sessions = await base44.asServiceRole.entities.ProgramSession.list();

    let reportData = {};

    switch (exportType) {
      case 'completion_metrics':
        reportData = {
          report_title: 'IncubateHer Program Completion Metrics',
          generated_date: new Date().toISOString(),
          metrics: {
            total_enrolled: enrollments.length,
            completed_program: enrollments.filter(e => e.program_completed).length,
            completion_rate: enrollments.length > 0 
              ? Math.round((enrollments.filter(e => e.program_completed).length / enrollments.length) * 100) 
              : 0,
            pre_assessments_complete: enrollments.filter(e => e.pre_assessment_completed).length,
            post_assessments_complete: enrollments.filter(e => e.post_assessment_completed).length,
            consultations_complete: enrollments.filter(e => e.consultation_completed).length,
            documents_submitted: enrollments.filter(e => e.documents_uploaded).length,
            attendance_complete: enrollments.filter(e => e.attendance_complete).length
          }
        };
        break;

      case 'assessment_summary':
        const preAssessments = assessments.filter(a => a.assessment_type === 'pre');
        const postAssessments = assessments.filter(a => a.assessment_type === 'post');

        const avgPreScore = preAssessments.length > 0
          ? Math.round(preAssessments.reduce((sum, a) => sum + a.total_score, 0) / preAssessments.length)
          : 0;

        const avgPostScore = postAssessments.length > 0
          ? Math.round(postAssessments.reduce((sum, a) => sum + a.total_score, 0) / postAssessments.length)
          : 0;

        reportData = {
          report_title: 'Assessment Score Summary (Aggregate Only)',
          generated_date: new Date().toISOString(),
          disclaimer: 'This report contains aggregate data only. No individual participant information is included.',
          scores: {
            average_pre_score: avgPreScore,
            average_post_score: avgPostScore,
            average_improvement: avgPostScore - avgPreScore,
            pre_assessments_count: preAssessments.length,
            post_assessments_count: postAssessments.length
          },
          readiness_distribution: {
            not_ready: preAssessments.filter(a => a.total_score < 40).length,
            emerging: preAssessments.filter(a => a.total_score >= 40 && a.total_score < 60).length,
            competitive: preAssessments.filter(a => a.total_score >= 60 && a.total_score < 80).length,
            highly_competitive: preAssessments.filter(a => a.total_score >= 80).length
          }
        };
        break;

      case 'attendance_summary':
        const attendance = await base44.asServiceRole.entities.SessionAttendance.list();
        
        const sessionStats = sessions.map(session => {
          const sessionAttendance = attendance.filter(a => a.session_id === session.id);
          const presentCount = sessionAttendance.filter(a => a.attended).length;
          const totalExpected = enrollments.length;
          
          return {
            session_title: session.session_title,
            session_date: session.session_date,
            attendance_count: presentCount,
            total_participants: totalExpected,
            attendance_rate: totalExpected > 0 ? Math.round((presentCount / totalExpected) * 100) : 0
          };
        });

        reportData = {
          report_title: 'Session Attendance Summary',
          generated_date: new Date().toISOString(),
          disclaimer: 'This report shows aggregate attendance only. No individual names or emails included.',
          sessions: sessionStats,
          overall: {
            total_sessions: sessions.length,
            average_attendance_rate: sessionStats.length > 0
              ? Math.round(sessionStats.reduce((sum, s) => sum + s.attendance_rate, 0) / sessionStats.length)
              : 0
          }
        };
        break;

      default:
        return Response.json({ error: 'Invalid export type' }, { status: 400 });
    }

    return Response.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});