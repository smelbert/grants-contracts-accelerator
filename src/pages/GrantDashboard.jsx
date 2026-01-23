import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  Sparkles,
  Bell,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

export default function GrantDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLane, setSelectedLane] = useState('all');
  const [hasNewGrants, setHasNewGrants] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: grants, isLoading } = useQuery({
    queryKey: ['funding-opportunities'],
    queryFn: () => base44.entities.FundingOpportunity.list('-created_date'),
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const { data: userOrg } = useQuery({
    queryKey: ['user-organization', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const orgs = await base44.entities.Organization.list();
      return orgs.find(org => org.created_by === user.email);
    },
    enabled: !!user?.email
  });

  // Check for new grants
  useEffect(() => {
    if (grants?.length > 0) {
      const lastViewed = localStorage.getItem('lastGrantView');
      const latestGrant = new Date(grants[0].created_date);
      
      if (!lastViewed || new Date(lastViewed) < latestGrant) {
        setHasNewGrants(true);
      }
    }
  }, [grants]);

  const markAsViewed = () => {
    localStorage.setItem('lastGrantView', new Date().toISOString());
    setHasNewGrants(false);
  };

  useEffect(() => {
    if (grants?.length > 0) {
      markAsViewed();
    }
  }, [grants]);

  const filteredGrants = grants?.filter(grant => {
    const matchesSearch = grant.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grant.funder_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grant.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLane = selectedLane === 'all' || grant.funding_lane === selectedLane;
    const isActive = grant.is_active !== false;
    return matchesSearch && matchesLane && isActive;
  });

  const newGrantsCount = grants?.filter(g => {
    const grantDate = new Date(g.created_date);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return grantDate > oneDayAgo;
  }).length || 0;

  const isDeadlineSoon = (deadline) => {
    if (!deadline) return false;
    const daysUntil = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 14;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-slate-900">Grant Dashboard</h1>
            {hasNewGrants && (
              <Badge className="bg-emerald-600 animate-pulse">
                <Bell className="w-3 h-3 mr-1" />
                New Grants Available
              </Badge>
            )}
          </div>
          <p className="text-slate-600">Discover funding opportunities curated by our team</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Grants</p>
                  <p className="text-2xl font-bold text-slate-900">{grants?.filter(g => g.is_active !== false).length || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Added (24hrs)</p>
                  <p className="text-2xl font-bold text-slate-900">{newGrantsCount}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Deadlines Soon</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {grants?.filter(g => isDeadlineSoon(g.deadline)).length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search grants by title, funder, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-600" />
                <select
                  value={selectedLane}
                  onChange={(e) => setSelectedLane(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="grants">Grants</option>
                  <option value="contracts">Contracts</option>
                  <option value="donors">Donors</option>
                  <option value="public_funds">Public Funds</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grant List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              Loading grants...
            </CardContent>
          </Card>
        ) : filteredGrants?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No grants found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredGrants?.map(grant => {
              const isNew = new Date(grant.created_date) > new Date(Date.now() - 24 * 60 * 60 * 1000);
              const deadlineSoon = isDeadlineSoon(grant.deadline);

              return (
                <Card key={grant.id} className={isNew ? 'border-l-4 border-l-emerald-500' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{grant.title}</h3>
                          {isNew && (
                            <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                              New
                            </Badge>
                          )}
                          {deadlineSoon && (
                            <Badge className="bg-amber-100 text-amber-800 text-xs">
                              Deadline Soon
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs uppercase">
                            {grant.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {grant.funding_lane?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-slate-700 mb-1">{grant.funder_name}</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 mb-4">{grant.description}</p>

                    {grant.eligibility_summary && (
                      <Alert className="mb-4">
                        <AlertDescription className="text-sm">
                          <span className="font-medium">Eligibility: </span>
                          {grant.eligibility_summary}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex items-center flex-wrap gap-4 text-sm text-slate-600 mb-4">
                      {(grant.amount_min || grant.amount_max) && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">
                            {grant.amount_min && `$${parseInt(grant.amount_min).toLocaleString()}`}
                            {grant.amount_min && grant.amount_max && ' - '}
                            {grant.amount_max && `$${parseInt(grant.amount_max).toLocaleString()}`}
                          </span>
                        </div>
                      )}
                      {grant.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Deadline: {format(new Date(grant.deadline), 'MMM d, yyyy')}
                            {deadlineSoon && (
                              <span className="text-amber-600 ml-1">
                                ({Math.ceil((new Date(grant.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days)
                              </span>
                            )}
                          </span>
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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Application
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}