import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores';
import { useCourses, useStudents, useStudentStatistics } from '@/hooks';
import { StatCard, StatCardsGrid, DataTable } from '@/components/common';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  GraduationCap,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { formatCurrency, formatNumber, formatRelativeDate } from '@/utils';

export function Dashboard() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useUIStore();

  React.useEffect(() => {
    setBreadcrumbs([{ label: 'Dashboard' }]);
  }, [setBreadcrumbs]);

  const { courses, isLoading: coursesLoading } = useCourses({ limit: 5 });
  const { students, isLoading: studentsLoading } = useStudents({ limit: 5 });
  const { data: statistics, isLoading: statsLoading } = useStudentStatistics();

  // Mock data for charts
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
    { name: 'React Avanzado', students: 156, revenue: 15600 },
    { name: 'Node.js Fundamentos', students: 132, revenue: 9900 },
    { name: 'TypeScript Master', students: 98, revenue: 7840 },
    { name: 'Next.js Completo', students: 87, revenue: 8700 },
    { name: 'Docker Práctico', students: 76, revenue: 5320 },
  ];

  const recentStudentsColumns = [
    { key: 'name', title: 'Student', render: (row: any) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium text-primary">
            {row.user?.firstName?.[0] || '?'}{row.user?.lastName?.[0] || ''}
          </span>
        </div>
        <div>
          <p className="font-medium">{row.user?.firstName || 'User'} {row.user?.lastName || 'New'}</p>
          <p className="text-xs text-muted-foreground">{row.user?.email}</p>
        </div>
      </div>
    )},
    { key: 'enrolledCourses', title: 'Courses', render: (row: any) => (
      <span>{row.enrolledCourses?.length || 0}</span>
    )},
    { key: 'progress', title: 'Progress', render: (row: any) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${row.totalProgress || 0}%` }}
          />
        </div>
        <span className="text-sm">{row.totalProgress || 0}%</span>
      </div>
    )},
    { key: 'lastActive', title: 'Last Activity', render: (row: any) => (
      <span className="text-sm text-muted-foreground">
        {row.lastActive ? formatRelativeDate(row.lastActive) : 'Never'}
      </span>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido de vuelta, aquí está el resumen de tu plataforma</p>
        </div>
        <Button onClick={() => navigate('/courses/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo curso
        </Button>
      </div>

      {/* Stats Grid */}
      <StatCardsGrid>
        <StatCard
          title="Total Students"
          value={formatNumber(statistics?.totalStudents || 1245)}
          description="Registered students"
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          title="Revenue and Students"
          description="Monthly trend"
          data={revenueData}
          lines={[
            { key: 'revenue', name: 'Revenue ($)', color: '#3b82f6' },
            { key: 'students', name: 'Students', color: '#10b981' },
          ]}
          xAxisKey="month"
          yAxisFormatter={(value) => `$${value}`}
          height={300}
        />
        <PieChart
          title="Student Progress"
          description="Completion distribution"
          data={courseCompletionData}
          colors={['#10b981', '#f59e0b', '#ef4444']}
          donut
          height={300}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Courses */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Popular Courses</CardTitle>
              <p className="text-sm text-muted-foreground">Top 5 courses by enrollment</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <BarChart
              data={topCoursesData}
              bars={[
                { key: 'students', name: 'Students', color: '#3b82f6' },
              ]}
              xAxisKey="name"
              xAxisFormatter={(value) => value.split(' ')[0]}
              height={250}
            />
          </CardContent>
        </Card>

        {/* Recent Students */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
            <p className="text-sm text-muted-foreground">Latest registered students</p>
          </CardHeader>
          <CardContent>
            <DataTable
              data={students}
              columns={recentStudentsColumns}
              keyExtractor={(row) => row.id}
              emptyMessage="No students registered yet"
              loading={studentsLoading}
            />
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => navigate('/students')}
            >
              View all students
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button variant="outline" className="h-auto py-4 justify-start" onClick={() => navigate('/courses/new')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mr-3">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-medium">Create Course</p>
            <p className="text-xs text-muted-foreground">Add a new course</p>
          </div>
        </Button>
        <Button variant="outline" className="h-auto py-4 justify-start" onClick={() => navigate('/students/import')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 mr-3">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Import Students</p>
            <p className="text-xs text-muted-foreground">Upload student list</p>
          </div>
        </Button>
        <Button variant="outline" className="h-auto py-4 justify-start" onClick={() => navigate('/reports')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 mr-3">
            <TrendingUp className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">View Reports</p>
            <p className="text-xs text-muted-foreground">Detailed analytics</p>
          </div>
        </Button>
        <Button variant="outline" className="h-auto py-4 justify-start" onClick={() => navigate('/settings')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 mr-3">
            <GraduationCap className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Settings</p>
            <p className="text-xs text-muted-foreground">Customize your school</p>
          </div>
        </Button>
      </div>
    </div>
  );
}
