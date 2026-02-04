import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Search, Filter } from 'lucide-react';

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.filter({}, '-created_date', 200),
    enabled: user?.role === 'admin'
  });

  if (user?.role !== 'admin') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
            <p className="text-slate-600">Audit logs are only available to administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchQuery || 
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;
    return matchesSearch && matchesAction;
  });

  const actionColors = {
    user_created: 'bg-green-100 text-green-800',
    user_updated: 'bg-blue-100 text-blue-800',
    user_deleted: 'bg-red-100 text-red-800',
    subscription_created: 'bg-green-100 text-green-800',
    subscription_updated: 'bg-yellow-100 text-yellow-800',
    subscription_cancelled: 'bg-red-100 text-red-800',
    payment_successful: 'bg-green-100 text-green-800',
    payment_failed: 'bg-red-100 text-red-800',
    login: 'bg-slate-100 text-slate-800',
    logout: 'bg-slate-100 text-slate-800',
    settings_changed: 'bg-blue-100 text-blue-800',
    admin_action: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-slate-600 mt-2">Track all system activities and changes</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="user_created">User Created</SelectItem>
                <SelectItem value="user_updated">User Updated</SelectItem>
                <SelectItem value="subscription_created">Subscription Created</SelectItem>
                <SelectItem value="payment_successful">Payment Successful</SelectItem>
                <SelectItem value="payment_failed">Payment Failed</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="settings_changed">Settings Changed</SelectItem>
                <SelectItem value="admin_action">Admin Action</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log ({filteredLogs.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No logs found</p>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                  <Shield className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{log.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {log.user_email} • {log.user_role}
                        </p>
                      </div>
                      <Badge className={actionColors[log.action_type] || 'bg-slate-100 text-slate-800'}>
                        {log.action_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{new Date(log.created_date).toLocaleString()}</span>
                      {log.ip_address && <span>IP: {log.ip_address}</span>}
                      {log.entity_type && <span>Entity: {log.entity_type}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}