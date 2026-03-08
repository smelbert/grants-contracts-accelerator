import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, BookOpen, Users, Loader2, CheckCircle2, Package } from 'lucide-react';
import { WORKBOOK_PAGES } from '@/components/incubateher/workbookContent';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

// ---------- helpers ----------

function buildWorkbookHTML(pages, dbPages) {
  const dbMap = {};
  (dbPages || []).forEach(p => { dbMap[p.page_id] = p; });

  const pageBlocks = pages.map(page => {
    const db = dbMap[page.id] || {};
    const content = db.content || page.content || '';
    const title = db.title || page.title;
    const subtitle = db.subtitle || page.subtitle || '';
    const type = page.type || 'handout';
    const typeColors = {
      handout: '#143A50',
      worksheet: '#1E4F58',
      consultation: '#AC1A5B',
      tips: '#7a5c1e',
    };
    const color = typeColors[type] || '#143A50';

    const fieldRows = (page.fields || []).map(f => `
      <div style="margin-bottom:14px;">
        <label style="display:block;font-weight:600;margin-bottom:4px;color:#333;font-size:13px;">${f.label || ''}</label>
        ${f.type === 'textarea' 
          ? `<div style="border:1px solid #ccc;border-radius:4px;min-height:${(f.rows || 3) * 22}px;padding:8px;background:#fafafa;"></div>`
          : f.type === 'radio' || f.type === 'checkboxes'
          ? (f.options || []).map(o => `<div style="margin:4px 0;"><input type="checkbox" /> <span style="font-size:13px;">${o.label}</span></div>`).join('')
          : `<div style="border:1px solid #ccc;border-radius:4px;height:32px;padding:6px;background:#fafafa;"></div>`
        }
      </div>
    `).join('');

    const takeaways = (db.takeaways || page.takeaways || []);
    const actionItems = (db.action_items || page.actionItems || []);

    return `
      <div style="page-break-inside:avoid;margin-bottom:0;padding:28px 36px;border-bottom:2px solid #eee;">
        <div style="background:${color};color:white;padding:12px 16px;border-radius:4px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h2 style="margin:0;font-size:16px;font-weight:700;">${title}</h2>
            ${subtitle ? `<p style="margin:4px 0 0;font-size:12px;opacity:0.85;">${subtitle}</p>` : ''}
          </div>
          <span style="font-size:11px;background:rgba(255,255,255,0.2);padding:3px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;">${type}</span>
        </div>
        ${content ? `<div style="font-size:13px;line-height:1.6;color:#333;">${content}</div>` : ''}
        ${fieldRows}
        ${takeaways.length ? `
          <div style="margin-top:12px;padding:10px;background:#f0f7ff;border-left:4px solid #143A50;border-radius:4px;">
            <strong style="font-size:12px;color:#143A50;">Key Takeaways</strong>
            <ul style="margin:6px 0 0;padding-left:18px;">
              ${takeaways.map(t => `<li style="font-size:12px;margin-bottom:3px;">${t}</li>`).join('')}
            </ul>
          </div>` : ''}
        ${actionItems.length ? `
          <div style="margin-top:10px;padding:10px;background:#f0fff4;border-left:4px solid #1E4F58;border-radius:4px;">
            <strong style="font-size:12px;color:#1E4F58;">Action Items</strong>
            <ul style="margin:6px 0 0;padding-left:18px;">
              ${actionItems.map(a => `<li style="font-size:12px;margin-bottom:3px;">${a}</li>`).join('')}
            </ul>
          </div>` : ''}
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>IncubateHer Funding Readiness Workbook</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #222; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
    th { background: #f5f5f5; }
    ul, ol { padding-left: 20px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div style="background:linear-gradient(135deg,#143A50,#1E4F58);color:white;padding:40px 36px;text-align:center;">
    <h1 style="margin:0;font-size:26px;font-weight:800;">IncubateHer Funding Readiness Workbook</h1>
    <p style="margin:8px 0 0;font-size:14px;opacity:0.8;">Preparing for Grants & Contracts</p>
    <p style="margin:4px 0 0;font-size:12px;opacity:0.6;">Columbus Urban League × Elbert Innovative Solutions</p>
    <p style="margin:8px 0 0;font-size:11px;opacity:0.5;">Exported: ${new Date().toLocaleDateString()}</p>
  </div>
  ${pageBlocks}
</body>
</html>`;
}

function buildTemplatesHTML(templates) {
  if (!templates || templates.length === 0) return null;

  const blocks = templates.map(t => {
    const fieldsHtml = (t.fields || []).map(f => `
      <div style="margin-bottom:14px;">
        <label style="display:block;font-weight:600;margin-bottom:4px;font-size:13px;color:#333;">${f.label || ''}</label>
        ${f.type === 'textarea'
          ? `<div style="border:1px solid #ccc;border-radius:4px;min-height:${(f.rows || 3) * 22}px;padding:8px;background:#fafafa;"></div>`
          : `<div style="border:1px solid #ccc;border-radius:4px;height:32px;padding:6px;background:#fafafa;"></div>`
        }
      </div>
    `).join('');

    return `
      <div style="page-break-inside:avoid;margin-bottom:0;padding:28px 36px;border-bottom:2px solid #eee;">
        <div style="background:#AC1A5B;color:white;padding:12px 16px;border-radius:4px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h2 style="margin:0;font-size:16px;font-weight:700;">${t.template_name}</h2>
            ${t.description ? `<p style="margin:4px 0 0;font-size:12px;opacity:0.85;">${t.description}</p>` : ''}
          </div>
          <span style="font-size:11px;background:rgba(255,255,255,0.2);padding:3px 8px;border-radius:20px;">Day ${(t.day || '').replace('day', '')}</span>
        </div>
        ${t.instructions ? `<div style="margin-bottom:14px;padding:10px;background:#fff3cd;border-radius:4px;font-size:13px;"><strong>Instructions:</strong> ${t.instructions}</div>` : ''}
        ${t.content_html ? `<div style="font-size:13px;line-height:1.6;">${t.content_html}</div>` : ''}
        ${fieldsHtml}
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>IncubateHer Document Templates</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #222; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
    th { background: #f5f5f5; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div style="background:linear-gradient(135deg,#AC1A5B,#7a1040);color:white;padding:40px 36px;text-align:center;">
    <h1 style="margin:0;font-size:26px;font-weight:800;">IncubateHer Document Templates</h1>
    <p style="margin:8px 0 0;font-size:14px;opacity:0.8;">Fillable Templates for Program Participants</p>
    <p style="margin:4px 0 0;font-size:12px;opacity:0.6;">Columbus Urban League × Elbert Innovative Solutions</p>
    <p style="margin:8px 0 0;font-size:11px;opacity:0.5;">Exported: ${new Date().toLocaleDateString()}</p>
  </div>
  ${blocks}
</body>
</html>`;
}

function downloadHTML(html, filename) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportEnrollmentsPDF(enrollments, assessments) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageW = doc.internal.pageSize.getWidth();

  // Title
  doc.setFillColor(20, 58, 80);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(229, 192, 137);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('IncubateHer – Participant Enrollment Report', pageW / 2, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Total Participants: ${enrollments.length}`, pageW / 2, 22, { align: 'center' });

  // Build assessment lookup
  const preMap = {};
  const postMap = {};
  assessments.forEach(a => {
    if (a.assessment_type === 'pre') preMap[a.participant_email] = a.total_score;
    if (a.assessment_type === 'post') postMap[a.participant_email] = a.total_score;
  });

  const headers = ['Name', 'Email', 'Organization', 'Status', 'Pre Score', 'Post Score', 'Pre Assess', 'Post Assess', 'Consultation', 'Docs', 'Attendance', 'Completed'];
  const colWidths = [34, 48, 38, 18, 18, 18, 20, 20, 20, 14, 18, 18];
  const startX = 8;
  let y = 36;

  // Header row
  doc.setFillColor(30, 79, 88);
  doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 9, 'F');
  doc.setTextColor(229, 192, 137);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  let x = startX;
  headers.forEach((h, i) => {
    doc.text(h, x + 2, y + 6);
    x += colWidths[i];
  });

  y += 9;

  enrollments.forEach((e, idx) => {
    if (y > 185) {
      doc.addPage();
      y = 14;
      // re-draw header
      doc.setFillColor(30, 79, 88);
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 9, 'F');
      doc.setTextColor(229, 192, 137);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      x = startX;
      headers.forEach((h, i) => { doc.text(h, x + 2, y + 6); x += colWidths[i]; });
      y += 9;
    }

    const bg = idx % 2 === 0 ? [248, 249, 250] : [255, 255, 255];
    doc.setFillColor(...bg);
    doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F');

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');

    const tick = (val) => val ? '✓' : '—';
    const row = [
      (e.participant_name || '').substring(0, 22),
      (e.participant_email || '').substring(0, 30),
      (e.organization_name || '').substring(0, 22),
      e.enrollment_status || 'active',
      preMap[e.participant_email] != null ? String(preMap[e.participant_email]) : '—',
      postMap[e.participant_email] != null ? String(postMap[e.participant_email]) : '—',
      tick(e.pre_assessment_completed),
      tick(e.post_assessment_completed),
      tick(e.consultation_completed),
      tick(e.documents_uploaded),
      tick(e.attendance_complete),
      tick(e.program_completed),
    ];

    x = startX;
    row.forEach((cell, i) => {
      doc.text(String(cell), x + 2, y + 5.5);
      x += colWidths[i];
    });

    y += 8;
  });

  doc.save(`incubateher-participants-${new Date().toISOString().split('T')[0]}.pdf`);
}

// ---------- main component ----------

export default function AdminContentExport() {
  const [exporting, setExporting] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: dbWorkbookPages = [] } = useQuery({
    queryKey: ['workbook-page-content-export'],
    queryFn: () => base44.entities.WorkbookPageContent.list(),
  });

  const { data: documentTemplates = [] } = useQuery({
    queryKey: ['document-templates-export'],
    queryFn: () => base44.entities.DocumentTemplate.list(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments-export'],
    queryFn: () => base44.entities.ProgramEnrollment.filter({ role: 'participant' }),
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments-export'],
    queryFn: () => base44.entities.ProgramAssessment.list(),
  });

  if (user?.role !== 'admin' && user?.role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Admin access required.</p>
      </div>
    );
  }

  const handleExportWorkbook = async () => {
    setExporting('workbook');
    try {
      const html = buildWorkbookHTML(WORKBOOK_PAGES, dbWorkbookPages);
      downloadHTML(html, `incubateher-workbook-${new Date().toISOString().split('T')[0]}.html`);
      toast.success('Workbook HTML exported!');
    } catch (e) {
      toast.error('Export failed: ' + e.message);
    }
    setExporting(null);
  };

  const handleExportTemplates = async () => {
    setExporting('templates');
    try {
      if (documentTemplates.length === 0) {
        toast.error('No document templates found in the database.');
        setExporting(null);
        return;
      }
      const html = buildTemplatesHTML(documentTemplates);
      downloadHTML(html, `incubateher-document-templates-${new Date().toISOString().split('T')[0]}.html`);
      toast.success('Document templates HTML exported!');
    } catch (e) {
      toast.error('Export failed: ' + e.message);
    }
    setExporting(null);
  };

  const handleExportParticipantsPDF = async () => {
    setExporting('participants');
    try {
      if (enrollments.length === 0) {
        toast.error('No participants found.');
        setExporting(null);
        return;
      }
      exportEnrollmentsPDF(enrollments, assessments);
      toast.success('Participant PDF exported!');
    } catch (e) {
      toast.error('Export failed: ' + e.message);
    }
    setExporting(null);
  };

  const handleExportAll = async () => {
    setExporting('all');
    try {
      // Workbook HTML
      const wbHtml = buildWorkbookHTML(WORKBOOK_PAGES, dbWorkbookPages);
      downloadHTML(wbHtml, `incubateher-workbook-${new Date().toISOString().split('T')[0]}.html`);

      // Templates HTML (if any)
      if (documentTemplates.length > 0) {
        const tmplHtml = buildTemplatesHTML(documentTemplates);
        downloadHTML(tmplHtml, `incubateher-document-templates-${new Date().toISOString().split('T')[0]}.html`);
      }

      // Participants PDF
      if (enrollments.length > 0) {
        exportEnrollmentsPDF(enrollments, assessments);
      }

      toast.success('All exports downloaded!');
    } catch (e) {
      toast.error('Export failed: ' + e.message);
    }
    setExporting(null);
  };

  const isLoading = (key) => exporting === key;

  const exports = [
    {
      key: 'workbook',
      icon: BookOpen,
      color: 'bg-[#143A50]',
      title: 'Workbook — Full HTML Export',
      description: `All ${WORKBOOK_PAGES.length} workbook pages (handouts, worksheets, consultation prep, action planning) as a single printable HTML file. Includes any custom content from the database.`,
      badge: `${WORKBOOK_PAGES.length} pages`,
      badgeColor: 'bg-blue-100 text-blue-800',
      format: 'HTML',
      action: handleExportWorkbook,
    },
    {
      key: 'templates',
      icon: FileText,
      color: 'bg-[#AC1A5B]',
      title: 'Document Templates — HTML Export',
      description: 'All fillable document templates (Day 1, 2, 3) as a printable HTML file. Includes instructions, fields, and content HTML from the database.',
      badge: `${documentTemplates.length} templates`,
      badgeColor: 'bg-pink-100 text-pink-800',
      format: 'HTML',
      action: handleExportTemplates,
    },
    {
      key: 'participants',
      icon: Users,
      color: 'bg-[#1E4F58]',
      title: 'Participant Roster — PDF Report',
      description: 'Full participant list with enrollment status, pre/post assessment scores, and completion checkmarks for all program milestones.',
      badge: `${enrollments.length} participants`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      format: 'PDF',
      action: handleExportParticipantsPDF,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Content Export Center</h1>
          <p className="text-slate-500 text-sm">Export workbook HTML, document templates, and participant reports. Admin only.</p>
        </div>

        {/* Export All */}
        <Card className="border-0 shadow-sm mb-8 bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white">
          <CardContent className="p-6 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-[#E5C089]" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Export Everything</h2>
                <p className="text-white/70 text-sm">Download workbook HTML + document templates HTML + participant PDF in one click.</p>
              </div>
            </div>
            <Button
              className="bg-[#E5C089] text-[#143A50] font-bold hover:bg-[#d4af76] shrink-0"
              onClick={handleExportAll}
              disabled={!!exporting}
            >
              {isLoading('all') ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {isLoading('all') ? 'Exporting...' : 'Export All'}
            </Button>
          </CardContent>
        </Card>

        {/* Individual Exports */}
        <div className="space-y-4">
          {exports.map(exp => (
            <Card key={exp.key} className="border-0 shadow-sm">
              <CardContent className="p-6 flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${exp.color} flex items-center justify-center flex-shrink-0`}>
                    <exp.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{exp.title}</h3>
                      <Badge className={`text-xs ${exp.badgeColor}`}>{exp.badge}</Badge>
                      <Badge variant="outline" className="text-xs">{exp.format}</Badge>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">{exp.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="shrink-0 border-slate-300"
                  onClick={exp.action}
                  disabled={!!exporting}
                >
                  {isLoading(exp.key)
                    ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    : <Download className="w-4 h-4 mr-2" />}
                  {isLoading(exp.key) ? 'Exporting...' : 'Download'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Notes */}
        <Card className="border-0 shadow-sm mt-8 bg-amber-50 border-amber-200">
          <CardContent className="p-5">
            <h4 className="font-semibold text-amber-900 mb-2 text-sm">📝 Export Notes</h4>
            <ul className="text-amber-800 text-sm space-y-1 list-disc ml-4">
              <li>HTML files can be opened in any browser and printed to PDF using Ctrl+P / Cmd+P.</li>
              <li>Workbook HTML includes all static content; participant-filled responses are stored separately.</li>
              <li>Document templates export reflects the current database state — add templates via the Document Template Editor first.</li>
              <li>The participant PDF includes all active enrollments with assessment scores and milestone checkmarks.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}