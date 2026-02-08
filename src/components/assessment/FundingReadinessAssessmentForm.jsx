import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function FundingReadinessAssessmentForm({ onComplete, initialData = null }) {
  const [assessment, setAssessment] = useState(initialData || {
    legal_status: '',
    financial_records: '',
    program_clarity: '',
    capacity: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const calculateScore = () => {
    let score = 0;
    const breakdown = {};
    
    // Legal Status (0-30 points)
    if (assessment.legal_status === 'full') {
      score += 30;
      breakdown.legal_status = { score: 30, max: 30, percentage: 100 };
    } else if (assessment.legal_status === 'partial') {
      score += 15;
      breakdown.legal_status = { score: 15, max: 30, percentage: 50 };
    } else {
      breakdown.legal_status = { score: 0, max: 30, percentage: 0 };
    }
    
    // Financial Records (0-25 points)
    if (assessment.financial_records === 'professional') {
      score += 25;
      breakdown.financial_records = { score: 25, max: 25, percentage: 100 };
    } else if (assessment.financial_records === 'basic') {
      score += 12;
      breakdown.financial_records = { score: 12, max: 25, percentage: 48 };
    } else {
      breakdown.financial_records = { score: 0, max: 25, percentage: 0 };
    }
    
    // Program Clarity (0-25 points)
    if (assessment.program_clarity === 'documented') {
      score += 25;
      breakdown.program_clarity = { score: 25, max: 25, percentage: 100 };
    } else if (assessment.program_clarity === 'developing') {
      score += 12;
      breakdown.program_clarity = { score: 12, max: 25, percentage: 48 };
    } else {
      breakdown.program_clarity = { score: 0, max: 25, percentage: 0 };
    }
    
    // Capacity (0-20 points)
    if (assessment.capacity === 'ready') {
      score += 20;
      breakdown.capacity = { score: 20, max: 20, percentage: 100 };
    } else if (assessment.capacity === 'tight') {
      score += 10;
      breakdown.capacity = { score: 10, max: 20, percentage: 50 };
    } else {
      breakdown.capacity = { score: 0, max: 20, percentage: 0 };
    }
    
    return { score, breakdown };
  };

  const getReadinessLevel = (score) => {
    if (score >= 80) return 'highly_ready';
    if (score >= 60) return 'ready';
    if (score >= 30) return 'building_readiness';
    return 'not_ready';
  };

  const handleSubmit = async () => {
    if (!assessment.legal_status || !assessment.financial_records || !assessment.program_clarity || !assessment.capacity) {
      toast.error('Please answer all questions');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await base44.auth.me();
      const { score, breakdown } = calculateScore();
      const level = getReadinessLevel(score);

      const data = {
        ...assessment,
        user_email: user.email,
        overall_score: score,
        readiness_level: level,
        assessment_date: new Date().toISOString(),
        score_breakdown: breakdown
      };

      await base44.entities.FundingReadinessAssessment.create(data);
      setShowResults(true);
      toast.success('Assessment completed!');
      if (onComplete) onComplete(data);
    } catch (error) {
      toast.error('Failed to save assessment');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { score, breakdown } = calculateScore();
  const level = getReadinessLevel(score);

  const getPersonalizedRecommendations = () => {
    const recommendations = [];
    
    if (breakdown.legal_status?.percentage < 100) {
      recommendations.push({
        area: 'Legal Structure',
        priority: 'high',
        action: breakdown.legal_status.percentage === 0 
          ? 'Register your business entity and obtain an EIN from the IRS. Open a dedicated business bank account.'
          : 'Complete missing legal requirements - ensure you have both EIN and a dedicated business bank account.',
        timeline: '1-2 months',
        resources: ['IRS.gov for EIN application', 'Local SBA office for entity registration guidance']
      });
    }
    
    if (breakdown.financial_records?.percentage < 100) {
      recommendations.push({
        area: 'Financial Management',
        priority: 'high',
        action: breakdown.financial_records.percentage === 0
          ? 'Implement basic financial tracking system. Consider QuickBooks or similar accounting software.'
          : 'Upgrade to professional financial statements. Work with a bookkeeper or accountant to create formal budgets and financial reports.',
        timeline: '2-3 months',
        resources: ['QuickBooks Online', 'Local SCORE chapter for financial mentoring', 'Accounting professionals']
      });
    }
    
    if (breakdown.program_clarity?.percentage < 100) {
      recommendations.push({
        area: 'Program Documentation',
        priority: 'medium',
        action: breakdown.program_clarity.percentage === 0
          ? 'Define your core programs and services. Document who you serve, what you offer, and what outcomes you achieve.'
          : 'Formalize program documentation with measurable outcomes, target populations, and delivery methods.',
        timeline: '1-2 months',
        resources: ['Logic model templates', 'Outcome measurement frameworks', 'IncubateHer workbook section 3']
      });
    }
    
    if (breakdown.capacity?.percentage < 100) {
      recommendations.push({
        area: 'Organizational Capacity',
        priority: breakdown.capacity.percentage === 0 ? 'high' : 'medium',
        action: breakdown.capacity.percentage === 0
          ? 'Assess current workload and identify capacity constraints before taking on funded work.'
          : 'Build capacity gradually. Consider hiring, training volunteers, or streamlining operations before pursuing major contracts.',
        timeline: '3-6 months',
        resources: ['Capacity assessment tools', 'Strategic planning resources', 'Volunteer management systems']
      });
    }
    
    return recommendations;
  };

  const getLevelInfo = () => {
    const recommendations = getPersonalizedRecommendations();
    
    switch (level) {
      case 'highly_ready':
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-green-600" />,
          color: 'bg-green-50 border-green-200',
          title: 'Highly Ready',
          message: 'You have strong foundational systems in place and are well-positioned to pursue funding opportunities.',
          next: 'Start identifying aligned funding opportunities and refining your proposals.',
          recommendations
        };
      case 'ready':
        return {
          icon: <TrendingUp className="w-12 h-12 text-blue-600" />,
          color: 'bg-blue-50 border-blue-200',
          title: 'Ready',
          message: 'You have solid readiness with some areas for improvement. You can pursue funding while strengthening gaps.',
          next: 'Focus on documentation quality and capacity building as you apply.',
          recommendations
        };
      case 'building_readiness':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-amber-600" />,
          color: 'bg-amber-50 border-amber-200',
          title: 'Building Readiness',
          message: 'You have foundational elements but need to strengthen systems before pursuing major funding.',
          next: 'Prioritize legal structure, financial tracking, and program documentation.',
          recommendations
        };
      default:
        return {
          icon: <XCircle className="w-12 h-12 text-red-600" />,
          color: 'bg-red-50 border-red-200',
          title: 'Not Ready',
          message: 'Focus on building essential organizational systems before pursuing funding. Applying too early can harm your reputation.',
          next: 'Establish legal entity, basic financial systems, and clear program offerings first.',
          recommendations
        };
    }
  };

  if (showResults) {
    const levelInfo = getLevelInfo();
    return (
      <Card className={`border-2 ${levelInfo.color}`}>
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            {levelInfo.icon}
            <div>
              <CardTitle className="text-2xl">{levelInfo.title}</CardTitle>
              <div className="text-3xl font-bold text-[#143A50] mt-2">
                {score}/100
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700">{levelInfo.message}</p>
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-[#143A50] mb-2">Score Breakdown</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Legal Status</span>
                  <span className="text-slate-600">{breakdown.legal_status.score}/{breakdown.legal_status.max} points</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-[#143A50] h-2 rounded-full transition-all" 
                    style={{ width: `${breakdown.legal_status.percentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Financial Records</span>
                  <span className="text-slate-600">{breakdown.financial_records.score}/{breakdown.financial_records.max} points</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-[#1E4F58] h-2 rounded-full transition-all" 
                    style={{ width: `${breakdown.financial_records.percentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Program Clarity</span>
                  <span className="text-slate-600">{breakdown.program_clarity.score}/{breakdown.program_clarity.max} points</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-[#E5C089] h-2 rounded-full transition-all" 
                    style={{ width: `${breakdown.program_clarity.percentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Capacity</span>
                  <span className="text-slate-600">{breakdown.capacity.score}/{breakdown.capacity.max} points</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-[#AC1A5B] h-2 rounded-full transition-all" 
                    style={{ width: `${breakdown.capacity.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {levelInfo.recommendations && levelInfo.recommendations.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-[#143A50] mb-3">Personalized Action Plan</h4>
              <div className="space-y-4">
                {levelInfo.recommendations.map((rec, idx) => (
                  <div key={idx} className="border-l-4 border-[#E5C089] pl-4 pb-3 border-b last:border-b-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[#143A50]">{rec.area}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{rec.action}</p>
                    <div className="text-xs text-slate-600">
                      <p className="mb-1"><strong>Timeline:</strong> {rec.timeline}</p>
                      <p><strong>Resources:</strong> {rec.resources.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button onClick={() => setShowResults(false)} variant="outline" className="w-full mt-4">
            Retake Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Legal Status</CardTitle>
          <CardDescription>Do you have a formal business structure?</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={assessment.legal_status} onValueChange={(val) => setAssessment({...assessment, legal_status: val})}>
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded">
              <RadioGroupItem value="full" id="legal-full" />
              <Label htmlFor="legal-full" className="cursor-pointer flex-1">
                Formal entity with EIN and dedicated bank account
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded">
              <RadioGroupItem value="partial" id="legal-partial" />
              <Label htmlFor="legal-partial" className="cursor-pointer flex-1">
                Formal entity, but missing some pieces (no EIN or bank account)
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded">
              <RadioGroupItem value="none" id="legal-none" />
              <Label htmlFor="legal-none" className="cursor-pointer flex-1">
                No formal legal structure yet
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Records</CardTitle>
          <CardDescription>How do you track your finances?</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={assessment.financial_records} onValueChange={(val) => setAssessment({...assessment, financial_records: val})}>
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded">
              <RadioGroupItem value="professional" id="fin-pro" />
              <Label htmlFor="fin-pro" className="cursor-pointer flex-1">
                Professional financial statements and budget
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded">
              <RadioGroupItem value="basic" id="fin-basic" />
              <Label htmlFor="fin-basic" className="cursor-pointer flex-1">
                Basic tracking (spreadsheets or simple software)
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded">
              <RadioGroupItem value="none" id="fin-none" />
              <Label htmlFor="fin-none" className="cursor-pointer flex-1">
                No formal financial tracking
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Program/Service Clarity</CardTitle>
          <CardDescription>How well-defined are your programs?</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={assessment.program_clarity} onValueChange={(val) => setAssessment({...assessment, program_clarity: val})}>
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded">
              <RadioGroupItem value="documented" id="prog-doc" />
              <Label htmlFor="prog-doc" className="cursor-pointer flex-1">
                Clear, documented programs with measurable outcomes
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded">
              <RadioGroupItem value="developing" id="prog-dev" />
              <Label htmlFor="prog-dev" className="cursor-pointer flex-1">
                Programs exist but not fully documented
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded">
              <RadioGroupItem value="exploring" id="prog-exp" />
              <Label htmlFor="prog-exp" className="cursor-pointer flex-1">
                Still exploring what I offer
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staffing/Time Capacity</CardTitle>
          <CardDescription>Do you have capacity for funded work?</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={assessment.capacity} onValueChange={(val) => setAssessment({...assessment, capacity: val})}>
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded">
              <RadioGroupItem value="ready" id="cap-ready" />
              <Label htmlFor="cap-ready" className="cursor-pointer flex-1">
                Have capacity to take on funded work
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded">
              <RadioGroupItem value="tight" id="cap-tight" />
              <Label htmlFor="cap-tight" className="cursor-pointer flex-1">
                Currently at capacity
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded">
              <RadioGroupItem value="overextended" id="cap-over" />
              <Label htmlFor="cap-over" className="cursor-pointer flex-1">
                Already overextended
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={assessment.notes}
            onChange={(e) => setAssessment({...assessment, notes: e.target.value})}
            placeholder="Any additional context about your readiness..."
            rows={4}
          />
        </CardContent>
      </Card>

      <Button 
        onClick={handleSubmit} 
        disabled={isSubmitting}
        className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
        size="lg"
      >
        {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
      </Button>
    </div>
  );
}