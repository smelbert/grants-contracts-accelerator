import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Sliders } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReadinessLogicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Readiness Logic</h1>
          <p className="text-slate-600">Configure readiness scoring and progression rules</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-red-600" />
                Scoring Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Define how readiness scores are calculated across different funding lanes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-600" />
                Unlock Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Configure what gets unlocked at each readiness stage</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}