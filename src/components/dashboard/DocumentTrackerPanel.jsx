import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, XCircle, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DocumentTrackerPanel({ checklist }) {
  if (!checklist || !checklist.checklist_items) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Readiness Tracker
          </CardTitle>
          <CardDescription>Track required documents for grant applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">No documents tracked yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = checklist.checklist_items || [];
  const completed = items.filter(i => i.status === 'approved' || i.completed).length;
  const percentComplete = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  const getStatusIcon = (item) => {
    if (item.status === 'approved' || item.completed) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    }
    if (item.status === 'missing' && item.required) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    if (item.status === 'uploaded' || item.status === 'submitted_for_review') {
      return <AlertCircle className="w-5 h-5 text-amber-600" />;
    }
    return <AlertCircle className="w-5 h-5 text-slate-400" />;
  };

  const getStatusLabel = (item) => {
    if (item.status === 'approved' || item.completed) return 'Complete';
    if (item.status === 'missing') return 'Missing';
    if (item.status === 'uploaded' || item.status === 'submitted_for_review') return 'Pending Review';
    if (item.status === 'needs_revision') return 'Needs Revision';
    return 'Not Started';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Document Readiness Tracker
        </CardTitle>
        <CardDescription>Track required documents for grant applications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Grant Readiness</span>
            <span className="font-medium text-slate-900">{percentComplete}% complete</span>
          </div>
          <Progress value={percentComplete} className="h-2" />
        </div>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={item.item_id || idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              {getStatusIcon(item)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="font-medium text-slate-900 text-sm">{item.item_name}</p>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {getStatusLabel(item)}
                  </Badge>
                </div>
                {item.item_description && (
                  <p className="text-xs text-slate-600 line-clamp-1">{item.item_description}</p>
                )}
                {item.requires_upload && item.status === 'missing' && (
                  <div className="mt-1">
                    <Link to={createPageUrl('Documents')}>
                      <Button size="sm" variant="outline" className="h-6 text-xs">
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-200">
          <Link to={createPageUrl('Documents')}>
            <Button className="w-full bg-[#143A50] hover:bg-[#1E4F58]" size="sm">
              View All Documents
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}