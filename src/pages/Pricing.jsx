import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Pricing & Monetization</h1>
          <p className="text-slate-600">Manage platform pricing and subscription tiers</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-red-600" />
                Subscription Tiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Configure pricing for base, mid, and premium tiers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                Review Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Set pricing for document reviews and coaching sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-red-600" />
                Bundles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Create and manage service bundles</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}