import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, AlertCircle, FileText, Users, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AssessmentResults({ totalScore, level1Score, level2Score, level3Score, onRetake }) {
  const getReadinessData = () => {
    if (totalScore >= 40) {
      return {
        level: 'apply_now',
        title: '🟢 Grant-Ready & Competitive',
        subtitle: 'SCORE RANGE: 40–55',
        description: 'Organizations scoring in this range demonstrate strong foundational, fundability, and competitive readiness. You are positioned to pursue grants responsibly, provided opportunities align with your mission and capacity.',
        color: 'green',
        icon: CheckCircle2,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        whatThisMeans: [
          'Core infrastructure is in place',
          'Programs are clearly defined and measurable',
          'Financial and compliance considerations are understood',
          'You can compete without overextending your organization'
        ],
        recommendations: [
          { title: 'LOI or Full Grant/Proposal Development', description: 'You are ready to pursue aligned funding opportunities', icon: FileText },
          { title: 'Submission Management', description: 'Coordinate timelines and application requirements', icon: Users },
          { title: 'Post-Award Setup', description: 'Prepare for reporting and compliance support', icon: TrendingUp }
        ]
      };
    } else if (totalScore >= 25) {
      return {
        level: 'prepare_first',
        title: '🟡 Promising, With Gaps to Address',
        subtitle: 'SCORE RANGE: 25–39',
        description: 'Organizations in this range show meaningful progress but still have gaps that may weaken competitiveness or increase risk if grants are pursued too early.',
        color: 'amber',
        icon: AlertTriangle,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-800',
        whatThisMeans: [
          'Vision and services are clear, but documentation or systems may be incomplete',
          'Programs may need stronger alignment to outcomes or funder priorities',
          'Financial or evaluation infrastructure may need reinforcement'
        ],
        recommendations: [
          { title: 'Fundability Roadmap', description: 'Create a strategic readiness planning path', icon: TrendingUp },
          { title: 'Budget Development', description: 'Develop financial controls and detailed budgets', icon: FileText },
          { title: 'Evaluation Design', description: 'Build program refinement and measurement systems', icon: Sparkles },
          { title: 'Document Development', description: 'Create policies, narratives, and attachments', icon: Users }
        ]
      };
    } else {
      return {
        level: 'foundation_building',
        title: '🔴 Foundation Building Required',
        subtitle: 'SCORE RANGE: 0–24',
        description: 'Organizations scoring in this range should not pursue grant funding as a primary strategy yet. Early grant chasing often leads to compliance risk, burnout, and reputational harm.',
        color: 'red',
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        whatThisMeans: [
          'Foundational infrastructure is still forming',
          'Programs or services may need clarification',
          'Financial, governance, or compliance elements are incomplete'
        ],
        recommendations: [
          { title: 'Organizational Setup', description: 'Establish legal structure and compliance foundations', icon: FileText },
          { title: 'Core Infrastructure', description: 'Build business or nonprofit documentation', icon: TrendingUp },
          { title: 'Hybrid Funding Strategy', description: 'Explore earned revenue, contracts, and donations', icon: Sparkles },
          { title: 'Foundation Building Services', description: 'Get support before pursuing grants', icon: Users }
        ]
      };
    }
  };

  const readiness = getReadinessData();
  const IconComponent = readiness.icon;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Grant Readiness Results</h1>
          <p className="text-slate-600">Thank you for completing the Grant Readiness Assessment™</p>
          <p className="text-sm text-slate-500 mt-2 max-w-3xl mx-auto">
            This assessment is designed to help organizations understand their current level of readiness to pursue grant 
            funding responsibly and competitively. While grant funding is never guaranteed, readiness significantly impacts 
            your ability to compete, comply, and sustain awarded funds.
          </p>
        </div>

        {/* Overall Score */}
        <Card className={`${readiness.bgColor} border-2 ${readiness.borderColor} mb-6`}>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h2 className={`text-3xl font-bold ${readiness.textColor} mb-2`}>{readiness.title}</h2>
              <p className="text-sm font-medium text-slate-600 mb-4">{readiness.subtitle}</p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div>
                  <div className="text-5xl font-bold text-slate-900">{totalScore}</div>
                  <div className="text-sm text-slate-600">out of 55</div>
                </div>
              </div>
            </div>
            <div className="border-t pt-6">
              <p className="text-slate-700 mb-4">{readiness.description}</p>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">What this means:</h4>
                <ul className="space-y-2">
                  {readiness.whatThisMeans.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className={`${readiness.textColor} mt-0.5`}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">Level 1: Foundational</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{level1Score} / 16</div>
              <div className="text-sm text-slate-600 mt-1">
                {Math.round((level1Score / 16) * 100)}% complete
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">Level 2: Fundability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{level2Score} / 20</div>
              <div className="text-sm text-slate-600 mt-1">
                {Math.round((level2Score / 20) * 100)}% complete
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">Level 3: Competitive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{level3Score} / 19</div>
              <div className="text-sm text-slate-600 mt-1">
                {Math.round((level3Score / 19) * 100)}% complete
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {readiness.recommendations.map((rec, idx) => {
                const RecIcon = rec.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-4 border rounded-lg hover:border-emerald-500 transition-colors">
                    <RecIcon className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Important Context */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">Important Context (Read This)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-orange-900 space-y-3">
            <p className="font-semibold">Grant funding is not start-up capital, emergency funding, or guaranteed income.</p>
            <div>
              <p className="font-medium mb-2">Responsible grant pursuit requires:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Adequate internal capacity, as some grants are reimbursable only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Clear financial controls and usage tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Program readiness and sustainability beyond the grant period</span>
                </li>
              </ul>
            </div>
            <p className="font-semibold">Pursuing grants before readiness can place an organization at legal, financial, and operational risk.</p>
          </CardContent>
        </Card>

        {/* Next Steps Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Explore Platform Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to={createPageUrl('ReadinessChecklists')}>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Complete Readiness Checklists
              </Button>
            </Link>
            <Link to={createPageUrl('Templates')}>
              <Button variant="outline" className="w-full justify-start">
                <Sparkles className="w-4 h-4 mr-2" />
                Browse Template Library
              </Button>
            </Link>
            <Link to={createPageUrl('GrantDashboard')}>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Grant Opportunities
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" onClick={onRetake}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}