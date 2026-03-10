import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function EligibilityAnalyzer({ organization, fundingOpportunities }) {
  const [selectedLane, setSelectedLane] = useState('grants');
  const [showResults, setShowResults] = useState(false);

  if (!organization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Grant Eligibility Analyzer
          </CardTitle>
          <CardDescription>Find grants you may qualify for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">Complete your organization profile to analyze eligibility</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Simple eligibility logic based on organization type and funding lane
  const evaluateEligibility = () => {
    const eligible = [];
    const notYetEligible = [];

    fundingOpportunities
      .filter(opp => opp.funding_lane === selectedLane)
      .slice(0, 10)
      .forEach(opp => {
        let isEligible = true;
        const reasons = [];

        // Check organization type requirements
        if (opp.required_org_types && opp.required_org_types.length > 0) {
          if (!opp.required_org_types.includes(organization.organization_type)) {
            isEligible = false;
            reasons.push(`Requires: ${opp.required_org_types.join(', ')}`);
          }
        }

        // Check stage requirements
        if (opp.required_stages && opp.required_stages.length > 0) {
          const orgStage = organization.grant_experience_level || 'beginner';
          if (!opp.required_stages.includes(orgStage)) {
            isEligible = false;
            reasons.push(`Experience level required: ${opp.required_stages.join(', ')}`);
          }
        }

        // Check geographic requirements
        if (opp.geographic_restrictions && organization.geographic_service_area) {
          if (!opp.geographic_restrictions.includes(organization.geographic_service_area)) {
            isEligible = false;
            reasons.push(`Geographic restriction: ${opp.geographic_restrictions}`);
          }
        }

        // Check funding amount match
        if (opp.amount_min && opp.amount_max) {
          const orgBudget = parseInt(organization.annual_budget) || 0;
          if (orgBudget > opp.amount_max) {
            isEligible = false;
            reasons.push(`Exceeds max funding: ${opp.amount_max}`);
          }
        }

        if (isEligible) {
          eligible.push({ ...opp, reasons });
        } else {
          notYetEligible.push({ ...opp, reasons });
        }
      });

    return { eligible, notYetEligible };
  };

  const results = evaluateEligibility();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Grant Eligibility Analyzer
        </CardTitle>
        <CardDescription>Find grants you may qualify for based on your profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Funding Type</label>
          <Select value={selectedLane} onValueChange={(val) => { setSelectedLane(val); setShowResults(false); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grants">Grants</SelectItem>
              <SelectItem value="contracts">Contracts</SelectItem>
              <SelectItem value="donors">Donors</SelectItem>
              <SelectItem value="public_funds">Public Funds</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setShowResults(!showResults)}
          className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
        >
          Analyze Eligibility
        </Button>

        {showResults && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            {/* You May Qualify For */}
            {results.eligible.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-slate-900">You may qualify for ({results.eligible.length})</h3>
                </div>
                <div className="space-y-2">
                  {results.eligible.map((opp) => (
                    <div key={opp.id} className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <p className="font-medium text-slate-900 text-sm line-clamp-1">{opp.title}</p>
                      {opp.amount_min && (
                        <p className="text-xs text-slate-600 mt-1">
                          ${opp.amount_min.toLocaleString()} - ${opp.amount_max?.toLocaleString() || 'varies'}
                        </p>
                      )}
                      <Badge className="mt-2 bg-emerald-100 text-emerald-700 text-xs">Eligible</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not Yet Eligible */}
            {results.notYetEligible.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-slate-900">Not yet eligible ({results.notYetEligible.length})</h3>
                </div>
                <div className="space-y-2">
                  {results.notYetEligible.slice(0, 5).map((opp) => (
                    <div key={opp.id} className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="font-medium text-slate-900 text-sm line-clamp-1">{opp.title}</p>
                      <div className="mt-2 space-y-1">
                        {opp.reasons && opp.reasons.map((reason, idx) => (
                          <p key={idx} className="text-xs text-red-700">{reason}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}