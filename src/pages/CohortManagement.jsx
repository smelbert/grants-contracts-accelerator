import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Mail, 
  Calendar, 
  BookOpen,
  TrendingUp,
  MessageSquare,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

export default function CohortManagementPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [formData, setFormData] = useState({
    cohort_name: '',
    course_id: '',
    start_date: '',
    end_date: '',
    description: '',
    max_members: 30
  });

  const queryClient = useQueryClient();

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.LearningContent.filter({ content_type: 'course' }),
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => base44.entities.Cohort.list(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['allEnrollments'],
    queryFn: () => base44.entities.UserEnrollment.list(),
  });

  // Add member counts to cohorts
  const cohortsWithMembers = cohorts.map(cohort => ({
    ...cohort,
    members: enrollments.filter(e => e.cohort_id === cohort.id)
  }));

  const createCohortMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Cohort.create({
        cohort_name: data.cohort_name,
        course_id: data.course_id,
        start_date: data.start_date,
        end_date: data.end_date,
        description: data.description,
        max_members: data.max_members,
        status: 'upcoming'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const assignToCohortMutation = useMutation({
    mutationFn: async ({ enrollmentId, cohortId }) => {
      return base44.entities.UserEnrollment.update(enrollmentId, { cohort_id: cohortId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEnrollments'] });
    },
  });

  const resetForm = () => {
    setFormData({
      cohort_name: '',
      course_id: '',
      start_date: '',
      end_date: '',
      description: '',
      max_members: 30
    });
    setSelectedCohort(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createCohortMutation.mutate(formData);
  };

  const getCohortProgress = (cohort) => {
    const totalProgress = cohort.members.reduce((sum, m) => sum + (m.progress_percentage || 0), 0);
    return cohort.members.length > 0 ? Math.round(totalProgress / cohort.members.length) : 0;
  };

  const unassignedEnrollments = enrollments.filter(e => !e.cohort_id && e.status === 'active');
  const activeCohorts = cohortsWithMembers.filter(c => c.status === 'active' || c.status === 'upcoming');

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Cohort Management</h1>
            <p className="text-slate-600">Organize and track student groups</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Cohort
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Cohort</DialogTitle>
                <DialogDescription>Set up a new cohort for group learning</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="cohort_name">Cohort Name</Label>
                  <Input
                    id="cohort_name"
                    value={formData.cohort_name}
                    onChange={(e) => setFormData({ ...formData, cohort_name: e.target.value })}
                    placeholder="e.g., Spring 2026 Grant Writing"
                    required
                  />
                </div>
                <div>
                  <Label>Course</Label>
                  <Select value={formData.course_id} onValueChange={(val) => setFormData({ ...formData, course_id: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="max_members">Maximum Members</Label>
                  <Input
                    id="max_members"
                    type="number"
                    value={formData.max_members}
                    onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this cohort..."
                    className="h-24"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCohortMutation.isPending}>
                    Create Cohort
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Cohorts</p>
                  <p className="text-3xl font-bold text-slate-900">{cohortsWithMembers.length}</p>
                </div>
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Members</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {cohortsWithMembers.reduce((sum, c) => sum + c.members.length, 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Unassigned</p>
                  <p className="text-3xl font-bold text-slate-900">{unassignedEnrollments.length}</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Progress</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {cohortsWithMembers.length > 0
                      ? Math.round(cohortsWithMembers.reduce((sum, c) => sum + getCohortProgress(c), 0) / cohortsWithMembers.length)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="cohorts">
          <TabsList>
            <TabsTrigger value="cohorts">Active Cohorts</TabsTrigger>
            <TabsTrigger value="unassigned">
              Unassigned ({unassignedEnrollments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cohorts" className="space-y-4">
            {cohortsWithMembers.length > 0 ? (
              cohortsWithMembers.map((cohort) => {
                const course = courses.find(c => c.id === cohort.course_id);
                const avgProgress = getCohortProgress(cohort);

                return (
                  <Card key={cohort.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-2">{cohort.cohort_name}</CardTitle>
                          <CardDescription>
                            {course?.title || 'Unknown Course'} • {cohort.members.length} members
                            {cohort.start_date && ` • Starts ${format(new Date(cohort.start_date), 'MMM d, yyyy')}`}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-emerald-100 text-emerald-700">
                            {avgProgress}% Complete
                          </Badge>
                          <Badge variant="outline">
                            {cohort.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {cohort.members.slice(0, 5).map((member) => (
                            <Badge key={member.id} variant="outline">
                              {member.user_email}
                            </Badge>
                          ))}
                          {cohort.members.length > 5 && (
                            <Badge variant="outline">+{cohort.members.length - 5} more</Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Mail className="w-4 h-4 mr-2" />
                            Email Cohort
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Discussion
                          </Button>
                          <Button variant="outline" size="sm">
                            <BookOpen className="w-4 h-4 mr-2" />
                            View Course
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Cohorts Yet</h3>
                  <p className="text-slate-600 mb-4">Create your first cohort to get started</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="unassigned" className="space-y-4">
            {unassignedEnrollments.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Unassigned Students</CardTitle>
                  <CardDescription>Assign these students to cohorts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {unassignedEnrollments.map((enrollment) => {
                      const course = courses.find(c => c.id === enrollment.content_id);
                      return (
                        <div key={enrollment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">{enrollment.user_email}</p>
                            <p className="text-sm text-slate-600">{course?.title || 'Unknown Course'}</p>
                          </div>
                          <Select
                            onValueChange={(cohortId) =>
                              assignToCohortMutation.mutate({ enrollmentId: enrollment.id, cohortId })
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Assign to cohort" />
                            </SelectTrigger>
                            <SelectContent>
                              {cohortsWithMembers
                                .filter(c => c.course_id === enrollment.content_id)
                                .map((cohort) => (
                                  <SelectItem key={cohort.id} value={cohort.id}>
                                    {cohort.cohort_name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-600">All students are assigned to cohorts</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}