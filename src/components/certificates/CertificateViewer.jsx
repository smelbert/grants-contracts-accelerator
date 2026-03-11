import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer, X } from 'lucide-react';

export default function CertificateViewer({ htmlContent, certificateNumber, onClose }) {
  const iframeRef = useRef(null);

  const handlePrint = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };

  const handleDownloadHTML = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${certificateNumber || 'download'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex flex-col">
      <div className="flex items-center justify-between bg-white px-6 py-3 border-b shadow">
        <h2 className="text-lg font-semibold text-slate-800">Certificate Preview</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleDownloadHTML}>
            <Download className="w-4 h-4 mr-1" /> Save as HTML
          </Button>
          <Button size="sm" onClick={handlePrint} className="bg-[#143A50] text-white">
            <Printer className="w-4 h-4 mr-1" /> Print / Save PDF
          </Button>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 bg-slate-200 overflow-auto p-6 flex items-start justify-center">
        <div className="shadow-2xl w-full max-w-5xl bg-white">
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            className="w-full border-0"
            style={{ height: '600px' }}
            title="Certificate Preview"
          />
        </div>
      </div>
    </div>
  );
}