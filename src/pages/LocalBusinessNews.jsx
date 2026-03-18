import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw, MapPin, Newspaper, TrendingUp, DollarSign, Calendar, FileText, Zap } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

const REGIONS = [
  'All Regions',
  'Ohio Statewide',
  'Columbus / Franklin County',
  'Central Ohio',
  'Northeast Ohio',
  'Southwest Ohio',
  'Southeast Ohio',
  'Northwest Ohio',
];

const CATEGORIES = ['all', 'funding', 'grants', 'policy', 'events', 'trends', 'general'];

const categoryConfig = {
  funding: { label: 'Funding', color: 'bg-green-100 text-green-800', icon: DollarSign },
  grants: { label: 'Grants', color: 'bg-blue-100 text-blue-800', icon: FileText },
  policy: { label: 'Policy', color: 'bg-purple-100 text-purple-800', icon: FileText },
  events: { label: 'Events', color: 'bg-amber-100 text-amber-800', icon: Calendar },
  trends: { label: 'Trends', color: 'bg-rose-100 text-rose-800', icon: TrendingUp },
  general: { label: 'General', color: 'bg-slate-100 text-slate-700', icon: Newspaper },
};

export default function LocalBusinessNews() {
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['local-business-news'],
    queryFn: () => base44.entities.LocalBusinessNews.filter({ is_active: true }, '-fetched_date', 100),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 1000 * 60 * 5,
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await base44.functions.invoke('fetchLocalBusinessNews', {});
      toast.success(res?.data?.message || 'News feed refreshed!');
      queryClient.invalidateQueries(['local-business-news']);
    } catch (err) {
      toast.error('Failed to refresh: ' + err.message);
    }
    setRefreshing(false);
  };

  const filtered = articles.filter(a => {
    const regionMatch = selectedRegion === 'All Regions' || a.region === selectedRegion;
    const categoryMatch = selectedCategory === 'all' || a.category === selectedCategory;
    return regionMatch && categoryMatch;
  });

  const lastFetched = articles[0]?.fetched_date;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#143A50] flex items-center gap-3">
              <Newspaper className="w-8 h-8 text-[#E5C089]" />
              Small Business News & Opportunities
            </h1>
            <p className="text-slate-600 mt-1">Latest funding opportunities, grants, and trends for Ohio small business owners</p>
            {lastFetched && (
              <p className="text-xs text-slate-400 mt-1">Last updated: {moment(lastFetched).fromNow()}</p>
            )}
          </div>
          {isAdmin && (
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-[#143A50] hover:bg-[#1E4F58] text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Fetching Latest...' : 'Refresh Feed'}
            </Button>
          )}
        </div>

        {/* Region Filter */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Filter by Region
          </p>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedRegion === r
                    ? 'bg-[#143A50] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#143A50] hover:text-[#143A50]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Filter by Category
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => {
              const cfg = categoryConfig[c];
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                    selectedCategory === c
                      ? 'bg-[#AC1A5B] text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-[#AC1A5B] hover:text-[#AC1A5B]'
                  }`}
                >
                  {cfg?.label || 'All'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Articles */}
        {isLoading ? (
          <div className="text-center py-20 text-slate-400">Loading news feed...</div>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Newspaper className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No articles yet</p>
              {isAdmin ? (
                <p className="text-slate-400 text-sm mt-1">Click "Refresh Feed" to fetch the latest news.</p>
              ) : (
                <p className="text-slate-400 text-sm mt-1">Check back soon — news is updated regularly.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((article) => {
              const cfg = categoryConfig[article.category] || categoryConfig.general;
              const Icon = cfg.icon;
              return (
                <Card key={article.id} className="hover:shadow-md transition-shadow flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={`${cfg.color} text-xs shrink-0`}>
                        <Icon className="w-3 h-3 mr-1 inline" />
                        {cfg.label}
                      </Badge>
                      {article.region && (
                        <Badge variant="outline" className="text-xs text-slate-500 shrink-0">
                          <MapPin className="w-2.5 h-2.5 mr-1 inline" />
                          {article.region}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base leading-snug text-[#143A50]">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-4">{article.summary}</p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                      <div>
                        {article.source && <p className="text-xs font-medium text-slate-500">{article.source}</p>}
                        {article.published_date && (
                          <p className="text-xs text-slate-400">{moment(article.published_date).format('MMM D, YYYY')}</p>
                        )}
                      </div>
                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-[#AC1A5B] hover:underline font-medium"
                        >
                          Read More <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}