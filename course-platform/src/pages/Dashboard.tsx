import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores';
import { useCourses, useStudents, useStudentStatistics } from '@/hooks';
import { StatCard, StatCardsGrid, DataTable } from '@/components/common';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Users, BookOpen, DollarSign, TrendingUp, GraduationCap, ArrowRight, Plus } from 'lucide-react';
import { formatCurrency, formatNumber, formatRelativeDate } from '@/utils';

export function Dashboard() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useUIStore();

  React.useEffect(() => {
    setBreadcrumbs([{ label: 'Admin Dashboard' }]);
  }, [setBreadcrumbs]);

  const { courses, isLoading: coursesLoading } = useCourses({ limit: 5 });
  const { students, isLoading: studentsLoading } = useStudents({ limit: 5 });
  const { data: statistics, isLoading: statsLoading } = useStudentStatistics();

  const revenueData = [
    { month: 'Jan', revenue: 4000, students: 240 },
    { month: 'Feb', revenue: 3000, students: 198 },
    { month: 'Mar', revenue: 5000, students: 300 },
    { month: 'Apr', revenue: 4500, students: 280 },
    { month: 'May', revenue: 6000, students: 350 },
    { month: 'Jun', revenue: 7500, students: 420 },
  ];

  const courseCompletionData = [
    { name: 'Completed', value: 65 },
    { name: 'In Progress', value: 25 },
    { name: 'Not Started', value: 10 },
  ];

  const topCoursesData = [
    { name: 'Advanced React', students: 156, revenue: 15600 },
    { name: 'Node.js Fundamentals', students: 132, revenue: 9900 },
    { name: 'TypeScript Mastery', students: 98, revenue: 7840 },
    { name: 'Complete Next.js', students: 87, revenue: 8700 },
    { name: 'Practical Docker', students: 76, revenue: 5320 },
  ];

  const recentStudentsColumns = [
    {
      key: 'name',
      title: 'Student',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <span className="text-sm font-medium text-primary">
              {row.user?.firstName?.[0] || '?'}
              {row.user?.lastName?.[0] || ''}
            </span>
          </div>
          <div>
            <p className="font-medium">{row.user?.firstName || 'User'} {row.user?.lastName || 'New'}</p>
            <p className="text-xs text-muted-foreground">{row.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'enrolledCourses',
      title: 'Courses',
      render: (row: any) => <span>{row.enrolledCourses?.length || 0}</span>,
    },
    {
      key: 'progress',
      title: 'Progress',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${row.totalProgress || 0}%` }} />
          </div>
          <span className="text-sm">{row.totalProgress || 0}%</span>
        </div>
      ),
    },
    {
      key: 'lastActive',
      title: 'Last Activity',
      render: (row: any) => (
        <span className="text-sm text-muted-foreground">
          {row.lastActive ? formatRelativeDate(row.lastActive) : 'Never'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">A quick view of courses, learners, revenue, and momentum across the platform.</p>
        </div>
        <Button onClick={() => navigate('/admin/courses/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create course
        </Button>
      </div>

      <StatCardsGrid>
        <StatCard
          title="Total Students"
          value={formatNumber(statistics?.totalStudents || 1245)}
          description="Registered learners"
          trend={{ value: 12.5, label: 'vs last month', positive: true }}
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          loading={statsLoading}
        />
        <StatCard
          title="Active Courses"
          value={formatNumber(courses.length || 24)}
          description="Published courses"
          trend={{ value: 8.2, label: 'vs last month', positive: true }}
          icon={BookOpen}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          loading={coursesLoading}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency((statistics as any)?.totalRevenue || 0)}
          description="This month"
          trend={{ value: 23.1, label: 'vs last month', positive: true }}
          icon={DollarSign}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          loading={statsLoading}
        />
        <StatCard
          title="Completion Rate"
          value={`${statistics?.completionRate || 68}%`}
          description="Average across all courses"
          trend={{ value: 5.4, label: 'vs last month', positive: true }}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          loading={statsLoading}
        />
      </StatCardsGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LineChart
          title="Revenue and Learners"
          description="Monthly trend"
          data={revenueData}
          lines={[
            { key: 'revenue', name: 'Revenue ($)', color: '#3b82f6' },
            { key: 'students', name: 'Learners', color: '#10b981' },
          ]}
          xAxisKey="month"
          yAxisFormatter={(value) => `$${value}`}
          height={300}
        />
        <PieChart
          title="Learner Progress"
          description="Completion distribution"
          data={courseCompletionData}
          colors={['#10b981', '#f59e0b', '#ef4444']}
          donut
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Courses</CardTitle>
              <p className="text-sm text-muted-foreground">Top 5 courses by enrollment</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/courses')}>
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <BarChart
              data={topCoursesData}
              bars={[{ key: 'students', name: 'Students', color: '#3b82f6' }]}
              xAxisKey="name"
              xAxisFormatter={(value) => value.split(' ')[0]}
              height={250}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
            <p className="text-sm text-muted-foreground">Latest registered learners</p>
          </CardHeader>
          <CardContent>
            <DataTable
              data={students}
              columns={recentStudentsColumns}
              keyExtractor={(row) => row.id}
              emptyMessage="No students registered yet"
              loading={studentsLoading}
            />
            <Button variant="ghost" className="mt-4 w-full" onClick={() => navigate('/admin/students')}>
              View all students
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Button variant="outline" className="h-auto justify-start py-4" onClick={() => navigate('/admin/courses/new')}>
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-medium">Create course</p>
            <p className="text-xs text-muted-foreground">Add a new course</p>
          </div>
        </Button>
        <Button variant="outline" className="h-auto justify-start py-4" onClick={() => navigate('/admin/students/import')}>
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Import students</p>
            <p className="text-xs text-muted-foreground">Upload a learner list</p>
          </div>
        </Button>
        <Button variant="outline" className="h-auto justify-start py-4" onClick={() => navigate('/admin/reports')}>
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
            <TrendingUp className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">View reports</p>
            <p className="text-xs text-muted-foreground">Open detailed analytics</p>
          </div>
        </Button>
        <Button variant="outline" className="h-auto justify-start py-4" onClick={() => navigate('/admin/settings')}>
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <GraduationCap className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Settings</p>
            <p className="text-xs text-muted-foreground">Manage school preferences</p>
          </div>
        </Button>
      </div>
    </div>
  );
}
