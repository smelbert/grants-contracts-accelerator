import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  TrendingUp,
  Calendar,
  Building2,
  Star
} from 'lucide-react';

export default function MyProfile() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.UserProgress.filter({
        user_email: user.email
      });
    },
    enabled: !!user?.email
  });

  const { data: allLearningContent = [] } = useQuery({
    queryKey: ['learning-content'],
    queryFn: () => base44.entities.LearningContent.list()
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.UserBadge.filter({
        user_email: user.email
      });
    },
    enabled: !!user?.email
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
    },
    enabled: !!user?.email
  });

  const { data: organization } = useQuery({
    queryKey: ['user-organization', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const orgs = await base44.entities.Organization.filter({
        primary_contact_email: user.email
      });
      return orgs[0];
    },
    enabled: !!user?.email
  });

  // Calculate overall stats
  const completedCourses = userProgress.filter(p => p.is_completed).length;
  const inProgressCourses = userProgress.filter(p => p.is_started && !p.is_completed).length;
  const totalTimeSpent = userProgress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0);
  const averageProgress = userProgress.length > 0 
    ? Math.round(userProgress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / userProgress.length)
    : 0;

  // Group progress by content type
  const progressByType = allLearningContent.reduce((acc, content) => {
    const progress = userProgress.find(p => p.content_id === content.id);
    if (progress) {
      const type = content.content_type;
      if (!acc[type]) acc[type] = { total: 0, completed: 0 };
      acc[type].total++;
      if (progress.is_completed) acc[type].completed++;
    }
    return acc;
  }, {});

  const badgeCategories = badges.reduce((acc, badge) => {
    const category = badge.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6 border-2 border-[#E5C089]">
          <CardContent className="py-8">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24 bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white text-3xl font-bold flex items-center justify-center">
                {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#143A50] mb-2">
                  {user?.full_name || 'User Profile'}
                </h1>
                
                <div className="space-y-2 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  
                  {organization && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{organization.organization_name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {new Date(user?.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Badge className="bg-[#143A50] text-white">
                    {user?.role === 'admin' ? 'Administrator' : user?.role === 'coach' ? 'Coach' : 'Participant'}
                  </Badge>
                  {enrollments.length > 0 && (
                    <Badge variant="outline" className="border-[#AC1A5B] text-[#AC1A5B]">
                      {enrollments.length} Program{enrollments.length > 1 ? 's' : ''} Enrolled
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#143A50]">{completedCourses}</div>
                    <div className="text-xs text-slate-600">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#143A50]">{badges.length}</div>
                    <div className="text-xs text-slate-600">Badges</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#143A50]">{Math.round(totalTimeSpent / 60)}h</div>
                    <div className="text-xs text-slate-600">Learning Time</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#143A50]">{averageProgress}%</div>
                    <div className="text-xs text-slate-600">Avg Progress</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress">
              <TrendingUp className="w-4 h-4 mr-2" />
              Learning Progress
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Award className="w-4 h-4 mr-2" />
              Badges & Achievements
            </TabsTrigger>
            <TabsTrigger value="activity">
              <BookOpen className="w-4 h-4 mr-2" />
              Recent Activity
            </TabsTrigger>
          </TabsList>

          {/* Learning Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Completion</span>
                      <span className="text-sm text-slate-600">{averageProgress}%</span>
                    </div>
                    <Progress value={averageProgress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-slate-900">{userProgress.length}</div>
                      <div className="text-xs text-slate-600">Total Courses</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-slate-900">{completedCourses}</div>
                      <div className="text-xs text-slate-600">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <TrendingUp className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                      <div className="text-2xl font-bold text-slate-900">{inProgressCourses}</div>
                      <div className="text-xs text-slate-600">In Progress</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Star className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-slate-900">{Math.round(totalTimeSpent / 60)}</div>
                      <div className="text-xs text-slate-600">Hours Logged</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress by Content Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(progressByType).map(([type, stats]) => (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{type}</span>
                        <span className="text-sm text-slate-600">
                          {stats.completed} / {stats.total} completed
                        </span>
                      </div>
                      <Progress 
                        value={(stats.completed / stats.total) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userProgress.map((progress) => {
                    const content = allLearningContent.find(c => c.id === progress.content_id);
                    if (!content) return null;
                    
                    return (
                      <div key={progress.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{content.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {content.content_type}
                            </Badge>
                            {progress.is_completed && (
                              <Badge className="bg-green-600 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#143A50]">
                            {progress.progress_percentage}%
                          </div>
                          {progress.time_spent_minutes > 0 && (
                            <div className="text-xs text-slate-500">
                              {Math.round(progress.time_spent_minutes)} min
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {userProgress.length === 0 && (
                    <p className="text-center text-slate-500 py-8">
                      No learning progress yet. Start a course to see your progress here!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            {Object.entries(badgeCategories).map(([category, categoryBadges]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categoryBadges.map((badge) => (
                      <div 
                        key={badge.id} 
                        className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-200"
                      >
                        <div className="text-4xl mb-2">{badge.icon || '🏆'}</div>
                        <div className="font-semibold text-sm text-[#143A50]">{badge.badge_name}</div>
                        {badge.earned_date && (
                          <div className="text-xs text-slate-500 mt-1">
                            Earned {new Date(badge.earned_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {categoryBadges.length === 0 && (
                    <p className="text-center text-slate-500 py-8">
                      No badges in this category yet. Keep learning to earn badges!
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            {badges.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">
                    No badges earned yet. Complete courses and participate in programs to earn achievements!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Learning Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userProgress
                    .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
                    .slice(0, 10)
                    .map((progress) => {
                      const content = allLearningContent.find(c => c.id === progress.content_id);
                      if (!content) return null;
                      
                      return (
                        <div key={progress.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            progress.is_completed ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {progress.is_completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{content.title}</h4>
                            <p className="text-xs text-slate-500">
                              {progress.is_completed ? 'Completed' : `${progress.progress_percentage}% complete`} • 
                              {' '}{new Date(progress.updated_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  
                  {userProgress.length === 0 && (
                    <p className="text-center text-slate-500 py-8">
                      No activity yet. Start learning to see your activity here!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}