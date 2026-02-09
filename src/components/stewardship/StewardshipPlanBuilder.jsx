import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function StewardshipPlanBuilder({ plan, touchpoints, onSave, onCancel }) {
  const [planName, setPlanName] = useState(plan?.plan_name || '');
  const [fiscalYear, setFiscalYear] = useState(plan?.fiscal_year || new Date().getFullYear().toString());
  const [planType, setPlanType] = useState(plan?.plan_type || 'full_stewardship');
  const [donorSegments, setDonorSegments] = useState(plan?.donor_segments || [
    { segment_name: 'General Donors', criteria: '$0-$249', gift_range_min: 0, gift_range_max: 249 },
    { segment_name: 'Mid-Level', criteria: '$250-$999', gift_range_min: 250, gift_range_max: 999 },
    { segment_name: 'Major Donors', criteria: '$1,000+', gift_range_min: 1000, gift_range_max: null }
  ]);

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (plan?.id) {
        return base44.entities.DonorStewardshipPlan.update(plan.id, data);
      }
      return base44.entities.DonorStewardshipPlan.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stewardship-plans']);
      toast.success(plan ? 'Plan updated' : 'Plan created');
      onSave();
    }
  });

  const handleSubmit = () => {
    if (!planName) {
      toast.error('Please enter a plan name');
      return;
    }

    saveMutation.mutate({
      plan_name: planName,
      fiscal_year: fiscalYear,
      plan_type: planType,
      donor_segments: donorSegments,
      is_active: true
    });
  };

  const addSegment = () => {
    setDonorSegments([...donorSegments, {
      segment_name: '',
      criteria: '',
      gift_range_min: 0,
      gift_range_max: null
    }]);
  };

  const updateSegment = (index, field, value) => {
    const updated = [...donorSegments];
    updated[index][field] = value;
    setDonorSegments(updated);
  };

  const removeSegment = (index) => {
    setDonorSegments(donorSegments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{plan ? 'Edit' : 'Create'} Stewardship Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Plan Name</Label>
              <Input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g., FY2026 Donor Stewardship Plan"
              />
            </div>
            <div>
              <Label>Fiscal Year</Label>
              <Input
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                placeholder="2026"
              />
            </div>
          </div>

          <div>
            <Label>Plan Type</Label>
            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acknowledgement">Acknowledgement Plan</SelectItem>
                <SelectItem value="donor_experience">Donor Experience Plan</SelectItem>
                <SelectItem value="full_stewardship">Full Stewardship Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Donor Segments</CardTitle>
            <Button size="sm" onClick={addSegment}>
              <Plus className="w-4 h-4 mr-2" />
              Add Segment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {donorSegments.map((segment, index) => (
            <Card key={index} className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <Input
                    placeholder="Segment Name (e.g., Major Donors)"
                    value={segment.segment_name}
                    onChange={(e) => updateSegment(index, 'segment_name', e.target.value)}
                  />
                  <Input
                    placeholder="Criteria (e.g., $1,000+)"
                    value={segment.criteria}
                    onChange={(e) => updateSegment(index, 'criteria', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min Amount"
                      value={segment.gift_range_min || ''}
                      onChange={(e) => updateSegment(index, 'gift_range_min', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      type="number"
                      placeholder="Max Amount (optional)"
                      value={segment.gift_range_max || ''}
                      onChange={(e) => updateSegment(index, 'gift_range_max', e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeSegment(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? 'Saving...' : 'Save Plan'}
        </Button>
      </div>
    </div>
  );
}