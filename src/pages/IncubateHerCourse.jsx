import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { 
  CheckCircle2, 
  BookOpen, 
  Download, 
  Bookmark,
  Star,
  MessageSquare,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  Clock,
  Award,
  Sparkles,
  Home,
  ChevronRight,
  Play,
  FileText,
  Video
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function IncubateHerCourse() {
  const queryClient = useQueryClient();
  const [currentSection, setCurrentSection] = useState(0);
  const [userNotes, setUserNotes] = useState('');
  const [completedSections, setCompletedSections] = useState([]);
  const [videoProgress, setVideoProgress] = useState({});
  const [sectionNotes, setSectionNotes] = useState({});
  
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const fromLearningHub = urlParams.get('from') === 'learning';

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      return await base44.entities.LearningContent.get(courseId);
    },
    enabled: !!courseId
  });

  const { data: cohort } = useQuery({
    queryKey: ['incubateher-cohort'],
    queryFn: async () => {
      const cohorts = await base44.entities.ProgramCohort.filter({
        program_code: 'incubateher_funding_readiness'
      });
      return cohorts[0];
    }
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', user?.email],
    queryFn: async () => {
      if (!user?.email || !cohort?.id) return null;
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email,
        cohort_id: cohort.id
      });
      return enrollments[0];
    },
    enabled: !!user?.email && !!cohort?.id
  });

  const { data: progress } = useQuery({
    queryKey: ['course-progress', enrollment?.id, courseId],
    queryFn: async () => {
      if (!enrollment?.id || !courseId) return null;
      const userProgress = await base44.entities.UserProgress.filter({
        enrollment_id: enrollment.id,
        content_id: courseId
      });
      return userProgress[0];
    },
    enabled: !!enrollment?.id && !!courseId
  });

  const { data: userActivity } = useQuery({
    queryKey: ['course-activity', enrollment?.id, courseId],
    queryFn: async () => {
      if (!enrollment?.id || !courseId) return null;
      const activities = await base44.entities.UserActivity.filter({
        enrollment_id: enrollment.id,
        content_id: courseId
      });
      return activities[0];
    },
    enabled: !!enrollment?.id && !!courseId
  });

  // Get all courses from the same program for navigation
  const { data: allCourses } = useQuery({
    queryKey: ['all-incubateher-courses'],
    queryFn: async () => {
      const content = await base44.entities.LearningContent.filter({
        incubateher_only: true
      });
      return content.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  });

  useEffect(() => {
    if (userActivity?.notes) {
      setUserNotes(userActivity.notes);
    }
    if (userActivity?.section_notes) {
      setSectionNotes(userActivity.section_notes || {});
    }
    if (progress?.completed_sections) {
      setCompletedSections(progress.completed_sections);
    }
    if (progress?.video_progress) {
      setVideoProgress(progress.video_progress || {});
    }
  }, [userActivity, progress]);

  const saveProgressMutation = useMutation({
    mutationFn: async (data) => {
      if (!enrollment?.id || !courseId) return;
      
      if (progress) {
        await base44.entities.UserProgress.update(progress.id, data);
      } else {
        await base44.entities.UserProgress.create({
          enrollment_id: enrollment.id,
          content_id: courseId,
          participant_email: user.email,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course-progress']);
    }
  });

  const saveNotesMutation = useMutation({
    mutationFn: async (notes) => {
      if (!enrollment?.id || !courseId) return;
      
      if (userActivity) {
        await base44.entities.UserActivity.update(userActivity.id, { notes });
      } else {
        await base44.entities.UserActivity.create({
          enrollment_id: enrollment.id,
          content_id: courseId,
          participant_email: user.email,
          activity_type: 'notes',
          notes
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course-activity']);
      toast.success('Notes saved!');
    }
  });

  const saveSectionNotesMutation = useMutation({
    mutationFn: async ({ sectionIndex, notes }) => {
      if (!enrollment?.id || !courseId) return;
      
      const updatedSectionNotes = { ...sectionNotes, [sectionIndex]: notes };
      
      if (userActivity) {
        await base44.entities.UserActivity.update(userActivity.id, { 
          section_notes: updatedSectionNotes 
        });
      } else {
        await base44.entities.UserActivity.create({
          enrollment_id: enrollment.id,
          content_id: courseId,
          participant_email: user.email,
          activity_type: 'notes',
          section_notes: updatedSectionNotes
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course-activity']);
      toast.success('Section notes saved!');
    }
  });

  const updateVideoProgress = (sectionIndex, currentTime, duration) => {
    const updatedProgress = { 
      ...videoProgress, 
      [sectionIndex]: { 
        currentTime, 
        duration, 
        percent: Math.round((currentTime / duration) * 100) 
      } 
    };
    setVideoProgress(updatedProgress);
    
    // Auto-save progress
    if (progress) {
      base44.entities.UserProgress.update(progress.id, { 
        video_progress: updatedProgress 
      });
    }
  };

  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!enrollment?.id || !courseId) return;
      
      const isBookmarked = userActivity?.is_bookmarked || false;
      
      if (userActivity) {
        await base44.entities.UserActivity.update(userActivity.id, {
          is_bookmarked: !isBookmarked
        });
      } else {
        await base44.entities.UserActivity.create({
          enrollment_id: enrollment.id,
          content_id: courseId,
          participant_email: user.email,
          activity_type: 'bookmark',
          is_bookmarked: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course-activity']);
      toast.success(userActivity?.is_bookmarked ? 'Bookmark removed' : 'Bookmarked!');
    }
  });

  const markSectionComplete = async (sectionIndex) => {
    const newCompleted = [...completedSections];
    if (!newCompleted.includes(sectionIndex)) {
      newCompleted.push(sectionIndex);
      setCompletedSections(newCompleted);
      
      const totalSections = course?.curriculum_sections?.length || 1;
      const progressPercent = Math.round((newCompleted.length / totalSections) * 100);
      const isFullyCompleted = progressPercent === 100;
      
      // Award points: 10 points per section, 50 bonus for completing course
      const pointsEarned = isFullyCompleted ? 50 : 10;
      const currentPoints = enrollment?.gamification_points || 0;
      
      saveProgressMutation.mutate({
        completed_sections: newCompleted,
        progress_percentage: progressPercent,
        is_completed: isFullyCompleted,
        last_accessed: new Date().toISOString()
      });
      
      // Update enrollment points
      if (enrollment) {
        await base44.entities.ProgramEnrollment.update(enrollment.id, {
          gamification_points: currentPoints + pointsEarned,
          courses_completed: isFullyCompleted ? (enrollment.courses_completed || 0) + 1 : enrollment.courses_completed
        });
        
        // Award badges
        if (isFullyCompleted) {
          const completedCount = (enrollment.courses_completed || 0) + 1;
          
          // First course badge
          if (completedCount === 1) {
            await base44.entities.UserBadge.create({
              user_email: user.email,
              badge_type: 'first_steps',
              badge_name: 'First Steps',
              program: 'incubateher',
              earned_date: new Date().toISOString()
            });
          }
          
          // 3 courses badge
          if (completedCount === 3) {
            await base44.entities.UserBadge.create({
              user_email: user.email,
              badge_type: 'knowledge_seeker',
              badge_name: 'Knowledge Seeker',
              program: 'incubateher',
              earned_date: new Date().toISOString()
            });
          }
          
          // All 8 courses badge
          if (completedCount === 8) {
            await base44.entities.UserBadge.create({
              user_email: user.email,
              badge_type: 'master_learner',
              badge_name: 'Master Learner',
              program: 'incubateher',
              earned_date: new Date().toISOString()
            });
          }
        }
        
        queryClient.invalidateQueries(['enrollment']);
        queryClient.invalidateQueries(['user-badges']);
      }
      
      toast.success(`+${pointsEarned} points! ${isFullyCompleted ? '🎉 Course completed!' : 'Section completed!'}`);
      
      // Celebration animation
      if (isFullyCompleted) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
        <CoBrandedHeader title="Loading..." />
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <p>Loading course...</p>
        </div>
        <CoBrandedFooter />
      </div>
    );
  }

  const sections = course.curriculum_sections || [];
  const currentSectionData = sections[currentSection];
  const progressPercent = sections.length > 0 ? Math.round((completedSections.length / sections.length) * 100) : 0;
  
  const currentCourseIndex = allCourses?.findIndex(c => c.id === courseId) || 0;
  const previousCourse = allCourses?.[currentCourseIndex - 1];
  const nextCourse = allCourses?.[currentCourseIndex + 1];

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('IncubateHerLearning')}>
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Learning Hub
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-300" />
              <div className="flex items-center gap-2">
                <Badge style={{ backgroundColor: BRAND_COLORS.eisGold, color: 'white' }} className="text-xs">
                  {course.funding_lane}
                </Badge>
                <Progress value={progressPercent} className="w-24" />
                <span className="text-xs font-medium text-slate-600">
                  {progressPercent}% Complete
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {course.duration_minutes && (
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  {course.duration_minutes} min
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleBookmarkMutation.mutate()}
                style={{ color: userActivity?.is_bookmarked ? BRAND_COLORS.culRed : BRAND_COLORS.eisNavy }}
              >
                <Bookmark className={`w-4 h-4 ${userActivity?.is_bookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Left Sidebar - Course Sections */}
        <div className="w-80 border-r border-slate-200 bg-slate-50 overflow-y-auto">
          <div className="p-6 border-b border-slate-200 bg-white">
            <h2 className="font-bold text-lg mb-1" style={{ color: BRAND_COLORS.culRed }}>
              {course.title}
            </h2>
            <p className="text-sm text-slate-600 mb-4">{course.description}</p>
            
            {progressPercent === 100 && (
              <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ backgroundColor: BRAND_COLORS.eisGold + '20' }}>
                <Award className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                <span className="text-xs font-medium" style={{ color: BRAND_COLORS.neutralDark }}>
                  Course Completed! 🎉
                </span>
              </div>
            )}

            <div className="text-xs text-slate-500 mb-2">
              Completed {completedSections.length} of {sections.length} lessons
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <div className="p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Course Sections
            </h3>
            <div className="space-y-1">
              {sections.map((section, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentSection(idx);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-start gap-2 ${
                    currentSection === idx 
                      ? 'bg-white shadow-sm' 
                      : 'hover:bg-white/50'
                  }`}
                >
                  {completedSections.includes(idx) ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: BRAND_COLORS.eisGold }} />
                  ) : (
                    <div 
                      className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5" 
                      style={{ borderColor: currentSection === idx ? BRAND_COLORS.culRed : '#cbd5e1' }} 
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {section.title}
                    </div>
                    {section.duration_minutes && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        {section.duration_minutes} min
                      </div>
                    )}
                  </div>
                  {currentSection === idx && (
                    <Play className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: BRAND_COLORS.culRed }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Section Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <span>Lesson {currentSection + 1} of {sections.length}</span>
              </div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: BRAND_COLORS.culRed }}>
                {currentSectionData?.title}
              </h1>
              {currentSectionData?.description && (
                <p className="text-slate-600">
                  {currentSectionData.description}
                </p>
              )}
            </div>

            <Tabs defaultValue="content" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="content">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="tips">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Tips
                </TabsTrigger>
                <TabsTrigger value="resources">
                  <Download className="w-4 h-4 mr-2" />
                  Resources
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  My Notes
                </TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                {/* Video Player */}
                {currentSectionData?.video_url && (
                  <div className="rounded-lg overflow-hidden shadow-lg bg-slate-100">
                    <video
                      key={currentSection}
                      className="w-full"
                      controls
                      onTimeUpdate={(e) => {
                        const video = e.target;
                        updateVideoProgress(currentSection, video.currentTime, video.duration);
                      }}
                      onLoadedMetadata={(e) => {
                        const savedProgress = videoProgress[currentSection];
                        if (savedProgress?.currentTime) {
                          e.target.currentTime = savedProgress.currentTime;
                        }
                      }}
                    >
                      <source src={currentSectionData.video_url} />
                      Your browser does not support video playback.
                    </video>
                    {videoProgress[currentSection] && (
                      <div className="p-3 bg-white border-t border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                        <Video className="w-4 h-4 text-slate-400" />
                        <span>Progress: {videoProgress[currentSection].percent}%</span>
                        <span>•</span>
                        <span>
                          {Math.floor(videoProgress[currentSection].currentTime / 60)}:
                          {Math.floor(videoProgress[currentSection].currentTime % 60).toString().padStart(2, '0')} / 
                          {Math.floor(videoProgress[currentSection].duration / 60)}:
                          {Math.floor(videoProgress[currentSection].duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Embedded Presentation */}
                {currentSectionData?.presentation_url && (
                  <div className="rounded-lg overflow-hidden shadow-lg border border-slate-200">
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(currentSectionData.presentation_url)}`}
                      className="w-full"
                      style={{ height: '600px' }}
                      allowFullScreen
                      title="Presentation Viewer"
                    />
                  </div>
                )}

                {/* Embedded Gamma Presentation */}
                {course.content_url && (
                  <div className="rounded-lg overflow-hidden shadow-lg border border-slate-200">
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-sm text-slate-600 font-medium">Course Presentation</span>
                      <a
                        href={course.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Open in new tab
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <iframe
                      src={course.content_url}
                      className="w-full"
                      style={{ height: '650px' }}
                      allowFullScreen
                      allow="fullscreen"
                      title="Course Presentation"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
                    />
                  </div>
                )}

                {/* Section-level Gamma/embed URL */}
                {currentSectionData?.content_url && (
                  <div className="rounded-lg overflow-hidden shadow-lg border border-slate-200">
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-sm text-slate-600 font-medium">Presentation</span>
                      <a
                        href={currentSectionData.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Open in new tab
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <iframe
                      src={currentSectionData.content_url}
                      className="w-full"
                      style={{ height: '650px' }}
                      allowFullScreen
                      allow="fullscreen"
                      title="Section Presentation"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
                    />
                  </div>
                )}

                {/* Embed Code */}
                {currentSectionData?.embed_code && (
                  <div 
                    className="rounded-lg overflow-hidden shadow-lg border border-slate-200" 
                    dangerouslySetInnerHTML={{ __html: currentSectionData.embed_code }}
                  />
                )}

                {/* Section Content */}
                {currentSectionData?.content && (
                  <div 
                    className="prose max-w-none p-6 rounded-lg bg-slate-50 border border-slate-200"
                    dangerouslySetInnerHTML={{ __html: currentSectionData.content }}
                  />
                )}

                {/* Section Notes */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: BRAND_COLORS.culRed }}>
                    <MessageSquare className="w-4 h-4" />
                    Notes for This Section
                  </h3>
                  <Textarea
                    value={sectionNotes[currentSection] || ''}
                    onChange={(e) => setSectionNotes({ ...sectionNotes, [currentSection]: e.target.value })}
                    placeholder="Take notes specific to this section..."
                    rows={4}
                    className="w-full mb-3"
                  />
                  <Button
                    size="sm"
                    onClick={() => saveSectionNotesMutation.mutate({ 
                      sectionIndex: currentSection, 
                      notes: sectionNotes[currentSection] || '' 
                    })}
                    disabled={saveSectionNotesMutation.isPending}
                    style={{ backgroundColor: BRAND_COLORS.eisNavy, color: 'white' }}
                  >
                    {saveSectionNotesMutation.isPending ? 'Saving...' : 'Save Section Notes'}
                  </Button>
                </div>

                {/* Navigation & Mark Complete */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  {currentSection > 0 ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentSection(currentSection - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  
                  {!completedSections.includes(currentSection) && (
                    <Button
                      onClick={() => markSectionComplete(currentSection)}
                      className="text-white"
                      style={{ backgroundColor: BRAND_COLORS.eisGold }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </Button>
                  )}
                  
                  {currentSection < sections.length - 1 ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentSection(currentSection + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : nextCourse ? (
                    <Link to={createPageUrl('IncubateHerCourse') + '?id=' + nextCourse.id + '&from=learning'}>
                      <Button style={{ backgroundColor: BRAND_COLORS.culRed, color: 'white' }}>
                        Next Course
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to={createPageUrl('IncubateHerLearning')}>
                      <Button style={{ backgroundColor: BRAND_COLORS.culRed, color: 'white' }}>
                        Back to Learning Hub
                      </Button>
                    </Link>
                  )}
                </div>
              </TabsContent>

              {/* Tips Tab */}
              <TabsContent value="tips" className="space-y-4">
                {course.tips && course.tips.length > 0 ? (
                  course.tips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border-l-4 bg-slate-50"
                      style={{
                        borderColor: tip.category === 'warning' ? BRAND_COLORS.culRed : BRAND_COLORS.eisGold
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Star className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: BRAND_COLORS.eisGold }} />
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: BRAND_COLORS.neutralDark }}>
                            {tip.title}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {tip.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">No tips available for this course yet.</p>
                )}
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-3">
                {course.handouts && course.handouts.length > 0 ? (
                  course.handouts.map((handout, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1 text-slate-900">
                            {handout.title}
                          </h4>
                          {handout.description && (
                            <p className="text-sm text-slate-600">
                              {handout.description}
                            </p>
                          )}
                          <p className="text-xs mt-1 text-slate-500">
                            Type: {handout.file_type || 'PDF'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={handout.file_url}
                          download
                          className="flex-1"
                        >
                          <Button
                            size="sm"
                            className="w-full"
                            style={{ backgroundColor: BRAND_COLORS.eisGold, color: 'white' }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </a>
                        <a
                          href={handout.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            View in Browser
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">No downloadable resources for this course yet.</p>
                )}
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.culRed }}>
                    My Personal Notes
                  </h3>
                  <Textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Take notes as you learn... These notes are private and only visible to you."
                    rows={12}
                    className="w-full mb-4"
                  />
                  <Button
                    onClick={() => saveNotesMutation.mutate(userNotes)}
                    disabled={saveNotesMutation.isPending}
                    className="text-white"
                    style={{ backgroundColor: BRAND_COLORS.eisGold }}
                  >
                    {saveNotesMutation.isPending ? 'Saving...' : 'Save Notes'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}