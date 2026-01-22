import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, CheckSquare } from 'lucide-react';
import TaskManager from '@/components/collaboration/TaskManager';
import TeamChat from '@/components/collaboration/TeamChat';

export default function TeamCollaborationPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const organization = organizations?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" />
            Team Collaboration
          </h1>
          <p className="text-slate-600">Coordinate with your team in real-time</p>
        </motion.div>

        <Tabs defaultValue="tasks">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="tasks">
              <CheckSquare className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="w-4 h-4 mr-2" />
              Team Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            {organization ? (
              <TaskManager organizationId={organization.id} />
            ) : (
              <p className="text-center text-slate-500 py-12">Complete your profile to access team features</p>
            )}
          </TabsContent>

          <TabsContent value="chat">
            {organization ? (
              <TeamChat organizationId={organization.id} />
            ) : (
              <p className="text-center text-slate-500 py-12">Complete your profile to access team features</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}