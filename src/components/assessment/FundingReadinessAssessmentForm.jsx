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
    
    // Legal Status (0-30 points)
    if (assessment.legal_status === 'full') score += 30;
    else if (assessment.legal_status === 'partial') score += 15;
    
    // Financial Records (0-25 points)
    if (assessment.financial_records === 'professional') score += 25;
    else if (assessment.financial_records === 'basic') score += 12;
    
    // Program Clarity (0-25 points)
    if (assessment.program_clarity === 'documented') score += 25;
    else if (assessment.program_clarity === 'developing') score += 12;
    
    // Capacity (0-20 points)
    if (assessment.capacity === 'ready') score += 20;
    else if (assessment.capacity === 'tight') score += 10;
    
    return score;
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
      const score = calculateScore();
      const level = getReadinessLevel(score);

      const data = {
        ...assessment,
        user_email: user.email,
        overall_score: score,
        readiness_level: level,
        assessment_date: new Date().toISOString()
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

  const score = calculateScore();
  const level = getReadinessLevel(score);

  const getLevelInfo = () => {
    switch (level) {
      case 'highly_ready':
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-green-600" />,
          color: 'bg-green-50 border-green-200',
          title: 'Highly Ready',
          message: 'You have strong foundational systems in place and are well-positioned to pursue funding opportunities.',
          next: 'Start identifying aligned funding opportunities and refining your proposals.'
        };
      case 'ready':
        return {
          icon: <TrendingUp className="w-12 h-12 text-blue-600" />,
          color: 'bg-blue-50 border-blue-200',
          title: 'Ready',
          message: 'You have solid readiness with some areas for improvement. You can pursue funding while strengthening gaps.',
          next: 'Focus on documentation quality and capacity building as you apply.'
        };
      case 'building_readiness':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-amber-600" />,
          color: 'bg-amber-50 border-amber-200',
          title: 'Building Readiness',
          message: 'You have foundational elements but need to strengthen systems before pursuing major funding.',
          next: 'Prioritize legal structure, financial tracking, and program documentation.'
        };
      default:
        return {
          icon: <XCircle className="w-12 h-12 text-red-600" />,
          color: 'bg-red-50 border-red-200',
          title: 'Not Ready',
          message: 'Focus on building essential organizational systems before pursuing funding. Applying too early can harm your reputation.',
          next: 'Establish legal entity, basic financial systems, and clear program offerings first.'
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
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-[#143A50] mb-2">Recommended Next Steps:</h4>
            <p className="text-sm text-slate-700">{levelInfo.next}</p>
          </div>
          <Button onClick={() => setShowResults(false)} variant="outline" className="w-full">
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