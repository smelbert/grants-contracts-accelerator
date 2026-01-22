import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, FileText, Edit, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import ContentGenerator from '@/components/boilerplate/ContentGenerator';
import AIGuardrailsNotice from '@/components/boilerplate/AIGuardrailsNotice';

const CONTENT_TYPE_LABELS = {
  mission_statement: 'Mission Statement',
  org_background: 'Organizational Background',
  program_description: 'Program Description',
  statement_of_need: 'Statement of Need',
  equity_narrative: 'Equity & Impact Narrative',
  capability_statement: 'Capability Statement',
  community_impact: 'Community Impact',
};

export default function BoilerplateBuilderPage() {
  const [activeTab, setActiveTab] = useState('generate');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: savedContent, isLoading: contentLoading } = useQuery({
    queryKey: ['boilerplate', user?.email],
    queryFn: () => base44.entities.BoilerplateContent.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.BoilerplateContent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['boilerplate']);
      setActiveTab('saved');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BoilerplateContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['boilerplate']);
    },
  });

  const organization = organizations?.[0];

  const handleSave = async (data) => {
    await saveMutation.mutateAsync(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-violet-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              AI Boilerplate Builder
            </h1>
          </div>
          <p className="text-slate-500">
            Generate ethical, accurate content for your proposals and applications
          </p>
        </motion.div>

        {/* AI Guardrails Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <AIGuardrailsNotice mode="ethical" />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border border-slate-200 p-1 mb-6">
              <TabsTrigger value="generate" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="saved" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                Saved Content ({savedContent?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Generate New Content</CardTitle>
                </CardHeader>
                <CardContent>
                  {!organization ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500">Complete onboarding first to use the AI builder.</p>
                    </div>
                  ) : (
                    <ContentGenerator 
                      organization={organization} 
                      onSave={handleSave}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saved">
              {contentLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                </div>
              ) : savedContent?.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No saved content yet.</p>
                  <p className="text-sm text-slate-400 mt-1">Generate content to build your library.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedContent.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">
                                {CONTENT_TYPE_LABELS[content.content_type] || content.content_type}
                              </CardTitle>
                              {content.is_approved && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(content.id)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-4">
                            {content.content}
                          </p>
                          {content.ai_warnings?.length > 0 && (
                            <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                              <p className="text-xs text-amber-700">
                                <AlertTriangle className="w-3 h-3 inline mr-1" />
                                {content.ai_warnings[0]}
                              </p>
                            </div>
                          )}
                          <div className="mt-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(content.content)}
                            >
                              Copy
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}