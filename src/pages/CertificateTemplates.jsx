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
import { Plus, Edit, Trash2, Award, Eye, Copy, Palette, Upload, Loader2, Code } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProfessionalLayoutPreview, { professionalLayouts } from '@/components/certificates/ProfessionalLayouts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CertificateTemplatesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [formData, setFormData] = useState({
    template_name: '',
    template_layout: 'blue_wave_landscape',
    cohort_id: '',
    is_default: false,
    header_text: 'Certificate of Completion',
    body_template: 'In appreciation of your outstanding dedication and consistent contribution during the {program_name}. Your efforts have greatly impacted the success and vision of the program.',
    footer_text: 'Funded by {funder_organization} | Delivered by {delivery_organization}',
    logo_url: '',
    co_logo_url: '',
    signature_fields: [],
    primary_color: '#143A50',
    secondary_color: '#E5C089',
    background_color: '#FFFFFF',
    text_color: '#000000',
    include_qr_code: true,
    custom_html: '',
    is_active: true
  });
  const [newSignature, setNewSignature] = useState({ name: '', title: '', signature_image_url: '' });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCoLogo, setUploadingCoLogo] = useState(false);

  const handleLogoUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const setter = field === 'logo_url' ? setUploadingLogo : setUploadingCoLogo;
    setter(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, [field]: file_url }));
    setter(false);
    toast.success('Logo uploaded!');
  };

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
      template_layout: 'blue_wave_landscape',
      cohort_id: '',
      is_default: false,
      header_text: 'Certificate of Completion',
      body_template: 'In appreciation of your outstanding dedication and consistent contribution during the {program_name}. Your efforts have greatly impacted the success and vision of the program.',
      footer_text: 'Funded by {funder_organization} | Delivered by {delivery_organization}',
      logo_url: '',
      co_logo_url: '',
      signature_fields: [],
      primary_color: '#143A50',
      secondary_color: '#E5C089',
      background_color: '#FFFFFF',
      text_color: '#000000',
      include_qr_code: true,
      custom_html: '',
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
    const layoutConfig = professionalLayouts[template.template_layout];
    
    if (!layoutConfig) return null;

    const sampleData = {
      participant_name: 'Jane Doe',
      program_name: 'IncubateHer Funding Readiness Program',
      completion_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      total_hours: '12',
      funder_organization: 'Columbus Urban League',
      delivery_organization: 'Elbert Innovative Solutions'
    };
    
    let bodyText = template.body_template || '';
    Object.keys(sampleData).forEach(key => {
      bodyText = bodyText.replace(new RegExp(`{${key}}`, 'g'), sampleData[key]);
    });

    const colors = {
      primary: template.primary_color,
      secondary: template.secondary_color,
      background: template.background_color,
      text: template.text_color
    };

    return (
      <div className="max-w-5xl mx-auto">
        {layoutConfig.render({
          headerText: template.header_text,
          participantName: sampleData.participant_name,
          bodyText: bodyText,
          signatures: template.signature_fields,
          colors: colors,
          logos: {
            main: template.logo_url,
            co: template.co_logo_url
          }
        })}
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
                <ProfessionalLayoutPreview 
                  layout={template.template_layout || 'blue_wave_landscape'}
                  colors={{
                    primary: template.primary_color,
                    secondary: template.secondary_color,
                    background: template.background_color,
                    text: template.text_color
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
                <Tabs defaultValue="design">
                  <TabsList className="mb-4">
                    <TabsTrigger value="design"><Palette className="w-3 h-3 mr-1" />Design</TabsTrigger>
                    <TabsTrigger value="html"><Code className="w-3 h-3 mr-1" />Custom HTML</TabsTrigger>
                  </TabsList>

                  <TabsContent value="design" className="space-y-4">
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
                  <Label className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4" />
                    Certificate Layout * (Professional Designs - Structure Locked)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {Object.entries(professionalLayouts).map(([key, layout]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, template_layout: key })}
                        className={`relative p-3 border-2 rounded-lg transition hover:border-[#143A50] ${
                          formData.template_layout === key ? 'border-[#143A50] bg-[#143A50]/5 ring-2 ring-[#143A50]/20' : 'border-slate-200'
                        }`}
                      >
                        <div className="h-32 overflow-hidden rounded">
                          <ProfessionalLayoutPreview 
                            layout={key}
                            colors={{
                              primary: formData.primary_color,
                              secondary: formData.secondary_color,
                              background: formData.background_color,
                              text: formData.text_color
                            }}
                          />
                        </div>
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
                    <Label>Main Logo</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {formData.logo_url && (
                        <img src={formData.logo_url} className="h-10 object-contain border rounded p-1 bg-white" alt="Logo" />
                      )}
                      <label className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2 border rounded-md px-3 py-2 text-sm hover:bg-slate-50 transition">
                          {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploadingLogo ? 'Uploading...' : formData.logo_url ? 'Replace Logo' : 'Upload Logo'}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'logo_url')} />
                      </label>
                      {formData.logo_url && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => setFormData({ ...formData, logo_url: '' })}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Co-Brand Logo</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {formData.co_logo_url && (
                        <img src={formData.co_logo_url} className="h-10 object-contain border rounded p-1 bg-white" alt="Co-Logo" />
                      )}
                      <label className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2 border rounded-md px-3 py-2 text-sm hover:bg-slate-50 transition">
                          {uploadingCoLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploadingCoLogo ? 'Uploading...' : formData.co_logo_url ? 'Replace Logo' : 'Upload Logo'}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'co_logo_url')} />
                      </label>
                      {formData.co_logo_url && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => setFormData({ ...formData, co_logo_url: '' })}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Brand Colors (Customize while keeping professional design)</Label>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs">Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Secondary/Accent</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Background</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={formData.background_color}
                          onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={formData.background_color}
                          onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Text Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={formData.text_color}
                          onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={formData.text_color}
                          onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
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
                  </TabsContent>

                  <TabsContent value="html" className="space-y-3">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                      <strong>Custom HTML Mode:</strong> If you enter HTML here, it will <strong>override the design layout</strong> when generating certificates. Leave blank to use the design layout above.
                      <br/><span className="text-xs mt-1 block">Available placeholders: <code>{'{participant_name}'}</code>, <code>{'{program_name}'}</code>, <code>{'{completion_date}'}</code>, <code>{'{total_hours}'}</code>, <code>{'{funder_organization}'}</code>, <code>{'{delivery_organization}'}</code>, <code>{'{certificate_number}'}</code></span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label>Certificate HTML</Label>
                        {formData.custom_html && (
                          <Button type="button" size="sm" variant="ghost" className="text-red-500 text-xs" onClick={() => setFormData({ ...formData, custom_html: '' })}>
                            Clear HTML (use design layout)
                          </Button>
                        )}
                      </div>
                      <textarea
                        value={formData.custom_html || ''}
                        onChange={(e) => setFormData({ ...formData, custom_html: e.target.value })}
                        rows={20}
                        placeholder={'<!DOCTYPE html>\n<html>\n<head>...</head>\n<body>\n  <!-- Your certificate HTML -->\n</body>\n</html>'}
                        className="w-full font-mono text-xs border rounded-md p-3 bg-slate-950 text-green-400 resize-y focus:outline-none focus:ring-2 focus:ring-[#143A50]"
                        spellCheck={false}
                      />
                    </div>
                    {formData.custom_html && (
                      <div>
                        <Label className="mb-2 block">Live Preview</Label>
                        <div className="border rounded-lg overflow-hidden bg-slate-100 h-80">
                          <iframe
                            srcDoc={formData.custom_html.replace(/\{participant_name\}/g, 'Jane Doe').replace(/\{program_name\}/g, 'IncubateHer Program').replace(/\{completion_date\}/g, new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})).replace(/\{total_hours\}/g, '12').replace(/\{funder_organization\}/g, 'Columbus Urban League').replace(/\{delivery_organization\}/g, 'Elbert Innovative Solutions').replace(/\{certificate_number\}/g, 'CERT-PREVIEW-001')}
                            className="w-full h-full border-0"
                            title="HTML Preview"
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-[#143A50]">
                      {editingTemplate ? 'Update' : 'Create'} Template
                    </Button>
                  </div>
                </Tabs>
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