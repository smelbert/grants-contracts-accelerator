import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Video, 
  Users,
  Clock,
  Filter,
  Presentation
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState({
    events: true,
    liveRooms: true,
    liveStreams: true
  });

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

  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getEventTypeColor = (event) => {
    if (event.type === 'liveRoom') return 'bg-purple-500';
    if (event.type === 'liveStream') return 'bg-pink-500';
    // For events, use event_type
    if (event.event_type === 'workshop') return 'bg-amber-500';
    if (event.event_type === 'training') return 'bg-emerald-500';
    if (event.event_type === 'webinar') return 'bg-indigo-500';
    if (event.event_type === 'networking') return 'bg-cyan-500';
    return 'bg-blue-500';
  };

  const getEventTypeLabel = (event) => {
    if (event.type === 'liveRoom') return 'Live Room';
    if (event.type === 'liveStream') return 'Live Stream';
    if (event.event_type === 'workshop') return 'Workshop';
    if (event.event_type === 'training') return 'Training';
    if (event.event_type === 'webinar') return 'Webinar';
    if (event.event_type === 'networking') return 'Networking';
    return 'Event';
  };

  const shouldShowEvent = (event) => {
    if (event.type === 'liveRoom') return filters.liveRooms;
    if (event.type === 'liveStream') return filters.liveStreams;
    return filters.events;
  };

  const allEvents = [
    ...events.map(e => ({ ...e, type: 'event', date: new Date(e.start_date) })),
    ...liveRooms.map(r => ({ ...r, type: 'liveRoom', date: new Date(r.scheduled_start) })),
    ...liveStreams.map(s => ({ ...s, type: 'liveStream', date: new Date(s.scheduled_start) }))
  ]
    .filter(shouldShowEvent)
    .sort((a, b) => a.date - b.date);

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
      case 'liveStream': return <Presentation className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Live Sessions / Events</h1>
              <p className="text-slate-600">View all upcoming events, live sessions, and streams</p>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-white border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-slate-600" />
                <span className="font-semibold text-slate-900">Filter by Type</span>
                <Badge variant="outline" className="ml-2">{activeFiltersCount} selected</Badge>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={filters.events} 
                    onCheckedChange={() => toggleFilter('events')}
                  />
                  <span className="text-sm">Events</span>
                  <span className="text-xs text-slate-500">(Workshops, Trainings, Webinars)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={filters.liveRooms} 
                    onCheckedChange={() => toggleFilter('liveRooms')}
                  />
                  <span className="text-sm">Live Rooms</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={filters.liveStreams} 
                    onCheckedChange={() => toggleFilter('liveStreams')}
                  />
                  <span className="text-sm">Live Streams</span>
                </label>
              </div>
            </CardContent>
          </Card>
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
                          ${isSelected ? 'border-[#143A50] bg-[#E5C089]/20' : 'border-slate-200 hover:border-slate-300'}
                          ${isCurrentDay && !isSelected ? 'border-blue-400 bg-blue-50' : ''}
                        `}
                      >
                        <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-blue-600' : 'text-slate-900'}`}>
                          {format(day, 'd')}
                        </div>
                        <div className="flex flex-wrap gap-0.5">
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <div
                              key={i}
                              className={`h-1.5 w-1.5 rounded-full ${getEventTypeColor(event)}`}
                              title={getEventTypeLabel(event)}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px] text-slate-500 font-medium">+{dayEvents.length - 3}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-200 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <span className="text-slate-600">Event</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <span className="text-slate-600">Workshop</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-600">Training</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                    <span className="text-slate-600">Webinar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                    <span className="text-slate-600">Live Room</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div>
                    <span className="text-slate-600">Live Stream</span>
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
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-start gap-2 mb-2">
                          <div className={`p-1.5 rounded ${getEventTypeColor(event)} bg-opacity-20`}>
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge className={`${getEventTypeColor(event)} text-white text-xs mb-1`}>
                              {getEventTypeLabel(event)}
                            </Badge>
                            <h4 className="font-medium text-slate-900 text-sm">
                              {event.event_name || event.room_name || event.stream_title}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                              <Clock className="w-3 h-3" />
                              {format(event.date, 'h:mm a')}
                            </div>
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 ml-8">{event.description}</p>
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
                      <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="text-center min-w-[50px]">
                          <div className="text-xs text-slate-500">{format(event.date, 'MMM')}</div>
                          <div className="text-lg font-bold text-slate-900">{format(event.date, 'd')}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge className={`${getEventTypeColor(event)} text-white text-xs mb-1`}>
                            {getEventTypeLabel(event)}
                          </Badge>
                          <h4 className="font-medium text-slate-900 text-sm">
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