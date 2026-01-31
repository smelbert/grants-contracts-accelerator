import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AlertTriangle, TrendingDown, BookOpen, ArrowRight, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonalizedLearningPath({ userEmail, currentModuleId }) {
  const queryClient = useQueryClient();

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress-all', userEmail],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: userEmail }),
    enabled: !!userEmail,
  });

  const { data: srData = [] } = useQuery({
    queryKey: ['all-sr-data', userEmail],
    queryFn: () => base44.entities.SpacedRepetition.filter({ user_email: userEmail }),
    enabled: !!userEmail,
  });

  const { data: allContent = [] } = useQuery({
    queryKey: ['all-learning-content'],
    queryFn: () => base44.entities.LearningContent.list(),
  });

  const { data: allActivities = [] } = useQuery({
    queryKey: ['all-learning-activities'],
    queryFn: () => base44.entities.LearningActivity.list(),
  });

  // Analyze weak areas
  const getWeakAreas = () => {
    const weakModules = userProgress.filter(progress => {
      const avgScore = progress.quiz_scores?.length > 0
        ? progress.quiz_scores.reduce((sum, s) => sum + s.score, 0) / progress.quiz_scores.length
        : null;
      return avgScore !== null && avgScore < 80;
    });

    const weakCards = srData.filter(sr => 
      sr.ease_factor < 2.0 || // Low retention
      (sr.quality_history?.slice(-3).filter(h => h.quality < 3).length >= 2) // Recent struggles
    );

    return { weakModules, weakCards };
  };

  const { weakModules, weakCards } = getWeakAreas();

  // Get remedial recommendations
  const getRemedialContent = () => {
    const recommendations = [];

    weakModules.forEach(progress => {
      const module = allContent.find(c => c.id === progress.learning_content_id);
      if (module) {
        // Find related content in same lane/category
        const relatedContent = allContent.filter(c => 
          c.id !== module.id &&
          c.funding_lane === module.funding_lane &&
          !userProgress.find(p => p.learning_content_id === c.id && p.completed)
        );
        
        recommendations.push({
          type: 'remedial',
          originalModule: module,
          suggestedContent: relatedContent.slice(0, 2),
          reason: `Low quiz performance (${Math.round(progress.quiz_scores?.reduce((sum, s) => sum + s.score, 0) / progress.quiz_scores?.length || 0)}% avg)`
        });
      }
    });

    return recommendations;
  };

  const remedialContent = getRemedialContent();

  if (remedialContent.length === 0 && weakCards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Weak Performance Alert */}
      {weakModules.length > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-orange-900">
            We noticed you scored below 80% in {weakModules.length} module{weakModules.length > 1 ? 's' : ''}. 
            Review the recommendations below to strengthen your knowledge.
          </AlertDescription>
        </Alert>
      )}

      {/* Remedial Recommendations */}
      {remedialContent.map((rec, idx) => (
        <Card key={idx} className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="w-5 h-5 text-orange-600" />
              Strengthen: {rec.originalModule.title}
            </CardTitle>
            <p className="text-sm text-slate-600">{rec.reason}</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-slate-700 mb-3">Recommended Review:</p>
            <div className="space-y-2">
              {rec.suggestedContent.length === 0 ? (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={createPageUrl('LearningModule') + '?id=' + rec.originalModule.id}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Re-take this module
                  </Link>
                </Button>
              ) : (
                rec.suggestedContent.map(content => (
                  <Button 
                    key={content.id} 
                    asChild 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-between"
                  >
                    <Link to={createPageUrl('LearningModule') + '?id=' + content.id}>
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {content.title}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Struggling Cards Alert */}
      {weakCards.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-medium text-blue-900">
                  {weakCards.length} flashcards need more practice
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Cards with low retention will appear more frequently in your reviews
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}