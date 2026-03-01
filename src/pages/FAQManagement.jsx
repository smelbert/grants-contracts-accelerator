import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  HelpCircle, Plus, Edit, Trash2, Eye, EyeOff, Search,
  ThumbsUp, ThumbsDown, GripVertical, ChevronDown, ChevronUp,
  Sparkles, Filter, BarChart2, BookOpen, Tag
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'incubateher_program', label: 'IncubateHer Program', color: 'bg-[#143A50] text-white' },
  { value: 'getting_started', label: 'Getting Started', color: 'bg-blue-100 text-blue-800' },
  { value: 'billing_payments', label: 'Billing & Payments', color: 'bg-green-100 text-green-800' },
  { value: 'coaching', label: 'Coaching', color: 'bg-purple-100 text-purple-800' },
  { value: 'features', label: 'Features', color: 'bg-amber-100 text-amber-800' },
  { value: 'technical', label: 'Technical', color: 'bg-slate-100 text-slate-700' },
  { value: 'subscriptions', label: 'Subscriptions', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'account_management', label: 'Account Management', color: 'bg-pink-100 text-pink-800' },
  { value: 'security', label: 'Security', color: 'bg-red-100 text-red-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700' },
];

const getCategoryMeta = (val) => CATEGORIES.find(c => c.value === val) || { label: val, color: 'bg-gray-100 text-gray-700' };

function FAQForm({ faq, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    question: faq?.question || '',
    answer: faq?.answer || '',
    category: faq?.category || 'incubateher_program',
    display_order: faq?.display_order ?? 0,
    is_published: faq?.is_published ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="question">Question *</Label>
        <Input
          id="question"
          value={form.question}
          onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
          placeholder="e.g. What is the IncubateHer program?"
          required
        />
      </div>
      <div>
        <Label htmlFor="answer">Answer *</Label>
        <Textarea
          id="answer"
          value={form.answer}
          onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
          rows={6}
          placeholder="Provide a clear, detailed answer..."
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={form.display_order}
            onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          checked={form.is_published}
          onCheckedChange={v => setForm(f => ({ ...f, is_published: v }))}
        />
        <Label>{form.is_published ? 'Published (visible to users)' : 'Draft (hidden from users)'}</Label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="bg-[#143A50] hover:bg-[#1E4F58]">
          {loading ? 'Saving...' : (faq ? 'Update FAQ' : 'Create FAQ')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function FAQRow({ faq, onEdit, onDelete, onTogglePublish }) {
  const [expanded, setExpanded] = useState(false);
  const cat = getCategoryMeta(faq.category);

  return (
    <div className={`border rounded-lg transition-all ${expanded ? 'shadow-md' : 'hover:shadow-sm'} ${!faq.is_published ? 'opacity-60 border-dashed' : 'border-slate-200'}`}>
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 text-sm truncate">{faq.question}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={`text-xs px-2 py-0 ${cat.color}`}>{cat.label}</Badge>
            {!faq.is_published && <Badge variant="outline" className="text-xs px-1.5 py-0">Draft</Badge>}
            {(faq.helpful_count > 0 || faq.not_helpful_count > 0) && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />{faq.helpful_count || 0}
                <ThumbsDown className="w-3 h-3 ml-1" />{faq.not_helpful_count || 0}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onEdit(faq)}>
            <Edit className="w-3.5 h-3.5 text-slate-500" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onTogglePublish(faq)}>
            {faq.is_published ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-green-600" />}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onDelete(faq)}>
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </Button>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mt-3">{faq.answer}</p>
          <p className="text-xs text-slate-400 mt-3">Order: {faq.display_order} · Views: {faq.view_count || 0}</p>
        </div>
      )}
    </div>
  );
}

function AnalyticsPanel({ faqs }) {
  const published = faqs.filter(f => f.is_published).length;
  const byCat = CATEGORIES.map(c => ({
    ...c,
    count: faqs.filter(f => f.category === c.value).length
  })).filter(c => c.count > 0);

  const topHelpful = [...faqs].sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0)).slice(0, 5);
  const topNotHelpful = [...faqs].sort((a, b) => (b.not_helpful_count || 0) - (a.not_helpful_count || 0)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total FAQs', value: faqs.length, color: '#143A50' },
          { label: 'Published', value: published, color: '#22c55e' },
          { label: 'Draft', value: faqs.length - published, color: '#f59e0b' },
          { label: 'Categories Used', value: byCat.length, color: '#AC1A5B' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">FAQs by Category</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {byCat.map(c => (
              <div key={c.value} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-36 truncate">{c.label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-[#143A50]"
                    style={{ width: `${faqs.length > 0 ? (c.count / faqs.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700 w-4 text-right">{c.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Most Helpful FAQs</CardTitle></CardHeader>
          <CardContent>
            {topHelpful.filter(f => (f.helpful_count || 0) > 0).length === 0 ? (
              <p className="text-slate-400 text-sm">No feedback data yet</p>
            ) : (
              <div className="space-y-2">
                {topHelpful.filter(f => (f.helpful_count || 0) > 0).map(f => (
                  <div key={f.id} className="flex items-center gap-2">
                    <ThumbsUp className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span className="text-xs text-slate-600 flex-1 truncate">{f.question}</span>
                    <span className="text-xs font-semibold text-green-600">{f.helpful_count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FAQManagement() {
  const queryClient = useQueryClient();
  const [editingFaq, setEditingFaq] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('manage');

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: faqs = [], isLoading } = useQuery({ queryKey: ['faqs'], queryFn: () => base44.entities.FAQItem.list() });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FAQItem.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['faqs']); toast.success('FAQ created'); setIsDialogOpen(false); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FAQItem.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['faqs']); toast.success('FAQ updated'); setIsDialogOpen(false); setEditingFaq(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FAQItem.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['faqs']); toast.success('FAQ deleted'); }
  });

  const handleSubmit = (formData) => {
    const data = { ...formData, last_updated_by: user?.email };
    if (editingFaq) {
      updateMutation.mutate({ id: editingFaq.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (faq) => { setEditingFaq(faq); setIsDialogOpen(true); };
  const handleDelete = (faq) => { if (window.confirm('Delete this FAQ?')) deleteMutation.mutate(faq.id); };
  const handleTogglePublish = (faq) => updateMutation.mutate({ id: faq.id, data: { ...faq, is_published: !faq.is_published } });

  const filteredFaqs = useMemo(() => faqs.filter(f => {
    const matchSearch = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || f.category === filterCat;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'published' ? f.is_published : !f.is_published);
    return matchSearch && matchCat && matchStatus;
  }).sort((a, b) => (a.display_order || 0) - (b.display_order || 0)), [faqs, search, filterCat, filterStatus]);

  const groupedByCategory = useMemo(() => {
    const groups = {};
    CATEGORIES.forEach(c => {
      const items = filteredFaqs.filter(f => f.category === c.value);
      if (items.length > 0) groups[c.value] = { meta: c, items };
    });
    return groups;
  }, [filteredFaqs]);

  if (user?.role !== 'admin') {
    return <div className="p-8"><Card><CardContent className="p-8 text-center text-slate-500">Admin access required.</CardContent></Card></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#143A50]" /> FAQ Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage FAQs across all programs and the platform</p>
        </div>
        <Button
          onClick={() => { setEditingFaq(null); setIsDialogOpen(true); }}
          className="bg-[#143A50] hover:bg-[#1E4F58]"
        >
          <Plus className="w-4 h-4 mr-2" /> Add FAQ
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manage"><BookOpen className="w-4 h-4 mr-1" /> Manage FAQs</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart2 className="w-4 h-4 mr-1" /> Analytics</TabsTrigger>
          <TabsTrigger value="incubateher"><Sparkles className="w-4 h-4 mr-1" /> IncubateHer FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="mt-4 space-y-4">
          {/* Filter Bar */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search FAQs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-48">
                <Tag className="w-4 h-4 mr-2 text-slate-400" /><SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36">
                <Filter className="w-4 h-4 mr-2 text-slate-400" /><SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-slate-400">{filteredFaqs.length} FAQ{filteredFaqs.length !== 1 ? 's' : ''} found</p>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : filteredFaqs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No FAQs found. Create your first one!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.values(groupedByCategory).map(({ meta, items }) => (
                <div key={meta.value}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${meta.color} text-xs`}>{meta.label}</Badge>
                    <span className="text-xs text-slate-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(faq => (
                      <FAQRow
                        key={faq.id}
                        faq={faq}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onTogglePublish={handleTogglePublish}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsPanel faqs={faqs} />
        </TabsContent>

        <TabsContent value="incubateher" className="mt-4">
          <IncubateHerFAQPreview faqs={faqs} />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingFaq(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
          </DialogHeader>
          <FAQForm
            faq={editingFaq}
            onSubmit={handleSubmit}
            onCancel={() => { setIsDialogOpen(false); setEditingFaq(null); }}
            loading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IncubateHerFAQPreview({ faqs }) {
  const [openItem, setOpenItem] = useState(null);
  const incubateherFaqs = faqs
    .filter(f => f.category === 'incubateher_program' && f.is_published)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const SEED_FAQS = [
    {
      question: "What is the IncubateHer Funding Readiness Program?",
      answer: "IncubateHer is a comprehensive funding readiness program designed specifically for women-led nonprofit organizations. Delivered in partnership with the Columbus Urban League, this program provides participants with the knowledge, tools, and resources to successfully pursue grant funding, government contracts, and other funding opportunities. The program includes live sessions, one-on-one consultations, workbook exercises, assessments, and access to curated templates and resources."
    },
    {
      question: "Who is eligible to participate in IncubateHer?",
      answer: "IncubateHer is open to women-led nonprofit organizations and social enterprises in the Columbus, Ohio region. Participants should be in active operation (not in the idea stage) and committed to attending all program sessions. Priority is given to organizations serving underrepresented communities."
    },
    {
      question: "How long is the IncubateHer program?",
      answer: "The IncubateHer program runs over several weeks and includes multiple live training sessions, self-paced learning modules, a one-on-one consultation with our lead consultant, and document submission requirements. Participants who complete all requirements receive a Certificate of Completion."
    },
    {
      question: "What do I need to complete to finish the program?",
      answer: "To complete the IncubateHer program and receive your Certificate of Completion, you must: (1) Attend the required live sessions, (2) Complete the Pre-Assessment and Post-Assessment, (3) Schedule and attend your one-on-one consultation, (4) Submit required organizational documents, and (5) Complete the assigned workbook exercises. Your completion tracker in the platform shows your progress."
    },
    {
      question: "What is the Pre-Assessment and why is it important?",
      answer: "The Pre-Assessment is a funding readiness evaluation you complete at the start of the program. It helps us understand your organization's current strengths and gaps so the program can be most useful to you. You'll also complete a Post-Assessment at the end of the program, and your score improvement reflects your growth in funding readiness."
    },
    {
      question: "How do I schedule my one-on-one consultation?",
      answer: "You can schedule your consultation through the 'Consultations' section in the IncubateHer portal. You'll be asked to provide 3 availability options, your preferred meeting format (online or in-person), and optionally share any documents you'd like reviewed in advance. Our team will confirm your appointment within 2 business days."
    },
    {
      question: "What documents do I need to upload?",
      answer: "Required documents typically include: organizational overview, IRS determination letter (501c3 letter), most recent annual budget, board roster, and any other governance documents. You can upload these from your Program Overview or profile section. If you don't have a document yet, the program will help you create it."
    },
    {
      question: "Is there a cost to participate in IncubateHer?",
      answer: "IncubateHer is funded in partnership with the Columbus Urban League and may be available at no cost to qualifying participants. Please check your enrollment confirmation or contact our team for cost details specific to your cohort."
    },
    {
      question: "Can I access the program materials after the program ends?",
      answer: "Yes! All participants retain access to their workbook responses, templates, and learning materials through the platform. Your completion certificate and assessment scores are also permanently accessible from your profile."
    },
    {
      question: "What happens if I miss a live session?",
      answer: "If you miss a session, please reach out to your facilitator as soon as possible. Some sessions may be recorded and available for replay. Attendance is tracked and required for program completion, so missing sessions may affect your eligibility for the Certificate of Completion and giveaway."
    },
    {
      question: "What is the giveaway and how do I qualify?",
      answer: "Participants who complete all program requirements (attendance, assessments, consultation, and document submission) become eligible for the IncubateHer giveaway. Eligible participants are entered into a pool and winners are selected at the conclusion of the program cohort. Details are shared during the program orientation."
    },
    {
      question: "How do I get support if I have a question or issue?",
      answer: "You can reach out through the Program Messaging feature in the portal to contact your facilitator directly. You can also use the Support section for technical issues. Our team typically responds within 1-2 business days."
    },
  ];

  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      for (const item of SEED_FAQS) {
        await base44.entities.FAQItem.create({
          ...item,
          category: 'incubateher_program',
          is_published: true,
          display_order: SEED_FAQS.indexOf(item),
          last_updated_by: user?.email,
        });
      }
      queryClient.invalidateQueries(['faqs']);
      toast.success(`Added ${SEED_FAQS.length} IncubateHer FAQs!`);
    } catch (e) {
      toast.error('Error seeding FAQs');
    }
    setSeeding(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-[#143A50]/30 bg-[#143A50]/5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-semibold text-[#143A50] flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> IncubateHer FAQ Section
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {incubateherFaqs.length > 0
                  ? `${incubateherFaqs.length} published FAQ${incubateherFaqs.length !== 1 ? 's' : ''} in the IncubateHer category`
                  : 'No IncubateHer FAQs published yet. Seed with our pre-written FAQ set to get started.'}
              </p>
            </div>
            {incubateherFaqs.length === 0 && (
              <Button onClick={handleSeed} disabled={seeding} className="bg-[#143A50] hover:bg-[#1E4F58]">
                <Sparkles className="w-4 h-4 mr-2" />
                {seeding ? 'Adding FAQs...' : 'Seed IncubateHer FAQs'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {incubateherFaqs.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 mb-3">Preview — as participants will see it</p>
          {incubateherFaqs.map((faq, idx) => (
            <div
              key={faq.id}
              className="border border-slate-200 rounded-lg overflow-hidden"
            >
              <button
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                onClick={() => setOpenItem(openItem === idx ? null : idx)}
              >
                <span className="font-medium text-slate-800 text-sm">{faq.question}</span>
                {openItem === idx ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              </button>
              {openItem === idx && (
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50 whitespace-pre-wrap">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 mb-3">Preview of pre-written IncubateHer FAQs (not yet saved)</p>
          {SEED_FAQS.map((faq, idx) => (
            <div key={idx} className="border border-dashed border-slate-300 rounded-lg overflow-hidden opacity-70">
              <div className="px-5 py-4 flex items-center justify-between gap-3">
                <span className="font-medium text-slate-700 text-sm">{faq.question}</span>
                <ChevronDown className="w-4 h-4 text-slate-300 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}