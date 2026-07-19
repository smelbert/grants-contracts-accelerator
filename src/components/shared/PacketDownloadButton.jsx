import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, Loader2, Archive } from 'lucide-react';

/**
 * Reusable button that sends an array of { name, html } items to the
 * exportPacket backend function and downloads the resulting ZIP (or single PDF).
 *
 * Props:
 *  - items: Array<{ name: string, html: string }>
 *  - zipName: string (name of the ZIP file without .zip)
 *  - label: string (button text)
 *  - icon: optional icon component
 *  - variant, size, className: standard Button props
 */
export default function PacketDownloadButton({
  items,
  zipName = 'packet',
  label = 'Download Packet',
  icon: Icon = Archive,
  ...buttonProps
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!items || items.length === 0) {
      toast.error('No items to download');
      return;
    }

    setDownloading(true);
    try {
      const res = await base44.functions.invoke('exportPacket', { items, zipName });
      const blob = new Blob([res.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${zipName.replace(/\s+/g, '_')}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${items.length} document${items.length !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Packet download error:', error);
      toast.error('Download failed: ' + (error.message || 'Unknown error'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={downloading} {...buttonProps}>
      {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Icon className="w-4 h-4 mr-2" />}
      {downloading ? 'Preparing...' : label}
    </Button>
  );
}