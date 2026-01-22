import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle2, TrendingUp, FileText } from 'lucide-react';
import ReadinessIndicator from '@/components/dashboard/ReadinessIndicator';

export default function ReadinessStatusPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: badges } = useQuery({
    queryKey: ['badges', user?.email],
    queryFn: () => base44.entities.ReadinessBadge.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const organization = organizations?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Readiness Status</h1>
          <p className="text-slate-600">Your verified readiness and achievements</p>
        </motion.div>

        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Readiness Level</CardTitle>
            </CardHeader>
            <CardContent>
              {organization ? (
                <ReadinessIndicator status={organization.readiness_status} />
              ) : (
                <p className="text-slate-500">Complete your profile to see your readiness status</p>
              )}
            </CardContent>
          </Card>

          {/* Verified Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                Verified Readiness Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {badges && badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {badges.map(badge => (
                    <div key={badge.id} className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-slate-900 capitalize">
                            {badge.funding_lane.replace('_', ' ')} Ready
                          </p>
                          <Badge className="mt-1 capitalize">{badge.badge_type.replace('_', ' ')}</Badge>
                        </div>
                      </div>
                      {badge.verification_notes && (
                        <p className="text-sm text-slate-600 mt-2">{badge.verification_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">No verified badges yet</p>
                  <p className="text-sm text-slate-500">
                    Complete your readiness checklists and request coach verification
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* What This Means */}
          <Card>
            <CardHeader>
              <CardTitle>What Your Readiness Status Means</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Plain Language Explanation</h3>
                <p className="text-sm text-blue-800">
                  Your readiness status indicates which funding pathways you're prepared to pursue based on your organizational development, documentation, and capacity.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Progress-Based</p>
                    <p className="text-sm text-slate-600">Status updates as you complete checklists and build capacity</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Coach Verified</p>
                    <p className="text-sm text-slate-600">Optional coach review adds verified badge</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Document-Driven</p>
                    <p className="text-sm text-slate-600">Based on actual organizational documentation and capacity</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}