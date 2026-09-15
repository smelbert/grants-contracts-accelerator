import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProgramHeader from '@/components/program/ProgramHeader';
import ProgramFooter from '@/components/program/ProgramFooter';
import { BookOpen, Users, Calendar, ArrowRight, Target, CheckCircle2, Lock } from 'lucide-react';

export default function ProgramOverview() {
  const params = new URLSearchParams(window.location.search);
  const programCode = params.get('program');

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: cohorts = [], isLoading: loadingCohorts } = useQuery({
    queryKey: ['all-active-cohorts'],
    queryFn: () => base44.entities.ProgramCohort.filter({ is_active: true }),
  });

  const cohort = cohorts.find((c) => c.program_code === programCode) || null;

  // Picker view: no program selected
  if (!programCode) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Programs</h1>
        <p className="text-slate-600 mb-8">Choose a funding-readiness program to get started.</p>
        {loadingCohorts ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : cohorts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              No programs are available yet. Check back soon.
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {cohorts.map((c) => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{c.program_name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {c.program_type === 'self_paced' ? 'Self-Paced' : 'Cohort'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                    {c.description || 'Funding readiness training.'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <span>{c.delivery_organization}</span>
                  </div>
                  <Link to={`${createPageUrl('ProgramOverview')}?program=${c.program_code}`}>
                    <Button size="sm" className="w-full">
                      View Program <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Single program view
  if (!cohort) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Program not found</h2>
            <Link to={createPageUrl('ProgramOverview')}>
              <Button variant="outline" size="sm">
                Back to Programs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const brandColor = cohort.brand_config?.primary_color || '#143A50';
  const accentColor = cohort.brand_config?.accent_color || '#E5C089';

  return (
    <div className="min-h-screen bg-slate-50">
      <ProgramHeader cohort={cohort} />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Hero */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">About this program</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              {cohort.description || 'Build the foundation for funding success.'}
            </p>
            {cohort.learning_outcomes?.length > 0 && (
              <>
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" /> What you'll learn
                </h3>
                <div className="grid md:grid-cols-2 gap-2 mb-4">
                  {cohort.learning_outcomes.map((o, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{o}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Link to={`${createPageUrl('ProgramLearning')}?program=${cohort.program_code}`}>
                <Button size="lg" style={{ backgroundColor: brandColor }} className="text-white">
                  <BookOpen className="w-4 h-4 mr-2" /> Enter Learning Hub
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        {cohort.session_days?.length > 0 && (
          <Card className="mb-6 border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Schedule
              </h3>
              <div className="space-y-2">
                {cohort.session_days.map((day, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: accentColor }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {day.date} {day.time && `· ${day.time}`}
                      </p>
                      {day.location && <p className="text-xs text-slate-500">{day.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Facilitators */}
        {cohort.facilitators?.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" /> Facilitators
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {cohort.facilitators.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    {f.photo_url ? (
                      <img src={f.photo_url} className="w-10 h-10 rounded-full object-cover" alt={f.name} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-medium">
                        {(f.name || 'F')[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{f.name}</p>
                      {f.role && <p className="text-xs text-slate-500 capitalize">{f.role}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <ProgramFooter cohort={cohort} />
    </div>
  );
}