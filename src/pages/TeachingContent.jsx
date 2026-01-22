import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeachingContentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Teaching & Content</h1>
          <p className="text-slate-600">Manage your classes, labs, and teaching materials</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                Classes I Teach
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-slate-500">No classes scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Teaching Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-slate-500">No upcoming sessions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}