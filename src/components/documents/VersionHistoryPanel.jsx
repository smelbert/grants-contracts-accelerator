import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, ChevronDown, ChevronUp, RotateCcw, GitCompare } from 'lucide-react';
import { format } from 'date-fns';

const VERSION_TYPE_LABELS = {
  auto_save: { label: 'Auto-save', color: 'bg-slate-100 text-slate-500' },
  manual_save: { label: 'Saved', color: 'bg-blue-100 text-blue-700' },
  suggestion_accepted: { label: 'Suggestion Accepted', color: 'bg-emerald-100 text-emerald-700' },
  review_submitted: { label: 'Review Submitted', color: 'bg-purple-100 text-purple-700' },
};

export default function VersionHistoryPanel({ documentId, currentContent, onRestoreVersion, onCompareVersions }) {
  const [expanded, setExpanded] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(null);

  const { data: versions = [] } = useQuery({
    queryKey: ['documentVersions', documentId],
    queryFn: () => base44.entities.DocumentVersion.filter({ document_id: documentId }, '-version_number'),
    enabled: !!documentId,
  });

  if (versions.length === 0) return null;

  const latestVersion = versions[0];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Version History</span>
          <Badge className="bg-slate-200 text-slate-600 text-xs">{versions.length} versions</Badge>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
          {versions.map((version, idx) => {
            const typeMeta = VERSION_TYPE_LABELS[version.version_type] || VERSION_TYPE_LABELS.manual_save;
            const isLatest = idx === 0;
            const isPreviewing = previewVersion?.id === version.id;

            return (
              <div key={version.id} className={`flex items-start justify-between gap-3 px-4 py-3 ${isPreviewing ? 'bg-blue-50' : 'bg-white'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-700">v{version.version_number}</span>
                    <Badge className={`text-xs ${typeMeta.color}`}>{typeMeta.label}</Badge>
                    {isLatest && <Badge className="text-xs bg-emerald-100 text-emerald-700">Current</Badge>}
                  </div>
                  {version.change_summary && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{version.change_summary}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {version.saved_by_name && (
                      <span className="text-xs text-slate-400">{version.saved_by_name}</span>
                    )}
                    <span className="text-xs text-slate-400">
                      {version.created_date && format(new Date(version.created_date), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>

                {!isLatest && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-slate-500 hover:text-slate-900 px-2"
                      onClick={() => setPreviewVersion(isPreviewing ? null : version)}
                    >
                      {isPreviewing ? 'Hide' : 'Preview'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-blue-600 hover:text-blue-800 px-2"
                      onClick={() => onRestoreVersion?.(version)}
                      title="Restore this version"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Restore
                    </Button>
                    {idx < versions.length - 1 && onCompareVersions && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-slate-500 hover:text-slate-900 px-2"
                        onClick={() => onCompareVersions(version, versions[idx + 1])}
                        title="Compare with previous"
                      >
                        <GitCompare className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Preview pane */}
      {previewVersion && (
        <div className="border-t border-slate-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-700 mb-2">Preview — v{previewVersion.version_number}</p>
          <div className="bg-white rounded border border-amber-200 p-3 max-h-48 overflow-y-auto">
            <p className="text-xs font-mono text-slate-700 whitespace-pre-wrap">{previewVersion.content}</p>
          </div>
          <Button
            size="sm"
            className="mt-3 bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
            onClick={() => { onRestoreVersion?.(previewVersion); setPreviewVersion(null); }}
          >
            <RotateCcw className="w-3 h-3" /> Restore This Version
          </Button>
        </div>
      )}
    </div>
  );
}