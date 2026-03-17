import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, CheckCircle2, AlertCircle, Clock, Video, MapPin, MessageSquare } from 'lucide-react';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { toast } from 'sonner';

export default function IncubateHerConsultations() {
  const queryClient = useQueryClient();
  const [checklist, setChecklist] = useState({
    preAssessment: false,
    documents: false,
    questions: false
  });
  const [documentLink, setDocumentLink] = useState('');
  const [notes, setNotes] = useState('');
  const [availabilityOption1, setAvailabilityOption1] = useState({ date: '', time: '' });
  const [availabilityOption2, setAvailabilityOption2] = useState({ date: '', time: '' });
  const [availabilityOption3, setAvailabilityOption3] = useState({ date: '', time: '' });
  const [meetingPreference, setMeetingPreference] = useState('online');
  const [meetingDuration, setMeetingDuration] = useState('60');
  const [contactingCharles, setContactingCharles] = useState(false);
  const [charlesMessageSent, setCharlesMessageSent] = useState(false);
  const [charlesMessage, setCharlesMessage] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', user?.email],
    queryFn: async () => {
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
      return enrollments[0];
    },
    enabled: !!user?.email
  });

  // Only required: pre, post, and evaluation assessments
  const allChecklistComplete = enrollment?.pre_assessment_completed &&
    enrollment?.post_assessment_completed &&
    enrollment?.program_evaluation_completed &&
    Object.values(checklist).every(v => v);

  const saveChecklistMutation = useMutation({
    mutationFn: async () => {
      // Update or create checklist record
      const existing = await base44.entities.ConsultationIntakeChecklist.filter({
        enrollment_id: enrollment.id
      });
      
      if (existing.length > 0) {
        await base44.entities.ConsultationIntakeChecklist.update(existing[0].id, {
          documents_uploaded: checklist.documents,
          questions_prepared: checklist.questions,
          all_items_complete: allChecklistComplete,
          completed_date: allChecklistComplete ? new Date().toISOString() : null
        });
      } else {
        await base44.entities.ConsultationIntakeChecklist.create({
          enrollment_id: enrollment.id,
          participant_email: user.email,
          pre_assessment_reviewed: enrollment.pre_assessment_completed,
          documents_uploaded: checklist.documents,
          questions_prepared: checklist.questions,
          all_items_complete: allChecklistComplete,
          completed_date: allChecklistComplete ? new Date().toISOString() : null
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment']);
      toast.success('Checklist saved!');
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader 
        title="One-on-One Consultations"
        subtitle="Personalized guidance for your funding readiness"
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Booking Status Banner */}
        {enrollment?.consultation_booked ? (
          <Card className="border-2 border-green-400 bg-green-50">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-green-900">✅ Calendly Booking Confirmed</h3>
                  <p className="text-sm text-green-800">
                    Your 1:1 consultation has been booked via Calendly.
                    {enrollment.consultation_booked_notes && <span className="block mt-1 font-medium">{enrollment.consultation_booked_notes}</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Calendly Booking Card */
          <Card className="border-2 border-[#AC1A5B] bg-gradient-to-r from-[#AC1A5B]/5 to-white">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#143A50] mb-1">📅 Book Your Consultation</h3>
                  <p className="text-sm text-slate-600">
                    Use the link below to schedule your individual funding readiness consultation with Dr. Shawnte directly through Calendly.
                  </p>
                </div>
                <a
                  href="https://calendly.com/drshawnte/incubateher-individual-funding-readiness-consultation?back=1&month=2026-03"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Button size="lg" className="bg-[#AC1A5B] hover:bg-[#8e1549] text-white whitespace-nowrap">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book on Calendly
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-l-4 border-l-[#143A50]">
          <CardHeader>
            <CardTitle>What the One-on-One Includes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Review of existing documents (e.g., business overview, draft project description, budget outline, or capability statement)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Strategic feedback on funding readiness and alignment (grants vs. contracts)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Clarification of next steps and recommended areas for strengthening</span>
              </li>
            </ul>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2">What the One-on-One Does NOT Include:</h4>
              <ul className="space-y-1 text-amber-800 text-sm">
                <li>• Writing or rewriting grant applications or contracts</li>
                <li>• Conducting grant searches or identifying specific funding opportunities</li>
                <li>• Ongoing consulting beyond the scheduled session</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">How to Prepare:</h4>
              <ul className="space-y-1 text-blue-800 text-sm">
                <li>• Bring 1–2 documents you would like reviewed (drafts are acceptable)</li>
                <li>• Be prepared to discuss your business structure, current capacity, and funding goals</li>
                <li>• Come with specific questions you want to prioritize during the session</li>
              </ul>
              <p className="text-sm text-blue-900 font-medium mt-3">
                Participants who arrive prepared will get the most value from their consultation.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle>Required: Pre-Consultation Checklist</CardTitle>
            <CardDescription>
              Complete these items before scheduling your consultation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-700">Business & Structure</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Legal structure identified (LLC, nonprofit, sole proprietor, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Business or organization is registered and in good standing</span>
                </li>
              </ul>

              <h4 className="font-semibold text-slate-700 mt-4">Funding Readiness</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Clear understanding of funding goals (grants, contracts, or both)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Basic financial records available (budget, revenue/expense summary, or projections)</span>
                </li>
              </ul>

              <h4 className="font-semibold text-slate-700 mt-4">Documents for Review</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Business or organizational overview (1–2 pages preferred)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Draft project description, scope of work, or service summary</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Budget outline or budget narrative (if available)</span>
                </li>
              </ul>

              <h4 className="font-semibold text-slate-700 mt-4">Preparation</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>2–3 specific questions identified for the session</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Understanding that the session focuses on strategy and readiness, not application writing</span>
                </li>
              </ul>

              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-900 font-medium">
                  ⚠️ Participants who have not completed this checklist may be asked to reschedule.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required: pre, post, evaluation */}
        {(!enrollment?.pre_assessment_completed || !enrollment?.post_assessment_completed || !enrollment?.program_evaluation_completed) && (
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-5 h-5" />
                Required Assessments Not Yet Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Pre-Assessment', done: enrollment?.pre_assessment_completed, link: '/IncubateHerPreAssessment' },
                { label: 'Post-Assessment', done: enrollment?.post_assessment_completed, link: '/IncubateHerPostAssessment' },
                { label: 'Program Evaluation', done: enrollment?.program_evaluation_completed, link: '/IncubateHerEvaluation' },
              ].map(item => (
                <div key={item.label} className={`flex items-center justify-between p-3 rounded-lg ${item.done ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                  <div className="flex items-center gap-2">
                    {item.done ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                    <span className="font-medium text-slate-800">{item.label}</span>
                  </div>
                  {item.done ? (
                    <Badge className="bg-green-100 text-green-800">Complete</Badge>
                  ) : (
                    <Button size="sm" className="bg-[#143A50]" onClick={() => window.location.href = item.link}>
                      Complete Now
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {enrollment?.pre_assessment_completed && enrollment?.post_assessment_completed && enrollment?.program_evaluation_completed && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Ready to Schedule? Confirm Your Preparation</CardTitle>
                <CardDescription>
                  Check off these items to unlock booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { label: 'Pre-Assessment', done: enrollment.pre_assessment_completed },
                    { label: 'Post-Assessment', done: enrollment.post_assessment_completed },
                    { label: 'Program Evaluation', done: enrollment.program_evaluation_completed },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3">
                      <Checkbox checked={item.done} disabled className="mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-700">{item.label}</p>
                        <p className="text-sm text-slate-500">Required to book consultation</p>
                      </div>
                      <Badge variant="outline" className={item.done ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}>
                        {item.done ? 'Complete' : 'Pending'}
                      </Badge>
                    </div>
                  ))}

                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={checklist.documents}
                      onCheckedChange={(checked) => setChecklist(prev => ({ ...prev, documents: checked }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">Documents Prepared</p>
                      <p className="text-sm text-slate-500">Business overview, project description, and budget outline ready</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={checklist.questions}
                      onCheckedChange={(checked) => setChecklist(prev => ({ ...prev, questions: checked }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">Questions Prepared</p>
                      <p className="text-sm text-slate-500">2-3 specific questions identified for your session</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>
                  Share any documents you'd like reviewed during your consultation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Paste Google Drive or Dropbox link..."
                  value={documentLink}
                  onChange={(e) => setDocumentLink(e.target.value)}
                />
                <Textarea
                  placeholder="Add any notes or specific questions for your consultant..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Your Consultation</CardTitle>
                <CardDescription>
                  Submit your availability and our team will reach out to confirm your appointment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!allChecklistComplete ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-slate-600">
                      Complete the checklist above to unlock booking
                    </p>
                  </div>
                ) : enrollment?.consultation_completed ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-green-800 font-medium mb-2">Consultation Completed</p>
                    <p className="text-green-700 text-sm">
                      {enrollment.consultation_date && `Completed on ${new Date(enrollment.consultation_date).toLocaleDateString()}`}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">How It Works</h4>
                      <ul className="space-y-1 text-blue-800 text-sm">
                        <li>• Submit 3 date/time options that work for you</li>
                        <li>• Charles Watterson will review your availability and Dr. Elbert's calendar</li>
                        <li>• You'll receive confirmation or alternative options via email</li>
                        <li>• Meeting details will be sent once confirmed</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-semibold mb-3 block">Meeting Duration</Label>
                        <Select value={meetingDuration} onValueChange={setMeetingDuration}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="45">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                45 minutes
                              </div>
                            </SelectItem>
                            <SelectItem value="60">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                60 minutes (1 hour)
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-base font-semibold mb-3 block">Meeting Preference</Label>
                        <Select value={meetingPreference} onValueChange={setMeetingPreference}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">
                              <div className="flex items-center gap-2">
                                <Video className="w-4 h-4" />
                                Online (Video Call)
                              </div>
                            </SelectItem>
                            <SelectItem value="in-person">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                In-Person / Face-to-Face
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-base font-semibold mb-3 block">
                          Your Availability (provide 3 options)
                        </Label>
                        <div className="space-y-4">
                          {[
                            { state: availabilityOption1, setState: setAvailabilityOption1, label: 'Option 1' },
                            { state: availabilityOption2, setState: setAvailabilityOption2, label: 'Option 2' },
                            { state: availabilityOption3, setState: setAvailabilityOption3, label: 'Option 3' }
                          ].map(({ state, setState, label }) => (
                            <div key={label} className="p-4 border rounded-lg bg-slate-50">
                              <Label className="font-medium mb-2 block">{label}</Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-sm text-slate-600 mb-1 block">Date</Label>
                                  <Input
                                    type="date"
                                    value={state.date}
                                    onChange={(e) => setState({ ...state, date: e.target.value })}
                                    min={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm text-slate-600 mb-1 block">Time</Label>
                                  <Input
                                    type="time"
                                    value={state.time}
                                    onChange={(e) => setState({ ...state, time: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full bg-[#143A50]"
                      disabled={!availabilityOption1.date || !availabilityOption1.time ||
                                !availabilityOption2.date || !availabilityOption2.time ||
                                !availabilityOption3.date || !availabilityOption3.time}
                      onClick={async () => {
                        try {
                          // Save checklist
                          await saveChecklistMutation.mutateAsync();

                          // Create consultation booking request
                          await base44.entities.ConsultationBooking.create({
                            enrollment_id: enrollment.id,
                            participant_email: user.email,
                            participant_name: user.full_name,
                            meeting_duration: parseInt(meetingDuration),
                            meeting_preference: meetingPreference,
                            availability_option_1: `${availabilityOption1.date} ${availabilityOption1.time}`,
                            availability_option_2: `${availabilityOption2.date} ${availabilityOption2.time}`,
                            availability_option_3: `${availabilityOption3.date} ${availabilityOption3.time}`,
                            document_link: documentLink,
                            notes: notes,
                            status: 'pending_confirmation'
                          });

                          // Send notification to Charles Watterson
                          await base44.functions.invoke('sendConsultationRequest', {
                            participantEmail: user.email,
                            participantName: user.full_name,
                            availability: [
                              `${availabilityOption1.date} at ${availabilityOption1.time}`,
                              `${availabilityOption2.date} at ${availabilityOption2.time}`,
                              `${availabilityOption3.date} at ${availabilityOption3.time}`
                            ],
                            preference: meetingPreference,
                            duration: meetingDuration,
                            documentLink,
                            notes,
                            facilitatorEmail: 'charles@elbertinnovativesolutions.org'
                          });

                          toast.success('Consultation request submitted! Charles will contact you soon to confirm.');
                          
                          // Reset form
                          setAvailabilityOption1({ date: '', time: '' });
                          setAvailabilityOption2({ date: '', time: '' });
                          setAvailabilityOption3({ date: '', time: '' });
                          setDocumentLink('');
                          setNotes('');
                        } catch (error) {
                          toast.error('Failed to submit request. Please try again.');
                          console.error(error);
                        }
                      }}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Submit Consultation Request
                    </Button>

                    <p className="text-xs text-slate-500 text-center">
                      Charles Watterson will review your request and reach out within 1-2 business days to confirm your consultation time.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
        {/* Contact Charles Section */}
        <Card id="contact-charles-section" className="border-l-4 border-l-[#AC1A5B]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#AC1A5B]" />
              Contact Charles Watterson (Co-Facilitator)
            </CardTitle>
            <p className="text-sm text-slate-600">
              Have a question or need help scheduling? Send Charles a message directly — he'll receive it in his portal inbox and via email.
            </p>
          </CardHeader>
          <CardContent>
            {charlesMessageSent ? (
              <div className="flex items-center gap-3 text-green-700 py-4">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Message sent to Charles!</p>
                  <p className="text-sm text-slate-600">He'll respond via the portal or at charles@elbertinnovativesolutions.org</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setCharlesMessageSent(false)}>
                  Send Another
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                  <strong>Charles Watterson</strong> — Co-Facilitator, IncubateHer Program<br />
                  <a href="mailto:charles@elbertinnovativesolutions.org" className="text-[#143A50] underline text-xs">
                    charles@elbertinnovativesolutions.org
                  </a>
                </div>
                <textarea
                  value={charlesMessage}
                  onChange={(e) => setCharlesMessage(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#143A50]"
                  rows={4}
                  placeholder="Type your message to Charles here (e.g., question about scheduling, consultation prep, or anything else)..."
                />
                <Button
                  disabled={!charlesMessage.trim() || contactingCharles}
                  className="bg-[#AC1A5B] hover:bg-[#8e1549] text-white"
                  onClick={async () => {
                    setContactingCharles(true);
                    try {
                      // Send email to Charles
                      await base44.integrations.Core.SendEmail({
                        to: 'charles@elbertinnovativesolutions.org',
                        subject: `IncubateHer Consultation Message from ${user?.full_name || user?.email}`,
                        body: `You have a new message from an IncubateHer participant:\n\nFrom: ${user?.full_name || ''} (${user?.email})\n\nMessage:\n${charlesMessage}\n\n---\nReply directly to this email or log into the portal.`,
                      });
                      // Also create a portal chat/message record
                      await base44.entities.DirectMessage.create({
                        from_email: user?.email,
                        from_name: user?.full_name,
                        to_email: 'charles@elbertinnovativesolutions.org',
                        to_name: 'Charles Watterson',
                        message: charlesMessage,
                        context: 'consultation_request',
                        is_read: false,
                      });
                      setCharlesMessageSent(true);
                      setCharlesMessage('');
                      toast.success('Message sent to Charles!');
                    } catch (err) {
                      toast.error('Failed to send message. Please email charles@elbertinnovativesolutions.org directly.');
                    } finally {
                      setContactingCharles(false);
                    }
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {contactingCharles ? 'Sending...' : 'Send Message to Charles'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CoBrandedFooter />
    </div>
  );
}