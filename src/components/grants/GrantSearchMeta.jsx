import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Database, AlertTriangle } from 'lucide-react';

export default function GrantSearchMeta({ meta, rateLimitInfo }) {
  if (!meta) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <Badge variant="outline" className="gap-1.5 font-normal">
        <Database className="w-3.5 h-3.5" />
        {meta.total} result{meta.total !== 1 ? 's' : ''} found
      </Badge>

      {meta.cache_hit && (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 font-normal">
          <Zap className="w-3.5 h-3.5" />
          Cached (free)
        </Badge>
      )}

      {meta.db_only && (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5 font-normal">
          <AlertTriangle className="w-3.5 h-3.5" />
          Database only (AI limit reached)
        </Badge>
      )}

      {meta.ai_searches_used !== undefined && meta.ai_searches_limit !== undefined && (
        <span className="text-slate-500">
          AI searches: {meta.ai_searches_used}/{meta.ai_searches_limit} today
        </span>
      )}

      {rateLimitInfo?.tier && (
        <Badge variant="outline" className="capitalize font-normal text-xs">
          {rateLimitInfo.tier} tier
        </Badge>
      )}
    </div>
  );
}