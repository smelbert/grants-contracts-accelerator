import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink, Folder } from 'lucide-react';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';

export default function IncubateHerWorkbook() {
  const [selectedSection, setSelectedSection] = useState('all');

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

  const { data: workbookItems } = useQuery({
    queryKey: ['workbook', enrollment?.cohort_id],
    queryFn: async () => {
      return await base44.entities.ProgramWorkbookItem.filter({
        cohort_id: enrollment.cohort_id,
        is_visible: true
      });
    },
    enabled: !!enrollment?.cohort_id
  });

  const sections = [
    { id: 'all', name: 'All Resources' },
    { id: 'legal', name: 'Legal & Compliance' },
    { id: 'financial', name: 'Financial Management' },
    { id: 'grants', name: 'Grant Writing' },
    { id: 'contracts', name: 'Contracts & RFPs' },
    { id: 'consultation', name: 'Consultation Tools' },
    { id: 'templates', name: 'Templates & Worksheets' }
  ];

  const itemTypeColors = {
    handout: 'bg-blue-100 text-blue-800',
    worksheet: 'bg-green-100 text-green-800',
    tips_guide: 'bg-purple-100 text-purple-800',
    consultation_tool: 'bg-amber-100 text-amber-800'
  };

  const filteredItems = workbookItems?.filter(item => 
    selectedSection === 'all' || item.section === selectedSection
  ) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader 
        title="Program Workbook"
        subtitle="Your complete resource library for funding readiness"
      />

      <div className="max-w-6xl mx-auto p-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={selectedSection === section.id ? 'default' : 'outline'}
                  onClick={() => setSelectedSection(section.id)}
                  className={selectedSection === section.id ? 'bg-[#143A50]' : ''}
                >
                  <Folder className="w-4 h-4 mr-2" />
                  {section.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Resources Yet</h3>
              <p className="text-slate-500">
                Workbook items will be added by your facilitator as the program progresses.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <FileText className="w-5 h-5 text-[#143A50]" />
                    <Badge className={itemTypeColors[item.item_type] || 'bg-slate-100 text-slate-800'}>
                      {item.item_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {item.description && (
                    <p className="text-sm text-slate-600 mb-4">{item.description}</p>
                  )}
                  
                  <div className="flex gap-2">
                    {item.file_url && (
                      <Button
                        size="sm"
                        className="flex-1 bg-[#143A50]"
                        onClick={() => window.open(item.file_url, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                    {item.external_link && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(item.external_link, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CoBrandedFooter />
    </div>
  );
}