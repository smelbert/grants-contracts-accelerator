import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Users } from 'lucide-react';

export default function LiveStreamsPage() {
  const { data: streams = [] } = useQuery({
    queryKey: ['live-streams'],
    queryFn: () => base44.entities.LiveStream.list('-scheduled_start'),
  });

  const liveStreams = streams.filter(s => s.status === 'live');
  const upcomingStreams = streams.filter(s => s.status === 'scheduled');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-2.5 rounded-lg">
              <Video className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Live Streams</h1>
          </div>
          <p className="text-slate-600 ml-12">Watch live sessions and interactive events</p>
        </div>

        {liveStreams.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-slate-900">Now Live</h2>
              <Badge className="bg-red-500 text-white font-medium ml-2">{liveStreams.length} session{liveStreams.length !== 1 ? 's' : ''}</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {liveStreams.map(stream => (
                <Card key={stream.id} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl text-slate-900 flex-1">{stream.stream_title}</CardTitle>
                      <Badge className="bg-red-500 text-white animate-pulse font-medium">LIVE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-slate-900 rounded-lg mb-4 overflow-hidden">
                      <iframe src={stream.stream_url} className="w-full h-full rounded-lg border-0" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <Users className="w-4 h-4 text-red-600" />
                      {stream.total_viewers || 0} watching now
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {upcomingStreams.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-slate-400 rounded"></div>
              Upcoming Streams
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingStreams.map(stream => (
                <Card key={stream.id} className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="h-1 bg-slate-400"></div>
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">{stream.stream_title}</CardTitle>
                    {stream.description && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{stream.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-sm">Scheduled</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {liveStreams.length === 0 && upcomingStreams.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="text-center py-16">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No live streams available</p>
              <p className="text-sm text-slate-500 mt-1">Check back soon for upcoming sessions</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}