import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  FileText,
  DollarSign,
  Calendar,
  Tag,
  Search,
  ExternalLink,
  Filter,
  BarChart3,
  Grid,
  List
} from 'lucide-react';

export default function OpportunitiesDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLane, setSelectedLane] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grouped'); // grouped, list

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['all-opportunities'],
    queryFn: async () => {
      const opps = await base44.entities.FundingOpportunity.filter({
        status: 'active'
      });
      return opps.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  });

  // Extract unique values for filters
  const uniqueCategories = useMemo(() => {
    const cats = new Set();
    opportunities.forEach(opp => {
      (opp.categories || []).forEach(cat => cats.add(cat));
      (opp.sector_focus || []).forEach(sector => cats.add(sector));
    });
    return Array.from(cats).sort();
  }, [opportunities]);

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesSearch = !searchQuery || 
        opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.funder_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'all' || opp.type === selectedType || opp.opportunity_type === selectedType;
      const matchesLane = selectedLane === 'all' || opp.funding_lane === selectedLane;
      const matchesCategory = selectedCategory === 'all' || 
        (opp.categories || []).includes(selectedCategory) ||
        (opp.sector_focus || []).includes(selectedCategory);

      return matchesSearch && matchesType && matchesLane && matchesCategory;
    });
  }, [opportunities, searchQuery, selectedType, selectedLane, selectedCategory]);

  // Group by type
  const byType = useMemo(() => {
    const groups = {};
    filteredOpportunities.forEach(opp => {
      const type = opp.type || opp.opportunity_type || 'other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(opp);
    });
    return groups;
  }, [filteredOpportunities]);

  // Group by funding lane
  const byLane = useMemo(() => {
    const groups = {};
    filteredOpportunities.forEach(opp => {
      const lane = opp.funding_lane || 'other';
      if (!groups[lane]) groups[lane] = [];
      groups[lane].push(opp);
    });
    return groups;
  }, [filteredOpportunities]);

  // Group by category
  const byCategory = useMemo(() => {
    const groups = {};
    filteredOpportunities.forEach(opp => {
      const cats = [...(opp.categories || []), ...(opp.sector_focus || [])];
      if (cats.length === 0) {
        if (!groups['uncategorized']) groups['uncategorized'] = [];
        groups['uncategorized'].push(opp);
      } else {
        cats.forEach(cat => {
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(opp);
        });
      }
    });
    return groups;
  }, [filteredOpportunities]);

  // Statistics
  const stats = useMemo(() => {
    const totalAmount = filteredOpportunities.reduce((sum, opp) => 
      sum + (opp.amount_max || opp.award_amount_max || 0), 0);
    const avgAmount = filteredOpportunities.length > 0 ? totalAmount / filteredOpportunities.length : 0;
    
    return {
      total: filteredOpportunities.length,
      totalAmount,
      avgAmount,
      byType: Object.entries(byType).map(([type, opps]) => ({ type, count: opps.length })),
      byLane: Object.entries(byLane).map(([lane, opps]) => ({ lane, count: opps.length }))
    };
  }, [filteredOpportunities, byType, byLane]);

  const OpportunityCard = ({ opp }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{opp.title}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{opp.funder_name}</Badge>
              <Badge className="bg-purple-100 text-purple-800">
                {opp.type || opp.opportunity_type}
              </Badge>
              {opp.funding_lane && (
                <Badge className="bg-blue-100 text-blue-800">{opp.funding_lane}</Badge>
              )}
              {opp.grant_subtype && (
                <Badge className="bg-green-100 text-green-800">{opp.grant_subtype}</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600 line-clamp-2">{opp.description}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          {(opp.amount_max || opp.award_amount_max) > 0 && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span>
                Up to ${(opp.amount_max || opp.award_amount_max).toLocaleString()}
              </span>
            </div>
          )}
          {opp.deadline && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{new Date(opp.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {(opp.categories || []).length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-3 h-3 text-slate-400" />
            {(opp.categories || []).slice(0, 3).map((cat, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        )}

        {opp.application_url && (
          <a
            href={opp.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            View Details <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#143A50] mb-2">Funding Opportunities Directory</h1>
          <p className="text-slate-600">Browse and filter by type, focus area, and category</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-[#143A50]">{stats.total}</div>
              <p className="text-sm text-slate-600">Total Opportunities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                ${stats.totalAmount.toLocaleString()}
              </div>
              <p className="text-sm text-slate-600">Total Funding Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                ${Math.round(stats.avgAmount).toLocaleString()}
              </div>
              <p className="text-sm text-slate-600">Average Award</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(byCategory).length}
              </div>
              <p className="text-sm text-slate-600">Categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search opportunities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="grant">Grant</SelectItem>
                  <SelectItem value="rfp">RFP</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="rfq">RFQ</SelectItem>
                  <SelectItem value="rfi">RFI</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedLane} onValueChange={setSelectedLane}>
                <SelectTrigger>
                  <SelectValue placeholder="Funding Lane" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lanes</SelectItem>
                  <SelectItem value="grants">Grants</SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                  <SelectItem value="donors">Donors</SelectItem>
                  <SelectItem value="public_funds">Public Funds</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant={viewMode === 'grouped' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grouped')}
              >
                <Grid className="w-4 h-4 mr-2" />
                Grouped
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOpportunities.map(opp => (
              <OpportunityCard key={opp.id} opp={opp} />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="type" className="space-y-6">
            <TabsList>
              <TabsTrigger value="type">By Type</TabsTrigger>
              <TabsTrigger value="lane">By Funding Lane</TabsTrigger>
              <TabsTrigger value="category">By Category</TabsTrigger>
            </TabsList>

            <TabsContent value="type" className="space-y-6">
              {Object.entries(byType).map(([type, opps]) => (
                <div key={type}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold text-[#143A50] capitalize">{type}</h2>
                    <Badge className="bg-purple-100 text-purple-800">{opps.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {opps.map(opp => (
                      <OpportunityCard key={opp.id} opp={opp} />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="lane" className="space-y-6">
              {Object.entries(byLane).map(([lane, opps]) => (
                <div key={lane}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold text-[#143A50] capitalize">{lane.replace('_', ' ')}</h2>
                    <Badge className="bg-blue-100 text-blue-800">{opps.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {opps.map(opp => (
                      <OpportunityCard key={opp.id} opp={opp} />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="category" className="space-y-6">
              {Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length).map(([category, opps]) => (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold text-[#143A50] capitalize">{category}</h2>
                    <Badge className="bg-green-100 text-green-800">{opps.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {opps.map(opp => (
                      <OpportunityCard key={opp.id} opp={opp} />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}