import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText } from 'lucide-react';

export default function LegalAcknowledgement({ open, onAccept }) {
  const [acknowledged, setAcknowledged] = useState(false);
  const companyName = "Elbert Innovative Solutions";
  const currentYear = new Date().getFullYear();

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Shield className="w-6 h-6 text-[#AC1A5B]" />
            Terms of Service & Copyright Protection
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6 text-slate-700">
            {/* Copyright Notice */}
            <div>
              <h3 className="font-semibold text-lg text-[#143A50] mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Copyright Notice
              </h3>
              <div className="bg-slate-100 p-4 rounded-lg border-l-4 border-[#AC1A5B] mb-3">
                <p className="font-mono text-sm">
                  ©{currentYear} {companyName}. All rights reserved.
                </p>
              </div>
              <p className="text-sm">
                All rights reserved. No part of this publication may be reproduced, distributed, or transmitted 
                in any form or by any means, including photocopying, recording, or other electronic or mechanical 
                methods, without prior written permission of the publisher.
              </p>
            </div>

            {/* No Derivative Works */}
            <div>
              <h3 className="font-semibold text-lg text-[#143A50] mb-2">
                No Derivative Works / No Teaching
              </h3>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg text-sm">
                <p className="font-semibold mb-2">Important:</p>
                <p>
                  The materials, methods, and information provided by {companyName} as part of this program 
                  (including but not limited to course modules, worksheets, training videos, slides, event recordings, 
                  frameworks, workbooks, templates, documents, and strategies) are proprietary and protected by 
                  intellectual property law.
                </p>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span><strong>You CAN:</strong> Use materials for your personal growth and business development</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✗</span>
                  <span><strong>You CANNOT:</strong> Copy, share, teach, sell, distribute, record, or repurpose 
                  materials for commercial use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✗</span>
                  <span><strong>You CANNOT:</strong> Create derivative works, programs, or services based on 
                  this content</span>
                </li>
              </ul>
            </div>

            {/* Agreement */}
            <div className="bg-[#143A50] text-white p-4 rounded-lg">
              <p className="text-sm">
                By accessing this platform and its materials, you acknowledge that all content is protected by 
                copyright and intellectual property law, and you agree to use the materials solely for your 
                personal benefit and not for any commercial purposes or derivative works.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t pt-4 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={setAcknowledged}
              className="mt-1"
            />
            <label htmlFor="acknowledge" className="text-sm text-slate-700 leading-relaxed cursor-pointer">
              I have read and agree to the Terms of Service. I understand that all materials are protected by 
              copyright and I will not copy, share, teach, or create derivative works based on the content provided.
            </label>
          </div>

          <Button
            onClick={onAccept}
            disabled={!acknowledged}
            className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
          >
            Accept Terms & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}