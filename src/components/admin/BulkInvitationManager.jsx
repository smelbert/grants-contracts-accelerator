import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Mail, Plus, Upload, AlertCircle, CheckCircle2, Clock, X, Eye, EyeOff, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function BulkInvitationManager() {
  const [emailList, setEmailList] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [role, setRole] = useState('user');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading: isLoadingInvitations } = useQuery({
    queryKey: ['userInvitations'],
    queryFn: () => base44.entities.UserInvitation.list('-created_date', 100)
  });

  const bulkInviteMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('bulkInviteUsers', data);
      return response.data;
    },
    onSuccess: (result) => {
      toast.success(`${result.summary.sent} invitations sent!`);
      queryClient.invalidateQueries({ queryKey: ['userInvitations'] });
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    }
  });

  const handleSendInvitations = async () => {
    const emails = emailList
      .split('\n')
      .map(e => e.trim())
      .filter(e => e && e.includes('@'));

    if (emails.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    setLoading(true);
    bulkInviteMutation.mutate({
      emails,
      role,
      custom_message: customMessage
    });
    setLoading(false);
  };

  const resetForm = () => {
    setEmailList('');
    setCustomMessage('');
    setRole('user');
  };

  const parseEmails = () => {
    return emailList
      .split('\n')
      .map(e => e.trim())
      .filter(e => e && e.includes('@'));
  };

  const validEmails = parseEmails();
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-3 h-3" />,
      sent: <Mail className="w-3 h-3" />,
      accepted: <CheckCircle2 className="w-3 h-3" />,
      declined: <X className="w-3 h-3" />,
      expired: <AlertCircle className="w-3 h-3" />
    };
    return icons[status];
  };

  return (
    <div className="space-y-8">
      {/* Send Invitations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Bulk Invitations
          </CardTitle>
          <CardDescription>Invite multiple users at once with customizable messages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Addresses *</label>
            <Textarea
              placeholder="Enter email addresses (one per line)&#10;user1@example.com&#10;user2@example.com&#10;user3@example.com"
              value={emailList}
              onChange={(e) => setEmailList(e.target.value)}
              rows={5}
              className="font-mono text-xs"
            />
            <p className="text-xs text-slate-500">
              {validEmails.length > 0 && `✓ ${validEmails.length} valid email(s) found`}
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign Role *</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Community Member</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Message (Optional)</label>
            <Textarea
              placeholder="Add a personal message to include in the invitation email..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-slate-500">This will be included in the invitation email</p>
          </div>

          {/* Preview & Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide' : 'Preview'}
            </Button>
            <Button
              onClick={handleSendInvitations}
              disabled={validEmails.length === 0 || bulkInviteMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2 flex-1"
            >
              <Mail className="w-4 h-4" />
              Send {validEmails.length > 0 && `${validEmails.length}`} Invitations
            </Button>
          </div>

          {/* Preview Panel */}
          {showPreview && validEmails.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
              <p className="text-sm font-medium text-slate-700">Preview</p>
              <div className="bg-white rounded p-3 space-y-2 text-sm">
                <p><strong>To:</strong> {validEmails[0]} {validEmails.length > 1 && `+${validEmails.length - 1} more`}</p>
                <p><strong>Role:</strong> {role === 'user' ? 'Community Member' : role}</p>
                {customMessage && (
                  <div>
                    <p><strong>Message Preview:</strong></p>
                    <p className="text-slate-600 italic">{customMessage}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitations History */}
      <Card>
        <CardHeader>
          <CardTitle>Invitation History</CardTitle>
          <CardDescription>Track all sent invitations and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingInvitations ? (
            <div className="text-center py-8 text-slate-500">Loading invitations...</div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No invitations sent yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead>Recipient</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((inv) => (
                    <TableRow key={inv.id} className="border-slate-100">
                      <TableCell className="text-sm">{inv.recipient_email}</TableCell>
                      <TableCell className="text-sm capitalize">{inv.role}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(inv.status)} gap-1.5`}>
                          {getStatusIcon(inv.status)}
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {inv.sent_at ? format(new Date(inv.sent_at), 'MMM d, h:mm a') : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {inv.expires_at ? format(new Date(inv.expires_at), 'MMM d') : '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(inv.recipient_email);
                            toast.success('Email copied');
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}