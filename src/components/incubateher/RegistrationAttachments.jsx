import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Paperclip, Upload, Trash2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegistrationAttachments({ submission, onUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState('');
  const fileInputRef = React.useRef(null);

  const attachments = submission?.attachments || [];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const newAttachment = {
      file_url,
      file_name: file.name,
      uploaded_date: new Date().toISOString(),
      label: label || file.name
    };
    const updatedAttachments = [...attachments, newAttachment];
    await base44.entities.RegistrationSubmission.update(submission.id, {
      attachments: updatedAttachments
    });
    setUploading(false);
    setLabel('');
    e.target.value = '';
    toast.success('PDF uploaded successfully');
    onUpdated?.();
  };

  const handleDelete = async (index) => {
    const updated = attachments.filter((_, i) => i !== index);
    await base44.entities.RegistrationSubmission.update(submission.id, {
      attachments: updated
    });
    toast.success('Attachment removed');
    onUpdated?.();
  };

  return (
    <div className="space-y-3" onClick={e => e.stopPropagation()}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
        <Paperclip className="w-3 h-3" /> Attachments ({attachments.length})
      </p>

      {/* Existing attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((att, i) => (
            <div key={i} className="flex items-center justify-between bg-white border rounded-md px-3 py-2">
              <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#143A50] hover:underline truncate">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{att.label || att.file_name}</span>
              </a>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600 flex-shrink-0" onClick={() => handleDelete(i)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload new */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label className="text-xs mb-1 block">Label (optional)</Label>
          <Input
            placeholder="e.g. Signed Agreement"
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1 h-8"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          Upload PDF
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}