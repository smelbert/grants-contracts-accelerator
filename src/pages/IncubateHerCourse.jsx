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
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function IncubateHerCourse() {
  const queryClient = useQueryClient();
  const [currentSection, setCurrentSection] = useState(0);
  const [userNotes, setUserNotes] = useState('');
  const [completedSections, setCompletedSections] = useState([]);
  
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

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

  useEffect(() => {
    if (userActivity?.notes) {
      setUserNotes(userActivity.notes);
    }
    if (progress?.completed_sections) {
      setCompletedSections(progress.completed_sections);
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

  const markSectionComplete = (sectionIndex) => {
    const newCompleted = [...completedSections];
    if (!newCompleted.includes(sectionIndex)) {
      newCompleted.push(sectionIndex);
      setCompletedSections(newCompleted);
      
      const totalSections = course?.curriculum_sections?.length || 1;
      const progressPercent = Math.round((newCompleted.length / totalSections) * 100);
      
      saveProgressMutation.mutate({
        completed_sections: newCompleted,
        progress_percentage: progressPercent,
        is_completed: progressPercent === 100,
        last_accessed: new Date().toISOString()
      });
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
      <CoBrandedHeader 
        title={course.title}
        subtitle={course.description}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Course Header */}
        <Card className="mb-6" style={{ borderColor: BRAND_COLORS.culRed, borderWidth: 2 }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge style={{ backgroundColor: BRAND_COLORS.eisGold, color: BRAND_COLORS.neutralDark }}>
                  {course.funding_lane}
                </Badge>
                {course.duration_minutes && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                    <Clock className="w-4 h-4" />
                    {course.duration_minutes} min
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Progress value={progressPercent} className="w-32" />
                  <span className="text-sm font-medium" style={{ color: BRAND_COLORS.eisNavy }}>
                    {progressPercent}%
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleBookmarkMutation.mutate()}
                style={{ color: userActivity?.is_bookmarked ? BRAND_COLORS.culRed : BRAND_COLORS.eisNavy }}
              >
                <Bookmark className={`w-5 h-5 ${userActivity?.is_bookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {progressPercent === 100 && (
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: BRAND_COLORS.eisGold + '20' }}>
                <Award className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                <span className="font-medium" style={{ color: BRAND_COLORS.neutralDark }}>
                  Course Completed! 🎉
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Section Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: BRAND_COLORS.culRed }}>
                  Course Sections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSection(idx)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      currentSection === idx ? 'shadow-md' : 'hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: currentSection === idx ? BRAND_COLORS.eisGold + '20' : 'transparent',
                      borderLeft: `3px solid ${completedSections.includes(idx) ? BRAND_COLORS.eisGold : 'transparent'}`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {completedSections.includes(idx) ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: BRAND_COLORS.eisNavy }} />
                      )}
                      <span className="text-sm font-medium" style={{ color: BRAND_COLORS.neutralDark }}>
                        {idx + 1}. {section.title}
                      </span>
                    </div>
                    {section.duration_minutes && (
                      <p className="text-xs ml-6" style={{ color: BRAND_COLORS.eisNavy }}>
                        {section.duration_minutes} min
                      </p>
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
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
              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: BRAND_COLORS.culRed }}>
                      {currentSectionData?.title}
                    </CardTitle>
                    {currentSectionData?.description && (
                      <p className="text-sm mt-2" style={{ color: BRAND_COLORS.eisNavy }}>
                        {currentSectionData.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Embedded Gamma Presentation */}
                    {course.content_url && (
                      <div className="rounded-lg overflow-hidden shadow-lg" style={{ border: `2px solid ${BRAND_COLORS.eisGold}` }}>
                        <iframe
                          src={course.content_url}
                          className="w-full"
                          style={{ height: '600px' }}
                          allowFullScreen
                          title="Course Presentation"
                        />
                      </div>
                    )}

                    {/* Section Content */}
                    {currentSectionData?.content && (
                      <div 
                        className="prose max-w-none p-6 rounded-lg"
                        style={{ backgroundColor: BRAND_COLORS.neutralLight }}
                        dangerouslySetInnerHTML={{ __html: currentSectionData.content }}
                      />
                    )}

                    {/* Mark Complete */}
                    <div className="flex items-center justify-between pt-6 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                        disabled={currentSection === 0}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      
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
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                        disabled={currentSection === sections.length - 1}
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tips Tab */}
              <TabsContent value="tips">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: BRAND_COLORS.culRed }}>
                      <Lightbulb className="w-5 h-5 inline mr-2" />
                      Tips & Best Practices
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {course.tips && course.tips.length > 0 ? (
                      course.tips.map((tip, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg border-l-4"
                          style={{
                            backgroundColor: BRAND_COLORS.neutralLight,
                            borderColor: tip.category === 'warning' ? BRAND_COLORS.culRed : BRAND_COLORS.eisGold
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Star className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: BRAND_COLORS.eisGold }} />
                            <div>
                              <h4 className="font-semibold mb-2" style={{ color: BRAND_COLORS.neutralDark }}>
                                {tip.title}
                              </h4>
                              <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                                {tip.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: BRAND_COLORS.eisNavy }}>No tips available for this course yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: BRAND_COLORS.culRed }}>
                      <Download className="w-5 h-5 inline mr-2" />
                      Downloadable Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {course.handouts && course.handouts.length > 0 ? (
                      course.handouts.map((handout, idx) => (
                        <a
                          key={idx}
                          href={handout.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-shadow"
                          style={{ backgroundColor: BRAND_COLORS.neutralLight }}
                        >
                          <div>
                            <h4 className="font-medium mb-1" style={{ color: BRAND_COLORS.neutralDark }}>
                              {handout.title}
                            </h4>
                            {handout.description && (
                              <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                                {handout.description}
                              </p>
                            )}
                          </div>
                          <Download className="w-5 h-5 flex-shrink-0" style={{ color: BRAND_COLORS.eisGold }} />
                        </a>
                      ))
                    ) : (
                      <p style={{ color: BRAND_COLORS.eisNavy }}>No downloadable resources for this course yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: BRAND_COLORS.culRed }}>
                      <MessageSquare className="w-5 h-5 inline mr-2" />
                      My Personal Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <CoBrandedFooter />
    </div>
  );
}