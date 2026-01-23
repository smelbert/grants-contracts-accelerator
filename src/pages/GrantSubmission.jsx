
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Trash2, ExternalLink, Calendar, DollarSign, TrendingUp, Target, Clock, CheckCircle2, BarChart3, Building2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function GrantSubmissionPage() {
  const [showForm, setShowForm] = useState(false);
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

  const grantStats = {
    total: grants.length,
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Open & Forecasted Grants</h1>
            <p className="text-slate-600">Research pipeline and opportunity management</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Opportunity'}
          </Button>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Opportunity Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-slate-600">Loading opportunities...</div>
            ) : grants.length === 0 ? (
              <div className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No opportunities added yet</h3>
                <p className="text-slate-600">Start by adding your first grant opportunity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {grants.map(grant => (
                  <div key={grant.id} className="border rounded-lg p-4 hover:border-emerald-500 transition-colors bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {grant.project_category && (
                            <Badge variant="outline" className="text-xs font-normal bg-slate-50">{grant.project_category}</Badge>
                          )}
                          <Badge className="text-xs uppercase bg-emerald-100 text-emerald-800">{grant.type}</Badge>
                          <Badge variant="outline" className="text-xs">{grant.funding_lane}</Badge>
                          <Badge className={
                            grant.status === 'awarded' ? 'bg-green-100 text-green-800' :
                            grant.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                            grant.status === 'drafting' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-800'
                          }>
                            {grant.status}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{grant.title}</h3>
                        <p className="text-sm font-medium text-slate-700 mb-2">{grant.funder_name}</p>
                        {grant.description && (
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{grant.description}</p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          {(grant.amount_min || grant.amount_max) && (
                            <div className="flex items-start gap-2">
                              <DollarSign className="w-4 h-4 text-emerald-600 mt-0.5" />
                              <div>
                                <p className="text-xs text-slate-500">Funding Range</p>
                                <p className="text-sm font-medium text-slate-900">
                                  {grant.amount_min && `$${(parseInt(grant.amount_min) / 1000).toFixed(0)}K`}
                                  {grant.amount_min && grant.amount_max && ' - '}
                                  {grant.amount_max && `$${(parseInt(grant.amount_max) / 1000).toFixed(0)}K`}
                                </p>
                              </div>
                            </div>
                          )}
                          {grant.geographic_focus && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm">📍</span>
                              <div>
                                <p className="text-xs text-slate-500">Geography</p>
                                <p className="text-sm font-medium text-slate-900">{grant.geographic_focus}</p>
                              </div>
                            </div>
                          )}
                          {grant.deadline_full && (
                            <div className="flex items-start gap-2">
                              <Calendar className="w-4 h-4 text-emerald-600 mt-0.5" />
                              <div>
                                <p className="text-xs text-slate-500">Full Deadline</p>
                                <p className="text-sm font-medium text-slate-900">
                                  {format(new Date(grant.deadline_full), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
                          )}
                          {grant.rolling_deadline && (
                            <div className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-emerald-600 mt-0.5" />
                              <div>
                                <p className="text-xs text-slate-500">Timeline</p>
                                <Badge variant="outline" className="text-xs">Rolling</Badge>
                              </div>
                            </div>
                          )}
                        </div>

                        {(grant.deadline_loi || grant.deadline_pre) && (
                          <div className="flex items-center gap-4 text-xs text-slate-600 mb-2 pb-2 border-b">
                            {grant.deadline_loi && (
                              <span>LOI: {format(new Date(grant.deadline_loi), 'MMM d')}</span>
                            )}
                            {grant.deadline_pre && (
                              <span>Pre-App: {format(new Date(grant.deadline_pre), 'MMM d')}</span>
                            )}
                          </div>
                        )}

                        {grant.internal_notes && (
                          <div className="bg-amber-50 border-l-4 border-amber-400 rounded p-2 text-xs text-amber-900 mb-2">
                            <span className="font-semibold">Strategy: </span>
                            {grant.internal_notes}
                          </div>
                        )}

                        {grant.application_url && (
                          <a
                            href={grant.application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Application Link
                          </a>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGrantMutation.mutate(grant.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
