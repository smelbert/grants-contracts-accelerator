import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, FileText, Landmark, Heart, Building } from 'lucide-react';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import ReadinessIndicator from '@/components/dashboard/ReadinessIndicator';
import FundingLaneCard from '@/components/dashboard/FundingLaneCard';
import QuickActions from '@/components/dashboard/QuickActions';
import GraduationModal from '@/components/graduation/GraduationModal';
import NextBestAction from '@/components/dashboard/NextBestAction';

function calculateReadiness(org) {
  if (!org) return 'pre_funding';
  
  const { stage, governance_status, funding_experience, type } = org;
  
  // Pre-funding: idea stage or no governance
  if (stage === 'idea' || governance_status === 'no_board') {
    return 'pre_funding';
  }
  
  // Scaling: advanced experience and scaling stage
  if (stage === 'scaling' && funding_experience === 'advanced') {
    return 'scaling';
  }
  
  // Contract-ready: operating/scaling with formal board
  if ((stage === 'operating' || stage === 'scaling') && governance_status === 'formal_board' && funding_experience !== 'none') {
    return 'contract_ready';
  }
  
  // Grant-eligible: early/operating with some structure
  if ((stage === 'early' || stage === 'operating') && governance_status !== 'no_board') {
    return 'grant_eligible';
  }
  
  // Relationship building: for-profit or community-based focusing on relationships
  if (type === 'for_profit' || type === 'community_based') {
    return 'relationship_building';
  }
  
  return 'pre_funding';
}

function calculateLaneProgress(org, lane) {
  if (!org) return 0;
  
  let progress = 0;
  const checks = {
    grants: [
      org.type === 'nonprofit',
      org.governance_status === 'formal_board',
      org.mission_statement,
      org.programs_description,
      org.funding_experience !== 'none',
    ],
    contracts: [
      org.governance_status === 'formal_board',
      org.stage === 'operating' || org.stage === 'scaling',
      org.annual_budget !== 'under_25k',
      org.staff_structure !== 'all_volunteer',
      org.ein_number,
    ],
    donors: [
      org.mission_statement,
      org.programs_description,
      org.target_population,
      org.website,
    ],
    public_funds: [
      org.city && org.state,
      org.programs_description,
      org.target_population,
      org.geographic_reach,
    ],
  };
  
  const laneChecks = checks[lane] || [];
  const completed = laneChecks.filter(Boolean).length;
  return Math.round((completed / laneChecks.length) * 100);
}

export default function HomePage() {
  const queryClient = useQueryClient();
  const [showGraduation, setShowGraduation] = useState(false);
  const [graduationType, setGraduationType] = useState(null);
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const createOrgMutation = useMutation({
    mutationFn: (data) => base44.entities.Organization.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['organizations']);
    },
  });

  const organization = organizations?.[0];
  const needsOnboarding = !orgsLoading && (!organizations || organizations.length === 0 || !organization?.onboarding_completed);

  // Check for graduation moments
  useEffect(() => {
    if (organization?.readiness_status) {
      const hasSeenGraduation = localStorage.getItem(`graduation_${organization.id}_${organization.readiness_status}`);
      if (!hasSeenGraduation && (organization.readiness_status === 'grant_eligible' || organization.readiness_status === 'contract_ready')) {
        setGraduationType(organization.readiness_status);
        setShowGraduation(true);
        localStorage.setItem(`graduation_${organization.id}_${organization.readiness_status}`, 'true');
      }
    }
  }, [organization?.readiness_status, organization?.id]);

  const handleOnboardingComplete = async (data) => {
    const readinessStatus = calculateReadiness(data);
    await createOrgMutation.mutateAsync({
      ...data,
      readiness_status: readinessStatus,
      onboarding_completed: true,
    });
  };

  if (userLoading || orgsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (needsOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  const readinessStatus = organization?.readiness_status || calculateReadiness(organization);

  return (
    <>
      <GraduationModal 
        isOpen={showGraduation} 
        onClose={() => setShowGraduation(false)}
        graduationType={graduationType}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Welcome back, {organization?.name}
          </h1>
          <p className="text-slate-500 mt-1">Your funding readiness dashboard</p>
        </motion.div>

        {/* Readiness Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <ReadinessIndicator status={readinessStatus} />
        </motion.div>

        {/* Next Best Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <NextBestAction readinessStatus={readinessStatus} />
        </motion.div>

        {/* Funding Lanes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Funding Pathways</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FundingLaneCard
              lane="grants"
              icon={FileText}
              isAccessible={organization?.interest_areas?.includes('grants')}
              progress={calculateLaneProgress(organization, 'grants')}
            />
            <FundingLaneCard
              lane="contracts"
              icon={Landmark}
              isAccessible={organization?.interest_areas?.includes('contracts')}
              progress={calculateLaneProgress(organization, 'contracts')}
            />
            <FundingLaneCard
              lane="donors"
              icon={Heart}
              isAccessible={organization?.interest_areas?.includes('donors')}
              progress={calculateLaneProgress(organization, 'donors')}
            />
            <FundingLaneCard
              lane="public_funds"
              icon={Building}
              isAccessible={organization?.interest_areas?.includes('public_funds')}
              progress={calculateLaneProgress(organization, 'public_funds')}
            />
          </div>
        </motion.div>

        {/* Educational Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200"
        >
          <h3 className="font-semibold text-slate-900 mb-2">Building for Success</h3>
          <p className="text-sm text-slate-600">
            This platform prioritizes readiness over rushing. We'll help you build the infrastructure, 
            documentation, and relationships needed for sustainable funding—not quick fixes that could 
            harm your reputation or waste your time.
          </p>
        </motion.div>
        </div>
      </div>
    </>
  );
}