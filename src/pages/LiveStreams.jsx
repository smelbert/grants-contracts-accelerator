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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
          <Video className="w-8 h-8 text-red-600" />
          Live Streams
        </h1>

        {liveStreams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">🔴 Live Now</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {liveStreams.map(stream => (
                <Card key={stream.id} className="border-red-500 border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {stream.stream_title}
                      <Badge className="bg-red-500">Live</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-slate-900 rounded-lg mb-4">
                      <iframe src={stream.stream_url} className="w-full h-full rounded-lg" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4" />
                      {stream.total_viewers} watching
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4">Upcoming Streams</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {upcomingStreams.map(stream => (
            <Card key={stream.id}>
              <CardHeader>
                <CardTitle className="text-base">{stream.stream_title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{stream.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}