import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function StewardshipCalendar({ plan }) {
  if (!plan) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Please select a plan to view the calendar</p>
        </CardContent>
      </Card>
    );
  }

  const calendarData = plan.annual_calendar || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan.plan_name} - Annual Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {MONTHS.map((month, idx) => {
            const monthActivities = calendarData.filter(a => a.month === month);
            return (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg text-slate-900 mb-3">{month}</h3>
                {monthActivities.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No scheduled activities</p>
                ) : (
                  <div className="space-y-2">
                    {monthActivities.map((activity, actIdx) => (
                      <div key={actIdx} className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{activity.touchpoint}</p>
                            {activity.coordinator && (
                              <p className="text-sm text-slate-600 mt-1">
                                Coordinator: {activity.coordinator}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {activity.segments?.map((seg, segIdx) => (
                              <Badge key={segIdx} variant="outline" className="text-xs">
                                {seg}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}