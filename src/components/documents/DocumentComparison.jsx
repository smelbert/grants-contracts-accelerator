import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';

export default function DocumentComparison({ version1, version2, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-bold text-slate-900">
              Version Comparison
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Comparison Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-200 h-full">
            {/* Version 1 */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-slate-100">
                  Version {version1?.version_number || 1}
                </Badge>
                <span className="text-xs text-slate-500">
                  {version1?.created_date && format(new Date(version1.created_date), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  {version1?.content || 'No content'}
                </pre>
              </div>
            </div>

            {/* Version 2 */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-emerald-100 text-emerald-700">
                  Version {version2?.version_number || 2}
                </Badge>
                <span className="text-xs text-slate-500">
                  {version2?.created_date && format(new Date(version2.created_date), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  {version2?.content || 'No content'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}