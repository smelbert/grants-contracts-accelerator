import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarPlus, ExternalLink, Download, Chrome } from 'lucide-react';
import { format, addHours } from 'date-fns';
import { toast } from 'sonner';

/**
 * CalendarSyncButton - opt-in per-event calendar sync
 * Props:
 *   title        : string  – event title
 *   date         : Date    – event date/time
 *   endDate      : Date?   – end date (defaults to +2 hours)
 *   description  : string? – event description
 *   location     : string? – location or meeting link
 *   durationHours: number? – override end time (default 2)
 */
export default function CalendarSyncButton({ title, date, endDate, description = '', location = '', durationHours = 2 }) {
  const [open, setOpen] = useState(false);

  if (!date || !(date instanceof Date) || isNaN(date)) return null;

  const end = endDate || addHours(date, durationHours);

  // Google Calendar URL
  const toGoogleDate = (d) => format(d, "yyyyMMdd'T'HHmmss");
  const googleUrl = new URL('https://calendar.google.com/calendar/render');
  googleUrl.searchParams.set('action', 'TEMPLATE');
  googleUrl.searchParams.set('text', title);
  googleUrl.searchParams.set('dates', `${toGoogleDate(date)}/${toGoogleDate(end)}`);
  if (description) googleUrl.searchParams.set('details', description);
  if (location) googleUrl.searchParams.set('location', location);

  // Outlook Calendar URL
  const toOutlookDate = (d) => d.toISOString();
  const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
  outlookUrl.searchParams.set('path', '/calendar/action/compose');
  outlookUrl.searchParams.set('rru', 'addevent');
  outlookUrl.searchParams.set('subject', title);
  outlookUrl.searchParams.set('startdt', toOutlookDate(date));
  outlookUrl.searchParams.set('enddt', toOutlookDate(end));
  if (description) outlookUrl.searchParams.set('body', description);
  if (location) outlookUrl.searchParams.set('location', location);

  // ICS download (works for Apple Calendar + any other)
  const downloadICS = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EIS//Program Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${title.replace(/\s+/g, '-')}-${date.getTime()}@eis.org`,
      `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
      `DTSTART:${toGoogleDate(date)}`,
      `DTEND:${toGoogleDate(end)}`,
      `SUMMARY:${title}`,
      description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
      location ? `LOCATION:${location}` : '',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Calendar file downloaded');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <CalendarPlus className="w-3.5 h-3.5" />
          Add to Calendar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <p className="text-xs text-slate-500 px-2 pb-1 font-medium">Choose your calendar</p>
        <a
          href={googleUrl.toString()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm hover:bg-slate-100 transition-colors"
        >
          <span className="text-base">📅</span>
          Google Calendar
          <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
        </a>
        <a
          href={outlookUrl.toString()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm hover:bg-slate-100 transition-colors"
        >
          <span className="text-base">📆</span>
          Outlook Calendar
          <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
        </a>
        <button
          onClick={downloadICS}
          className="flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm hover:bg-slate-100 transition-colors text-left"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Download .ics file
          <span className="ml-auto text-xs text-slate-400">Apple / other</span>
        </button>
      </PopoverContent>
    </Popover>
  );
}