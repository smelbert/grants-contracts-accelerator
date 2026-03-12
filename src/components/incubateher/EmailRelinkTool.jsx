/**
 * EmailRelinkTool
 * Admin tool to manually re-link a participant's enrollment to a different email/login.
 * Shown in IncubateHerParticipants for each enrollment card.
 */
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { LinkIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { BRAND_COLORS } from './CoBrandedHeader';

export default function EmailRelinkTool({ enrollment }) {
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const hasMismatch = enrollment.login_email &&
    enrollment.login_email.toLowerCase() !== enrollment.participant_email?.toLowerCase();

  const handleSave = async () => {
    if (!newEmail.trim()) return;
    setSaving(true);
    await base44.entities.ProgramEnrollment.update(enrollment.id, {
      login_email: newEmail.trim().toLowerCase(),
      user_id: null // clear so it re-links on next login
    });
    queryClient.invalidateQueries({ queryKey: ['all-enrollments'] });
    toast.success(`Login email updated. They'll be re-linked next time they log in.`);
    setSaving(false);
    setOpen(false);
    setNewEmail('');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs font-medium hover:underline"
        style={{ color: hasMismatch ? BRAND_COLORS.culRed : '#94a3b8' }}
        title={hasMismatch ? 'Email mismatch detected — click to fix' : 'Manage login email'}
      >
        <LinkIcon className="w-3 h-3" />
        {hasMismatch ? 'Email Mismatch' : 'Link Email'}
        {hasMismatch && <AlertTriangle className="w-3 h-3" />}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Link Login Email — {enrollment.participant_name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 border text-sm space-y-1">
              <p><span className="font-medium">Registered as:</span> {enrollment.participant_email}</p>
              {enrollment.login_email && (
                <p className={`${hasMismatch ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                  <span className="font-medium">Logged in with:</span> {enrollment.login_email}
                  {hasMismatch && ' ⚠ Mismatch'}
                </p>
              )}
              {enrollment.user_id && (
                <p className="text-green-600 flex items-center gap-1 text-xs">
                  <CheckCircle2 className="w-3 h-3" /> Account linked (user_id set)
                </p>
              )}
            </div>

            {hasMismatch && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                This participant registered with <strong>{enrollment.participant_email}</strong> but logged in with <strong>{enrollment.login_email}</strong>. Their data is still tied to their enrollment — no data is lost. You can update their canonical login email below if needed.
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Update login email (their actual account email)
              </label>
              <Input
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder={enrollment.login_email || enrollment.participant_email}
                type="email"
              />
              <p className="text-xs text-slate-500 mt-1">
                Leave blank to keep current. They'll be auto-linked on next login.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSave}
                disabled={saving || !newEmail.trim()}
                style={{ backgroundColor: BRAND_COLORS.eisNavy, color: 'white' }}
              >
                {saving ? 'Saving...' : 'Update Login Email'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}