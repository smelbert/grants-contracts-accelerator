import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Users, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    registration_type: 'course',
    selected_course_id: '',
    org_name: '',
    org_type: '',
    org_stage: '',
    grant_writing_experience: '',
    hopes_to_learn: '',
    concerns: ''
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['availableCourses'],
    queryFn: () => base44.entities.LearningContent.filter({ content_type: 'course', is_premium: false }),
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      // Note: This is a simplified flow. In production, you'd use proper authentication APIs
      // For now, we'll create the user record and associated data
      
      // Create organization first
      const org = await base44.entities.Organization.create({
        name: data.org_name,
        type: data.org_type,
        stage: data.org_stage,
        onboarding_completed: false
      });

      // Update user profile with additional data
      // This assumes the user has already been created through Base44's auth system
      // In a real scenario, you'd coordinate with Base44's user creation API
      
      // Create enrollment if course selected
      if (data.registration_type === 'course' && data.selected_course_id) {
        await base44.entities.UserEnrollment.create({
          user_email: data.email,
          content_id: data.selected_course_id,
          enrollment_type: 'course',
          enrolled_date: new Date().toISOString(),
          status: 'active'
        });
      }

      return { success: true };
    },
    onSuccess: () => {
      window.location.href = createPageUrl('Home');
    },
    onError: (err) => {
      setError(err.message || 'Registration failed. Please try again.');
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.full_name || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }
    }
    if (step === 2) {
      if (!formData.org_name || !formData.org_type || !formData.org_stage) {
        setError('Please fill in all organization details');
        return;
      }
    }
    if (step === 3) {
      if (!formData.grant_writing_experience || !formData.hopes_to_learn) {
        setError('Please complete all fields');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.registration_type === 'course' && !formData.selected_course_id) {
      setError('Please select a course');
      return;
    }
    registerMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome to Grants + Contracts Accelerator</h1>
          <p className="text-lg text-slate-600">Your journey to funding success starts here</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {[1, 2, 3, 4].map((num) => (
            <React.Fragment key={num}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                step >= num 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
              </div>
              {num < 4 && <div className={`w-12 h-1 rounded ${step > num ? 'bg-emerald-600' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <Card className="shadow-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && "Let's Get Started"}
              {step === 2 && "Tell Us About Your Organization"}
              {step === 3 && "Help Us Understand Your Goals"}
              {step === 4 && "Choose Your Path"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Create your account to begin"}
              {step === 2 && "We'll customize your experience based on your organization"}
              {step === 3 && "This helps us provide the best support for you"}
              {step === 4 && "Select how you'd like to get started"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      placeholder="John Doe"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="john@example.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Organization Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="org_name">Organization Name *</Label>
                    <Input
                      id="org_name"
                      value={formData.org_name}
                      onChange={(e) => handleChange('org_name', e.target.value)}
                      placeholder="My Organization"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Organization Type *</Label>
                    <Select value={formData.org_type} onValueChange={(val) => handleChange('org_type', val)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nonprofit">Nonprofit</SelectItem>
                        <SelectItem value="for_profit">For-Profit</SelectItem>
                        <SelectItem value="solopreneur">Solopreneur</SelectItem>
                        <SelectItem value="community_based">Community-Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Organization Stage *</Label>
                    <Select value={formData.org_stage} onValueChange={(val) => handleChange('org_stage', val)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idea">Idea Stage</SelectItem>
                        <SelectItem value="early">Early Stage</SelectItem>
                        <SelectItem value="operating">Operating</SelectItem>
                        <SelectItem value="scaling">Scaling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Experience & Goals */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label>Grant Writing Experience *</Label>
                    <Select value={formData.grant_writing_experience} onValueChange={(val) => handleChange('grant_writing_experience', val)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Experience</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="hopes_to_learn">What do you hope to learn? *</Label>
                    <Textarea
                      id="hopes_to_learn"
                      value={formData.hopes_to_learn}
                      onChange={(e) => handleChange('hopes_to_learn', e.target.value)}
                      placeholder="Tell us about your learning goals..."
                      className="mt-1 h-24"
                    />
                  </div>
                  <div>
                    <Label htmlFor="concerns">What makes you nervous about this journey?</Label>
                    <Textarea
                      id="concerns"
                      value={formData.concerns}
                      onChange={(e) => handleChange('concerns', e.target.value)}
                      placeholder="Share any concerns or challenges you're facing..."
                      className="mt-1 h-24"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Choose Path */}
              {step === 4 && (
                <div className="space-y-6">
                  <RadioGroup value={formData.registration_type} onValueChange={(val) => handleChange('registration_type', val)}>
                    <div className="flex items-start space-x-3 p-4 border-2 border-slate-200 rounded-lg hover:border-emerald-500 transition-colors cursor-pointer">
                      <RadioGroupItem value="course" id="course" />
                      <Label htmlFor="course" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <GraduationCap className="w-5 h-5 text-emerald-600" />
                          <span className="font-semibold text-slate-900">Enroll in a Course</span>
                        </div>
                        <p className="text-sm text-slate-600">Join a structured learning program</p>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border-2 border-slate-200 rounded-lg hover:border-emerald-500 transition-colors cursor-pointer">
                      <RadioGroupItem value="coaching" id="coaching" />
                      <Label htmlFor="coaching" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-5 h-5 text-emerald-600" />
                          <span className="font-semibold text-slate-900">Get Coaching</span>
                        </div>
                        <p className="text-sm text-slate-600">Work one-on-one with an expert</p>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border-2 border-slate-200 rounded-lg hover:border-emerald-500 transition-colors cursor-pointer">
                      <RadioGroupItem value="platform" id="platform" />
                      <Label htmlFor="platform" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-5 h-5 text-emerald-600" />
                          <span className="font-semibold text-slate-900">Explore the Platform</span>
                        </div>
                        <p className="text-sm text-slate-600">Access all tools and resources</p>
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.registration_type === 'course' && (
                    <div>
                      <Label>Select a Course</Label>
                      <Select value={formData.selected_course_id} onValueChange={(val) => handleChange('selected_course_id', val)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose your course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}
                {step < 4 ? (
                  <Button type="button" onClick={handleNext} className="ml-auto bg-emerald-600 hover:bg-emerald-700">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={registerMutation.isPending}
                    className="ml-auto bg-emerald-600 hover:bg-emerald-700"
                  >
                    {registerMutation.isPending ? 'Creating Account...' : 'Complete Registration'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{' '}
          <a href={createPageUrl('Home')} className="text-emerald-600 hover:text-emerald-700 font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}