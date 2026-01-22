import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const READINESS_LABELS = {
  pre_funding: 'Pre-Funding',
  grant_eligible: 'Grant Eligible',
  contract_ready: 'Contract Ready',
  relationship_building: 'Relationship Building',
  scaling: 'Scaling'
};

export default function AssignedOrganizations({ organizations, isLoading, onSelectOrg }) {
  if (isLoading) {
    return <Card><CardContent className="py-8 text-center text-slate-500">Loading...</CardContent></Card>;
  }

  if (!organizations?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No organizations assigned</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {organizations.map((org, i) => (
        <motion.div
          key={org.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelectOrg(org)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-semibold text-slate-900">{org.name}</h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      {org.type?.replace(/_/g, ' ')}
                    </Badge>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      {READINESS_LABELS[org.readiness_status] || 'Unknown'}
                    </Badge>
                  </div>

                  {org.interest_areas?.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>{org.interest_areas.join(', ')}</span>
                    </div>
                  )}
                </div>

                <Button variant="ghost" size="icon">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}