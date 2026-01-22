import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Search, Eye, TrendingUp, FileText, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AssignedOrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: clientStages } = useQuery({
    queryKey: ['clientStages'],
    queryFn: () => base44.entities.ClientStage.filter({ assigned_coach: user?.email }),
    enabled: !!user?.email,
  });

  const { data: organizations } = useQuery({
    queryKey: ['allOrganizations'],
    queryFn: () => base44.entities.Organization.list(),
  });

  const assignedOrgs = organizations?.filter(org => 
    clientStages?.some(cs => cs.organization_id === org.id)
  );

  const filteredOrgs = assignedOrgs?.filter(org =>
    !searchQuery || org.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Assigned Organizations</h1>
          <p className="text-slate-600">Organizations under your coaching</p>
        </motion.div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrgs?.map((org, index) => {
            const stage = clientStages?.find(cs => cs.organization_id === org.id);
            return (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Building2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{org.name}</CardTitle>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {org.stage}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Readiness</span>
                        <Badge className="capitalize">
                          {org.readiness_status?.replace('_', ' ') || 'Not assessed'}
                        </Badge>
                      </div>
                      
                      {stage && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Health Score</span>
                            <span className="font-semibold">{stage.health_score || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Documents</span>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <span className="font-semibold">{stage.documents_created || 0}</span>
                            </div>
                          </div>
                        </>
                      )}

                      <Link to={createPageUrl('Profile')}>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {(!filteredOrgs || filteredOrgs.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No organizations assigned yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}