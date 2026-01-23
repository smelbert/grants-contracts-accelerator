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
        title: 'Apply Now',
        subtitle: 'You are grant-ready and competitive',
        color: 'green',
        icon: CheckCircle2,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        recommendations: [
          { title: 'LOI Development', description: 'Draft compelling letters of intent', icon: FileText },
          { title: 'Full Grant Writing', description: 'Develop complete grant or RFP/RFQ proposals', icon: Sparkles },
          { title: 'Submission Management', description: 'Coordinate application submission process', icon: Users },
          { title: 'Post-Award Setup', description: 'Prepare for grant management and reporting', icon: TrendingUp }
        ]
      };
    } else if (totalScore >= 25) {
      return {
        level: 'prepare_first',
        title: 'Prepare First',
        subtitle: 'You are promising but not yet competitive',
        color: 'amber',
        icon: AlertTriangle,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-800',
        note: 'Applying now may waste time and money',
        recommendations: [
          { title: 'Fundability Roadmap', description: 'Create strategic plan to strengthen readiness', icon: TrendingUp },
          { title: 'Budget & Program Design', description: 'Develop detailed budgets and program frameworks', icon: FileText },
          { title: 'Evaluation Framework', description: 'Build outcome measurement systems', icon: Sparkles },
          { title: 'Document Build-Out', description: 'Create required compliance documentation', icon: Users }
        ]
      };
    } else {
      return {
        level: 'foundation_building',
        title: 'Foundation Building Required',
        subtitle: 'You are not grant-ready yet',
        color: 'red',
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        note: 'Grants should not be your first funding strategy',
        recommendations: [
          { title: 'Organizational Setup', description: 'Establish legal structure and compliance', icon: FileText },
          { title: 'Infrastructure Development', description: 'Build business or nonprofit infrastructure', icon: TrendingUp },
          { title: 'Hybrid Funding Strategy', description: 'Explore contracts, earned revenue, philanthropy', icon: Sparkles },
          { title: 'Readiness Coaching', description: 'Get guidance before pursuing grants', icon: Users }
        ]
      };
    }
  };

  const readiness = getReadinessData();
  const IconComponent = readiness.icon;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Assessment Complete</h1>
          <p className="text-slate-600">Here are your results and recommendations</p>
        </div>

        {/* Overall Score */}
        <Card className={`${readiness.bgColor} border-2 ${readiness.borderColor} mb-6`}>
          <CardContent className="pt-6">
            <div className="text-center">
              <IconComponent className={`w-16 h-16 ${readiness.textColor} mx-auto mb-4`} />
              <h2 className={`text-3xl font-bold ${readiness.textColor} mb-2`}>{readiness.title}</h2>
              <p className="text-slate-700 mb-4">{readiness.subtitle}</p>
              {readiness.note && (
                <p className={`text-sm font-medium ${readiness.textColor} mb-4`}>⚠️ {readiness.note}</p>
              )}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div>
                  <div className="text-5xl font-bold text-slate-900">{totalScore}</div>
                  <div className="text-sm text-slate-600">out of 55</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Level 1: Foundational</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{level1Score} / 15</div>
              <div className="text-sm text-slate-600 mt-1">
                {Math.round((level1Score / 15) * 100)}% complete
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Level 2: Fundability</CardTitle>
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
              <CardTitle className="text-lg">Level 3: Competitive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{level3Score} / 20</div>
              <div className="text-sm text-slate-600 mt-1">
                {Math.round((level3Score / 20) * 100)}% complete
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readiness.recommendations.map((rec, idx) => {
                const RecIcon = rec.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-4 border rounded-lg hover:border-emerald-500 transition-colors">
                    <RecIcon className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
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