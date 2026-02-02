import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Users, Sparkles, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    orgName: '',
    orgType: '',
    orgStage: '',
    experience: '',
    goals: '',
    concerns: '',
    registrationType: 'course',
    selectedCourseId: ''
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['availableCourses'],
    queryFn: () => base44.entities.LearningContent.filter({ content_type: 'course' }),
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const org = await base44.entities.Organization.create({
        name: data.orgName,
        type: data.orgType,
        stage: data.orgStage,
        onboarding_completed: false
      });

      if (data.registrationType === 'course' && data.selectedCourseId) {
        await base44.entities.UserEnrollment.create({
          user_email: data.email,
          content_id: data.selectedCourseId,
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

  const handleNext = () => {
    setError('');
    if (currentStep === 1 && (!formData.full_name || !formData.email || !formData.password)) {
      setError('Please fill in all required fields');
      return;
    }
    if (currentStep === 2 && (!formData.orgName || !formData.orgType)) {
      setError('Please fill in organization details');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5C089]/20 via-white to-[#143A50]/10">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png" 
              alt="Elbert Innovative Solutions" 
              className="h-16 w-auto mx-auto mb-6"
            />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Transform Your Funding Journey
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Join a community of organizations achieving funding success with expert guidance, AI-powered tools, and proven strategies
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#E5C089]" />
                <span>Expert Coaching</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#E5C089]" />
                <span>AI-Powered Tools</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#E5C089]" />
                <span>Stage-Based Templates</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-2xl border-2">
            <CardHeader className="space-y-1 text-center bg-gradient-to-br from-slate-50 to-white">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Create Your Account
              </CardTitle>
              <p className="text-slate-600">
                Step {currentStep} of 3 • Get started in minutes
              </p>
            </CardHeader>

            <CardContent className="pt-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Progress Indicator */}
              <div className="flex items-center justify-between mb-8">
                {[
                  { num: 1, label: 'Account' },
                  { num: 2, label: 'Organization' },
                  { num: 3, label: 'Learning Path' }
                ].map((step, idx) => (
                  <div key={step.num} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                        currentStep >= step.num 
                          ? 'bg-[#143A50] text-white shadow-lg' 
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {currentStep > step.num ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          step.num
                        )}
                      </div>
                      <span className={`text-xs mt-1 font-medium ${
                        currentStep >= step.num ? 'text-[#143A50]' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className={`flex-1 h-1 mx-2 transition-all ${
                        currentStep > step.num ? 'bg-[#143A50]' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Account Info */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <Label>Password *</Label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Create a secure password"
                      />
                    </div>
                    <Button 
                      type="button"
                      onClick={handleNext}
                      disabled={!formData.full_name || !formData.email || !formData.password}
                      className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
                    >
                      Continue to Organization <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Organization */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label>Organization Name *</Label>
                      <Input
                        value={formData.orgName}
                        onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                        placeholder="Your organization"
                      />
                    </div>
                    <div>
                      <Label>Organization Type *</Label>
                      <Select value={formData.orgType} onValueChange={(v) => setFormData({ ...formData, orgType: v })}>
                        <SelectTrigger>
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
                      <Label>Organization Stage</Label>
                      <Select value={formData.orgStage} onValueChange={(v) => setFormData({ ...formData, orgStage: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="idea">Idea / Startup</SelectItem>
                          <SelectItem value="early">Early Stage</SelectItem>
                          <SelectItem value="operating">Operating</SelectItem>
                          <SelectItem value="scaling">Scaling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                        Back
                      </Button>
                      <Button 
                        type="button"
                        onClick={handleNext}
                        disabled={!formData.orgName || !formData.orgType}
                        className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]"
                      >
                        Continue to Learning Path <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Learning Path */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <RadioGroup value={formData.registrationType} onValueChange={(v) => setFormData({ ...formData, registrationType: v })}>
                      <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:border-[#143A50] transition-colors cursor-pointer">
                        <RadioGroupItem value="course" id="course" />
                        <Label htmlFor="course" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <GraduationCap className="w-5 h-5 text-[#143A50]" />
                            <span className="font-semibold">Enroll in a Course</span>
                          </div>
                          <p className="text-sm text-slate-600">Structured learning with expert guidance</p>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:border-[#143A50] transition-colors cursor-pointer">
                        <RadioGroupItem value="coaching" id="coaching" />
                        <Label htmlFor="coaching" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-5 h-5 text-[#143A50]" />
                            <span className="font-semibold">Get Coaching</span>
                          </div>
                          <p className="text-sm text-slate-600">One-on-one support from experts</p>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:border-[#143A50] transition-colors cursor-pointer">
                        <RadioGroupItem value="explore" id="explore" />
                        <Label htmlFor="explore" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-5 h-5 text-[#143A50]" />
                            <span className="font-semibold">Explore Platform</span>
                          </div>
                          <p className="text-sm text-slate-600">Access all tools and resources</p>
                        </Label>
                      </div>
                    </RadioGroup>

                    {formData.registrationType === 'course' && (
                      <div>
                        <Label>Select a Course</Label>
                        <Select value={formData.selectedCourseId} onValueChange={(v) => setFormData({ ...formData, selectedCourseId: v })}>
                          <SelectTrigger>
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

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                        Back
                      </Button>
                      <Button 
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="flex-1 bg-[#AC1A5B] hover:bg-[#A65D40]"
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Your Account...
                          </>
                        ) : (
                          <>
                            Complete Registration <CheckCircle2 className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <a href={createPageUrl('Home')} className="text-[#143A50] hover:text-[#1E4F58] font-medium">
              Sign in
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}