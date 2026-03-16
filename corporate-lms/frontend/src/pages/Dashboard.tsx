import { useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  TrendingUp,
  Plus,
  Clock,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { StatCard } from '@/components/common/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useMyEnrollments } from '@/hooks/useEnrollments';

export function Dashboard() {
  const { user, isInstructor } = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses({ limit: 5 });
  const { enrollments, isLoading: enrollmentsLoading } = useMyEnrollments();

  // Stats for instructors
  const instructorStats = {
    totalCourses: courses?.length || 0,
    totalLearners: courses?.reduce((acc, c) => acc + (c.enrollmentsCount || 0), 0) || 0,
    avgCompletion: 78,
    publishedCourses: courses?.filter(c => c.status === 'published').length || 0,
  };

  // Stats for learners
  const learnerStats = {
    enrolledCourses: enrollments?.length || 0,
    completedCourses: enrollments?.filter(e => e.status === 'completed').length || 0,
    inProgressCourses: enrollments?.filter(e => e.status === 'active' && e.progress < 100).length || 0,
    avgProgress: enrollments?.length
      ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
      : 0,
  };

  const recentCourses = courses?.slice(0, 3) || [];
  const myCourses = enrollments?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your {isInstructor ? 'courses' : 'learning'} today.
          </p>
        </div>
        {isInstructor && (
          <Link to="/builder">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Create New Course
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isInstructor ? (
          <>
            <StatCard
              title="Total Courses"
              value={instructorStats.totalCourses}
              icon={<BookOpen className="w-6 h-6 text-blue-600" />}
            />
            <StatCard
              title="Total Learners"
              value={instructorStats.totalLearners}
              change={12}
              trend="up"
              icon={<Users className="w-6 h-6 text-green-600" />}
            />
            <StatCard
              title="Avg. Completion"
              value={`${instructorStats.avgCompletion}%`}
              change={5}
              trend="up"
              icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            />
            <StatCard
              title="Published"
              value={instructorStats.publishedCourses}
              icon={<Award className="w-6 h-6 text-orange-600" />}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Enrolled Courses"
              value={learnerStats.enrolledCourses}
              icon={<BookOpen className="w-6 h-6 text-blue-600" />}
            />
            <StatCard
              title="Completed"
              value={learnerStats.completedCourses}
              icon={<Award className="w-6 h-6 text-green-600" />}
            />
            <StatCard
              title="In Progress"
              value={learnerStats.inProgressCourses}
              icon={<Clock className="w-6 h-6 text-orange-600" />}
            />
            <StatCard
              title="Avg. Progress"
              value={`${learnerStats.avgProgress}%`}
              icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Courses */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Card.Header
              title={isInstructor ? 'Recent Courses' : 'Continue Learning'}
              action={
                <Link to={isInstructor ? '/courses' : '/my-courses'}>
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              }
            />
            <Card.Body>
              <div className="space-y-4">
                {isInstructor ? (
                  // Instructor view - show created courses
                  recentCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {course.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {course.enrollmentsCount || 0} learners • {course.status}
                        </p>
                      </div>
                      <Link to={`/builder/${course.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  // Learner view - show enrolled courses
                  myCourses.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {enrollment.course?.thumbnail ? (
                          <img
                            src={enrollment.course.thumbnail}
                            alt={enrollment.course.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {enrollment.course?.title}
                        </h4>
                        <div className="mt-2">
                          <Progress 
                            value={enrollment.progress} 
                            size="sm" 
                            showLabel 
                          />
                        </div>
                      </div>
                      <Link to={`/learn/${enrollment.courseId}`}>
                        <Button variant="outline" size="sm">
                          {enrollment.progress === 0 ? 'Start' : 'Continue'}
                        </Button>
                      </Link>
                    </div>
                  ))
                )}

                {(isInstructor ? recentCourses.length === 0 : myCourses.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No {isInstructor ? 'courses created yet' : 'enrollments yet'}</p>
                    <Link to={isInstructor ? '/builder' : '/courses'}>
                      <Button variant="outline" className="mt-4">
                        {isInstructor ? 'Create Your First Course' : 'Browse Courses'}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Right Column - Activity & Quick Actions */}
        <div className="space-y-6">
          <Card>
            <Card.Header title="Quick Actions" />
            <Card.Body>
              <div className="space-y-2">
                {isInstructor ? (
                  <>
                    <Link to="/builder">
                      <Button variant="outline" className="w-full justify-start" leftIcon={<Plus className="w-4 h-4" />}>
                        Create New Course
                      </Button>
                    </Link>
                    <Link to="/learners">
                      <Button variant="outline" className="w-full justify-start" leftIcon={<Users className="w-4 h-4" />}>
                        View All Learners
                      </Button>
                    </Link>
                    <Link to="/reports">
                      <Button variant="outline" className="w-full justify-start" leftIcon={<TrendingUp className="w-4 h-4" />}>
                        View Reports
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/courses">
                      <Button variant="outline" className="w-full justify-start" leftIcon={<BookOpen className="w-4 h-4" />}>
                        Browse All Courses
                      </Button>
                    </Link>
                    <Link to="/my-courses">
                      <Button variant="outline" className="w-full justify-start" leftIcon={<GraduationCap className="w-4 h-4" />}>
                        My Learning
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header title="Recent Activity" />
            <Card.Body>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm text-gray-800">
                      New learner enrolled in "Leadership Fundamentals"
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm text-gray-800">
                      Course "Safety Training" was completed by 5 learners
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm text-gray-800">
                      New course "Excel Advanced" published
                    </p>
                    <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
