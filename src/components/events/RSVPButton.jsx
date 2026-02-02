import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar } from 'lucide-react';

export default function RSVPButton({ event, userEmail }) {
  const queryClient = useQueryClient();

  const { data: registration } = useQuery({
    queryKey: ['eventRegistration', event.id, userEmail],
    queryFn: async () => {
      const registrations = await base44.entities.EventRegistration.filter({
        event_id: event.id,
        attendee_email: userEmail
      });
      return registrations[0];
    },
    enabled: !!userEmail && !!event.id,
  });

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      if (registration) {
        return base44.entities.EventRegistration.delete(registration.id);
      } else {
        return base44.entities.EventRegistration.create({
          event_id: event.id,
          attendee_email: userEmail,
          attendee_name: userEmail.split('@')[0],
          registration_status: 'registered'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventRegistration'] });
      queryClient.invalidateQueries({ queryKey: ['myUpcomingEvents'] });
    },
  });

  const isRegistered = !!registration && registration.registration_status === 'registered';

  return (
    <Button
      onClick={() => rsvpMutation.mutate()}
      disabled={rsvpMutation.isPending}
      variant={isRegistered ? 'outline' : 'default'}
      className={isRegistered ? 'border-emerald-600 text-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'}
    >
      {isRegistered ? (
        <>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Registered
        </>
      ) : (
        <>
          <Calendar className="w-4 h-4 mr-2" />
          RSVP
        </>
      )}
    </Button>
  );
}