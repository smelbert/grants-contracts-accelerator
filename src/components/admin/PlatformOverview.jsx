import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, Building2, FileText, CheckCircle2, 
  TrendingUp, DollarSign, Clock, AlertTriangle 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlatformOverview({ stats }) {
  const metrics = [
    {
      label: 'Total Organizations',
      value: stats?.totalOrgs || 0,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      label: 'Documents Created',
      value: stats?.totalDocuments || 0,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Reviews Completed',
      value: stats?.completedReviews || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Pending Reviews',
      value: stats?.pendingReviews || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    {
      label: 'Ethical Flags',
      value: stats?.ethicalFlags || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                      <p className="text-sm text-slate-600">{metric.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Readiness Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Readiness Stage Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { stage: 'pre_funding', label: 'Pre-Funding', count: stats?.byStage?.pre_funding || 0, color: 'bg-slate-400' },
              { stage: 'grant_eligible', label: 'Grant Eligible', count: stats?.byStage?.grant_eligible || 0, color: 'bg-blue-500' },
              { stage: 'contract_ready', label: 'Contract Ready', count: stats?.byStage?.contract_ready || 0, color: 'bg-emerald-500' },
              { stage: 'relationship_building', label: 'Relationship Building', count: stats?.byStage?.relationship_building || 0, color: 'bg-purple-500' },
              { stage: 'scaling', label: 'Scaling', count: stats?.byStage?.scaling || 0, color: 'bg-amber-500' }
            ].map(stage => {
              const percentage = stats?.totalOrgs ? Math.round((stage.count / stats.totalOrgs) * 100) : 0;
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{stage.label}</span>
                    <span className="text-sm text-slate-600">{stage.count} ({percentage}%)</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stage.color} transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}