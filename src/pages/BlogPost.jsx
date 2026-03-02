import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Share2, ArrowRight } from 'lucide-react';
import moment from 'moment';
import { toast } from 'sonner';
import CommentSection from '@/components/blog/CommentSection';

export default function BlogPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const results = await base44.entities.BlogPost.filter({ slug, status: 'published' });
      return results[0];
    },
    enabled: !!slug
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: ['related-posts', post?.id, post?.category, post?.tags],
    queryFn: async () => {
      if (!post) return [];
      const allPublished = await base44.entities.BlogPost.filter({ status: 'published' });
      const others = allPublished.filter(p => p.id !== post.id);

      // Score each post by relevance (category + tag overlap)
      const scored = others.map(p => {
        let score = 0;
        if (post.category && p.category === post.category) score += 3;
        const postTags = post.tags || [];
        const pTags = p.tags || [];
        const sharedTags = postTags.filter(t => pTags.includes(t));
        score += sharedTags.length;
        return { post: p, score };
      });

      // Sort by score desc, then by date desc for ties
      scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.post.published_date) - new Date(a.post.published_date);
      });

      return scored.filter(s => s.score > 0).slice(0, 3).map(s => s.post);
    },
    enabled: !!post
  });

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#143A50] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Blog Post Not Found</h2>
          <Link to={createPageUrl('Blog')}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
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

      {/* Hero Image with Title Overlay */}
      <div className="relative">
        <div className="h-[500px] relative overflow-hidden">
          {post.featured_image ? (
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#143A50] via-[#1E4F58] to-[#143A50]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-[1280px] mx-auto px-6 pb-12">
              <Link 
                to={createPageUrl('Blog')}
                className="inline-flex items-center gap-2 text-white hover:text-[#E5C089] mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back to Blog</span>
              </Link>

              {post.category && (
                <span className="inline-block px-4 py-1 bg-[#FFD700] text-[#143A50] text-sm font-bold rounded mb-4">
                  {post.category}
                </span>
              )}

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{post.author_name || 'EIS Team'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{moment(post.published_date).format('MMMM D, YYYY')}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white hover:text-[#E5C089] hover:bg-white/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <article className="bg-white">
          <style>{`
            article h1 {
              font-size: 2.5rem;
              font-weight: 700;
              color: #143A50;
              margin-top: 3rem;
              margin-bottom: 1.5rem;
              line-height: 1.2;
              border-bottom: 3px solid #E5C089;
              padding-bottom: 0.75rem;
            }
            
            article h2 {
              font-size: 2rem;
              font-weight: 700;
              color: #143A50;
              margin-top: 3rem;
              margin-bottom: 1.25rem;
              line-height: 1.3;
              padding-left: 1rem;
              border-left: 4px solid #AC1A5B;
            }
            
            article h3 {
              font-size: 1.5rem;
              font-weight: 600;
              color: #1E4F58;
              margin-top: 2rem;
              margin-bottom: 1rem;
              line-height: 1.4;
            }
            
            article p {
              font-size: 1.125rem;
              line-height: 1.8;
              color: #334155;
              margin-bottom: 1.5rem;
            }
            
            article ul, article ol {
              margin: 1.5rem 0;
              padding-left: 2rem;
            }
            
            article li {
              font-size: 1.125rem;
              line-height: 1.8;
              color: #334155;
              margin-bottom: 0.75rem;
            }
            
            article strong {
              font-weight: 600;
              color: #143A50;
            }
            
            article em {
              font-style: italic;
              color: #475569;
            }
            
            article a {
              color: #AC1A5B;
              text-decoration: none;
              font-weight: 500;
              border-bottom: 1px solid transparent;
              transition: border-color 0.2s;
            }
            
            article a:hover {
              border-bottom-color: #AC1A5B;
            }
            
            article blockquote {
              border-left: 4px solid #E5C089;
              padding-left: 1.5rem;
              margin: 2rem 0;
              font-style: italic;
              color: #64748b;
              background: #F8F9FA;
              padding: 1.5rem;
              border-radius: 0.5rem;
            }
            
            article hr {
              margin: 3rem 0;
              border: none;
              border-top: 2px solid #E2E8F0;
            }
            
            article code {
              background: #F1F5F9;
              color: #AC1A5B;
              padding: 0.2rem 0.4rem;
              border-radius: 0.25rem;
              font-size: 0.9em;
              font-family: 'Monaco', 'Courier New', monospace;
            }
            
            article pre {
              background: #1E293B;
              color: #E2E8F0;
              padding: 1.5rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin: 2rem 0;
            }
            
            article pre code {
              background: transparent;
              color: inherit;
              padding: 0;
            }
            
            article img {
              max-width: 100%;
              height: auto;
              border-radius: 0.5rem;
              margin: 2rem 0;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            article table {
              width: 100%;
              border-collapse: collapse;
              margin: 2rem 0;
            }
            
            article th, article td {
              border: 1px solid #E2E8F0;
              padding: 0.75rem;
              text-align: left;
            }
            
            article th {
              background: #F8F9FA;
              font-weight: 600;
              color: #143A50;
            }
          `}</style>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        {/* Author Bio - always Dr. Shawnte Elbert */}
        <div className="border-t border-slate-200 pt-8 mt-12">
          <div className="flex items-start gap-5 bg-gradient-to-r from-[#143A50]/5 to-[#E5C089]/10 rounded-xl p-6 border border-[#E5C089]/30">
            <div className="w-20 h-20 bg-[#143A50] rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 border-4 border-[#E5C089]">
              SE
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#AC1A5B] mb-1">About the Author</p>
              <h3 className="text-xl font-bold text-[#143A50] mb-2">Dr. Shawnte Elbert</h3>
              <p className="text-slate-600 leading-relaxed">
                Founder & CEO of Elbert Innovative Solutions, Dr. Shawnte Elbert is a nationally recognized expert in nonprofit capacity building, strategic funding, and organizational development. With over two decades of experience, she empowers nonprofits and small businesses to secure sustainable funding and achieve lasting impact.
              </p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection 
          postId={post.id} 
          postAuthorEmail={post.author_email}
          user={user}
          isAdmin={user?.role === 'admin' || user?.role === 'owner'}
        />
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-slate-50 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-[#AC1A5B] rounded-full" />
              <h2 className="text-3xl font-bold text-[#143A50]">You May Also Like</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} to={createPageUrl('BlogPost') + '?slug=' + relatedPost.slug}>
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                    <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-[#E5C089]/30 to-[#143A50]/20">
                      {relatedPost.featured_image ? (
                        <img 
                          src={relatedPost.featured_image} 
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl font-black text-[#143A50]/10">EIS</span>
                        </div>
                      )}
                      {relatedPost.category && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-[#FFD700] text-[#143A50] text-xs font-bold rounded">
                          {relatedPost.category}
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-[#143A50] group-hover:text-[#AC1A5B] transition-colors line-clamp-2 mb-2 text-lg leading-snug">
                        {relatedPost.title}
                      </h3>
                      {relatedPost.excerpt && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
                          {relatedPost.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                        <div>
                          <p className="text-xs font-semibold text-[#143A50]">Dr. Shawnte Elbert</p>
                          <p className="text-xs text-slate-500">
                            {moment(relatedPost.published_date).format('MMM D, YYYY')}
                          </p>
                        </div>
                        <span className="text-[#AC1A5B] group-hover:translate-x-1 transition-transform">
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[#143A50] to-[#1E4F58] rounded-2xl p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Funding Strategy?</h3>
            <p className="text-slate-200 mb-8 max-w-2xl mx-auto text-lg">
              Partner with Elbert Innovative Solutions to secure the funding your organization needs to make lasting impact.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to={createPageUrl('Register')}>
                <Button className="bg-[#FFD700] text-[#143A50] hover:bg-[#E5C089] font-semibold px-8 py-6 text-lg">
                  Get Started Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('AboutEIS')}>
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                  Learn More About EIS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#143A50] text-slate-400 py-12">
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