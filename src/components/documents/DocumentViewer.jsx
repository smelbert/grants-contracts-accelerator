import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  X, MessageSquare, Video, History, Eye, Lock, 
  Save, Send, AlertTriangle, Sparkles, Shield, CheckCircle2, ArrowLeftRight
} from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AIGuardrailsNotice from '@/components/boilerplate/AIGuardrailsNotice';
import VideoFeedback from '@/components/documents/VideoFeedback';
import DocumentComparison from '@/components/documents/DocumentComparison';
import AIDocumentAssistant from '@/components/documents/AIDocumentAssistant';
import AIDocumentAnalyzer from '@/components/documents/AIDocumentAnalyzer';
import CollaborativeComments from '@/components/collaboration/CollaborativeComments';

export default function DocumentViewer({ 
  document, 
  onClose, 
  userRole = 'user',
  onRequestReview 
}) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [editedContent, setEditedContent] = useState(document?.content || '');
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonVersions, setComparisonVersions] = useState([null, null]);
  const [videoFeedbackUrl, setVideoFeedbackUrl] = useState(document?.review_video_url || null);

  const isCoach = userRole === 'coach' || userRole === 'owner' || userRole === 'admin';
  const canEdit = document?.status === 'draft' || document?.status === 'needs_revision';
  const aiAssisted = document?.ai_assisted;
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveTimerRef = React.useRef(null);

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: ['documentComments', document?.id],
    queryFn: () => base44.entities.DocumentComment.filter({ document_id: document?.id }, '-created_date'),
    enabled: !!document?.id,
  });

  // Fetch versions
  const { data: versions = [] } = useQuery({
    queryKey: ['documentVersions', document?.id],
    queryFn: () => base44.entities.DocumentVersion.filter({ document_id: document?.id }, '-version_number'),
    enabled: !!document?.id,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (commentData) => base44.entities.DocumentComment.create(commentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['documentComments', document?.id]);
      setNewComment('');
    },
  });

  // Save document mutation
  const saveDocumentMutation = useMutation({
    mutationFn: async ({ content }) => {
      // Create a new version
      const newVersionNumber = Math.max(...versions.map(v => v.version_number || 0), 0) + 1;
      await base44.entities.DocumentVersion.create({
        document_id: document.id,
        version_number: newVersionNumber,
        content: content,
        change_summary: 'Manual edit',
      });
      // Update the document
      return base44.entities.Document.update(document.id, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      queryClient.invalidateQueries(['documentVersions', document?.id]);
    },
  });

  // Update document status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ status, comment }) => {
      const promises = [
        base44.entities.Document.update(document.id, { status })
      ];
      if (comment) {
        promises.push(
          base44.entities.DocumentComment.create({
            document_id: document.id,
            comment_text: comment,
            author_role: userRole,
            comment_type: 'feedback'
          })
        );
      }
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      queryClient.invalidateQueries(['documentComments', document?.id]);
    },
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate({
        document_id: document.id,
        comment_text: newComment,
        author_name: user?.full_name || user?.email,
        author_role: userRole,
        comment_type: 'comment'
      });
    }
  };

  const handleSave = () => {
    saveDocumentMutation.mutate({ content: editedContent });
  };

  const handleApprove = () => {
    updateStatusMutation.mutate({ 
      status: 'approved',
      comment: 'Document approved by coach'
    });
  };

  const handleRequestRevisions = () => {
    const feedback = prompt('Please provide revision feedback:');
    if (feedback) {
      updateStatusMutation.mutate({ 
        status: 'needs_revision',
        comment: feedback
      });
    }
  };

  const handleVideoUploaded = async (url) => {
    setVideoFeedbackUrl(url);
    if (url) {
      await base44.entities.Document.update(document.id, { review_video_url: url });
    }
  };

  const handleCompareVersions = () => {
    if (versions.length >= 2) {
      setComparisonVersions([versions[versions.length - 2], versions[versions.length - 1]]);
      setShowComparison(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-slate-900 truncate">
                {document?.doc_name}
              </h2>
              {aiAssisted && (
                <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Assisted
                </Badge>
              )}
              <Badge variant="outline" className="capitalize">
                {document?.status?.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              Last updated {document?.updated_date && format(new Date(document.updated_date), 'MMM d, yyyy')}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* AI Guardrail Alert */}
        {aiAssisted && (
          <div className="px-6 pt-4">
            <AIGuardrailsNotice mode="review" />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-slate-200 h-full">
            {/* Document Content */}
            <div className="lg:col-span-2 p-6">
              {/* AI Assistant */}
              {canEdit && (
                <div className="mb-6">
                  <AIDocumentAssistant
                    document={document}
                    onApplySuggestion={(improvedContent) => setEditedContent(improvedContent)}
                  />
                </div>
              )}

              {/* AI Document Analyzer */}
              <div className="mb-6">
                <AIDocumentAnalyzer
                  document={document}
                  onTemplateSuggested={(category) => {
                    // Navigate to templates filtered by category
                    window.open(`${window.location.origin}${createPageUrl('Templates')}?category=${category}`, '_blank');
                  }}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Document Content</h3>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    v{versions.length > 0 ? Math.max(...versions.map(v => v.version_number || 1)) : 1}
                  </Badge>
                  {versions.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCompareVersions}
                    >
                      <ArrowLeftRight className="w-4 h-4 mr-2" />
                      Compare
                    </Button>
                  )}
                </div>
                </div>

                {canEdit ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                    placeholder="Document content..."
                  />
                ) : (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                      {document?.content || 'No content available.'}
                    </p>
                  </div>
                )}

                {canEdit && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSave}
                      disabled={saveDocumentMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saveDocumentMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    {document?.status === 'draft' && (
                      <Button variant="outline" onClick={onRequestReview}>
                        <Send className="w-4 h-4 mr-2" />
                        Request Review
                      </Button>
                    )}
                  </div>
                )}

                {!canEdit && document?.status === 'in_review' && (
                  <Alert>
                    <Eye className="w-4 h-4" />
                    <AlertDescription className="text-sm">
                      This document is currently under review. Changes are locked until the review is complete.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Comments & Feedback Sidebar */}
            <div className="p-6 bg-slate-50 flex flex-col">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments & Feedback
              </h3>

              {/* Video Feedback */}
              {isCoach && (
                <div className="mb-4">
                  <VideoFeedback
                    documentId={document?.id}
                    existingVideoUrl={videoFeedbackUrl}
                    onVideoUploaded={handleVideoUploaded}
                  />
                </div>
              )}

              {/* Comments List */}
              <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No comments yet. Add feedback or notes.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className={`p-3 rounded-lg border ${
                        comment.comment_type === 'feedback' 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {comment.author_role}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                        </span>
                        {comment.comment_type === 'feedback' && (
                          <Badge variant="outline" className="text-xs bg-blue-100">
                            Coach Feedback
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-600 mb-1">{comment.author_name}</p>
                      <p className="text-sm text-slate-700">{comment.comment_text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Collaborative Comments */}
              <div className="pt-4 border-t border-slate-200">
                <CollaborativeComments documentId={document?.id} />
              </div>

              {/* Coach Review Actions */}
              {isCoach && (document?.status === 'submitted_for_review' || document?.status === 'in_review') && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                  <Button 
                    onClick={handleApprove}
                    disabled={updateStatusMutation.isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Document
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleRequestRevisions}
                    disabled={updateStatusMutation.isPending}
                    className="w-full"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Request Revisions
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Document Comparison Modal */}
      {showComparison && comparisonVersions[0] && comparisonVersions[1] && (
        <DocumentComparison
          version1={comparisonVersions[0]}
          version2={comparisonVersions[1]}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}