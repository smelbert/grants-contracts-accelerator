/**
 * AssessmentQRCodes
 * Generates QR codes for each assessment/evaluation URL so facilitators
 * can embed them in PowerPoint slides for real-time in-session scanning.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';

const QR_PAGES = [
  {
    id: 'pre',
    label: 'Pre-Assessment',
    description: 'Share at the START of the program — Day 1',
    path: '/IncubateHerPreAssessment',
    color: '#3b82f6',
    badge: 'Day 1 — Before Training'
  },
  {
    id: 'post',
    label: 'Post-Assessment',
    description: 'Share at the END of the program — Day 2',
    path: '/IncubateHerPostAssessment',
    color: '#22c55e',
    badge: 'Day 2 — After Training'
  },
  {
    id: 'eval',
    label: 'Program Evaluation',
    description: 'Share on the final day for feedback',
    path: '/IncubateHerEvaluation',
    color: '#a855f7',
    badge: 'Final Day — Feedback'
  },
  {
    id: 'profile',
    label: 'My Profile / Registration',
    description: 'Participants complete their org profile',
    path: '/IncubateHerProfileIntake',
    color: '#f59e0b',
    badge: 'Onboarding'
  }
];

function QRCodeBox({ page, baseUrl }) {
  const canvasRef = useRef(null);
  const [qrLoaded, setQrLoaded] = useState(false);
  const fullUrl = `${baseUrl}${page.path}`;

  useEffect(() => {
    // Use the free QR API to generate QR codes (no npm needed)
    setQrLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 200;
      ctx.drawImage(img, 0, 0, 200, 200);
      setQrLoaded(true);
    };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullUrl)}&margin=10`;
  }, [fullUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `QR_${page.label.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link copied!');
  };

  return (
    <Card className="flex flex-col" style={{ borderTop: `4px solid ${page.color}` }}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base" style={{ color: page.color }}>{page.label}</CardTitle>
          <Badge className="text-xs whitespace-nowrap" style={{ backgroundColor: page.color + '20', color: page.color }}>
            {page.badge}
          </Badge>
        </div>
        <p className="text-xs text-slate-500">{page.description}</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 flex-1">
        <div className="relative w-[200px] h-[200px] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
          {!qrLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            </div>
          )}
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>

        <div className="w-full">
          <p className="text-xs text-slate-400 break-all text-center mb-2">{fullUrl}</p>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs"
            >
              <Copy className="w-3 h-3" /> Copy Link
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={!qrLoaded}
              className="flex items-center gap-1 text-xs text-white"
              style={{ backgroundColor: page.color }}
            >
              <Download className="w-3 h-3" /> Download QR
            </Button>
            <a href={page.path} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost" className="flex items-center gap-1 text-xs">
                <ExternalLink className="w-3 h-3" /> Open
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AssessmentQRCodes() {
  const baseUrl = window.location.origin;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <QrCode className="w-5 h-5 text-slate-600" />
        <div>
          <h3 className="font-semibold text-slate-800">QR Codes for PowerPoint Slides</h3>
          <p className="text-sm text-slate-500">Download and paste into your slides so participants can scan to open each form directly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {QR_PAGES.map(page => (
          <QRCodeBox key={page.id} page={page} baseUrl={baseUrl} />
        ))}
      </div>

      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
        <strong>Tip:</strong> The Pre-Assessment QR code should go on your opening slide. The Post-Assessment on your Day 2 closing slide. Evaluation on the very last slide. Participants scan with their phone camera — no app needed.
      </div>
    </div>
  );
}