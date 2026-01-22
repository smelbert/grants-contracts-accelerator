import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, Download, Eye, Loader2, AlertTriangle, 
  CheckCircle2, Sparkles, BookOpen
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const LANE_LABELS = {
  grants: 'Grants',
  contracts: 'Contracts & RFPs',
  donors: 'Donors & Philanthropy',
  public_funds: 'Public Funding',
  general: 'General'
};

const PURPOSE_LABELS = {
  organizational_narrative: 'Organizational Narrative',
  statement_of_need: 'Statement of Need',
  program_description: 'Program Description',
  budget: 'Budget & Budget Narrative',
  evaluation_outcomes: 'Evaluation & Outcomes',
  capability_statement: 'Capability Statement',
  pitch_deck: 'Pitch Deck / One-Pager',
  letters_support: 'Letters of Support & MOUs'
};

const MATURITY_LABELS = {
  seed: 'Seed (Idea / Startup)',
  growth: 'Growth (Operating)',
  scale: 'Scale (Multi-year)'
};

export default function TemplatesPage() {
  const [selectedLane, setSelectedLane] = useState('grants');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates', selectedLane],
    queryFn: () => base44.entities.Template.filter({ 
      funding_lane: selectedLane,
      is_active: true 
    }),
  });

  const organization = organizations?.[0];
  const userStage = organization?.stage;

  // Filter templates by user's maturity level
  const filteredTemplates = templates?.filter(template => {
    const stageMap = { idea: 'seed', early: 'seed', operating: 'growth', scaling: 'scale' };
    const userMaturity = stageMap[userStage] || 'seed';
    return template.maturity_level === userMaturity || template.maturity_level === 'general';
  });

  const handleView = (template) => {
    setSelectedTemplate(template);
    setViewDialogOpen(true);
  };

  const handleDownload = (template) => {
    const blob = new Blob([template.template_content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.template_name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Template Library
              </h1>
              <p className="text-slate-500">Stage-based, funding-lane-specific templates that teach—not trap</p>
            </div>
          </div>
        </motion.div>

        {/* Quality Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Alert className="bg-indigo-50 border-indigo-200">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <AlertDescription className="text-indigo-700">
              <strong>This is not trash.</strong> Every template includes when to use it, when not to use it, 
              what funders look for, and common mistakes to avoid. These are teaching tools, not fill-in-the-blank traps.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* User Stage Badge */}
        {userStage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Your Stage: {MATURITY_LABELS[userStage === 'idea' || userStage === 'early' ? 'seed' : userStage === 'operating' ? 'growth' : 'scale']}
            </Badge>
            <p className="text-xs text-slate-500 mt-2">
              Templates are filtered to match your organization's maturity level
            </p>
          </motion.div>
        )}

        {/* Funding Lane Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={selectedLane} onValueChange={setSelectedLane}>
            <TabsList className="bg-white border border-slate-200 p-1 mb-6 flex-wrap h-auto">
              {Object.entries(LANE_LABELS).map(([key, label]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : filteredTemplates?.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No templates available for this lane yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates?.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-base mb-2">{template.template_name}</CardTitle>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                {PURPOSE_LABELS[template.purpose]}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {template.maturity_level}
                              </Badge>
                            </div>
                          </div>
                          <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-xs text-slate-600 space-y-1">
                          <p><strong>When to use:</strong> {template.when_to_use?.substring(0, 100)}...</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleView(template)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => handleDownload(template)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </Tabs>
        </motion.div>
      </div>

      {/* Template View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.template_name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Badge>{LANE_LABELS[selectedTemplate.funding_lane]}</Badge>
                <Badge variant="outline">{PURPOSE_LABELS[selectedTemplate.purpose]}</Badge>
                <Badge variant="outline" className="capitalize">{selectedTemplate.maturity_level}</Badge>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">✓ When to Use This</p>
                  <p className="text-sm text-emerald-800">{selectedTemplate.when_to_use}</p>
                </div>

                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs font-semibold text-red-900 mb-1">✗ When NOT to Use This</p>
                  <p className="text-sm text-red-800">{selectedTemplate.when_not_to_use}</p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-1">👁 What Funders Look For Here</p>
                  <p className="text-sm text-blue-800">{selectedTemplate.what_funders_look_for}</p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs font-semibold text-amber-900 mb-1">⚠ Common Mistakes That Get This Rejected</p>
                  <p className="text-sm text-amber-800">{selectedTemplate.common_mistakes}</p>
                </div>

                {selectedTemplate.ai_assist_notes && (
                  <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
                    <p className="text-xs font-semibold text-violet-900 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Assist Notes
                    </p>
                    <p className="text-sm text-violet-800">{selectedTemplate.ai_assist_notes}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs font-semibold text-slate-700 mb-2">Template Content:</p>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                    {selectedTemplate.template_content}
                  </pre>
                </div>
              </div>

              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => handleDownload(selectedTemplate)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}