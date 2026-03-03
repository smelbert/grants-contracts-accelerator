import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Save, Trash2, ExternalLink, Calendar, DollarSign, TrendingUp, Target, Clock, CheckCircle2, BarChart3, Building2, AlertCircle, Bookmark, BookmarkCheck, EyeOff, X, MapPin, Users, FileText, Award, Pencil, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import QuickPasteOpportunity from '@/components/opportunities/QuickPasteOpportunity';
import { createPageUrl } from '@/utils';

export default function GrantSubmissionPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [savedGrants, setSavedGrants] = useState(() => {
    const saved = localStorage.getItem('savedGrants');
    return saved ? JSON.parse(saved) : [];
  });
  const [hiddenGrants, setHiddenGrants] = useState(() => {
    const hidden = localStorage.getItem('hiddenGrants');
    return hidden ? JSON.parse(hidden) : [];
  });
  const [viewMode, setViewMode] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    project_category: '',
    funder_name: '',
    type: 'grant',
    funding_lane: 'grants',
    amount_min: '',
    amount_max: '',
    deadline_loi: '',
    deadline_pre: '',
    deadline_full: '',
    deadline: '',
    rolling_deadline: false,
    status: 'researching',
    description: '',
    eligibility_summary: '',
    application_url: '',
    geographic_focus: '',
    internal_notes: '',
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: grants = [], isLoading } = useQuery({
    queryKey: ['funding-opportunities'],
    queryFn: () => base44.entities.FundingOpportunity.list('-created_date')
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list()
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const createGrantMutation = useMutation({
    mutationFn: async (grantData) => {
      const grant = await base44.entities.FundingOpportunity.create(grantData);
      
      // Notify all active organizations
      if (organizations?.length > 0) {
        const notificationPromises = organizations.map(org => 
          base44.entities.TeamMessage.create({
            organization_id: org.id,
            message: `📢 New Grant Opportunity: ${grantData.title} - Deadline: ${grantData.deadline ? format(new Date(grantData.deadline), 'MMM d, yyyy') : 'Rolling'}. Check the Grant Dashboard!`,
            sender_name: 'Grant Team',
            sender_email: 'grants@system',
            is_pinned: true
          })
        );
        await Promise.all(notificationPromises);
      }
      
      return grant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding-opportunities'] });
      setShowForm(false);
      setFormData({
        title: '',
        project_category: '',
        funder_name: '',
        type: 'grant',
        funding_lane: 'grants',
        amount_min: '',
        amount_max: '',
        deadline_loi: '',
        deadline_pre: '',
        deadline_full: '',
        deadline: '',
        rolling_deadline: false,
        status: 'researching',
        description: '',
        eligibility_summary: '',
        application_url: '',
        geographic_focus: '',
        internal_notes: '',
        is_active: true
      });
    }
  });

  const deleteGrantMutation = useMutation({
    mutationFn: (id) => base44.entities.FundingOpportunity.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding-opportunities'] });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createGrantMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSave = (grantId) => {
    setSavedGrants(prev => {
      const updated = prev.includes(grantId) 
        ? prev.filter(id => id !== grantId)
        : [...prev, grantId];
      localStorage.setItem('savedGrants', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleHide = (grantId) => {
    setHiddenGrants(prev => {
      const updated = prev.includes(grantId)
        ? prev.filter(id => id !== grantId)
        : [...prev, grantId];
      localStorage.setItem('hiddenGrants', JSON.stringify(updated));
      return updated;
    });
    setSelectedGrant(null);
  };

  const filteredGrantsByView = grants?.filter(g => {
    if (hiddenGrants.includes(g.id) && viewMode !== 'hidden') return false;
    if (viewMode === 'saved') return savedGrants.includes(g.id);
    if (viewMode === 'hidden') return hiddenGrants.includes(g.id);
    return true;
  }) || [];

  const grantStats = {
    total: grants.length,
    saved: savedGrants.length,
    hidden: hiddenGrants.length,
    byStatus: {
      researching: grants.filter(g => g.status === 'researching').length,
      drafting: grants.filter(g => g.status === 'drafting').length,
      submitted: grants.filter(g => g.status === 'submitted').length,
      awarded: grants.filter(g => g.status === 'awarded').length
    },
    byType: {
      grant: grants.filter(g => g.type === 'grant').length,
      rfp: grants.filter(g => g.type === 'rfp').length,
      rfq: grants.filter(g => g.type === 'rfq').length,
      contract: grants.filter(g => g.type === 'contract').length
    },
    totalFunding: grants.reduce((sum, g) => sum + (parseFloat(g.amount_max || 0)), 0)
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Funding Opportunities</h1>
              <p className="text-slate-600">Discover and manage grants, RFPs, and contracts</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? 'Cancel' : 'Add Opportunity'}
            </Button>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('all')}
              className={viewMode === 'all' ? 'bg-emerald-600' : ''}
            >
              All ({grantStats.total - grantStats.hidden})
            </Button>
            <Button
              variant={viewMode === 'saved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('saved')}
              className={viewMode === 'saved' ? 'bg-emerald-600' : ''}
            >
              <BookmarkCheck className="w-3 h-3 mr-1" />
              Saved ({grantStats.saved})
            </Button>
            <Button
              variant={viewMode === 'hidden' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('hidden')}
              className={viewMode === 'hidden' ? 'bg-emerald-600' : ''}
            >
              <EyeOff className="w-3 h-3 mr-1" />
              Hidden ({grantStats.hidden})
            </Button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Opportunities</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{grantStats.total}</p>
                </div>
                <Target className="w-10 h-10 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Research</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{grantStats.byStatus.researching}</p>
                </div>
                <Clock className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Progress</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">{grantStats.byStatus.drafting}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Awarded</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{grantStats.byStatus.awarded}</p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-slate-600">Total Funding Potential</p>
                  <p className="text-xl font-bold text-slate-900">
                    ${(grantStats.totalFunding / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-600 mb-2">By Type</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{grantStats.byType.grant} Grants</Badge>
                  <Badge variant="outline">{grantStats.byType.rfp} RFPs</Badge>
                  <Badge variant="outline">{grantStats.byType.rfq} RFQs</Badge>
                  <Badge variant="outline">{grantStats.byType.contract} Contracts</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-slate-600">Organizations Notified</p>
                  <p className="text-xl font-bold text-slate-900">{organizations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>New Grant Opportunity</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Project Category</label>
                    <Input
                      value={formData.project_category}
                      onChange={(e) => handleChange('project_category', e.target.value)}
                      placeholder="e.g., Youth Lead, Adult Work"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Grant Title *</label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="e.g., Community Development Grant"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Funder Name *</label>
                    <Input
                      required
                      value={formData.funder_name}
                      onChange={(e) => handleChange('funder_name', e.target.value)}
                      placeholder="e.g., Smith Foundation"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Type</label>
                    <Select value={formData.type} onValueChange={(val) => handleChange('type', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grant">Grant</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="rfp">RFP</SelectItem>
                        <SelectItem value="rfq">RFQ</SelectItem>
                        <SelectItem value="donor_program">Donor Program</SelectItem>
                        <SelectItem value="public_fund">Public Fund</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Funding Lane</label>
                    <Select value={formData.funding_lane} onValueChange={(val) => handleChange('funding_lane', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grants">Grants</SelectItem>
                        <SelectItem value="contracts">Contracts</SelectItem>
                        <SelectItem value="donors">Donors</SelectItem>
                        <SelectItem value="public_funds">Public Funds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
                    <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="researching">Researching</SelectItem>
                        <SelectItem value="drafting">Drafting</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="awarded">Awarded</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Min Amount</label>
                    <Input
                      type="number"
                      value={formData.amount_min}
                      onChange={(e) => handleChange('amount_min', e.target.value)}
                      placeholder="$0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Max Amount</label>
                    <Input
                      type="number"
                      value={formData.amount_max}
                      onChange={(e) => handleChange('amount_max', e.target.value)}
                      placeholder="$100,000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">LOI Deadline</label>
                    <Input
                      type="date"
                      value={formData.deadline_loi}
                      onChange={(e) => handleChange('deadline_loi', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Pre-App Deadline</label>
                    <Input
                      type="date"
                      value={formData.deadline_pre}
                      onChange={(e) => handleChange('deadline_pre', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Full App Deadline</label>
                    <Input
                      type="date"
                      value={formData.deadline_full}
                      onChange={(e) => handleChange('deadline_full', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Geographic Focus</label>
                    <Input
                      value={formData.geographic_focus}
                      onChange={(e) => handleChange('geographic_focus', e.target.value)}
                      placeholder="e.g., California"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rolling"
                    checked={formData.rolling_deadline}
                    onChange={(e) => handleChange('rolling_deadline', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="rolling" className="text-sm text-slate-700">Rolling deadline</label>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Description *</label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    placeholder="Brief description of the grant opportunity..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Eligibility Summary</label>
                  <Textarea
                    value={formData.eligibility_summary}
                    onChange={(e) => handleChange('eligibility_summary', e.target.value)}
                    rows={2}
                    placeholder="Who is eligible to apply..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Application URL</label>
                  <Input
                    type="url"
                    value={formData.application_url}
                    onChange={(e) => handleChange('application_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Internal Notes (Staff Only)</label>
                  <Textarea
                    value={formData.internal_notes}
                    onChange={(e) => handleChange('internal_notes', e.target.value)}
                    rows={2}
                    placeholder="Strategy notes, fit assessment, contact requirements..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save & Notify Clients
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Opportunity Cards Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-slate-600">Loading opportunities...</div>
        ) : filteredGrantsByView.length === 0 ? (
          <div className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {viewMode === 'saved' ? 'No saved opportunities' : 
               viewMode === 'hidden' ? 'No hidden opportunities' : 
               'No opportunities added yet'}
            </h3>
            <p className="text-slate-600">
              {viewMode === 'all' ? 'Start by adding your first grant opportunity' :
               viewMode === 'saved' ? 'Save opportunities to track them here' :
               'Hidden opportunities will appear here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredGrantsByView.map(grant => (
                <motion.div
                  key={grant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-emerald-500 h-full flex flex-col"
                    onClick={() => setSelectedGrant(grant)}
                  >
                    <CardContent className="p-4 flex flex-col flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-2 flex-wrap">
                            <Badge className="text-xs uppercase bg-emerald-100 text-emerald-800 border-emerald-200">
                              {grant.type}
                            </Badge>
                            {grant.rolling_deadline && (
                              <Badge variant="outline" className="text-xs">Rolling</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSave(grant.id);
                            }}
                          >
                            {savedGrants.includes(grant.id) ? (
                              <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Bookmark className="w-4 h-4 text-slate-400" />
                            )}
                          </Button>
                          {user?.role === 'admin' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteGrantMutation.mutate(grant.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-base font-semibold text-slate-900 mb-1 line-clamp-2">
                        {grant.title}
                      </h3>
                      <p 
                        className="text-sm font-medium text-emerald-700 mb-2 cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = createPageUrl('FunderProfile') + '?name=' + encodeURIComponent(grant.funder_name);
                        }}
                      >
                        {grant.funder_name}
                      </p>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-3 flex-1">
                        {grant.description || 'No description provided'}
                      </p>

                      {/* Key Info */}
                      <div className="space-y-2 mt-auto pt-3 border-t">
                        {(grant.amount_min || grant.amount_max) && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-slate-900">
                              {grant.amount_min && `$${(parseInt(grant.amount_min) / 1000).toFixed(0)}K`}
                              {grant.amount_min && grant.amount_max && ' - '}
                              {grant.amount_max && `$${(parseInt(grant.amount_max) / 1000).toFixed(0)}K`}
                            </span>
                          </div>
                        )}
                        {grant.deadline_full && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            <span className="text-slate-700">
                              {format(new Date(grant.deadline_full), 'MMM d, yyyy')}
                            </span>
                          </div>
                        )}
                        {grant.geographic_focus && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span className="text-slate-700">{grant.geographic_focus}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <Badge variant="outline" className="text-xs">{grant.funding_lane}</Badge>
                        {grant.project_category && (
                          <Badge variant="outline" className="text-xs bg-slate-50">{grant.project_category}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={!!selectedGrant} onOpenChange={() => setSelectedGrant(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedGrant && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="uppercase bg-emerald-100 text-emerald-800">
                          {selectedGrant.type}
                        </Badge>
                        <Badge variant="outline">{selectedGrant.funding_lane}</Badge>
                        {selectedGrant.rolling_deadline && (
                          <Badge variant="outline">Rolling Deadline</Badge>
                        )}
                      </div>
                      <DialogTitle className="text-2xl mb-2">{selectedGrant.title}</DialogTitle>
                      <div 
                        className="flex items-center gap-2 text-emerald-700 font-medium cursor-pointer hover:underline"
                        onClick={() => {
                          window.location.href = createPageUrl('FunderProfile') + '?name=' + encodeURIComponent(selectedGrant.funder_name);
                        }}
                      >
                        <Building2 className="w-4 h-4" />
                        {selectedGrant.funder_name}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={savedGrants.includes(selectedGrant.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleSave(selectedGrant.id)}
                        className={savedGrants.includes(selectedGrant.id) ? 'bg-emerald-600' : ''}
                      >
                        {savedGrants.includes(selectedGrant.id) ? (
                          <><BookmarkCheck className="w-4 h-4 mr-1" />Saved</>
                        ) : (
                          <><Bookmark className="w-4 h-4 mr-1" />Save</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleHide(selectedGrant.id)}
                      >
                        <EyeOff className="w-4 h-4 mr-1" />
                        Hide
                      </Button>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Key Details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(selectedGrant.amount_min || selectedGrant.amount_max) && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs text-slate-600">Award Range</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">
                          {selectedGrant.amount_min && `$${(parseInt(selectedGrant.amount_min) / 1000).toFixed(0)}K`}
                          {selectedGrant.amount_min && selectedGrant.amount_max && ' - '}
                          {selectedGrant.amount_max && `$${(parseInt(selectedGrant.amount_max) / 1000).toFixed(0)}K`}
                        </p>
                      </div>
                    )}
                    {selectedGrant.deadline_full && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs text-slate-600">Application Deadline</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          {format(new Date(selectedGrant.deadline_full), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    )}
                    {selectedGrant.geographic_focus && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs text-slate-600">Geographic Focus</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{selectedGrant.geographic_focus}</p>
                      </div>
                    )}
                  </div>

                  {/* Additional Deadlines */}
                  {(selectedGrant.deadline_loi || selectedGrant.deadline_pre) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Important Deadlines
                      </h4>
                      <div className="space-y-1 text-sm">
                        {selectedGrant.deadline_loi && (
                          <p><span className="font-medium">Letter of Intent:</span> {format(new Date(selectedGrant.deadline_loi), 'MMMM d, yyyy')}</p>
                        )}
                        {selectedGrant.deadline_pre && (
                          <p><span className="font-medium">Pre-Application:</span> {format(new Date(selectedGrant.deadline_pre), 'MMMM d, yyyy')}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Description
                    </h4>
                    <p className="text-slate-700 whitespace-pre-line">{selectedGrant.description}</p>
                  </div>

                  {/* Eligibility */}
                  {selectedGrant.eligibility_summary && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        Eligibility
                      </h4>
                      <p className="text-slate-700">{selectedGrant.eligibility_summary}</p>
                    </div>
                  )}

                  {/* Internal Notes (Admin Only) */}
                  {selectedGrant.internal_notes && (user?.role === 'admin' || user?.role === 'owner') && (
                   <div className="bg-amber-50 border-l-4 border-amber-400 rounded p-4">
                     <h4 className="font-semibold text-amber-900 mb-2">Internal Strategy Notes</h4>
                     <p className="text-amber-900 text-sm">{selectedGrant.internal_notes}</p>
                   </div>
                  )}

                  {/* 990 Data Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                   <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                     <FileText className="w-4 h-4 text-blue-600" />
                     Funder Research
                   </h4>
                   <p className="text-sm text-blue-800 mb-2">
                     Want deeper funder insights? We can pull IRS 990 data, past grantee information, and giving patterns to help you understand {selectedGrant.funder_name}'s priorities.
                   </p>
                   <p className="text-xs text-blue-700">
                     💡 This feature requires backend integration with nonprofit data APIs like Candid (Foundation Directory) or ProPublica Nonprofit Explorer.
                   </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                   {selectedGrant.application_url && (
                     <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                       <a href={selectedGrant.application_url} target="_blank" rel="noopener noreferrer">
                         <ExternalLink className="w-4 h-4 mr-2" />
                         View Application Portal
                       </a>
                     </Button>
                   )}
                   <Button variant="outline">
                     <Award className="w-4 h-4 mr-2" />
                     Start Application
                   </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}