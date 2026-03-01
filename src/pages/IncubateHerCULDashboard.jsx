import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import RegistrationInsightsBrief from '@/components/incubateher/RegistrationInsightsBrief';
import { Users, TrendingUp, Award, FileText, Shield, CheckCircle2, BarChart2, ArrowUpRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
  AreaChart, Area, LineChart, Line
} from 'recharts';

const BRAND = {
  navy: '#143A50',
  magenta: '#AC1A5B',
  gold: '#E5C089',
  teal: '#1E4F58',
  rust: '#A65D40',
};

const READINESS_COLORS = {
  'Not Ready': '#ef4444',
  'Emerging': '#f59e0b',
  'Competitive': '#3b82f6',
  'Highly Competitive': '#22c55e',
};

function StatCard({ label, value, sub, icon: Icon, color = BRAND.navy }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-1">{label}</p>
            <p className="text-4xl font-bold" style={{ color }}>{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
          </div>
          {Icon && <Icon className="w-9 h-9 text-slate-200" />}
        </div>
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function IncubateHerCULDashboard() {
  const { data: enrollments } = useQuery({
    queryKey: ['cul-enrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.list()
  });

  const { data: assessments } = useQuery({
    queryKey: ['cul-assessments'],
    queryFn: () => base44.entities.ProgramAssessment.list()
  });

  // --- Aggregate calculations (no PII) ---
  const totalEnrolled = enrollments?.length || 0;
  const completedProgram = enrollments?.filter(e => e.program_completed).length || 0;
  const attendanceComplete = enrollments?.filter(e => e.attendance_complete).length || 0;
  const consultationsComplete = enrollments?.filter(e => e.consultation_completed).length || 0;
  const documentsSubmitted = enrollments?.filter(e => e.documents_uploaded).length || 0;

  const preAssessments = assessments?.filter(a => a.assessment_type === 'pre') || [];
  const postAssessments = assessments?.filter(a => a.assessment_type === 'post') || [];

  const avgPreScore = preAssessments.length > 0
    ? Math.round(preAssessments.reduce((sum, a) => sum + (a.total_score || 0), 0) / preAssessments.length)
    : 0;
  const avgPostScore = postAssessments.length > 0
    ? Math.round(postAssessments.reduce((sum, a) => sum + (a.total_score || 0), 0) / postAssessments.length)
    : 0;
  const avgDelta = avgPostScore - avgPreScore;

  // --- Chart Data ---

  // Completion funnel
  const funnelData = [
    { name: 'Enrolled', count: totalEnrolled, fill: BRAND.navy },
    { name: 'Attended', count: attendanceComplete, fill: BRAND.teal },
    { name: 'Consulted', count: consultationsComplete, fill: BRAND.gold },
    { name: 'Docs Done', count: documentsSubmitted, fill: BRAND.rust },
    { name: 'Completed', count: completedProgram, fill: BRAND.magenta },
  ];

  // Pre/Post score comparison
  const scoreComparisonData = [
    { name: 'Pre-Assessment', score: avgPreScore, fill: BRAND.navy },
    { name: 'Post-Assessment', score: avgPostScore, fill: BRAND.magenta },
  ];

  // Readiness distribution pie
  const readinessBuckets = [
    { name: 'Not Ready', value: preAssessments.filter(a => (a.total_score || 0) < 40).length, color: '#ef4444' },
    { name: 'Emerging', value: preAssessments.filter(a => (a.total_score || 0) >= 40 && (a.total_score || 0) < 60).length, color: '#f59e0b' },
    { name: 'Competitive', value: preAssessments.filter(a => (a.total_score || 0) >= 60 && (a.total_score || 0) < 80).length, color: '#3b82f6' },
    { name: 'Highly Competitive', value: preAssessments.filter(a => (a.total_score || 0) >= 80).length, color: '#22c55e' },
  ].filter(b => b.value > 0);

  // Post readiness distribution
  const postReadinessBuckets = [
    { name: 'Not Ready', value: postAssessments.filter(a => (a.total_score || 0) < 40).length, color: '#ef4444' },
    { name: 'Emerging', value: postAssessments.filter(a => (a.total_score || 0) >= 40 && (a.total_score || 0) < 60).length, color: '#f59e0b' },
    { name: 'Competitive', value: postAssessments.filter(a => (a.total_score || 0) >= 60 && (a.total_score || 0) < 80).length, color: '#3b82f6' },
    { name: 'Highly Competitive', value: postAssessments.filter(a => (a.total_score || 0) >= 80).length, color: '#22c55e' },
  ].filter(b => b.value > 0);

  // Enrollment over time (by month from enrolled_date)
  const enrollmentByMonth = React.useMemo(() => {
    if (!enrollments?.length) return [];
    const counts = {};
    enrollments.forEach(e => {
      if (e.enrolled_date) {
        const d = new Date(e.enrolled_date);
        const key = `${d.toLocaleString('default', { month: 'short' })} '${String(d.getFullYear()).slice(2)}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([month, count]) => ({ month, count }));
  }, [enrollments]);

  // Component completion radar-style bar
  const componentData = [
    { component: 'Attendance', completed: attendanceComplete, pct: totalEnrolled > 0 ? Math.round((attendanceComplete / totalEnrolled) * 100) : 0 },
    { component: 'Consultations', completed: consultationsComplete, pct: totalEnrolled > 0 ? Math.round((consultationsComplete / totalEnrolled) * 100) : 0 },
    { component: 'Documents', completed: documentsSubmitted, pct: totalEnrolled > 0 ? Math.round((documentsSubmitted / totalEnrolled) * 100) : 0 },
    { component: 'Program', completed: completedProgram, pct: totalEnrolled > 0 ? Math.round((completedProgram / totalEnrolled) * 100) : 0 },
  ];

  // Org type demographics from jotform_data
  const orgTypeCounts = React.useMemo(() => {
    if (!enrollments?.length) return [];
    const counts = {};
    enrollments.forEach(e => {
      const t = e.jotform_data?.org_type || 'Not Specified';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [enrollments]);

  // Years in business from jotform_data
  const yearsCounts = React.useMemo(() => {
    if (!enrollments?.length) return [];
    const counts = {};
    enrollments.forEach(e => {
      const y = e.jotform_data?.years_in_business || 'Not Specified';
      counts[y] = (counts[y] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [enrollments]);

  // Grant experience distribution
  const grantExpCounts = React.useMemo(() => {
    if (!enrollments?.length) return [];
    const counts = {};
    enrollments.forEach(e => {
      const g = e.jotform_data?.grant_experience || 'Not Specified';
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [enrollments]);

  const PIE_COLORS = [BRAND.navy, BRAND.magenta, BRAND.gold, BRAND.teal, BRAND.rust, '#8b5cf6', '#06b6d4'];

  const completionRate = totalEnrolled > 0 ? Math.round((completedProgram / totalEnrolled) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader
        title="CUL Aggregate Dashboard"
        subtitle="Columbus Urban League View - Aggregate Data Only"
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Program Dashboard</TabsTrigger>
            <TabsTrigger value="insights">Registration Insights Brief</TabsTrigger>
          </TabsList>

          <TabsContent value="insights">
            <RegistrationInsightsBrief />
          </TabsContent>

          <TabsContent value="dashboard">
            <div className="space-y-6">

              {/* Privacy Notice */}
              <Card className="border-l-4 border-l-[#AC1A5B]">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#AC1A5B] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">
                      <strong>Data Privacy Notice:</strong> This dashboard displays <strong>aggregate data only</strong>. No individual participant information, names, emails, or consultation notes are visible. All data is anonymized per program agreements.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* KPI Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Enrolled" value={totalEnrolled} icon={Users} color={BRAND.navy} />
                <StatCard label="Completed Program" value={completedProgram} sub={`${completionRate}% rate`} icon={Award} color="#22c55e" />
                <StatCard label="Avg Pre → Post Gain" value={`+${avgDelta}`} sub={`${avgPreScore} → ${avgPostScore} pts`} icon={TrendingUp} color={BRAND.magenta} />
                <StatCard label="Consultations Done" value={consultationsComplete} sub={`${totalEnrolled > 0 ? Math.round((consultationsComplete / totalEnrolled) * 100) : 0}% of cohort`} icon={CheckCircle2} color={BRAND.teal} />
              </div>

              {/* Enrollment Over Time + Completion Funnel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Enrollment Over Time</CardTitle>
                    <CardDescription>Number of participants enrolled by month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {enrollmentByMonth.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={enrollmentByMonth}>
                          <defs>
                            <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={BRAND.navy} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={BRAND.navy} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="count" name="Enrollments" stroke={BRAND.navy} fill="url(#enrollGrad)" strokeWidth={2} dot={{ r: 4, fill: BRAND.navy }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No enrollment date data available</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Program Completion Funnel</CardTitle>
                    <CardDescription>Participants at each stage of completion</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, totalEnrolled || 1]} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Participants" radius={[0, 4, 4, 0]}>
                          {funnelData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Assessment Score Comparison + Component Completion */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Pre vs. Post Assessment Scores</CardTitle>
                    <CardDescription>Average cohort scores before and after the program</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={scoreComparisonData} margin={{ top: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="score" name="Avg Score" radius={[6, 6, 0, 0]}>
                          {scoreComparisonData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-3 flex justify-center">
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                        <ArrowUpRight className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-700">+{avgDelta} point average improvement</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Component Completion Rates</CardTitle>
                    <CardDescription>% of participants completing each program requirement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={componentData} margin={{ top: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="component" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                        <Tooltip formatter={(val) => `${val}%`} content={<CustomTooltip />} />
                        <Bar dataKey="pct" name="Completion %" radius={[6, 6, 0, 0]} fill={BRAND.teal}>
                          {componentData.map((_, i) => (
                            <Cell key={i} fill={[BRAND.teal, BRAND.magenta, BRAND.rust, BRAND.navy][i]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Readiness Distribution: Pre vs Post */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Pre-Program Readiness Distribution</CardTitle>
                    <CardDescription>Where participants started</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {readinessBuckets.length > 0 ? (
                      <div className="flex gap-4 items-center">
                        <ResponsiveContainer width="55%" height={200}>
                          <PieChart>
                            <Pie data={readinessBuckets} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                              {readinessBuckets.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(val, name) => [val, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-2">
                          {readinessBuckets.map((b, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
                              <span className="text-slate-600 flex-1">{b.name}</span>
                              <span className="font-semibold">{b.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No pre-assessment data yet</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Post-Program Readiness Distribution</CardTitle>
                    <CardDescription>Where participants ended</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {postReadinessBuckets.length > 0 ? (
                      <div className="flex gap-4 items-center">
                        <ResponsiveContainer width="55%" height={200}>
                          <PieChart>
                            <Pie data={postReadinessBuckets} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                              {postReadinessBuckets.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(val, name) => [val, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-2">
                          {postReadinessBuckets.map((b, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
                              <span className="text-slate-600 flex-1">{b.name}</span>
                              <span className="font-semibold">{b.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No post-assessment data yet</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Cohort Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cohort Demographics</CardTitle>
                  <CardDescription>Aggregate profile of program participants (from registration data)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Org Type */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Organization Type</p>
                      {orgTypeCounts.length > 0 ? (
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={orgTypeCounts} layout="vertical" margin={{ left: 0, right: 10 }}>
                            <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" name="Count" fill={BRAND.navy} radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[180px] flex items-center justify-center text-slate-300 text-xs">No data</div>
                      )}
                    </div>

                    {/* Years in Business */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Years in Business</p>
                      {yearsCounts.length > 0 ? (
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie data={yearsCounts} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                              {yearsCounts.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[180px] flex items-center justify-center text-slate-300 text-xs">No data</div>
                      )}
                    </div>

                    {/* Grant Experience */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Grant Experience Level</p>
                      {grantExpCounts.length > 0 ? (
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={grantExpCounts} layout="vertical" margin={{ left: 0, right: 10 }}>
                            <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" name="Count" fill={BRAND.magenta} radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[180px] flex items-center justify-center text-slate-300 text-xs">No data</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Program Outcomes Narrative */}
              <Card className="bg-[#143A50] text-white">
                <CardHeader>
                  <CardTitle className="text-white text-base">Program Outcomes Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-blue-100 leading-relaxed">
                  <p>
                    The IncubateHer Funding Readiness program successfully enrolled <strong className="text-white">{totalEnrolled} participants</strong>,
                    with <strong className="text-white">{completedProgram} completing</strong> all program requirements — a completion rate of{' '}
                    <strong className="text-white">{completionRate}%</strong>.
                  </p>
                  <p>
                    Participants demonstrated significant growth in funding readiness, with average assessment scores
                    increasing from <strong className="text-white">{avgPreScore}</strong> to <strong className="text-white">{avgPostScore}</strong>, representing an average improvement
                    of <strong className="text-[#E5C089]">+{avgDelta} points</strong>.
                  </p>
                  <p>
                    Program engagement was strong, with <strong className="text-white">{totalEnrolled > 0 ? Math.round((consultationsComplete / totalEnrolled) * 100) : 0}%</strong> of
                    participants completing one-on-one consultations and <strong className="text-white">{totalEnrolled > 0 ? Math.round((documentsSubmitted / totalEnrolled) * 100) : 0}%</strong> submitting
                    required organizational documents.
                  </p>
                </CardContent>
              </Card>

            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CoBrandedFooter />
    </div>
  );
}