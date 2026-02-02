import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, Plus, Loader2, Edit, Trash2, Eye, Upload, 
  CheckCircle2, Clock, AlertCircle, Download
} from 'lucide-react';
import { format } from 'date-fns';
import DocumentViewer from '@/components/documents/DocumentViewer';
import ReviewPaymentFlow from '@/components/payments/ReviewPaymentFlow';

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: Edit, color: 'slate' },
  submitted_for_review: { label: 'Submitted', icon: Clock, color: 'amber' },
  in_review: { label: 'In Review', icon: Clock, color: 'blue' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'emerald' },
  needs_revision: { label: 'Needs Revision', icon: AlertCircle, color: 'red' }
};

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [isCreateFlowOpen, setIsCreateFlowOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', user?.email],
    queryFn: () => base44.entities.Document.filter({ created_by: user?.email }, '-created_date'),
    enabled: !!user?.email,
  });



  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
    },
  });

  const requestReviewMutation = useMutation({
    mutationFn: async (docId) => {
      await base44.entities.Document.update(docId, { 
        status: 'submitted_for_review',
        shared_for_review: true 
      });
      return base44.entities.ReviewRequest.create({
        document_id: docId,
        request_type: 'document_review',
        requested_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
    },
  });



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Document Library
                </h1>
                <p className="text-slate-500">Manage proposals, narratives, and supporting documents</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsCreateFlowOpen(true)}
              className="bg-[#143A50] hover:bg-[#1E4F58]"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
          </div>
        </motion.div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : documents?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No documents yet. Create your first document to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, index) => {
              const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.draft;
              const StatusIcon = statusConfig.icon;
              
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <FileText className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base line-clamp-2">{doc.doc_name}</CardTitle>
                          <p className="text-xs text-slate-500 mt-1 capitalize">{doc.doc_type}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`bg-${statusConfig.color}-50 text-${statusConfig.color}-700 border-${statusConfig.color}-200`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        {doc.ai_assisted && (
                          <Badge variant="outline" className="text-xs">AI-Assisted</Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-500">
                        Updated {format(new Date(doc.updated_date), 'MMM d, yyyy')}
                      </p>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedDoc(doc)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        {doc.status === 'draft' && (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedDoc(doc);
                              setShowPaymentFlow(true);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            Request Review
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-2 border-t">
                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(doc.id)}>
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Document Viewer Modal */}
        {selectedDoc && !showPaymentFlow && (
          <DocumentViewer
            document={selectedDoc}
            userRole={user?.role}
            onClose={() => setSelectedDoc(null)}
            onRequestReview={() => {
              setShowPaymentFlow(true);
            }}
          />
        )}

        {/* Review Payment Flow */}
        <Dialog open={showPaymentFlow} onOpenChange={setShowPaymentFlow}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Request Document Review</DialogTitle>
            </DialogHeader>
            <ReviewPaymentFlow
              documentId={selectedDoc?.id}
              reviewType="single_document"
              onPaymentComplete={() => {
                requestReviewMutation.mutate(selectedDoc.id);
                setShowPaymentFlow(false);
                setSelectedDoc(null);
              }}
              onCancel={() => setShowPaymentFlow(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Create Document Flow */}
        <CreateDocumentFlow 
          open={isCreateFlowOpen}
          onClose={() => setIsCreateFlowOpen(false)}
        />
      </div>
    </div>
  );
}