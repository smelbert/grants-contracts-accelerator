import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Undo, ChevronUp, ChevronDown, FileText } from 'lucide-react';
import { WORKBOOK_PAGES } from '@/components/incubateher/workbookContent';
import { toast } from 'sonner';

export default function WorkbookSectionEditor() {
  const queryClient = useQueryClient();
  const [editedHeaders, setEditedHeaders] = useState({});

  const { data: customHeaders = [] } = useQuery({
    queryKey: ['workbook-section-headers'],
    queryFn: () => base44.entities.WorkbookSectionHeader.list(),
  });

  // Get unique sections from workbook pages
  const sections = [...new Set(WORKBOOK_PAGES.map(page => page.section))].map(sectionId => {
    const customHeader = customHeaders.find(h => h.section_id === sectionId);
    const defaultName = sectionId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return {
      id: sectionId,
      defaultName,
      displayName: customHeader?.display_name || defaultName,
      isActive: customHeader?.is_active ?? true,
      displayOrder: customHeader?.display_order ?? 999,
      customId: customHeader?.id
    };
  }).sort((a, b) => a.displayOrder - b.displayOrder);

  const saveHeaderMutation = useMutation({
    mutationFn: async (header) => {
      if (header.customId) {
        return base44.entities.WorkbookSectionHeader.update(header.customId, {
          display_name: header.displayName,
          is_active: header.isActive,
          display_order: header.displayOrder
        });
      } else {
        return base44.entities.WorkbookSectionHeader.create({
          section_id: header.id,
          display_name: header.displayName,
          is_active: header.isActive,
          display_order: header.displayOrder
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workbook-section-headers'] });
      toast.success('Section header saved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to save: ' + error.message);
    }
  });

  const resetHeaderMutation = useMutation({
    mutationFn: async (customId) => {
      return base44.entities.WorkbookSectionHeader.delete(customId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workbook-section-headers'] });
      toast.success('Reset to default');
    }
  });

  const handleSave = (section) => {
    const edited = editedHeaders[section.id] || {};
    saveHeaderMutation.mutate({
      ...section,
      displayName: edited.displayName ?? section.displayName,
      isActive: edited.isActive ?? section.isActive,
      displayOrder: edited.displayOrder ?? section.displayOrder
    });
  };

  const handleReset = (section) => {
    if (section.customId) {
      resetHeaderMutation.mutate(section.customId);
    }
    setEditedHeaders(prev => {
      const { [section.id]: _, ...rest } = prev;
      return rest;
    });
  };

  const updateHeader = (sectionId, field, value) => {
    setEditedHeaders(prev => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [field]: value
      }
    }));
  };

  const moveSection = (sectionId, direction) => {
    const currentSection = sections.find(s => s.id === sectionId);
    const currentOrder = editedHeaders[sectionId]?.displayOrder ?? currentSection.displayOrder;
    const newOrder = direction === 'up' ? currentOrder - 1.5 : currentOrder + 1.5;
    
    updateHeader(sectionId, 'displayOrder', newOrder);
    handleSave({ ...currentSection, displayOrder: newOrder });
  };

  const getDisplayValue = (section, field) => {
    return editedHeaders[section.id]?.[field] ?? section[field];
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Workbook Section Headers</h1>
            <p className="text-slate-600">Customize the display names and order of workbook sections</p>
          </div>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            Back to Pages
          </Button>
        </div>

        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <p className="text-sm text-slate-700">
              Section headers appear in UPPERCASE in the workbook sidebar and navigation. 
              Changes will be reflected immediately for all users.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {sections.map((section, idx) => {
            const isEdited = !!editedHeaders[section.id];
            const displayName = getDisplayValue(section, 'displayName');
            const isActive = getDisplayValue(section, 'isActive');
            
            return (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{section.defaultName}</CardTitle>
                        {section.customId && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Customized
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs uppercase tracking-wide">
                        Preview: {displayName}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveSection(section.id, 'up')}
                        disabled={idx === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveSection(section.id, 'down')}
                        disabled={idx === sections.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Display Name</label>
                    <Input
                      value={displayName}
                      onChange={(e) => updateHeader(section.id, 'displayName', e.target.value)}
                      placeholder={section.defaultName}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isActive}
                      onCheckedChange={(checked) => updateHeader(section.id, 'isActive', checked)}
                    />
                    <label className="text-sm">Section is active and visible</label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    {section.customId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReset(section)}
                        disabled={resetHeaderMutation.isPending}
                      >
                        <Undo className="w-4 h-4 mr-2" />
                        Reset to Default
                      </Button>
                    )}
                    <Button
                      onClick={() => handleSave(section)}
                      disabled={saveHeaderMutation.isPending || !isEdited}
                      className="bg-[#143A50] hover:bg-[#1E4F58]"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}