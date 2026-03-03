import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Star, CheckCircle, XCircle, EyeOff, TrendingUp, Send, MessageSquare,
  Search, Filter, Mail, Users, Award, BarChart2, Copy, Trash2, Edit2, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PROGRAM_LABELS = {
  incubateher: 'IncubateHer',
  coaching: 'Coaching',
  boutique_services: 'Boutique Services',
  learning_hub: 'Learning Hub',
  general: 'General',
};

const PROGRAM_COLORS = {
  incubateher: '#143A50',
  coaching: '#AC1A5B',
  boutique_services: '#E5C089',
  learning_hub: '#1E4F58',
  general: '#A65D40',
};

function StarRating({ rating, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial, onApprove, onReject, onToggleFeatured, onDelete, showActions = 'pending' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(testimonial.testimonial_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={`transition-all ${testimonial.is_featured ? 'border-yellow-300 bg-yellow-50/30' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-600 flex-shrink-0">
              {(testimonial.user_name || '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{testimonial.user_name || 'Anonymous'}</p>
              {testimonial.organization_name && (
                <p className="text-xs text-slate-500">{testimonial.organization_name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Badge variant="outline" className="text-xs">
              {PROGRAM_LABELS[testimonial.program_type] || testimonial.program_type}
            </Badge>
            {testimonial.is_featured && <Badge className="bg-yellow-500 text-white text-xs">⭐ Featured</Badge>}
            {testimonial.admin_approved && <Badge className="bg-green-600 text-white text-xs">Approved</Badge>}
          </div>
        </div>

        <StarRating rating={testimonial.rating || 0} />

        <blockquote className="mt-3 text-slate-700 text-sm leading-relaxed border-l-4 border-slate-200 pl-3 italic">
          "{testimonial.testimonial_text}"
        </blockquote>

        <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-slate-400">
            {new Date(testimonial.submitted_date || testimonial.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs text-slate-500">
              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
            </Button>

            {showActions === 'pending' && (
              <>
                <Button size="sm" onClick={() => onApprove(testimonial)} className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => onReject(testimonial)} className="h-7 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50">
                  <XCircle className="w-3 h-3 mr-1" /> Reject
                </Button>
              </>
            )}

            {(showActions === 'approved' || showActions === 'featured') && (
              <Button size="sm" variant="outline" onClick={() => onToggleFeatured(testimonial)} className="h-7 px-3 text-xs">
                {testimonial.is_featured ? (
                  <><EyeOff className="w-3 h-3 mr-1" /> Unfeature</>
                ) : (
                  <><Star className="w-3 h-3 mr-1" /> Feature</>
                )}
              </Button>
            )}

            <Button size="sm" variant="ghost" onClick={() => onDelete(testimonial)} className="h-7 px-2 text-xs text-red-400 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeedbackRequestPanel() {
  const [form, setForm] = useState({
    to: '',
    program_type: 'incubateher',
    custom_message: '',
  });
  const [sending, setSending] = useState(false);

  const { data: enrollments } = useQuery({
    queryKey: ['enrollments-for-feedback'],
    queryFn: () => base44.entities.ProgramEnrollment.list()
  });

  const cohortEmails = React.useMemo(() => {
    if (!enrollments) return [];
    return [...new Set(enrollments.filter(e => e.participant_email).map(e => e.participant_email))];
  }, [enrollments]);

  const handleSendRequest = async () => {
    if (!form.to) { toast.error('Please enter at least one email'); return; }
    setSending(true);
    const emails = form.to.split(',').map(e => e.trim()).filter(Boolean);
    const appUrl = window.location.origin;
    const feedbackLink = `${appUrl}/feedback-form?program=${form.program_type}`;

    try {
      for (const email of emails) {
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: `Share Your Experience — We'd Love Your Feedback!`,
          body: `
Hi there,

Thank you for being part of our ${PROGRAM_LABELS[form.program_type]} program. Your experience matters to us and helps us serve future participants better.

${form.custom_message ? form.custom_message + '\n\n' : ''}We'd love it if you could take a moment to share your feedback and leave a testimonial:

${feedbackLink}

It only takes 2 minutes, and your story could inspire someone else on their journey.

Thank you for your continued support!

Warm regards,
Elbert Innovative Solutions
          `.trim()
        });
      }
      toast.success(`Feedback request sent to ${emails.length} recipient${emails.length > 1 ? 's' : ''}`);
      setForm({ to: '', program_type: 'incubateher', custom_message: '' });
    } catch (err) {
      toast.error('Failed to send feedback request');
    }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#143A50]" />
            Send Feedback Request
          </CardTitle>
          <CardDescription>Email participants to request testimonials and feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Program</label>
            <Select value={form.program_type} onValueChange={v => setForm(f => ({ ...f, program_type: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROGRAM_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Recipient Emails <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <Textarea
              placeholder="participant@email.com, another@email.com"
              value={form.to}
              onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
              rows={3}
            />
          </div>

          {cohortEmails.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Quick fill from cohort ({cohortEmails.length} participants):</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => setForm(f => ({ ...f, to: cohortEmails.join(', ') }))}
                >
                  <Users className="w-3 h-3 mr-1" /> All Participants
                </Button>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Custom Message <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <Textarea
              placeholder="Add a personal note to include in the email..."
              value={form.custom_message}
              onChange={e => setForm(f => ({ ...f, custom_message: e.target.value }))}
              rows={3}
            />
          </div>

          <Button onClick={handleSendRequest} disabled={sending} className="w-full bg-[#143A50] hover:bg-[#1E4F58]">
            <Send className="w-4 h-4 mr-2" />
            {sending ? 'Sending...' : 'Send Feedback Requests'}
          </Button>
        </CardContent>
      </Card>

      {/* Testimonial link preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Testimonial Submission Link</CardTitle>
          <CardDescription>Share this link directly with participants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <code className="text-xs text-slate-600 flex-1 truncate">{window.location.origin}/#/SubmitTestimonial</code>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/#/SubmitTestimonial`);
                toast.success('Link copied!');
              }}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsPanel({ testimonials }) {
  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((s, t) => s + (t.rating || 0), 0) / testimonials.length).toFixed(1)
    : 0;

  const byProgram = Object.entries(PROGRAM_LABELS).map(([key, label]) => ({
    name: label,
    count: testimonials.filter(t => t.program_type === key).length,
    fill: PROGRAM_COLORS[key],
  })).filter(d => d.count > 0);

  const ratingDist = [1, 2, 3, 4, 5].map(r => ({
    name: `${r}★`,
    count: testimonials.filter(t => t.rating === r).length,
  }));

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Testimonials', value: testimonials.length, color: '#143A50' },
          { label: 'Avg Rating', value: `${avgRating} / 5`, color: '#E5C089' },
          { label: 'Approved', value: testimonials.filter(t => t.admin_approved).length, color: '#22c55e' },
          { label: 'Featured', value: testimonials.filter(t => t.is_featured).length, color: '#f59e0b' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">By Program</CardTitle></CardHeader>
          <CardContent>
            {byProgram.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byProgram}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {byProgram.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-300 text-sm">No data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Rating Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ratingDist}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#E5C089" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TestimonialManagement() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => base44.entities.Testimonial.list()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Testimonial.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['testimonials'] }); toast.success('Updated'); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Testimonial.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['testimonials'] }); toast.success('Deleted'); }
  });

  const handleApprove = (t) => updateMutation.mutate({ id: t.id, data: { ...t, admin_approved: true } });
  const handleReject = (t) => updateMutation.mutate({ id: t.id, data: { ...t, admin_approved: false, approved_for_website: false } });
  const handleToggleFeatured = (t) => updateMutation.mutate({ id: t.id, data: { ...t, is_featured: !t.is_featured } });
  const handleDelete = (t) => { if (window.confirm('Delete this testimonial?')) deleteMutation.mutate(t.id); };

  const applyFilters = (list) => list.filter(t => {
    const matchSearch = !search || (t.user_name || '').toLowerCase().includes(search.toLowerCase()) || (t.testimonial_text || '').toLowerCase().includes(search.toLowerCase());
    const matchProgram = filterProgram === 'all' || t.program_type === filterProgram;
    return matchSearch && matchProgram;
  });

  const pending = applyFilters(testimonials.filter(t => !t.admin_approved));
  const approved = applyFilters(testimonials.filter(t => t.admin_approved));
  const featured = applyFilters(testimonials.filter(t => t.is_featured));

  if (user?.role !== 'admin') {
    return (
      <div className="p-8">
        <Card><CardContent className="p-8 text-center text-slate-500">Admin access required.</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Testimonial Management</h1>
          <p className="text-slate-500 text-sm mt-1">Collect, review, and showcase participant testimonials</p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="pending">
            Pending
            {testimonials.filter(t => !t.admin_approved).length > 0 && (
              <Badge className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0 h-4">{testimonials.filter(t => !t.admin_approved).length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved ({testimonials.filter(t => t.admin_approved).length})</TabsTrigger>
          <TabsTrigger value="featured">Featured ({testimonials.filter(t => t.is_featured).length})</TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart2 className="w-4 h-4 mr-1" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="request">
            <Send className="w-4 h-4 mr-1" /> Request Feedback
          </TabsTrigger>
        </TabsList>

        {/* Shared filter bar */}
        {['pending', 'approved', 'featured'].includes(selectedTab) && (
          <div className="mt-4 flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search testimonials..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger className="w-44">
                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="All programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {Object.entries(PROGRAM_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <TabsContent value="pending" className="mt-4">
          {pending.length === 0 ? (
            <Card><CardContent className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-500">No testimonials pending review</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {pending.map(t => (
                <TestimonialCard key={t.id} testimonial={t} onApprove={handleApprove} onReject={handleReject} onToggleFeatured={handleToggleFeatured} onDelete={handleDelete} showActions="pending" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          {approved.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-slate-400">No approved testimonials yet</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {approved.map(t => (
                <TestimonialCard key={t.id} testimonial={t} onApprove={handleApprove} onReject={handleReject} onToggleFeatured={handleToggleFeatured} onDelete={handleDelete} showActions="approved" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured" className="mt-4">
          {featured.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-slate-400">No featured testimonials. Feature approved ones from the Approved tab.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {featured.map(t => (
                <TestimonialCard key={t.id} testimonial={t} onApprove={handleApprove} onReject={handleReject} onToggleFeatured={handleToggleFeatured} onDelete={handleDelete} showActions="featured" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsPanel testimonials={testimonials} />
        </TabsContent>

        <TabsContent value="request" className="mt-4">
          <FeedbackRequestPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}