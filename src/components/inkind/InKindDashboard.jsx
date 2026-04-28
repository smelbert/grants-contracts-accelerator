import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gift, Users, RefreshCcw, AlertTriangle, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';

export default function InKindDashboard({ donations, volunteers, recurring }) {
  const totalFMV = donations.reduce((s, d) => s + (d.total_fmv || 0), 0);
  const totalGaapValue = volunteers.filter(v => v.is_specialized).reduce((s, v) => s + (v.gaap_value || 0), 0);
  const combinedTotal = totalFMV + totalGaapValue;

  const needsAck = donations.filter(d => d.acknowledgment_required && !d.acknowledgment_sent_date);
  const gifts250Plus = donations.filter(d => (d.total_fmv || 0) >= 250);
  const gifts500Plus = donations.filter(d => (d.total_fmv || 0) >= 500);
  const gifts5000Plus = donations.filter(d => (d.total_fmv || 0) >= 5000);
  const activeRecurring = recurring.filter(r => r.status === 'Active');
  const annualRecurringFMV = activeRecurring.reduce((s, r) => s + (r.estimated_annual_fmv || 0), 0);

  const totalVolHours = volunteers.reduce((s, v) => s + (v.hours || 0), 0);
  const specializedHours = volunteers.filter(v => v.is_specialized).reduce((s, v) => s + (v.hours || 0), 0);

  const byCategory = donations.reduce((acc, d) => {
    const cat = d.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (d.total_fmv || 0);
    return acc;
  }, {});

  const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      {needsAck.length > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800 font-medium">
            🚨 {needsAck.length} gift{needsAck.length > 1 ? 's' : ''} require acknowledgment letters but haven't been sent yet. Go to the Acknowledgments tab.
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#143A50]">
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total In-Kind Gifts</p>
            <p className="text-3xl font-bold text-[#143A50]">{donations.length}</p>
            <p className="text-xs text-slate-400 mt-1">logged entries</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total FMV (Goods/Space)</p>
            <p className="text-3xl font-bold text-emerald-700">${totalFMV.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">donor-deductible gifts</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">GAAP Revenue (Spec. Services)</p>
            <p className="text-3xl font-bold text-blue-700">${totalGaapValue.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">per FASB ASU 2020-07</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#E5C089]">
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Combined In-Kind Value</p>
            <p className="text-3xl font-bold text-amber-700">${combinedTotal.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">goods + specialized services</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Active Recurring Gifts</p>
            <p className="text-3xl font-bold text-[#143A50]">{activeRecurring.length}</p>
            <p className="text-xs text-slate-400 mt-1">${annualRecurringFMV.toLocaleString()}/yr projected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Volunteer Hours</p>
            <p className="text-3xl font-bold text-[#143A50]">{totalVolHours}</p>
            <p className="text-xs text-slate-400 mt-1">{specializedHours} specialized hrs</p>
          </CardContent>
        </Card>
        <Card className={needsAck.length > 0 ? 'border-red-300 bg-red-50' : ''}>
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Ack. NOT Sent (⚠️)</p>
            <p className={`text-3xl font-bold ${needsAck.length > 0 ? 'text-red-600' : 'text-green-600'}`}>{needsAck.length}</p>
            <p className="text-xs text-slate-400 mt-1">of {gifts250Plus.length} gifts $250+</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Form 8283 Threshold</p>
            <p className="text-3xl font-bold text-[#143A50]">{gifts500Plus.length}</p>
            <p className="text-xs text-slate-400 mt-1">gifts $500+ (donor files 8283-A)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compliance Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Compliance Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: `Gifts $250+ requiring written acknowledgment`, count: gifts250Plus.length, threshold: true },
              { label: `Acknowledgments NOT yet sent`, count: needsAck.length, flag: needsAck.length > 0 },
              { label: `Gifts $500+ (donor files Form 8283 Section A)`, count: gifts500Plus.length, threshold: true },
              { label: `Gifts $5,000+ (org must sign Form 8283 Section B)`, count: gifts5000Plus.length, threshold: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-700">{item.label}</span>
                <Badge className={item.flag ? 'bg-red-600 text-white' : item.count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
                  {item.count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#143A50]" />
              Top Gift Categories (by FMV)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCategories.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No donations logged yet</p>
            ) : topCategories.map(([cat, fmv]) => {
              const pct = combinedTotal > 0 ? Math.round((fmv / combinedTotal) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{cat}</span>
                    <span className="font-medium text-slate-900">${fmv.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-[#143A50] h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* IRS/GAAP Guidance */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm text-blue-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Why In-Kind Tracking Matters
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            In-kind gifts (non-cash contributions) require the same care as cash gifts — and in some ways more.
            The IRS and FASB have specific rules about what qualifies, how to value it, what donor receipts must say,
            and how it appears on the 990 (Part VIII, Line 1g) and audited financial statements.
          </p>
          <p>
            Getting this right protects donors (so their deduction holds up), protects the organization
            (so the audit/990 is clean), and surfaces the <strong>TRUE total cost</strong> of running the organization
            — useful for fundraising, sustainability planning, and capacity-building grants.
          </p>
          <p className="text-xs text-blue-600">
            <strong>Note for For-Profits / Entrepreneurs:</strong> While IRS 990 and GAAP revenue recognition rules apply
            to nonprofits specifically, tracking in-kind contributions helps any business understand its true cost basis,
            barter/trade value received, and relationship value for reporting purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}