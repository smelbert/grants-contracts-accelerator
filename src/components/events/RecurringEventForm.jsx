import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

export default function RecurringEventForm({ formData, setFormData }) {
  const recurrence = formData.recurrence_pattern || {
    frequency: 'weekly',
    interval: 1,
    days_of_week: [],
    end_type: 'never',
    occurrences: 10,
    end_date: ''
  };

  const updateRecurrence = (updates) => {
    setFormData({
      ...formData,
      recurrence_pattern: { ...recurrence, ...updates }
    });
  };

  const daysOfWeek = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' }
  ];

  const toggleDay = (day) => {
    const days = recurrence.days_of_week || [];
    if (days.includes(day)) {
      updateRecurrence({ days_of_week: days.filter(d => d !== day) });
    } else {
      updateRecurrence({ days_of_week: [...days, day] });
    }
  };

  return (
    <div className="space-y-6 border-t pt-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Recurring Event</Label>
          <p className="text-sm text-slate-600">Create multiple event occurrences automatically</p>
        </div>
        <Switch
          checked={formData.is_recurring}
          onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
        />
      </div>

      {formData.is_recurring && (
        <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Repeats</Label>
              <Select
                value={recurrence.frequency}
                onValueChange={(value) => updateRecurrence({ frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Every</Label>
              <Input
                type="number"
                min="1"
                value={recurrence.interval}
                onChange={(e) => updateRecurrence({ interval: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {recurrence.frequency === 'weekly' && (
            <div>
              <Label>On These Days</Label>
              <div className="flex gap-2 mt-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      recurrence.days_of_week?.includes(day.value)
                        ? 'bg-[#143A50] text-white'
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Ends</Label>
            <Select
              value={recurrence.end_type}
              onValueChange={(value) => updateRecurrence({ end_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="after">After a number of occurrences</SelectItem>
                <SelectItem value="on_date">On a specific date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recurrence.end_type === 'after' && (
            <div>
              <Label>Number of Occurrences</Label>
              <Input
                type="number"
                min="1"
                value={recurrence.occurrences}
                onChange={(e) => updateRecurrence({ occurrences: parseInt(e.target.value) })}
              />
            </div>
          )}

          {recurrence.end_type === 'on_date' && (
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={recurrence.end_date}
                onChange={(e) => updateRecurrence({ end_date: e.target.value })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}