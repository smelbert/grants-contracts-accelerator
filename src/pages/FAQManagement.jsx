import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, Plus, Edit, Trash, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function FAQManagement() {
  const queryClient = useQueryClient();
  const [editingFaq, setEditingFaq] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: faqs = [] } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => base44.entities.FAQItem.list()
  });

  const createFaqMutation = useMutation({
    mutationFn: (data) => base44.entities.FAQItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['faqs']);
      toast.success('FAQ created');
      setIsDialogOpen(false);
    }
  });

  const updateFaqMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FAQItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['faqs']);
      toast.success('FAQ updated');
      setEditingFaq(null);
      setIsDialogOpen(false);
    }
  });

  const deleteFaqMutation = useMutation({
    mutationFn: (id) => base44.entities.FAQItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['faqs']);
      toast.success('FAQ deleted');
    }
  });

  const togglePublished = (faq) => {
    updateFaqMutation.mutate({
      id: faq.id,
      data: { ...faq, is_published: !faq.is_published }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      question: formData.get('question'),
      answer: formData.get('answer'),
      category: formData.get('category'),
      display_order: parseInt(formData.get('display_order') || 0),
      is_published: true,
      last_updated_by: user.email
    };

    if (editingFaq) {
      updateFaqMutation.mutate({ id: editingFaq.id, data });
    } else {
      createFaqMutation.mutate(data);
    }
  };

  const categories = [
    'getting_started',
    'billing_payments',
    'subscriptions',
    'features',
    'technical',
    'incubateher_program',
    'coaching',
    'account_management',
    'security',
    'other'
  ];

  const groupedFaqs = categories.reduce((acc, category) => {
    acc[category] = faqs.filter(f => f.category === category);
    return acc;
  }, {});

  if (user?.role !== 'admin') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">FAQ Management</h1>
          <p className="text-slate-600 mt-2">Manage frequently asked questions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingFaq(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  name="question"
                  defaultValue={editingFaq?.question}
                  required
                />
              </div>
              <div>
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  name="answer"
                  defaultValue={editingFaq?.answer}
                  rows={6}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={editingFaq?.category} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  name="display_order"
                  type="number"
                  defaultValue={editingFaq?.display_order || 0}
                />
              </div>
              <Button type="submit">
                {editingFaq ? 'Update FAQ' : 'Create FAQ'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All FAQs ({faqs.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({faqs.filter(f => f.is_published).length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({faqs.filter(f => !f.is_published).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {categories.map(category => {
            const categoryFaqs = groupedFaqs[category];
            if (categoryFaqs.length === 0) return null;

            return (
              <Card key={category} className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    {categoryFaqs.map((faq, idx) => (
                      <AccordionItem key={faq.id} value={`faq-${idx}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-3 flex-1">
                            <span>{faq.question}</span>
                            {!faq.is_published && (
                              <Badge variant="outline">Draft</Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <p className="text-slate-700">{faq.answer}</p>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingFaq(faq);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => togglePublished(faq)}
                              >
                                {faq.is_published ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Publish
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Delete this FAQ?')) {
                                    deleteFaqMutation.mutate(faq.id);
                                  }
                                }}
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          <div className="space-y-4">
            {faqs.filter(f => f.is_published).map((faq) => (
              <Card key={faq.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{faq.question}</h3>
                      <p className="text-slate-700 mb-3">{faq.answer}</p>
                      <Badge variant="outline">{faq.category.replace(/_/g, ' ')}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingFaq(faq);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="draft" className="mt-6">
          <div className="space-y-4">
            {faqs.filter(f => !f.is_published).map((faq) => (
              <Card key={faq.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{faq.question}</h3>
                      <p className="text-slate-700 mb-3">{faq.answer}</p>
                      <Badge variant="outline">{faq.category.replace(/_/g, ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublished(faq)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Publish
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingFaq(faq);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}