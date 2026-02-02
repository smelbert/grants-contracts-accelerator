import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIThreadSummary({ discussionId, repliesCount }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const generateSummary = async () => {
    if (summary) {
      setExpanded(!expanded);
      return;
    }

    setLoading(true);
    try {
      const { data: replies } = await base44.entities.DiscussionReply.filter({ discussion_id: discussionId });
      
      const threadContent = replies.map(r => `${r.author_name}: ${r.content}`).join('\n\n');
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this discussion thread in 2-3 concise bullet points highlighting key insights, consensus, and action items:\n\n${threadContent}`,
      });

      setSummary(result);
      setExpanded(true);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (repliesCount < 5) return null;

  return (
    <div className="mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={generateSummary}
        disabled={loading}
        className="text-[#143A50] border-[#E5C089] hover:bg-[#E5C089]/10"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Summary...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            {summary ? (expanded ? 'Hide' : 'Show') : 'AI Summary'} ({repliesCount} replies)
            {summary && (expanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />)}
          </>
        )}
      </Button>

      <AnimatePresence>
        {summary && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="mt-3 p-4 bg-gradient-to-br from-[#E5C089]/5 to-[#143A50]/5 border-[#E5C089]/30">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#143A50] mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-[#143A50]">AI Thread Summary</p>
              </div>
              <div className="text-sm text-slate-700 whitespace-pre-line pl-6">
                {summary}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}