import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Calendar, Clock, MapPin, Video, Users, FileText, ExternalLink,
  MessageSquare, ChevronDown, ChevronUp, User, Send, CalendarPlus
} from 'lucide-react';
import { format } from 'date-fns';
import CalendarSyncButton from '@/components/events/CalendarSyncButton';
import { toast } from 'sonner';

export default function EventDetailView({ event, userEmail, userName, onClose }) {
  const [qaText, setQaText] = useState('');
  const [showAllQa, setShowAllQa] = useState(false);
  const queryClient = useQueryClient();

  const { data: qaItems = [] } = useQuery({
    queryKey: ['event-qa', event?.id],
    queryFn: () => base44.entities.DiscussionReply.filter({ document_id: `event-${event.id}` }),
    enabled: !!event?.id
  });

  const postQaMutation = useMutation({
    mutationFn: (text) => base44.entities.DiscussionReply.create({
      document_id: `event-${event.id}`,
      content: text,
      author_email: userEmail,
      author_name: userName || userEmail
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-qa', event?.id]);
      setQaText('');
      toast.success('Question submitted!');
    }
  });

  if (!event) return null;

  const startDate = event.start_date ? new Date(event.start_date) : event.date;
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const isPast = startDate && startDate < new Date();

  const agenda = event.agenda || [];
  const speakers = event.speakers || [];
  const materials = event.materials || [];

  const visibleQa = showAllQa ? qaItems : qaItems.slice(0, 3);

  const eventTypeColors = {
    webinar: 'bg-blue-100 text-blue-800',
    workshop: 'bg-green-100 text-green-800',
    meetup: 'bg-purple-100 text-purple-800',
    training: 'bg-amber-100 text-amber-800',
    conference: 'bg-pink-100 text-pink-800',
    networking: 'bg-teal-100 text-teal-800',
  };

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="pb-0">
          <div className="flex flex-wrap gap-2 mb-2">
            {event.event_type && (
              <Badge className={eventTypeColors[event.event_type] || 'bg-slate-100 text-slate-800'}>
                {event.event_type}
              </Badge>
            )}
            {isPast && <Badge variant="outline">Past Event</Badge>}
            {event.is_recurring && <Badge variant="outline">Recurring</Badge>}
          </div>
          <DialogTitle className="text-2xl font-bold text-[#143A50] leading-tight">
            {event.event_name || event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Date / Time / Location */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            {startDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-[#143A50] flex-shrink-0" />
                <span className="font-medium">{format(startDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
            )}
            {startDate && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-[#143A50] flex-shrink-0" />
                <span>
                  {format(startDate, 'h:mm a')}
                  {endDate ? ` – ${format(endDate, 'h:mm a')}` : ''}
                  {event.timezone ? ` (${event.timezone})` : ''}
                </span>
              </div>
            )}
            {event.location_type === 'virtual' || event.location_type === 'hybrid' ? (
              <div className="flex items-center gap-3 text-sm">
                <Video className="w-4 h-4 text-[#143A50] flex-shrink-0" />
                <span>Virtual Event</span>
                {event.meeting_url && !isPast && (
                  <a href={event.meeting_url} target="_blank" rel="noopener noreferrer"
                    className="text-[#143A50] underline ml-auto">Join Link</a>
                )}
              </div>
            ) : null}
            {(event.location_type === 'in_person' || event.location_type === 'hybrid') && event.location_details && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-[#143A50] flex-shrink-0" />
                <span>{event.location_details}</span>
              </div>
            )}
          </div>

          {/* Add to Calendar */}
          {!isPast && startDate && (
            <div className="flex items-center gap-3">
              <CalendarPlus className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Add to Calendar:</span>
              <CalendarSyncButton
                title={event.event_name || event.title}
                date={startDate}
                endDate={endDate}
                description={event.description}
                location={event.location_details || event.meeting_url}
              />
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">About this Event</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
          )}

          <Separator />

          {/* Agenda */}
          {agenda.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Agenda</h3>
              <div className="space-y-2">
                {agenda.map((item, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-50">
                    {item.time && (
                      <span className="text-xs font-mono text-slate-400 w-16 flex-shrink-0 pt-0.5">{item.time}</span>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speakers */}
          {speakers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Speakers</h3>
              <div className="space-y-3">
                {speakers.map((speaker, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 rounded-lg border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-[#143A50]/10 flex items-center justify-center flex-shrink-0">
                      {speaker.photo_url
                        ? <img src={speaker.photo_url} alt={speaker.name} className="w-10 h-10 rounded-full object-cover" />
                        : <User className="w-5 h-5 text-[#143A50]" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{speaker.name}</p>
                      {speaker.title && <p className="text-xs text-slate-500">{speaker.title}</p>}
                      {speaker.bio && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{speaker.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materials */}
          {materials.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Presentation Materials</h3>
              <div className="space-y-2">
                {materials.map((mat, i) => (
                  <a key={i} href={mat.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <FileText className="w-4 h-4 text-[#AC1A5B] flex-shrink-0" />
                    <span className="text-sm text-slate-700 flex-1">{mat.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Q&A / Discussion */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Q&A / Discussion
            </h3>

            {/* Submit */}
            {userEmail && (
              <div className="mb-4">
                <Textarea
                  value={qaText}
                  onChange={(e) => setQaText(e.target.value)}
                  placeholder="Ask a question or leave a comment about this event..."
                  rows={3}
                  className="mb-2"
                />
                <Button size="sm" disabled={!qaText.trim() || postQaMutation.isPending}
                  onClick={() => postQaMutation.mutate(qaText)}
                  className="bg-[#143A50] hover:bg-[#1E4F58]">
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Post
                </Button>
              </div>
            )}

            {qaItems.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No questions yet. Be the first to ask!</p>
            ) : (
              <div className="space-y-3">
                {visibleQa.map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-[#143A50]/10 flex items-center justify-center">
                        <User className="w-3 h-3 text-[#143A50]" />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{item.author_name || item.author_email}</span>
                      {item.created_date && (
                        <span className="text-xs text-slate-400 ml-auto">
                          {format(new Date(item.created_date), 'MMM d, h:mm a')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 ml-8">{item.content}</p>
                  </div>
                ))}
                {qaItems.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full text-slate-500"
                    onClick={() => setShowAllQa(!showAllQa)}>
                    {showAllQa ? <><ChevronUp className="w-3.5 h-3.5 mr-1" />Show less</> : <><ChevronDown className="w-3.5 h-3.5 mr-1" />Show all {qaItems.length} comments</>}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}