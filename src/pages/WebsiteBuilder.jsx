import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Layout, Plus, Eye, Settings, FileText, Palette, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill';

export default function WebsiteBuilderPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pages');
  const [showPageDialog, setShowPageDialog] = useState(false);
  const [showBlogDialog, setShowBlogDialog] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);

  const [pageForm, setPageForm] = useState({
    page_name: '',
    slug: '',
    page_title: '',
    hero_section: {
      headline: '',
      subheadline: '',
      cta_text: '',
      cta_url: '',
      background_image: '',
    },
    sections: [],
    is_published: false,
  });

  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    featured_image: '',
    status: 'draft',
  });

  const [themeForm, setThemeForm] = useState({
    theme_name: 'My Theme',
    primary_color: '#10b981',
    secondary_color: '#0ea5e9',
    font_family: 'Inter',
    layout_style: 'modern',
    header_style: 'centered',
    navigation_position: 'top',
  });

  const { data: pages = [] } = useQuery({
    queryKey: ['landing-pages'],
    queryFn: () => base44.entities.LandingPage.list(),
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.list('-published_date'),
  });

  const { data: themes = [] } = useQuery({
    queryKey: ['website-themes'],
    queryFn: () => base44.entities.WebsiteTheme.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-landing'],
    queryFn: () => base44.entities.LearningContent.filter({ content_type: 'course' }),
  });

  const savePageMutation = useMutation({
    mutationFn: (data) => {
      if (editingPage) {
        return base44.entities.LandingPage.update(editingPage.id, data);
      }
      return base44.entities.LandingPage.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['landing-pages']);
      setShowPageDialog(false);
      setEditingPage(null);
      toast.success('Landing page saved!');
    },
  });

  const saveBlogMutation = useMutation({
    mutationFn: (data) => {
      const blogData = {
        ...data,
        author_email: user.email,
        author_name: user.full_name,
        published_date: data.status === 'published' ? new Date().toISOString() : null,
      };
      if (editingBlog) {
        return base44.entities.BlogPost.update(editingBlog.id, blogData);
      }
      return base44.entities.BlogPost.create(blogData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['blog-posts']);
      setShowBlogDialog(false);
      setEditingBlog(null);
      toast.success('Blog post saved!');
    },
  });

  const saveThemeMutation = useMutation({
    mutationFn: (data) => base44.entities.WebsiteTheme.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['website-themes']);
      setShowThemeDialog(false);
      toast.success('Theme saved!');
    },
  });

  const handleNewPage = () => {
    setPageForm({
      page_name: '',
      slug: '',
      page_title: '',
      hero_section: { headline: '', subheadline: '', cta_text: '', cta_url: '', background_image: '' },
      sections: [],
      is_published: false,
    });
    setEditingPage(null);
    setShowPageDialog(true);
  };

  const handleNewBlog = () => {
    setBlogForm({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      category: '',
      tags: [],
      featured_image: '',
      status: 'draft',
    });
    setEditingBlog(null);
    setShowBlogDialog(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Layout className="w-8 h-8 text-indigo-600" />
              Website Builder
            </h1>
            <p className="text-slate-600 mt-2">Build custom landing pages, blog, and customize your website</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pages">
              <Layout className="w-4 h-4 mr-2" />
              Landing Pages
            </TabsTrigger>
            <TabsTrigger value="blog">
              <BookOpen className="w-4 h-4 mr-2" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="themes">
              <Palette className="w-4 h-4 mr-2" />
              Themes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages">
            <div className="flex justify-end mb-4">
              <Button onClick={handleNewPage}>
                <Plus className="w-4 h-4 mr-2" />
                New Landing Page
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {pages.map(page => (
                <Card key={page.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{page.page_name}</CardTitle>
                      {page.is_published && <Badge className="bg-green-500">Published</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">/{page.slug}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingPage(page);
                        setPageForm(page);
                        setShowPageDialog(true);
                      }}>
                        <Settings className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blog">
            <div className="flex justify-end mb-4">
              <Button onClick={handleNewBlog}>
                <Plus className="w-4 h-4 mr-2" />
                New Blog Post
              </Button>
            </div>
            <div className="space-y-4">
              {blogPosts.map(post => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{post.excerpt}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{post.category}</Badge>
                          <Badge className={post.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {post.status}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingBlog(post);
                        setBlogForm(post);
                        setShowBlogDialog(true);
                      }}>
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="themes">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowThemeDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Theme
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {themes.map(theme => (
                <Card key={theme.id}>
                  <CardHeader>
                    <CardTitle>{theme.theme_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.primary_color }} />
                        <span className="text-sm">Primary: {theme.primary_color}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.secondary_color }} />
                        <span className="text-sm">Secondary: {theme.secondary_color}</span>
                      </div>
                      <p className="text-sm text-slate-600">Layout: {theme.layout_style}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Page Editor Dialog */}
        <Dialog open={showPageDialog} onOpenChange={setShowPageDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? 'Edit' : 'Create'} Landing Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Page Name</label>
                  <Input
                    value={pageForm.page_name}
                    onChange={(e) => setPageForm({ ...pageForm, page_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">URL Slug</label>
                  <Input
                    value={pageForm.slug}
                    onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Page Title</label>
                <Input
                  value={pageForm.page_title}
                  onChange={(e) => setPageForm({ ...pageForm, page_title: e.target.value })}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Hero Section</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Headline"
                    value={pageForm.hero_section.headline}
                    onChange={(e) => setPageForm({
                      ...pageForm,
                      hero_section: { ...pageForm.hero_section, headline: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="Subheadline"
                    value={pageForm.hero_section.subheadline}
                    onChange={(e) => setPageForm({
                      ...pageForm,
                      hero_section: { ...pageForm.hero_section, subheadline: e.target.value }
                    })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="CTA Button Text"
                      value={pageForm.hero_section.cta_text}
                      onChange={(e) => setPageForm({
                        ...pageForm,
                        hero_section: { ...pageForm.hero_section, cta_text: e.target.value }
                      })}
                    />
                    <Input
                      placeholder="CTA URL"
                      value={pageForm.hero_section.cta_url}
                      onChange={(e) => setPageForm({
                        ...pageForm,
                        hero_section: { ...pageForm.hero_section, cta_url: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={pageForm.is_published}
                  onChange={(e) => setPageForm({ ...pageForm, is_published: e.target.checked })}
                />
                <label className="text-sm">Publish page</label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPageDialog(false)}>Cancel</Button>
                <Button onClick={() => savePageMutation.mutate(pageForm)}>Save Page</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Blog Editor Dialog */}
        <Dialog open={showBlogDialog} onOpenChange={setShowBlogDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBlog ? 'Edit' : 'Create'} Blog Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={blogForm.slug}
                  onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <ReactQuill
                  value={blogForm.content}
                  onChange={(content) => setBlogForm({ ...blogForm, content })}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Excerpt</label>
                <Textarea
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={blogForm.status} onValueChange={(v) => setBlogForm({ ...blogForm, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowBlogDialog(false)}>Cancel</Button>
                <Button onClick={() => saveBlogMutation.mutate(blogForm)}>Save Post</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Theme Creator Dialog */}
        <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Theme</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Theme Name</label>
                <Input
                  value={themeForm.theme_name}
                  onChange={(e) => setThemeForm({ ...themeForm, theme_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Primary Color</label>
                  <Input
                    type="color"
                    value={themeForm.primary_color}
                    onChange={(e) => setThemeForm({ ...themeForm, primary_color: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Secondary Color</label>
                  <Input
                    type="color"
                    value={themeForm.secondary_color}
                    onChange={(e) => setThemeForm({ ...themeForm, secondary_color: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Layout Style</label>
                <Select value={themeForm.layout_style} onValueChange={(v) => setThemeForm({ ...themeForm, layout_style: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowThemeDialog(false)}>Cancel</Button>
                <Button onClick={() => saveThemeMutation.mutate(themeForm)}>Create Theme</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}