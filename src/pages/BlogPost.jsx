import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <Link to={createPageUrl('Blog')}>
            <Button variant="ghost" size="sm" className="text-white hover:text-white/80 mb-6">
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
          
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-6 text-white/90">
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
              className="text-white hover:text-white/80"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="max-w-4xl mx-auto px-6 -mt-12">
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="p-8">
          <div 
            className="prose prose-slate max-w-none
              prose-headings:text-[#143A50]
              prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6
              prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
              prose-ul:my-4 prose-ul:ml-6
              prose-li:text-slate-700 prose-li:mb-2
              prose-strong:text-[#143A50] prose-strong:font-semibold
              prose-a:text-[#AC1A5B] prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-l-4 prose-blockquote:border-[#E5C089] prose-blockquote:pl-4 prose-blockquote:italic
              prose-hr:my-8 prose-hr:border-slate-200"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Card>

        {/* Author Bio */}
        {post.author_name && (
          <Card className="mt-8 p-6 bg-slate-50">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-[#143A50] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {post.author_name[0]}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">About {post.author_name}</h3>
                <p className="text-slate-600 text-sm">
                  Contributing writer at Elbert Innovative Solutions
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}