import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function CalendarExportButtons({ event }) {
  const generateICS = () => {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date || startDate);
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EIS//Event Calendar//EN
BEGIN:VEVENT
UID:${event.id}@eis-platform
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.event_name}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location_type === 'virtual' ? event.meeting_url || 'Virtual Event' : event.location_details || ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.event_name.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const addToGoogleCalendar = () => {
    const startDate = new Date(event.start_date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(event.end_date || event.start_date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.event_name,
      dates: `${startDate}/${endDate}`,
      details: event.description || '',
      location: event.location_type === 'virtual' ? event.meeting_url || '' : event.location_details || ''
    });

    window.open(`https://calendar.google.com/calendar/render?${params}`, '_blank');
  };

  const addToOutlook = () => {
    const startDate = new Date(event.start_date).toISOString();
    const endDate = new Date(event.end_date || event.start_date).toISOString();
    
    const params = new URLSearchParams({
      subject: event.event_name,
      body: event.description || '',
      startdt: startDate,
      enddt: endDate,
      location: event.location_type === 'virtual' ? event.meeting_url || '' : event.location_details || '',
      path: '/calendar/action/compose',
      rru: 'addevent'
    });

    window.open(`https://outlook.live.com/calendar/0/deeplink/compose?${params}`, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={addToGoogleCalendar}>
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={addToOutlook}>
          Outlook Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generateICS}>
          <Download className="w-4 h-4 mr-2" />
          Download .ics File
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}