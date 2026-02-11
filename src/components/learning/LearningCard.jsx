import React from 'react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Play, Lock, BookOpen, Video, FileText, Users } from 'lucide-react';

const TYPE_CONFIG = {
  course: { icon: BookOpen, label: 'Course' },
  webinar: { icon: Video, label: 'Webinar' },
  workshop: { icon: Users, label: 'Workshop' },
  guide: { icon: FileText, label: 'Guide' },
  template: { icon: FileText, label: 'Template' },
};

const LANE_COLORS = {
  grants: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  contracts: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  donors: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  public_funds: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  general: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

export default function LearningCard({ content, isPremium = false, hasAccess = true, onStart }) {
  const TypeIcon = TYPE_CONFIG[content.content_type]?.icon || BookOpen;
  const laneColor = LANE_COLORS[content.funding_lane] || LANE_COLORS.general;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
        {content.thumbnail_url ? (
          <img 
            src={content.thumbnail_url} 
            alt={content.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon className="w-12 h-12 text-slate-300" />
          </div>
        )}
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            <TypeIcon className="w-3 h-3 mr-1" />
            {TYPE_CONFIG[content.content_type]?.label}
          </Badge>
        </div>

        {isPremium && !hasAccess && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
            <div className="text-center text-white">
              <Lock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Premium Content</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Lane badge */}
        <Badge variant="outline" className={`${laneColor.bg} ${laneColor.text} ${laneColor.border} mb-3`}>
          {content.funding_lane?.replace('_', ' ')}
        </Badge>

        <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">{content.title}</h3>
        
        {content.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">{content.description}</p>
        )}

        <div className="flex items-center justify-between">
          {content.duration_minutes && (
            <div className="flex items-center text-sm text-slate-500">
              <Clock className="w-4 h-4 mr-1" />
              {content.duration_minutes} min
            </div>
          )}
          
          <Button
            size="sm"
            variant={hasAccess ? "default" : "outline"}
            onClick={() => {
              if (content.incubateher_only) {
                window.location.href = createPageUrl('IncubateHerCourse') + '?id=' + content.id + '&from=learning';
              } else {
                window.location.href = createPageUrl('LearningModule') + '?id=' + content.id;
              }
            }}
            disabled={isPremium && !hasAccess}
            className={hasAccess ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            {hasAccess ? (
              <>
                <Play className="w-4 h-4 mr-1" />
                {content.incubateher_only ? 'Start Module' : 'Start'}
              </>
            ) : (
              'Upgrade'
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}