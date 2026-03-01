import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, Plus, Search, Eye, Save, X, Upload, ImageIcon, Sparkles } from 'lucide-react';
import moment from 'moment';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BlogAIAssistant from '@/components/blog/BlogAIAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EMPTY_POST = {
  title: '', slug: '', excerpt: '', content: '', category: '',
  author_name: 'Dr. Shawnte Elbert', author_email: 'shawnte@elbertinnovativesolutions.org',
  status: 'draft', featured_image: '', tags: []
};

export default function BlogManagement() {
  const [search, setSearch] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 100)
  });

  const saveMutation = useMutation({
    mutationFn: async (post) => {
      if (post.id) {
        return await base44.entities.BlogPost.update(post.id, post);
      } else {
        return await base44.entities.BlogPost.create(post);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      setIsDialogOpen(false);
      setEditingPost(null);
      toast.success('Blog post saved!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Post deleted');
    }
  });

  const bulkUpdateAuthorMutation = useMutation({
    mutationFn: async () => {
      const wrong = posts.filter(p => p.author_name !== 'Dr. Shawnte Elbert');
      await Promise.all(wrong.map(p => base44.entities.BlogPost.update(p.id, {
        author_name: 'Dr. Shawnte Elbert',
        author_email: 'shawnte@elbertinnovativesolutions.org'
      })));
      return wrong.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success(`Updated ${count} post(s) to Dr. Shawnte Elbert`);
    }
  });

  const openNew = () => {
    setEditingPost({ ...EMPTY_POST });
    setIsDialogOpen(true);
  };

  const openEdit = (post) => {
    setEditingPost({ ...post });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingPost.title || !editingPost.slug) {
      toast.error('Title and slug are required');
      return;
    }
    const toSave = {
      ...editingPost,
      published_date: editingPost.status === 'published' && !editingPost.published_date
        ? new Date().toISOString()
        : editingPost.published_date
    };
    saveMutation.mutate(toSave);
  };

  const autoSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleAIResult = (result) => {
    setEditingPost(prev => ({
      ...prev,
      title: result.title || prev.title,
      excerpt: result.excerpt || prev.excerpt,
      content: result.content || result.refined_content || prev.content,
      seo_title: result.seo_title || prev.seo_title,
      seo_description: result.seo_description || prev.seo_description,
      tags: result.tags || result.suggested_tags || prev.tags,
      category: result.category || prev.category,
    }));
  };

  const filtered = posts.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.author_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const wrongAuthor = posts.filter(p => p.author_name !== 'Dr. Shawnte Elbert');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#143A50]">Blog Management</h1>
          <p className="text-slate-500 text-sm mt-1">{posts.length} posts total</p>
        </div>
        <div className="flex gap-2">
          {wrongAuthor.length > 0 && (
            <Button
              variant="outline"
              onClick={() => bulkUpdateAuthorMutation.mutate()}
              disabled={bulkUpdateAuthorMutation.isPending}
              className="border-[#AC1A5B] text-[#AC1A5B] hover:bg-[#AC1A5B] hover:text-white"
            >
              Fix {wrongAuthor.length} Author Name(s) → Dr. Shawnte Elbert
            </Button>
          )}
          <Button onClick={openNew} className="bg-[#143A50] hover:bg-[#1E4F58]">
            <Plus className="w-4 h-4 mr-2" /> New Post
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Posts Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Author</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">No posts found</td></tr>
              ) : filtered.map(post => (
                <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 line-clamp-1">{post.title}</p>
                    <p className="text-xs text-slate-400 font-mono">{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={post.author_name !== 'Dr. Shawnte Elbert' ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                      {post.author_name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {post.category ? (
                      <Badge variant="outline" className="text-xs">{post.category}</Badge>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {post.published_date ? moment(post.published_date).format('MMM D, YYYY') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {post.slug && (
                        <Link to={createPageUrl('BlogPost') + '?slug=' + post.slug} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(post)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => { if (confirm('Delete this post?')) deleteMutation.mutate(post.id); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) { setIsDialogOpen(false); setEditingPost(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost?.id ? 'Edit Post' : 'New Post'}</DialogTitle>
          </DialogHeader>
          {editingPost && (
            <div className="space-y-4 pt-2">
              <div>
                <Label>Title *</Label>
                <Input
                  value={editingPost.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setEditingPost(prev => ({
                      ...prev,
                      title,
                      slug: prev.slug || autoSlug(title)
                    }));
                  }}
                  placeholder="Post title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Slug *</Label>
                  <Input
                    value={editingPost.slug}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={editingPost.category || ''}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g. Education, Grants"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Author Name</Label>
                  <Input
                    value={editingPost.author_name || ''}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, author_name: e.target.value }))}
                    placeholder="Dr. Shawnte Elbert"
                  />
                </div>
                <div>
                  <Label>Author Email</Label>
                  <Input
                    value={editingPost.author_email || ''}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, author_email: e.target.value }))}
                    placeholder="author@email.com"
                  />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={editingPost.status}
                  onValueChange={(v) => setEditingPost(prev => ({ ...prev, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Featured Image</Label>
                <div className="space-y-2 mt-1">
                  {editingPost.featured_image && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={editingPost.featured_image}
                        alt="Featured"
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setEditingPost(prev => ({ ...prev, featured_image: '' }))}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <label className="flex-1">
                      <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <Upload className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {editingPost._uploading ? 'Uploading...' : 'Upload image'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={editingPost._uploading}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setEditingPost(prev => ({ ...prev, _uploading: true }));
                          const { file_url } = await base44.integrations.Core.UploadFile({ file });
                          setEditingPost(prev => ({ ...prev, featured_image: file_url, _uploading: false }));
                          toast.success('Image uploaded!');
                        }}
                      />
                    </label>
                    <span className="text-xs text-slate-400">or</span>
                    <Input
                      value={editingPost.featured_image || ''}
                      onChange={(e) => setEditingPost(prev => ({ ...prev, featured_image: e.target.value }))}
                      placeholder="Paste image URL..."
                      className="flex-1 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Excerpt</Label>
                <Textarea
                  value={editingPost.excerpt || ''}
                  onChange={(e) => setEditingPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief summary of the post..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Content (HTML)</Label>
                <Textarea
                  value={editingPost.content || ''}
                  onChange={(e) => setEditingPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Full post content (HTML supported)..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditingPost(null); }}>
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="bg-[#143A50] hover:bg-[#1E4F58]"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {saveMutation.isPending ? 'Saving...' : 'Save Post'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}