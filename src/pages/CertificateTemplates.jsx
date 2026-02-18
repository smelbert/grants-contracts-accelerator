import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Award, Eye, Copy, Palette } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LayoutPreview, { layouts } from '@/components/certificates/LayoutPreview';

export default function CertificateTemplatesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [formData, setFormData] = useState({
    template_name: '',
    template_layout: 'modern_blue_geometric',
    cohort_id: '',
    is_default: false,
    header_text: 'Certificate of Completion',
    body_template: 'This certifies that {participant_name} has successfully completed {program_name} on {completion_date}. Total program hours: {total_hours}.',
    footer_text: 'Funded by {funder_organization} | Delivered by {delivery_organization}',
    logo_url: '',
    co_logo_url: '',
    signature_fields: [],
    background_color: '#FFFFFF',
    border_color: '#143A50',
    text_color: '#000000',
    accent_color: '#E5C089',
    secondary_color: '#1E4F58',
    include_qr_code: true,
    is_active: true
  });
  const [newSignature, setNewSignature] = useState({ name: '', title: '', signature_image_url: '' });

  const { data: templates } = useQuery({
    queryKey: ['certificate-templates'],
    queryFn: () => base44.entities.CertificateTemplate.list()
  });

  const { data: programs } = useQuery({
    queryKey: ['all-programs'],
    queryFn: () => base44.entities.ProgramCohort.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CertificateTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['certificate-templates']);
      resetForm();
      toast.success('Template created successfully');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CertificateTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['certificate-templates']);
      resetForm();
      toast.success('Template updated successfully');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CertificateTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['certificate-templates']);
      toast.success('Template deleted');
    }
  });

  const resetForm = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setFormData({
      template_name: '',
      template_layout: 'modern_blue_geometric',
      cohort_id: '',
      is_default: false,
      header_text: 'Certificate of Completion',
      body_template: 'This certifies that {participant_name} has successfully completed {program_name} on {completion_date}. Total program hours: {total_hours}.',
      footer_text: 'Funded by {funder_organization} | Delivered by {delivery_organization}',
      logo_url: '',
      co_logo_url: '',
      signature_fields: [],
      background_color: '#FFFFFF',
      border_color: '#143A50',
      text_color: '#000000',
      accent_color: '#E5C089',
      secondary_color: '#1E4F58',
      include_qr_code: true,
      is_active: true
    });
    setNewSignature({ name: '', title: '', signature_image_url: '' });
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData(template);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const addSignature = () => {
    if (!newSignature.name || !newSignature.title) {
      toast.error('Please enter name and title');
      return;
    }
    setFormData({
      ...formData,
      signature_fields: [...(formData.signature_fields || []), { ...newSignature }]
    });
    setNewSignature({ name: '', title: '', signature_image_url: '' });
  };

  const removeSignature = (index) => {
    setFormData({
      ...formData,
      signature_fields: formData.signature_fields.filter((_, i) => i !== index)
    });
  };

  const duplicateTemplate = (template) => {
    setFormData({
      ...template,
      template_name: `${template.template_name} (Copy)`,
      is_default: false
    });
    setShowModal(true);
  };

  const renderPreview = () => {
    const template = previewTemplate || formData;
    const sampleData = {
      participant_name: 'Jane Doe',
      program_name: 'IncubateHer Funding Readiness',
      completion_date: new Date().toLocaleDateString(),
      total_hours: '12',
      funder_organization: 'Columbus Urban League',
      delivery_organization: 'Elbert Innovative Solutions'
    };
    
    let bodyText = template.body_template;
    Object.keys(sampleData).forEach(key => {
      bodyText = bodyText.replace(new RegExp(`{${key}}`, 'g'), sampleData[key]);
    });

    let footerText = template.footer_text || '';
    Object.keys(sampleData).forEach(key => {
      footerText = footerText.replace(new RegExp(`{${key}}`, 'g'), sampleData[key]);
    });

    return (
      <div 
        className="border-8 p-12 rounded-lg shadow-lg max-w-4xl mx-auto"
        style={{ 
          backgroundColor: template.background_color,
          borderColor: template.border_color,
          color: template.text_color
        }}
      >
        <div className="text-center space-y-6">
          {(template.logo_url || template.co_logo_url) && (
            <div className="flex items-center justify-center gap-8 mb-8">
              {template.logo_url && <img src={template.logo_url} alt="Logo" className="h-16 object-contain" />}
              {template.co_logo_url && <img src={template.co_logo_url} alt="Co-Logo" className="h-16 object-contain" />}
            </div>
          )}
          
          <h1 className="text-4xl font-bold" style={{ color: template.accent_color }}>
            {template.header_text}
          </h1>
          
          <div className="py-8">
            <p className="text-lg leading-relaxed">{bodyText}</p>
          </div>

          {template.signature_fields && template.signature_fields.length > 0 && (
            <div className="flex justify-center gap-16 pt-8 mt-8 border-t">
              {template.signature_fields.map((sig, idx) => (
                <div key={idx} className="text-center">
                  {sig.signature_image_url && (
                    <img src={sig.signature_image_url} alt="Signature" className="h-12 mx-auto mb-2" />
                  )}
                  <div className="border-t-2 border-gray-400 pt-2 min-w-[200px]">
                    <p className="font-semibold">{sig.name}</p>
                    <p className="text-sm text-gray-600">{sig.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {footerText && (
            <p className="text-sm text-gray-600 pt-8">{footerText}</p>
          )}

          {template.include_qr_code && (
            <div className="pt-4">
              <div className="inline-block p-3 bg-gray-100 rounded">
                <p className="text-xs text-gray-500">QR Code for Verification</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Certificate Templates</h1>
            <p className="text-slate-600 mt-1">Design customizable certificate templates for programs</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-[#143A50]">
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates?.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{template.template_name}</CardTitle>
                    {template.is_default && <Badge variant="default">Default</Badge>}
                  </div>
                  {template.cohort_id && (
                    <p className="text-sm text-slate-600 mt-1">
                      {programs?.find(p => p.id === template.cohort_id)?.program_name}
                    </p>
                  )}
                </div>
                <Badge variant={template.is_active ? 'default' : 'outline'}>
                  {template.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <LayoutPreview 
                  layout={template.template_layout || 'modern_blue_geometric'}
                  colors={{
                    background: template.background_color,
                    border: template.border_color,
                    text: template.text_color,
                    accent: template.accent_color
                  }}
                />
                <div className="flex gap-2 pt-3 border-t">
                  <Button size="sm" variant="outline" onClick={() => setPreviewTemplate(template)} className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => duplicateTemplate(template)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(template.id)}>
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="max-w-4xl w-full my-8">
            <CardHeader>
              <CardTitle>{editingTemplate ? 'Edit Template' : 'Create Certificate Template'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Template Name *</Label>
                    <Input
                      required
                      value={formData.template_name}
                      onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Program (Optional)</Label>
                    <Select
                      value={formData.cohort_id}
                      onValueChange={(value) => setFormData({ ...formData, cohort_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>None (General)</SelectItem>
                        {programs?.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.program_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Certificate Layout *
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {Object.entries(layouts).map(([key, layout]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, template_layout: key })}
                        className={`p-2 border-2 rounded-lg transition hover:border-[#143A50] ${
                          formData.template_layout === key ? 'border-[#143A50] bg-[#143A50]/5' : 'border-slate-200'
                        }`}
                      >
                        <LayoutPreview 
                          layout={key}
                          colors={{
                            background: formData.background_color,
                            border: formData.border_color,
                            text: formData.text_color,
                            accent: formData.accent_color
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Header Text *</Label>
                  <Input
                    required
                    value={formData.header_text}
                    onChange={(e) => setFormData({ ...formData, header_text: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Body Template *</Label>
                  <Textarea
                    required
                    rows={4}
                    value={formData.body_template}
                    onChange={(e) => setFormData({ ...formData, body_template: e.target.value })}
                    placeholder="Use placeholders: {participant_name}, {program_name}, {completion_date}, {total_hours}, {funder_organization}, {delivery_organization}"
                  />
                  <p className="text-xs text-slate-500 mt-1">Available placeholders: {'{participant_name}, {program_name}, {completion_date}, {total_hours}, {funder_organization}, {delivery_organization}'}</p>
                </div>

                <div>
                  <Label>Footer Text</Label>
                  <Input
                    value={formData.footer_text}
                    onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Logo URL</Label>
                    <Input
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>Co-Brand Logo URL</Label>
                    <Input
                      value={formData.co_logo_url}
                      onChange={(e) => setFormData({ ...formData, co_logo_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <Label>Background</Label>
                    <Input
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Border</Label>
                    <Input
                      type="color"
                      value={formData.border_color}
                      onChange={(e) => setFormData({ ...formData, border_color: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Text</Label>
                    <Input
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Accent</Label>
                    <Input
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Secondary</Label>
                    <Input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    />
                  </div>
                </div>

                {/* Signatures */}
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base font-semibold">Signature Fields</Label>
                  
                  {formData.signature_fields?.map((sig, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{sig.name}</p>
                        <p className="text-xs text-slate-600">{sig.title}</p>
                      </div>
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeSignature(index)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}

                  <div className="grid grid-cols-3 gap-3 p-3 border rounded-lg">
                    <Input
                      placeholder="Name"
                      value={newSignature.name}
                      onChange={(e) => setNewSignature({ ...newSignature, name: e.target.value })}
                    />
                    <Input
                      placeholder="Title"
                      value={newSignature.title}
                      onChange={(e) => setNewSignature({ ...newSignature, title: e.target.value })}
                    />
                    <Button type="button" size="sm" onClick={addSignature} className="w-full">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <Switch
                      checked={formData.include_qr_code}
                      onCheckedChange={(checked) => setFormData({ ...formData, include_qr_code: checked })}
                    />
                    <Label>Include QR Code</Label>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <Switch
                      checked={formData.is_default}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                    />
                    <Label>Default Template</Label>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-[#143A50]">
                    {editingTemplate ? 'Update' : 'Create'} Template
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-6xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Certificate Preview</h2>
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Close</Button>
            </div>
            {renderPreview()}
          </div>
        </div>
      )}
    </div>
  );
}