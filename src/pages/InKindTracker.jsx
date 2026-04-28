import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LayoutDashboard, Gift, Users, RefreshCcw, BookOpen, CheckSquare } from 'lucide-react';
import InKindDashboard from '@/components/inkind/InKindDashboard';
import InKindDonationsLog from '@/components/inkind/InKindDonationsLog';
import InKindVolunteerLog from '@/components/inkind/InKindVolunteerLog';
import InKindRecurringGifts from '@/components/inkind/InKindRecurringGifts';
import InKindFMVLibrary from '@/components/inkind/InKindFMVLibrary';
import InKindAcknowledgments from '@/components/inkind/InKindAcknowledgments';

export default function InKindTracker() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: donations = [], refetch: refetchDonations } = useQuery({
    queryKey: ['inkind-donations', user?.email],
    queryFn: () => base44.entities.InKindDonation.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });

  const { data: volunteers = [], refetch: refetchVolunteers } = useQuery({
    queryKey: ['inkind-volunteers', user?.email],
    queryFn: () => base44.entities.InKindVolunteer.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });

  const { data: recurring = [], refetch: refetchRecurring } = useQuery({
    queryKey: ['inkind-recurring', user?.email],
    queryFn: () => base44.entities.InKindRecurringGift.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-8 h-8 text-[#E5C089]" />
            <h1 className="text-3xl font-bold">In-Kind Contribution Tracker</h1>
          </div>
          <p className="text-[#E5C089]/80 text-sm max-w-2xl">
            Track, value, acknowledge, and report every non-cash gift. Designed for IRS + GAAP compliance. 
            Works for nonprofits, for-profits, and entrepreneurial businesses.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-white border border-slate-200 p-1 rounded-xl mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-[#143A50] data-[state=active]:text-white">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex items-center gap-2 data-[state=active]:bg-[#143A50] data-[state=active]:text-white">
              <Gift className="w-4 h-4" /> Donations Log
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="flex items-center gap-2 data-[state=active]:bg-[#143A50] data-[state=active]:text-white">
              <Users className="w-4 h-4" /> Volunteer Hours
            </TabsTrigger>
            <TabsTrigger value="recurring" className="flex items-center gap-2 data-[state=active]:bg-[#143A50] data-[state=active]:text-white">
              <RefreshCcw className="w-4 h-4" /> Recurring Gifts
            </TabsTrigger>
            <TabsTrigger value="fmv" className="flex items-center gap-2 data-[state=active]:bg-[#143A50] data-[state=active]:text-white">
              <BookOpen className="w-4 h-4" /> FMV Reference
            </TabsTrigger>
            <TabsTrigger value="acknowledgments" className="flex items-center gap-2 data-[state=active]:bg-[#143A50] data-[state=active]:text-white">
              <CheckSquare className="w-4 h-4" /> Acknowledgments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <InKindDashboard donations={donations} volunteers={volunteers} recurring={recurring} />
          </TabsContent>
          <TabsContent value="donations">
            <InKindDonationsLog donations={donations} recurring={recurring} onRefresh={refetchDonations} userEmail={user?.email} />
          </TabsContent>
          <TabsContent value="volunteers">
            <InKindVolunteerLog volunteers={volunteers} onRefresh={refetchVolunteers} userEmail={user?.email} />
          </TabsContent>
          <TabsContent value="recurring">
            <InKindRecurringGifts recurring={recurring} onRefresh={refetchRecurring} userEmail={user?.email} />
          </TabsContent>
          <TabsContent value="fmv">
            <InKindFMVLibrary />
          </TabsContent>
          <TabsContent value="acknowledgments">
            <InKindAcknowledgments donations={donations} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}