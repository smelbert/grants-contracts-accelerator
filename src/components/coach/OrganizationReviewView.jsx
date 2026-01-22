import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, CheckSquare, AlertTriangle, Shield } from 'lucide-react';
import ReadinessIndicator from '@/components/dashboard/ReadinessIndicator';

export default function OrganizationReviewView({ organization, onBack }) {
  const { data: documents } = useQuery({
    queryKey: ['orgDocuments', organization?.id],
    queryFn: () => base44.entities.Document.filter({ created_by: organization?.created_by }),
    enabled: !!organization?.created_by,
  });

  const { data: checklists } = useQuery({
    queryKey: ['orgChecklists', organization?.id],
    queryFn: () => base44.entities.ReadinessChecklist.filter({ created_by: organization?.created_by }),
    enabled: !!organization?.created_by,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Organizations
        </Button>

        {/* Organization Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{organization.name}</h1>
              <p className="text-slate-600 mt-1 capitalize">{organization.type?.replace(/_/g, ' ')}</p>
            </div>
            <Badge variant="outline" className="capitalize">
              {organization.stage} Stage
            </Badge>
          </div>
          <ReadinessIndicator status={organization.readiness_status} />
        </motion.div>

        {/* Coach Authority Notice */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Shield className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>Coach View:</strong> You can review documents and provide feedback, but cannot 
            unlock features, override readiness stages, or promise funding outcomes.
          </AlertDescription>
        </Alert>

        {/* Organization Profile (Read-Only) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Organization Profile (Read-Only)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Location:</span>
              <p className="font-medium text-slate-900">{organization.city}, {organization.state}</p>
            </div>
            <div>
              <span className="text-slate-600">Annual Budget:</span>
              <p className="font-medium text-slate-900 capitalize">{organization.annual_budget?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <span className="text-slate-600">Governance:</span>
              <p className="font-medium text-slate-900 capitalize">{organization.governance_status?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <span className="text-slate-600">Funding Experience:</span>
              <p className="font-medium text-slate-900 capitalize">{organization.funding_experience}</p>
            </div>
          </CardContent>
        </Card>

        {/* Documents & Checklists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Submitted Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents?.length > 0 ? (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div key={doc.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{doc.doc_name}</p>
                        <p className="text-xs text-slate-500 capitalize">{doc.status}</p>
                      </div>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No documents submitted</p>
              )}
            </CardContent>
          </Card>

          {/* Checklist Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Checklist Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {checklists?.length > 0 ? (
                <div className="space-y-3">
                  {checklists.map(checklist => (
                    <div key={checklist.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{checklist.funding_lane}</span>
                        <span className="text-sm text-slate-600">{checklist.completion_percentage || 0}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 transition-all"
                          style={{ width: `${checklist.completion_percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No checklists started</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}