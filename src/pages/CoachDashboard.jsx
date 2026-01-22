import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileText, Users, AlertTriangle, Calendar } from 'lucide-react';
import ReviewQueue from '@/components/coach/ReviewQueue';
import AssignedOrganizations from '@/components/coach/AssignedOrganizations';
import OrganizationReviewView from '@/components/coach/OrganizationReviewView';

export default function CoachDashboard() {
  const [selectedOrg, setSelectedOrg] = useState(null);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: reviewRequests, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviewRequests', user?.email],
    queryFn: () => base44.entities.ReviewRequest.filter({ 
      assigned_coach_id: user?.id,
      status: { $in: ['pending', 'assigned', 'in_review'] }
    }),
    enabled: !!user?.id,
  });

  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['assignedOrganizations', user?.email],
    queryFn: async () => {
      if (!user?.assigned_organization_ids?.length) return [];
      return base44.entities.Organization.filter({
        id: { $in: user.assigned_organization_ids }
      });
    },
    enabled: !!user?.assigned_organization_ids,
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (user?.role !== 'coach' && user?.role !== 'owner' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-slate-600">Coach access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedOrg) {
    return (
      <OrganizationReviewView 
        organization={selectedOrg}
        onBack={() => setSelectedOrg(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900">Coach Dashboard</h1>
          <p className="text-slate-600 mt-1">
            {user?.coach_specialization ? `${user.coach_specialization} specialist` : 'Review queue and assignments'}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {reviewRequests?.length || 0}
                  </p>
                  <p className="text-sm text-slate-600">Pending Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {organizations?.length || 0}
                  </p>
                  <p className="text-sm text-slate-600">Assigned Orgs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                  <p className="text-sm text-slate-600">Upcoming Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reviews">Review Queue</TabsTrigger>
            <TabsTrigger value="organizations">My Organizations</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <ReviewQueue 
              reviewRequests={reviewRequests || []} 
              isLoading={reviewsLoading}
            />
          </TabsContent>

          <TabsContent value="organizations">
            <AssignedOrganizations
              organizations={organizations || []}
              isLoading={orgsLoading}
              onSelectOrg={setSelectedOrg}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}