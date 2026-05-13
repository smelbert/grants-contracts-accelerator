import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  X, MessageSquare, Lightbulb, CheckCircle2, XCircle, RotateCcw,
  Send, History, ChevronRight, AlertTriangle, UserCheck, Check, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import InlineCommentHighlighter from './InlineCommentHighlighter';
import VersionHistoryPanel from './VersionHistoryPanel';
import DocumentComparison from './DocumentComparison';

const COMMENT_TYPE_META = {
  general:           { label: 'Comment',          color: 'bg-blue-100 text-blue-700',   icon: MessageSquare },
  highlight:         { label: 'Comment',          color: 'bg-blue-100 text-blue-700',   icon: MessageSquare },
  suggestion:        { label: 'Suggestion',       color: 'bg-amber-100 text-amber-700', icon: Lightbulb },
  feedback:          { label: 'Coach Feedback',   color: 'bg-purple-100 text-purple-700', icon: MessageSquare },
  approval:          { label: 'Approved',         color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  revision_request:  { label: 'Needs Revision',   color: 'bg-red-100 text-red-700',     icon: AlertTriangle },
};

function CommentCard({ comment, canReview, documentContent, onAcceptSuggestion, onRejectSuggestion, onResolve }) {
  const [showReply, setShowReply] = useState(false);
  const meta = COMMENT_TYPE_META[comment.comment_type] || COMMENT_TYPE_META.general;
  const Icon = meta.icon;

  return (
    <div className={cn('border rounded-xl overflow-hidden', comment.is_resolved && 'opacity-60')}>
      <div className="px-4 py-3 bg-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${meta.color} text-xs gap-1`}>
              <Icon className="w-3 h-3" />
              {meta.label}
            </Badge>
            {comment.is_resolved && <Badge className="bg-emerald-100 text-emerald-700 text-xs">Resolved</Badge>}
            {comment.suggestion_status && comment.suggestion_status !== 'pending' && (
              <Badge className={cn('text-xs', comment.suggestion_status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                {comment.suggestion_status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
              </Badge>
            )}
          </div>
          {!comment.is_resolved && canReview && (
            <button className="text-xs text-slate-400 hover:text-slate-700" onClick={() => onResolve(comment.id)}>
              Resolve
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="w-6 h-6 rounded-full bg-[#143A50] text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
            {(comment.commenter_name?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <span className="text-xs font-medium text-slate-800">{comment.commenter_name || 'Reviewer'}</span>
            <span className="text-xs text-slate-400 ml-2">{comment.created_date && format(new Date(comment.created_date), 'MMM d, h:mm a')}</span>
          </div>
        </div>

        {/* Highlighted passage */}
        {comment.highlighted_text && (
          <blockquote className="mt-2 border-l-2 border-amber-400 pl-3 text-xs text-slate-600 italic bg-amber-50 py-1 rounded-r">
            "{comment.highlighted_text.slice(0, 120)}{comment.highlighted_text.length > 120 ? '...' : ''}"
          </blockquote>
        )}

        <p className="text-sm text-slate-700 mt-2">{comment.comment_text}</p>

        {/* Suggestion */}
        {comment.comment_type === 'suggestion' && comment.suggested_replacement && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-semibold text-amber-700">Suggested replacement:</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs font-mono text-slate-800 whitespace-pre-wrap">
              {comment.suggested_replacement}
            </div>
            {comment.suggestion_status === 'pending' && (
              <div className="flex gap-2 mt-2">
                {canReview && (
                  <>
                    <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1" onClick={() => onAcceptSuggestion(comment)}>
                      <Check className="w-3 h-3" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => onRejectSuggestion(comment.id)}>
                      <XCircle className="w-3 h-3" /> Reject
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollaborativeDocumentReview({ document, reviewRequest, onClose, userRole, currentUserEmail }) {
  const queryClient = useQueryClient();
  const [summaryFeedback, setSummaryFeedback] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [compareVersions, setCompareVersions] = useState([null, null]);
  const [editedContent, setEditedContent] = useState(document?.content || '');
  const [filterType, setFilterType] = useState('all');

  const isReviewer = currentUserEmail === reviewRequest?.reviewer_email || userRole === 'coach' || userRole === 'admin';
  const isOwner = currentUserEmail === reviewRequest?.requester_email;

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['docComments-collab', document?.id, reviewRequest?.id],
    queryFn: () => base44.entities.DocumentComment.filter({ document_id: document.id }, '-created_date'),
    enabled: !!document?.id,
    refetchInterval: 15000, // live-ish polling
  });

  const { data: versions = [] } = useQuery({
    queryKey: ['documentVersions', document?.id],
    queryFn: () => base44.entities.DocumentVersion.filter({ document_id: document.id }, '-version_number'),
    enabled: !!document?.id,
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Add inline comment (from highlight selection)
  const addCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.DocumentComment.create({
      ...data,
      document_id: document.id,
      commenter_email: user?.email,
      commenter_name: user?.full_name || user?.email,
      commenter_role: userRole,
      review_request_id: reviewRequest?.id,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['docComments-collab', document?.id]);
      toast.success(filterType === 'suggestion' ? 'Suggestion added' : 'Comment added');
    },
  });

  // Resolve comment
  const resolveMutation = useMutation({
    mutationFn: (commentId) => base44.entities.DocumentComment.update(commentId, { is_resolved: true }),
    onSuccess: () => queryClient.invalidateQueries(['docComments-collab', document?.id]),
  });

  // Accept suggestion — apply replacement text to document and save a new version
  const acceptSuggestionMutation = useMutation({
    mutationFn: async (comment) => {
      const newContent = editedContent.replace(comment.highlighted_text, comment.suggested_replacement);
      const newVersionNumber = Math.max(...versions.map(v => v.version_number || 0), 0) + 1;
      await Promise.all([
        base44.entities.DocumentComment.update(comment.id, { suggestion_status: 'accepted', is_resolved: true }),
        base44.entities.Document.update(document.id, { content: newContent }),
        base44.entities.DocumentVersion.create({
          document_id: document.id,
          version_number: newVersionNumber,
          content: newContent,
          change_summary: `Accepted suggestion from ${comment.commenter_name}`,
          saved_by_email: user?.email,
          saved_by_name: user?.full_name,
          version_type: 'suggestion_accepted',
          review_request_id: reviewRequest?.id,
        }),
      ]);
      setEditedContent(newContent);
      return newContent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['docComments-collab', document?.id]);
      queryClient.invalidateQueries(['documentVersions', document?.id]);
      queryClient.invalidateQueries(['documents']);
      toast.success('Suggestion accepted and applied!');
    },
  });

  const rejectSuggestionMutation = useMutation({
    mutationFn: (commentId) => base44.entities.DocumentComment.update(commentId, { suggestion_status: 'rejected' }),
    onSuccess: () => queryClient.invalidateQueries(['docComments-collab', document?.id]),
  });

  // Submit overall feedback / mark review complete
  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      const promises = [
        base44.entities.DocumentReviewRequest.update(reviewRequest.id, {
          status: 'feedback_given',
          feedback_summary: summaryFeedback,
          reviewed_at: new Date().toISOString(),
          comment_count: comments.filter(c => c.comment_type !== 'suggestion').length,
          suggestion_count: comments.filter(c => c.comment_type === 'suggestion').length,
        }),
        base44.entities.Document.update(document.id, { status: 'needs_revision', review_summary: summaryFeedback }),
      ];
      if (summaryFeedback.trim()) {
        promises.push(base44.entities.DocumentComment.create({
          document_id: document.id,
          comment_text: summaryFeedback,
          commenter_email: user?.email,
          commenter_name: user?.full_name,
          commenter_role: userRole,
          comment_type: 'feedback',
          review_request_id: reviewRequest?.id,
        }));
      }
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      queryClient.invalidateQueries(['review-requests', document?.id]);
      toast.success('Feedback submitted to the document owner');
      onClose?.();
    },
  });

  // Restore a previous version
  const restoreVersionMutation = useMutation({
    mutationFn: async (version) => {
      const newVersionNumber = Math.max(...versions.map(v => v.version_number || 0), 0) + 1;
      await Promise.all([
        base44.entities.Document.update(document.id, { content: version.content }),
        base44.entities.DocumentVersion.create({
          document_id: document.id,
          version_number: newVersionNumber,
          content: version.content,
          change_summary: `Restored from v${version.version_number}`,
          saved_by_email: user?.email,
          saved_by_name: user?.full_name,
          version_type: 'manual_save',
        }),
      ]);
      setEditedContent(version.content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documentVersions', document?.id]);
      queryClient.invalidateQueries(['documents']);
      toast.success('Version restored');
    },
  });

  const activeComments = comments.filter(c => !c.is_resolved);
  const filteredComments = filterType === 'all'
    ? comments
    : filterType === 'suggestions'
    ? comments.filter(c => c.comment_type === 'suggestion')
    : comments.filter(c => c.comment_type !== 'suggestion');

  const pendingSuggestions = comments.filter(c => c.comment_type === 'suggestion' && c.suggestion_status === 'pending');

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[96vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#143A50]/10 rounded-lg">
              <UserCheck className="w-5 h-5 text-[#143A50]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 truncate max-w-md">{document?.doc_name}</h2>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                {reviewRequest && (
                  <>
                    <Badge className={cn('text-xs', reviewRequest.status === 'feedback_given' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                      <Clock className="w-3 h-3 mr-1" />
                      {reviewRequest.status === 'feedback_given' ? 'Feedback Given' : reviewRequest.status === 'in_review' ? 'In Review' : 'Pending Review'}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {isReviewer ? `From: ${reviewRequest.requester_name || reviewRequest.requester_email}` : `Reviewer: ${reviewRequest.reviewer_name || reviewRequest.reviewer_email}`}
                    </span>
                  </>
                )}
                <Badge className="bg-slate-100 text-slate-600 text-xs">{activeComments.length} open</Badge>
                {pendingSuggestions.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-700 text-xs">{pendingSuggestions.length} suggestions pending</Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Reviewer context note */}
        {reviewRequest?.request_message && (
          <div className="px-6 py-2.5 bg-blue-50 border-b border-blue-100 text-xs text-blue-800">
            <span className="font-semibold">Note from author:</span> {reviewRequest.request_message}
          </div>
        )}

        {/* Main layout */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

          {/* Document pane */}
          <div className="flex-1 overflow-y-auto p-5 border-r border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 text-sm">Document Content</h3>
              {isReviewer && (
                <span className="text-xs text-slate-400">Select text to highlight or suggest edits</span>
              )}
            </div>
            <InlineCommentHighlighter
              content={editedContent}
              comments={comments}
              canComment={isReviewer}
              onAddComment={(data) => addCommentMutation.mutate(data)}
            />

            {/* Version History */}
            <div className="mt-5">
              <VersionHistoryPanel
                documentId={document?.id}
                currentContent={editedContent}
                onRestoreVersion={(v) => restoreVersionMutation.mutate(v)}
                onCompareVersions={(v1, v2) => {
                  setCompareVersions([v1, v2]);
                  setShowComparison(true);
                }}
              />
            </div>
          </div>

          {/* Comments sidebar */}
          <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-slate-50 overflow-hidden">
            {/* Filter tabs */}
            <div className="flex border-b border-slate-200 bg-white">
              {[['all', 'All'], ['suggestions', 'Suggestions'], ['comments', 'Comments']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={cn('flex-1 py-2.5 text-xs font-medium transition-colors', filterType === key ? 'border-b-2 border-[#143A50] text-[#143A50]' : 'text-slate-500 hover:text-slate-700')}
                >
                  {label}
                  {key === 'suggestions' && pendingSuggestions.length > 0 && (
                    <span className="ml-1 bg-amber-500 text-white rounded-full px-1.5 py-0.5 text-xs">{pendingSuggestions.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredComments.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No {filterType === 'suggestions' ? 'suggestions' : 'comments'} yet</p>
                  {isReviewer && <p className="text-xs mt-1">Select text in the document to add one</p>}
                </div>
              ) : (
                filteredComments.map(comment => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    canReview={isOwner}
                    documentContent={editedContent}
                    onAcceptSuggestion={(c) => acceptSuggestionMutation.mutate(c)}
                    onRejectSuggestion={(id) => rejectSuggestionMutation.mutate(id)}
                    onResolve={(id) => resolveMutation.mutate(id)}
                  />
                ))
              )}
            </div>

            {/* Reviewer: submit overall feedback */}
            {isReviewer && reviewRequest?.status !== 'feedback_given' && (
              <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                <p className="text-sm font-semibold text-slate-700">Overall Feedback Summary</p>
                <Textarea
                  value={summaryFeedback}
                  onChange={e => setSummaryFeedback(e.target.value)}
                  placeholder="Write your overall assessment and key recommendations..."
                  className="text-sm min-h-[80px]"
                />
                <Button
                  className="w-full bg-[#143A50] hover:bg-[#1E4F58] gap-2"
                  disabled={submitFeedbackMutation.isPending}
                  onClick={() => submitFeedbackMutation.mutate()}
                >
                  <Send className="w-4 h-4" />
                  Submit Review
                </Button>
              </div>
            )}

            {/* Review complete notice */}
            {reviewRequest?.status === 'feedback_given' && (
              <div className="p-4 border-t border-slate-200 bg-emerald-50">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <p className="text-sm font-semibold">Review complete</p>
                </div>
                {reviewRequest.reviewed_at && (
                  <p className="text-xs text-emerald-600 mt-1">{format(new Date(reviewRequest.reviewed_at), 'MMM d, yyyy')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Comparison Modal */}
      {showComparison && compareVersions[0] && compareVersions[1] && (
        <DocumentComparison
          version1={compareVersions[0]}
          version2={compareVersions[1]}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}