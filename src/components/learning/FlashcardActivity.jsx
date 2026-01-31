import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlashcardActivity({ activity }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState(new Set());

  const cards = activity.items || [];
  const currentCard = cards[currentIndex];
  const progress = (mastered.size / cards.length) * 100;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleMastered = () => {
    setMastered(new Set([...mastered, currentCard.id]));
    handleNext();
  };

  if (!cards.length) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-2">
            Progress: {mastered.size} / {cards.length} mastered
          </p>
          <Progress value={progress} className="h-2" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMastered(new Set())}
          className="ml-4"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={handlePrev}>
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div 
          onClick={() => setIsFlipped(!isFlipped)}
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
              <Card className={`w-full h-full ${mastered.has(currentCard.id) ? 'border-emerald-400 border-2' : 'border-slate-200'}`}>
                <CardContent className="flex flex-col items-center justify-center h-full p-8">
                  <p className="text-xs text-slate-500 mb-4">
                    {isFlipped ? 'Answer' : 'Question'} • Card {currentIndex + 1} of {cards.length}
                  </p>
                  <p className="text-2xl font-semibold text-center text-slate-900">
                    {isFlipped ? (currentCard.answer || currentCard.definition) : (currentCard.question || currentCard.term)}
                  </p>
                  <p className="text-sm text-slate-500 mt-6">Click to flip</p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => setIsFlipped(!isFlipped)}>
          Flip Card
        </Button>
        {!mastered.has(currentCard.id) && (
          <Button onClick={handleMastered} className="bg-emerald-600 hover:bg-emerald-700">
            Mark as Mastered
          </Button>
        )}
      </div>
    </div>
  );
}