import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, BookOpen, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CurriculumViewer({ sections }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState(new Set());

  if (!sections || sections.length === 0) return null;

  const section = sections[currentSection];
  const progress = (completedSections.size / sections.length) * 100;

  const handleComplete = () => {
    setCompletedSections(new Set([...completedSections, currentSection]));
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Course Progress</span>
            <span className="text-sm text-slate-600">{completedSections.size} / {sections.length} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Section Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {sections.map((sect, idx) => (
          <Button
            key={idx}
            variant={currentSection === idx ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentSection(idx)}
            className="justify-start"
          >
            {completedSections.has(idx) ? (
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
            ) : (
              <Circle className="w-4 h-4 mr-2" />
            )}
            Section {idx + 1}
          </Button>
        ))}
      </div>

      {/* Current Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {section.title}
              </CardTitle>
              {section.duration_minutes && (
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  {section.duration_minutes} minutes
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {section.description && (
                <p className="text-slate-600 italic">{section.description}</p>
              )}
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-slate-700">{section.content}</div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                  disabled={currentSection === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                {!completedSections.has(currentSection) && (
                  <Button
                    onClick={handleComplete}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                )}

                <Button
                  onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                  disabled={currentSection === sections.length - 1}
                  className="ml-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}