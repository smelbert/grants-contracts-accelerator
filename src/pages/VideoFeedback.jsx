import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoFeedbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Video Feedback</h1>
          <p className="text-slate-600">Record and manage video feedback for organizations</p>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-green-600" />
              Video Feedback Center
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">Video feedback is available when reviewing documents</p>
            <p className="text-sm text-slate-500">Navigate to Review Queue to provide video feedback on specific documents</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}