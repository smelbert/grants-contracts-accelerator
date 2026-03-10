import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Zap, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CuratedResourcesPanel({ readinessScore = 0, fundingLane = 'grants' }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        // Fetch learning content curated for readiness level
        let targetStages = [];
        if (readinessScore < 40) {
          targetStages = ['seed', 'growth'];
        } else if (readinessScore < 70) {
          targetStages = ['growth', 'scale'];
        } else {
          targetStages = ['scale'];
        }

        const allResources = await base44.entities.LearningContent.filter(
          {
            funding_lane: fundingLane,
            is_published: true
          },
          'order',
          20
        );

        setResources(allResources.slice(0, 5));
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
      setLoading(false);
    };

    fetchResources();
  }, [readinessScore, fundingLane]);

  const getContentIcon = (type) => {
    const icons = {
      course: '🎓',
      webinar: '📹',
      workshop: '👥',
      template: '📋',
      guidebook: '📖'
    };
    return icons[type] || '📚';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#1E4F58]" />
          Curated Learning Path
        </CardTitle>
        <CardDescription>Resources recommended for your readiness level</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="inline-block w-5 h-5 border-2 border-[#143A50] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : resources.length > 0 ? (
          <>
            {resources.map((resource) => (
              <div key={resource.id} className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getContentIcon(resource.content_type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm line-clamp-1">{resource.title}</p>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{resource.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {resource.content_type}
                      </Badge>
                      {resource.duration_minutes && (
                        <span className="text-xs text-slate-500">{resource.duration_minutes} min</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-slate-200">
              <Link to={createPageUrl('Learning')}>
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  View All Learning
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">No resources available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}