import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, CheckCircle, XCircle, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function TestimonialManagement() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('pending');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => base44.entities.Testimonial.list()
  });

  const updateTestimonialMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Testimonial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonials']);
      toast.success('Testimonial updated successfully');
    }
  });

  const handleApprove = (testimonial) => {
    updateTestimonialMutation.mutate({
      id: testimonial.id,
      data: { ...testimonial, admin_approved: true }
    });
  };

  const handleReject = (testimonial) => {
    updateTestimonialMutation.mutate({
      id: testimonial.id,
      data: { ...testimonial, admin_approved: false, approved_for_website: false }
    });
  };

  const toggleFeatured = (testimonial) => {
    updateTestimonialMutation.mutate({
      id: testimonial.id,
      data: { ...testimonial, is_featured: !testimonial.is_featured }
    });
  };

  const pendingTestimonials = testimonials.filter(t => !t.admin_approved && t.approved_for_website);
  const approvedTestimonials = testimonials.filter(t => t.admin_approved);
  const featuredTestimonials = testimonials.filter(t => t.is_featured);

  if (user?.role !== 'admin') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Testimonial Management</h1>
        <p className="text-slate-600 mt-2">Review and manage user testimonials for your website</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingTestimonials.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvedTestimonials.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{featuredTestimonials.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingTestimonials.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedTestimonials.length})
          </TabsTrigger>
          <TabsTrigger value="featured">
            Featured ({featuredTestimonials.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingTestimonials.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-slate-600">No testimonials pending review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingTestimonials.map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{testimonial.user_name}</h3>
                        <p className="text-sm text-slate-500">{testimonial.organization_name}</p>
                      </div>
                      <Badge variant="outline">{testimonial.program_type}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>

                    <p className="text-slate-700 mb-6">"{testimonial.testimonial_text}"</p>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleApprove(testimonial)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(testimonial)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <span className="text-xs text-slate-500 ml-auto">
                        Submitted {new Date(testimonial.submitted_date || testimonial.created_date).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <div className="space-y-4">
            {approvedTestimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{testimonial.user_name}</h3>
                      <p className="text-sm text-slate-500">{testimonial.organization_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{testimonial.program_type}</Badge>
                      {testimonial.is_featured && <Badge className="bg-yellow-500">Featured</Badge>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>

                  <p className="text-slate-700 mb-6">"{testimonial.testimonial_text}"</p>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeatured(testimonial)}
                    >
                      {testimonial.is_featured ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Unfeature
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Make Featured
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          <div className="space-y-4">
            {featuredTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{testimonial.user_name}</h3>
                      <p className="text-sm text-slate-500">{testimonial.organization_name}</p>
                    </div>
                    <Badge className="bg-yellow-500">Featured</Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>

                  <p className="text-slate-700 mb-6">"{testimonial.testimonial_text}"</p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFeatured(testimonial)}
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Remove from Featured
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}