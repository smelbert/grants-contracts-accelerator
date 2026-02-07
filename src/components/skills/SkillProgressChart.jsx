import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function SkillProgressChart({ skill }) {
  if (!skill || !skill.progression_history || skill.progression_history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-slate-600">No progression history available</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = skill.progression_history
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(entry => ({
      date: format(new Date(entry.date), 'MMM d, yyyy'),
      level: entry.level,
      source: entry.source
    }));

  const getSourceColor = (source) => {
    switch (source) {
      case 'self_assessment': return '#3b82f6';
      case 'coach_validation': return '#10b981';
      case 'ai_calculation': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const latestEntry = skill.progression_history[skill.progression_history.length - 1];
  const firstEntry = skill.progression_history[0];
  const growth = latestEntry.level - firstEntry.level;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{skill.skill_name}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Skill Progression Over Time</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-lg font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-slate-500">Total Growth</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <YAxis 
                domain={[0, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="level" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 6, fill: '#3b82f6' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-slate-900">Assessment History</p>
          {skill.progression_history.slice().reverse().map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">{entry.level}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {entry.source.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(entry.date), 'MMM d, yyyy')}
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-slate-600 mt-1">{entry.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}