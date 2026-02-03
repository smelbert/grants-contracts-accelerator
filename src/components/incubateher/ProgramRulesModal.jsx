import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, AlertCircle } from 'lucide-react';

export default function ProgramRulesModal({ show, onAcknowledge }) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-6 h-6 text-[#143A50]" />
            Program Rules & Acknowledgment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                <strong>Important:</strong> Please read and acknowledge the following program rules before proceeding.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <h4 className="font-semibold text-[#143A50] mb-2">1. Program Scope</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>This program is <strong>readiness-focused</strong>, not application writing or grant search.</li>
                <li>EIS will not write applications during sessions.</li>
                <li>Participation does not guarantee funding or grant approval.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#143A50] mb-2">2. Consultation Scope</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>One-on-one consultations focus on readiness assessment and document review.</li>
                <li>Consultations are not legal or financial advisory services.</li>
                <li>Participants should seek professional legal/financial counsel for specific issues.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#143A50] mb-2">3. Confidentiality</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Your individual responses and consultation notes are confidential to EIS.</li>
                <li>Aggregate program data (no PII) will be shared with Columbus Urban League.</li>
                <li>No individual names, emails, or consultation details will be shared.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#143A50] mb-2">4. Completion Requirements</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Attend all required sessions.</li>
                <li>Complete pre and post assessments.</li>
                <li>Complete one-on-one consultation.</li>
                <li>Submit required organizational documents.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#143A50] mb-2">5. Giveaway Rules (if applicable)</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Only participants who complete all requirements are eligible.</li>
                <li>Winner selected via random drawing.</li>
                <li>Federal grants are excluded from giveaway opportunities.</li>
                <li>No funding is guaranteed.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#143A50] mb-2">6. Disclaimer</h4>
              <p className="ml-2">
                This program provides education and readiness assessment only. It does not constitute 
                legal advice, financial advice, or a guarantee of funding success. Participants are 
                responsible for their own due diligence and decision-making.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 mr-auto">
            <Checkbox 
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={setAcknowledged}
            />
            <label 
              htmlFor="acknowledge"
              className="text-sm text-slate-700 cursor-pointer"
            >
              I have read and acknowledge the program rules
            </label>
          </div>
          <Button
            onClick={onAcknowledge}
            disabled={!acknowledged}
            className="bg-[#143A50] disabled:opacity-50"
          >
            Continue to Program
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}