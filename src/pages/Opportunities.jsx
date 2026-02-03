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
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function OpportunitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
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

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = !searchTerm || 
      opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.funder_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || opp.opportunity_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const savedOpps = filteredOpportunities.filter(opp => isSaved(opp.id));

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Funding Opportunities</h1>
          <p className="text-slate-600">Browse and save opportunities that match your organization</p>
        </div>

        {/* Search & Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="grant">Grants</option>
                  <option value="contract">Contracts</option>
                  <option value="rfp">RFPs</option>
                  <option value="fellowship">Fellowships</option>
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
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredOpportunities.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-600">No opportunities found</p>
                </CardContent>
              </Card>
            ) : (
              filteredOpportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  isSaved={isSaved(opp.id)}
                  onSave={() => saveOpportunityMutation.mutate(opp)}
                  onUnsave={() => unsaveOpportunityMutation.mutate(opp.id)}
                  onClick={() => setSelectedOpportunity(opp)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            {savedOpps.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No saved opportunities yet</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Click the bookmark icon on any opportunity to save it
                  </p>
                </CardContent>
              </Card>
            ) : (
              savedOpps.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  isSaved={true}
                  onUnsave={() => unsaveOpportunityMutation.mutate(opp.id)}
                  onClick={() => setSelectedOpportunity(opp)}
                />
              ))
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
          />
        )}
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity, isSaved, onSave, onUnsave, onClick }) {
  const typeColors = {
    grant: 'bg-green-100 text-green-700',
    contract: 'bg-blue-100 text-blue-700',
    rfp: 'bg-purple-100 text-purple-700',
    fellowship: 'bg-amber-100 text-amber-700'
  };

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={onClick}>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={typeColors[opportunity.opportunity_type] || 'bg-slate-100'}>
                {opportunity.opportunity_type}
              </Badge>
              {opportunity.amount_min && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {opportunity.amount_min.toLocaleString()} - {opportunity.amount_max?.toLocaleString() || 'varies'}
                </Badge>
              )}
            </div>
            <CardTitle className="mb-2">{opportunity.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {opportunity.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              isSaved ? onUnsave() : onSave();
            }}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-[#143A50]" />
            ) : (
              <Bookmark className="w-5 h-5 text-slate-400" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent onClick={onClick}>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          {opportunity.funder_name && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {opportunity.funder_name}
            </div>
          )}
          {opportunity.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Due: {format(new Date(opportunity.deadline), 'MMM d, yyyy')}
            </div>
          )}
          {opportunity.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {opportunity.location}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function OpportunityDetailModal({ opportunity, isSaved, onClose, onSave, onUnsave }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-4">{opportunity.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge>{opportunity.opportunity_type}</Badge>
                {opportunity.amount_min && (
                  <Badge variant="outline">
                    ${opportunity.amount_min.toLocaleString()} - ${opportunity.amount_max?.toLocaleString() || 'varies'}
                  </Badge>
                )}
                {opportunity.deadline && (
                  <Badge variant="outline">
                    Due: {format(new Date(opportunity.deadline), 'MMM d, yyyy')}
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>×</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{opportunity.description}</p>
          </div>

          {opportunity.eligibility_criteria && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Eligibility</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{opportunity.eligibility_criteria}</p>
            </div>
          )}

          {opportunity.funder_name && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Funder</h3>
              <p className="text-slate-700">{opportunity.funder_name}</p>
            </div>
          )}

          {opportunity.application_url && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Application Link</h3>
              <a 
                href={opportunity.application_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#143A50] hover:underline flex items-center gap-2"
              >
                Visit Application Page
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={isSaved ? onUnsave : onSave}
              variant={isSaved ? "outline" : "default"}
              className={isSaved ? "" : "bg-[#143A50] hover:bg-[#1E4F58]"}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save Opportunity
                </>
              )}
            </Button>
            {opportunity.application_url && (
              <Button variant="outline" asChild>
                <a href={opportunity.application_url} target="_blank" rel="noopener noreferrer">
                  Apply Now
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}