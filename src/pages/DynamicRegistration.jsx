import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Calendar, MapPin, Clock, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DynamicRegistration() {
  const [registrationData, setRegistrationData] = useState({
    user_name: '',
    user_email: '',
    phone: '',
    organization_name: '',
    answers: {}
  });
  const [submitted, setSubmitted] = useState(false);
  
  const slug = window.location.pathname.split('/register/')[1];

  const { data: registrationPage, isLoading } = useQuery({
    queryKey: ['registrationPage', slug],
    queryFn: async () => {
      const pages = await base44.entities.RegistrationPage.filter({ slug });
      return pages[0];
    },
    enabled: !!slug
  });

  const submitRegistration = useMutation({
    mutationFn: async (data) => {
      const submission = await base44.entities.RegistrationSubmission.create({
        registration_page_id: registrationPage.id,
        user_email: data.user_email,
        user_name: data.user_name,
        entry_point: registrationPage.registration_type,
        registration_data: data,
        payment_status: registrationPage.pricing.type === 'free' ? 'paid' : 'pending'
      });

      // Create user access level
      await base44.entities.UserAccessLevel.create({
        user_email: data.user_email,
        access_level: registrationPage.access_level,
        entry_point: registrationPage.registration_type,
        allowed_community_spaces: registrationPage.community_space_id ? [registrationPage.community_space_id] : [],
        coaching_access: registrationPage.registration_type === 'coaching'
      });

      return submission;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Registration successful!');
    },
    onError: (error) => {
      toast.error('Registration failed. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitRegistration.mutate(registrationData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#143A50] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading registration...</p>
        </div>
      </div>
    );
  }

  if (!registrationPage || !registrationPage.is_active) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Registration Not Available</h2>
            <p className="text-slate-600">This registration page is not currently active.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Confirmed!</h2>
            <p className="text-slate-600 mb-6">
              Thank you for registering for {registrationPage.page_name}. 
              Check your email for confirmation and next steps.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Platform
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      {registrationPage.hero_image_url && (
        <div 
          className="h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${registrationPage.hero_image_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{registrationPage.title}</h1>
          <p className="text-lg text-slate-600">{registrationPage.description}</p>
        </div>

        {/* Offering Details */}
        {registrationPage.offering_details && Object.keys(registrationPage.offering_details).length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {registrationPage.offering_details.duration && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#143A50] mt-1" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Duration</p>
                      <p className="text-sm text-slate-600">{registrationPage.offering_details.duration}</p>
                    </div>
                  </div>
                )}
                {registrationPage.offering_details.dates && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#143A50] mt-1" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Dates</p>
                      <p className="text-sm text-slate-600">{registrationPage.offering_details.dates}</p>
                    </div>
                  </div>
                )}
                {registrationPage.offering_details.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#143A50] mt-1" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Location</p>
                      <p className="text-sm text-slate-600">{registrationPage.offering_details.location}</p>
                    </div>
                  </div>
                )}
                {registrationPage.pricing && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-[#143A50] mt-1" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Investment</p>
                      <p className="text-sm text-slate-600">
                        {registrationPage.pricing.type === 'free' ? 'Free' : `$${registrationPage.pricing.amount}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Register Now</CardTitle>
            <CardDescription>Complete the form below to secure your spot</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    required
                    value={registrationData.user_name}
                    onChange={(e) => setRegistrationData({ ...registrationData, user_name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    required
                    type="email"
                    value={registrationData.user_email}
                    onChange={(e) => setRegistrationData({ ...registrationData, user_email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    value={registrationData.phone}
                    onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })}
                    placeholder="(555) 555-5555"
                  />
                </div>

                <div>
                  <Label>Organization Name</Label>
                  <Input
                    value={registrationData.organization_name}
                    onChange={(e) => setRegistrationData({ ...registrationData, organization_name: e.target.value })}
                    placeholder="Your organization"
                  />
                </div>
              </div>

              {/* Custom Questions */}
              {registrationPage.custom_questions && registrationPage.custom_questions.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium text-slate-900">Additional Information</h3>
                  {registrationPage.custom_questions.map((question, idx) => (
                    <div key={idx}>
                      <Label>{question.question} {question.required && '*'}</Label>
                      {question.type === 'textarea' ? (
                        <Textarea
                          required={question.required}
                          onChange={(e) => setRegistrationData({
                            ...registrationData,
                            answers: { ...registrationData.answers, [question.question]: e.target.value }
                          })}
                        />
                      ) : question.type === 'select' ? (
                        <Select
                          required={question.required}
                          onValueChange={(value) => setRegistrationData({
                            ...registrationData,
                            answers: { ...registrationData.answers, [question.question]: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options?.map((option, oidx) => (
                              <SelectItem key={oidx} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          required={question.required}
                          onChange={(e) => setRegistrationData({
                            ...registrationData,
                            answers: { ...registrationData.answers, [question.question]: e.target.value }
                          })}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitRegistration.isPending}>
                {submitRegistration.isPending ? 'Processing...' : 'Complete Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}