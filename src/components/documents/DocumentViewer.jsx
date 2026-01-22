import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  X, MessageSquare, Video, History, Eye, Lock, 
  Save, Send, AlertTriangle, Sparkles, Shield
} from 'lucide-react';
import { format } from 'date-fns';

export default function DocumentViewer({ 
  document, 
  onClose, 
  userRole = 'user',
  onSaveComment,
  onRequestReview 
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editedContent, setEditedContent] = useState(document?.content || '');

  const isCoach = userRole === 'coach' || userRole === 'owner' || userRole === 'admin';
  const canEdit = document?.status === 'draft' || document?.status === 'needs_revision';
  const aiAssisted = document?.ai_assisted;

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        author: userRole,
        timestamp: new Date().toISOString(),
        type: 'comment'
      };
      setComments([...comments, comment]);
      onSaveComment?.(comment);
      setNewComment('');
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
            <Alert className="bg-violet-50 border-violet-200">
              <Shield className="w-4 h-4 text-violet-600" />
              <AlertDescription className="text-sm text-violet-700">
                <strong>AI-Generated Content:</strong> This content was created using AI based on your 
                organizational data. Review carefully and verify all claims before submission.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-slate-200 h-full">
            {/* Document Content */}
            <div className="lg:col-span-2 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Document Content</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <History className="w-4 h-4 mr-2" />
                      Versions
                    </Button>
                    {isCoach && (
                      <Button variant="outline" size="sm">
                        <Video className="w-4 h-4 mr-2" />
                        Video Feedback
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
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
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

              {/* Comments List */}
              <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No comments yet. Add feedback or notes.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {comment.author}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment */}
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isCoach ? "Add feedback for the organization..." : "Add notes or questions..."}
                  className="min-h-[80px]"
                />
                <Button 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim()}
                  size="sm"
                  className="w-full"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add {isCoach ? 'Feedback' : 'Comment'}
                </Button>
              </div>

              {/* Coach Review Actions */}
              {isCoach && document?.status === 'submitted_for_review' && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Approve Document
                  </Button>
                  <Button variant="outline" className="w-full">
                    Request Revisions
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}