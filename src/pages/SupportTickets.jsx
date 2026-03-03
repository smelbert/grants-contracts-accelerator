import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SupportTickets() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => {
      if (user?.role === 'admin') {
        return base44.entities.SupportTicket.list();
      } else {
        return base44.entities.SupportTicket.filter({ user_email: user?.email });
      }
    },
    enabled: !!user
  });

  const createTicketMutation = useMutation({
    mutationFn: (data) => base44.entities.SupportTicket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('Support ticket created');
    }
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupportTicket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('Ticket updated');
    }
  });

  const handleReply = (ticket) => {
    if (!replyMessage.trim()) return;

    const updatedConversation = [
      ...(ticket.conversation || []),
      {
        from: user.email,
        message: replyMessage,
        timestamp: new Date().toISOString(),
        is_internal: user.role === 'admin'
      }
    ];

    updateTicketMutation.mutate({
      id: ticket.id,
      data: { ...ticket, conversation: updatedConversation }
    });

    setReplyMessage('');
  };

  const handleStatusChange = (ticket, newStatus) => {
    updateTicketMutation.mutate({
      id: ticket.id,
      data: { 
        ...ticket, 
        status: newStatus,
        resolved_date: newStatus === 'resolved' ? new Date().toISOString() : ticket.resolved_date
      }
    });
  };

  const statusColors = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    waiting_on_customer: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-slate-100 text-slate-800'
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Support Tickets</h1>
          <p className="text-slate-600 mt-2">Manage and respond to support requests</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              createTicketMutation.mutate({
                user_email: user.email,
                user_name: user.full_name,
                subject: formData.get('subject'),
                description: formData.get('description'),
                category: formData.get('category'),
                priority: formData.get('priority') || 'medium',
                ticket_number: `TK-${Date.now()}`,
                conversation: []
              });
              e.target.reset();
            }} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" required />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical_issue">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={5} required />
              </div>
              <Button type="submit">Submit Ticket</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 space-y-4">
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No support tickets</p>
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className={`cursor-pointer transition-all ${
                  selectedTicket?.id === ticket.id ? 'ring-2 ring-[#143A50]' : ''
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">{ticket.subject}</p>
                      <p className="text-xs text-slate-500">{ticket.ticket_number}</p>
                    </div>
                    <Badge className={priorityColors[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <Badge className={statusColors[ticket.status]}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(ticket.created_date).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {!selectedTicket ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Select a ticket to view details</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">{selectedTicket.ticket_number}</p>
                  </div>
                  {user?.role === 'admin' && (
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(value) => handleStatusChange(selectedTicket, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="waiting_on_customer">Waiting</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-slate-700">{selectedTicket.description}</p>
                  </div>

                  {selectedTicket.conversation && selectedTicket.conversation.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-4">Conversation</h4>
                      <div className="space-y-4">
                        {selectedTicket.conversation.map((msg, idx) => (
                          <div key={idx} className={`p-4 rounded-lg ${
                            msg.from === user.email ? 'bg-[#143A50]/5' : 'bg-slate-50'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{msg.from}</span>
                              <span className="text-xs text-slate-500">
                                {new Date(msg.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="reply">Reply</Label>
                    <Textarea
                      id="reply"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={4}
                      placeholder="Type your response..."
                      className="mt-2"
                    />
                    <Button
                      onClick={() => handleReply(selectedTicket)}
                      className="mt-2"
                      disabled={!replyMessage.trim()}
                    >
                      Send Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}