import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkbookSectionEditor() {
  const queryClient = useQueryClient();
  const [selectedSection, setSelectedSection] = useState(null);
  const [editMode, setEditMode] = useState('sections');

  // Form state for sections
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [sectionOrder, setSectionOrder] = useState(0);

  // Form state for pages
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSubtitle, setPageSubtitle] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pageType, setPageType] = useState('worksheet');
  const [pageOrder, setPageOrder] = useState(0);

  const { data: sections = [] } = useQuery({
    queryKey: ['workbook-sections'],
    queryFn: async () => {
      const results = await base44.entities.WorkbookSectionHeader.list();
      return results.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  });

  const { data: pages = [] } = useQuery({
    queryKey: ['workbook-pages', selectedSection?.id],
    queryFn: async () => {
      if (!selectedSection?.id) return [];
      const results = await base44.entities.WorkbookPageContent.filter({
        section_id: selectedSection.id
      });
      return results.sort((a, b) => (a.order || 0) - (b.order || 0));
    },
    enabled: !!selectedSection?.id
  });

  // Load section data when selected
  React.useEffect(() => {
    if (selectedSection) {
      setSectionTitle(selectedSection.title || '');
      setSectionDescription(selectedSection.description || '');
      setSectionOrder(selectedSection.order || 0);
    }
  }, [selectedSection]);

  // Load page data when selected
  React.useEffect(() => {
    if (selectedPage) {
      setPageTitle(selectedPage.title || '');
      setPageSubtitle(selectedPage.subtitle || '');
      setPageContent(selectedPage.content || '');
      setPageType(selectedPage.page_type || 'worksheet');
      setPageOrder(selectedPage.order || 0);
    }
  }, [selectedPage]);

  const saveSectionMutation = useMutation({
    mutationFn: async (data) => {
      if (selectedSection?.id) {
        return base44.entities.WorkbookSectionHeader.update(selectedSection.id, data);
      } else {
        return base44.entities.WorkbookSectionHeader.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workbook-sections']);
      toast.success('Section saved!');
      setSelectedSection(null);
    }
  });

  const savePageMutation = useMutation({
    mutationFn: async (data) => {
      if (selectedPage?.id) {
        return base44.entities.WorkbookPageContent.update(selectedPage.id, data);
      } else {
        return base44.entities.WorkbookPageContent.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workbook-pages']);
      toast.success('Page saved!');
      setSelectedPage(null);
    }
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.WorkbookSectionHeader.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workbook-sections']);
      toast.success('Section deleted!');
      setSelectedSection(null);
    }
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.WorkbookPageContent.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workbook-pages']);
      toast.success('Page deleted!');
      setSelectedPage(null);
    }
  });

  const handleSaveSection = () => {
    saveSectionMutation.mutate({
      title: sectionTitle,
      description: sectionDescription,
      order: sectionOrder
    });
  };

  const handleSavePage = () => {
    if (!selectedSection?.id) {
      toast.error('Select a section first');
      return;
    }

    savePageMutation.mutate({
      section_id: selectedSection.id,
      title: pageTitle,
      subtitle: pageSubtitle,
      content: pageContent,
      page_type: pageType,
      order: pageOrder
    });
  };

  const handleNewSection = () => {
    setSelectedSection({ new: true });
    setSectionTitle('');
    setSectionDescription('');
    setSectionOrder(sections.length);
  };

  const handleNewPage = () => {
    setSelectedPage({ new: true });
    setPageTitle('');
    setPageSubtitle('');
    setPageContent('');
    setPageType('worksheet');
    setPageOrder(pages.length);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Workbook Section Editor</h1>
          <p className="text-slate-600">Create and edit workbook sections and pages for IncubateHer</p>
        </div>

        <Tabs value={editMode} onValueChange={setEditMode}>
          <TabsList className="mb-6">
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
          </TabsList>

          {/* Sections Tab */}
          <TabsContent value="sections">
            <div className="grid grid-cols-12 gap-6">
              {/* Section List */}
              <div className="col-span-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Sections</CardTitle>
                    <Button size="sm" onClick={handleNewSection}>
                      <Plus className="w-4 h-4 mr-1" />
                      New
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setSelectedSection(section)}
                        className={`w-full text-left p-3 rounded-lg text-sm transition ${
                          selectedSection?.id === section.id
                            ? 'bg-[#143A50] text-white'
                            : 'hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs opacity-80 mt-1">Order: {section.order}</div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Section Editor */}
              <div className="col-span-8">
                {selectedSection ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>
                          {selectedSection.new ? 'New Section' : 'Edit Section'}
                        </CardTitle>
                        <div className="flex gap-2">
                          {!selectedSection.new && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm('Delete this section?')) {
                                  deleteSectionMutation.mutate(selectedSection.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button onClick={handleSaveSection}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Section Title</label>
                        <Input
                          value={sectionTitle}
                          onChange={(e) => setSectionTitle(e.target.value)}
                          placeholder="e.g., Program Overview"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Description</label>
                        <Textarea
                          value={sectionDescription}
                          onChange={(e) => setSectionDescription(e.target.value)}
                          placeholder="Brief description of this section"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Display Order</label>
                        <Input
                          type="number"
                          value={sectionOrder}
                          onChange={(e) => setSectionOrder(parseInt(e.target.value))}
                          min="0"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-96">
                      <div className="text-center text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-3" />
                        <p>Select a section or create a new one</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages">
            <div className="grid grid-cols-12 gap-6">
              {/* Section Selector */}
              <div className="col-span-12 mb-4">
                <Card>
                  <CardContent className="pt-6">
                    <label className="text-sm font-medium mb-2 block">Select Section</label>
                    <Select
                      value={selectedSection?.id || ''}
                      onValueChange={(value) => {
                        const section = sections.find(s => s.id === value);
                        setSelectedSection(section);
                        setSelectedPage(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a section..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>

              {selectedSection && (
                <>
                  {/* Page List */}
                  <div className="col-span-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Pages</CardTitle>
                        <Button size="sm" onClick={handleNewPage}>
                          <Plus className="w-4 h-4 mr-1" />
                          New
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                        {pages.map((page) => (
                          <button
                            key={page.id}
                            onClick={() => setSelectedPage(page)}
                            className={`w-full text-left p-3 rounded-lg text-sm transition ${
                              selectedPage?.id === page.id
                                ? 'bg-[#143A50] text-white'
                                : 'hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <div className="font-medium">{page.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {page.page_type}
                              </Badge>
                              <span className="text-xs opacity-80">Order: {page.order}</span>
                            </div>
                          </button>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Page Editor */}
                  <div className="col-span-8">
                    {selectedPage ? (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>
                              {selectedPage.new ? 'New Page' : 'Edit Page'}
                            </CardTitle>
                            <div className="flex gap-2">
                              {!selectedPage.new && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Delete this page?')) {
                                      deletePageMutation.mutate(selectedPage.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                              <Button onClick={handleSavePage}>
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Page Title</label>
                            <Input
                              value={pageTitle}
                              onChange={(e) => setPageTitle(e.target.value)}
                              placeholder="e.g., Mission Statement Worksheet"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Subtitle</label>
                            <Input
                              value={pageSubtitle}
                              onChange={(e) => setPageSubtitle(e.target.value)}
                              placeholder="Optional subtitle"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Page Type</label>
                            <Select value={pageType} onValueChange={setPageType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="worksheet">Worksheet</SelectItem>
                                <SelectItem value="handout">Handout</SelectItem>
                                <SelectItem value="tips">Tips</SelectItem>
                                <SelectItem value="consultation">Consultation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Content (Markdown/HTML)</label>
                            <Textarea
                              value={pageContent}
                              onChange={(e) => setPageContent(e.target.value)}
                              placeholder="Enter content in markdown or HTML format..."
                              rows={12}
                              className="font-mono text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Display Order</label>
                            <Input
                              type="number"
                              value={pageOrder}
                              onChange={(e) => setPageOrder(parseInt(e.target.value))}
                              min="0"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="flex items-center justify-center h-96">
                          <div className="text-center text-slate-400">
                            <FileText className="w-12 h-12 mx-auto mb-3" />
                            <p>Select a page or create a new one</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}