import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, FileText, Clock, TrendingUp, Award, History, Search } from 'lucide-react';
import AIDocumentCoach from '@/components/ai/AIDocumentCoach';
import GrantFitEvaluator from '@/components/ai/GrantFitEvaluator';
import { motion } from 'framer-motion';

export default function AIDocumentReview() {
  const [showCoach, setShowCoach] = useState(false);
  const [showGrantEval, setShowGrantEval] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: orgProfile } = useQuery({
    queryKey: ['org-profile', user?.email],
    queryFn: async () => {
      const orgs = await base44.entities.Organization.filter({ primary_contact_email: user.email });
      return orgs[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: recentDocuments } = useQuery({
    queryKey: ['recent-documents', user?.email],
    queryFn: async () => {
      const docs = await base44.entities.Document.filter({
        created_by: user.email
      });
      return docs.slice(0, 5);
    },
    enabled: !!user?.email,
  });

  const { data: reviewHistory } = useQuery({
    queryKey: ['review-history', user?.email],
    queryFn: async () => {
      const activities = await base44.entities.UserActivity.filter({
        user_email: user.email,
        activity_type: 'ai_document_review'
      });
      return activities.slice(0, 10);
    },
    enabled: !!user?.email,
  });

  if (showCoach) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" onClick={() => setShowCoach(false)} className="mb-4">
            ← Back to Document Review
          </Button>
          <AIDocumentCoach documentId={selectedDocument?.id} existingText={selectedDocument?.content} onClose={() => setShowCoach(false)} />
        </div>
      </div>
    );
  }

  if (showGrantEval) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-4xl mx-auto">
          <GrantFitEvaluator userOrgProfile={orgProfile} onBack={() => setShowGrantEval(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#143A50] to-[#1E4F58] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-[#E5C089]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#143A50]">AI Document Review</h1>
              <p className="text-slate-600">
                Get instant, expert-level feedback on your grant proposals and documents
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="mb-8 border-2 border-[#E5C089] bg-gradient-to-br from-[#E5C089]/10 to-white">
          <CardHeader>
            <CardTitle className="text-2xl">Start Your Review</CardTitle>
            <CardDescription>
              Our AI coach analyzes your document for clarity, completeness, tone, and funder alignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button onClick={() => { setSelectedDocument(null); setShowCoach(true); }} className="h-20 bg-[#143A50] hover:bg-[#1E4F58] text-base flex-col gap-1">
                <FileText className="w-6 h-6" />
                Review New Document
              </Button>
              <Button onClick={() => setShowCoach(true)} variant="outline" className="h-20 text-base border-2 flex-col gap-1">
                <History className="w-6 h-6" />
                Review Existing Document
              </Button>
              <Button onClick={() => setShowGrantEval(true)} className="h-20 bg-[#AC1A5B] hover:bg-[#8e1549] text-base flex-col gap-1">
                <Search className="w-6 h-6" />
                Should I Apply? (Grant Fit)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features & Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Comprehensive Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Get detailed scores on clarity, completeness, tone, and alignment with funder priorities
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Actionable Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Receive specific suggestions for improvement with prioritized action items
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Personalized Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Feedback tailored to your organization's profile, funding lane, and readiness level
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Reviews */}
        {reviewHistory && reviewHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reviewHistory.map((review, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {review.description || 'Document Review'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(review.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {review.metadata?.overall_score && (
                      <Badge className="bg-[#143A50]">
                        Score: {review.metadata.overall_score}/100
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#143A50] text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Submit Document</h3>
                <p className="text-sm text-slate-600">
                  Paste your grant proposal or upload a document
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#143A50] text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">AI Analysis</h3>
                <p className="text-sm text-slate-600">
                  Our AI reviews for clarity, completeness, and alignment
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#143A50] text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Get Feedback</h3>
                <p className="text-sm text-slate-600">
                  Receive detailed scores and improvement suggestions
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#143A50] text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  4
                </div>
                <h3 className="font-semibold mb-2">Improve & Submit</h3>
                <p className="text-sm text-slate-600">
                  Apply recommendations and submit with confidence
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}