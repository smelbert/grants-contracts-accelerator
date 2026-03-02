import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, FileUp, Link as LinkIcon, Code } from 'lucide-react';
import { toast } from 'sonner';

const HandoutManager = ({ handouts = [], onChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [sourceType, setSourceType] = useState('file_url');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleOpenModal = (index = null) => {
    if (index !== null) {
      const handout = handouts[index];
      setEditingIndex(index);
      setTitle(handout.title || '');
      setDescription(handout.description || '');
      setSourceType(handout.source_type || 'file_url');
      setFileUrl(handout.file_url || '');
      setFileType(handout.file_type || '');
      setHtmlContent(handout.html_content || '');
    } else {
      setEditingIndex(null);
      setTitle('');
      setDescription('');
      setSourceType('file_url');
      setFileUrl('');
      setFileType('');
      setHtmlContent('');
    }
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(file_url);
      setFileType(file.type);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    const newHandout = {
      title,
      description,
      source_type: sourceType,
      file_type: fileType
    };

    if (sourceType === 'file_url' || sourceType === 'upload') {
      if (!fileUrl.trim()) {
        toast.error('File URL is required');
        return;
      }
      newHandout.file_url = fileUrl;
    } else if (sourceType === 'html') {
      if (!htmlContent.trim()) {
        toast.error('HTML content is required');
        return;
      }
      newHandout.html_content = htmlContent;
    }

    const updatedHandouts = [...handouts];
    if (editingIndex !== null) {
      updatedHandouts[editingIndex] = newHandout;
    } else {
      updatedHandouts.push(newHandout);
    }

    onChange(updatedHandouts);
    setShowModal(false);
    toast.success(editingIndex !== null ? 'Handout updated' : 'Handout added');
  };

  const handleDelete = (index) => {
    if (window.confirm('Delete this handout?')) {
      const updatedHandouts = handouts.filter((_, i) => i !== index);
      onChange(updatedHandouts);
      toast.success('Handout deleted');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Handouts & Resources</h3>
        <Button size="sm" onClick={() => handleOpenModal()} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add Handout
        </Button>
      </div>

      {handouts.length > 0 ? (
        <div className="space-y-2">
          {handouts.map((handout, idx) => (
            <Card key={idx} className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{handout.title}</p>
                  {handout.description && (
                    <p className="text-xs text-slate-600 mt-1">{handout.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-slate-100 rounded">
                      {handout.source_type}
                    </span>
                    {handout.source_type === 'file_url' && handout.file_url && (
                      <a
                        href={handout.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View File
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenModal(idx)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(idx)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-400 text-sm">
          No handouts yet. Add one to get started.
        </div>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit Handout' : 'Add Handout'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Budget Template"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the handout"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Source Type</label>
              <Tabs value={sourceType} onValueChange={setSourceType} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="file_url" className="gap-1.5 flex-1">
                    <LinkIcon className="w-4 h-4" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-1.5 flex-1">
                    <FileUp className="w-4 h-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="html" className="gap-1.5 flex-1">
                    <Code className="w-4 h-4" />
                    HTML
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file_url" className="space-y-3 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">File URL</label>
                    <Input
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      placeholder="https://example.com/budget-template.pdf"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">File Type</label>
                    <Input
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                      placeholder="e.g., application/pdf"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-3 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Upload File</label>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="block w-full text-sm border border-slate-300 rounded-lg p-2"
                    />
                    {uploading && <p className="text-xs text-slate-500 mt-1">Uploading...</p>}
                  </div>
                  {fileUrl && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                      ✓ File uploaded: {fileUrl}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="html" className="space-y-3 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">HTML Content</label>
                    <Textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="<h2>Title</h2><p>Your content here...</p>"
                      rows={6}
                      className="font-mono text-xs"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingIndex !== null ? 'Update' : 'Add'} Handout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HandoutManager;