import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Save, Upload, Eye, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_HTML_TEMPLATES = {
  'capability-statement': `<style>
  .cap-statement { font-family: Arial, sans-serif; max-width: 850px; margin: 0 auto; }
  .cap-header { background: #5A7C8A; color: white; padding: 40px 30px; margin-bottom: 30px; }
  .cap-title { font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 1px; }
  .cap-info-box { background: white; border: 2px solid #5A7C8A; padding: 20px; margin: 20px 0; }
  .cap-info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #ddd; }
  .cap-info-label { font-weight: bold; color: #333; }
  .cap-section { margin: 30px 0; }
  .cap-section-title { background: #E8EDEF; padding: 12px 20px; font-weight: bold; margin-bottom: 15px; font-size: 14px; letter-spacing: 0.5px; }
  .cap-content { padding: 0 20px; line-height: 1.6; }
  .cap-list { list-style: none; padding: 0; }
  .cap-list li { padding: 8px 0; padding-left: 25px; position: relative; }
  .cap-list li:before { content: "✓"; position: absolute; left: 0; color: #5A7C8A; font-weight: bold; }
  .cap-competency { display: inline-block; background: #F0F4F5; padding: 8px 15px; margin: 5px; border-radius: 4px; font-size: 14px; }
  .cap-project { background: #F9FAFB; padding: 20px; margin: 15px 0; border-left: 4px solid #5A7C8A; }
  .cap-project-title { font-weight: bold; color: #333; margin-bottom: 8px; }
  .cap-project-meta { color: #666; font-size: 13px; margin: 3px 0; }
  .cap-footer { margin-top: 40px; padding: 20px; background: #F5F5F5; text-align: center; font-size: 13px; }
</style>

<div class="cap-statement">
  <div class="cap-header">
    <div class="cap-title">CAPABILITY STATEMENT</div>
  </div>

  <div class="cap-info-box">
    <div class="cap-info-row">
      <span class="cap-info-label">DUNS:</span>
      <span>{{duns}}</span>
    </div>
    <div class="cap-info-row">
      <span class="cap-info-label">CAGE:</span>
      <span>{{cage}}</span>
    </div>
  </div>

  <div class="cap-section">
    <div class="cap-section-title">NAICS CODES</div>
    <div class="cap-content">
      <div style="white-space: pre-line;">{{naics_codes}}</div>
    </div>
  </div>

  <div class="cap-section">
    <div class="cap-section-title">CERTIFICATIONS</div>
    <div class="cap-content">
      <ul class="cap-list">
        {{certifications_list}}
      </ul>
    </div>
  </div>

  <div class="cap-section">
    <div class="cap-section-title">ABOUT US</div>
    <div class="cap-content">
      <p style="white-space: pre-line;">{{about_us}}</p>
    </div>
  </div>

  <div class="cap-section">
    <div class="cap-section-title">CORE COMPETENCIES</div>
    <div class="cap-content">
      {{core_competencies_items}}
    </div>
  </div>

  <div class="cap-section">
    <div class="cap-section-title">DIFFERENTIATORS</div>
    <div class="cap-content">
      <div style="white-space: pre-line;">{{differentiators}}</div>
    </div>
  </div>

  <div class="cap-section">
    <div class="cap-section-title">PAST PERFORMANCE</div>
    <div class="cap-content">
      {{project_1}}
      {{project_2}}
      {{project_3}}
    </div>
  </div>

  <div class="cap-footer">
    <strong>{{organization_name}}</strong><br>
    {{website}}<br>
    {{address}}<br>
    P: {{phone}} | E: {{email}}
  </div>
</div>`,
};

const TEMPLATE_DEFINITIONS = {
  day1: [
    { id: 'org-overview', name: 'One-Page Organizational Overview' },
    { id: 'capability-statement', name: 'Capability Statement' },
    { id: 'funding-pathway', name: 'Funding Pathway Strategy Worksheet' },
    { id: 'policy-starter', name: 'Basic Policy Starter List' }
  ],
  day2: [
    { id: 'program-description', name: 'Program/Service Description Sheet' },
    { id: 'budget-template', name: 'Basic Budget Template' },
    { id: 'expense-tracking', name: 'Expense Tracking Log' },
    { id: 'data-collection', name: 'Data Collection Plan' },
    { id: 'client-intake', name: 'Client Intake Form' }
  ],
  day3: [
    { id: 'logic-model', name: 'Logic Model Template' },
    { id: 'sustainability-plan', name: 'Sustainability Plan Outline' },
    { id: 'subcontracting-sheet', name: 'Subcontracting Positioning Sheet' },
    { id: 'rfp-outline', name: 'RFP Response Outline' },
    { id: 'reporting-calendar', name: 'Reporting Calendar' }
  ]
};

export default function DocumentTemplateEditor() {
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState('day1');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [editMode, setEditMode] = useState('edit');

  // Form state
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['document-templates'],
    queryFn: () => base44.entities.DocumentTemplate.list()
  });

  // Load template data when selected
  React.useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.template_id === selectedTemplateId);
      const defaultDef = TEMPLATE_DEFINITIONS[selectedDay]?.find(d => d.id === selectedTemplateId);
      
      if (template) {
        setTemplateName(template.template_name || defaultDef?.name || '');
        setDescription(template.description || '');
        setInstructions(template.instructions || '');
        setContentHtml(template.content_html || '');
        setFileUrl(template.file_url || '');
      } else if (defaultDef) {
        setTemplateName(defaultDef.name);
        setDescription('');
        setInstructions('');
        setContentHtml(DEFAULT_HTML_TEMPLATES[selectedTemplateId] || '');
        setFileUrl('');
      }
    }
  }, [selectedTemplateId, selectedDay, templates]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const existing = templates.find(t => t.template_id === selectedTemplateId);
      if (existing) {
        return base44.entities.DocumentTemplate.update(existing.id, data);
      } else {
        return base44.entities.DocumentTemplate.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['document-templates']);
      toast.success('Template saved!');
    }
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return result.file_url;
    },
    onSuccess: (url) => {
      setFileUrl(url);
      toast.success('File uploaded!');
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFileMutation.mutate(file);
    }
  };

  const handleSave = () => {
    if (!selectedTemplateId) {
      toast.error('Select a template first');
      return;
    }

    saveMutation.mutate({
      template_id: selectedTemplateId,
      template_name: templateName,
      day: selectedDay,
      description,
      instructions,
      content_html: contentHtml,
      file_url: fileUrl,
      last_edited_by: user?.email
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Document Template Editor</h1>
          <p className="text-slate-600">Create and edit downloadable document templates for IncubateHer participants</p>
        </div>

        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <TabsList className="mb-6">
            <TabsTrigger value="day1">🟢 Day 1</TabsTrigger>
            <TabsTrigger value="day2">🔵 Day 2</TabsTrigger>
            <TabsTrigger value="day3">🟣 Day 3</TabsTrigger>
          </TabsList>

          {['day1', 'day2', 'day3'].map(day => (
            <TabsContent key={day} value={day}>
              <div className="grid grid-cols-12 gap-6">
                {/* Template List */}
                <div className="col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Templates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {TEMPLATE_DEFINITIONS[day]?.map(def => {
                        const hasContent = templates.some(t => t.template_id === def.id);
                        return (
                          <button
                            key={def.id}
                            onClick={() => setSelectedTemplateId(def.id)}
                            className={`w-full text-left p-3 rounded-lg text-sm transition ${
                              selectedTemplateId === def.id
                                ? 'bg-[#143A50] text-white'
                                : 'hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{def.name}</span>
                              {hasContent && <FileText className="w-4 h-4 text-green-500" />}
                            </div>
                          </button>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>

                {/* Editor */}
                <div className="col-span-9">
                  {selectedTemplateId ? (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{templateName}</CardTitle>
                          <Button onClick={handleSave} disabled={saveMutation.isPending}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Template
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Tabs value={editMode} onValueChange={setEditMode}>
                          <TabsList className="mb-4">
                            <TabsTrigger value="edit">Edit</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                          </TabsList>

                          <TabsContent value="edit" className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Template Name</label>
                              <Input
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="Template name"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">Description</label>
                              <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of this template - shown to users"
                                rows={2}
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">Instructions</label>
                              <Textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Instructions for completing this template - shown to users before content"
                                rows={4}
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">Web Template (HTML)</label>
                              <p className="text-xs text-slate-600 mb-2">
                                Add HTML content that will be displayed to users. Use placeholders like {`{{field_name}}`} to insert user data.
                              </p>
                              <Textarea
                                value={contentHtml}
                                onChange={(e) => setContentHtml(e.target.value)}
                                placeholder="<div><h3>Section Title</h3><p>{{organization_name}}</p></div>"
                                rows={15}
                                className="font-mono text-xs"
                              />
                              <p className="text-xs text-slate-500 mt-2">
                                Tip: A default HTML template is provided for Capability Statement. Edit as needed.
                              </p>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">File Upload (PDF, DOCX, XLSX)</label>
                              <p className="text-xs text-slate-600 mb-2">Optional downloadable file users can download</p>
                              <div className="flex gap-3">
                                <input
                                  type="file"
                                  onChange={handleFileUpload}
                                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                                  className="hidden"
                                  id="file-upload"
                                />
                                <label htmlFor="file-upload">
                                  <Button type="button" variant="outline" asChild>
                                    <span>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload File
                                    </span>
                                  </Button>
                                </label>
                                {fileUrl && (
                                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm">View Current File</Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="preview">
                            <Card className="border">
                              <CardHeader>
                                <CardTitle>{templateName}</CardTitle>
                                <CardDescription>{description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                {instructions && (
                                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-semibold text-sm mb-2">Instructions:</h4>
                                    <p className="text-sm whitespace-pre-wrap">{instructions}</p>
                                  </div>
                                )}
                                {contentHtml && (
                                  <div 
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                                  />
                                )}
                                {fileUrl && (
                                  <div className="mt-4">
                                    <Button asChild>
                                      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                        Download Template File
                                      </a>
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center h-96">
                        <div className="text-center text-slate-400">
                          <FileText className="w-12 h-12 mx-auto mb-3" />
                          <p>Select a template to edit</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}