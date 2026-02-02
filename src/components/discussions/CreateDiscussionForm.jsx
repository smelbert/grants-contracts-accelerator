import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CreateDiscussionForm({ open, onOpenChange, userEmail, userName, spaceId }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Discussion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      onOpenChange(false);
      setFormData({ title: '', content: '', category: 'general' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      title: formData.title,
      content: formData.content,
      author_email: userEmail,
      author_name: userName || userEmail.split('@')[0],
      category: formData.category,
      space_id: spaceId || null,
      total_likes: 0,
      total_replies: 0,
      is_pinned: false
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Start a Discussion</DialogTitle>
          <DialogDescription>Share your thoughts, ask questions, or spark conversations with the community</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="title" className="text-base font-semibold">Discussion Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What would you like to discuss?"
              className="mt-2 h-11"
              required
            />
          </div>
          <div>
            <Label htmlFor="category" className="text-base font-semibold">Category</Label>
            <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
              <SelectTrigger className="mt-2 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">💬 General Discussion</SelectItem>
                <SelectItem value="grants">📝 Grants & Funding</SelectItem>
                <SelectItem value="contracts">📋 Contracts & RFPs</SelectItem>
                <SelectItem value="donors">🤝 Donor Relations</SelectItem>
                <SelectItem value="strategy">🎯 Strategy & Planning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="content" className="text-base font-semibold">Your Message</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share your thoughts, questions, or insights with the community..."
              className="mt-2 h-40 resize-none"
              required
            />
            <p className="text-xs text-slate-500 mt-2">
              Be respectful and constructive in your discussion
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              className="bg-[#143A50] hover:bg-[#1E4F58] min-w-[120px]"
            >
              {createMutation.isPending ? 'Posting...' : 'Post Discussion'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}