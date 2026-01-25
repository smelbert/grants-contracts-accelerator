import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, RotateCcw, Eye, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function VersionHistory({ templateId, onRestore }) {
  const queryClient = useQueryClient();

  const { data: versions = [] } = useQuery({
    queryKey: ['template-versions', templateId],
    queryFn: () => base44.entities.TemplateVersion.filter({ template_id: templateId }, '-version_number'),
    enabled: !!templateId
  });

  const handleRestore = (version) => {
    if (confirm(`Restore to version ${version.version_number}? This will create a new version with this content.`)) {
      onRestore(version);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-slate-600" />
        <h3 className="font-semibold text-slate-900">Version History</h3>
        <Badge variant="outline">{versions.length} versions</Badge>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {versions.map((version, idx) => (
            <Card key={version.id} className={idx === 0 ? 'border-2 border-emerald-300' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={idx === 0 ? 'bg-emerald-600' : 'bg-slate-600'}>
                        v{version.version_number}
                      </Badge>
                      {idx === 0 && <Badge variant="outline">Current</Badge>}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {version.change_summary || 'No change description'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {version.edited_by_name || version.edited_by_email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(version.created_date), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>

                {idx !== 0 && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestore(version)}
                      className="flex-1"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Restore
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {versions.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <History className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No version history yet</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}