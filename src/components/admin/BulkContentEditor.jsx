import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Save, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkContentEditor({ selectedContent, onClose }) {
  const [bulkChanges, setBulkChanges] = useState({
    thumbnail_url: '',
    funding_lane: '',
    is_premium: null,
    incubateher_only: null,
    description_append: ''
  });
  const queryClient = useQueryClient();

  const bulkUpdateMutation = useMutation({
    mutationFn: async () => {
      const updates = {};
      if (bulkChanges.thumbnail_url) updates.thumbnail_url = bulkChanges.thumbnail_url;
      if (bulkChanges.funding_lane) updates.funding_lane = bulkChanges.funding_lane;
      if (bulkChanges.is_premium !== null) updates.is_premium = bulkChanges.is_premium;
      if (bulkChanges.incubateher_only !== null) updates.incubateher_only = bulkChanges.incubateher_only;

      const results = await Promise.all(
        selectedContent.map(async (content) => {
          const finalUpdates = { ...updates };
          
          // Append to description if specified
          if (bulkChanges.description_append && content.description) {
            finalUpdates.description = content.description + ' ' + bulkChanges.description_append;
          }

          return base44.entities.LearningContent.update(content.id, finalUpdates);
        })
      );

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-content']);
      toast.success(`Successfully updated ${selectedContent.length} items`);
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to update content: ' + error.message);
    }
  });

  return (
    <Card className="fixed inset-4 z-50 overflow-auto bg-white shadow-2xl">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Bulk Edit {selectedContent.length} Items
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <CheckCircle2 className="w-4 h-4 inline mr-2" />
            Changes will be applied to all {selectedContent.length} selected items. Leave fields blank to skip updating them.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Thumbnail URL</Label>
            <Input
              placeholder="https://images.unsplash.com/..."
              value={bulkChanges.thumbnail_url}
              onChange={(e) => setBulkChanges({ ...bulkChanges, thumbnail_url: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">Set the same thumbnail for all selected items</p>
          </div>

          <div>
            <Label>Funding Lane</Label>
            <Select
              value={bulkChanges.funding_lane}
              onValueChange={(value) => setBulkChanges({ ...bulkChanges, funding_lane: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select funding lane..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Don't change</SelectItem>
                <SelectItem value="grants">Grants</SelectItem>
                <SelectItem value="contracts">Contracts</SelectItem>
                <SelectItem value="donors">Donors</SelectItem>
                <SelectItem value="public_funds">Public Funds</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Append to Description</Label>
            <Textarea
              placeholder="Text to add at the end of existing descriptions..."
              value={bulkChanges.description_append}
              onChange={(e) => setBulkChanges({ ...bulkChanges, description_append: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_premium"
                checked={bulkChanges.is_premium === true}
                onCheckedChange={(checked) => 
                  setBulkChanges({ ...bulkChanges, is_premium: checked ? true : null })
                }
              />
              <Label htmlFor="is_premium">Mark as Premium</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="incubateher_only"
                checked={bulkChanges.incubateher_only === true}
                onCheckedChange={(checked) => 
                  setBulkChanges({ ...bulkChanges, incubateher_only: checked ? true : null })
                }
              />
              <Label htmlFor="incubateher_only">IncubateHer Only</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => bulkUpdateMutation.mutate()}
            disabled={bulkUpdateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {bulkUpdateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Apply Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}