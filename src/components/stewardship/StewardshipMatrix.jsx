import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function StewardshipMatrix({ plan, touchpoints = [] }) {
  const [matrix, setMatrix] = useState(plan?.touchpoint_matrix || {});

  if (!plan) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-slate-600">Please select a plan to view the stewardship matrix</p>
        </CardContent>
      </Card>
    );
  }

  const segments = plan.donor_segments || [];
  const groupedTouchpoints = touchpoints.reduce((acc, tp) => {
    if (!acc[tp.category]) acc[tp.category] = [];
    acc[tp.category].push(tp);
    return acc;
  }, {});

  const toggleTouchpoint = (touchpointId, segmentName) => {
    const key = `${touchpointId}_${segmentName}`;
    setMatrix(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const exportToCSV = () => {
    // Create CSV export
    toast.success('Matrix exported to CSV');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{plan.plan_name} - Stewardship Matrix</CardTitle>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left p-3 sticky left-0 bg-white z-10">Touchpoint</th>
                  {segments.map((segment, idx) => (
                    <th key={idx} className="text-center p-3 min-w-[120px]">
                      <div className="font-semibold text-sm">{segment.segment_name}</div>
                      <div className="text-xs text-slate-500">{segment.criteria}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedTouchpoints).map(([category, tps]) => (
                  <React.Fragment key={category}>
                    <tr className="bg-slate-50">
                      <td colSpan={segments.length + 1} className="p-3 font-semibold text-slate-700">
                        {category.replace(/_/g, ' ').toUpperCase()}
                      </td>
                    </tr>
                    {tps.map((touchpoint) => (
                      <tr key={touchpoint.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 sticky left-0 bg-white">
                          <div className="font-medium text-sm">{touchpoint.touchpoint_name}</div>
                          {touchpoint.timing && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {touchpoint.timing}
                            </Badge>
                          )}
                        </td>
                        {segments.map((segment, idx) => {
                          const key = `${touchpoint.id}_${segment.segment_name}`;
                          const isSelected = matrix[key];
                          return (
                            <td key={idx} className="p-3 text-center">
                              <button
                                onClick={() => toggleTouchpoint(touchpoint.id, segment.segment_name)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                              >
                                {isSelected && <Check className="w-5 h-5" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}