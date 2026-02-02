import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Video, 
  Users,
  Clock,
  MapPin
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list(),
  });

  const { data: liveRooms = [] } = useQuery({
    queryKey: ['liveRooms'],
    queryFn: () => base44.entities.LiveRoom.list(),
  });

  const { data: liveStreams = [] } = useQuery({
    queryKey: ['liveStreams'],
    queryFn: () => base44.entities.LiveStream.list(),
  });

  const allEvents = [
    ...events.map(e => ({ ...e, type: 'event', date: new Date(e.start_date) })),
    ...liveRooms.map(r => ({ ...r, type: 'liveRoom', date: new Date(r.scheduled_start) })),
    ...liveStreams.map(s => ({ ...s, type: 'liveStream', date: new Date(s.scheduled_start) }))
  ].sort((a, b) => a.date - b.date);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const eventsOnDate = (date) => {
    return allEvents.filter(event => isSameDay(event.date, date));
  };

  const selectedDateEvents = eventsOnDate(selectedDate);
  const upcomingEvents = allEvents.filter(e => e.date >= new Date()).slice(0, 5);

  const getEventIcon = (type) => {
    switch (type) {
      case 'event': return <Users className="w-4 h-4" />;
      case 'liveRoom': return <Video className="w-4 h-4" />;
      case 'liveStream': return <Video className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'event': return 'bg-blue-500';
      case 'liveRoom': return 'bg-emerald-500';
      case 'liveStream': return 'bg-purple-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Calendar</h1>
          <p className="text-slate-600">View all your events, live rooms, and streams in one place</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {format(currentDate, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {daysInMonth.map((day, idx) => {
                    const dayEvents = eventsOnDate(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentDay = isToday(day);

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          relative p-2 h-20 rounded-lg border-2 transition-all text-left
                          ${!isSameMonth(day, currentDate) ? 'opacity-30' : ''}
                          ${isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}
                          ${isCurrentDay && !isSelected ? 'border-blue-400 bg-blue-50' : ''}
                        `}
                      >
                        <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-blue-600' : 'text-slate-900'}`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event, i) => (
                            <div
                              key={i}
                              className={`h-1.5 rounded-full ${getEventColor(event.type)}`}
                            />
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-slate-500">+{dayEvents.length - 2}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-slate-600">Events</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-600">Live Rooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-slate-600">Live Streams</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <div className={`p-1 rounded ${getEventColor(event.type)} bg-opacity-10`}>
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 text-sm truncate">
                              {event.event_name || event.room_name || event.stream_title}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                              <Clock className="w-3 h-3" />
                              {format(event.date, 'h:mm a')}
                            </div>
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-xs text-slate-600 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No events scheduled</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="text-center min-w-[50px]">
                          <div className="text-xs text-slate-500">{format(event.date, 'MMM')}</div>
                          <div className="text-lg font-bold text-slate-900">{format(event.date, 'd')}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 text-sm truncate">
                            {event.event_name || event.room_name || event.stream_title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                            <Clock className="w-3 h-3" />
                            {format(event.date, 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No upcoming events</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}