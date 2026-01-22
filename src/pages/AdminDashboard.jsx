import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Users, Building2, FileText, AlertTriangle, 
  TrendingUp, CheckCircle2, Clock, Eye
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations } = useQuery({
    queryKey: ['admin_all_organizations'],
    queryFn: () => base44.entities.Organization.list('-created_date', 100),
    enabled: user?.role === 'owner' || user?.role === 'admin',
  });

  const { data: allUsers } = useQuery({
    queryKey: ['admin_all_users'],
    queryFn: () => base44.entities.User.list('-created_date', 100),
    enabled: user?.role === 'owner' || user?.role === 'admin',
  });

  const { data: reviewRequests } = useQuery({
    queryKey: ['admin_review_requests'],
    queryFn: () => base44.entities.ReviewRequest.list('-requested_at', 50),
    enabled: user?.role === 'owner' || user?.role === 'admin',
  });

  // Access control
  if (user?.role !== 'owner' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
            <p className="text-slate-600">This area is only accessible to platform administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    totalOrgs: organizations?.length || 0,
    grantEligible: organizations?.filter(o => o.readiness_status === 'grant_eligible').length || 0,
    contractReady: organizations?.filter(o => o.readiness_status === 'contract_ready').length || 0,
    preFunding: organizations?.filter(o => o.readiness_status === 'pre_funding').length || 0,
    coaches: allUsers?.filter(u => u.role === 'coach').length || 0,
    pendingReviews: reviewRequests?.filter(r => r.status === 'pending').length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-500">Platform governance and oversight</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total Orgs</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalOrgs}</p>
                </div>
                <Building2 className="w-8 h-8 text-slate-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Grant Eligible</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.grantEligible}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Contract Ready</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.contractReady}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-blue-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Pre-Funding</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.preFunding}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Active Coaches</p>
                  <p className="text-2xl font-bold text-violet-600">{stats.coaches}</p>
                </div>
                <Users className="w-8 h-8 text-violet-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Pending Reviews</p>
                  <p className="text-2xl font-bold text-red-600">{stats.pendingReviews}</p>
                </div>
                <FileText className="w-8 h-8 text-red-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="organizations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="users">Users & Coaches</TabsTrigger>
            <TabsTrigger value="reviews">Review Queue</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <CardTitle>All Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {organizations?.slice(0, 10).map((org) => (
                    <div key={org.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{org.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{org.type} • {org.stage}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {org.readiness_status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Platform Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allUsers?.slice(0, 10).map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{u.full_name || u.email}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {u.role || 'user'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Review Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reviewRequests?.slice(0, 10).map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900 capitalize">{req.request_type.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-500">Document ID: {req.document_id}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {req.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500">Detailed analytics and reporting coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}