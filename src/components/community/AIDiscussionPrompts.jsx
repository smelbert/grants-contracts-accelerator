import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Sparkles, MessageSquare, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIDiscussionPrompts({ spaceType, spaceName }) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  useEffect(() => {
    generatePrompts();
  }, [spaceName]);

  const generatePrompts = async () => {
    setLoading(true);
    try {
      const promptContext = spaceType === 'course' 
        ? 'learning activities, skill development, and knowledge sharing'
        : 'coaching insights, mentorship experiences, and growth challenges';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 engaging discussion prompts for "${spaceName}" focused on ${promptContext}. Each should spark meaningful conversation and peer learning. Keep each prompt to 1-2 sentences and make them thought-provoking.

Format as JSON:
{
  "prompts": ["prompt 1", "prompt 2", "prompt 3"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            prompts: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setPrompts(result.prompts || []);
    } catch (error) {
      console.error('Failed to generate prompts:', error);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-[#E5C089]/30">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#143A50]" />
        </CardContent>
      </Card>
    );
  }

  if (!prompts || prompts.length === 0) return null;

  return (
    <Card className="border-[#E5C089]/30 bg-gradient-to-br from-[#143A50]/5 to-[#AC1A5B]/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#AC1A5B]" />
            <CardTitle className="text-lg">Discussion Starters</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={generatePrompts}
            className="text-[#143A50]"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {prompts.map((prompt, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedPrompt === idx
                    ? 'bg-[#143A50] text-white border-[#143A50]'
                    : 'bg-white border-slate-200 hover:border-[#143A50]/30'
                }`}
                onClick={() => setSelectedPrompt(selectedPrompt === idx ? null : idx)}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className={`w-4 h-4 mt-1 flex-shrink-0 ${
                    selectedPrompt === idx ? 'text-[#E5C089]' : 'text-[#143A50]'
                  }`} />
                  <p className={`text-sm ${
                    selectedPrompt === idx ? 'text-white' : 'text-slate-700'
                  }`}>
                    {prompt}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {selectedPrompt !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4"
          >
            <Button className="w-full bg-[#143A50] hover:bg-[#1E4F58]">
              <MessageSquare className="w-4 h-4 mr-2" />
              Start Discussion with This Prompt
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}