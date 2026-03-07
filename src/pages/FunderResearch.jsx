import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Loader2, CheckCircle2, AlertCircle, Sparkles, TrendingUp, DollarSign, ExternalLink, FileText, Building2, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

function ProPublicaLookup() {
  const [searchQuery, setSearchQuery] = useState('');
  const [einQuery, setEinQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [orgDetail, setOrgDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedFilings, setExpandedFilings] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearchResults(null);
    setOrgDetail(null);
    const res = await base44.functions.invoke('propublicaLookup', { action: 'search', query: searchQuery });
    setSearchResults(res.data);
    setLoading(false);
  };

  const handleGetOrg = async (ein) => {
    setLoading(true);
    setOrgDetail(null);
    setExpandedFilings(false);
    const res = await base44.functions.invoke('propublicaLookup', { action: 'get_org', ein });
    setOrgDetail(res.data);
    setLoading(false);
  };

  const fmt = (n) => n != null ? `$${Number(n).toLocaleString()}` : '—';

  return (
    <div className="space-y-6">
      {/* Search by name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-[#143A50]" />
            Search by Organization Name
          </CardTitle>
          <CardDescription>Find any U.S. nonprofit or foundation. Powered by ProPublica Nonprofit Explorer (free, no key needed).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g., Gates Foundation, United Way of Columbus..."
              className="flex-1"
            />
            <Button type="submit" disabled={loading} style={{ backgroundColor: '#143A50', color: 'white' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* OR lookup by EIN */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#AC1A5B]" />
            Lookup by EIN
          </CardTitle>
          <CardDescription>Enter a known EIN to pull full 990 filing history.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={einQuery}
              onChange={e => setEinQuery(e.target.value)}
              placeholder="e.g., 91-1433402"
              className="flex-1"
            />
            <Button onClick={() => handleGetOrg(einQuery)} disabled={loading || !einQuery.trim()} style={{ backgroundColor: '#AC1A5B', color: 'white' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lookup'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results List */}
      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({searchResults.total || searchResults.organizations?.length || 0} found)</CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.organizations?.length === 0 && (
              <p className="text-slate-500 text-sm">No results found. Try a different name or spelling.</p>
            )}
            <div className="divide-y">
              {searchResults.organizations?.map((org, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{org.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {org.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{org.city}, {org.state}</span>}
                      {org.ein && <span>EIN: {org.ein}</span>}
                      {org.filing_count > 0 && <span>{org.filing_count} filings</span>}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleGetOrg(org.ein)}>
                    View 990s
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Org Detail + Filings */}
      {orgDetail && (
        <>
          {orgDetail.error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{orgDetail.error}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-[#143A50]/20">
                <CardHeader className="pb-3" style={{ background: 'linear-gradient(135deg,#143A50,#1E4F58)', borderRadius: '8px 8px 0 0' }}>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {orgDetail.organization?.name}
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    EIN: {orgDetail.organization?.ein} &nbsp;|&nbsp; {orgDetail.organization?.city}, {orgDetail.organization?.state}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Total Revenue</p>
                      <p className="font-bold text-slate-900">{fmt(orgDetail.most_recent?.totrevenue)}</p>
                      <p className="text-xs text-slate-400">Most recent</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Total Assets</p>
                      <p className="font-bold text-slate-900">{fmt(orgDetail.most_recent?.totassetsend)}</p>
                      <p className="text-xs text-slate-400">Most recent</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Grants Paid</p>
                      <p className="font-bold text-[#AC1A5B]">{fmt(orgDetail.most_recent?.grntspaidnet)}</p>
                      <p className="text-xs text-slate-400">Most recent</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Contributions</p>
                      <p className="font-bold text-[#143A50]">{fmt(orgDetail.most_recent?.grscontrib)}</p>
                      <p className="text-xs text-slate-400">Most recent</p>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="text-slate-500" onClick={() => setExpandedFilings(!expandedFilings)}>
                    {expandedFilings ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                    {expandedFilings ? 'Hide' : 'Show'} all {orgDetail.filings?.length} filings
                  </Button>

                  {expandedFilings && (
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600">
                          <tr>
                            <th className="text-left px-4 py-2">Year</th>
                            <th className="text-right px-4 py-2">Revenue</th>
                            <th className="text-right px-4 py-2">Assets</th>
                            <th className="text-right px-4 py-2">Grants Paid</th>
                            <th className="text-right px-4 py-2">Contributions</th>
                            <th className="px-4 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {orgDetail.filings?.map((f, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-4 py-2 font-medium">{f.tax_prd_yr}</td>
                              <td className="px-4 py-2 text-right">{fmt(f.totrevenue)}</td>
                              <td className="px-4 py-2 text-right">{fmt(f.totassetsend)}</td>
                              <td className="px-4 py-2 text-right text-[#AC1A5B] font-medium">{fmt(f.grntspaidnet)}</td>
                              <td className="px-4 py-2 text-right">{fmt(f.grscontrib)}</td>
                              <td className="px-4 py-2 text-right">
                                {f.pdf_url && (
                                  <a href={f.pdf_url} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                                      <ExternalLink className="w-3 h-3 mr-1" />PDF
                                    </Button>
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function FunderResearch() {
  const queryClient = useQueryClient();
  const [isResearching, setIsResearching] = useState(false);
  const [researchResults, setResearchResults] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: funders = [] } = useQuery({
    queryKey: ['funders'],
    queryFn: () => base44.entities.Funder.list()
  });

  const { data: funder990s = [] } = useQuery({
    queryKey: ['funder-990s'],
    queryFn: () => base44.entities.Funder990.list()
  });

  const researchFunderMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('researchFunder', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['funders']);
      queryClient.invalidateQueries(['funder-990s']);
      setResearchResults(data);
      toast.success('Funder research completed!');
      setIsResearching(false);
    },
    onError: (error) => {
      toast.error(`Research failed: ${error.message}`);
      setIsResearching(false);
    }
  });

  const handleResearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setIsResearching(true);
    setResearchResults(null);

    researchFunderMutation.mutate({
      funder_name: formData.get('funder_name'),
      funder_website: formData.get('funder_website') || null,
      ein: formData.get('ein') || null
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
            <p className="text-slate-600">This feature is only available to administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const aiResearchedFunders = funders.filter(f => f.ai_researched);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">AI Funder Research</h1>
        <p className="text-slate-600 mt-2">Automatically research and analyze potential funders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Funders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{funders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">AI Researched</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{aiResearchedFunders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">990 Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{funder990s.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="research">
        <TabsList>
          <TabsTrigger value="research">New Research</TabsTrigger>
          <TabsTrigger value="funders">Researched Funders ({aiResearchedFunders.length})</TabsTrigger>
          <TabsTrigger value="990s">990 Data ({funder990s.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="research" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Research Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#AC1A5B]" />
                  Research New Funder
                </CardTitle>
                <CardDescription>
                  AI will automatically extract data from websites and 990 forms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResearch} className="space-y-4">
                  <div>
                    <Label htmlFor="funder_name">Funder Name *</Label>
                    <Input
                      id="funder_name"
                      name="funder_name"
                      placeholder="e.g., Bill & Melinda Gates Foundation"
                      required
                      disabled={isResearching}
                    />
                  </div>
                  <div>
                    <Label htmlFor="funder_website">Website (Optional)</Label>
                    <Input
                      id="funder_website"
                      name="funder_website"
                      placeholder="https://foundation.org"
                      disabled={isResearching}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ein">EIN (Optional)</Label>
                    <Input
                      id="ein"
                      name="ein"
                      placeholder="12-3456789"
                      disabled={isResearching}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Providing EIN enables 990 form data extraction
                    </p>
                  </div>
                  <Button type="submit" disabled={isResearching} className="w-full">
                    {isResearching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Start Research
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Research Results</CardTitle>
              </CardHeader>
              <CardContent>
                {!researchResults && !isResearching && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">Results will appear here</p>
                  </div>
                )}

                {isResearching && (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-[#AC1A5B] mx-auto mb-4 animate-spin" />
                    <p className="text-slate-700 font-medium mb-2">Researching funder...</p>
                    <p className="text-sm text-slate-600">This may take 30-60 seconds</p>
                  </div>
                )}

                {researchResults && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Research Complete!</span>
                    </div>

                    {researchResults.funder_data && (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-slate-500">Mission Statement</Label>
                          <p className="text-sm text-slate-700">{researchResults.funder_data.mission_statement || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Geographic Focus</Label>
                          <p className="text-sm text-slate-700">{researchResults.funder_data.geographic_focus || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Award Range</Label>
                          <p className="text-sm text-slate-700">
                            {researchResults.funder_data.min_award_amount && researchResults.funder_data.max_award_amount
                              ? `$${researchResults.funder_data.min_award_amount.toLocaleString()} - $${researchResults.funder_data.max_award_amount.toLocaleString()}`
                              : 'N/A'}
                          </p>
                        </div>
                        {researchResults.funder_data.sector_focus?.length > 0 && (
                          <div>
                            <Label className="text-xs text-slate-500">Sectors</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {researchResults.funder_data.sector_focus.map((sector, idx) => (
                                <Badge key={idx} variant="outline">{sector}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {researchResults.form_990_data && !researchResults.form_990_data.error && (
                      <div className="border-t pt-4 mt-4">
                        <Label className="text-sm font-medium mb-3 block">990 Data</Label>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total Assets:</span>
                            <span className="font-medium">${researchResults.form_990_data.total_assets?.toLocaleString() || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total Giving:</span>
                            <span className="font-medium">${researchResults.form_990_data.total_giving?.toLocaleString() || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funders" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiResearchedFunders.map((funder) => (
              <Card key={funder.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{funder.name}</CardTitle>
                  <CardDescription>{funder.organization_type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <Label className="text-xs text-slate-500">Geographic Focus</Label>
                      <p className="text-slate-700">{funder.geographic_focus || 'N/A'}</p>
                    </div>
                    {funder.typical_award_min && funder.typical_award_max && (
                      <div>
                        <Label className="text-xs text-slate-500">Award Range</Label>
                        <p className="text-slate-700">
                          ${funder.typical_award_min.toLocaleString()} - ${funder.typical_award_max.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {funder.sector_focus?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {funder.sector_focus.slice(0, 3).map((sector, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{sector}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-slate-500 pt-2 border-t">
                      Researched: {new Date(funder.last_researched_date).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="990s" className="mt-6">
          <div className="space-y-4">
            {funder990s.map((form) => (
              <Card key={form.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{form.funder_name}</CardTitle>
                      <CardDescription>Fiscal Year {form.fiscal_year}</CardDescription>
                    </div>
                    <Badge>990 Data</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-xs text-slate-500">Total Assets</Label>
                      <p className="text-2xl font-bold text-slate-900">
                        ${form.total_assets?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Total Giving</Label>
                      <p className="text-2xl font-bold text-slate-900">
                        ${form.total_giving?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Average Grant</Label>
                      <p className="text-2xl font-bold text-slate-900">
                        ${form.average_grant_amount?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {form.pdf_url && (
                    <div className="mt-4">
                      <a href={form.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">View 990 PDF</Button>
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}