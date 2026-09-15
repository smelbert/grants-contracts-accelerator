import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ProgramHeader from '@/components/program/ProgramHeader';
import ProgramFooter from '@/components/program/ProgramFooter';
import {
  BookOpen, CheckCircle2, Clock, Play, RotateCcw, Circle, Lock, ArrowLeft,
} from 'lucide-react';

export default function ProgramLearning() {
  const params = new URLSearchParams(window.location.search);
  const programCode = params.get('program');
  const [activeTopic, setActiveTopic] = useState('all');

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['all-active-cohorts'],
    queryFn: () => base44.entities.ProgramCohort.filter({ is_active: true }),
  });
  const cohort = cohorts.find((c) => c.program_code === programCode) || null;

  const { data: allContent = [], isLoading } = useQuery({
    queryKey: ['generic-learning-content'],
    queryFn: () => base44.entities.LearningContent.filter({ incubateher_only: false }),
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  // Filter to published content assigned to this program (or generic-to-all)
  const content = useMemo(() => {
    if (!cohort) return [];
    return allContent.filter((c) => {
      if (c.incubateher_only === true) return false;
      if (c.is_published !== true) return false;
      const codes = c.program_codes || [];
      return codes.length === 0 || codes.includes(cohort.program_code);
    });
  }, [allContent, cohort]);

  const progressMap = {};
  userProgress.forEach((p) => {
    progressMap[p.content_id] = p;
  });

  // Build topics from cohort config + content topics
  const topics = useMemo(() => {
    const configured = (cohort?.curriculum_topics || []).map((t) => ({
      id: t.id,
      label: t.label || t.id,
      description: t.description,
      order: t.order ?? 99,
    }));
    const configIds = new Set(configured.map((t) => t.id));
    const fromContent = content
      .map((c) => c.topic)
      .filter(Boolean)
      .filter((t) => !configIds.has(t));
    const extra = fromContent.map((t, i) => ({ id: t, label: t, description: '', order: 100 + i }));
    return [...configured, ...extra].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }, [cohort, content]);

  const grouped = useMemo(() => {
    const g = {};
    content.forEach((c) => {
      const key = c.topic || 'general';
      if (!g[key]) g[key] = [];
      g[key].push(c);
    });
    return g;
  }, [content]);

  const completedCount = content.filter((c) => progressMap[c.id]?.is_completed).length;
  const totalCount = content.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredContent = activeTopic === 'all' ? content : grouped[activeTopic] || [];

  if (!programCode || !cohort) {
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
      <ProgramHeader cohort={cohort} title="Learning Hub" subtitle={`Your ${cohort.program_name} curriculum`} />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <Link
          to={`${createPageUrl('ProgramOverview')}?program=${cohort.program_code}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to program overview
        </Link>

        {/* Stats + progress */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: accentColor + '20' }}>
                <BookOpen className="w-5 h-5" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{completedCount}/{totalCount}</p>
                <p className="text-xs text-slate-500">Courses Done</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: brandColor + '15' }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: brandColor }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{completionPct}%</p>
                <p className="text-xs text-slate-500">Complete</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-2">Overall Progress</p>
              <Progress value={completionPct} className="h-2" />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Topic sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <Card className="border-0 shadow-sm sticky top-6">
              <CardContent className="p-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 pt-3 pb-2">Topics</p>
                <button
                  onClick={() => setActiveTopic('all')}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium mb-1 flex items-center justify-between"
                  style={activeTopic === 'all' ? { backgroundColor: brandColor, color: 'white' } : { color: '#475569' }}
                >
                  <span>All Courses</span>
                  <Badge
                    className="text-xs"
                    style={
                      activeTopic === 'all'
                        ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }
                        : { backgroundColor: '#f1f5f9', color: '#64748b' }
                    }
                  >
                    {totalCount}
                  </Badge>
                </button>
                {topics.map((t) => {
                  const count = (grouped[t.id] || []).length;
                  const done = (grouped[t.id] || []).filter((c) => progressMap[c.id]?.is_completed).length;
                  const isActive = activeTopic === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTopic(t.id)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm mb-1"
                      style={isActive ? { backgroundColor: accentColor, color: '#1a1a1a' } : { color: '#475569' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate pr-2 font-medium">{t.label}</span>
                        <span className="text-xs flex-shrink-0" style={{ color: isActive ? '#1a1a1a' : '#94a3b8' }}>
                          {done}/{count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          {/* Course grid */}
          <main className="flex-1 min-w-0">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                {activeTopic === 'all' ? 'All Courses' : topics.find((t) => t.id === activeTopic)?.label || activeTopic}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {filteredContent.length} course{filteredContent.length !== 1 ? 's' : ''}
              </p>
            </div>
            {isLoading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-44 bg-slate-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredContent.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-700 mb-2">No courses yet</h3>
                  <p className="text-sm text-slate-500">Courses for this topic haven't been added yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredContent.map((c) => {
                  const p = progressMap[c.id];
                  const isDone = p?.is_completed;
                  const hasStarted = p && !isDone;
                  const pct = p?.progress_percentage || 0;
                  return (
                    <Card
                      key={c.id}
                      className={`h-full border-2 transition-all ${isDone ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:shadow-md'}`}
                    >
                      <CardContent className="p-5 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                          {isDone ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                            </Badge>
                          ) : hasStarted ? (
                            <Badge className="bg-blue-100 text-blue-700">
                              <RotateCcw className="w-3 h-3 mr-1" /> In Progress
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500">
                              <Circle className="w-3 h-3 mr-1" /> Not Started
                            </Badge>
                          )}
                          {c.duration_minutes && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {c.duration_minutes}m
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2 leading-snug">{c.title}</h3>
                        {c.description && (
                          <p className="text-sm text-slate-600 mb-4 flex-1 line-clamp-3">{c.description}</p>
                        )}
                        {hasStarted && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span>Progress</span>
                              <span>{pct}%</span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                          </div>
                        )}
                        <Link to={`${createPageUrl('CourseViewer')}?id=${c.id}`} className="mt-auto">
                          <Button
                            className="w-full"
                            size="sm"
                            style={
                              isDone
                                ? { backgroundColor: '#e2f4ea', color: '#15803d' }
                                : { backgroundColor: brandColor, color: 'white' }
                            }
                          >
                            {isDone ? (
                              <>
                                <RotateCcw className="w-3 h-3 mr-2" /> Review
                              </>
                            ) : hasStarted ? (
                              <>
                                <Play className="w-3 h-3 mr-2" /> Continue
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 mr-2" /> Start
                              </>
                            )}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
      <ProgramFooter cohort={cohort} />
    </div>
  );
}