import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: 'bg-blue-600', icon: Clock },
  in_review: { label: 'In Review', color: 'bg-yellow-600', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-600', icon: CheckCircle2 },
  in_development: { label: 'In Development', color: 'bg-purple-600', icon: Clock },
  completed: { label: 'Completed', color: 'bg-emerald-600', icon: CheckCircle2 },
  declined: { label: 'Declined', color: 'bg-red-600', icon: XCircle },
};

export default function MyLearningRequests({ userEmail }) {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['learning-requests', userEmail],
    queryFn: () => base44.entities.LearningRequest.filter({ requester_email: userEmail }, '-created_date'),
    enabled: !!userEmail,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Requests Yet</h3>
          <p className="text-slate-600">
            Request custom learning content tailored to your organization's needs
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.submitted;
        const StatusIcon = statusConfig.icon;

        return (
          <Card key={request.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-purple-600">{request.request_type}</Badge>
                    <Badge className={statusConfig.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                    {request.urgency === 'high' && (
                      <Badge className="bg-red-600">High Priority</Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-slate-900">{request.topic}</h4>
                  {request.description && (
                    <p className="text-sm text-slate-600 mt-1">{request.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t">
                <span>Requested {format(new Date(request.created_date), 'MMM d, yyyy')}</span>
                {request.admin_notes && (
                  <span className="text-emerald-600 font-medium">Admin: {request.admin_notes}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}