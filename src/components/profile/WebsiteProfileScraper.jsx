import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const WebsiteProfileScraper = ({ onDataExtracted }) => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleScrape = async () => {
    if (!websiteUrl.trim()) {
      setError('Please enter a website URL');
      return;
    }

    // Validate URL format
    try {
      new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com or example.com)');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await base44.functions.invoke('scrapeWebsiteProfile', {
        website_url: websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`
      });

      if (response.data.success && response.data.profile_data) {
        setSuccess(true);
        onDataExtracted(response.data.profile_data);
        toast.success('Profile data extracted! Review and edit as needed.');
        setWebsiteUrl('');
      } else {
        setError('No profile data could be extracted from this website');
      }
    } catch (err) {
      setError(err.message || 'Failed to extract profile data from website');
      toast.error('Failed to scrape website');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Auto-fill Profile from Website</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Enter your organization's website and we'll automatically extract key information to fill in your profile.
        </p>

        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com or example.com"
            value={websiteUrl}
            onChange={(e) => {
              setWebsiteUrl(e.target.value);
              setError(null);
            }}
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleScrape}
            disabled={loading || !websiteUrl.trim()}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scraping...
              </>
            ) : (
              'Scrape Website'
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✓ Profile data extracted successfully! Scroll down to review and edit.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default WebsiteProfileScraper;