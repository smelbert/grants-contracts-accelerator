import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function ReviewQueuePage() {
  const [activeTab, setActiveTab] = useState('pending');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => base44.entities.ReviewRequest.list('-created_date'),
  });

  const pendingReviews = reviews?.filter(r => r.status === 'pending' || r.status === 'assigned');
  const inProgressReviews = reviews?.filter(r => r.status === 'in_review');
  const completedReviews = reviews?.filter(r => r.status === 'completed');

  const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-700',
    assigned: 'bg-blue-100 text-blue-700',
    in_review: 'bg-purple-100 text-purple-700',
    completed: 'bg-emerald-100 text-emerald-700'
  };

  const ReviewCard = ({ review }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-400" />
            <div>
              <p className="font-medium text-slate-900">Review Request #{review.id.slice(0, 8)}</p>
              <p className="text-sm text-slate-600 capitalize">{review.request_type.replace('_', ' ')}</p>
            </div>
          </div>
          <Badge className={STATUS_COLORS[review.status]}>
            {review.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            Requested {format(new Date(review.created_date), 'MMM d, yyyy')}
          </div>
          {review.priority === 'urgent' && (
            <Badge variant="destructive" className="text-xs">Urgent</Badge>
          )}
        </div>

        <Button variant="outline" size="sm" className="w-full">
          <Eye className="w-4 h-4 mr-2" />
          Review Document
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Review Queue</h1>
          <p className="text-slate-600">Manage document reviews and feedback</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pending">
              Pending ({pendingReviews?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({inProgressReviews?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedReviews?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingReviews?.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ReviewCard review={review} />
                </motion.div>
              ))}
            </div>
            {(!pendingReviews || pendingReviews.length === 0) && (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No pending reviews</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="in_progress">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressReviews?.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ReviewCard review={review} />
                </motion.div>
              ))}
            </div>
            {(!inProgressReviews || inProgressReviews.length === 0) && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No reviews in progress</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedReviews?.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ReviewCard review={review} />
                </motion.div>
              ))}
            </div>
            {(!completedReviews || completedReviews.length === 0) && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No completed reviews</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}