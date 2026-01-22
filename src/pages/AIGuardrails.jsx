import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import AIGuardrailsNotice from '@/components/boilerplate/AIGuardrailsNotice';

export default function AIGuardrailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Guardrails</h1>
          <p className="text-slate-600">Configure AI safety and compliance controls</p>
        </motion.div>

        <div className="space-y-6">
          <AIGuardrailsNotice mode="ethical" />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Allowed Outputs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Configure what AI can and cannot generate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Required Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Manage disclaimers shown with AI-generated content</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}