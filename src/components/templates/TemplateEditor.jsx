import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Eye, Edit3, Printer } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Extract all [Placeholder] tokens from template content
function extractPlaceholders(content) {
  if (!content) return [];
  const matches = content.match(/\[([^\]]+)\]/g) || [];
  const unique = [...new Set(matches)];
  return unique.map(m => ({ token: m, key: m.slice(1, -1), label: m.slice(1, -1) }));
}

// Replace tokens in HTML content with filled values
function applyValues(content, values) {
  if (!content) return '';
  let result = content;
  Object.entries(values).forEach(([key, val]) => {
    const token = `[${key}]`;
    const replacement = val
      ? `<span class="filled-value" style="color:#143A50;font-weight:600;">${val}</span>`
      : `<span class="placeholder-empty" style="color:#AC1A5B;font-weight:600;text-decoration:underline dotted;">[${key}]</span>`;
    result = result.split(token).join(replacement);
  });
  return result;
}

export default function TemplateEditor({ resource, open, onClose }) {
  const [values, setValues] = useState({});
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [exporting, setExporting] = useState(false);
  const printRef = useRef(null);

  const placeholders = extractPlaceholders(resource?.template_content);

  useEffect(() => {
    if (open) {
      const initial = {};
      placeholders.forEach(p => { initial[p.key] = ''; });
      setValues(initial);
      setActiveTab('edit');
    }
  }, [open, resource?.id]);

  const filledContent = applyValues(resource?.template_content, values);
  const filledCount = Object.values(values).filter(v => v.trim() !== '').length;
  const totalCount = placeholders.length;

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setExporting(true);
    try {
      setActiveTab('preview');
      await new Promise(r => setTimeout(r, 400));

      const DPI = 96;
      const PAGE_W_IN = 8.5;
      const PAGE_H_IN = 11;
      const MARGIN_IN = 0.5;
      const PAGE_W_PX = PAGE_W_IN * DPI;       // 816
      const PAGE_H_PX = PAGE_H_IN * DPI;       // 1056
      const MARGIN_PX = MARGIN_IN * DPI;        // 48
      const CONTENT_H_PX = PAGE_H_PX - MARGIN_PX * 2; // usable height per page

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: PAGE_W_PX,
        width: PAGE_W_PX,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [PAGE_W_PX, PAGE_H_PX],
        hotfixes: ['px_scaling'],
      });

      // Scale factor: canvas is rendered at scale:2, so canvas.width = 816*2
      const scale = canvas.width / PAGE_W_PX;
      const totalCanvasH = canvas.height;
      const sliceH = CONTENT_H_PX * scale; // how many canvas px go on each page

      let yOffset = 0;
      let pageNum = 0;

      while (yOffset < totalCanvasH) {
        if (pageNum > 0) pdf.addPage();

        // Slice a portion of the canvas
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(sliceH, totalCanvasH - yOffset);
        const ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, -yOffset);

        const sliceData = sliceCanvas.toDataURL('image/png');
        const sliceRenderedH = sliceCanvas.height / scale; // px in PDF coords

        pdf.addImage(
          sliceData,
          'PNG',
          MARGIN_PX,           // left margin
          MARGIN_PX,           // top margin
          PAGE_W_PX - MARGIN_PX * 2,  // content width
          sliceRenderedH,
        );

        // Page number footer
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        const totalPages = Math.ceil(totalCanvasH / sliceH);
        pdf.text(
          `Page ${pageNum + 1} of ${totalPages}`,
          PAGE_W_PX / 2,
          PAGE_H_PX - 14,
          { align: 'center' }
        );

        yOffset += sliceH;
        pageNum++;
      }

      const fileName = (resource?.template_name || 'template').replace(/\s+/g, '_') + '_filled.pdf';
      pdf.save(fileName);
      toast.success('PDF exported — ' + pageNum + ' page' + (pageNum !== 1 ? 's' : ''));
    } catch (err) {
      toast.error('Export failed. Please try again.');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  if (!resource) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 gap-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-[#143A50] text-white rounded-t-lg flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#E5C089]" />
            <div>
              <h2 className="font-bold text-lg leading-tight">{resource.template_name}</h2>
              <p className="text-white/60 text-xs">
                {filledCount}/{totalCount} fields filled
                {totalCount > 0 && filledCount < totalCount && (
                  <span className="ml-2 text-[#E5C089]">— {totalCount - filledCount} remaining</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Tab switcher */}
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  activeTab === 'edit' ? 'bg-white text-[#143A50]' : 'text-white/70 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Fill In
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  activeTab === 'preview' ? 'bg-white text-[#143A50]' : 'text-white/70 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            </div>
            <Button
              onClick={handleExportPDF}
              disabled={exporting}
              className="bg-[#E5C089] hover:bg-[#d4b070] text-[#143A50] font-bold gap-2"
            >
              {exporting ? (
                <><div className="w-4 h-4 border-2 border-[#143A50]/30 border-t-[#143A50] rounded-full animate-spin" />Exporting...</>
              ) : (
                <><Download className="w-4 h-4" />Export PDF</>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left Panel: Field inputs (always visible) */}
          {activeTab === 'edit' && (
            <div className="w-80 flex-shrink-0 border-r bg-slate-50 overflow-y-auto p-5">
              <div className="mb-4">
                <h3 className="font-semibold text-slate-800 text-sm mb-1">Fill In Your Details</h3>
                <p className="text-xs text-slate-500">Replace each placeholder with your organization's information. The preview updates in real-time.</p>
              </div>

              {placeholders.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No placeholders detected in this template.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {placeholders.map(p => (
                    <div key={p.key}>
                      <Label className="text-xs font-semibold text-slate-700 mb-1 block">
                        {p.label}
                        {values[p.key] ? (
                          <Badge className="ml-2 bg-green-100 text-green-700 text-[10px] py-0 px-1.5 border-0">✓</Badge>
                        ) : (
                          <Badge className="ml-2 bg-amber-100 text-amber-700 text-[10px] py-0 px-1.5 border-0">Required</Badge>
                        )}
                      </Label>
                      <Input
                        value={values[p.key] || ''}
                        onChange={(e) => setValues(prev => ({ ...prev, [p.key]: e.target.value }))}
                        placeholder={`Enter ${p.label}...`}
                        className="text-sm border-2 focus:border-[#143A50]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Progress bar */}
              {totalCount > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Progress</span>
                    <span>{filledCount}/{totalCount}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#143A50] rounded-full transition-all duration-300"
                      style={{ width: `${totalCount > 0 ? (filledCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                  {filledCount === totalCount && totalCount > 0 && (
                    <p className="text-xs text-green-600 font-medium mt-2">✓ All fields filled — ready to export!</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right Panel: Document Preview (8.5x11 layout) */}
          <div className="flex-1 overflow-y-auto bg-gray-200 p-6">
            <div className="flex justify-center">
              {/* This outer div simulates the 8.5x11 page */}
              <div
                ref={printRef}
                style={{
                  width: '816px',       // 8.5in * 96dpi
                  minHeight: '1056px',  // 11in * 96dpi
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                  fontFamily: 'Georgia, serif',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Page Header */}
                <div style={{
                  backgroundColor: '#143A50',
                  padding: '20px 48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}>
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png"
                    alt="EIS"
                    style={{ height: '52px', width: 'auto' }}
                    crossOrigin="anonymous"
                  />
                  <div style={{ textAlign: 'right', color: '#E5C089' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>Elbert Innovative Solutions</div>
                    <div style={{ fontSize: '11px', color: 'rgba(229,192,137,0.75)' }}>Funding Readiness Resource Library</div>
                  </div>
                </div>

                {/* Page Content */}
                <div style={{ flex: 1, padding: '48px', fontSize: '13px', lineHeight: '1.7', color: '#1a1a1a' }}>
                  {resource.template_content ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: filledContent }}
                      style={{ maxWidth: '100%' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>
                      <p>No template content available.</p>
                    </div>
                  )}
                </div>

                {/* Page Footer */}
                <div style={{
                  borderTop: '3px solid #143A50',
                  padding: '14px 48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                  backgroundColor: '#f8f9fa',
                }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    © {new Date().getFullYear()} Elbert Innovative Solutions · All Rights Reserved
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    www.elbertinnovativesolutions.org
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}