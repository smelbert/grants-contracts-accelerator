import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Trash2 } from 'lucide-react';

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' }
];

const COLORS = ['#143A50', '#AC1A5B', '#E5C089', '#1E4F58', '#A65D40', '#B5A698'];

export default function ChartBuilder({ value = {}, onChange, readOnly = false }) {
  const [chartConfig, setChartConfig] = useState(value.type ? value : {
    type: 'bar',
    title: '',
    data: [
      { name: 'Category 1', value: 0 },
      { name: 'Category 2', value: 0 }
    ]
  });

  const updateConfig = (updates) => {
    const newConfig = { ...chartConfig, ...updates };
    setChartConfig(newConfig);
    onChange(newConfig);
  };

  const updateDataPoint = (index, field, value) => {
    const newData = [...chartConfig.data];
    newData[index][field] = field === 'value' ? parseFloat(value) || 0 : value;
    updateConfig({ data: newData });
  };

  const addDataPoint = () => {
    const newData = [...chartConfig.data, { name: `Category ${chartConfig.data.length + 1}`, value: 0 }];
    updateConfig({ data: newData });
  };

  const removeDataPoint = (index) => {
    if (chartConfig.data.length <= 1) return;
    const newData = chartConfig.data.filter((_, i) => i !== index);
    updateConfig({ data: newData });
  };

  const renderChart = () => {
    if (!chartConfig.data || chartConfig.data.length === 0) return null;

    switch (chartConfig.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartConfig.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#143A50" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartConfig.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#143A50" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartConfig.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartConfig.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  if (readOnly) {
    return (
      <Card>
        {chartConfig.title && (
          <CardHeader>
            <CardTitle className="text-lg">{chartConfig.title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Chart Type</Label>
          <Select value={chartConfig.type} onValueChange={(type) => updateConfig({ type })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHART_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Chart Title</Label>
          <Input
            value={chartConfig.title}
            onChange={(e) => updateConfig({ title: e.target.value })}
            placeholder="Enter chart title"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Data Points</Label>
        {chartConfig.data.map((point, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Label"
              value={point.name}
              onChange={(e) => updateDataPoint(index, 'name', e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Value"
              value={point.value}
              onChange={(e) => updateDataPoint(index, 'value', e.target.value)}
              className="w-32"
            />
            {chartConfig.data.length > 1 && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeDataPoint(index)}
                className="text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={addDataPoint}>
          <Plus className="w-4 h-4 mr-1" />
          Add Data Point
        </Button>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-sm text-slate-600">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  );
}