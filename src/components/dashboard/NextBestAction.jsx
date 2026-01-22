import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowRight, Sparkles, FileText, CheckCircle2, 
  Upload, Search, BookOpen, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const ACTION_CONFIG = {
  pre_funding: {
    primary: {
      icon: Upload,
      title: 'Upload or confirm your governance and financial basics',
      description: 'Start by documenting your organizational foundation. This is step one for any funding pathway.',
      action: 'Go to Profile',
      page: 'Profile',
      color: 'emerald'
    },
    secondary: {
      icon: BookOpen,
      title: 'Watch: "When Not to Apply for Grants"',
      description: 'Understanding what not to do is as important as knowing what to do.',
      action: 'View Learning',
      page: 'Learning',
      color: 'blue'
    }
  },
  grant_eligible: {
    primary: {
      icon: Search,
      title: 'Match your readiness profile to 1–2 aligned opportunities',
      description: 'You\'re ready to explore grant opportunities that fit your current capacity.',
      action: 'Browse Opportunities',
      page: 'Opportunities',
      color: 'emerald'
    },
    secondary: {
      icon: Sparkles,
      title: 'Draft organizational narrative',
      description: 'Build reusable content that strengthens every application.',
      action: 'Use AI Writer',
      page: 'BoilerplateBuilder',
      color: 'violet'
    }
  },
  contract_ready: {
    primary: {
      icon: FileText,
      title: 'Build or update your capability statement',
      description: 'Essential for government contracts and corporate partnerships.',
      action: 'Create Statement',
      page: 'BoilerplateBuilder',
      color: 'emerald'
    },
    secondary: {
      icon: Search,
      title: 'Explore local procurement portals',
      description: 'Contracts often require proactive searching, not waiting for RFPs.',
      action: 'View Resources',
      page: 'Learning',
      color: 'blue'
    }
  },
  relationship_building: {
    primary: {
      icon: Target,
      title: 'Focus on relationship cultivation',
      description: 'Donor and civic funding pathways prioritize trust and connection.',
      action: 'Learn Strategy',
      page: 'Learning',
      color: 'emerald'
    },
    secondary: {
      icon: Sparkles,
      title: 'Refine your pitch materials',
      description: 'Clear, compelling narratives are essential for donor engagement.',
      action: 'Use AI Writer',
      page: 'BoilerplateBuilder',
      color: 'violet'
    }
  },
  scaling: {
    primary: {
      icon: FileText,
      title: 'Prepare for renewal or multi-year funding',
      description: 'Focus on sustainability and long-term impact documentation.',
      action: 'View Templates',
      page: 'Templates',
      color: 'emerald'
    },
    secondary: {
      icon: CheckCircle2,
      title: 'Strengthen evaluation language',
      description: 'Advanced funders expect rigorous outcomes measurement.',
      action: 'Review Resources',
      page: 'Learning',
      color: 'blue'
    }
  }
};

export default function NextBestAction({ readinessStatus = 'pre_funding' }) {
  const config = ACTION_CONFIG[readinessStatus] || ACTION_CONFIG.pre_funding;
  const PrimaryIcon = config.primary.icon;
  const SecondaryIcon = config.secondary.icon;

  return (
    <div className="space-y-4">
      {/* Primary Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-emerald-600">Next Best Action</Badge>
            </div>
            <CardTitle className="text-lg flex items-start gap-3">
              <PrimaryIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{config.primary.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">{config.primary.description}</p>
            <Link to={createPageUrl(config.primary.page)}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 w-full">
                {config.primary.action}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Secondary Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-slate-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3 mb-3">
              <SecondaryIcon className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 mb-1">{config.secondary.title}</h4>
                <p className="text-sm text-slate-600">{config.secondary.description}</p>
              </div>
            </div>
            <Link to={createPageUrl(config.secondary.page)}>
              <Button variant="outline" size="sm" className="w-full">
                {config.secondary.action}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Self-Led Reminder */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm text-blue-700">
          <strong>Self-Led Progress:</strong> These are suggestions, not requirements. 
          Complete items at your own pace—support is available when you need it.
        </AlertDescription>
      </Alert>
    </div>
  );
}