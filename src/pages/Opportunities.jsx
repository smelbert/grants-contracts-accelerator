import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Loader2, Info, SlidersHorizontal } from 'lucide-react';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

function determineReadinessMatch(opportunity, organization) {
  if (!organization) return 'not_ready';
  
  // Check org type eligibility
  if (opportunity.required_org_types?.length > 0) {
    if (!opportunity.required_org_types.includes(organization.type)) {
      return 'not_ready';
    }
  }
  
  // Check stage eligibility
  if (opportunity.required_stages?.length > 0) {
    if (!opportunity.required_stages.includes(organization.stage)) {
      return 'partial';
    }
  }
  
  // Check if org is in pre_funding status
  if (organization.readiness_status === 'pre_funding') {
    return 'not_ready';
  }
  
  return 'ready';
}

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLane, setSelectedLane] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => base44.entities.FundingOpportunity.filter({ is_active: true }),
  });

  const organization = organizations?.[0];

  const filteredOpportunities = (opportunities || []).filter(opp => {
    const matchesSearch = !searchQuery || 
      opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.funder_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLane = selectedLane === 'all' || opp.funding_lane === selectedLane;
    
    let matchesAmount = true;
    if (amountFilter !== 'all') {
      const maxAmount = opp.amount_max || opp.amount_min || 0;
      switch (amountFilter) {
        case 'under_25k': matchesAmount = maxAmount < 25000; break;
        case '25k_100k': matchesAmount = maxAmount >= 25000 && maxAmount <= 100000; break;
        case '100k_500k': matchesAmount = maxAmount >= 100000 && maxAmount <= 500000; break;
        case 'over_500k': matchesAmount = maxAmount > 500000; break;
      }
    }
    
    return matchesSearch && matchesLane && matchesAmount;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Funding Opportunities
          </h1>
          <p className="text-slate-500 mt-1">
            Curated opportunities matched to your readiness level
          </p>
        </motion.div>

        {/* Readiness Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Opportunities are color-coded based on your organization's readiness. 
              We recommend focusing on "Good Fit" opportunities to maximize your success.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 space-y-4"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Lane tabs */}
          <Tabs value={selectedLane} onValueChange={setSelectedLane}>
            <TabsList className="bg-white border border-slate-200 p-1 h-auto flex-wrap">
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                All
              </TabsTrigger>
              <TabsTrigger value="grants" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Grants
              </TabsTrigger>
              <TabsTrigger value="contracts" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Contracts
              </TabsTrigger>
              <TabsTrigger value="donors" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                Donors
              </TabsTrigger>
              <TabsTrigger value="public_funds" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                Public Funds
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Amount filter */}
          <div className="flex items-center gap-4">
            <Select value={amountFilter} onValueChange={setAmountFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Amount range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All amounts</SelectItem>
                <SelectItem value="under_25k">Under $25K</SelectItem>
                <SelectItem value="25k_100k">$25K - $100K</SelectItem>
                <SelectItem value="100k_500k">$100K - $500K</SelectItem>
                <SelectItem value="over_500k">Over $500K</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500">
              {filteredOpportunities.length} opportunities found
            </p>
          </div>
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No opportunities match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOpportunities.map((opp, index) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <OpportunityCard
                  opportunity={opp}
                  readinessStatus={determineReadinessMatch(opp, organization)}
                  onViewDetails={setSelectedOpportunity}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Detail Sheet */}
        <Sheet open={!!selectedOpportunity} onOpenChange={() => setSelectedOpportunity(null)}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            {selectedOpportunity && (
              <>
                <SheetHeader>
                  <SheetTitle>{selectedOpportunity.title}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <p className="text-sm text-slate-500">Funder</p>
                    <p className="font-medium">{selectedOpportunity.funder_name}</p>
                  </div>
                  
                  {selectedOpportunity.description && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Description</p>
                      <p className="text-slate-700">{selectedOpportunity.description}</p>
                    </div>
                  )}

                  {selectedOpportunity.eligibility_summary && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Eligibility</p>
                      <p className="text-slate-700">{selectedOpportunity.eligibility_summary}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {selectedOpportunity.amount_max && (
                      <div>
                        <p className="text-sm text-slate-500">Amount</p>
                        <p className="font-medium">
                          {selectedOpportunity.amount_min && `$${selectedOpportunity.amount_min.toLocaleString()} - `}
                          ${selectedOpportunity.amount_max.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedOpportunity.deadline && (
                      <div>
                        <p className="text-sm text-slate-500">Deadline</p>
                        <p className="font-medium">{format(new Date(selectedOpportunity.deadline), 'MMMM d, yyyy')}</p>
                      </div>
                    )}
                  </div>

                  {selectedOpportunity.sector_focus?.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Focus Areas</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedOpportunity.sector_focus.map((sector, i) => (
                          <Badge key={i} variant="secondary">{sector}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedOpportunity.application_url && (
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => window.open(selectedOpportunity.application_url, '_blank')}
                    >
                      View Application
                    </Button>
                  )}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}