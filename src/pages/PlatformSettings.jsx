import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Bell, FileText, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlatformSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Platform Settings</h1>
          <p className="text-slate-600">Global platform configuration</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-red-600" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Configure platform branding and appearance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-600" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Manage global notification settings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                Legal & Disclosures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Update terms of service and privacy policy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-600" />
                Data & Exports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Manage data exports and backups</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}