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
        const op = organizationProfile;
        const leaderName = op.primary_leader_name || op.executive_director || '';
        const leaderTitle = op.primary_leader_title || 'Executive Director';
        const profileMappings = {
          // Org identity
          'organization_name': op.organization_name,
          'org_name': op.organization_name,
          'organization_type': op.organization_type,
          'ein': op.ein,
          'founding_year': op.founding_year,
          'years_operating': op.founding_year ? `Since ${op.founding_year}` : '',
          'website': op.website,
          // Mission / vision / values
          'mission': op.mission_statement,
          'mission_statement': op.mission_statement,
          'vision': op.vision_statement,
          'vision_statement': op.vision_statement,
          'organizational_values': op.organizational_values,
          'values': op.organizational_values,
          // Programs & impact
          'programs': op.programs_offered,
          'programs_offered': op.programs_offered,
          'target_population': op.target_population,
          'service_area': op.geographic_service_area,
          'geographic_service_area': op.geographic_service_area,
          'annual_people_served': op.annual_people_served,
          // Leadership
          'executive_director': leaderName,
          'primary_leader_name': leaderName,
          'primary_leader_title': leaderTitle,
          'secondary_leader_name': op.secondary_leader_name,
          'secondary_leader_title': op.secondary_leader_title,
          'board_chair': op.board_chair,
          'staff_count': op.staff_count,
          'volunteer_count': op.volunteer_count,
          'board_size': op.board_size,
          // Financial
          'annual_budget': op.annual_budget,
          'revenue_stage': op.revenue_stage,
          'funding_sources': op.funding_sources,
          'largest_grant_amount': op.largest_grant_amount,
          'grant_experience_level': op.grant_experience_level,
          // Goals
          'funding_goals': op.funding_goals,
          'capacity_building_needs': op.capacity_building_needs,
          'technical_assistance_needed': op.technical_assistance_needed,
          // Contact
          'phone': op.phone,
          'address': op.mailing_address,
          'mailing_address': op.mailing_address,
          'email': op.primary_contact_email,
          'contact_info': [
            op.phone && `Phone: ${op.phone}`,
            op.website && `Website: ${op.website}`,
            op.primary_contact_email && `Email: ${op.primary_contact_email}`
          ].filter(Boolean).join('\n'),
          // About / description (used in capability statement)
          'about_us': [
            op.organization_name && op.organization_type ? `${op.organization_name} is a ${op.organization_type}.` : '',
            op.mission_statement || '',
            op.programs_offered ? `We offer: ${op.programs_offered}` : '',
            op.target_population ? `We serve ${op.target_population}.` : '',
            op.geographic_service_area ? `Service area: ${op.geographic_service_area}.` : ''
          ].filter(Boolean).join(' ')
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

  const handleDownloadDocx = () => {
    try {
      const escapeHtml = (str) => (str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const fieldsHtml = template.fields
        ?.map(field => `
          <h3 style="color:#143A50;margin:18px 0 4px 0;font-size:14px;">${escapeHtml(field.label)}</h3>
          <p style="margin:0 0 12px 0;font-size:12px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(formData[field.id] || '(Not completed)')}</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;" />`)
        .join('');

      const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${escapeHtml(template.title)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
body { font-family: Calibri, Arial, sans-serif; color: #1f2937; }
h1 { color: #143A50; font-size: 22px; margin: 0 0 6px 0; }
.lead { color: #475569; font-style: italic; font-size: 12px; margin: 0 0 20px 0; }
.footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
<h1>${escapeHtml(template.title)}</h1>
${template.description ? `<p class="lead">${escapeHtml(template.description)}</p>` : ''}
${fieldsHtml}
<p class="footer">© Elbert Innovative Solutions | Funding Readiness Resource</p>
</body>
</html>`;

      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.title.replace(/\s+/g, '_')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Word document downloaded!');
    } catch (error) {
      console.error('Word download error:', error);
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
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 58, 80);
      doc.text(field.label, margin, yPos);
      yPos += 7;

      // Field value
      doc.setFont('helvetica', 'normal');
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

          <div className="flex items-center justify-between pt-6 border-t gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {lastSaved && (
                <div className="text-xs text-slate-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
              {isComplete && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Complete!</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleManualSave}
                disabled={saving}
                variant="outline"
                size="lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save to My Documents'}
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                onClick={handleDownloadDocx}
                className="bg-[#143A50] hover:bg-[#1E4F58]"
                size="lg"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Download Word
              </Button>
            </div>
          </div>
        </div>

        <LegalFooter />
      </DialogContent>
    </Dialog>
  );
}