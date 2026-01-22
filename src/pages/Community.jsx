import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Calendar, MessageSquare, Info } from 'lucide-react';
import CommunityGroupCard from '@/components/community/CommunityGroupCard';

export default function CommunityPage() {
  const [selectedStage, setSelectedStage] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: groups, isLoading } = useQuery({
    queryKey: ['communityGroups'],
    queryFn: () => base44.entities.CommunityGroup.filter({ is_active: true }),
  });

  const organization = organizations?.[0];

  const filteredGroups = (groups || []).filter(group => {
    if (selectedStage === 'all') return true;
    return group.target_stage === selectedStage;
  });

  const handleJoinGroup = (group) => {
    // In a real app, this would handle group joining logic
    console.log('Joining group:', group.name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Community & Coaching
            </h1>
          </div>
          <p className="text-slate-500">
            Connect with peers and coaches at your stage
          </p>
        </motion.div>

        {/* Purpose Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Alert className="bg-amber-50 border-amber-200">
            <Info className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              Our community spaces are purpose-driven—focused on funding readiness, peer review, 
              and skill-building. Every session connects back to your goals.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Stage Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Tabs value={selectedStage} onValueChange={setSelectedStage}>
            <TabsList className="bg-white border border-slate-200 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                All Stages
              </TabsTrigger>
              <TabsTrigger value="idea" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                Idea Stage
              </TabsTrigger>
              <TabsTrigger value="early" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                Early Stage
              </TabsTrigger>
              <TabsTrigger value="operating" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                Operating
              </TabsTrigger>
              <TabsTrigger value="scaling" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                Scaling
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No groups available for this stage yet.</p>
            <p className="text-sm text-slate-400 mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CommunityGroupCard
                  group={group}
                  isEligible={!organization || organization.stage === group.target_stage}
                  onJoin={handleJoinGroup}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Upcoming Events Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-600" />
            Upcoming Sessions
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No upcoming sessions scheduled.</p>
            <p className="text-sm text-slate-400 mt-1">
              Join a group to see scheduled sessions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}