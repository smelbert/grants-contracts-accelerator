import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Clock, AlertTriangle, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CourseViewer() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [course, setCourse] = useState(null);
  const [learnerName, setLearnerName] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No access token provided.');
      setLoading(false);
      return;
    }
    base44.functions.invoke('trackShareableLink', { token })
      .then(res => {
        setCourse(res.data.course);
        setLearnerName(res.data.learnerName || '');
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || err.message || 'Invalid or expired link.');
        setLoading(false);
      });
  }, [token]);

  const toggleSection = (idx) => {
    setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleDownloadPDF = async () => {
    if (!course?.id) return;
    setExportingPDF(true);
    try {
      const response = await base44.functions.invoke('exportCoursePDF', { courseId: course.id });
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${course.title?.replace(/[^a-z0-9]/gi, '_') || 'course'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch (err) {
      toast.error('PDF export failed');
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#143A50] mx-auto mb-3" />
          <p className="text-slate-600">Loading your course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Unavailable</h2>
            <p className="text-slate-500 text-sm">{error}</p>
            <p className="text-slate-400 text-xs mt-3">If you believe this is an error, contact the program organizer.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header bar */}
      <div className="bg-[#143A50] text-white py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png"
              alt="EIS"
              className="h-8 w-auto"
            />
          </div>
          <Badge className="bg-[#E5C089]/20 text-[#E5C089] border-[#E5C089]/30">Shared Course</Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome */}
        {learnerName && (
          <div className="bg-[#E5C089]/10 border border-[#E5C089]/30 rounded-xl px-5 py-3">
            <p className="text-sm text-[#143A50] font-medium">Welcome, {learnerName}!</p>
            <p className="text-xs text-slate-500 mt-0.5">This course was shared with you by Elbert Innovative Solutions.</p>
          </div>
        )}

        {/* Course header */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-[#143A50]/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#143A50]" />
                  </div>
                  <Badge className="bg-slate-100 text-slate-600 text-xs capitalize">{course.content_type}</Badge>
                  {course.funding_lane && <Badge className="bg-emerald-100 text-emerald-700 text-xs">{course.funding_lane}</Badge>}
                </div>
                <CardTitle className="text-2xl text-[#143A50]">{course.title}</CardTitle>
                {course.description && <p className="text-slate-500 mt-2 text-sm leading-relaxed">{course.description}</p>}
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                {course.duration_minutes && (
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    {course.duration_minutes} min
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={exportingPDF}
                  className="gap-1.5"
                >
                  {exportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download PDF
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Curriculum Sections */}
        {course.curriculum_sections?.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-800">Course Content</h2>
            {course.curriculum_sections.map((section, i) => (
              <Card key={i} className="border-slate-200 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => toggleSection(i)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#143A50] text-white text-sm flex items-center justify-center font-medium flex-shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{section.title}</p>
                      {section.description && <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {section.duration_minutes && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{section.duration_minutes}m
                      </span>
                    )}
                    {expandedSections[i] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>
                {expandedSections[i] && section.content && (
                  <div className="px-5 pb-5 border-t border-slate-100">
                    <div
                      className="prose prose-sm max-w-none text-slate-700 mt-3"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Lessons */}
        {course.lessons?.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-800">Lessons</h2>
            {course.lessons.map((lesson, i) => (
              <Card key={i} className="border-slate-200 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => toggleSection(`l-${i}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm flex items-center justify-center font-medium flex-shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{lesson.title}</p>
                      {lesson.description && <p className="text-xs text-slate-500 mt-0.5">{lesson.description}</p>}
                    </div>
                  </div>
                  {expandedSections[`l-${i}`] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedSections[`l-${i}`] && (
                  <div className="px-5 pb-5 border-t border-slate-100">
                    {lesson.video_url && (
                      <div className="mt-3 mb-4">
                        <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">Watch Video →</a>
                      </div>
                    )}
                    {lesson.text_content && (
                      <div
                        className="prose prose-sm max-w-none text-slate-700 mt-3"
                        dangerouslySetInnerHTML={{ __html: lesson.text_content }}
                      />
                    )}
                    {lesson.resources?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-700 mb-2">Resources</p>
                        <ul className="space-y-1">
                          {lesson.resources.map((r, ri) => (
                            <li key={ri}>
                              {r.url
                                ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm underline">{r.title}</a>
                                : <span className="text-sm text-slate-600">{r.title}</span>
                              }
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Handouts */}
        {course.handouts?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Handouts & Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {course.handouts.map((h, i) => (
                <Card key={i} className="border-slate-200 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Download className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{h.title}</p>
                      {h.description && <p className="text-xs text-slate-500 truncate">{h.description}</p>}
                    </div>
                    {h.file_url && (
                      <a href={h.file_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="h-7 text-xs">Download</Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {course.tips?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Tips & Best Practices</h2>
            <div className="space-y-2">
              {course.tips.map((tip, i) => (
                <Card key={i} className="border-slate-200 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-[#AC1A5B] uppercase mb-1">{tip.category?.replace('_', ' ') || 'Tip'}</p>
                    <p className="text-sm font-medium text-slate-800">{tip.title}</p>
                    {tip.content && <p className="text-sm text-slate-600 mt-1">{tip.content}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6 border-t border-slate-200 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Elbert Innovative Solutions. All rights reserved.</p>
          <p className="mt-1">Proprietary content — do not distribute without authorization.</p>
        </div>
      </div>
    </div>
  );
}