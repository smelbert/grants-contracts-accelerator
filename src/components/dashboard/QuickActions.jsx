import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { FileText, Search, BookOpen, Users, Sparkles, Calendar } from 'lucide-react';

const ACTIONS = [
  {
    id: 'boilerplate',
    title: 'AI Writer',
    description: 'Generate proposal content',
    icon: Sparkles,
    page: 'BoilerplateBuilder',
    color: 'violet',
  },
  {
    id: 'opportunities',
    title: 'Find Funding',
    description: 'Browse opportunities',
    icon: Search,
    page: 'Opportunities',
    color: 'emerald',
  },
  {
    id: 'learning',
    title: 'Learning Hub',
    description: 'Courses & workshops',
    icon: BookOpen,
    page: 'Learning',
    color: 'blue',
  },
  {
    id: 'community',
    title: 'Community',
    description: 'Coaching & peer groups',
    icon: Users,
    page: 'Community',
    color: 'amber',
  },
];

const colorMap = {
  violet: {
    bg: 'bg-violet-50 hover:bg-violet-100',
    icon: 'bg-violet-100',
    text: 'text-violet-600',
  },
  emerald: {
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    icon: 'bg-emerald-100',
    text: 'text-emerald-600',
  },
  blue: {
    bg: 'bg-blue-50 hover:bg-blue-100',
    icon: 'bg-blue-100',
    text: 'text-blue-600',
  },
  amber: {
    bg: 'bg-amber-50 hover:bg-amber-100',
    icon: 'bg-amber-100',
    text: 'text-amber-600',
  },
};

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {ACTIONS.map((action, index) => {
        const colors = colorMap[action.color];
        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={createPageUrl(action.page)}>
              <div className={`p-4 rounded-xl ${colors.bg} transition-all duration-200 group`}>
                <div className={`p-2 rounded-lg ${colors.icon} w-fit`}>
                  <action.icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <h4 className="mt-3 font-medium text-slate-900 text-sm">{action.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}