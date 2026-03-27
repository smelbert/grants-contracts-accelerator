import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, CheckCircle2, Edit, Upload, Download, Sparkles, Trash2, FolderOpen } from 'lucide-react';
import DocumentTemplates from '@/components/incubateher/DocumentTemplates';
import SuggestTemplatePanel from '@/components/incubateher/SuggestTemplatePanel';
import { toast } from 'sonner';

export default function IncubateHerDocuments() {
  const [selectedDay, setSelectedDay] = useState('day1');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [aiEnhanceDialogOpen, setAiEnhanceDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: enrollment } = useQuery({
    queryKey: ['incubateher-enrollment', user?.email],
    queryFn: async () => {
      // Try participant_email first
      let enrollments = await base44.entities.ProgramEnrollment.filter({ participant_email: user.email });
      if (enrollments[0]) return enrollments[0];
      // Fallback: login_email
      enrollments = await base44.entities.ProgramEnrollment.filter({ login_email: user.email });
      if (enrollments[0]) return enrollments[0];
      // Fallback: user_id
      enrollments = await base44.entities.ProgramEnrollment.filter({ user_id: user.id });
      return enrollments[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: dayModules = [] } = useQuery({
    queryKey: ['incubateher-day-modules'],
    queryFn: () => base44.entities.LearningContent.filter({
      incubateher_only: true,
      program_cohort_id: 'incubateher'
    }, 'order')
  });

  const { data: userDocuments = [], refetch: refetchDocs } = useQuery({
    queryKey: ['user-documents', user?.email],
    queryFn: async () => {
      const docs = await base44.entities.DocumentSubmission.filter({
        user_email: user.email,
        program_id: 'incubateher'
      }, '-created_date');
      return docs;
    },
    enabled: !!user?.email
  });

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadCategory || !uploadName) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadFile });
      
      // Try to extract data from uploaded file if it's a document
      let extractedData = null;
      if (uploadFile.type.includes('pdf') || uploadFile.type.includes('document') || uploadFile.type.includes('word')) {
        try {
          const extraction = await base44.integrations.Core.ExtractDataFromUploadedFile({
            file_url,
            json_schema: {
              type: 'object',
              properties: {
                organization_name: { type: 'string' },
                mission_statement: { type: 'string' },
                programs_offered: { type: 'string' },
                budget: { type: 'string' },
                contact_info: { type: 'string' }
              }
            }
          });
          
          if (extraction.status === 'success' && extraction.output) {
            extractedData = extraction.output;
            toast.success('Document uploaded and data extracted!');
          }
        } catch (err) {
          // Extraction failed, just upload the file
        }
      }
      
      await base44.entities.DocumentSubmission.create({
        user_email: user.email,
        program_id: 'incubateher',
        document_name: uploadName,
        document_category: uploadCategory,
        file_url: file_url,
        file_type: uploadFile.type,
        status: 'submitted',
        extracted_data: extractedData
      });

      await refetchDocs();
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadName('');
      setUploadCategory('');
      
      if (!extractedData) {
        toast.success('Document uploaded successfully!');
      }
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAIEnhance = async () => {
    if (!selectedDoc) return;

    setIsEnhancing(true);
    try {
      const response = await fetch(selectedDoc.file_url);
      const text = await response.text();

      const enhanced = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert grant writer and funding readiness advisor. Review and enhance the following document for funding readiness. Improve clarity, professionalism, and alignment with funder expectations while maintaining the original intent.

Document Category: ${selectedDoc.document_category}
Document Name: ${selectedDoc.document_name}

Content:
${text}

Provide an enhanced version that is more compelling, clear, and professional.`,
        response_json_schema: null
      });

      const blob = new Blob([enhanced], { type: 'text/plain' });
      const file = new File([blob], selectedDoc.document_name + '_enhanced.txt', { type: 'text/plain' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      await base44.entities.DocumentSubmission.create({
        user_email: user.email,
        program_id: 'incubateher',
        document_name: selectedDoc.document_name + ' (AI Enhanced)',
        document_category: selectedDoc.document_category,
        file_url: file_url,
        file_type: 'text/plain',
        status: 'submitted',
        notes: 'AI-enhanced version of original document'
      });

      await refetchDocs();
      setAiEnhanceDialogOpen(false);
      setSelectedDoc(null);
    } catch (error) {
      alert('Enhancement failed: ' + error.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await base44.entities.DocumentSubmission.delete(docId);
      await refetchDocs();
    } catch (error) {
      alert('Delete failed: ' + error.message);
    }
  };

  const categories = [
    'Organizational Overview',
    'Budget & Financial',
    'Program Description',
    'Impact & Evaluation',
    'Case for Support',
    'Logic Model',
    'Capability Statement',
    'Other'
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  if (!enrollment && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Enrollment Required</h2>
              <p className="text-slate-600">
                This resource is only available to IncubateHer program participants.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const day1Module = dayModules.find(m => m.title?.includes('Day 1'));
  const day2Module = dayModules.find(m => m.title?.includes('Day 2'));
  const day3Module = dayModules.find(m => m.title?.includes('Day 3'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-[#E5C089]/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-[#E5C089]" />
            <h1 className="text-4xl font-bold">Document Templates & Modules</h1>
          </div>
          <p className="text-lg text-[#E5C089]/80 max-w-3xl">
            Three-day structure to build complete funding readiness with templates you can use immediately
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Critical Message */}
        <Card className="mb-8 border-l-4 border-red-500 bg-red-50">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-red-900 mb-2">If you don't have these documents, you are not ready.</p>
                <p className="text-sm text-red-800">
                  Funding readiness is not about passion or urgency. It's about systems, documentation, and capacity. 
                  Complete these modules in order before pursuing any funding opportunities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="day1" className="flex flex-col gap-1 py-3">
              <span className="text-lg">🟢 Day 1</span>
              <span className="text-xs">Structure & Eligibility</span>
            </TabsTrigger>
            <TabsTrigger value="day2" className="flex flex-col gap-1 py-3">
              <span className="text-lg">🔵 Day 2</span>
              <span className="text-xs">Financial & Data</span>
            </TabsTrigger>
            <TabsTrigger value="day3" className="flex flex-col gap-1 py-3">
              <span className="text-lg">🟣 Day 3</span>
              <span className="text-xs">Strategy & Positioning</span>
            </TabsTrigger>
            <TabsTrigger value="mydocs" className="flex flex-col gap-1 py-3">
              <span className="text-lg">📁 My Documents</span>
              <span className="text-xs">Upload & Manage</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="day1" className="mt-8">
            <Card className="mb-6 bg-green-50 border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {day1Module?.title || 'Day 1: Structure & Eligibility Documents'}
                    </CardTitle>
                    <p className="text-green-800 font-semibold">
                      Theme: "Are you legally and operationally fundable?"
                    </p>
                  </div>
                  <Badge className="bg-green-600 text-white">Day 1</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  {day1Module?.description || 'Learn what documents you need to have in place before pursuing any funding.'}
                </p>
              </CardContent>
            </Card>

            <DocumentTemplates day="day1" />
            <SuggestTemplatePanel userEmail={user?.email} userName={user?.full_name} context="day1_documents" />
          </TabsContent>

          <TabsContent value="day2" className="mt-8">
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {day2Module?.title || 'Day 2: Financial & Data Documents'}
                    </CardTitle>
                    <p className="text-blue-800 font-semibold">
                      Theme: "Can you track and report what you promise?"
                    </p>
                  </div>
                  <Badge className="bg-blue-600 text-white">Day 2</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  {day2Module?.description || 'Build the financial and data systems funders require.'}
                </p>
              </CardContent>
            </Card>

            <DocumentTemplates day="day2" />
            <SuggestTemplatePanel userEmail={user?.email} userName={user?.full_name} context="day2_documents" />
          </TabsContent>

          <TabsContent value="day3" className="mt-8">
            <Card className="mb-6 bg-purple-50 border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {day3Module?.title || 'Day 3: Strategy & Positioning Documents'}
                    </CardTitle>
                    <p className="text-purple-800 font-semibold">
                      Theme: "Can you articulate and scale responsibly?"
                    </p>
                  </div>
                  <Badge className="bg-purple-600 text-white">Day 3</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  {day3Module?.description || 'Position yourself strategically for the right opportunities.'}
                </p>
              </CardContent>
            </Card>

            <DocumentTemplates day="day3" />
            <SuggestTemplatePanel userEmail={user?.email} userName={user?.full_name} context="day3_documents" />
          </TabsContent>

          <TabsContent value="mydocs" className="mt-8">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                      <FolderOpen className="w-6 h-6 text-[#143A50]" />
                      My Documents
                    </CardTitle>
                    <p className="text-slate-600">
                      Upload, enhance with AI, and manage your funding readiness documents
                    </p>
                  </div>
                  <Button
                    onClick={() => setUploadDialogOpen(true)}
                    className="bg-[#143A50] hover:bg-[#1E4F58] text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-4">No documents uploaded yet</p>
                    <Button
                      onClick={() => setUploadDialogOpen(true)}
                      variant="outline"
                    >
                      Upload Your First Document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categories.map(category => {
                      const docsInCategory = userDocuments.filter(d => d.document_category === category);
                      if (docsInCategory.length === 0) return null;
                      
                      return (
                        <div key={category} className="space-y-2">
                          <h3 className="font-semibold text-[#143A50] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#E5C089]"></span>
                            {category}
                          </h3>
                          <div className="space-y-2">
                            {docsInCategory.map(doc => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <FileText className="w-5 h-5 text-[#143A50]" />
                                  <div>
                                    <p className="font-medium text-slate-900">{doc.document_name}</p>
                                    <p className="text-xs text-slate-500">
                                      Uploaded {new Date(doc.created_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedDoc(doc);
                                      setAiEnhanceDialogOpen(true);
                                    }}
                                  >
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    AI Enhance
                                  </Button>
                                  <a href={doc.file_url} download target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="outline">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </a>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(doc.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Final Outcome Card */}
        <Card className="mt-8 bg-gradient-to-br from-[#E5C089] to-[#B5A698] text-[#143A50]">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="w-8 h-8" />
              What You Should Have By The End
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 font-semibold">
              If this training is executed correctly, each participant should leave with:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>A completed document inventory</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>At least 3-5 newly drafted templates</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>A structured funding folder</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>A clarified funding pathway</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>A budget draft</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>A logic model draft</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>A sustainability outline</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>A data collection plan</span>
              </div>
            </div>
            <p className="mt-6 text-center text-xl font-bold">That is real readiness. 🔥</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <Label>Document Name *</Label>
              <Input
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="e.g., 2024 Budget Draft"
                required
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>File *</Label>
              <Input
                type="file"
                onChange={(e) => setUploadFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Accepted formats: PDF, Word, Excel, Text
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                className="flex-1 bg-[#143A50] hover:bg-[#1E4F58] text-white"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Enhance Dialog */}
      <Dialog open={aiEnhanceDialogOpen} onOpenChange={setAiEnhanceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E5C089]" />
              AI Document Enhancement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Our AI will review and enhance your document to improve clarity, professionalism, and alignment with funder expectations.
            </p>
            {selectedDoc && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-900">{selectedDoc.document_name}</p>
                <p className="text-xs text-slate-500">{selectedDoc.document_category}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setAiEnhanceDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAIEnhance}
                disabled={isEnhancing}
                className="flex-1 bg-[#E5C089] hover:bg-[#B5A698] text-[#143A50]"
              >
                {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}