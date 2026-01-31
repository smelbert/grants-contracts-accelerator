import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, RotateCcw, Calendar, Brain, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addDays, format, isPast, parseISO } from 'date-fns';

// SM-2 Spaced Repetition Algorithm
const calculateNextReview = (quality, easeFactor, interval, repetitions) => {
  let newEaseFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  let newInterval, newRepetitions;

  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = repetitions + 1;
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate: addDays(new Date(), newInterval).toISOString()
  };
};

export default function SpacedRepetitionFlashcards({ activity, userEmail }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const queryClient = useQueryClient();

  const cards = activity.items || [];

  // Fetch spaced repetition data
  const { data: srData = [] } = useQuery({
    queryKey: ['spaced-repetition', userEmail, activity.id],
    queryFn: () => base44.entities.SpacedRepetition.filter({ 
      user_email: userEmail,
      activity_id: activity.id 
    }),
    enabled: !!userEmail,
  });

  // Find cards due for review
  const getDueCards = () => {
    const now = new Date();
    return cards.filter(card => {
      const srCard = srData.find(sr => sr.card_id === card.id);
      if (!srCard) return true; // New cards are due
      return isPast(parseISO(srCard.next_review_date));
    });
  };

  const dueCards = getDueCards();
  const currentCard = dueCards[currentIndex] || cards[0];
  const currentSR = srData.find(sr => sr.card_id === currentCard?.id);

  // Create or update SR record
  const updateSRMutation = useMutation({
    mutationFn: async ({ cardId, quality }) => {
      const existing = srData.find(sr => sr.card_id === cardId);
      const nextReview = calculateNextReview(
        quality,
        existing?.ease_factor || 2.5,
        existing?.interval_days || 1,
        existing?.repetitions || 0
      );

      const data = {
        user_email: userEmail,
        activity_id: activity.id,
        card_id: cardId,
        ease_factor: nextReview.easeFactor,
        interval_days: nextReview.interval,
        repetitions: nextReview.repetitions,
        next_review_date: nextReview.nextReviewDate,
        last_review_date: new Date().toISOString(),
        quality_history: [
          ...(existing?.quality_history || []),
          { quality, date: new Date().toISOString() }
        ]
      };

      if (existing) {
        return base44.entities.SpacedRepetition.update(existing.id, data);
      } else {
        return base44.entities.SpacedRepetition.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaced-repetition'] });
      setShowRating(false);
      setIsFlipped(false);
      if (currentIndex < dueCards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(0);
      }
    }
  });

  const handleRating = (quality) => {
    updateSRMutation.mutate({ cardId: currentCard.id, quality });
  };

  const handleNext = () => {
    setIsFlipped(false);
    setShowRating(false);
    setCurrentIndex((prev) => (prev + 1) % dueCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowRating(false);
    setCurrentIndex((prev) => (prev - 1 + dueCards.length) % dueCards.length);
  };

  if (!cards.length) return null;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{dueCards.length}</p>
            <p className="text-sm text-slate-600">Due Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{srData.length}</p>
            <p className="text-sm text-slate-600">Total Reviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">
              {currentSR ? Math.round(currentSR.ease_factor * 100) : 250}%
            </p>
            <p className="text-sm text-slate-600">Retention</p>
          </CardContent>
        </Card>
      </div>

      {dueCards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">All Done!</h3>
            <p className="text-slate-600 mb-4">No cards due for review right now.</p>
            <Button onClick={() => setCurrentIndex(0)} variant="outline">
              Review All Cards
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-600 mb-2">
                Progress: {currentIndex + 1} / {dueCards.length} cards
              </p>
              <Progress value={((currentIndex + 1) / dueCards.length) * 100} className="h-2" />
            </div>
            {currentSR && (
              <Badge variant="outline" className="ml-4">
                Next review: {format(parseISO(currentSR.next_review_date), 'MMM d')}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="icon" onClick={handlePrev} disabled={dueCards.length === 1}>
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div 
              onClick={() => {
                if (!isFlipped) {
                  setIsFlipped(true);
                  setShowRating(true);
                }
              }}
              className="w-full max-w-2xl h-80 cursor-pointer perspective-1000"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isFlipped ? 'back' : 'front'}
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: -90 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <Card className="w-full h-full border-2 border-blue-200">
                    <CardContent className="flex flex-col items-center justify-center h-full p-8">
                      <p className="text-xs text-slate-500 mb-4">
                        {isFlipped ? 'Answer' : 'Question'} • Card {currentIndex + 1} of {dueCards.length}
                      </p>
                      <p className="text-2xl font-semibold text-center text-slate-900">
                        {isFlipped ? (currentCard.answer || currentCard.definition) : (currentCard.question || currentCard.term)}
                      </p>
                      <p className="text-sm text-slate-500 mt-6">
                        {isFlipped ? 'Rate your recall' : 'Click to reveal answer'}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>

            <Button variant="outline" size="icon" onClick={handleNext} disabled={dueCards.length === 1}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {showRating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-2"
            >
              <Button
                variant="outline"
                onClick={() => handleRating(0)}
                className="border-red-300 hover:bg-red-50"
              >
                Again
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRating(3)}
                className="border-yellow-300 hover:bg-yellow-50"
              >
                Hard
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRating(4)}
                className="border-blue-300 hover:bg-blue-50"
              >
                Good
              </Button>
              <Button
                onClick={() => handleRating(5)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Easy
              </Button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

import { CheckCircle2 } from 'lucide-react';