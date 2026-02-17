import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Clock, Send, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentReviewWorkflow({ contentId, onClose }) {
  const [reviewNotes, setReviewNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: versions = [] } = useQuery({
    queryKey: ['content-versions', contentId],
    queryFn: () => base44.entities.ContentVersion.filter({ content_id: contentId }, '-version_number')
  });

  const { data: content } = useQuery({
    queryKey: ['learning-content', contentId],
    queryFn: async () => {
      const items = await base44.entities.LearningContent.filter({ id: contentId });
      return items[0];
    },
    enabled: !!contentId
  });

  const submitForReviewMutation = useMutation({
    mutationFn: async ({ changeDescription }) => {
      const latestVersion = versions[0];
      const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

      return base44.entities.ContentVersion.create({
        content_id: contentId,
        version_number: newVersionNumber,
        content_snapshot: content,
        change_description: changeDescription,
        changed_by: user.email,
        status: 'pending_review'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['content-versions']);
      toast.success('Submitted for review');
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ versionId, status, notes }) => {
      await base44.entities.ContentVersion.update(versionId, {
        status,
        review_notes: notes,
        reviewer_email: user.email,
        reviewed_date: new Date().toISOString()
      });

      // If approved, mark as current and publish changes
      if (status === 'approved') {
        const version = versions.find(v => v.id === versionId);
        
        // Update all other versions to not be current
        await Promise.all(
          versions
            .filter(v => v.is_current)
            .map(v => base44.entities.ContentVersion.update(v.id, { is_current: false }))
        );

        // Mark this version as current
        await base44.entities.ContentVersion.update(versionId, { is_current: true, status: 'published' });

        // Apply changes to actual content
        await base44.entities.LearningContent.update(contentId, version.content_snapshot.data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['content-versions']);
      queryClient.invalidateQueries(['learning-content']);
      setReviewNotes('');
      toast.success('Review submitted');
    }
  });

  const getStatusBadge = (status) => {
    const config = {
      draft: { bg: 'bg-slate-100 text-slate-800', label: 'Draft' },
      pending_review: { bg: 'bg-amber-100 text-amber-800', label: 'Pending Review' },
      approved: { bg: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100 text-red-800', label: 'Rejected' },
      published: { bg: 'bg-blue-100 text-blue-800', label: 'Published' }
    };
    const { bg, label } = config[status] || config.draft;
    return <Badge className={bg}>{label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Version Control & Review</span>
          {onClose && <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="versions">
          <TabsList>
            <TabsTrigger value="versions">Version History</TabsTrigger>
            <TabsTrigger value="review">Pending Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="versions" className="space-y-4">
            {versions.map((version) => (
              <Card key={version.id} className={version.is_current ? 'border-blue-500 border-2' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">Version {version.version_number}</h4>
                        {getStatusBadge(version.status)}
                        {version.is_current && <Badge className="bg-blue-600">Current</Badge>}
                      </div>
                      <p className="text-sm text-slate-600">{version.change_description}</p>
                    </div>
                    <div className="text-xs text-slate-500 text-right">
                      <p>{new Date(version.created_date).toLocaleDateString()}</p>
                      <p>by {version.changed_by}</p>
                    </div>
                  </div>

                  {version.review_notes && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Review Notes:</p>
                      <p className="text-sm text-slate-700">{version.review_notes}</p>
                      {version.reviewer_email && (
                        <p className="text-xs text-slate-500 mt-1">Reviewed by {version.reviewer_email}</p>
                      )}
                    </div>
                  )}

                  {version.status === 'pending_review' && user?.role === 'admin' && (
                    <div className="mt-4 space-y-3">
                      <Textarea
                        placeholder="Review notes (optional)..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => reviewMutation.mutate({ 
                            versionId: version.id, 
                            status: 'approved', 
                            notes: reviewNotes 
                          })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Approve & Publish
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => reviewMutation.mutate({ 
                            versionId: version.id, 
                            status: 'rejected', 
                            notes: reviewNotes 
                          })}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {versions.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No versions yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="review">
            <div className="space-y-4">
              {versions.filter(v => v.status === 'pending_review').map((version) => (
                <Card key={version.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold mb-1">Version {version.version_number}</h4>
                        <p className="text-sm text-slate-600 mb-2">{version.change_description}</p>
                        <p className="text-xs text-slate-500">
                          Submitted by {version.changed_by} on {new Date(version.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(version.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {versions.filter(v => v.status === 'pending_review').length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No pending reviews</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}