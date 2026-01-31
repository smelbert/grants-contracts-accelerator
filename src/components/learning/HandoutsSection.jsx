import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, File } from 'lucide-react';

export default function HandoutsSection({ handouts }) {
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

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {handouts.map((handout, idx) => (
        <Card key={idx} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <File className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 mb-1">{handout.title}</h4>
                {handout.description && (
                  <p className="text-sm text-slate-600 mb-3">{handout.description}</p>
                )}
                {handout.file_type && (
                  <span className="text-xs text-slate-500 uppercase">{handout.file_type}</span>
                )}
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full mt-4"
            >
              <a href={handout.file_url} download target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}