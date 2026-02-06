import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import AIPreliminaryFeedback from '@/components/review/AIPreliminaryFeedback';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700', icon: Clock },
  in_review: { label: 'In Review', color: 'bg-purple-100 text-purple-700', icon: FileText }
};

export default function ReviewQueue({ reviewRequests, isLoading }) {
  const [expandedRequest, setExpandedRequest] = useState(null);

  if (isLoading) {
    return <Card><CardContent className="py-8 text-center text-slate-500">Loading...</CardContent></Card>;
  }

  if (!reviewRequests?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No pending reviews</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviewRequests.map((request, i) => {
        const config = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
        const StatusIcon = config.icon;

        return (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="w-5 h-5 text-slate-400" />
                      <h3 className="font-semibold text-slate-900">
                        {request.request_type.replace(/_/g, ' ')}
                      </h3>
                      <Badge className={config.color}>{config.label}</Badge>
                      {request.priority === 'urgent' && (
                        <Badge className="bg-red-100 text-red-700">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>Requested {format(new Date(request.created_date), 'MMM d, yyyy')}</span>
                      {request.requested_at && (
                        <span>• Turnaround: 3-5 days</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Feedback
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Start Review
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* AI Preliminary Feedback */}
                {expandedRequest === request.id && (
                  <div className="mt-4 pt-4 border-t">
                    <AIPreliminaryFeedback 
                      documentContent={request.document_content || request.notes || 'No content available'}
                      documentType={request.request_type}
                      consultantLevel="level-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}