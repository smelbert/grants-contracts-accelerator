import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function FlagsNotesPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: interactions } = useQuery({
    queryKey: ['flaggedInteractions'],
    queryFn: () => base44.entities.ClientInteraction.filter({ is_internal_note: true }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-slate-900">Flags & Notes</h1>
          </div>
          <p className="text-slate-600">Internal notes and ethical protection flags (visible to admin only)</p>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Internal Coach Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interactions && interactions.length > 0 ? (
              <div className="space-y-4">
                {interactions.map(interaction => (
                  <div key={interaction.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-slate-900">{interaction.subject}</p>
                      <Badge variant="outline" className="capitalize">
                        {interaction.outcome}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{interaction.notes}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(interaction.created_date), 'MMM d, yyyy h:mm a')} • {interaction.created_by}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No flags or internal notes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}