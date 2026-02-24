import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, User, Share2, ArrowRight } from 'lucide-react';
import moment from 'moment';
import { toast } from 'sonner';

export default function BlogPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const results = await base44.entities.BlogPost.filter({ slug, status: 'published' });
      return results[0];
    },
    enabled: !!slug
  });

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Blog Post Not Found</h2>
            <p className="text-slate-600 mb-6">The post you're looking for doesn't exist or has been removed.</p>
            <Link to={createPageUrl('Blog')}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </Card>
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

      {/* Header */}
      <div className="bg-gradient-to-br from-[#E5C089]/10 via-[#B5A698]/10 to-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <Link to={createPageUrl('Blog')}>
            <Button variant="ghost" size="sm" className="text-slate-700 hover:text-[#143A50] mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {post.category && (
              <Badge className="bg-[#E5C089] text-[#143A50]">
                {post.category}
              </Badge>
            )}
            {post.tags?.map((tag, idx) => (
              <Badge key={idx} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-5xl font-bold mb-6 text-slate-900 leading-tight">{post.title}</h1>
          
          <div className="flex items-center gap-6 text-slate-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author_name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{moment(post.published_date).format('MMMM D, YYYY')}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-slate-600 hover:text-[#143A50]"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="rounded-xl overflow-hidden shadow-2xl">
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-[500px] object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <article>
          <div 
            className="prose prose-lg prose-slate max-w-none
              prose-headings:text-[#143A50]
              prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-8 prose-h1:mt-8
              prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
              prose-ul:my-6 prose-ul:ml-6 prose-ul:space-y-2
              prose-ol:my-6 prose-ol:ml-6 prose-ol:space-y-2
              prose-li:text-slate-700 prose-li:text-lg prose-li:leading-relaxed
              prose-strong:text-[#143A50] prose-strong:font-semibold
              prose-a:text-[#AC1A5B] prose-a:no-underline hover:prose-a:underline prose-a:font-medium
              prose-blockquote:border-l-4 prose-blockquote:border-[#E5C089] prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600
              prose-hr:my-12 prose-hr:border-slate-200
              prose-code:text-[#AC1A5B] prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Author Bio */}
        {post.author_name && (
          <Card className="mt-12 p-8 bg-[#E5C089]/10 border-[#E5C089]">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-[#143A50] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {post.author_name[0]}
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-slate-900">About {post.author_name}</h3>
                <p className="text-slate-600">
                  Contributing writer at Elbert Innovative Solutions, sharing expert insights on grant writing, fundraising, and organizational development.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* CTA Section */}
        <div className="mt-12 p-8 bg-gradient-to-br from-[#143A50] to-[#1E4F58] rounded-xl text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Funding Strategy?</h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Join hundreds of organizations who have successfully secured sustainable funding with EIS expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Register')}>
              <Button size="lg" className="bg-[#E5C089] text-[#143A50] hover:bg-[#E5C089]/90">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('Blog')}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Read More Articles
              </Button>
            </Link>
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