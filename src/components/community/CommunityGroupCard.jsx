import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, User, ArrowRight } from 'lucide-react';

const STAGE_COLORS = {
  idea: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  early: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  operating: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  scaling: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
};

const TYPE_LABELS = {
  lab: 'Funding Lab',
  office_hours: 'Office Hours',
  peer_review: 'Peer Review',
  workshop: 'Workshop',
};

export default function CommunityGroupCard({ group, isEligible = true, onJoin }) {
  const stageColor = STAGE_COLORS[group.target_stage] || STAGE_COLORS.early;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border border-slate-200 p-5 ${!isEligible ? 'opacity-60' : 'hover:shadow-lg'} transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <Badge variant="outline" className={`${stageColor.bg} ${stageColor.text} ${stageColor.border}`}>
          {group.target_stage} stage
        </Badge>
        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
          {TYPE_LABELS[group.group_type] || group.group_type}
        </Badge>
      </div>

      <h3 className="font-semibold text-lg text-slate-900 mb-2">{group.name}</h3>
      
      {group.description && (
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{group.description}</p>
      )}

      <div className="space-y-2 mb-4">
        {group.coach_name && (
          <div className="flex items-center text-sm text-slate-600">
            <User className="w-4 h-4 mr-2 text-slate-400" />
            Coach: {group.coach_name}
          </div>
        )}
        {group.meeting_schedule && (
          <div className="flex items-center text-sm text-slate-600">
            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
            {group.meeting_schedule}
          </div>
        )}
        {group.max_members && (
          <div className="flex items-center text-sm text-slate-600">
            <Users className="w-4 h-4 mr-2 text-slate-400" />
            Max {group.max_members} members
          </div>
        )}
      </div>

      <Button
        onClick={() => onJoin?.(group)}
        disabled={!isEligible}
        className={isEligible ? "w-full bg-emerald-600 hover:bg-emerald-700" : "w-full"}
        variant={isEligible ? "default" : "outline"}
      >
        {isEligible ? (
          <>
            Join Group
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        ) : (
          'Not eligible for your stage'
        )}
      </Button>
    </motion.div>
  );
}