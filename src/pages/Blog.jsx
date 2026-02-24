import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
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

  const categories = ['all', ...new Set(posts.map(p => p.category).filter(Boolean))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png" 
                alt="Elbert Innovative Solutions" 
                className="h-12 w-auto"
              />
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400 animate-pulse" />
              <p className="text-slate-600">Loading blog posts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png" 
                alt="Elbert Innovative Solutions" 
                className="h-12 w-auto"
              />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link to={createPageUrl('PublicHome')} className="text-slate-700 hover:text-[#143A50] font-medium">Home</Link>
              <Link to={createPageUrl('AboutEIS')} className="text-slate-700 hover:text-[#143A50] font-medium">About</Link>
              <Link to={createPageUrl('Blog')} className="text-slate-700 hover:text-[#143A50] font-medium">Blog</Link>
              <Link to={createPageUrl('IncubateHerPublic')} className="text-[#B21F2D] hover:text-[#9A1826] font-semibold">
                IncubateHer
              </Link>
              <a href="https://www.elbertinnovativesolutions.org/" className="text-slate-700 hover:text-[#143A50] font-medium" target="_blank" rel="noopener noreferrer">EIS Website</a>
              <Link to={createPageUrl('Register')}>
                <Button className="bg-[#143A50] hover:bg-[#1E4F58]">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-[#E5C089]/10 via-[#B5A698]/10 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">EIS Insights</h1>
            <p className="text-xl text-slate-600">
              Expert guidance on grant writing, fundraising, and organizational capacity building
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search and Filter */}
        <div className="mb-12 space-y-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="pl-12 h-12 text-lg border-slate-300"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-[#143A50] hover:bg-[#1E4F58]' : ''}
              >
                {category === 'all' ? 'All Articles' : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-12">
            <Card className="overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="grid md:grid-cols-2 gap-0">
                {featuredPost.featured_image && (
                  <div className="h-96 md:h-auto overflow-hidden">
                    <img 
                      src={featuredPost.featured_image} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={featuredPost.featured_image ? "p-8" : "p-8 md:col-span-2"}>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-[#143A50] text-white">Featured</Badge>
                    {featuredPost.category && (
                      <Badge variant="outline" className="text-[#143A50] border-[#143A50]">
                        {featuredPost.category}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4 hover:text-[#143A50] transition-colors">
                    <Link to={createPageUrl('BlogPost') + '?slug=' + featuredPost.slug}>
                      {featuredPost.title}
                    </Link>
                  </h2>
                  <p className="text-lg text-slate-600 mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{featuredPost.author_name || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{moment(featuredPost.published_date).format('MMMM D, YYYY')}</span>
                      </div>
                    </div>
                    <Link to={createPageUrl('BlogPost') + '?slug=' + featuredPost.slug}>
                      <Button className="bg-[#143A50] hover:bg-[#1E4F58]">
                        Read More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Recent Posts Heading */}
        {regularPosts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Recent Articles</h2>
          </div>
        )}

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3" />
                <p>No blog posts found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-xl transition-shadow flex flex-col">
                {post.featured_image && (
                  <div className="h-56 overflow-hidden">
                    <img 
                      src={post.featured_image} 
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {post.category && (
                      <Badge variant="outline" className="text-[#143A50] border-[#143A50]">
                        {post.category}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl hover:text-[#143A50] transition-colors leading-tight">
                    <Link to={createPageUrl('BlogPost') + '?slug=' + post.slug}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3 mt-2">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{moment(post.published_date).format('MMM D, YYYY')}</span>
                    </div>
                  </div>
                  <Link to={createPageUrl('BlogPost') + '?slug=' + post.slug}>
                    <Button variant="ghost" size="sm" className="w-full text-[#143A50] hover:text-[#1E4F58] hover:bg-[#E5C089]/10">
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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