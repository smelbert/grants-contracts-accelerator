import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Video, Users, FileText, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TYPE_CONFIG = {
  course:    { label: 'Course',    icon: BookOpen, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  webinar:   { label: 'Webinar',   icon: Video,    color: 'bg-purple-100 text-purple-800 border-purple-200' },
  workshop:  { label: 'Workshop',  icon: Users,    color: 'bg-green-100 text-green-800 border-green-200' },
  template:  { label: 'Template',  icon: FileText, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  guidebook: { label: 'Guidebook', icon: FileText, color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

const CATEGORY_LABELS = {
  foundational: 'Foundational / Readiness',
  financial_compliance: 'Financial & Compliance',
  grant_writing: 'Grant Writing Core',
  renewals: 'Renewals & Continuation',
  contracts_rfp: 'Contracts & RFP',
  donor_philanthropy: 'Donor & Philanthropy',
  public_funding: 'Public Funding & Civic',
  strategic: 'Strategic & Sustainability',
  ai_tools: 'AI-Supported Tools',
  quality_tools: 'Review & Quality',
  meta_resources: 'Meta-Resources',
  business_planning: 'Business Planning',
  evaluation_impact: 'Evaluation & Impact',
  implementation_planning: 'Implementation Planning',
  credibility_assets: 'Credibility Assets',
};

// Which entity type to show pipeline for
// mode: 'learning' | 'resources'
export default function ComingSoonPipeline({ mode = 'learning' }) {
  const [expanded, setExpanded] = useState(false);

  const { data: unpublishedLearning = [] } = useQuery({
    queryKey: ['pipeline-learning'],
    queryFn: async () => {
      const all = await base44.entities.LearningContent.list();
      return all.filter(c => !c.is_published && !c.incubateher_only && !c.is_standalone_resource);
    },
    enabled: mode === 'learning',
  });

  const { data: unpublishedTemplates = [] } = useQuery({
    queryKey: ['pipeline-templates'],
    queryFn: async () => {
      const all = await base44.entities.Template.filter({ is_active: true });
      return all.filter(t => !t.is_published);
    },
    enabled: mode === 'resources',
  });

  const items = mode === 'learning' ? unpublishedLearning : unpublishedTemplates;

  if (items.length === 0) return null;

  const visibleItems = expanded ? items : items.slice(0, 6);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#143A50]" />
          <h2 className="text-xl font-bold text-[#143A50]">Coming to the Pipeline</h2>
        </div>
        <Badge className="bg-[#E5C089] text-[#143A50] border-0">{items.length} in development</Badge>
      </div>
      <p className="text-slate-500 text-sm mb-5">
        These {mode === 'learning' ? 'courses, webinars, and workshops' : 'templates and guides'} are actively being built out and will be published soon. No need to request something that's already in the queue!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleItems.map((item) => {
          const name = mode === 'learning' ? item.title : item.template_name;
          const typeKey = mode === 'learning' ? item.content_type : 'template';
          const config = TYPE_CONFIG[typeKey] || TYPE_CONFIG.template;
          const Icon = config.icon;
          const label = mode === 'resources'
            ? (CATEGORY_LABELS[item.category] || item.category)
            : (item.funding_lane ? item.funding_lane.replace('_', ' ') : '');
          const desc = mode === 'learning' ? item.description : item.purpose;

          return (
            <Card
              key={item.id}
              className="border-2 border-dashed border-slate-200 bg-slate-50/60 relative overflow-hidden"
            >
              {/* Coming Soon ribbon */}
              <div className="absolute top-3 right-3">
                <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Coming Soon
                </span>
              </div>

              <CardContent className="p-4 pt-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white border border-slate-200 rounded-lg flex-shrink-0">
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0 pr-20">
                    <p className="font-semibold text-slate-700 text-sm leading-snug">{name}</p>
                    {desc && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{desc}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className={`text-xs border ${config.color}`}>
                        {config.label}
                      </Badge>
                      {label && (
                        <Badge variant="outline" className="text-xs text-slate-500 capitalize">
                          {label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {items.length > 6 && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-[#143A50]"
          >
            {expanded ? (
              <><ChevronUp className="w-4 h-4 mr-1" /> Show Less</>
            ) : (
              <><ChevronDown className="w-4 h-4 mr-1" /> Show All {items.length} Items in Pipeline</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}