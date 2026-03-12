import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Target, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const STEPS = ['terms', 'checklist'];

export default function IncubateHerProgramGate({ user, userAccess, enrollment, onComplete }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState('terms');

  // Auto-link this user's login account to their enrollment (handles different email scenario)
  React.useEffect(() => {
    if (!user?.email || !enrollment?.cohort_id) return;
    base44.functions.invoke('linkParticipantAccount', { cohort_id: enrollment.cohort_id })
      .then(res => {
        if (res.data?.was_email_mismatch) {
          console.log('[ProgramGate] Email mismatch auto-resolved:', res.data);
        }
      })
      .catch(err => console.warn('[ProgramGate] Account link failed:', err.message));
  }, [user?.email, enrollment?.cohort_id]);
  const [termsChecked, setTermsChecked] = useState(false);
  const [loginChecked, setLoginChecked] = useState(false);
  const [ipAcknowledged, setIpAcknowledged] = useState(false);
  const currentYear = new Date().getFullYear();

  const acceptTermsMutation = useMutation({
    mutationFn: async () => {
      if (userAccess?.id) {
        await base44.entities.UserAccessLevel.update(userAccess.id, {
          legal_acknowledged: true,
          legal_acknowledged_date: new Date().toISOString(),
          entry_point: 'incubateher_program'
        });
      } else {
        await base44.entities.UserAccessLevel.create({
          user_email: user.email,
          access_level: 'community_only',
          entry_point: 'incubateher_program',
          legal_acknowledged: true,
          legal_acknowledged_date: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAccess'] });
      setStep('checklist');
    }
  });

  // Determine what's complete
  const profileComplete = enrollment?.organization_name || false;
  const preAssessmentComplete = enrollment?.pre_assessment_completed || false;

  const allGateItemsDone = profileComplete && preAssessmentComplete;

  if (step === 'terms') {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Shield className="w-6 h-6 text-[#AC1A5B]" />
              Welcome to IncubateHer / AccelerateHer — Please Review & Sign
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-1">Step 1 of 2 — Terms of Service</DialogDescription>
          </div>

          <ScrollArea className="flex-1 px-6">
            <div className="space-y-5 text-slate-700">

              <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white p-4 rounded-lg">
                <p className="font-semibold mb-1">Program Confidentiality & Access Agreement</p>
                <p className="text-sm opacity-90">
                  This platform and all its content is provided exclusively to participants of the 
                  IncubateHer / AccelerateHer cohort. Access is personal and non-transferable.
                </p>
              </div>

              {/* Personal Login — NO SHARING */}
              <div className="border-2 border-[#AC1A5B] rounded-lg p-4 bg-rose-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#AC1A5B] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#AC1A5B] mb-1">No Login Sharing — Personal Use Only</h4>
                    <p className="text-sm">
                      Your login credentials are personal and created exclusively for <strong>you</strong> as an 
                      IncubateHer / AccelerateHer participant. <strong>You may not share your login with anyone.</strong> 
                      Sharing access grants an unauthorized person full access to proprietary program content that has not 
                      been made available to them. Detected sharing may result in immediate removal from the program.
                    </p>
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div>
                <h4 className="font-semibold text-[#143A50] mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Copyright & Proprietary Content
                </h4>
                <div className="bg-slate-100 p-3 rounded text-sm font-mono mb-2">
                  ©{currentYear} Elbert Innovative Solutions. All rights reserved.
                </div>
                <p className="text-sm mb-3">
                  All materials, methods, and information provided as part of this program—including course modules, 
                  worksheets, training videos, slides, event recordings, frameworks, workbooks, templates, documents, 
                  and strategies—are proprietary and protected by intellectual property law.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5 font-bold">✓</span>
                    <span><strong>You CAN:</strong> Use all materials for your personal growth and business development</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5 font-bold">✗</span>
                    <span><strong>You CANNOT:</strong> Copy, share, teach, sell, distribute, record, or repurpose materials</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5 font-bold">✗</span>
                    <span><strong>You CANNOT:</strong> Create derivative works, programs, or services based on this content</span>
                  </div>
                </div>
              </div>

              {/* Program-Specific */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                <p className="font-semibold text-amber-900 mb-1">Program Access Notice</p>
                <p className="text-amber-800">
                  The tools, resources, and platform access provided here are available <strong>only to participants 
                  who completed the IncubateHer / AccelerateHer registration process</strong>. Access may be 
                  revoked at any time for violations of these terms.
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="border-t p-6 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox id="terms" checked={termsChecked} onCheckedChange={setTermsChecked} className="mt-1" />
              <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                I have read and agree to the Terms of Service. I understand all materials are proprietary and 
                I will not share, copy, or repurpose them.
              </label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="login" checked={loginChecked} onCheckedChange={setLoginChecked} className="mt-1" />
              <label htmlFor="login" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                I confirm that this login is for <strong>my personal use only</strong>. I will not share 
                my credentials with anyone. I understand this platform was provided to me as a program participant.
              </label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="ip" checked={ipAcknowledged} onCheckedChange={setIpAcknowledged} className="mt-1" />
              <label htmlFor="ip" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                I understand that all materials, frameworks, tools, and content provided by Elbert Innovative Solutions, LLC (EIS) are proprietary and protected intellectual property. I agree not to copy, distribute, teach, or create derivative programs or services based on EIS materials without prior written permission.
              </label>
            </div>
            <Button
              onClick={() => acceptTermsMutation.mutate()}
              disabled={!termsChecked || !loginChecked || !ipAcknowledged || acceptTermsMutation.isPending}
              className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
            >
              {acceptTermsMutation.isPending ? 'Saving...' : 'I Agree — Continue to Setup'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 2: Checklist gate
  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="w-6 h-6 text-[#143A50]" />
            Complete Your Setup
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-1">Step 2 of 2 — Before you dive in, please complete these two quick steps</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-slate-600 text-sm">
            These steps help us personalize your experience and establish your baseline knowledge for the program.
          </p>

          {/* Profile */}
          <div className={`border-2 rounded-lg p-4 flex items-center justify-between gap-4 ${profileComplete ? 'border-green-300 bg-green-50' : 'border-[#E5C089] bg-amber-50'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${profileComplete ? 'bg-green-100' : 'bg-[#143A50]'}`}>
                {profileComplete ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <User className="w-5 h-5 text-white" />}
              </div>
              <div>
                <p className="font-semibold text-slate-900">Complete Your Organization Profile</p>
                <p className="text-sm text-slate-600">Tell us about your organization so we can personalize your workbook and learning materials.</p>
              </div>
            </div>
            {profileComplete ? (
              <Badge className="bg-green-100 text-green-800 flex-shrink-0">Done</Badge>
            ) : (
              <Link to={createPageUrl('IncubateHerProfileIntake')} onClick={onComplete}>
                <Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58] flex-shrink-0">
                  Start <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>

          {/* Pre-Assessment */}
          <div className={`border-2 rounded-lg p-4 flex items-center justify-between gap-4 ${preAssessmentComplete ? 'border-green-300 bg-green-50' : 'border-[#E5C089] bg-amber-50'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${preAssessmentComplete ? 'bg-green-100' : 'bg-[#143A50]'}`}>
                {preAssessmentComplete ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Target className="w-5 h-5 text-white" />}
              </div>
              <div>
                <p className="font-semibold text-slate-900">Complete the Pre-Program Assessment</p>
                <p className="text-sm text-slate-600">Takes about 5 minutes. Helps us understand your starting point and track your growth through the program.</p>
              </div>
            </div>
            {preAssessmentComplete ? (
              <Badge className="bg-green-100 text-green-800 flex-shrink-0">Done</Badge>
            ) : (
              <Link to={createPageUrl('IncubateHerPreAssessment')} onClick={onComplete}>
                <Button size="sm" className="bg-[#AC1A5B] hover:bg-[#8b1449] flex-shrink-0">
                  Start <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>

          {allGateItemsDone ? (
            <Button onClick={onComplete} className="w-full bg-[#143A50] hover:bg-[#1E4F58]">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              You're all set — Enter the Program
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-2">Complete both steps above to unlock full access</p>
              <Button variant="ghost" size="sm" onClick={onComplete} className="text-slate-400 hover:text-slate-600">
                I'll finish these later (limited access)
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}