import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, User, Search, DollarSign, Calendar, 
  CheckCircle2, XCircle, Eye, Mail 
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const TIER_COLORS = {
  base: 'bg-slate-100 text-slate-700',
  mid: 'bg-blue-100 text-blue-700',
  premium: 'bg-purple-100 text-purple-700'
};

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  past_due: 'bg-amber-100 text-amber-700'
};

export default function ClientManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['allOrganizations'],
    queryFn: () => base44.entities.Organization.list('-created_date'),
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('-created_date'),
  });

  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['allSubscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
  });

  // Create a map of user emails to their subscriptions
  const subscriptionMap = subscriptions?.reduce((acc, sub) => {
    acc[sub.created_by] = sub;
    return acc;
  }, {}) || {};

  // Combine organizations with their subscription info
  const clients = organizations?.map(org => {
    const orgOwner = allUsers?.find(u => u.organization_id === org.id && u.org_team_role === 'owner');
    const subscription = orgOwner ? subscriptionMap[orgOwner.email] : null;
    const teamCount = allUsers?.filter(u => u.organization_id === org.id).length || 0;
    
    return {
      ...org,
      ownerEmail: orgOwner?.email,
      subscription,
      teamCount
    };
  }) || [];

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || client.type === filterType;
    return matchesSearch && matchesType;
  });

  // Stats
  const stats = {
    totalClients: clients.length,
    activeSubscriptions: Object.values(subscriptionMap).filter(s => s.status === 'active').length,
    totalRevenue: Object.values(subscriptionMap)
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.monthly_cost || 0), 0)
  };

  if (orgsLoading || usersLoading || subsLoading) {
    return <Card><CardContent className="py-8 text-center">Loading clients...</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalClients}</p>
                <p className="text-sm text-slate-600">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.activeSubscriptions}</p>
                <p className="text-sm text-slate-600">Active Subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">${stats.totalRevenue}</p>
                <p className="text-sm text-slate-600">Monthly Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">All Types</option>
              <option value="nonprofit">Nonprofit</option>
              <option value="for_profit">For-Profit</option>
              <option value="solopreneur">Solopreneur</option>
              <option value="community_based">Community-Based</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredClients.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="w-5 h-5 text-slate-400" />
                          <h3 className="font-semibold text-slate-900 text-lg">{client.name}</h3>
                        </div>
                        {client.ownerEmail && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-4 h-4" />
                            {client.ownerEmail}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-3 text-sm">
                      <Badge variant="outline" className="capitalize">
                        {client.type?.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {client.stage} Stage
                      </Badge>
                      <Badge className={client.readiness_status ? 'bg-blue-100 text-blue-700' : ''}>
                        {client.readiness_status?.replace(/_/g, ' ') || 'Not assessed'}
                      </Badge>
                      <div className="flex items-center gap-1 text-slate-600">
                        <User className="w-4 h-4" />
                        <span>{client.teamCount} team member{client.teamCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Subscription Info */}
                    {client.subscription ? (
                      <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600 mb-1">Subscription</p>
                            <Badge className={TIER_COLORS[client.subscription.tier]}>
                              {client.subscription.tier} tier
                            </Badge>
                          </div>
                          <div>
                            <p className="text-slate-600 mb-1">Status</p>
                            <Badge className={STATUS_COLORS[client.subscription.status]}>
                              {client.subscription.status}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-slate-600 mb-1">Monthly Revenue</p>
                            <p className="font-semibold text-slate-900">
                              ${client.subscription.monthly_cost || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-sm text-amber-700">No active subscription</p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Joined {format(new Date(client.created_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No clients found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}