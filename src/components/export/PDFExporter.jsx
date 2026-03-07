import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Loader2, FileText, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

/**
 * PDFExporter — renders a hidden branded HTML template into PDF.
 *
 * Props:
 *   type: 'document' | 'workbook'
 *   document: { doc_name, doc_type, content, status, updated_date }   (for type='document')
 *   workbookData: { pages: [{title, section, fields, content}], responses: {}, customPages: [] }  (for type='workbook')
 *   organizationName: string
 *   userName: string
 *   trigger: ReactNode  (optional custom trigger button)
 */
export default function PDFExporter({ type = 'document', document, workbookData, organizationName, userName, trigger }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const templateRef = useRef(null);

  const orgName = organizationName || 'Your Organization';
  const participantName = userName || 'Participant';
  const today = format(new Date(), 'MMMM d, yyyy');

  const handleExport = async () => {
    if (!templateRef.current) return;
    setExporting(true);
    try {
      const el = templateRef.current;
      el.style.display = 'block';

      const pdf = new jsPDF('p', 'mm', 'letter');
      const pdfWidth = 216;
      const pdfHeight = 279;

      const pages = el.querySelectorAll('.pdf-page');

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 816,
          windowWidth: 816,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      const filename = type === 'document'
        ? `${document?.doc_name?.replace(/\s+/g, '_') || 'Document'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`
        : `Workbook_${orgName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

      pdf.save(filename);
      el.style.display = 'none';
      toast.success('PDF exported successfully!');
      setOpen(false);
    } catch (e) {
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // ── Workbook page chunks ──
  const workbookPages = workbookData?.pages || [];
  const responses = workbookData?.responses || {};
  const customPages = workbookData?.customPages || [];

  // Split workbook pages into PDF pages (max ~8 items per page to avoid overflow)
  const chunkWorkbookPages = () => {
    const chunks = [];
    let current = [];
    workbookPages.forEach((page, idx) => {
      const resp = responses[page.id] || {};
      const fieldCount = (page.fields || []).filter(f => resp[f.id]).length;
      // Start a new PDF page every 4 workbook sections
      if (current.length >= 4 && idx > 0) {
        chunks.push(current);
        current = [];
      }
      current.push({ page, resp });
    });
    if (current.length) chunks.push(current);
    return chunks;
  };

  const docTypeLabel = document?.doc_type
    ? document.doc_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Document';

  return (
    <>
      {/* Trigger */}
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger || (
          <Button variant="outline" size="sm" className="border-[#143A50] text-[#143A50] hover:bg-[#143A50]/5">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        )}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {type === 'document' ? <FileText className="w-5 h-5 text-[#143A50]" /> : <BookOpen className="w-5 h-5 text-[#AC1A5B]" />}
              Export Professional PDF
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-xl border-2 border-[#E5C089] bg-[#E5C089]/10 p-4 space-y-1">
              <p className="text-sm font-semibold text-[#143A50]">
                {type === 'document' ? document?.doc_name : 'IncubateHer Workbook Responses'}
              </p>
              <p className="text-xs text-slate-600">Organization: {orgName}</p>
              <p className="text-xs text-slate-500">Exported: {today}</p>
            </div>

            <p className="text-sm text-slate-600">
              This will generate a branded PDF with a cover page, EIS branding, and all your{' '}
              {type === 'document' ? 'document content' : 'workbook responses'}.
            </p>

            <Button
              onClick={handleExport}
              disabled={exporting}
              className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
              size="lg"
            >
              {exporting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating PDF...</>
                : <><Download className="w-4 h-4 mr-2" />Download PDF</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden off-screen render target */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
        <div ref={templateRef} style={{ display: 'none', fontFamily: 'Georgia, serif' }}>

          {/* ══════════════ COVER PAGE ══════════════ */}
          <div className="pdf-page" style={pageStyle}>
            {/* Top gold bar */}
            <div style={{ background: 'linear-gradient(135deg, #143A50 0%, #1E4F58 60%, #AC1A5B 100%)', height: 12, width: '100%' }} />

            {/* Main cover body */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 60px 40px', background: 'linear-gradient(180deg, #f8f6f0 0%, #ffffff 100%)', position: 'relative', overflow: 'hidden' }}>

              {/* Watermark circle */}
              <div style={{ position: 'absolute', top: -80, right: -80, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, #E5C089 0%, transparent 70%)', opacity: 0.15 }} />
              <div style={{ position: 'absolute', bottom: -60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, #143A50 0%, transparent 70%)', opacity: 0.08 }} />

              {/* Logo area */}
              <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #143A50, #1E4F58)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, boxShadow: '0 8px 32px rgba(20,58,80,0.25)' }}>
                <span style={{ color: '#E5C089', fontSize: 36, fontWeight: 'bold', fontFamily: 'serif' }}>EIS</span>
              </div>

              {/* Program tag */}
              <div style={{ background: '#AC1A5B', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 3, padding: '6px 20px', borderRadius: 20, marginBottom: 24, textTransform: 'uppercase' }}>
                IncubateHer Program
              </div>

              {/* Title */}
              <div style={{ fontSize: 34, fontWeight: 800, color: '#143A50', textAlign: 'center', lineHeight: 1.15, marginBottom: 10, fontFamily: 'Georgia, serif' }}>
                {type === 'document' ? document?.doc_name || 'Document Report' : 'Funding Readiness Workbook'}
              </div>

              {/* Subtitle */}
              <div style={{ fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 36, fontStyle: 'italic' }}>
                {type === 'document' ? docTypeLabel : 'Complete Responses & Reflections'}
              </div>

              {/* Gold divider */}
              <div style={{ width: 120, height: 3, background: 'linear-gradient(90deg, transparent, #E5C089, transparent)', marginBottom: 36, borderRadius: 2 }} />

              {/* Org info box */}
              <div style={{ background: 'white', border: '2px solid #E5C089', borderRadius: 14, padding: '24px 40px', textAlign: 'center', minWidth: 360, boxShadow: '0 4px 24px rgba(229,192,137,0.2)' }}>
                <div style={{ fontSize: 12, color: '#AC1A5B', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>Prepared For</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#143A50', marginBottom: 4 }}>{orgName}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>{participantName}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{today}</div>
              </div>
            </div>

            {/* Footer band */}
            <div style={{ background: '#143A50', padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#E5C089', fontSize: 11, fontWeight: 600 }}>Elbert Innovative Solutions</span>
              <span style={{ color: 'rgba(229,192,137,0.6)', fontSize: 10 }}>Funded by Columbus Urban League</span>
              <span style={{ color: 'rgba(229,192,137,0.6)', fontSize: 10 }}>elbertinnovativesolutions.org</span>
            </div>
          </div>

          {/* ══════════════ DOCUMENT CONTENT PAGE(S) ══════════════ */}
          {type === 'document' && (
            <div className="pdf-page" style={pageStyle}>
              <div style={innerHeaderStyle}>
                <span style={{ color: '#E5C089', fontWeight: 700, fontSize: 11 }}>ELBERT INNOVATIVE SOLUTIONS</span>
                <span style={{ color: 'rgba(229,192,137,0.7)', fontSize: 10 }}>{document?.doc_name}</span>
              </div>
              <div style={{ flex: 1, padding: '36px 48px', background: '#fff', overflowHidden: true }}>
                {/* Section label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 4, height: 40, background: 'linear-gradient(180deg, #143A50, #AC1A5B)', borderRadius: 2 }} />
                  <div>
                    <div style={{ fontSize: 10, color: '#AC1A5B', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>{docTypeLabel}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#143A50' }}>{document?.doc_name}</div>
                  </div>
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', gap: 24, marginBottom: 28, padding: '12px 20px', background: '#f8f6f0', borderRadius: 8, borderLeft: '3px solid #E5C089' }}>
                  <div><span style={metaLabelStyle}>Organization</span><span style={metaValueStyle}>{orgName}</span></div>
                  <div><span style={metaLabelStyle}>Author</span><span style={metaValueStyle}>{participantName}</span></div>
                  <div><span style={metaLabelStyle}>Status</span><span style={{ ...metaValueStyle, color: '#059669', fontWeight: 700 }}>{(document?.status || 'draft').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span></div>
                  <div><span style={metaLabelStyle}>Date</span><span style={metaValueStyle}>{today}</span></div>
                </div>

                {/* Content body */}
                <div style={{ fontSize: 12, lineHeight: 1.85, color: '#374151', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {document?.content
                    ? document.content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim()
                    : '(No content)'}
                </div>
              </div>
              <PageFooter page={1} total={1} />
            </div>
          )}

          {/* ══════════════ WORKBOOK CONTENT PAGES ══════════════ */}
          {type === 'workbook' && chunkWorkbookPages().map((chunk, chunkIdx) => (
            <div key={chunkIdx} className="pdf-page" style={pageStyle}>
              <div style={innerHeaderStyle}>
                <span style={{ color: '#E5C089', fontWeight: 700, fontSize: 11 }}>INCUBATEHER WORKBOOK</span>
                <span style={{ color: 'rgba(229,192,137,0.7)', fontSize: 10 }}>{orgName}</span>
              </div>
              <div style={{ flex: 1, padding: '28px 48px', background: '#fff', overflow: 'hidden' }}>
                {chunk.map(({ page, resp }, itemIdx) => {
                  const customPage = customPages.find(p => p.page_id === page.id);
                  return (
                    <div key={page.id} style={{ marginBottom: 28, paddingBottom: 24, borderBottom: itemIdx < chunk.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      {/* Section + Title */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 3, height: 28, background: 'linear-gradient(180deg, #143A50, #1E4F58)', borderRadius: 2 }} />
                        <div>
                          <div style={{ fontSize: 9, color: '#AC1A5B', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>{page.section}</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#143A50' }}>{page.title}</div>
                        </div>
                      </div>

                      {/* Fields */}
                      {page.fields && page.fields.map(field => {
                        const val = resp[field.id];
                        if (!val) return null;
                        return (
                          <div key={field.id} style={{ marginBottom: 10, padding: '8px 12px', background: '#f9fafb', borderRadius: 6, borderLeft: '2px solid #E5C089' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#374151', marginBottom: 3 }}>{field.label}</div>
                            <div style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.6 }}>
                              {typeof val === 'string' ? val : Array.isArray(val) ? val.join(', ') : String(val)}
                            </div>
                          </div>
                        );
                      })}

                      {/* No responses message */}
                      {page.fields && !page.fields.some(f => resp[f.id]) && (
                        <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', paddingLeft: 12 }}>No responses recorded for this section.</div>
                      )}
                    </div>
                  );
                })}
              </div>
              <PageFooter page={chunkIdx + 2} total={chunkWorkbookPages().length + 1} />
            </div>
          ))}

        </div>
      </div>
    </>
  );
}

// ── Sub-components & Styles ──

function PageFooter({ page, total }) {
  return (
    <div style={{ background: '#143A50', padding: '10px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#E5C089', fontSize: 10, fontWeight: 600 }}>Elbert Innovative Solutions</span>
      <span style={{ color: 'rgba(229,192,137,0.5)', fontSize: 10 }}>Page {page} of {total}</span>
    </div>
  );
}

const pageStyle = {
  width: 816,
  height: 1056,
  display: 'flex',
  flexDirection: 'column',
  background: '#ffffff',
  overflow: 'hidden',
  position: 'relative',
};

const innerHeaderStyle = {
  background: '#143A50',
  padding: '10px 40px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const metaLabelStyle = {
  display: 'block',
  fontSize: 9,
  color: '#9ca3af',
  textTransform: 'uppercase',
  letterSpacing: 1,
  fontWeight: 700,
  marginBottom: 2,
};

const metaValueStyle = {
  display: 'block',
  fontSize: 11,
  color: '#374151',
  fontWeight: 600,
};