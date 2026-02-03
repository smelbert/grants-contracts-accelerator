import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { Play, Clock, Search, Video } from 'lucide-react';

export default function IncubateHerVideoLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: cohort } = useQuery({
    queryKey: ['incubateher-cohort'],
    queryFn: async () => {
      const cohorts = await base44.entities.ProgramCohort.filter({
        program_code: 'incubateher_funding_readiness'
      });
      return cohorts[0];
    }
  });

  const { data: videos } = useQuery({
    queryKey: ['workbook-videos', cohort?.id],
    queryFn: async () => {
      if (!cohort?.id) return [];
      const items = await base44.entities.ProgramWorkbookItem.filter({
        cohort_id: cohort.id,
        item_type: 'video',
        is_visible: true
      });
      return items.sort((a, b) => (a.order || 0) - (b.order || 0));
    },
    enabled: !!cohort?.id
  });

  const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url;
  };

  const filteredVideos = videos?.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.section?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const sectionColors = {
    front_matter: 'bg-slate-100 text-slate-800',
    funding_foundations: 'bg-blue-100 text-blue-800',
    readiness: 'bg-green-100 text-green-800',
    documents: 'bg-purple-100 text-purple-800',
    rfps: 'bg-amber-100 text-amber-800',
    story: 'bg-pink-100 text-pink-800',
    consultation: 'bg-teal-100 text-teal-800',
    expert_interviews: 'bg-indigo-100 text-indigo-800'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader 
        title="Video Library"
        subtitle="Expert guidance and facilitator insights"
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos by title, topic, or section..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Selected Video Player */}
        {selectedVideo && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">{selectedVideo.title}</CardTitle>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    {selectedVideo.video_duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selectedVideo.video_duration}
                      </span>
                    )}
                    {selectedVideo.section && (
                      <Badge className={sectionColors[selectedVideo.section] || 'bg-slate-100 text-slate-800'}>
                        {selectedVideo.section.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVideo(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden bg-slate-900 mb-4">
                {getVideoEmbedUrl(selectedVideo.video_url)?.startsWith('http') ? (
                  <iframe
                    src={getVideoEmbedUrl(selectedVideo.video_url)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedVideo.video_url}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
              {selectedVideo.description && (
                <p className="text-slate-600">{selectedVideo.description}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Video Grid */}
        {filteredVideos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Video className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                {searchQuery ? 'No videos found' : 'No Videos Yet'}
              </h3>
              <p className="text-slate-500">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Video content will be added as the program progresses'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => (
              <Card 
                key={video.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <CardHeader>
                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-900 mb-3 relative group">
                    {video.video_url ? (
                      <>
                        <img
                          src={`https://img.youtube.com/vi/${video.video_url.includes('youtube.com') ? video.video_url.split('v=')[1]?.split('&')[0] : 'placeholder'}/maxresdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"%3E%3Crect fill="%23334155" width="640" height="360"/%3E%3C/svg%3E';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-8 h-8 text-[#143A50] ml-1" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-base">{video.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {video.video_duration && (
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.video_duration}
                      </span>
                    )}
                    {video.section && (
                      <Badge className={`text-xs ${sectionColors[video.section] || 'bg-slate-100 text-slate-800'}`}>
                        {video.section.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {video.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">{video.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CoBrandedFooter />
    </div>
  );
}