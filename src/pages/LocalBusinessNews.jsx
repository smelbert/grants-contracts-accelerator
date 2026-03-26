import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Search, Newspaper, RefreshCw, MapPin, Tag } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_COLORS = {
  funding: 'bg-green-500',
  grants: 'bg-blue-500',
  policy: 'bg-purple-500',
  events: 'bg-orange-500',
  trends: 'bg-teal-500',
  general: 'bg-slate-400',
};

const CATEGORY_LABELS = {
  funding: 'Funding',
  grants: 'Grants',
  policy: 'Policy',
  events: 'Events',
  trends: 'Trends',
  general: 'General',
};

export default function LocalBusinessNews() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  const { data: articles = [], isLoading, refetch } = useQuery({
    queryKey: ['local-business-news'],
    queryFn: () => base44.entities.LocalBusinessNews.filter({ is_active: true }, '-published_date', 50),
  });

  const filtered = articles.filter(a => {
    const matchesSearch = !search || 
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.summary?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
    const matchesRegion = regionFilter === 'all' || a.region === regionFilter;
    return matchesSearch && matchesCategory && matchesRegion;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-[#143A50] text-white px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Newspaper className="w-7 h-7 text-[#E5C089]" />
            <h1 className="text-3xl font-bold">Ohio Business News</h1>
          </div>
          <p className="text-white/70 text-sm max-w-xl">
            Stay current with funding opportunities, policy updates, and business trends across Ohio.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-sm text-white/60">
            <span><strong className="text-[#E5C089]">{articles.length}</strong> articles</span>
            <span><strong className="text-[#E5C089]">{[...new Set(articles.map(a => a.region))].length}</strong> regions covered</span>
            <span><strong className="text-[#E5C089]">{[...new Set(articles.map(a => a.category))].length}</strong> categories</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="Ohio Statewide">Ohio Statewide</SelectItem>
              <SelectItem value="Columbus / Franklin County">Columbus / Franklin County</SelectItem>
              <SelectItem value="Central Ohio">Central Ohio</SelectItem>
              <SelectItem value="Northeast Ohio">Northeast Ohio</SelectItem>
              <SelectItem value="Southwest Ohio">Southwest Ohio</SelectItem>
              <SelectItem value="Southeast Ohio">Southeast Ohio</SelectItem>
              <SelectItem value="Northwest Ohio">Northwest Ohio</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading articles...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No articles found</p>
            <p className="text-sm mt-1">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured */}
            {featured && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className={`h-1.5 ${CATEGORY_COLORS[featured.category] || 'bg-slate-400'}`} />
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={`${CATEGORY_COLORS[featured.category] || 'bg-slate-400'} text-white border-0 text-xs`}>
                      {CATEGORY_LABELS[featured.category] || featured.category}
                    </Badge>
                    {featured.region && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" /> {featured.region}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">
                      {featured.published_date ? format(new Date(featured.published_date), 'MMM d, yyyy') : ''}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[#143A50] mb-2 leading-snug">{featured.title}</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{featured.summary}</p>
                  <div className="flex items-center justify-between">
                    {featured.source && <span className="text-xs text-slate-400 flex items-center gap-1"><Tag className="w-3 h-3" />{featured.source}</span>}
                    {featured.url && (
                      <a href={featured.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58] text-white gap-1">
                          Read Full Article <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Rest */}
            {rest.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {rest.map(article => (
                  <div key={article.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className={`h-1 ${CATEGORY_COLORS[article.category] || 'bg-slate-400'}`} />
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2 mb-2 items-center">
                        <Badge className={`${CATEGORY_COLORS[article.category] || 'bg-slate-400'} text-white border-0 text-xs`}>
                          {CATEGORY_LABELS[article.category] || article.category}
                        </Badge>
                        {article.region && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <MapPin className="w-3 h-3" /> {article.region}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 ml-auto">
                          {article.published_date ? format(new Date(article.published_date), 'MMM d, yyyy') : ''}
                        </span>
                      </div>
                      <h3 className="font-semibold text-[#143A50] text-sm leading-snug mb-2">{article.title}</h3>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-3">{article.summary}</p>
                      <div className="flex items-center justify-between">
                        {article.source && <span className="text-xs text-slate-400 truncate">{article.source}</span>}
                        {article.url && (
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="ml-auto flex-shrink-0">
                            <Button variant="ghost" size="sm" className="text-[#143A50] hover:bg-[#143A50]/10 text-xs gap-1 h-7 px-2">
                              Read More <ExternalLink className="w-3 h-3" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}