import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp,
  Calculator,
  FileText
} from 'lucide-react';

export default function BudgetBuilderPage() {
  const [budgetType, setBudgetType] = useState('foundation');
  const [programName, setProgramName] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [personnelItems, setPersonnelItems] = useState([
    { position: '', fte: '', salary: '', fringe_rate: 28 }
  ]);
  const [directCostItems, setDirectCostItems] = useState([
    { category: '', description: '', quantity: '', unit_cost: '' }
  ]);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [reasonablenessCheck, setReasonablenessCheck] = useState(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: templates } = useQuery({
    queryKey: ['budget-templates'],
    queryFn: () => base44.entities.Template.list(),
    select: (data) => data.filter(t => t.category === 'financial_compliance')
  });

  const { data: logicModels } = useQuery({
    queryKey: ['logic-models'],
    queryFn: async () => {
      const docs = await base44.entities.Document.list();
      return docs.filter(d => d.doc_type === 'proposal' && d.content?.includes('logic model'));
    }
  });

  const addPersonnelLine = () => {
    setPersonnelItems([...personnelItems, { position: '', fte: '', salary: '', fringe_rate: 28 }]);
  };

  const updatePersonnelLine = (index, field, value) => {
    const updated = [...personnelItems];
    updated[index][field] = value;
    setPersonnelItems(updated);
  };

  const removePersonnelLine = (index) => {
    setPersonnelItems(personnelItems.filter((_, i) => i !== index));
  };

  const addDirectCostLine = () => {
    setDirectCostItems([...directCostItems, { category: '', description: '', quantity: '', unit_cost: '' }]);
  };

  const updateDirectCostLine = (index, field, value) => {
    const updated = [...directCostItems];
    updated[index][field] = value;
    setDirectCostItems(updated);
  };

  const removeDirectCostLine = (index) => {
    setDirectCostItems(directCostItems.filter((_, i) => i !== index));
  };

  const calculatePersonnelTotal = () => {
    return personnelItems.reduce((sum, item) => {
      const salary = parseFloat(item.salary) || 0;
      const fte = parseFloat(item.fte) || 0;
      const fringe = parseFloat(item.fringe_rate) || 0;
      const total = (salary * fte) * (1 + fringe / 100);
      return sum + total;
    }, 0);
  };

  const calculateDirectCostsTotal = () => {
    return directCostItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitCost = parseFloat(item.unit_cost) || 0;
      return sum + (quantity * unitCost);
    }, 0);
  };

  const getSmartSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const prompt = `You are an expert grant budget advisor. The user is building a ${budgetType} budget for ${programName || 'a program'}.

Current budget items:
PERSONNEL: ${JSON.stringify(personnelItems)}
DIRECT COSTS: ${JSON.stringify(directCostItems)}

Provide smart suggestions for:
1. Missing line items they should consider
2. Typical cost ranges for their items
3. Budget allocation best practices for this type of budget

Return JSON:
{
  "missing_categories": [{"category": "name", "reason": "why needed", "typical_cost": "range"}],
  "line_item_suggestions": [{"for_category": "category", "suggestion": "specific item to add"}],
  "cost_warnings": [{"item": "item name", "issue": "concern", "recommendation": "fix"}],
  "allocation_advice": "advice on overall budget mix"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            missing_categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  reason: { type: 'string' },
                  typical_cost: { type: 'string' }
                }
              }
            },
            line_item_suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  for_category: { type: 'string' },
                  suggestion: { type: 'string' }
                }
              }
            },
            cost_warnings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  item: { type: 'string' },
                  issue: { type: 'string' },
                  recommendation: { type: 'string' }
                }
              }
            },
            allocation_advice: { type: 'string' }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setSuggestions(data);
      setAnalyzing(false);
    }
  });

  const checkReasonablenessMutation = useMutation({
    mutationFn: async () => {
      const prompt = `You are a grant budget reasonableness expert. Review this budget for cost reasonableness:

Budget Type: ${budgetType}
Program: ${programName}
Personnel: ${JSON.stringify(personnelItems)}
Direct Costs: ${JSON.stringify(directCostItems)}

Check:
1. Are salaries reasonable for roles and geographic area?
2. Are direct costs reasonable and justified?
3. Are quantities realistic?
4. What's the cost per participant/outcome if calculable?

Return JSON:
{
  "overall_assessment": "reasonable|concerns|unreasonable",
  "salary_reasonableness": [{"position": "name", "assessment": "reasonable|high|low", "market_range": "range", "notes": "context"}],
  "direct_cost_reasonableness": [{"item": "name", "assessment": "reasonable|high|low", "notes": "context"}],
  "red_flags": ["flag 1", "flag 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_assessment: { type: 'string' },
            salary_reasonableness: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  position: { type: 'string' },
                  assessment: { type: 'string' },
                  market_range: { type: 'string' },
                  notes: { type: 'string' }
                }
              }
            },
            direct_cost_reasonableness: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  item: { type: 'string' },
                  assessment: { type: 'string' },
                  notes: { type: 'string' }
                }
              }
            },
            red_flags: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setReasonablenessCheck(data);
    }
  });

  const handleGetSuggestions = () => {
    setAnalyzing(true);
    getSmartSuggestionsMutation.mutate();
  };

  const handleCheckReasonableness = () => {
    checkReasonablenessMutation.mutate();
  };

  const personnelTotal = calculatePersonnelTotal();
  const directCostsTotal = calculateDirectCostsTotal();
  const subtotal = personnelTotal + directCostsTotal;
  const indirectRate = budgetType === 'government' ? 0.15 : 0.08;
  const indirectCosts = subtotal * indirectRate;
  const grandTotal = subtotal + indirectCosts;

  const assessmentColors = {
    reasonable: 'bg-green-100 text-green-800',
    high: 'bg-amber-100 text-amber-800',
    low: 'bg-blue-100 text-blue-800',
    concerns: 'bg-amber-100 text-amber-800',
    unreasonable: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Interactive Budget Builder</h1>
          <p className="text-slate-600">Build program budgets with AI-powered guidance and cost reasonableness checks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Budget Builder */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Configuration</CardTitle>
                <CardDescription>Select budget type and program details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Budget Type</label>
                  <Select value={budgetType} onValueChange={setBudgetType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="foundation">Foundation Grant</SelectItem>
                      <SelectItem value="government">Government Grant</SelectItem>
                      <SelectItem value="organizational">Organizational Budget</SelectItem>
                      <SelectItem value="contract">Contract Pricing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Program Name</label>
                  <Input
                    placeholder="Enter program name"
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Target Budget (Optional)</label>
                  <Input
                    type="number"
                    placeholder="$0"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="personnel">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personnel">Personnel</TabsTrigger>
                <TabsTrigger value="direct">Direct Costs</TabsTrigger>
              </TabsList>

              <TabsContent value="personnel" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Personnel Budget</CardTitle>
                      <Button size="sm" onClick={addPersonnelLine}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Position
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {personnelItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="col-span-3">
                          <Input
                            placeholder="Position"
                            value={item.position}
                            onChange={(e) => updatePersonnelLine(index, 'position', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="FTE"
                            step="0.1"
                            value={item.fte}
                            onChange={(e) => updatePersonnelLine(index, 'fte', e.target.value)}
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            placeholder="Annual Salary"
                            value={item.salary}
                            onChange={(e) => updatePersonnelLine(index, 'salary', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Fringe %"
                            value={item.fringe_rate}
                            onChange={(e) => updatePersonnelLine(index, 'fringe_rate', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">
                            ${((parseFloat(item.salary) || 0) * (parseFloat(item.fte) || 0) * (1 + (parseFloat(item.fringe_rate) || 0) / 100)).toFixed(0)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePersonnelLine(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-3 border-t flex items-center justify-between">
                      <span className="font-medium text-slate-900">Personnel Subtotal</span>
                      <span className="text-lg font-bold text-slate-900">${personnelTotal.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="direct" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Direct Program Costs</CardTitle>
                      <Button size="sm" onClick={addDirectCostLine}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Item
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {directCostItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="col-span-3">
                          <Select
                            value={item.category}
                            onValueChange={(val) => updateDirectCostLine(index, 'category', val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="supplies">Supplies</SelectItem>
                              <SelectItem value="equipment">Equipment</SelectItem>
                              <SelectItem value="travel">Travel</SelectItem>
                              <SelectItem value="space">Space/Rent</SelectItem>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="evaluation">Evaluation</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateDirectCostLine(index, 'description', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateDirectCostLine(index, 'quantity', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Unit Cost"
                            value={item.unit_cost}
                            onChange={(e) => updateDirectCostLine(index, 'unit_cost', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">
                            ${((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0)).toFixed(0)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDirectCostLine(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-3 border-t flex items-center justify-between">
                      <span className="font-medium text-slate-900">Direct Costs Subtotal</span>
                      <span className="text-lg font-bold text-slate-900">${directCostsTotal.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Budget Summary */}
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader>
                <CardTitle>Budget Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Personnel</span>
                    <span className="font-medium">${personnelTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Direct Costs</span>
                    <span className="font-medium">${directCostsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-slate-600">Subtotal (MTDC)</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Indirect Costs ({(indirectRate * 100).toFixed(0)}%)</span>
                    <span className="font-medium">${indirectCosts.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-lg font-bold text-slate-900">Total Budget</span>
                    <span className="text-2xl font-bold text-emerald-600">${grandTotal.toFixed(2)}</span>
                  </div>

                  {totalBudget && (
                    <Alert>
                      <TrendingUp className="w-4 h-4" />
                      <AlertDescription>
                        Your budget is {grandTotal > parseFloat(totalBudget) ? 'over' : 'under'} target by ${Math.abs(grandTotal - parseFloat(totalBudget)).toFixed(2)}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Assistance Sidebar */}
          <div className="space-y-6">
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  AI Budget Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleGetSuggestions}
                  disabled={analyzing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {analyzing ? 'Analyzing...' : 'Get Smart Suggestions'}
                </Button>

                <Button
                  onClick={handleCheckReasonableness}
                  disabled={checkReasonablenessMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Check Cost Reasonableness
                </Button>
              </CardContent>
            </Card>

            {/* Suggestions */}
            {suggestions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AI Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestions.missing_categories?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Missing Categories</p>
                      {suggestions.missing_categories.map((cat, idx) => (
                        <div key={idx} className="bg-amber-50 rounded-lg p-2 mb-2">
                          <p className="text-sm font-medium text-amber-900">{cat.category}</p>
                          <p className="text-xs text-amber-700">{cat.reason}</p>
                          <p className="text-xs text-amber-600 mt-1">Typical: {cat.typical_cost}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {suggestions.cost_warnings?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">⚠ Cost Warnings</p>
                      {suggestions.cost_warnings.map((warning, idx) => (
                        <div key={idx} className="bg-red-50 rounded-lg p-2 mb-2">
                          <p className="text-sm font-medium text-red-900">{warning.item}</p>
                          <p className="text-xs text-red-700">{warning.issue}</p>
                          <p className="text-xs text-red-600 mt-1">→ {warning.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {suggestions.allocation_advice && (
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-emerald-900 mb-1">Budget Allocation Advice</p>
                      <p className="text-sm text-emerald-700">{suggestions.allocation_advice}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reasonableness Check Results */}
            {reasonablenessCheck && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Reasonableness Check
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge className={assessmentColors[reasonablenessCheck.overall_assessment] || 'bg-slate-100'}>
                    {reasonablenessCheck.overall_assessment?.toUpperCase()}
                  </Badge>

                  {reasonablenessCheck.salary_reasonableness?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Salary Review</p>
                      {reasonablenessCheck.salary_reasonableness.map((review, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-2 mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">{review.position}</p>
                            <Badge className={assessmentColors[review.assessment] || 'bg-slate-100'} variant="outline">
                              {review.assessment}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600">Market: {review.market_range}</p>
                          <p className="text-xs text-slate-600">{review.notes}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {reasonablenessCheck.red_flags?.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        <p className="font-medium mb-1">Red Flags:</p>
                        <ul className="text-sm space-y-1">
                          {reasonablenessCheck.red_flags.map((flag, idx) => (
                            <li key={idx}>• {flag}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {reasonablenessCheck.recommendations?.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900 mb-2">Recommendations:</p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {reasonablenessCheck.recommendations.map((rec, idx) => (
                          <li key={idx}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Logic Model Integration */}
            {logicModels?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Logic Model Integration
                  </CardTitle>
                  <CardDescription className="text-xs">Link budget to program outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select logic model" />
                    </SelectTrigger>
                    <SelectContent>
                      {logicModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.doc_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-600 mt-2">
                    Link your budget to activities and outcomes in your logic model to show alignment
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}