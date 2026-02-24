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
          <p className="text-slate-600">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6 text-slate-700">
            <p>
              Welcome to {companyName}. By accessing or using our platform, programs, materials, and services, you agree to these Terms of Service. Please read them carefully.
            </p>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">1. Acceptance of Terms</h2>
            <p>
              By registering for an account, enrolling in a program, or accessing any content on this platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use our services.
            </p>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">2. Intellectual Property Rights</h2>
            <div className="bg-slate-100 p-4 rounded-lg border-l-4 border-[#AC1A5B] my-4">
              <p className="font-mono">
                ©{currentYear} {companyName}. All rights reserved.
              </p>
            </div>
            <p>
              All content on this platform—including but not limited to courses, workshops, videos, workbooks, templates, documents, frameworks, training materials, slides, and recordings—is the exclusive property of {companyName} and is protected by U.S. and international copyright laws.
            </p>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">3. Permitted Use</h2>
            <p>
              You may access and use our materials for your personal, non-commercial learning and application. This means you can:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>View, download, and review materials for your own learning</li>
              <li>Apply concepts and strategies to your own work or organization</li>
              <li>Take notes and create personal summaries</li>
              <li>Implement what you learn in your own programs and services</li>
            </ul>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">4. Prohibited Uses</h2>
            <p>
              You may <strong>NOT</strong> do any of the following without express written permission from {companyName}:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Copy, reproduce, or distribute any materials to others</li>
              <li>Share login credentials or allow others to access your account</li>
              <li>Record, screenshot, or capture any content for distribution</li>
              <li>Teach, sell, or license our content to others</li>
              <li>Create courses, programs, or services based on our materials</li>
              <li>Repackage or modify our content as your own</li>
              <li>Use our frameworks, templates, or methodologies in your commercial offerings</li>
              <li>Post, upload, or share our materials on any third-party platform</li>
            </ul>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">5. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Provide accurate and complete registration information</li>
              <li>Keep your password secure and not share it with others</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">6. Program Participation</h2>
            <p>
              When you enroll in a program, cohort, or workshop:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>You commit to participating in good faith and respecting other participants</li>
              <li>You understand that program schedules and content may be adjusted as needed</li>
              <li>You agree to respect the confidentiality of other participants' shared information</li>
              <li>You acknowledge that results depend on your own effort and implementation</li>
            </ul>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">7. Payment and Refunds</h2>
            <p>
              All fees are non-refundable unless otherwise stated in writing for a specific program. Payment is due at the time of registration unless an approved payment plan is in place.
            </p>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">8. Privacy and Data</h2>
            <p>
              We collect and use your information as described in our Privacy Policy. By using our services, you consent to our data practices. We will never sell your personal information to third parties.
            </p>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">9. Communications</h2>
            <p>
              By creating an account, you agree to receive:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Transactional emails (receipts, program updates, account notifications)</li>
              <li>Educational content related to programs you've enrolled in</li>
              <li>Occasional announcements about new programs or services</li>
            </ul>
            <p className="mt-2">
              You may unsubscribe from non-essential communications at any time by clicking the unsubscribe link in any email.
            </p>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">10. Disclaimers</h2>
            <p>
              {companyName} provides educational content and resources. We do not guarantee specific results. Your success depends on your own effort, implementation, organizational capacity, and circumstances.
            </p>
            <p className="mt-4">
              Our content is provided "as is" without warranties of any kind, either express or implied. We do not warrant that our services will be uninterrupted or error-free.
            </p>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, {companyName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.
            </p>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">12. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to our platform if you violate these Terms of Service. Upon termination:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Your right to access materials immediately ceases</li>
              <li>You must delete or destroy any downloaded materials</li>
              <li>All provisions regarding intellectual property and confidentiality continue to apply</li>
            </ul>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">13. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. We will notify you of material changes by email or through the platform. Your continued use of our services after changes take effect constitutes acceptance of the updated terms.
            </p>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">14. Governing Law</h2>
            <p>
              These Terms of Service are governed by the laws of the State of Ohio, United States. Any disputes shall be resolved in the courts of Franklin County, Ohio.
            </p>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">15. Contact Information</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-slate-100 p-4 rounded-lg my-4">
              <p className="font-semibold">{companyName}</p>
              <p>Email: <a href={`mailto:${companyEmail}`} className="text-[#AC1A5B] underline">{companyEmail}</a></p>
            </div>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">16. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
            </p>

            <h2 className="text-xl font-bold text-[#143A50] mt-6">17. Entire Agreement</h2>
            <p>
              These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and {companyName} regarding your use of our services and supersede all prior agreements.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#143A50] text-white">
          <CardContent className="pt-6">
            <p className="text-center">
              By using this platform, you confirm that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}