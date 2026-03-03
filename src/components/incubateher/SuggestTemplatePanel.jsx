import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lightbulb, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SuggestTemplatePanel({ userEmail, userName, context = 'documents' }) {
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!templateName) return;
    setLoading(true);
    try {
      await base44.entities.LearningRequest.create({
        user_email: userEmail,
        user_name: userName,
        request_type: 'template_suggestion',
        title: templateName,
        description,
        context,
        status: 'pending',
      });
      // Notify admin via email
      await base44.integrations.Core.SendEmail({
        to: 'charles@elbertinnovativesolutions.org',
        subject: `Template Suggestion from ${userName || userEmail}`,
        body: `A participant has suggested a new template/resource:\n\nName: ${templateName}\n\nDescription: ${description}\n\nContext: ${context}\n\nFrom: ${userName || userEmail} (${userEmail})`,
      });
      setSubmitted(true);
      setTemplateName('');
      setDescription('');
    } catch (err) {
      toast.error('Could not submit suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-[#E5C089] bg-[#E5C089]/5 mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-[#143A50] text-lg">
          <Lightbulb className="w-5 h-5 text-[#E5C089]" />
          Suggest a Template or Resource
        </CardTitle>
        <p className="text-sm text-slate-600">
          Don't see what you need? Let us know and we'll add it!
        </p>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="flex items-center gap-3 text-green-700 py-4">
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <p className="font-semibold">Suggestion submitted!</p>
              <p className="text-sm text-slate-600">We'll review it and add it to the library soon.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSubmitted(false)} className="ml-auto">
              Suggest Another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-sm">What template or resource do you need? *</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Grant Budget Spreadsheet, Logic Model Template..."
                required
              />
            </div>
            <div>
              <Label className="text-sm">More details (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What would you use it for? Any specific format or content you need?"
                rows={3}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !templateName}
              className="bg-[#143A50] hover:bg-[#1E4F58] text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Submitting...' : 'Submit Suggestion'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}