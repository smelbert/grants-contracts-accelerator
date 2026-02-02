import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Sparkles, Upload, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function CreateDocumentFlow({ open, onClose }) {
  const [step, setStep] = useState('choice'); // choice, template, ai_draft, upload
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [docName, setDocName] = useState('');
  const [aiResponses, setAiResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.Template.filter({ is_active: true }),
    enabled: step === 'template',
  });

  const createDocMutation = useMutation({
    mutationFn: (data) => base44.entities.Document.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      toast.success('Document created successfully!');
      handleReset();
      onClose();
    },
  });

  const handleReset = () => {
    setStep('choice');
    setSelectedTemplate(null);
    setDocName('');
    setAiResponses({});
    setCurrentQuestionIndex(0);
    setAiQuestions([]);
    setUploadedFile(null);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setDocName(template.template_name);
    setStep('finalize_template');
  };

  const handleAIDraft = async () => {
    setIsProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 essential questions to help draft a professional funding document. Questions should gather key information about the organization, project, and funding needs. Keep questions clear and concise.

Format as JSON:
{
  "questions": ["question 1", "question 2", "question 3", "question 4", "question 5"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAiQuestions(result.questions || []);
      setStep('ai_questions');
    } catch (error) {
      toast.error('Failed to generate questions');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIQuestionAnswer = () => {
    if (currentQuestionIndex < aiQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      generateAIDocument();
    }
  };

  const generateAIDocument = async () => {
    setIsProcessing(true);
    try {
      const contextText = Object.entries(aiResponses).map(([q, a]) => `${q}: ${a}`).join('\n\n');
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on the following information, create a professional funding document with clear sections. Format with proper headings and paragraphs.

${contextText}

Create a well-structured document that includes: Executive Summary, Organizational Background, Project Description, Budget Overview, and Expected Outcomes.`
      });

      createDocMutation.mutate({
        doc_name: docName || 'AI-Generated Document',
        doc_type: 'proposal',
        content: result,
        ai_assisted: true
      });
    } catch (error) {
      toast.error('Failed to generate document');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile(file_url);
      
      // Extract content from uploaded file
      const response = await fetch(file_url);
      const text = await response.text();
      
      setStep('ai_refine');
      setUploadedFile({ url: file_url, content: text, name: file.name });
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIRefine = async () => {
    setIsProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Review and refine this funding document. Improve clarity, structure, and professionalism. Ensure all sections are well-organized and compelling. Maintain the original content while enhancing it.

Document Content:
${uploadedFile.content}

Provide the refined version with improved formatting and language.`
      });

      createDocMutation.mutate({
        doc_name: docName || uploadedFile.name,
        doc_type: 'proposal',
        content: result,
        ai_assisted: true
      });
    } catch (error) {
      toast.error('Failed to refine document');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateFromTemplate = () => {
    createDocMutation.mutate({
      doc_name: docName,
      doc_type: 'proposal',
      content: selectedTemplate.template_content,
      template_id: selectedTemplate.id
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#143A50]" />
            Create New Document
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Choose creation method */}
          {step === 'choice' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-4"
            >
              <p className="text-slate-600 mb-6">Choose how you'd like to create your document:</p>
              
              <div className="grid gap-4">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-[#143A50]"
                  onClick={() => setStep('template')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#E5C089]/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-[#143A50]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">Start from Template</h3>
                        <p className="text-sm text-slate-600">Choose from our curated templates with guidance on when and how to use them</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-[#AC1A5B]"
                  onClick={handleAIDraft}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#AC1A5B]/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-[#AC1A5B]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">AI-Guided Draft</h3>
                        <p className="text-sm text-slate-600">Answer a few questions and let AI create a personalized document for you</p>
                        <Badge className="mt-2 bg-[#AC1A5B]">Recommended</Badge>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-[#1E4F58]"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#1E4F58]/20 flex items-center justify-center flex-shrink-0">
                        <Upload className="w-6 h-6 text-[#1E4F58]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">Upload & Refine</h3>
                        <p className="text-sm text-slate-600">Upload an existing document and let AI help refine and improve it</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".doc,.docx,.txt,.pdf"
                  onChange={handleFileUpload}
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Template */}
          {step === 'template' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-4"
            >
              <Button variant="ghost" onClick={() => setStep('choice')}>← Back</Button>
              <p className="text-slate-600 mb-4">Select a template to start with:</p>
              
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {templates?.map((template) => (
                  <Card 
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-[#143A50]"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-[#143A50] mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{template.template_name}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{template.when_to_use}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{template.funding_lane}</Badge>
                            <Badge variant="outline" className="text-xs">{template.maturity_level}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Finalize Template */}
          {step === 'finalize_template' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-4"
            >
              <Button variant="ghost" onClick={() => setStep('template')}>← Back</Button>
              
              <div className="space-y-4">
                <div>
                  <Label>Document Name</Label>
                  <Input
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="Enter document name"
                  />
                </div>

                <Card className="bg-[#E5C089]/10 border-[#E5C089]">
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-700">
                      <strong>Selected Template:</strong> {selectedTemplate?.template_name}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">{selectedTemplate?.when_to_use}</p>
                  </CardContent>
                </Card>

                <Button 
                  onClick={handleCreateFromTemplate}
                  disabled={!docName || createDocMutation.isPending}
                  className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
                >
                  {createDocMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Document from Template
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: AI Questions */}
          {step === 'ai_questions' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-4"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Question {currentQuestionIndex + 1} of {aiQuestions.length}</p>
                  <Badge>{Math.round(((currentQuestionIndex + 1) / aiQuestions.length) * 100)}% Complete</Badge>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-[#AC1A5B] h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestionIndex + 1) / aiQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {currentQuestionIndex === 0 && (
                <div className="mb-4">
                  <Label>Document Name</Label>
                  <Input
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="Enter document name"
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-lg">{aiQuestions[currentQuestionIndex]}</Label>
                <textarea
                  value={aiResponses[aiQuestions[currentQuestionIndex]] || ''}
                  onChange={(e) => setAiResponses({
                    ...aiResponses,
                    [aiQuestions[currentQuestionIndex]]: e.target.value
                  })}
                  className="w-full min-h-[120px] p-3 border rounded-lg"
                  placeholder="Type your answer here..."
                />
              </div>

              <div className="flex gap-3">
                {currentQuestionIndex > 0 && (
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                )}
                <Button 
                  onClick={handleAIQuestionAnswer}
                  disabled={!aiResponses[aiQuestions[currentQuestionIndex]] || isProcessing}
                  className="flex-1 bg-[#AC1A5B] hover:bg-[#A65D40]"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : currentQuestionIndex === aiQuestions.length - 1 ? (
                    <>Generate Document <Sparkles className="w-4 h-4 ml-2" /></>
                  ) : (
                    <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: AI Refine */}
          {step === 'ai_refine' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-4"
            >
              <div className="space-y-4">
                <Card className="bg-[#1E4F58]/10 border-[#1E4F58]">
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-700">
                      <strong>Uploaded:</strong> {uploadedFile?.name}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">AI will analyze and refine your document for clarity and professionalism</p>
                  </CardContent>
                </Card>

                <div>
                  <Label>Document Name</Label>
                  <Input
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="Enter document name"
                  />
                </div>

                <Button 
                  onClick={handleAIRefine}
                  disabled={!docName || isProcessing}
                  className="w-full bg-[#1E4F58] hover:bg-[#143A50]"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Refining Document...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Refine with AI</>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {isProcessing && step === 'choice' && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#143A50]" />
            </div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}