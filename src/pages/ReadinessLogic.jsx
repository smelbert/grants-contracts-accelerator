import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Sliders, 
  Plus, 
  Save, 
  Trash2,
  TrendingUp,
  FileText,
  Briefcase,
  Target,
  Lock,
  Unlock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const COACHING_AREAS = [
  { id: 'business_development', name: 'Business Development', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
  { id: 'grant_preparedness', name: 'Grant Preparedness', icon: Target, color: 'from-purple-500 to-pink-500' },
  { id: 'grant_writing', name: 'Grant Writing (Application & Reports)', icon: FileText, color: 'from-green-500 to-emerald-500' },
  { id: 'rfps_contracts', name: 'RFPs and Contracts', icon: Briefcase, color: 'from-amber-500 to-orange-500' },
];

const READINESS_STAGES = [
  { id: 'seed', name: 'Seed', description: 'Just getting started', order: 1 },
  { id: 'growth', name: 'Growth', description: 'Building capacity', order: 2 },
  { id: 'scale', name: 'Scale', description: 'Ready to expand', order: 3 },
];

export default function ReadinessLogicPage() {
  const [selectedArea, setSelectedArea] = useState('business_development');
  const queryClient = useQueryClient();

  // Fetch readiness configurations
  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['readiness-configs'],
    queryFn: async () => {
      // In a real implementation, this would fetch from a ReadinessConfig entity
      // For now, we'll return empty array and build the UI
      return [];
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Readiness Logic</h1>
          <p className="text-slate-600">Configure readiness scoring and progression rules for coaching areas</p>
        </motion.div>

        {/* Coaching Area Selector */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {COACHING_AREAS.map((area) => {
            const Icon = area.icon;
            return (
              <Card
                key={area.id}
                onClick={() => setSelectedArea(area.id)}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedArea === area.id ? 'ring-2 ring-[#143A50] bg-[#143A50]/5' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${area.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{area.name}</h3>
                  <p className="text-xs text-slate-500">Configure scoring</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Configuration Tabs */}
        <Tabs defaultValue="scoring" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scoring">
              <Sliders className="w-4 h-4 mr-2" />
              Scoring Models
            </TabsTrigger>
            <TabsTrigger value="unlocks">
              <Settings className="w-4 h-4 mr-2" />
              Unlock Rules
            </TabsTrigger>
          </TabsList>

          {/* Scoring Models Tab */}
          <TabsContent value="scoring" className="space-y-6">
            <ScoringModelsConfig area={selectedArea} />
          </TabsContent>

          {/* Unlock Rules Tab */}
          <TabsContent value="unlocks" className="space-y-6">
            <UnlockRulesConfig area={selectedArea} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ScoringModelsConfig({ area }) {
  const [criteria, setCriteria] = useState([
    { name: 'Legal Structure', weight: 20, required: true },
    { name: 'Board Governance', weight: 15, required: true },
    { name: 'Financial Systems', weight: 25, required: true },
    { name: 'Program Documentation', weight: 20, required: false },
    { name: 'Track Record', weight: 20, required: false },
  ]);

  const addCriterion = () => {
    setCriteria([...criteria, { name: '', weight: 0, required: false }]);
  };

  const updateCriterion = (index, field, value) => {
    const updated = [...criteria];
    updated[index][field] = value;
    setCriteria(updated);
  };

  const removeCriterion = (index) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const totalWeight = criteria.reduce((sum, c) => sum + (parseInt(c.weight) || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoring Criteria</CardTitle>
        <CardDescription>
          Define the criteria and weights used to calculate readiness scores for {COACHING_AREAS.find(a => a.id === area)?.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Criteria List */}
        <div className="space-y-4">
          {criteria.map((criterion, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Criterion Name</Label>
                    <Input
                      value={criterion.name}
                      onChange={(e) => updateCriterion(idx, 'name', e.target.value)}
                      placeholder="e.g., Legal Structure"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Weight (%)</Label>
                    <Input
                      type="number"
                      value={criterion.weight}
                      onChange={(e) => updateCriterion(idx, 'weight', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={criterion.required}
                    onCheckedChange={(checked) => updateCriterion(idx, 'required', checked)}
                  />
                  <Label className="text-sm cursor-pointer">Required for progression</Label>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCriterion(idx)}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add Criterion Button */}
        <Button variant="outline" onClick={addCriterion} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Criterion
        </Button>

        {/* Total Weight Display */}
        <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
          <span className="font-medium text-slate-900">Total Weight</span>
          <Badge 
            variant={totalWeight === 100 ? "default" : "destructive"}
            className={totalWeight === 100 ? "bg-green-600" : ""}
          >
            {totalWeight}%
          </Badge>
        </div>

        {totalWeight !== 100 && (
          <p className="text-sm text-red-600">
            ⚠️ Total weight must equal 100%
          </p>
        )}

        {/* Stage Thresholds */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-slate-900 mb-4">Stage Thresholds</h3>
          <p className="text-sm text-slate-600 mb-4">Define the minimum score required to reach each stage</p>
          <div className="space-y-3">
            {READINESS_STAGES.map((stage) => (
              <div key={stage.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{stage.name}</p>
                  <p className="text-xs text-slate-500">{stage.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={stage.order === 1 ? 0 : stage.order === 2 ? 60 : 85}
                    className="w-20 text-right"
                  />
                  <span className="text-sm text-slate-600">points</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button className="w-full bg-[#143A50] hover:bg-[#1E4F58]">
          <Save className="w-4 h-4 mr-2" />
          Save Scoring Model
        </Button>
      </CardContent>
    </Card>
  );
}

function UnlockRulesConfig({ area }) {
  const [unlocks, setUnlocks] = useState({
    seed: [
      { type: 'template', name: 'Basic Business Plan Template', enabled: true },
      { type: 'content', name: 'Introduction to Nonprofits Course', enabled: true },
      { type: 'feature', name: 'Project Management Tools', enabled: false },
    ],
    growth: [
      { type: 'template', name: 'Grant Proposal Template', enabled: true },
      { type: 'content', name: 'Grant Writing Fundamentals', enabled: true },
      { type: 'feature', name: 'Document Collaboration', enabled: true },
      { type: 'feature', name: 'AI Grant Assistant', enabled: false },
    ],
    scale: [
      { type: 'template', name: 'Complex Grant Applications', enabled: true },
      { type: 'content', name: 'Advanced Grant Strategy', enabled: true },
      { type: 'feature', name: 'Full Platform Access', enabled: true },
      { type: 'coaching', name: 'Priority Coaching Access', enabled: true },
    ],
  });

  const [newUnlock, setNewUnlock] = useState({ stage: 'seed', type: 'template', name: '' });

  const addUnlock = () => {
    if (!newUnlock.name) return;
    
    const updated = { ...unlocks };
    updated[newUnlock.stage].push({
      type: newUnlock.type,
      name: newUnlock.name,
      enabled: true,
    });
    setUnlocks(updated);
    setNewUnlock({ stage: 'seed', type: 'template', name: '' });
  };

  const toggleUnlock = (stage, index) => {
    const updated = { ...unlocks };
    updated[stage][index].enabled = !updated[stage][index].enabled;
    setUnlocks(updated);
  };

  const removeUnlock = (stage, index) => {
    const updated = { ...unlocks };
    updated[stage].splice(index, 1);
    setUnlocks(updated);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'template': return FileText;
      case 'content': return Target;
      case 'feature': return Settings;
      case 'coaching': return TrendingUp;
      default: return Lock;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'template': return 'bg-blue-100 text-blue-700';
      case 'content': return 'bg-green-100 text-green-700';
      case 'feature': return 'bg-purple-100 text-purple-700';
      case 'coaching': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {READINESS_STAGES.map((stage) => (
        <Card key={stage.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {stage.order === 1 ? <Lock className="w-5 h-5 text-slate-400" /> : <Unlock className="w-5 h-5 text-green-600" />}
                  {stage.name} Stage
                </div>
                <p className="text-sm font-normal text-slate-600 mt-1">{stage.description}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unlocks[stage.id]?.map((unlock, idx) => {
              const Icon = getTypeIcon(unlock.type);
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    unlock.enabled ? 'bg-slate-50 border border-slate-200' : 'bg-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${getTypeColor(unlock.type)} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${unlock.enabled ? 'text-slate-900' : 'text-slate-500'}`}>
                        {unlock.name}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {unlock.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={unlock.enabled}
                      onCheckedChange={() => toggleUnlock(stage.id, idx)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeUnlock(stage.id, idx)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {unlocks[stage.id]?.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No unlocks configured for this stage</p>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add New Unlock */}
      <Card className="border-dashed border-2">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-slate-900 mb-4">Add New Unlock</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <Label className="text-xs">Stage</Label>
              <select
                value={newUnlock.stage}
                onChange={(e) => setNewUnlock({ ...newUnlock, stage: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {READINESS_STAGES.map((stage) => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <select
                value={newUnlock.type}
                onChange={(e) => setNewUnlock({ ...newUnlock, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="template">Template</option>
                <option value="content">Content</option>
                <option value="feature">Feature</option>
                <option value="coaching">Coaching</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Name</Label>
              <Input
                value={newUnlock.name}
                onChange={(e) => setNewUnlock({ ...newUnlock, name: e.target.value })}
                placeholder="e.g., Advanced Grant Template"
              />
            </div>
          </div>
          <Button onClick={addUnlock} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Unlock Rule
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button className="w-full bg-[#143A50] hover:bg-[#1E4F58]">
        <Save className="w-4 h-4 mr-2" />
        Save Unlock Rules
      </Button>
    </div>
  );
}