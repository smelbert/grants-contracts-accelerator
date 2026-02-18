import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Clock, Edit, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProgramAgendaEditor({ cohort, onSave }) {
  const [sessionDays, setSessionDays] = useState(cohort?.session_days || []);
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);

  const calculateDayTotal = (sections) => {
    return sections?.reduce((total, section) => total + (section.duration_minutes || 0), 0) || 0;
  };

  const addNewDay = () => {
    setSessionDays([...sessionDays, {
      date: '',
      time: '',
      location: '',
      meeting_link: '',
      sections: []
    }]);
  };

  const addNewSection = (dayIndex) => {
    const updatedDays = [...sessionDays];
    updatedDays[dayIndex].sections.push({
      id: `section-${Date.now()}`,
      title: '',
      duration_minutes: 0,
      topics: [],
      facilitator_notes: ''
    });
    setSessionDays(updatedDays);
  };

  const updateDay = (dayIndex, field, value) => {
    const updatedDays = [...sessionDays];
    updatedDays[dayIndex][field] = value;
    setSessionDays(updatedDays);
  };

  const updateSection = (dayIndex, sectionIndex, field, value) => {
    const updatedDays = [...sessionDays];
    updatedDays[dayIndex].sections[sectionIndex][field] = value;
    setSessionDays(updatedDays);
  };

  const deleteDay = (dayIndex) => {
    if (confirm('Delete this entire day?')) {
      setSessionDays(sessionDays.filter((_, idx) => idx !== dayIndex));
    }
  };

  const deleteSection = (dayIndex, sectionIndex) => {
    if (confirm('Delete this section?')) {
      const updatedDays = [...sessionDays];
      updatedDays[dayIndex].sections = updatedDays[dayIndex].sections.filter((_, idx) => idx !== sectionIndex);
      setSessionDays(updatedDays);
    }
  };

  const handleSave = () => {
    onSave({ ...cohort, session_days: sessionDays });
    toast.success('Agenda saved successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Program Agenda Editor</h2>
          <p className="text-slate-600">Build your session-by-session curriculum</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addNewDay} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Session Day
          </Button>
          <Button onClick={handleSave} className="bg-green-600">
            <Save className="w-4 h-4 mr-2" />
            Save Agenda
          </Button>
        </div>
      </div>

      {sessionDays.map((day, dayIdx) => {
        const dayTotal = calculateDayTotal(day.sections);
        
        return (
          <Card key={dayIdx} className="border-l-4 border-l-blue-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-600">Day {dayIdx + 1}</Badge>
                    <Input
                      placeholder="e.g., Monday – March 2"
                      value={day.date}
                      onChange={(e) => updateDay(dayIdx, 'date', e.target.value)}
                      className="flex-1 max-w-xs"
                    />
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dayTotal} min total
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Time (e.g., 5:30-7:30 PM)"
                      value={day.time}
                      onChange={(e) => updateDay(dayIdx, 'time', e.target.value)}
                    />
                    <Input
                      placeholder="Location (optional)"
                      value={day.location || ''}
                      onChange={(e) => updateDay(dayIdx, 'location', e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="Google Meet / Zoom Link (optional)"
                    value={day.meeting_link || ''}
                    onChange={(e) => updateDay(dayIdx, 'meeting_link', e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteDay(dayIdx)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {day.sections?.map((section, sectionIdx) => (
                <Card key={sectionIdx} className="bg-slate-50">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge>{sectionIdx + 1}</Badge>
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-3">
                          <Input
                            placeholder="Section title"
                            value={section.title}
                            onChange={(e) => updateSection(dayIdx, sectionIdx, 'title', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            placeholder="Minutes"
                            value={section.duration_minutes || ''}
                            onChange={(e) => updateSection(dayIdx, sectionIdx, 'duration_minutes', parseInt(e.target.value) || 0)}
                            className="w-28"
                          />
                        </div>
                        <Input
                          placeholder="Section ID (e.g., intro, legal, grants)"
                          value={section.id}
                          onChange={(e) => updateSection(dayIdx, sectionIdx, 'id', e.target.value)}
                        />
                        <Textarea
                          placeholder="Topics (one per line)"
                          value={section.topics?.join('\n') || ''}
                          onChange={(e) => updateSection(dayIdx, sectionIdx, 'topics', e.target.value.split('\n').filter(t => t.trim()))}
                          rows={4}
                        />
                        <Textarea
                          placeholder="Facilitator notes (optional)"
                          value={section.facilitator_notes || ''}
                          onChange={(e) => updateSection(dayIdx, sectionIdx, 'facilitator_notes', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSection(dayIdx, sectionIdx)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => addNewSection(dayIdx)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Section to Day {dayIdx + 1}
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {sessionDays.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600 mb-4">No session days configured yet</p>
            <Button onClick={addNewDay}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Session Day
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}