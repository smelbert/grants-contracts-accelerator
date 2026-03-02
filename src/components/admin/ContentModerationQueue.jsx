import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle, CheckCircle2, Trash2, Eye, EyeOff, MessageSquare, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ContentModerationQueue() {
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [selectedAction, setSelectedAction] = useState('approve');
  const queryClient = useQueryClient();

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['moderationFlags'],
    queryFn: async () => {
      const pending = await base44.entities.ContentModerationFlag.filter({
        status: 'pending_review'
      }, '-created_date');
      const recent = await base44.entities.ContentModerationFlag.filter(
        {},
        '-created_date',
        20
      );
      return { pending, recent };
    }
  });

  const reviewFlagMutation = useMutation({
    mutationFn: async ({ flag_id, action, notes }) => {
      await base44.entities.ContentModerationFlag.update(flag_id, {
        status: action === 'approve' ? 'approved' : action === 'hide' ? 'hidden' : 'removed',
        reviewed_by: (await base44.auth.me()).email,
        reviewed_by_name: (await base44.auth.me()).full_name,
        reviewed_at: new Date().toISOString(),
        moderator_notes: notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderationFlags'] });
      setSelectedFlag(null);
      setModeratorNotes('');
      toast.success('Flag reviewed successfully');
    }
  });

  const handleReviewFlag = () => {
    if (!selectedFlag) return;
    reviewFlagMutation.mutate({
      flag_id: selectedFlag.id,
      action: selectedAction,
      notes: moderatorNotes
    });
  };

  const getReasonColor = (reason) => {
    const colors = {
      inappropriate_language: 'bg-red-100 text-red-800',
      spam: 'bg-yellow-100 text-yellow-800',
      harmful_content: 'bg-orange-100 text-orange-800',
      misinformation: 'bg-purple-100 text-purple-800',
      harassment: 'bg-pink-100 text-pink-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[reason] || 'bg-slate-100 text-slate-800';
  };

  const getReasonIcon = (reason) => {
    const icons = {
      inappropriate_language: '⚠️',
      spam: '📧',
      harmful_content: '🚨',
      misinformation: '❌',
      harassment: '😠',
      other: '❓'
    };
    return icons[reason] || '❓';
  };

  const pendingFlags = flags.pending || [];
  const allFlags = flags.recent || [];
  const pendingCount = pendingFlags.length;

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading moderation queue...</div>;
  }

  return (
    <div className="space-y-6 p-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Content Moderation</h1>
        <p className="text-slate-600 mt-2">Review AI-flagged content and take action</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{pendingCount}</p>
              <p className="text-sm text-slate-600">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">
                {allFlags.filter(f => f.status === 'approved').length}
              </p>
              <p className="text-sm text-slate-600">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Trash2 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">
                {allFlags.filter(f => f.status === 'removed').length}
              </p>
              <p className="text-sm text-slate-600">Removed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Pending Review ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="all">All Flags</TabsTrigger>
        </TabsList>

        {/* Pending Flags */}
        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingFlags.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-900">All clear!</p>
                <p className="text-slate-600">No pending flags to review</p>
              </CardContent>
            </Card>
          ) : (
            pendingFlags.map(flag => (
              <Card key={flag.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getReasonColor(flag.flag_reason)}>
                          {getReasonIcon(flag.flag_reason)} {flag.flag_reason.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant="outline">
                          <Zap className="w-3 h-3 mr-1" />
                          {flag.ai_confidence_score}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {flag.content_type} by {flag.author_name || flag.author_email}
                        {flag.space_name && ` in ${flag.space_name}`}
                      </p>
                    </div>
                    <Button
                      onClick={() => setSelectedFlag(flag)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Review
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert className="bg-slate-50 border-slate-200">
                    <AlertDescription className="text-sm font-medium text-slate-700">
                      AI Analysis: {flag.ai_analysis}
                    </AlertDescription>
                  </Alert>
                  <div className="bg-slate-100 rounded-lg p-4">
                    <p className="text-sm text-slate-700 line-clamp-3">{flag.content_text}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* All Flags */}
        <TabsContent value="all" className="space-y-4 mt-6">
          {allFlags.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No flags yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {allFlags.map(flag => (
                <Card key={flag.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getReasonColor(flag.flag_reason)} variant="outline">
                          {flag.flag_reason}
                        </Badge>
                        <Badge variant={
                          flag.status === 'approved' ? 'outline' :
                          flag.status === 'removed' ? 'destructive' : 'default'
                        }>
                          {flag.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        {flag.author_name} • {format(new Date(flag.created_date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    {flag.reviewed_by && (
                      <p className="text-xs text-slate-500">
                        Reviewed by {flag.reviewed_by_name}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedFlag} onOpenChange={(open) => !open && setSelectedFlag(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedFlag && (
            <>
              <DialogHeader>
                <DialogTitle>Review Flagged Content</DialogTitle>
                <DialogDescription>
                  Make a moderation decision based on AI analysis
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Content Preview */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Content</Label>
                  <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-800">{selectedFlag.content_text}</p>
                  </div>
                </div>

                {/* AI Analysis */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">AI Analysis</Label>
                  <Alert className="bg-blue-50 border-blue-200">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <AlertDescription>
                      <p className="font-medium text-blue-900 mb-1">
                        {selectedFlag.flag_reason.replace(/_/g, ' ')} ({selectedFlag.ai_confidence_score}% confidence)
                      </p>
                      <p className="text-sm text-blue-800">{selectedFlag.ai_analysis}</p>
                      <p className="text-xs text-blue-700 mt-2">
                        <strong>Suggested action:</strong> {selectedFlag.ai_suggested_action}
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Action Selection */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Your Decision</Label>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">✓ Approve - Content is fine</SelectItem>
                      <SelectItem value="hide">👁️ Hide - Remove from public view</SelectItem>
                      <SelectItem value="remove">🗑️ Remove - Delete content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Moderator Notes */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Notes (optional)</Label>
                  <Textarea
                    placeholder="Add notes about your decision..."
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFlag(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReviewFlag}
                    disabled={reviewFlagMutation.isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {reviewFlagMutation.isPending ? 'Saving...' : 'Submit Review'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}