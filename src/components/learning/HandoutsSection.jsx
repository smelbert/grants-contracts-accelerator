import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, File, Code, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export default function HandoutsSection({ handouts }) {
  const [expanded, setExpanded] = useState({});

  if (!handouts || handouts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No handouts available for this content yet.</p>
        </CardContent>
      </Card>
    );
  }

  const isHtml = (h) => h.source_type === 'html' || (h.html_content && !h.file_url);
  const isLink = (h) => !isHtml(h) && (h.file_url || h.source_type === 'file_url' || h.source_type === 'upload');

  return (
    <div className="space-y-4">
      {handouts.map((handout, idx) => {
        if (isHtml(handout)) {
          const open = expanded[idx];
          return (
            <Card key={idx} className="border-slate-200">
              <CardContent className="p-0">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors rounded-xl"
                  onClick={() => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Code className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{handout.title}</p>
                      {handout.description && <p className="text-xs text-slate-500">{handout.description}</p>}
                    </div>
                  </div>
                  {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {open && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-4">
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: handout.html_content }} />
                    <div className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
                      ©{new Date().getFullYear()} Elbert Innovative Solutions. All rights reserved.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        }

        return (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <File className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900">{handout.title}</h4>
                {handout.description && <p className="text-sm text-slate-500">{handout.description}</p>}
              </div>
              <Button asChild variant="outline" size="sm">
                <a href={handout.file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Open
                </a>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}