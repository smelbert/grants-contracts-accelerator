import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Loader2, AlertTriangle } from 'lucide-react';
import PlatformOverview from '@/components/admin/PlatformOverview';
import GovernanceControls from '@/components/admin/GovernanceControls';
import TemplateManagement from '@/components/admin/TemplateManagement';
import ClientManagement from '@/components/admin/ClientManagement';

export default function AdminDashboardPage() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations } = useQuery({
    queryKey: ['allOrganizations'],
    queryFn: () => base44.entities.Organization.list(),
    enabled: user?.role === 'owner' || user?.role === 'admin',
  });

  const { data: documents } = useQuery({
    queryKey: ['allDocuments'],
    queryFn: () => base44.entities.Document.list(),
    enabled: user?.role === 'owner' || user?.role === 'admin',
  });

  const { data: reviewRequests } = useQuery({
    queryKey: ['allReviewRequests'],
    queryFn: () => base44.entities.ReviewRequest.list(),
    enabled: user?.role === 'owner' || user?.role === 'admin',
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (user?.role !== 'owner' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    totalOrgs: organizations?.length || 0,
    activeUsers: organizations?.length || 0,
    totalDocuments: documents?.length || 0,
    completedReviews: reviewRequests?.filter(r => r.status === 'completed').length || 0,
    pendingReviews: reviewRequests?.filter(r => r.status !== 'completed').length || 0,
    ethicalFlags: 0,
    byStage: {
      pre_funding: organizations?.filter(o => o.readiness_status === 'pre_funding').length || 0,
      grant_eligible: organizations?.filter(o => o.readiness_status === 'grant_eligible').length || 0,
      contract_ready: organizations?.filter(o => o.readiness_status === 'contract_ready').length || 0,
      relationship_building: organizations?.filter(o => o.readiness_status === 'relationship_building').length || 0,
      scaling: organizations?.filter(o => o.readiness_status === 'scaling').length || 0,
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-slate-900">Platform Administration</h1>
          </div>
          <p className="text-slate-600">System governance and quality control</p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <PlatformOverview stats={stats} />
          </TabsContent>

          <TabsContent value="clients">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="governance">
            <GovernanceControls />
          </TabsContent>

          <TabsContent value="templates">
            <TemplateManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}