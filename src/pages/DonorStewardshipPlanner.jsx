import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Heart, Calendar, Grid, Download, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import StewardshipPlanBuilder from '@/components/stewardship/StewardshipPlanBuilder';
import TouchpointLibrary from '@/components/stewardship/TouchpointLibrary';
import StewardshipMatrix from '@/components/stewardship/StewardshipMatrix';
import StewardshipCalendar from '@/components/stewardship/StewardshipCalendar';
import AIStewardshipAssistant from '@/components/stewardship/AIStewardshipAssistant';

export default function DonorStewardshipPlannerPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: stewardshipPlans = [], isLoading } = useQuery({
    queryKey: ['stewardship-plans', user?.email],
    queryFn: () => base44.entities.DonorStewardshipPlan.list('-created_date'),
    enabled: !!user
  });

  const { data: touchpoints = [] } = useQuery({
    queryKey: ['stewardship-touchpoints'],
    queryFn: () => base44.entities.StewardshipTouchpoint.filter({ is_active: true })
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Donor Stewardship Planner
              </h1>
              <p className="text-slate-600">
                Create comprehensive donor engagement and retention strategies
              </p>
            </div>
            <Button
              onClick={() => setActiveTab('builder')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Plan
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Active Plans</p>
                  <p className="text-3xl font-bold">{stewardshipPlans.filter(p => p.is_active).length}</p>
                </div>
                <Heart className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Touchpoints</p>
                  <p className="text-3xl font-bold">{touchpoints.length}</p>
                </div>
                <Grid className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">This Month</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <Calendar className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Segments</p>
                  <p className="text-3xl font-bold">
                    {selectedPlan?.donor_segments?.length || 0}
                  </p>
                </div>
                <Download className="w-8 h-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">My Plans</TabsTrigger>
            <TabsTrigger value="builder">Plan Builder</TabsTrigger>
            <TabsTrigger value="touchpoints">Touchpoint Library</TabsTrigger>
            <TabsTrigger value="matrix">Stewardship Matrix</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="ai-assistant">
              <Sparkles className="w-4 h-4 mr-1" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-slate-500">Loading plans...</p>
                  </CardContent>
                </Card>
              ) : stewardshipPlans.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No Stewardship Plans Yet
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Create your first donor stewardship plan to start building lasting relationships
                    </p>
                    <Button onClick={() => setActiveTab('builder')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Plan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                stewardshipPlans.map((plan) => (
                  <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            {plan.plan_name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>Fiscal Year: {plan.fiscal_year || 'Not set'}</span>
                            <span>•</span>
                            <span>{plan.donor_segments?.length || 0} Segments</span>
                            <span>•</span>
                            <span>{plan.annual_calendar?.length || 0} Scheduled Activities</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setActiveTab('matrix');
                            }}
                          >
                            View Matrix
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedPlan(plan);
                              setActiveTab('builder');
                            }}
                          >
                            Edit Plan
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="builder" className="mt-6">
            <StewardshipPlanBuilder
              plan={selectedPlan}
              touchpoints={touchpoints}
              onSave={() => {
                queryClient.invalidateQueries(['stewardship-plans']);
                setActiveTab('overview');
                setSelectedPlan(null);
              }}
              onCancel={() => {
                setActiveTab('overview');
                setSelectedPlan(null);
              }}
            />
          </TabsContent>

          <TabsContent value="touchpoints" className="mt-6">
            <TouchpointLibrary touchpoints={touchpoints} />
          </TabsContent>

          <TabsContent value="matrix" className="mt-6">
            <StewardshipMatrix
              plan={selectedPlan}
              touchpoints={touchpoints}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <StewardshipCalendar
              plan={selectedPlan}
            />
          </TabsContent>

          <TabsContent value="ai-assistant" className="mt-6">
            <AIStewardshipAssistant
              onPlanGenerated={(planData) => {
                setSelectedPlan(planData);
                setActiveTab('builder');
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}