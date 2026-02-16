import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { WORKBOOK_PAGES, getSections } from './workbookContent';

export default function WorkbookProgressTracker({ responses, currentPageId, onPageSelect }) {
  const sections = getSections();
  
  const calculateProgress = () => {
    const totalPages = WORKBOOK_PAGES.filter(p => p.fields && p.fields.length > 0).length;
    const completedPages = WORKBOOK_PAGES.filter(p => {
      if (!p.fields || p.fields.length === 0) return false;
      return p.fields.every(field => {
        const response = responses?.[p.id]?.[field.id];
        return response !== undefined && response !== '' && response !== null;
      });
    }).length;
    
    return {
      total: totalPages,
      completed: completedPages,
      percentage: totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0
    };
  };

  const calculateSectionProgress = (section) => {
    const sectionPages = WORKBOOK_PAGES.filter(p => p.section === section && p.fields && p.fields.length > 0);
    const completedPages = sectionPages.filter(p => {
      return p.fields.every(field => {
        const response = responses?.[p.id]?.[field.id];
        return response !== undefined && response !== '' && response !== null;
      });
    }).length;
    
    return {
      total: sectionPages.length,
      completed: completedPages,
      percentage: sectionPages.length > 0 ? Math.round((completedPages / sectionPages.length) * 100) : 0
    };
  };

  const isPageCompleted = (page) => {
    if (!page.fields || page.fields.length === 0) return true;
    return page.fields.every(field => {
      const response = responses?.[page.id]?.[field.id];
      return response !== undefined && response !== '' && response !== null;
    });
  };

  const progress = calculateProgress();

  return (
    <Card className="border-2 border-[#E5C089] shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white pb-4">
        <CardTitle className="text-lg">Workbook Progress</CardTitle>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/90">Overall Completion</span>
            <span className="text-sm font-bold text-[#E5C089]">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-3 bg-white/20" />
          <p className="text-xs text-white/70 mt-2">{progress.completed} of {progress.total} pages completed</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 max-h-[600px] overflow-y-auto">
        <div className="space-y-4">
          {sections.map((section) => {
            const sectionProgress = calculateSectionProgress(section);
            const sectionPages = WORKBOOK_PAGES.filter(p => p.section === section);
            
            return (
              <div key={section} className="border-b border-slate-200 pb-4 last:border-b-0">
                <div className="mb-2">
                  <h4 className="text-sm font-semibold text-[#143A50] mb-1">{section}</h4>
                  <div className="flex items-center gap-2">
                    <Progress value={sectionProgress.percentage} className="h-2 flex-1" />
                    <span className="text-xs text-slate-600 whitespace-nowrap">{sectionProgress.percentage}%</span>
                  </div>
                </div>
                <div className="space-y-1 ml-2">
                  {sectionPages.map((page) => {
                    const isCompleted = isPageCompleted(page);
                    const isCurrent = page.id === currentPageId;
                    
                    return (
                      <button
                        key={page.id}
                        onClick={() => onPageSelect(page.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                          isCurrent 
                            ? 'bg-[#E5C089]/20 border-l-4 border-[#143A50]' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                        )}
                        <span className={`text-xs flex-1 ${isCurrent ? 'font-semibold text-[#143A50]' : 'text-slate-700'}`}>
                          {page.title}
                        </span>
                        {isCurrent && <ChevronRight className="w-4 h-4 text-[#143A50]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}