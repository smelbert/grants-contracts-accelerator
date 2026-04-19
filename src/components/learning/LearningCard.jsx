import React from 'react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Play, Lock, BookOpen, Video, FileText, Users, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const TYPE_CONFIG = {
  course: { icon: BookOpen, label: 'Course' },
  webinar: { icon: Video, label: 'Webinar' },
  workshop: { icon: Users, label: 'Workshop' },
  guidebook: { icon: FileText, label: 'Workbook' },
  mini_workbook: { icon: FileText, label: 'Mini-Workbook' },
  template: { icon: FileText, label: 'Template' },
};

const LANE_COLORS = {
  grants: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  contracts: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  donors: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  public_funds: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  general: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

export default function LearningCard({ content, isPremium = false, hasAccess = true, onStart, hideDuration = false }) {
  const TypeIcon = TYPE_CONFIG[content.content_type]?.icon || BookOpen;
  const laneColor = LANE_COLORS[content.funding_lane] || LANE_COLORS.general;
  const [exportingPDF, setExportingPDF] = useState(false);

  const handleDownloadPDF = async (e) => {
    e.stopPropagation();
    setExportingPDF(true);
    try {
      const response = await base44.functions.invoke('exportCoursePDF', { courseId: content.id });
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.title?.replace(/[^a-z0-9]/gi, '_') || 'course'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch {
      toast.error('PDF export failed');
    } finally {
      setExportingPDF(false);
    }
  };

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
          {!hideDuration && content.duration_minutes && (
            <div className="flex items-center text-sm text-slate-500">
              <Clock className="w-4 h-4 mr-1" />
              {content.duration_minutes} min
            </div>
          )}
          
          <div className="flex items-center gap-1.5">
          {hasAccess && content.id && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownloadPDF}
              disabled={exportingPDF}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
              title="Download PDF"
            >
              {exportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </Button>
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
      </div>
    </motion.div>
  );
}