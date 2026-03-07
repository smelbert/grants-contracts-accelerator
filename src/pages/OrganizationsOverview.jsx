import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2, Search, Users, Globe, DollarSign,
  MapPin, Phone, Mail, BarChart3, FileText,
  ChevronRight, Star, CheckCircle2, AlertCircle,
  TrendingUp, ExternalLink
} from 'lucide-react';

const READINESS_CONFIG = {
  pre_funding:           { label: 'Pre-Funding',           color: 'bg-slate-100 text-slate-700 border-slate-300' },
  grant_eligible:        { label: 'Grant Eligible',        color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  contract_ready:        { label: 'Contract Ready',        color: 'bg-blue-100 text-blue-800 border-blue-300' },
  relationship_building: { label: 'Relationship Building', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  scaling:               { label: 'Scaling',               color: 'bg-amber-100 text-amber-800 border-amber-300' },
};

const EXP_CONFIG = {
  beginner:     { label: 'Beginner',     color: 'text-slate-500' },
  intermediate: { label: 'Intermediate', color: 'text-blue-600' },
  advanced:     { label: 'Advanced',     color: 'text-emerald-600' },
  expert:       { label: 'Expert',       color: 'text-purple-600' },
};

export default function OrganizationsOverviewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['allOrganizations'],
    queryFn: () => base44.entities.Organization.list('-created_date'),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['allEnrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.list('-created_date'),
  });

  const orgTypes = [...new Set(organizations.map(o => o.organization_type).filter(Boolean))];

  const filtered = organizations.filter(org => {
    const matchSearch = !searchQuery ||
      org.organization_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.primary_contact_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.geographic_service_area?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'all' || org.organization_type === typeFilter;
    return matchSearch && matchType;
  });

  const getEnrollmentForOrg = (org) =>
    enrollments.find(e => e.participant_email === org.primary_contact_email);

  const fmt$ = (v) => {
    if (!v) return null;
    const n = parseInt(v.replace(/\D/g, ''));
    if (isNaN(n)) return v;
    return n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
  };

  const ReadinessChip = ({ status }) => {
    const c = READINESS_CONFIG[status];
    if (!c) return <span className="text-xs text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">Not assessed</span>;
    return <span className={`text-xs border rounded-full px-2 py-0.5 font-medium ${c.color}`}>{c.label}</span>;
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#143A50]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Organizations</h1>
          <p className="text-slate-500">Platform-wide organization oversight — {organizations.length} total</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orgs', value: organizations.length, icon: Building2, color: 'text-[#143A50] bg-[#143A50]/10' },
            { label: 'Grant Eligible', value: organizations.filter(o => o.grant_experience_level === 'advanced' || o.grant_experience_level === 'expert').length, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50' },
            { label: 'With Documents', value: organizations.filter(o => o.has_strategic_plan || o.has_financial_systems).length, icon: FileText, color: 'text-blue-700 bg-blue-50' },
            { label: 'Enrolled in Program', value: enrollments.length, icon: Star, color: 'text-[#AC1A5B] bg-[#AC1A5B]/10' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 min-w-[180px]"
          >
            <option value="all">All Org Types</option>
            {orgTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-semibold text-slate-700 text-lg">No organizations found</p>
            <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((org, index) => {
              const enrollment = getEnrollmentForOrg(org);
              return (
                <motion.div
                  key={org.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Card
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-[#143A50] group"
                    onClick={() => setSelected(selected?.id === org.id ? null : org)}
                  >
                    <CardContent className="p-4">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#143A50]/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-[#143A50]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate group-hover:text-[#143A50] transition-colors">
                            {org.organization_name || 'Unnamed Organization'}
                          </h3>
                          {org.organization_type && (
                            <p className="text-xs text-slate-500 truncate">{org.organization_type}</p>
                          )}
                        </div>
                        {enrollment && (
                          <Badge className="bg-[#AC1A5B]/10 text-[#AC1A5B] border-[#AC1A5B]/20 text-xs shrink-0">
                            Enrolled
                          </Badge>
                        )}
                      </div>

                      {/* Key info */}
                      <div className="space-y-1.5 mb-3">
                        {org.primary_contact_email && (
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 shrink-0" /> {org.primary_contact_email}
                          </p>
                        )}
                        {org.geographic_service_area && (
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0" /> {org.geographic_service_area}
                          </p>
                        )}
                        {org.annual_budget && (
                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3 shrink-0" /> Budget: {fmt$(org.annual_budget) || org.annual_budget}
                          </p>
                        )}
                        {org.annual_people_served && (
                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Users className="w-3 h-3 shrink-0" /> Serves {org.annual_people_served} people/yr
                          </p>
                        )}
                      </div>

                      {/* Readiness & capacity chips */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {org.grant_experience_level && (
                          <span className={`text-xs font-medium ${EXP_CONFIG[org.grant_experience_level]?.color || 'text-slate-500'}`}>
                            {EXP_CONFIG[org.grant_experience_level]?.label || org.grant_experience_level} Grant Experience
                          </span>
                        )}
                      </div>

                      {/* Capacity flags */}
                      <div className="flex flex-wrap gap-1">
                        {org.has_strategic_plan && <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">Strategic Plan ✓</span>}
                        {org.has_financial_systems && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">Financial Systems ✓</span>}
                        {org.has_evaluation_system && <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5">Evaluation ✓</span>}
                        {org.has_data_tracking && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">Data Tracking ✓</span>}
                      </div>
                    </CardContent>

                    {/* Expanded detail */}
                    {selected?.id === org.id && (
                      <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-3">
                        {org.mission_statement && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mission</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{org.mission_statement}</p>
                          </div>
                        )}
                        {org.target_population && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Population</p>
                            <p className="text-sm text-slate-700">{org.target_population}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {org.founding_year && <div><span className="text-slate-400">Founded</span><p className="font-medium text-slate-800">{org.founding_year}</p></div>}
                          {org.staff_count && <div><span className="text-slate-400">Staff</span><p className="font-medium text-slate-800">{org.staff_count}</p></div>}
                          {org.board_size && <div><span className="text-slate-400">Board Size</span><p className="font-medium text-slate-800">{org.board_size}</p></div>}
                          {org.ein && <div><span className="text-slate-400">EIN</span><p className="font-medium text-slate-800">{org.ein}</p></div>}
                          {org.largest_grant_amount && <div><span className="text-slate-400">Largest Grant</span><p className="font-medium text-slate-800">{org.largest_grant_amount}</p></div>}
                        </div>
                        {org.funding_goals && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Funding Goals</p>
                            <p className="text-sm text-slate-700">{org.funding_goals}</p>
                          </div>
                        )}
                        {enrollment && (
                          <div className="bg-[#AC1A5B]/5 border border-[#AC1A5B]/20 rounded-lg p-3">
                            <p className="text-xs font-semibold text-[#AC1A5B] mb-1">IncubateHer Enrollment</p>
                            <p className="text-xs text-slate-600">Status: <span className="font-medium capitalize">{enrollment.enrollment_status}</span></p>
                            {enrollment.organization_name && <p className="text-xs text-slate-600">Org name on file: {enrollment.organization_name}</p>}
                          </div>
                        )}
                        {org.website && (
                          <a href={org.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                            <ExternalLink className="w-3 h-3" /> {org.website}
                          </a>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}