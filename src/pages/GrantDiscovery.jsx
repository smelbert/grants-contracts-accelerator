import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, Search as SearchIcon } from 'lucide-react';
import GrantSearchForm from '@/components/grants/GrantSearchForm';
import GrantResultCard from '@/components/grants/GrantResultCard';
import GrantSearchMeta from '@/components/grants/GrantSearchMeta';

const SUGGESTED_SEARCHES = [
  "Grants for women-led nonprofits",
  "Community development funding in Ohio",
  "Youth mentorship program grants",
  "Small business capacity building grants",
  "Workforce development funding",
  "Health equity grants for underserved communities",
];

export default function GrantDiscovery({ embedded = false }) {
  const [results, setResults] = useState(null);
  const [meta, setMeta] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState('');

  const handleSearch = async (params) => {
    setIsLoading(true);
    setError(null);
    setLastQuery(params.query);

    const response = await base44.functions.invoke('grantedAIDiscover', params);
    setIsLoading(false);

    if (response.data?.error) {
      setError(response.data.error);
      setResults(null);
      setMeta(null);
      return;
    }

    setResults(response.data?.data || []);
    setMeta(response.data?.meta || null);
    setRateLimitInfo(response.data?.rateLimitInfo || null);
  };

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gradient-to-b from-slate-50 to-white'}>
      <div className={embedded ? '' : 'max-w-5xl mx-auto px-4 sm:px-6 py-8'}>
        {/* Header */}
        {!embedded && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#143A50]/5 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-[#E5C089]" />
            <span className="text-sm font-medium text-[#143A50]">AI-Powered Grant Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#143A50] mb-2">
            Find Your Perfect Grant
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Describe your organization and goals in plain English. Our AI searches across 85,000+ grants 
            and 133,000+ foundations to find the best matches.
          </p>
        </div>
        )}
        {embedded && (
          <div className="mb-6 bg-gradient-to-r from-[#AC1A5B]/10 to-[#143A50]/10 rounded-2xl p-4 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#AC1A5B] shrink-0" />
            <div>
              <p className="font-semibold text-[#143A50]">AI Grant Discovery</p>
              <p className="text-sm text-slate-600">Describe your organization and goals — our AI searches 85,000+ grants and 133,000+ foundations to find matches.</p>
            </div>
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
          <GrantSearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Suggested Searches - show only before first search */}
        {!results && !isLoading && !error && (
          <div className="mb-8">
            <p className="text-sm text-slate-500 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Try a search:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SEARCHES.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSearch({ query: suggestion, limit: 15 })}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-700 hover:bg-[#143A50]/5 hover:border-[#143A50]/20 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#143A50]/10 border-t-[#143A50] animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#E5C089]" />
              </div>
              <div>
                <p className="font-medium text-[#143A50]">Searching across grants & foundations...</p>
                <p className="text-sm text-slate-500 mt-1">AI is analyzing the best matches for you</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {results && !isLoading && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-[#143A50]">
                Results for "{lastQuery}"
              </h2>
              <GrantSearchMeta meta={meta} rateLimitInfo={rateLimitInfo} />
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No grants found</p>
                <p className="text-sm text-slate-500 mt-1">Try broadening your search or using different keywords</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {results.map((grant, index) => (
                  <GrantResultCard key={grant.slug || index} grant={grant} />
                ))}
              </div>
            )}

            {/* Anonymous key notice */}
            <div className="mt-6 bg-[#E5C089]/10 border border-[#E5C089]/30 rounded-xl p-4 text-sm text-[#143A50]">
              <p>
                <strong>Note:</strong> You're using the shared anonymous Granted API key (3 AI searches/day). 
                Create a free account at{' '}
                <a href="https://grantedai.com/developers" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                  grantedai.com/developers
                </a>{' '}
                for 10 searches/day and your own key.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}