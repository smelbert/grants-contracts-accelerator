import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Download, Sparkles, Loader2, Save, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import LegalFooter from '../legal/LegalFooter';
import SignatureField from '../legal/SignatureField';

export default function EditableDocumentTemplate({ template, open, onOpenChange, organizationProfile, workbookResponses = {}, uploadedDocsData = {} }) {
  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveTimerRef = useRef(null);
  const userEmailRef = useRef(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const user = await base44.auth.me();
      userEmailRef.current = user?.email;
    };
    getUser();
  }, []);

  // Auto-fill from profile, workbook, AND uploaded documents
  useEffect(() => {
    if (open) {
      const prefillData = {};
      
      // First, map organization profile fields
      if (organizationProfile) {
        const profileMappings = {
          'organization_name': organizationProfile.organization_name,
          'org_name': organizationProfile.organization_name,
          'mission': organizationProfile.mission_statement,
          'mission_statement': organizationProfile.mission_statement,
          'vision': organizationProfile.vision_statement,
          'programs': organizationProfile.programs_offered,
          'target_population': organizationProfile.target_population,
          'service_area': organizationProfile.geographic_service_area,
          'ein': organizationProfile.ein,
          'phone': organizationProfile.phone,
          'address': organizationProfile.mailing_address,
          'website': organizationProfile.website,
          'executive_director': organizationProfile.executive_director,
          'board_chair': organizationProfile.board_chair,
          'staff_count': organizationProfile.staff_count,
          'annual_budget': organizationProfile.annual_budget,
          'funding_sources': organizationProfile.funding_sources,
          'years_operating': organizationProfile.founding_year ? `Since ${organizationProfile.founding_year}` : '',
          'contact_info': organizationProfile.phone && organizationProfile.website ? 
            `Phone: ${organizationProfile.phone}\nWebsite: ${organizationProfile.website}` : ''
        };

        template.fields?.forEach(field => {
          if (profileMappings[field.id]) {
            prefillData[field.id] = profileMappings[field.id];
          }
        });
      }

      // Second, overlay data from uploaded documents
      if (uploadedDocsData) {
        Object.entries(uploadedDocsData).forEach(([key, value]) => {
          if (value && typeof value === 'string' && value.trim()) {
            prefillData[key] = value;
          }
        });
      }

      // Third, overlay workbook responses (highest priority)
      if (workbookResponses) {
        Object.entries(workbookResponses).forEach(([pageId, responses]) => {
          Object.entries(responses).forEach(([fieldId, value]) => {
            if (value && typeof value === 'string' && value.trim()) {
              prefillData[fieldId] = value;
            }
          });
        });
      }

      setFormData(prefillData);
    }
  }, [organizationProfile, workbookResponses, uploadedDocsData, open, template]);

  // Auto-save functionality
  useEffect(() => {
    if (!open || !userEmailRef.current || Object.keys(formData).length === 0) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save after 2 seconds of inactivity
    autoSaveTimerRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, open]);

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleAutoSave = async () => {
    if (!userEmailRef.current || !template.id) return;

    try {
      await base44.entities.Document.create({
        doc_name: `${template.title} (Auto-saved)`,
        doc_type: 'proposal',
        status: 'draft',
        content: JSON.stringify(formData),
        visibility: 'private'
      });
      setLastSaved(new Date());
    } catch (error) {
      // Silent auto-save error - don't interrupt user
      console.error('Auto-save failed:', error);
    }
  };

  const handleManualSave = async () => {
    if (!userEmailRef.current || !template.id) return;

    setSaving(true);
    try {
      await base44.entities.Document.create({
        doc_name: template.title,
        doc_type: 'proposal',
        status: 'draft',
        content: JSON.stringify(formData),
        visibility: 'private'
      });
      setLastSaved(new Date());
      toast.success('Document saved to your Documents folder!');
    } catch (error) {
      toast.error('Failed to save document');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      // Create Word doc content
      const docContent = template.fields
        ?.map(field => `${field.label}\n${formData[field.id] || '(Not completed)'}\n`)
        .join('\n---\n\n');

      const blob = new Blob([`${template.title}\n\n${docContent}`], { type: 'text/plain' });
      const file = new File([blob], `${template.title}.docx`, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      
      // Upload to storage
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Create a temporary link and download
      const link = document.createElement('a');
      link.href = file_url;
      link.download = `${template.title}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Document downloaded!');
    } catch (error) {
      toast.error('Failed to download Word document');
    }
  };

  const handleAIComplete = async (fieldId, prompt) => {
    setGenerating(true);
    try {
      const contextPrompt = `Complete this field for a funding document template.

Organization: ${organizationProfile?.organization_name || 'unnamed organization'}
${organizationProfile?.mission_statement ? `Mission: ${organizationProfile.mission_statement}` : ''}

Field to complete: ${prompt}

Provide a professional, concise response suitable for funding applications (2-3 paragraphs max).`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt,
        add_context_from_internet: false
      });

      handleChange(fieldId, response);
      toast.success('AI suggestion generated!');
    } catch (error) {
      toast.error('Failed to generate AI suggestion');
    } finally {
      setGenerating(false);
    }
  };

  const processHtmlTemplate = (html, data) => {
    if (!html) return '';
    
    let processed = html;
    
    // Handle certifications list
    if (data.certifications) {
      const certs = data.certifications.split('\n').filter(c => c.trim());
      const certsList = certs.map(cert => `<li>${cert}</li>`).join('');
      processed = processed.replace('{{certifications_list}}', certsList);
    }
    
    // Handle core competencies
    if (data.core_competencies) {
      const comps = data.core_competencies.split('\n').filter(c => c.trim());
      const compItems = comps.map(comp => `<span class="cap-competency">${comp}</span>`).join('');
      processed = processed.replace('{{core_competencies_items}}', compItems);
    }
    
    // Handle past performance projects
    for (let i = 1; i <= 3; i++) {
      const title = data[`past_performance_${i}_title`];
      const client = data[`past_performance_${i}_client`];
      const location = data[`past_performance_${i}_location`];
      const duration = data[`past_performance_${i}_duration`];
      const description = data[`past_performance_${i}_description`];
      
      if (title || client) {
        const projectHtml = `
          <div class="cap-project">
            <div class="cap-project-title">Project Title: ${title || 'N/A'}</div>
            <div class="cap-project-meta"><strong>Client:</strong> ${client || 'N/A'}</div>
            <div class="cap-project-meta"><strong>Location:</strong> ${location || 'N/A'}</div>
            <div class="cap-project-meta"><strong>Duration:</strong> ${duration || 'N/A'}</div>
            <div class="cap-project-meta" style="margin-top: 8px;"><strong>Description:</strong> ${description || 'N/A'}</div>
          </div>
        `;
        processed = processed.replace(`{{project_${i}}}`, projectHtml);
      } else {
        processed = processed.replace(`{{project_${i}}}`, '');
      }
    }
    
    // Replace all other placeholders
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processed = processed.replace(new RegExp(placeholder, 'g'), value || '');
    });
    
    return processed;
  };

  const handleDownload = () => {
    const doc = new jsPDF('p', 'mm', 'letter');
    const pageWidth = 216;
    const margin = 20;
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.setTextColor(20, 58, 80);
    doc.text(template.title, margin, yPos);
    yPos += 15;

    // Fields
    doc.setFontSize(11);
    template.fields?.forEach(field => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Field label
      doc.setFont(undefined, 'bold');
      doc.setTextColor(20, 58, 80);
      doc.text(field.label, margin, yPos);
      yPos += 7;

      // Field value
      doc.setFont(undefined, 'normal');
      doc.setTextColor(60, 60, 60);
      const value = formData[field.id] || '(Not completed)';
      const lines = doc.splitTextToSize(value, pageWidth - 2 * margin);
      lines.forEach(line => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += 5;
      });
      yPos += 5;
    });

    doc.save(`${template.title.replace(/\s+/g, '_')}.pdf`);
    toast.success('Document downloaded!');
  };

  const isComplete = template.fields?.every(field => formData[field.id]?.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#143A50] flex items-center gap-2">
            {template.title}
          </DialogTitle>
          <p className="text-slate-600 mt-2">{template.description}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {(organizationProfile || Object.keys(workbookResponses).length > 0 || Object.keys(uploadedDocsData).length > 0) && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              <CheckCircle2 className="w-4 h-4 inline mr-2" />
              Fields auto-filled from: {
                [
                  organizationProfile && 'profile',
                  Object.keys(uploadedDocsData).length > 0 && 'uploaded documents',
                  Object.keys(workbookResponses).length > 0 && 'workbook'
                ].filter(Boolean).join(', ')
              }
            </div>
          )}

          {/* Show HTML content if available */}
          {template.content_html && (
            <div className="p-6 bg-white border rounded-lg">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: processHtmlTemplate(template.content_html, formData) }}
              />
            </div>
          )}

          {/* Show instructions if available */}
          {template.instructions && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-blue-900">Instructions:</h4>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{template.instructions}</p>
            </div>
          )}

          {template.fields?.map((field) => (
            <div key={field.id} className="space-y-2">
              {field.type === 'signature' ? (
                <SignatureField
                  value={formData[field.id] || {}}
                  onChange={(value) => handleChange(field.id, value)}
                  required={field.required}
                  label={field.label}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold text-[#143A50]">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    {!formData[field.id] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAIComplete(field.id, field.aiPrompt || field.label)}
                        disabled={generating}
                      >
                        {generating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-1" />
                            AI Complete
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {field.description && (
                    <p className="text-sm text-slate-600">{field.description}</p>
                  )}
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={formData[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      rows={field.rows || 4}
                      className="w-full"
                    />
                  ) : (
                    <Input
                      value={formData[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full"
                    />
                  )}
                </>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between pt-6 border-t">
            <div>
              {isComplete && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Document Complete!</span>
                </div>
              )}
            </div>
            <Button
              onClick={handleDownload}
              className="bg-[#143A50] hover:bg-[#1E4F58]"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <LegalFooter />
      </DialogContent>
    </Dialog>
  );
}