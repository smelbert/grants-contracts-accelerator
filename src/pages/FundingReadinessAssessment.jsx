import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { STRUCTURES, ACKNOWLEDGMENTS } from '@/lib/assessmentConfig';
import { itemApplies, getTrackLevelItems, computeResults } from '@/lib/assessmentScoring';
import ProgressBar from '@/components/assessment-wizard/ProgressBar';
import TrackStep from '@/components/assessment-wizard/TrackStep';
import ContactStep from '@/components/assessment-wizard/ContactStep';
import OrgProfileStep from '@/components/assessment-wizard/OrgProfileStep';
import ChecklistStep from '@/components/assessment-wizard/ChecklistStep';
import AcknowledgmentsStep from '@/components/assessment-wizard/AcknowledgmentsStep';
import ResultsView from '@/components/assessment-wizard/ResultsView';

function buildSteps(track, structure, allItems) {
  const steps = [
    { type: 'track', label: 'Choose your track' },
    { type: 'contact', label: 'Your contact information' },
    { type: 'org_profile', label: 'Organization profile' },
  ];

  if (track && structure && allItems.length > 0) {
    const trackKeys = track === 'both' ? ['grant', 'proposal'] : [track === 'proposals' ? 'proposal' : track];
    trackKeys.forEach(t => {
      for (let level = 1; level <= 3; level++) {
        const items = getTrackLevelItems(allItems, t, level, structure);
        if (items.length > 0) {
          steps.push({
            type: 'checklist',
            trackKey: t,
            level,
            items,
            label: `Level ${level} of 3 · ${items[0]?.level_name || ''}`,
          });
        }
      }
    });
  }

  steps.push({ type: 'acknowledgments', label: 'Acknowledgments' });
  return steps;
}

export default function FundingReadinessAssessment() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('wizard');
  const [allItems, setAllItems] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [track, setTrack] = useState('');
  const [form, setForm] = useState({ outreach_preference: 'results_only' });
  const [responses, setResponses] = useState({});
  const [acknowledgments, setAcknowledgments] = useState({});
  const [startTime] = useState(Date.now());
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        const items = await base44.entities.AssessmentItem.list('sort_order', 200);
        setAllItems(items);

        // Pre-fill form from user profile
        setForm(prev => ({
          ...prev,
          first_name: user.full_name?.split(' ')[0] || '',
          last_name: user.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
        }));

        // Check for existing assessment
        const existing = await base44.entities.FundingReadinessAssessment.filter(
          { user_email: user.email },
          '-created_date',
          1
        );
        if (existing.length > 0 && existing[0].results_data) {
          setResults({ ...existing[0].results_data, structure: existing[0].structure });
          setView('results');
        }
      } catch (err) {
        console.error('Assessment load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const steps = useMemo(() => buildSteps(track, form.structure, allItems), [track, form.structure, allItems]);

  const canProceed = () => {
    const step = steps[currentStep];
    if (!step) return false;
    switch (step.type) {
      case 'track': return !!track;
      case 'contact': return !!(form.first_name && form.last_name && form.email && form.organization && form.consent);
      case 'org_profile': return !!form.structure;
      case 'checklist': return true;
      case 'acknowledgments': return ACKNOWLEDGMENTS.every((_, i) => acknowledgments[i]);
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleToggleResponse = (itemId) => {
    setResponses(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleToggleAck = (index) => {
    setAcknowledgments(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const computed = computeResults(allItems, responses, track, form.structure, form);
      const minutesTaken = Math.max(1, Math.round((Date.now() - startTime) / 60000));

      const assessmentData = {
        user_email: user.email,
        track,
        structure: form.structure,
        first_name: form.first_name,
        last_name: form.last_name,
        organization: form.organization,
        website: form.website,
        phone: form.phone,
        role: form.role,
        heard_about: form.heard_about,
        outreach_preference: form.outreach_preference,
        years: form.years,
        budget: form.budget,
        funding_sources: form.funding_sources,
        largest_award: form.largest_award,
        federal_experience: form.federal_experience,
        target_amount: form.target_amount,
        timeline: form.timeline,
        proposal_writer: form.proposal_writer,
        assessment_responses: responses,
        acknowledgments,
        grant_percent: computed.trackResults.grant?.percent,
        grant_earned: computed.trackResults.grant?.earned,
        grant_available: computed.trackResults.grant?.available,
        grant_l1: computed.trackResults.grant?.levelScores[0]?.scoreString,
        grant_l2: computed.trackResults.grant?.levelScores[1]?.scoreString,
        grant_l3: computed.trackResults.grant?.levelScores[2]?.scoreString,
        grant_band: computed.trackResults.grant?.band?.label,
        proposal_percent: computed.trackResults.proposal?.percent,
        proposal_earned: computed.trackResults.proposal?.earned,
        proposal_available: computed.trackResults.proposal?.available,
        proposal_l1: computed.trackResults.proposal?.levelScores[0]?.scoreString,
        proposal_l2: computed.trackResults.proposal?.levelScores[1]?.scoreString,
        proposal_l3: computed.trackResults.proposal?.levelScores[2]?.scoreString,
        proposal_band: computed.trackResults.proposal?.band?.label,
        holds: computed.holds,
        open_items: computed.openItems,
        recommended_documents: computed.recommendedDocs,
        next_steps: computed.nextSteps,
        minutes_taken: minutesTaken,
        assessment_date: new Date().toISOString(),
        results_data: computed,
      };

      await base44.entities.FundingReadinessAssessment.create(assessmentData);
      setResults({ ...computed, first_name: form.first_name, last_name: form.last_name, organization: form.organization, structure: form.structure });
      setView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Assessment save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRetake = () => {
    setView('wizard');
    setCurrentStep(0);
    setTrack('');
    setForm({ outreach_preference: 'results_only' });
    setResponses({});
    setAcknowledgments({});
    setResults(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F4EF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#143A50]" />
      </div>
    );
  }

  if (view === 'results' && results) {
    return <ResultsView results={results} onRetake={handleRetake} />;
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-[#F9F4EF]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-2xl border border-[#E5C089]/30 shadow-sm p-6 sm:p-8">
          <ProgressBar
            currentStep={currentStep}
            totalSteps={steps.length}
            stepLabel={step?.label || ''}
          />

          <div className="mt-6">
            {step?.type === 'track' && <TrackStep track={track} onSelect={setTrack} />}
            {step?.type === 'contact' && <ContactStep form={form} setForm={setForm} />}
            {step?.type === 'org_profile' && <OrgProfileStep form={form} setForm={setForm} />}
            {step?.type === 'checklist' && (
              <ChecklistStep
                items={step.items}
                level={step.level}
                trackKey={step.trackKey}
                responses={responses}
                onToggle={handleToggleResponse}
                allItems={allItems}
                structure={form.structure}
              />
            )}
            {step?.type === 'acknowledgments' && (
              <AcknowledgmentsStep acknowledgments={acknowledgments} onToggle={handleToggleAck} />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0 || saving}
              className="text-slate-500 hover:text-[#143A50]"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || saving}
              className="bg-[#143A50] hover:bg-[#1E4F58] text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {saving ? 'Saving…' : isLastStep ? 'See My Results' : 'Continue'}
              {!saving && !isLastStep && <ArrowRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}