import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export default function TermsOfService() {
  const companyName = "Elbert Innovative Solutions";
  const companyEmail = "info@elbertinnovativesolutions.org";
  const currentYear = new Date().getFullYear();
  
  const [activeTab, setActiveTab] = useState(0);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const sections = [
    { id: 0, title: 'Acceptance', icon: '📋' },
    { id: 1, title: 'IP Rights', icon: '©️' },
    { id: 2, title: 'Permitted Use', icon: '✓' },
    { id: 3, title: 'Prohibited Uses', icon: '✗' },
    { id: 4, title: 'Frameworks & No Derivatives', icon: '🔐' },
    { id: 5, title: 'User Accounts', icon: '👤' },
    { id: 6, title: 'Program Participation', icon: '🎓' },
    { id: 7, title: 'Payment', icon: '💰' },
    { id: 8, title: 'Privacy', icon: '🔒' },
    { id: 9, title: 'Communications', icon: '📧' },
    { id: 10, title: 'Disclaimers', icon: '⚠️' },
    { id: 11, title: 'Liability', icon: '⚖️' },
    { id: 12, title: 'Termination', icon: '🚫' },
    { id: 13, title: 'Changes', icon: '📝' },
    { id: 14, title: 'Governing Law', icon: '📜' },
    { id: 15, title: 'Contact', icon: '📞' },
    { id: 16, title: 'Severability', icon: '🔗' },
    { id: 17, title: 'Entire Agreement', icon: '✅' },
  ];

  const progressPercent = ((activeTab + 1) / sections.length) * 100;

  const renderContent = () => {
    switch(activeTab) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">1. Acceptance of Terms</h2>
            <p className="text-base leading-relaxed">
              By registering for an account, enrolling in a program, or accessing any content on this platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use our services.
            </p>
            <div className="bg-[#143A50]/5 border-l-4 border-[#143A50] p-4 rounded">
              <p className="text-sm font-semibold text-[#143A50] mb-2">Key Point:</p>
              <p className="text-sm">Continuing to use this platform constitutes your acceptance of all terms outlined in this document.</p>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">2. Intellectual Property Rights</h2>
            <div className="bg-gradient-to-r from-[#AC1A5B]/10 to-[#E5C089]/10 p-6 rounded-lg border-2 border-[#AC1A5B]">
              <p className="font-mono text-lg font-bold text-[#143A50] mb-2">
                ©{currentYear} {companyName}. All rights reserved.
              </p>
              <p className="text-sm text-slate-700">
                Proprietary content protected by intellectual property law.
              </p>
            </div>
            <p className="text-base leading-relaxed">
              All content on this platform—including but not limited to courses, workshops, videos, workbooks, templates, documents, frameworks, training materials, slides, and recordings—is the exclusive property of {companyName} and is protected by U.S. and international copyright laws.
            </p>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">3. Permitted Use</h2>
            <p className="text-base leading-relaxed">
              You may access and use our materials for your personal, non-commercial learning and application. This means you can:
            </p>
            <div className="grid gap-3">
              {[
                'View, download, and review materials for your own learning',
                'Apply concepts and strategies to your own work or organization',
                'Take notes and create personal summaries',
                'Implement what you learn in your own programs and services'
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 bg-green-50 p-4 rounded-lg border border-green-200">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">4. Prohibited Uses</h2>
            <p className="text-base leading-relaxed">
              You may <strong>NOT</strong> do any of the following without express written permission from {companyName}:
            </p>
            <div className="grid gap-3">
              {[
                'Copy, reproduce, or distribute any materials to others',
                'Share login credentials or allow others to access your account',
                'Record, screenshot, or capture any content for distribution',
                'Teach, sell, or license our content to others',
                'Create courses, programs, or services based on our materials',
                'Repackage or modify our content as your own',
                'Use our frameworks, templates, or methodologies in your commercial offerings',
                'Post, upload, or share our materials on any third-party platform'
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 bg-red-50 p-4 rounded-lg border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">5. Protection of EIS Frameworks and Materials — No Derivative Works / No Teaching</h2>
            <div className="bg-gradient-to-r from-[#AC1A5B]/10 to-[#E5C089]/10 p-6 rounded-lg border-2 border-[#AC1A5B]">
              <div className="flex gap-3 items-start">
                <Lock className="w-6 h-6 text-[#AC1A5B] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-[#143A50] text-lg mb-3">Intellectual Property Protection</h3>
                  <p className="text-sm mb-4">
                    All materials, frameworks, methods, tools, templates, and information provided by {companyName}, LLC ("EIS") are proprietary intellectual property.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-900 mb-3">Materials Include:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'Training content & course modules',
                  'Workshops, slides & presentations',
                  'Worksheets, templates & tools',
                  'Videos, recordings & live sessions',
                  'Strategic frameworks & methodologies',
                  'Written guides, exercises & materials'
                ].map((item, idx) => (
                  <li key={idx} className="text-sm flex gap-2">
                    <span className="text-[#E5C089]">▪</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-5 rounded-lg border-l-4 border-[#AC1A5B]">
              <p className="font-semibold text-[#143A50] mb-3">You may NOT:</p>
              <ul className="space-y-2">
                {[
                  'Copy, reproduce, or distribute EIS materials or frameworks',
                  'Teach, license, sell, publish, or otherwise repurpose EIS materials without permission',
                  'Create derivative programs, trainings, courses, or services based on EIS content',
                  'Reuse EIS frameworks or methodologies in commercial offerings'
                ].map((item, idx) => (
                  <li key={idx} className="text-sm flex gap-2">
                    <span className="text-red-600 font-bold">✕</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <p className="text-sm italic text-amber-900">
                Unauthorized use, reproduction, distribution, or creation of derivative works may result in immediate removal from the program and legal action to protect EIS intellectual property rights.
              </p>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">6. User Accounts</h2>
            <p className="text-base leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials. You agree to:
            </p>
            <div className="space-y-3">
              {[
                'Provide accurate and complete registration information',
                'Keep your password secure and not share it with others',
                'Notify us immediately of any unauthorized use of your account',
                'Accept responsibility for all activities that occur under your account'
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="font-bold text-[#143A50]">{idx + 1}.</span>
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">7. Program Participation</h2>
            <p className="text-base leading-relaxed">
              When you enroll in a program, cohort, or workshop:
            </p>
            <div className="space-y-3">
              {[
                'You commit to participating in good faith and respecting other participants',
                'You understand that program schedules and content may be adjusted as needed',
                'You agree to respect the confidentiality of other participants\' shared information',
                'You acknowledge that results depend on your own effort and implementation'
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="font-bold text-blue-600">•</span>
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">8. Payment and Refunds</h2>
            <div className="bg-[#E5C089]/10 border-l-4 border-[#E5C089] p-4 rounded">
              <p className="text-sm">
                All fees are <strong>non-refundable</strong> unless otherwise stated in writing for a specific program. Payment is due at the time of registration unless an approved payment plan is in place.
              </p>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">9. Privacy and Data</h2>
            <p className="text-base leading-relaxed">
              We collect and use your information as described in our Privacy Policy. By using our services, you consent to our data practices. We will never sell your personal information to third parties.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">Your Data Rights:</p>
              <p className="text-sm text-slate-700">Your personal information is protected and used only as necessary to provide our services.</p>
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">10. Communications</h2>
            <p className="text-base leading-relaxed">
              By creating an account, you agree to receive:
            </p>
            <div className="space-y-2 mb-6">
              {[
                'Transactional emails (receipts, program updates, account notifications)',
                'Educational content related to programs you\'ve enrolled in',
                'Occasional announcements about new programs or services'
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <span className="text-[#143A50]">📧</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                You may unsubscribe from non-essential communications at any time by clicking the unsubscribe link in any email.
              </p>
            </div>
          </div>
        );
      case 10:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">11. Disclaimers</h2>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <p className="text-sm">
                  {companyName} provides educational content and resources. We do not guarantee specific results. Your success depends on your own effort, implementation, organizational capacity, and circumstances.
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <p className="text-sm">
                  Our content is provided "as is" without warranties of any kind, either express or implied. We do not warrant that our services will be uninterrupted or error-free.
                </p>
              </div>
            </div>
          </div>
        );
      case 11:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">12. Limitation of Liability</h2>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-sm">
                To the maximum extent permitted by law, {companyName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.
              </p>
            </div>
          </div>
        );
      case 12:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">13. Termination</h2>
            <p className="text-base leading-relaxed">
              We reserve the right to suspend or terminate your access to our platform if you violate these Terms of Service. Upon termination:
            </p>
            <div className="space-y-2">
              {[
                'Your right to access materials immediately ceases',
                'You must delete or destroy any downloaded materials',
                'All provisions regarding intellectual property and confidentiality continue to apply'
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="font-bold text-red-600">{idx + 1}</span>
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 13:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">14. Changes to Terms</h2>
            <p className="text-base leading-relaxed">
              We may update these Terms of Service from time to time. We will notify you of material changes by email or through the platform. Your continued use of our services after changes take effect constitutes acceptance of the updated terms.
            </p>
          </div>
        );
      case 14:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">15. Governing Law</h2>
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
              <p className="text-base font-semibold text-slate-900 mb-3">Jurisdiction</p>
              <p className="text-sm mb-2">
                These Terms of Service are governed by the laws of the State of Ohio, United States.
              </p>
              <p className="text-sm">
                Any disputes shall be resolved in the courts of Franklin County, Ohio.
              </p>
            </div>
          </div>
        );
      case 15:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">16. Contact Information</h2>
            <p className="text-base leading-relaxed">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white p-6 rounded-lg">
              <p className="font-bold text-lg mb-3">{companyName}</p>
              <p className="text-sm mb-2 flex items-center gap-2">
                <span>📧</span>
                <a href={`mailto:${companyEmail}`} className="underline hover:opacity-80">
                  {companyEmail}
                </a>
              </p>
            </div>
          </div>
        );
      case 16:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">17. Severability</h2>
            <p className="text-base leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
            </p>
          </div>
        );
      case 17:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#143A50]">18. Entire Agreement</h2>
            <p className="text-base leading-relaxed">
              These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and {companyName} regarding your use of our services and supersede all prior agreements.
            </p>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm font-semibold text-green-900 mb-2">Final Note:</p>
              <p className="text-sm text-green-900">
                By using this platform, you confirm that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {user && (
        <div className="flex justify-center p-6">
          <Link to={createPageUrl('Home')}>
            <Button className="bg-[#143A50] hover:bg-[#1E4F58] flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#143A50] mb-2">Terms of Service</h1>
          <p className="text-slate-600">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Reading Progress</span>
            <span className="text-sm text-slate-600">{activeTab + 1} of {sections.length}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-[#143A50] text-white p-4">
                <h3 className="font-bold">Sections</h3>
              </div>
              <nav className="divide-y max-h-[calc(100vh-200px)] overflow-y-auto">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-all ${
                      activeTab === section.id
                        ? 'bg-[#143A50] text-white border-l-4 border-[#E5C089]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardContent className="pt-10 pb-10">
                {renderContent()}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 mt-8">
              <Button
                onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                disabled={activeTab === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                ← Previous
              </Button>
              <Button
                onClick={() => setActiveTab(Math.min(sections.length - 1, activeTab + 1))}
                disabled={activeTab === sections.length - 1}
                className="bg-[#143A50] hover:bg-[#1E4F58] flex items-center gap-2"
              >
                Next →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}