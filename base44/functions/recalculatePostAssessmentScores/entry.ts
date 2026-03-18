import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const QUESTIONS = {
  grants_vs_contracts: [
    {
      id: 'q1',
      question: 'Which of the following documents is required to demonstrate legal fundability?',
      options: [
        { value: 'a', text: 'Articles of Incorporation or Organization', points: 100 },
        { value: 'b', text: 'Social media following list', points: 0 },
        { value: 'c', text: 'Informal partnership agreement', points: 25 },
        { value: 'd', text: 'Only a business name', points: 0 }
      ]
    },
    {
      id: 'q2',
      question: 'What is the primary purpose of having an up-to-date Board Resolution or Bylaws?',
      options: [
        { value: 'a', text: 'To show funders that your organization has formal governance structure', points: 100 },
        { value: 'b', text: 'To make your website look more professional', points: 0 },
        { value: 'c', text: 'Only nonprofits need these documents', points: 25 },
        { value: 'd', text: 'They are not really important', points: 0 }
      ]
    }
  ],
  legal_readiness: [
    {
      id: 'q1',
      question: 'Which of the following documents is required to demonstrate legal fundability?',
      options: [
        { value: 'a', text: 'Articles of Incorporation or Organization', points: 100 },
        { value: 'b', text: 'Social media following list', points: 0 },
        { value: 'c', text: 'Informal partnership agreement', points: 25 },
        { value: 'd', text: 'Only a business name', points: 0 }
      ]
    },
    {
      id: 'q2',
      question: 'What is the primary purpose of having an up-to-date Board Resolution or Bylaws?',
      options: [
        { value: 'a', text: 'To show funders that your organization has formal governance structure', points: 100 },
        { value: 'b', text: 'To make your website look more professional', points: 0 },
        { value: 'c', text: 'Only nonprofits need these documents', points: 25 },
        { value: 'd', text: 'They are not really important', points: 0 }
      ]
    }
  ],
  financial_readiness: [
    {
      id: 'q3',
      question: 'Why is tracking expenses by program or project important for funders?',
      options: [
        { value: 'a', text: 'It proves you can manage money and deliver on promises', points: 100 },
        { value: 'b', text: 'It is just a nice-to-have administrative task', points: 0 },
        { value: 'c', text: 'Only large organizations need to do this', points: 25 },
        { value: 'd', text: 'Funders do not actually care about expense tracking', points: 0 }
      ]
    },
    {
      id: 'q4',
      question: 'What should your financial documentation include to be funding-ready?',
      options: [
        { value: 'a', text: 'Program-level budgets, expense tracking system, and a method to match spending to funding sources', points: 100 },
        { value: 'b', text: 'Just a general estimate of spending', points: 0 },
        { value: 'c', text: 'Personal bank statements', points: 25 },
        { value: 'd', text: 'Monthly receipts in a shoebox', points: 0 }
      ]
    }
  ],
  financial_systems: [
    {
      id: 'q3',
      question: 'Why is tracking expenses by program or project important for funders?',
      options: [
        { value: 'a', text: 'It proves you can manage money and deliver on promises', points: 100 },
        { value: 'b', text: 'It is just a nice-to-have administrative task', points: 0 },
        { value: 'c', text: 'Only large organizations need to do this', points: 25 },
        { value: 'd', text: 'Funders do not actually care about expense tracking', points: 0 }
      ]
    },
    {
      id: 'q4',
      question: 'What should your financial documentation include to be funding-ready?',
      options: [
        { value: 'a', text: 'Program-level budgets, expense tracking system, and a method to match spending to funding sources', points: 100 },
        { value: 'b', text: 'Just a general estimate of spending', points: 0 },
        { value: 'c', text: 'Personal bank statements', points: 25 },
        { value: 'd', text: 'Monthly receipts in a shoebox', points: 0 }
      ]
    }
  ],
  data_measurement: [
    {
      id: 'q5',
      question: 'What is the relationship between data collection and funding renewal?',
      options: [
        { value: 'a', text: 'You cannot get renewed if you cannot report measurable outcomes', points: 100 },
        { value: 'b', text: 'Data collection is optional', points: 0 },
        { value: 'c', text: 'You can collect data after you get funded', points: 25 },
        { value: 'd', text: 'Funders only care about money spent, not results', points: 0 }
      ]
    },
    {
      id: 'q6',
      question: 'Which of the following is a critical component of a data collection system?',
      options: [
        { value: 'a', text: 'A clear method to track who you serve, what services they receive, and what changes occur', points: 100 },
        { value: 'b', text: 'Just counting how many people attend events', points: 25 },
        { value: 'c', text: 'Collecting data only when a grant requires it', points: 0 },
        { value: 'd', text: 'Keeping everything in email threads', points: 0 }
      ]
    }
  ],
  confidence: [
    {
      id: 'q7',
      question: 'How confident are you in preparing your organizational legal and governance documents for a funder?',
      type: 'scale',
      scale: { min: 1, max: 10 }
    },
    {
      id: 'q8',
      question: 'How confident are you in setting up and maintaining a financial tracking system by program?',
      type: 'scale',
      scale: { min: 1, max: 10 }
    }
  ]
};

function calculateScores(responses) {
  let grantsContractsScore = 0;
  let legalReadinessScore = 0;
  let financialReadinessScore = 0;
  let confidenceScore = 0;

  QUESTIONS.grants_vs_contracts.forEach(q => {
    const answer = responses[q.id];
    if (answer) {
      const option = q.options.find(o => o.value === answer);
      if (option) grantsContractsScore += option.points;
    }
  });
  grantsContractsScore = (grantsContractsScore / 200) * 100;

  QUESTIONS.legal_readiness.forEach(q => {
    const answer = responses[q.id];
    if (answer) {
      const option = q.options.find(o => o.value === answer);
      if (option) legalReadinessScore += option.points;
    }
  });
  legalReadinessScore = (legalReadinessScore / 200) * 100;

  QUESTIONS.financial_readiness.forEach(q => {
    const answer = responses[q.id];
    if (answer) {
      const option = q.options.find(o => o.value === answer);
      if (option) financialReadinessScore += option.points;
    }
  });
  financialReadinessScore = (financialReadinessScore / 200) * 100;

  const confidenceResponses = QUESTIONS.confidence.map(q => parseInt(responses[q.id]) || 0);
  confidenceScore = (confidenceResponses.reduce((a, b) => a + b, 0) / confidenceResponses.length) * 10;

  const totalScore = Math.round((grantsContractsScore + legalReadinessScore + financialReadinessScore + confidenceScore) / 4);

  return {
    grants_vs_contracts_score: Math.round(grantsContractsScore),
    legal_readiness_score: Math.round(legalReadinessScore),
    financial_readiness_score: Math.round(financialReadinessScore),
    confidence_score: Math.round(confidenceScore),
    total_score: totalScore
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all post assessments
    const assessments = await base44.asServiceRole.entities.ProgramAssessment.filter({
      assessment_type: 'post'
    });

    console.log(`Found ${assessments.length} post assessments to recalculate`);

    let updated = 0;
    let skipped = 0;

    for (const assessment of assessments) {
      if (!assessment.responses || Object.keys(assessment.responses).length === 0) {
        console.log(`Skipping assessment ${assessment.id} - no responses`);
        skipped++;
        continue;
      }

      const newScores = calculateScores(assessment.responses);
      
      await base44.asServiceRole.entities.ProgramAssessment.update(assessment.id, newScores);
      
      // Update corresponding enrollment record
      if (assessment.enrollment_id) {
        await base44.asServiceRole.entities.ProgramEnrollment.update(assessment.enrollment_id, {
          post_assessment_score: newScores.total_score,
          post_assessment_date: new Date().toISOString()
        });
      }

      updated++;
      console.log(`Updated assessment ${assessment.id}: new total score = ${newScores.total_score}`);
    }

    return Response.json({
      success: true,
      message: `Recalculated ${updated} assessments (${skipped} skipped due to missing responses)`,
      updated,
      skipped,
      total: assessments.length
    });
  } catch (error) {
    console.error('Error recalculating post assessment scores:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});