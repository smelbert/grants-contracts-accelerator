import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  DollarSign, 
  Calendar, 
  Bookmark, 
  BookmarkCheck,
  ExternalLink,
  MapPin,
  TrendingUp,
  Filter,
  X,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Flag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function OpportunitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFundingLane, setSelectedFundingLane] = useState('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingOpportunity, setReportingOpportunity] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => base44.entities.FundingOpportunity.list('-posted_date', 100),
  });

  const { data: savedOpportunities = [] } = useQuery({
    queryKey: ['saved-opportunities', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.OpportunityComment.filter({
        user_email: user.email,
        is_saved: true
      });
    },
    enabled: !!user?.email,
  });

  const saveOpportunityMutation = useMutation({
    mutationFn: async (opportunity) => {
      return await base44.entities.OpportunityComment.create({
        opportunity_id: opportunity.id,
        user_email: user.email,
        user_name: user.full_name,
        is_saved: true,
        comment_text: ''
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-opportunities']);
      toast.success('Opportunity saved!');
    },
  });

  const unsaveOpportunityMutation = useMutation({
    mutationFn: async (opportunityId) => {
      const saved = savedOpportunities.find(s => s.opportunity_id === opportunityId);
      if (saved) {
        await base44.entities.OpportunityComment.delete(saved.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-opportunities']);
      toast.success('Removed from saved');
    },
  });

  const isSaved = (opportunityId) => {
    return savedOpportunities.some(s => s.opportunity_id === opportunityId);
  };

  const reportOpportunityMutation = useMutation({
    mutationFn: async ({ opportunityId, reason, description }) => {
      return await base44.entities.OpportunityReport.create({
        opportunity_id: opportunityId,
        reported_by_email: user.email,
        report_reason: reason,
        description: description || '',
        status: 'pending'
      });
    },
    onSuccess: () => {
      toast.success('Report submitted. Thank you for helping keep our platform safe!');
      setReportDialogOpen(false);
      setReportingOpportunity(null);
    },
  });

  const getVettingInfo = (opportunity) => {
    if (!opportunity.ai_vetting_notes) return null;
    try {
      return JSON.parse(opportunity.ai_vetting_notes);
    } catch {
      return null;
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeOpportunities = opportunities.filter(opp => {
    if (opp.rolling_deadline) return true;
    const deadline = opp.deadline || opp.deadline_full;
    if (!deadline) return true;
    return new Date(deadline) >= today;
  });

  const expiredOpportunities = opportunities.filter(opp => {
    if (opp.rolling_deadline) return false;
    const deadline = opp.deadline || opp.deadline_full;
    if (!deadline) return false;
    return new Date(deadline) < today;
  });

  const filteredOpportunities = activeOpportunities.filter(opp => {
    const matchesSearch = !searchTerm || 
      opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.funder_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || opp.type === selectedType;
    const matchesLane = selectedFundingLane === 'all' || opp.funding_lane === selectedFundingLane;
    
    return matchesSearch && matchesType && matchesLane;
  });

  const filteredExpired = expiredOpportunities.filter(opp => {
    const matchesSearch = !searchTerm || 
      opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.funder_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || opp.type === selectedType;
    const matchesLane = selectedFundingLane === 'all' || opp.funding_lane === selectedFundingLane;
    
    return matchesSearch && matchesType && matchesLane;
  });

  const savedOpps = activeOpportunities.filter(opp => isSaved(opp.id) && filteredOpportunities.includes(opp));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#143A50] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Funding Opportunities</h1>
              <p className="text-slate-600">Discover and track funding that matches your mission</p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <Card className="mb-6 border-emerald-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by title, funder, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedFundingLane}
                  onChange={(e) => setSelectedFundingLane(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium"
                >
                  <option value="all">All Funding Lanes</option>
                  <option value="grants">Grants</option>
                  <option value="contracts">Contracts</option>
                  <option value="donors">Donors</option>
                  <option value="public_funds">Public Funds</option>
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium"
                >
                  <option value="all">All Types</option>
                  <option value="grant">Grant</option>
                  <option value="contract">Contract</option>
                  <option value="rfp">RFP</option>
                  <option value="rfq">RFQ</option>
                  <option value="donor_program">Donor Program</option>
                  <option value="public_fund">Public Fund</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All Opportunities ({filteredOpportunities.length})
            </TabsTrigger>
            <TabsTrigger value="saved">
              <BookmarkCheck className="w-4 h-4 mr-2" />
              Saved ({savedOpps.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Past Deadlines ({filteredExpired.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {filteredOpportunities.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-medium text-slate-900 mb-1">No opportunities found</p>
                  <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">
                    Showing <span className="font-semibold text-slate-900">{filteredOpportunities.length}</span> {filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'}
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredOpportunities.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      isSaved={isSaved(opp.id)}
                      onSave={() => saveOpportunityMutation.mutate(opp)}
                      onUnsave={() => unsaveOpportunityMutation.mutate(opp.id)}
                      onClick={() => setSelectedOpportunity(opp)}
                      onReport={() => {
                        setReportingOpportunity(opp);
                        setReportDialogOpen(true);
                      }}
                      vettingInfo={getVettingInfo(opp)}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-3">
            {savedOpps.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <Bookmark className="w-8 h-8 text-emerald-300" />
                  </div>
                  <p className="text-lg font-medium text-slate-900 mb-1">No saved opportunities yet</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Click the bookmark icon on any opportunity to save it for later
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{savedOpps.length}</span> saved {savedOpps.length === 1 ? 'opportunity' : 'opportunities'}
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {savedOpps.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      isSaved={true}
                      onUnsave={() => unsaveOpportunityMutation.mutate(opp.id)}
                      onClick={() => setSelectedOpportunity(opp)}
                      onReport={() => {
                        setReportingOpportunity(opp);
                        setReportDialogOpen(true);
                      }}
                      vettingInfo={getVettingInfo(opp)}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-3">
            {filteredExpired.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-medium text-slate-900 mb-1">No expired opportunities</p>
                  <p className="text-sm text-slate-500">
                    Opportunities that have passed their deadline will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-900">
                    <strong>Note:</strong> These opportunities have passed their deadline. Save them to track for next year's funding cycle.
                  </p>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{filteredExpired.length}</span> expired {filteredExpired.length === 1 ? 'opportunity' : 'opportunities'}
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredExpired.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      isSaved={isSaved(opp.id)}
                      onSave={() => saveOpportunityMutation.mutate(opp)}
                      onUnsave={() => unsaveOpportunityMutation.mutate(opp.id)}
                      onClick={() => setSelectedOpportunity(opp)}
                      onReport={() => {
                        setReportingOpportunity(opp);
                        setReportDialogOpen(true);
                      }}
                      vettingInfo={getVettingInfo(opp)}
                      isExpired={true}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Detail Modal */}
        {selectedOpportunity && (
          <OpportunityDetailModal
            opportunity={selectedOpportunity}
            isSaved={isSaved(selectedOpportunity.id)}
            onClose={() => setSelectedOpportunity(null)}
            onSave={() => {
              saveOpportunityMutation.mutate(selectedOpportunity);
              setSelectedOpportunity(null);
            }}
            onUnsave={() => {
              unsaveOpportunityMutation.mutate(selectedOpportunity.id);
              setSelectedOpportunity(null);
            }}
            onReport={() => {
              setReportingOpportunity(selectedOpportunity);
              setReportDialogOpen(true);
              setSelectedOpportunity(null);
            }}
            vettingInfo={getVettingInfo(selectedOpportunity)}
          />
        )}

        {/* Report Dialog */}
        {reportDialogOpen && (
          <ReportOpportunityDialog
            opportunity={reportingOpportunity}
            onClose={() => {
              setReportDialogOpen(false);
              setReportingOpportunity(null);
            }}
            onSubmit={(reason, description) => {
              reportOpportunityMutation.mutate({
                opportunityId: reportingOpportunity.id,
                reason,
                description
              });
            }}
          />
        )}
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity, isSaved, onSave, onUnsave, onClick, onReport, vettingInfo, isExpired = false }) {
  const laneColors = {
    grants: 'from-emerald-500 to-green-600',
    contracts: 'from-blue-500 to-indigo-600',
    donors: 'from-purple-500 to-pink-600',
    public_funds: 'from-amber-500 to-orange-600'
  };

  const typeIcons = {
    grant: '🎯',
    contract: '📋',
    rfp: '📄',
    rfq: '📝',
    donor_program: '💝',
    public_fund: '🏛️'
  };

  return (
    <Card className={`group hover:shadow-xl hover:border-emerald-200 transition-all duration-300 cursor-pointer overflow-hidden ${isExpired ? 'opacity-75' : ''}`}>
      {/* Color accent bar */}
      <div className={`h-1.5 bg-gradient-to-r ${isExpired ? 'from-slate-400 to-slate-500' : laneColors[opportunity.funding_lane] || 'from-slate-400 to-slate-500'}`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0" onClick={onClick}>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge className="bg-white border-2 border-emerald-100 text-emerald-700 font-medium">
                {typeIcons[opportunity.type]} {opportunity.type?.replace('_', ' ')}
              </Badge>
              {opportunity.funding_lane && (
                <Badge variant="outline" className="border-slate-200 text-slate-600">
                  {opportunity.funding_lane}
                </Badge>
              )}
              {isExpired && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  Expired
                </Badge>
              )}
              {vettingInfo?.is_legitimate && vettingInfo?.score >= 80 && (
                <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </Badge>
              )}
              {vettingInfo && !vettingInfo.is_legitimate && (
                <Badge className="bg-red-100 text-red-800 border-red-200 gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Flagged
                </Badge>
              )}
            </div>
            <CardTitle className="mb-2 text-xl group-hover:text-emerald-700 transition-colors line-clamp-2">
              {opportunity.title}
            </CardTitle>
            {opportunity.funder_name && (
              <p className="text-sm font-medium text-slate-600 mb-2">
                {opportunity.funder_name}
              </p>
            )}
            <CardDescription className="line-clamp-2">
              {opportunity.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-emerald-50"
            onClick={(e) => {
              e.stopPropagation();
              isSaved ? onUnsave() : onSave();
            }}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-emerald-600" />
            ) : (
              <Bookmark className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-4 text-sm" onClick={onClick}>
          {opportunity.amount_min && (
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <DollarSign className="w-4 h-4" />
              ${opportunity.amount_min.toLocaleString()} {opportunity.amount_max && `- $${opportunity.amount_max.toLocaleString()}`}
            </div>
          )}
          {(opportunity.deadline || opportunity.deadline_full) && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Due: {format(new Date(opportunity.deadline || opportunity.deadline_full), 'MMM d, yyyy')}</span>
            </div>
          )}
          {opportunity.geographic_focus && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{opportunity.geographic_focus}</span>
            </div>
          )}
        </div>
        
        {/* Report button */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-red-600 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onReport();
            }}
          >
            <Flag className="w-3 h-3 mr-1" />
            Report as suspicious
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OpportunityDetailModal({ opportunity, isSaved, onClose, onSave, onUnsave, onReport, vettingInfo }) {
  const laneColors = {
    grants: 'from-emerald-500 to-green-600',
    contracts: 'from-blue-500 to-indigo-600',
    donors: 'from-purple-500 to-pink-600',
    public_funds: 'from-amber-500 to-orange-600'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header with gradient */}
        <div className={`h-32 bg-gradient-to-r ${laneColors[opportunity.funding_lane] || 'from-slate-400 to-slate-500'} relative`}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <CardHeader className="-mt-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-white border-2 border-emerald-100 text-emerald-700">
                {opportunity.type?.replace('_', ' ')}
              </Badge>
              {opportunity.funding_lane && (
                <Badge variant="outline">{opportunity.funding_lane}</Badge>
              )}
              {opportunity.amount_min && (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  ${opportunity.amount_min.toLocaleString()} {opportunity.amount_max && `- $${opportunity.amount_max.toLocaleString()}`}
                </Badge>
              )}
              {vettingInfo?.is_legitimate && vettingInfo?.score >= 80 && (
                <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  AI Verified ({vettingInfo.score}/100)
                </Badge>
              )}
              {vettingInfo && !vettingInfo.is_legitimate && (
                <Badge className="bg-red-100 text-red-800 border-red-200 gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Flagged for Review
                </Badge>
              )}
            </div>
            <CardTitle className="text-3xl mb-3">{opportunity.title}</CardTitle>
            {opportunity.funder_name && (
              <p className="text-lg text-slate-600 font-medium">{opportunity.funder_name}</p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          {/* Key Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(opportunity.deadline || opportunity.deadline_full) && (
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Deadline</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {format(new Date(opportunity.deadline || opportunity.deadline_full), 'MMM d, yyyy')}
                </p>
              </div>
            )}
            {opportunity.geographic_focus && (
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Location</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{opportunity.geographic_focus}</p>
              </div>
            )}
            {opportunity.rolling_deadline && (
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Rolling Deadline</span>
                </div>
                <p className="text-lg font-semibold text-emerald-700">Apply Anytime</p>
              </div>
            )}
          </div>

          {opportunity.description && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 text-lg">About This Opportunity</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{opportunity.description}</p>
            </div>
          )}

          {opportunity.eligibility_summary && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 text-lg">Eligibility</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{opportunity.eligibility_summary}</p>
            </div>
          )}

          {(opportunity.sector_focus?.length > 0 || opportunity.required_org_types?.length > 0) && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 text-lg">Focus Areas</h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.sector_focus?.map((sector, idx) => (
                  <Badge key={idx} variant="outline">{sector}</Badge>
                ))}
                {opportunity.required_org_types?.map((type, idx) => (
                  <Badge key={idx} variant="outline">{type}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Vetting Info */}
          {vettingInfo && (
            <div className={`p-4 rounded-lg border-2 ${
              vettingInfo.is_legitimate 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {vettingInfo.is_legitimate ? (
                  <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold mb-2 ${vettingInfo.is_legitimate ? 'text-green-900' : 'text-red-900'}`}>
                    {vettingInfo.is_legitimate ? 'AI Verified' : 'Flagged for Review'}
                  </h4>
                  <p className="text-sm mb-2 text-slate-700">{vettingInfo.notes}</p>
                  {vettingInfo.red_flags?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold mb-1 text-slate-600">Concerns:</p>
                      <ul className="text-xs space-y-1 text-slate-600">
                        {vettingInfo.red_flags.map((flag, idx) => (
                          <li key={idx}>• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Legitimacy Score: {vettingInfo.score}/100 • Vetted {format(new Date(opportunity.ai_vetting_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              onClick={isSaved ? onUnsave : onSave}
              size="lg"
              className={isSaved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#143A50] hover:bg-[#1E4F58]"}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-5 h-5 mr-2" />
                  Saved to My Opportunities
                </>
              ) : (
                <>
                  <Bookmark className="w-5 h-5 mr-2" />
                  Save Opportunity
                </>
              )}
            </Button>
            {(opportunity.application_url || opportunity.source_url) && (
              <Button variant="outline" size="lg" asChild>
                <a href={opportunity.application_url || opportunity.source_url} target="_blank" rel="noopener noreferrer">
                  Visit Opportunity Website
                  <ExternalLink className="w-5 h-5 ml-2" />
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="lg"
              onClick={onReport}
              className="text-slate-600 hover:text-red-600"
            >
              <Flag className="w-5 h-5 mr-2" />
              Report as Suspicious
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportOpportunityDialog({ opportunity, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const reasons = [
    { value: 'suspicious_funder', label: 'Suspicious or unknown funder' },
    { value: 'unrealistic_amounts', label: 'Unrealistic funding amounts' },
    { value: 'fake_contact_info', label: 'Fake or invalid contact information' },
    { value: 'scam_indicators', label: 'Appears to be a scam' },
    { value: 'duplicate_listing', label: 'Duplicate listing' },
    { value: 'outdated_info', label: 'Outdated or incorrect information' },
    { value: 'other', label: 'Other concern' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <Card className="max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl mb-2">Report Opportunity</CardTitle>
              <CardDescription>Help us keep the platform safe by reporting suspicious listings</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-900 line-clamp-2">{opportunity.title}</p>
            <p className="text-xs text-slate-600">{opportunity.funder_name}</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Reason for reporting</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
            >
              <option value="">Select a reason...</option>
              {reasons.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Additional details (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
              placeholder="Provide any additional context or details..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onSubmit(reason, description)}
              disabled={!reason}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Flag className="w-4 h-4 mr-2" />
              Submit Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}