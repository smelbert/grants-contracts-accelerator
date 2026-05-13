import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Lightbulb, TrendingUp, Scale, DollarSign, BarChart3, Megaphone, Settings, Users, ArrowRight, Sparkles } from 'lucide-react';

const CATEGORY_CONFIG = {
  strategy:          { color: 'bg-[#143A50]/10 text-[#143A50] border-[#143A50]/20',   borderColor: '#143A50', icon: TrendingUp,   label: 'Strategy' },
  funding:           { color: 'bg-[#AC1A5B]/10 text-[#AC1A5B] border-[#AC1A5B]/20',   borderColor: '#AC1A5B', icon: DollarSign,   label: 'Funding' },
  legal_compliance:  { color: 'bg-amber-100 text-amber-800 border-amber-200',          borderColor: '#d97706', icon: Scale,         label: 'Legal & Compliance' },
  financial:         { color: 'bg-green-100 text-green-800 border-green-200',          borderColor: '#16a34a', icon: BarChart3,     label: 'Financial' },
  evaluation:        { color: 'bg-purple-100 text-purple-800 border-purple-200',       borderColor: '#7c3aed', icon: Lightbulb,     label: 'Evaluation' },
  marketing:         { color: 'bg-orange-100 text-orange-800 border-orange-200',       borderColor: '#ea580c', icon: Megaphone,     label: 'Marketing' },
  operations:        { color: 'bg-slate-100 text-slate-700 border-slate-200',          borderColor: '#475569', icon: Settings,      label: 'Operations' },
  community:         { color: 'bg-teal-100 text-teal-800 border-teal-200',             borderColor: '#0d9488', icon: Users,         label: 'Community' },
};

const PRIORITY_DOT = {
  high:   'bg-red-500',
  medium: 'bg-amber-400',
  low:    'bg-green-500',
};

export default function PersonalizedMilestones({ milestones, userStage, orgType }) {
  if (!milestones || milestones.length === 0) return null;

  const stageLabel = {
    startup: 'Startup / Foundational',
    growth: 'Growth',
    scaling: 'Scaling',
    all: 'All Stages'
  }[userStage] || 'Your Stage';

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-[#AC1A5B]" />
        <h2 className="text-lg font-semibold text-[#143A50]">Personalized Action Prompts</h2>
        <Badge className="bg-[#E5C089]/30 text-[#143A50] border-[#E5C089]">{stageLabel}</Badge>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Based on your registration profile — here's what to focus on this month to elevate your business.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {milestones.map(milestone => {
          const cfg = CATEGORY_CONFIG[milestone.category] || CATEGORY_CONFIG.strategy;
          const Icon = cfg.icon;
          return (
            <Card
              key={milestone.id}
              className="border-l-4 hover:shadow-md transition-shadow"
              style={{ borderLeftColor: cfg.borderColor }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg border flex-shrink-0 ${cfg.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[milestone.priority] || PRIORITY_DOT.medium}`} />
                      <span className={`text-xs font-medium ${cfg.color.split(' ')[1]}`}>{cfg.label}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm leading-tight mb-1">{milestone.title}</h4>
                    {milestone.description && (
                      <p className="text-xs text-slate-500 line-clamp-3">{milestone.description}</p>
                    )}
                    {milestone.action_link_page && (
                      <Link to={createPageUrl(milestone.action_link_page)} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#AC1A5B] hover:underline">
                        {milestone.action_link_label || 'Take Action'} <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}