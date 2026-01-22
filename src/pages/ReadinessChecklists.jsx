import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Circle, AlertCircle, FileText, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ReadinessChecklistsPage() {
  const [activeTab, setActiveTab] = useState('grants');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: checklists } = useQuery({
    queryKey: ['checklists', user?.email],
    queryFn: () => base44.entities.ReadinessChecklist.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const organization = organizations?.[0];

  const getChecklistByLane = (lane) => {
    return checklists?.find(c => c.funding_lane === lane);
  };

  const getCompletionStatus = (checklist) => {
    if (!checklist) return 0;
    const total = checklist.checklist_items?.length || 0;
    const completed = checklist.checklist_items?.filter(i => i.user_attested_complete).length || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const LANES = [
    { id: 'grants', label: 'Grant Readiness', color: 'emerald', icon: FileText },
    { id: 'contracts', label: 'Contract Readiness', color: 'blue', icon: FileText },
    { id: 'donors', label: 'Donor Readiness', color: 'violet', icon: FileText },
    { id: 'public_funds', label: 'Public Funding Readiness', color: 'amber', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Readiness Checklists</h1>
          <p className="text-slate-600">Track your progress across different funding pathways</p>
        </motion.div>

        {!organization ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500 mb-4">Complete your organization profile first</p>
              <Link to={createPageUrl('Profile')}>
                <Button>Go to Profile</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              {LANES.map(lane => (
                <TabsTrigger key={lane.id} value={lane.id}>
                  {lane.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {LANES.map(lane => {
              const checklist = getChecklistByLane(lane.id);
              const completion = getCompletionStatus(checklist);

              return (
                <TabsContent key={lane.id} value={lane.id}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{lane.label} Checklist</CardTitle>
                        <Badge className={`bg-${lane.color}-100 text-${lane.color}-700`}>
                          {completion}% Complete
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {!checklist ? (
                        <div className="text-center py-12">
                          <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-600 mb-4">
                            This checklist is not yet enabled for your organization
                          </p>
                          <p className="text-sm text-slate-500">
                            Contact your coach or complete prerequisite steps
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {['governance', 'finance', 'program', 'compliance', 'operations'].map(category => {
                            const items = checklist.checklist_items?.filter(i => i.category === category) || [];
                            if (items.length === 0) return null;

                            return (
                              <div key={category}>
                                <h3 className="font-semibold text-slate-900 capitalize mb-3">{category}</h3>
                                <div className="space-y-2">
                                  {items.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200"
                                    >
                                      {item.user_attested_complete ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                      ) : item.required ? (
                                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                      ) : (
                                        <Circle className="w-5 h-5 text-slate-400 mt-0.5" />
                                      )}
                                      <div className="flex-1">
                                        <p className="font-medium text-slate-900">{item.item_name}</p>
                                        {item.item_description && (
                                          <p className="text-sm text-slate-600 mt-1">{item.item_description}</p>
                                        )}
                                        {item.required && (
                                          <Badge variant="outline" className="mt-2 text-xs">Required</Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </div>
  );
}