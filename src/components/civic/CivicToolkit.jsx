import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, 
  Users, 
  MessageSquare, 
  FileText, 
  AlertTriangle, 
  CheckCircle2,
  ExternalLink,
  Shield
} from 'lucide-react';

const TOOLKIT_SECTIONS = [
  {
    id: 'council',
    title: 'City Council Engagement',
    icon: Building,
    color: 'emerald',
    items: [
      { label: 'Research your council members', type: 'checklist' },
      { label: 'Understand meeting schedules and agendas', type: 'checklist' },
      { label: 'Prepare your talking points', type: 'template' },
      { label: 'Follow up after meetings', type: 'template' },
    ],
  },
  {
    id: 'county',
    title: 'County & Regional Agencies',
    icon: Users,
    color: 'blue',
    items: [
      { label: 'Identify relevant county departments', type: 'checklist' },
      { label: 'Understand county budget cycles', type: 'guide' },
      { label: 'Request for information template', type: 'template' },
      { label: 'Partnership proposal outline', type: 'template' },
    ],
  },
  {
    id: 'earmarks',
    title: 'Understanding Earmarks',
    icon: FileText,
    color: 'violet',
    items: [
      { label: 'What are earmarks (and what they are not)', type: 'guide' },
      { label: 'Eligibility requirements', type: 'guide' },
      { label: 'Timeline and process overview', type: 'guide' },
      { label: 'Working with elected officials', type: 'guide' },
    ],
    warning: 'Earmarks are not guaranteed funding. This education helps you understand the process, not promise results.',
  },
  {
    id: 'coalitions',
    title: 'Coalition Building',
    icon: Users,
    color: 'amber',
    items: [
      { label: 'Identify potential partners', type: 'checklist' },
      { label: 'MOU template for collaborations', type: 'template' },
      { label: 'Coalition meeting agenda template', type: 'template' },
      { label: 'Shared funding opportunity tracking', type: 'template' },
    ],
  },
];

const colorMap = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', iconBg: 'bg-emerald-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', iconBg: 'bg-blue-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', iconBg: 'bg-violet-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', iconBg: 'bg-amber-100' },
};

export default function CivicToolkit({ onSelectItem }) {
  return (
    <div className="space-y-6">
      {/* Compliance Notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <Shield className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Important:</strong> This toolkit provides educational resources for civic engagement. 
          It is not lobbying advice. Always consult legal counsel for compliance questions.
        </AlertDescription>
      </Alert>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TOOLKIT_SECTIONS.map((section, index) => {
          const colors = colorMap[section.color];
          const Icon = section.icon;

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {section.warning && (
                    <Alert className="mb-4 bg-amber-50 border-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <AlertDescription className="text-amber-700 text-sm">
                        {section.warning}
                      </AlertDescription>
                    </Alert>
                  )}

                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i}>
                        <button
                          onClick={() => onSelectItem?.(section.id, item)}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            <span className="text-sm text-slate-700">{item.label}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Fiscal Sponsor Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <Shield className="w-5 h-5 text-slate-600" />
            </div>
            <CardTitle>Fiscal Sponsorship</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Not yet a 501(c)(3)? A fiscal sponsor can help you receive tax-deductible donations 
            and apply for certain grants while you build your organization.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50">
              <h4 className="font-medium text-slate-900 mb-1">What is it?</h4>
              <p className="text-sm text-slate-600">
                A fiscal sponsor is an established nonprofit that provides legal and tax-exempt status to groups.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <h4 className="font-medium text-slate-900 mb-1">When to use it</h4>
              <p className="text-sm text-slate-600">
                When you need 501(c)(3) status for funding but aren't incorporated yet.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <h4 className="font-medium text-slate-900 mb-1">What to expect</h4>
              <p className="text-sm text-slate-600">
                Typically 5-10% administrative fee. Full transparency on fund management.
              </p>
            </div>
          </div>
          <Button variant="outline" className="mt-4">
            <ExternalLink className="w-4 h-4 mr-2" />
            Learn More About Fiscal Sponsors
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}