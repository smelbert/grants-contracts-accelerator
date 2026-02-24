import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfService() {
  const companyName = "Elbert Innovative Solutions";
  const companyEmail = "info@elbertinnovativesolutions.org";
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#143A50] mb-2">Terms of Service</h1>
          <p className="text-slate-600">Intellectual Property Protection & Usage Terms</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-[#143A50]">Copyright Notice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <h3 className="font-semibold text-lg">What it is:</h3>
            <p>
              A copyright notice is our public claim of ownership. It tells the world: this content is ours, 
              we created it, and it's legally protected. While it doesn't replace registration with the U.S. 
              Copyright Office (that's the gold standard), it strengthens our position if our work is copied.
            </p>

            <h3 className="font-semibold text-lg mt-6">Copyright Protection:</h3>
            <div className="bg-slate-100 p-4 rounded-lg border-l-4 border-[#AC1A5B]">
              <p className="font-mono">
                ©{currentYear} {companyName}. All rights reserved.
              </p>
            </div>

            <p className="mt-4">
              All rights reserved. No part of this publication may be reproduced, distributed, or transmitted 
              in any form or by any means, including photocopying, recording, or other electronic or mechanical 
              methods, without prior written permission of the publisher.
            </p>

            <p>
              For permission requests or inquiries, email{' '}
              <a href={`mailto:${companyEmail}`} className="text-[#AC1A5B] underline">
                {companyEmail}
              </a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-[#143A50]">No Derivative Works / No Teaching</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <h3 className="font-semibold text-lg">What it is:</h3>
            <p>
              This clause stops people from taking what we've created—our courses, coaching programs, slides, 
              videos, workbooks, templates, or event materials—and re-teaching or repackaging it as their own. 
              Students can apply what they learn to grow their own business or life, but they can't turn our 
              frameworks into their "signature system."
            </p>

            <h3 className="font-semibold text-lg mt-6">When to use it:</h3>
            <p>
              This applies to all educational products, programs, and events—whether that's a self-paced course, 
              group coaching, masterminds, workshops, or live trainings.
            </p>

            <h3 className="font-semibold text-lg mt-6">Example:</h3>
            <p>
              If we create a 12-week business coaching program that includes proprietary frameworks and exercises, 
              and a participant joins, loves our methods, and then launches their own program teaching our exact 
              process under a new name—without this clause, it's harder to stop them. With it, they're on clear 
              notice that using our program to create their own is prohibited.
            </p>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg mt-6">
              <h3 className="font-semibold text-lg mb-2">The Clause:</h3>
              <p className="text-sm">
                <strong>No Derivative Works.</strong> The materials, methods, and information provided by{' '}
                {companyName} as part of this program (including but not limited to course modules, worksheets, 
                training videos, slides, event recordings, frameworks, workbooks, templates, documents, and strategies) 
                are proprietary and protected by intellectual property law. These materials are for the personal use 
                of the participant only. They may not be copied, shared, taught, sold, distributed, recorded, or 
                repurposed—whether in whole or in part—for any commercial use without the express written consent of{' '}
                {companyName}. Creating derivative works, programs, or services based on this content is strictly prohibited.
              </p>
            </div>

            <div className="bg-slate-100 p-4 rounded-lg mt-6">
              <p className="text-sm italic">
                <strong>Note:</strong> This is one of the most overlooked protections in the online space. 
                We've seen it too many times: a student buys a course or joins a program, then months later 
                they're teaching the exact same content as if they invented it. Without this clause, there's 
                nothing stopping them. With it, we draw the line: they can use what they learn for themselves, 
                but they can't package it into their own program. This isn't just for coaches—therapists, fitness 
                pros, copywriters, anyone teaching a system or process needs this. Don't wait until someone steals 
                your signature framework—block it before it happens.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#143A50] text-white">
          <CardContent className="pt-6">
            <p className="text-center">
              By using this platform and accessing our materials, you agree to these terms and acknowledge 
              that all content is protected by copyright and intellectual property law.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}