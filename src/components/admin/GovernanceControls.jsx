import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Lock, AlertTriangle, Check, Users, Sparkles } from 'lucide-react';

export default function GovernanceControls() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [ethicalMode, setEthicalMode] = useState('strict');

  return (
    <div className="space-y-6">
      {/* Platform Protection Notice */}
      <Alert className="bg-emerald-50 border-emerald-200">
        <Shield className="w-4 h-4 text-emerald-600" />
        <AlertDescription className="text-emerald-700">
          <strong>Platform Governance:</strong> These controls protect your reputation and user trust. 
          Changes here affect all users globally.
        </AlertDescription>
      </Alert>

      {/* AI Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>AI Content Generation</Label>
              <p className="text-sm text-slate-600">Allow users to generate boilerplate content</p>
            </div>
            <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Ethical Mode</Label>
              <p className="text-sm text-slate-600">Controls AI warnings and disclaimers</p>
            </div>
            <select
              value={ethicalMode}
              onChange={(e) => setEthicalMode(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="strict">Strict (More warnings)</option>
              <option value="balanced">Balanced</option>
              <option value="minimal">Minimal (Fewer warnings)</option>
            </select>
          </div>

          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-700">
              Disabling AI or reducing ethical warnings may increase compliance risk.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Coach Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Coach Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Sarah Johnson</p>
                <p className="text-sm text-slate-600">Grants specialist • Applied 2 days ago</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Reject</Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
            <p className="text-sm text-slate-500 text-center py-2">No pending approvals</p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            Pricing & Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Document Review', price: 49 },
              { label: 'Proposal Review', price: 149 },
              { label: 'Strategy Session', price: 199 }
            ].map(item => (
              <div key={item.label} className="p-4 border border-slate-200 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">{item.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900">${item.price}</span>
                  <Button size="sm" variant="ghost">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ethical Flags Audit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Recent Ethical Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-4">No recent flags</p>
        </CardContent>
      </Card>
    </div>
  );
}