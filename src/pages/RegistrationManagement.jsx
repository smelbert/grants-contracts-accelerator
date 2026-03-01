import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CheckCircle2, Clock, DollarSign, Search, ChevronDown, ChevronUp } from 'lucide-react';
import RegistrationAttachments from '@/components/incubateher/RegistrationAttachments';

export default function RegistrationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const queryClient = useQueryClient();

  const { data: registrationPages = [] } = useQuery({
    queryKey: ['registrationPages'],
    queryFn: () => base44.entities.RegistrationPage.list()
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['registrationSubmissions'],
    queryFn: () => base44.entities.RegistrationSubmission.list()
  });

  const { data: surveys = [] } = useQuery({
    queryKey: ['postEventSurveys'],
    queryFn: () => base44.entities.PostEventSurvey.list()
  });

  const getPageName = (pageId) => {
    const page = registrationPages.find(p => p.id === pageId);
    return page?.page_name || 'Unknown';
  };

  const filteredSubmissions = submissions.filter(s =>
    s.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalRegistrations: submissions.length,
    paidRegistrations: submissions.filter(s => s.payment_status === 'paid').length,
    pendingPayments: submissions.filter(s => s.payment_status === 'pending').length,
    surveysCompleted: submissions.filter(s => s.survey_completed).length
  };

  const statusColors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-slate-100 text-slate-800'
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Registration Management</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Registrations</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalRegistrations}</p>
                </div>
                <Users className="w-8 h-8 text-[#143A50]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Paid</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paidRegistrations}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Payment</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Surveys Completed</p>
                  <p className="text-2xl font-bold text-[#143A50]">{stats.surveysCompleted}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-[#143A50]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-slate-600">Name</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-600">Email</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-600">Registration</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-600">Entry Point</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-600">Payment</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-600">Survey</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 text-sm">{submission.user_name}</td>
                      <td className="p-3 text-sm">{submission.user_email}</td>
                      <td className="p-3 text-sm">{getPageName(submission.registration_page_id)}</td>
                      <td className="p-3 text-sm">
                        <Badge variant="outline">{submission.entry_point}</Badge>
                      </td>
                      <td className="p-3 text-sm">
                        <Badge className={statusColors[submission.payment_status]}>
                          {submission.payment_status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {submission.survey_completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                      </td>
                      <td className="p-3 text-sm text-slate-600">
                        {new Date(submission.created_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}