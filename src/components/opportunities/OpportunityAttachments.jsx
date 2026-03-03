import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Paperclip, Upload, Trash2, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function OpportunityAttachments({ opp, isAdmin, onUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState(null);

  const attachments = opp.attachments || [];

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const user = await base44.auth.me();
      const newAttachment = {
        name: file.name,
        file_url,
        file_type: file.type || file.name.split('.').pop(),
        uploaded_at: new Date().toISOString(),
        uploaded_by: user?.email || '',
      };
      const updated = [...attachments, newAttachment];
      await base44.entities.FundingOpportunity.update(opp.id, { attachments: updated });
      toast.success('Document uploaded');
      onUpdated?.();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (idx) => {
    setDeletingIdx(idx);
    try {
      const updated = attachments.filter((_, i) => i !== idx);
      await base44.entities.FundingOpportunity.update(opp.id, { attachments: updated });
      toast.success('Document removed');
      onUpdated?.();
    } catch {
      toast.error('Failed to remove document');
    } finally {
      setDeletingIdx(null);
    }
  };

  const getIcon = (fileType = '') => {
    const t = fileType.toLowerCase();
    if (t.includes('pdf')) return '📄';
    if (t.includes('word') || t.includes('doc')) return '📝';
    if (t.includes('sheet') || t.includes('excel') || t.includes('xls')) return '📊';
    if (t.includes('image') || t.includes('png') || t.includes('jpg')) return '🖼️';
    return '📎';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-slate-500" />
          Documents & Attachments
          {attachments.length > 0 && (
            <span className="text-xs font-normal bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{attachments.length}</span>
          )}
        </h3>
        {isAdmin && (
          <label className="cursor-pointer">
            <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.zip" />
            <Button variant="outline" size="sm" className="gap-1.5 pointer-events-none" asChild>
              <span>
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploading ? 'Uploading...' : 'Upload Document'}
              </span>
            </Button>
          </label>
        )}
      </div>

      {attachments.length === 0 ? (
        <p className="text-sm text-slate-400 italic py-3 text-center border border-dashed border-slate-200 rounded-xl">
          {isAdmin ? 'No documents yet — upload RFP PDFs, guidelines, or related files.' : 'No documents attached to this opportunity.'}
        </p>
      ) : (
        <div className="space-y-2">
          {attachments.map((att, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 group">
              <span className="text-lg shrink-0">{getIcon(att.file_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{att.name}</p>
                {att.uploaded_at && (
                  <p className="text-xs text-slate-400">
                    Added {format(new Date(att.uploaded_at), 'MMM d, yyyy')}
                    {att.uploaded_by ? ` · ${att.uploaded_by}` : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a href={att.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-300 hover:text-red-500"
                    onClick={() => handleDelete(idx)}
                    disabled={deletingIdx === idx}
                  >
                    {deletingIdx === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}