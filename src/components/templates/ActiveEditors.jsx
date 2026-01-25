import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Users, Circle } from 'lucide-react';

export default function ActiveEditors({ templateId, currentUser }) {
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({
    queryKey: ['template-sessions', templateId],
    queryFn: async () => {
      const allSessions = await base44.entities.TemplateEditSession.filter({ template_id: templateId });
      // Filter out sessions older than 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return allSessions.filter(s => new Date(s.last_active) > fiveMinutesAgo);
    },
    enabled: !!templateId,
    refetchInterval: 3000 // Poll every 3 seconds
  });

  const updateSessionMutation = useMutation({
    mutationFn: (data) => {
      const existing = sessions.find(s => s.user_email === currentUser?.email);
      if (existing) {
        return base44.entities.TemplateEditSession.update(existing.id, data);
      } else {
        return base44.entities.TemplateEditSession.create({
          ...data,
          template_id: templateId,
          user_email: currentUser?.email,
          user_name: currentUser?.full_name
        });
      }
    }
  });

  // Update session every 10 seconds
  useEffect(() => {
    if (!currentUser || !templateId) return;

    const updateSession = () => {
      updateSessionMutation.mutate({
        last_active: new Date().toISOString()
      });
    };

    updateSession();
    const interval = setInterval(updateSession, 10000);

    return () => clearInterval(interval);
  }, [templateId, currentUser]);

  const otherEditors = sessions.filter(s => s.user_email !== currentUser?.email);

  if (otherEditors.length === 0) return null;

  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <Users className="w-4 h-4 text-blue-600" />
      <span className="text-sm font-medium text-blue-900">Currently editing:</span>
      <div className="flex items-center gap-2">
        {otherEditors.map((session, idx) => (
          <div key={session.id} className="flex items-center gap-2">
            <div className="relative">
              <div className={`w-8 h-8 rounded-full ${colors[idx % colors.length]} flex items-center justify-center text-white text-xs font-bold`}>
                {session.user_name?.[0] || session.user_email?.[0]?.toUpperCase()}
              </div>
              <Circle className="w-3 h-3 fill-green-500 text-green-500 absolute -bottom-0.5 -right-0.5" />
            </div>
            <span className="text-xs text-slate-700">{session.user_name || session.user_email}</span>
          </div>
        ))}
      </div>
    </div>
  );
}