import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Download, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export default function EditableDocumentTemplate({ template, open, onOpenChange, organizationProfile }) {
  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(false);

  // Auto-fill from organization profile
  useEffect(() => {
    if (organizationProfile && open) {
      const prefillData = {};
      
      // Map organization profile fields to template fields
      const fieldMappings = {
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
        'annual_budget': organizationProfile.annual_budget
      };

      // Pre-fill based on template field IDs
      template.fields?.forEach(field => {
        if (fieldMappings[field.id] && fieldMappings[field.id]) {
          prefillData[field.id] = fieldMappings[field.id];
        }
      });

      setFormData(prefillData);
    }
  }, [organizationProfile, open, template]);

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
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
          {organizationProfile && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              <CheckCircle2 className="w-4 h-4 inline mr-2" />
              Fields below have been auto-filled from your organization profile
            </div>
          )}

          {template.fields?.map((field) => (
            <div key={field.id} className="space-y-2">
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
      </DialogContent>
    </Dialog>
  );
}