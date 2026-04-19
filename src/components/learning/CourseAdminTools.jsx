import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Download, Share2, Languages, Loader2, Copy, Check, Link, Clock, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const LANGUAGES = [
  'Spanish', 'French', 'Portuguese', 'Mandarin Chinese', 'Arabic',
  'Hindi', 'German', 'Italian', 'Japanese', 'Korean', 'Swahili', 'Haitian Creole'
];

export default function CourseAdminTools({ course, lessonIndex }) {
  const [exporting, setExporting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [translateOpen, setTranslateOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [learnerEmail, setLearnerEmail] = useState('');
  const [learnerName, setLearnerName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: shareLinks = [], refetch: refetchLinks } = useQuery({
    queryKey: ['shareable-links', course?.id],
    queryFn: () => base44.entities.CourseShareableLink.filter({ course_id: course?.id }, '-created_date', 10),
    enabled: !!course?.id && shareOpen,
  });

  const handleExportPDF = async () => {
    if (!course?.id) return;
    setExporting(true);
    try {
      const response = await base44.functions.invoke('exportCoursePDF', {
        courseId: course.id,
        ...(lessonIndex !== undefined ? { lessonIndex } : {})
      });

      // The response.data is an ArrayBuffer or blob
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: 'application/pdf' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${course.title?.replace(/[^a-z0-9]/gi, '_') || 'course'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF exported successfully');
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleTranslate = async () => {
    if (!targetLanguage) { toast.error('Please select a language'); return; }
    setTranslating(true);
    try {
      const res = await base44.functions.invoke('translateCourse', {
        courseId: course.id,
        targetLanguage
      });
      toast.success(`Course translated to ${targetLanguage}! New draft created: "${res.data.title}"`);
      setTranslateOpen(false);
      setTargetLanguage('');
    } catch (error) {
      toast.error(`Translation failed: ${error.message}`);
    } finally {
      setTranslating(false);
    }
  };

  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    try {
      const res = await base44.functions.invoke('generateShareableLink', {
        courseId: course.id,
        learnerEmail: learnerEmail || undefined,
        learnerName: learnerName || undefined,
        expiresInDays: expiresInDays ? parseInt(expiresInDays) : undefined
      });
      const appUrl = window.location.origin;
      const link = `${appUrl}/CourseViewer?token=${res.data.token}`;
      setGeneratedLink(link);
      refetchLinks();
      toast.success('Shareable link created');
    } catch (error) {
      toast.error(`Failed to generate link: ${error.message}`);
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeactivateLink = async (linkId) => {
    await base44.entities.CourseShareableLink.update(linkId, { is_active: false });
    refetchLinks();
    toast.success('Link deactivated');
  };

  if (!course) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* PDF Export */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleExportPDF}
        disabled={exporting}
        className="h-8 text-xs gap-1.5"
      >
        {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        {lessonIndex !== undefined ? 'Export Lesson PDF' : 'Export PDF'}
      </Button>

      {/* Translate */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setTranslateOpen(true)}
        className="h-8 text-xs gap-1.5"
      >
        <Languages className="w-3.5 h-3.5" />
        Translate
      </Button>

      {/* Shareable Link */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShareOpen(true)}
        className="h-8 text-xs gap-1.5"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share Link
      </Button>

      {/* Translate Dialog */}
      <Dialog open={translateOpen} onOpenChange={setTranslateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-blue-600" />
              Translate Course
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-slate-600">
              AI will create a new copy of <strong>"{course.title}"</strong> translated into the selected language. The original course is not modified.
            </p>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Target Language</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language..." />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setTranslateOpen(false)}>Cancel</Button>
              <Button
                onClick={handleTranslate}
                disabled={translating || !targetLanguage}
                className="bg-[#143A50] hover:bg-[#1E4F58]"
              >
                {translating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Translating...</> : 'Translate Course'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Link Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-green-600" />
              Generate Shareable Link
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-slate-600">
              Create a unique, trackable link for <strong>"{course.title}"</strong> to share with a specific learner.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block flex items-center gap-1">
                  <User className="w-3 h-3" /> Learner Name (optional)
                </label>
                <Input
                  placeholder="Jane Smith"
                  value={learnerName}
                  onChange={e => setLearnerName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Learner Email (optional)</label>
                <Input
                  placeholder="jane@example.com"
                  value={learnerEmail}
                  onChange={e => setLearnerEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block flex items-center gap-1">
                <Clock className="w-3 h-3" /> Expires in (days, optional)
              </label>
              <Input
                placeholder="e.g. 30"
                type="number"
                value={expiresInDays}
                onChange={e => setExpiresInDays(e.target.value)}
                className="w-32"
              />
            </div>

            {generatedLink && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-700 font-medium mb-2">Link generated!</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white border border-green-200 rounded px-2 py-1 flex-1 truncate">{generatedLink}</code>
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(generatedLink)} className="h-7 w-7 p-0 flex-shrink-0">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={handleGenerateLink}
              disabled={generatingLink}
              className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
            >
              {generatingLink ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Link className="w-4 h-4 mr-2" />Generate New Link</>}
            </Button>

            {/* Existing links */}
            {shareLinks.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Previous Links</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {shareLinks.map(link => {
                    const appUrl = window.location.origin;
                    const linkUrl = `${appUrl}/CourseViewer?token=${link.token}`;
                    return (
                      <div key={link.id} className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${link.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {link.learner_name && <span className="font-medium text-slate-800">{link.learner_name}</span>}
                            {link.learner_email && <span className="text-slate-500">{link.learner_email}</span>}
                            {!link.learner_name && !link.learner_email && <span className="text-slate-400 italic">Anonymous</span>}
                            <Badge className={`text-xs ${link.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                              {link.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-slate-400">{link.open_count || 0} opens</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleCopy(linkUrl)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                        {link.is_active && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs text-red-500 hover:text-red-700 px-1"
                            onClick={() => handleDeactivateLink(link.id)}
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}