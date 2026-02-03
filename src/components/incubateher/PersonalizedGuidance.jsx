import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Lightbulb, CheckCircle2, TrendingUp, ExternalLink } from 'lucide-react';

export default function PersonalizedGuidance({ assessmentResults, currentSection }) {
  if (!assessmentResults) return null;

  // Calculate readiness scores by area
  const scores = {
    legal: calculateScore(assessmentResults, 'legal_readiness'),
    financial: calculateScore(assessmentResults, 'financial_readiness'),
    organizational: calculateScore(assessmentResults, 'organizational_capacity'),
    understanding: calculateScore(assessmentResults, 'grants_vs_contracts')
  };

  // Determine which guidance to show based on current section
  const guidance = getGuidanceForSection(currentSection, scores);

  if (!guidance || guidance.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      {guidance.map((item, idx) => (
        <Card key={idx} className={`border-l-4 ${item.color}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-sm text-slate-700 mb-3">{item.message}</p>
                {item.recommendations && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-900">Recommended Actions:</p>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {item.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.videoLink && (
                  <a 
                    href={item.videoLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-sm text-[#AC1A5B] font-semibold hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Watch Related Video
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Helper to calculate score from assessment responses
function calculateScore(results, category) {
  if (!results || !results.responses) return null;
  
  const categoryQuestions = Object.entries(results.responses)
    .filter(([key]) => key.includes(category));
  
  if (categoryQuestions.length === 0) return null;
  
  let totalScore = 0;
  let maxScore = categoryQuestions.length * 3; // Assuming 0-3 scale
  
  categoryQuestions.forEach(([_, value]) => {
    if (typeof value === 'string') {
      // Convert text responses to numeric scores
      if (value.includes('full') || value.includes('professional') || value.includes('documented')) {
        totalScore += 3;
      } else if (value.includes('partial') || value.includes('basic') || value.includes('developing')) {
        totalScore += 2;
      } else if (value.includes('some') || value.includes('exploring')) {
        totalScore += 1;
      }
    }
  });
  
  return (totalScore / maxScore) * 100; // Return percentage
}

// Get personalized guidance based on section and scores
function getGuidanceForSection(section, scores) {
  const guidance = [];
  
  // Legal readiness guidance (for readiness section)
  if (section === 'readiness' && scores.legal !== null && scores.legal < 60) {
    guidance.push({
      title: '⚠️ Legal Structure Needs Attention',
      message: 'Your assessment indicates gaps in your legal foundation. This is critical for funding readiness.',
      recommendations: [
        'Formalize your business structure (LLC, nonprofit, etc.)',
        'Obtain an Employer Identification Number (EIN) from the IRS',
        'Open a dedicated business bank account',
        'Ensure all registrations are current and in good standing'
      ],
      color: 'border-l-red-500',
      bgColor: 'bg-red-50',
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />
    });
  }

  // Financial readiness guidance (for documents section)
  if (section === 'documents' && scores.financial !== null && scores.financial < 60) {
    guidance.push({
      title: '💰 Strengthen Your Financial Foundation',
      message: 'Strong financial documentation is essential for both grants and contracts. Your assessment shows room for improvement.',
      recommendations: [
        'Create a detailed operating budget for the current fiscal year',
        'Maintain consistent financial records (monthly expense tracking)',
        'Develop program-specific budgets that show true costs',
        'Consider working with a bookkeeper or accountant if needed'
      ],
      color: 'border-l-amber-500',
      bgColor: 'bg-amber-50',
      icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
      videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    });
  }

  // Organizational capacity guidance (for readiness section)
  if (section === 'readiness' && scores.organizational !== null && scores.organizational < 60) {
    guidance.push({
      title: '🎯 Build Your Capacity Gradually',
      message: 'Your current capacity may limit what opportunities you can pursue right now. This is normal and manageable.',
      recommendations: [
        'Be realistic about your time availability for funded projects',
        'Start with smaller opportunities to build your track record',
        'Don\'t overpromise on deliverables you can\'t meet',
        'Consider partnerships or subcontracting for larger projects'
      ],
      color: 'border-l-blue-500',
      bgColor: 'bg-blue-50',
      icon: <Lightbulb className="w-5 h-5 text-blue-600" />
    });
  }

  // Grants vs Contracts understanding (for funding foundations section)
  if (section === 'funding_foundations' && scores.understanding !== null && scores.understanding < 70) {
    guidance.push({
      title: '📚 Deepen Your Understanding',
      message: 'Understanding the difference between grants and contracts is critical for success. Review the key distinctions carefully.',
      recommendations: [
        'Grants fund your mission; contracts pay for specific deliverables',
        'Grants have more flexibility; contracts have strict performance requirements',
        'Grants focus on outcomes; contracts focus on outputs',
        'Know which pathway aligns with your current capacity'
      ],
      color: 'border-l-purple-500',
      bgColor: 'bg-purple-50',
      icon: <Lightbulb className="w-5 h-5 text-purple-600" />,
      videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    });
  }

  // High score encouragement
  if (section === 'action' && Object.values(scores).some(s => s !== null && s >= 80)) {
    guidance.push({
      title: '🎉 You\'re Building Strong Readiness!',
      message: 'Your assessment shows significant strengths. Keep building on this momentum.',
      recommendations: [
        'Focus on filling any remaining gaps identified in your action plan',
        'Start researching aligned funding opportunities',
        'Continue strengthening documentation and systems',
        'Consider pursuing smaller opportunities to build your track record'
      ],
      color: 'border-l-green-500',
      bgColor: 'bg-green-50',
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />
    });
  }

  return guidance;
}