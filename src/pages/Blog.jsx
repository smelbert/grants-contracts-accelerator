import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Search, Calendar, User, BookOpen } from 'lucide-react';
import moment from 'moment';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const results = await base44.entities.BlogPost.filter({ status: 'published' }, '-published_date');
      return results;
    }
  });

  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];
  const recentPosts = posts.slice(0, 3);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#143A50] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('PublicHome')}>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png" 
                alt="Elbert Innovative Solutions" 
                className="h-12 w-auto"
              />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to={createPageUrl('PublicHome')} className="text-slate-700 hover:text-[#143A50] font-medium">Home</Link>
              <Link to={createPageUrl('AboutEIS')} className="text-slate-700 hover:text-[#143A50] font-medium">About</Link>
              <Link to={createPageUrl('Blog')} className="text-[#143A50] font-semibold">Blog</Link>
              <Link to={createPageUrl('IncubateHerPublic')} className="text-[#B21F2D] hover:text-[#9A1826] font-semibold">IncubateHer</Link>
              <a href="https://www.elbertinnovativesolutions.org/" className="text-slate-700 hover:text-[#143A50] font-medium" target="_blank" rel="noopener noreferrer">EIS Website</a>
              <Link to={createPageUrl('Register')}>
                <Button className="bg-[#143A50] hover:bg-[#1E4F58]">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#143A50] via-[#1E4F58] to-[#143A50] text-white py-16">
        <div className="max-w-[1600px] mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">EIS Insights</h1>
          <p className="text-lg text-slate-200">Expert guidance on grant writing, fundraising, and organizational capacity building</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Column */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter search keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-32 py-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#AC1A5B] focus:border-transparent text-lg"
                />
                <button 
                  onClick={() => {}}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-8 py-2 bg-[#FFD700] hover:bg-[#E5C089] text-[#143A50] font-semibold rounded-lg transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">No blog posts found.</p>
              </div>
            ) : (
              <>
                {/* Featured Post */}
                {featuredPost && (
                  <Link to={createPageUrl('BlogPost') + '?slug=' + featuredPost.slug} className="block mb-12">
                    <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
                      <div className="aspect-[16/9] relative">
                        {featuredPost.featured_image ? (
                          <img 
                            src={featuredPost.featured_image} 
                            alt={featuredPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#143A50] to-[#1E4F58]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        {featuredPost.category && (
                          <span className="inline-block px-4 py-1 bg-[#FFD700] text-[#143A50] text-sm font-bold rounded mb-3">
                            {featuredPost.category}
                          </span>
                        )}
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-[#E5C089] transition-colors">
                          {featuredPost.title}
                        </h2>
                        {featuredPost.excerpt && (
                          <p className="text-slate-200 mb-3 line-clamp-2">
                            {featuredPost.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )}

                {/* Blog Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredPosts.slice(1).map((post) => (
                    <Link key={post.id} to={createPageUrl('BlogPost') + '?slug=' + post.slug}>
                      <div className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                        <div className="aspect-[16/10] relative overflow-hidden">
                          {post.featured_image ? (
                            <img 
                              src={post.featured_image} 
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#143A50] to-[#1E4F58]" />
                          )}
                          {post.category && (
                            <div className="absolute top-3 left-3">
                              <span className="inline-block px-3 py-1 bg-[#FFD700] text-[#143A50] text-xs font-bold rounded">
                                {post.category}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-[#143A50] mb-2 group-hover:text-[#AC1A5B] transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          
                          {post.excerpt && (
                            <p className="text-slate-600 text-sm mb-3 line-clamp-2 flex-1">
                              {post.excerpt}
                            </p>
                          )}
                          
                          <div className="text-sm text-slate-500">
                            {moment(post.published_date).format('MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            {/* Recent Posts */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-[#143A50] mb-4">Recent Posts</h3>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <Link 
                    key={post.id} 
                    to={createPageUrl('BlogPost') + '?slug=' + post.slug}
                    className="flex gap-3 group"
                  >
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-[#E5C089] to-[#B5A698]">
                      {post.featured_image ? (
                        <img 
                          src={post.featured_image} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-white/60" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#143A50] group-hover:text-[#AC1A5B] transition-colors text-sm line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {moment(post.published_date).format('MMM d, yyyy')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-[#143A50] mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#FFD700] text-[#143A50]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#FFD700] text-[#143A50]'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#143A50] text-slate-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png" 
                alt="EIS" 
                className="h-10 w-auto mb-4"
              />
              <p className="text-sm">
                Empowering organizations to achieve sustainable growth through strategic funding.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl('PublicHome')} className="hover:text-[#E5C089]">Home</Link></li>
                <li><Link to={createPageUrl('AboutEIS')} className="hover:text-[#E5C089]">About EIS</Link></li>
                <li><Link to={createPageUrl('Blog')} className="hover:text-[#E5C089]">Blog</Link></li>
                <li><a href="https://www.elbertinnovativesolutions.org/" className="hover:text-[#E5C089]" target="_blank" rel="noopener noreferrer">EIS Website</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-sm">
                Visit: <a href="https://www.elbertinnovativesolutions.org/" className="hover:text-[#E5C089]" target="_blank" rel="noopener noreferrer">elbertinnovativesolutions.org</a>
              </p>
            </div>
          </div>
          <div className="border-t border-[#1E4F58] mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 Elbert Innovative Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}