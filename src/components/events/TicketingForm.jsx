import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, DollarSign } from 'lucide-react';

export default function TicketingForm({ formData, setFormData }) {
  const [newTier, setNewTier] = useState({
    tier_name: '',
    description: '',
    price: 0,
    max_tickets: null,
    benefits: []
  });

  const tiers = formData.ticket_tiers || [];

  const addTier = () => {
    if (!newTier.tier_name) return;
    setFormData({
      ...formData,
      ticket_tiers: [...tiers, { ...newTier, sold_tickets: 0 }]
    });
    setNewTier({
      tier_name: '',
      description: '',
      price: 0,
      max_tickets: null,
      benefits: []
    });
  };

  const removeTier = (index) => {
    setFormData({
      ...formData,
      ticket_tiers: tiers.filter((_, i) => i !== index)
    });
  };

  const addBenefit = (tierIndex) => {
    const benefit = prompt('Enter benefit:');
    if (benefit) {
      const updatedTiers = [...tiers];
      updatedTiers[tierIndex].benefits = [...(updatedTiers[tierIndex].benefits || []), benefit];
      setFormData({ ...formData, ticket_tiers: updatedTiers });
    }
  };

  return (
    <div className="space-y-6 border-t pt-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Event Ticketing</Label>
          <p className="text-sm text-slate-600">Set up paid or free ticket tiers for your event</p>
        </div>
        <Switch
          checked={formData.ticketing_enabled}
          onCheckedChange={(checked) => setFormData({ ...formData, ticketing_enabled: checked })}
        />
      </div>

      {formData.ticketing_enabled && (
        <div className="space-y-6">
          {/* Existing Tiers */}
          {tiers.length > 0 && (
            <div className="space-y-3">
              <Label>Ticket Tiers</Label>
              {tiers.map((tier, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{tier.tier_name}</h4>
                          <span className="text-lg font-bold text-[#143A50]">
                            {tier.price === 0 ? 'Free' : `$${tier.price}`}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{tier.description}</p>
                        {tier.max_tickets && (
                          <p className="text-xs text-slate-500">
                            Max: {tier.max_tickets} tickets
                          </p>
                        )}
                        {tier.benefits?.length > 0 && (
                          <ul className="text-xs text-slate-600 mt-2 space-y-1">
                            {tier.benefits.map((benefit, i) => (
                              <li key={i}>✓ {benefit}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTier(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add New Tier */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-4">
            <Label>Add Ticket Tier</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Tier Name *</Label>
                <Input
                  value={newTier.tier_name}
                  onChange={(e) => setNewTier({ ...newTier, tier_name: e.target.value })}
                  placeholder="e.g., Early Bird, VIP, General"
                />
              </div>
              <div>
                <Label className="text-sm">Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newTier.price}
                  onChange={(e) => setNewTier({ ...newTier, price: parseFloat(e.target.value) })}
                  placeholder="0 for free"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Description</Label>
              <Textarea
                value={newTier.description}
                onChange={(e) => setNewTier({ ...newTier, description: e.target.value })}
                placeholder="What's included in this tier?"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-sm">Max Tickets (optional)</Label>
              <Input
                type="number"
                min="1"
                value={newTier.max_tickets || ''}
                onChange={(e) => setNewTier({ ...newTier, max_tickets: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Leave empty for unlimited"
              />
            </div>
            <Button onClick={addTier} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add This Tier
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}