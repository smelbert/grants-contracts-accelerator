import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EthicsCompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ethics & Compliance</h1>
          <p className="text-slate-600">Brand protection and ethical oversight</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Flagged Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-slate-600">No flagged activity to review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Review platform activity and coach feedback quality</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Ethics Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Update platform ethics and compliance policies</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}