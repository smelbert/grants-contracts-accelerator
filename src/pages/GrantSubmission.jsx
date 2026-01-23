import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Trash2, ExternalLink, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function GrantSubmissionPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    funder_name: '',
    type: 'grant',
    funding_lane: 'grants',
    amount_min: '',
    amount_max: '',
    deadline: '',
    description: '',
    eligibility_summary: '',
    application_url: '',
    geographic_focus: '',
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: grants, isLoading } = useQuery({
    queryKey: ['funding-opportunities'],
    queryFn: () => base44.entities.FundingOpportunity.list('-created_date')
  });

  const { data: organizations } = useQuery({
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
        funder_name: '',
        type: 'grant',
        funding_lane: 'grants',
        amount_min: '',
        amount_max: '',
        deadline: '',
        description: '',
        eligibility_summary: '',
        application_url: '',
        geographic_focus: '',
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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Grant Submissions</h1>
            <p className="text-slate-600">Add grants for clients to discover</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Grant
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>New Grant Opportunity</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-3 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Deadline</label>
                    <Input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleChange('deadline', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Geographic Focus</label>
                    <Input
                      value={formData.geographic_focus}
                      onChange={(e) => handleChange('geographic_focus', e.target.value)}
                      placeholder="e.g., California, Nationwide"
                    />
                  </div>
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

        <div className="space-y-4">
          {isLoading ? (
            <Card><CardContent className="py-8 text-center text-slate-500">Loading grants...</CardContent></Card>
          ) : grants?.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No grants added yet</CardContent></Card>
          ) : (
            grants?.map(grant => (
              <Card key={grant.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{grant.title}</h3>
                        <Badge variant="outline" className="text-xs">{grant.funding_lane}</Badge>
                        {grant.is_active && <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>}
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{grant.funder_name}</p>
                      <p className="text-sm text-slate-700 mb-3">{grant.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        {(grant.amount_min || grant.amount_max) && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>
                              {grant.amount_min && `$${parseInt(grant.amount_min).toLocaleString()}`}
                              {grant.amount_min && grant.amount_max && ' - '}
                              {grant.amount_max && `$${parseInt(grant.amount_max).toLocaleString()}`}
                            </span>
                          </div>
                        )}
                        {grant.deadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Deadline: {format(new Date(grant.deadline), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                        {grant.geographic_focus && (
                          <span>📍 {grant.geographic_focus}</span>
                        )}
                      </div>

                      {grant.application_url && (
                        <a
                          href={grant.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mt-2"
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
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}