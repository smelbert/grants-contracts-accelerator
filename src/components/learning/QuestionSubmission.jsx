import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuestionSubmission({ learningContentId, user }) {
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (questionText) => {
      return await base44.entities.LearningFeedback.create({
        learning_content_id: learningContentId,
        feedback_type: 'question',
        message: questionText,
        author_email: user.email,
        author_name: user.full_name || user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningFeedback', learningContentId] });
      setQuestion('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  });

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          Have a Question?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-emerald-900">Question submitted!</p>
              <p className="text-sm text-slate-600 mt-2">Our coaches will respond soon.</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Textarea
                placeholder="Ask anything about this content... Our coaches are here to help!"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <Button
                onClick={() => submitMutation.mutate(question)}
                disabled={!question.trim() || submitMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitMutation.isPending ? 'Sending...' : 'Send Question'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}