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
import BrandedTemplateWrapper from '@/components/templates/BrandedTemplateWrapper';

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates?.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-slate-100 hover:border-indigo-200 overflow-hidden group">
                      <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                      <CardHeader className="pb-3 bg-gradient-to-br from-slate-50 to-white">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1">
                            <CardTitle className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2">
                              {template.template_name}
                            </CardTitle>
                          </div>
                          <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                            <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs">
                            {PURPOSE_LABELS[template.purpose] || template.purpose}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize bg-white">
                            {template.maturity_level}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="min-h-[80px]">
                          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                            <p className="text-xs font-semibold text-emerald-900 mb-1 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              When to use
                            </p>
                            <p className="text-xs text-emerald-800 line-clamp-3">{template.when_to_use || 'Guide included in template'}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 group-hover:border-indigo-300 transition-colors"
                            onClick={() => handleView(template)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => handleDownload(template)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Use
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
        <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col gap-0">
          <DialogHeader className="border-b pb-4 px-6 pt-6 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl text-indigo-900 mb-2">{selectedTemplate?.template_name}</DialogTitle>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-indigo-600">{LANE_LABELS[selectedTemplate?.funding_lane]}</Badge>
                  <Badge variant="outline">{PURPOSE_LABELS[selectedTemplate?.purpose]}</Badge>
                  <Badge variant="outline" className="capitalize">{selectedTemplate?.maturity_level}</Badge>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-4 py-4 pb-6">
                {/* Educational Guidance Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      <p className="font-bold text-emerald-900">When to Use This</p>
                    </div>
                    <p className="text-sm text-emerald-800 leading-relaxed">{selectedTemplate.when_to_use}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-700" />
                      <p className="font-bold text-red-900">When NOT to Use This</p>
                    </div>
                    <p className="text-sm text-red-800 leading-relaxed">{selectedTemplate.when_not_to_use}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-blue-700" />
                      <p className="font-bold text-blue-900">What Funders Look For</p>
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed">{selectedTemplate.what_funders_look_for}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-700" />
                      <p className="font-bold text-amber-900">Common Mistakes</p>
                    </div>
                    <p className="text-sm text-amber-800 leading-relaxed">{selectedTemplate.common_mistakes}</p>
                  </div>
                </div>

                {selectedTemplate.ai_assist_notes && (
                  <div className="p-4 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl border-2 border-violet-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-violet-700" />
                      <p className="font-bold text-violet-900">AI Assist Notes</p>
                    </div>
                    <p className="text-sm text-violet-800 leading-relaxed">{selectedTemplate.ai_assist_notes}</p>
                  </div>
                )}

                {/* Template Content with Professional Styling */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-900">Template Content</h3>
                    <Button 
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => handleDownload(selectedTemplate)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="rounded-xl border-2 border-slate-200 shadow-lg overflow-visible">
                    <div className="bg-white w-full">
                      {/* Branded Header */}
                      <div 
                        className="px-8 py-6 border-b-4 flex items-center justify-between"
                        style={{ 
                          backgroundColor: '#FFFFFF',
                          borderBottomColor: '#E5C089'
                        }}
                      >
                        <div className="flex items-center gap-6">
                          <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/45aaceb53_EISLogotransparent.png" 
                            alt="Elbert Innovative Solutions" 
                            className="h-16 w-auto"
                          />
                          <div className="border-l-2 pl-6" style={{ borderColor: '#A65D40' }}>
                            <p 
                              className="text-sm font-semibold tracking-wide uppercase"
                              style={{ color: '#143A50' }}
                            >
                              Excellence in Every Endeavor
                            </p>
                            <p 
                              className="text-xs mt-1"
                              style={{ color: '#B5A698' }}
                            >
                              Grant & Contract Accelerator
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p 
                            className="text-xs font-medium"
                            style={{ color: '#1E4F58' }}
                          >
                            Professional Template Library
                          </p>
                        </div>
                      </div>

                      {/* Template Content */}
                      <div className="px-8 py-8">
                        <div 
                          className="prose prose-slate max-w-none"
                          style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            lineHeight: '1.8'
                          }}
                        >
                          <div dangerouslySetInnerHTML={{ __html: selectedTemplate.template_content?.replace(/\n/g, '<br/>') }} />
                        </div>
                      </div>

                      {/* Branded Footer */}
                      <div 
                        className="px-8 py-6 border-t-4 mt-8"
                        style={{ 
                          backgroundColor: '#143A50',
                          borderTopColor: '#E5C089'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm font-semibold mb-1">
                              Elbert Innovative Solutions
                            </p>
                            <p 
                              className="text-xs"
                              style={{ color: '#E5C089' }}
                            >
                              Empowering organizations to secure funding and achieve their missions
                            </p>
                          </div>
                          <div className="text-right">
                            <p 
                              className="text-xs"
                              style={{ color: '#B5A698' }}
                            >
                              www.elbertinnovative.com
                            </p>
                            <p 
                              className="text-xs mt-1"
                              style={{ color: '#B5A698' }}
                            >
                              © {new Date().getFullYear()} All Rights Reserved
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}