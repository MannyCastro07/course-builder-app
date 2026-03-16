import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, PlayCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { useMyEnrollments } from '@/hooks/useEnrollments';

export function MyCourses() {
  const { enrollments, isLoading } = useMyEnrollments();

  const inProgress = enrollments?.filter(e => e.status === 'active' && e.progress < 100) || [];
  const completed = enrollments?.filter(e => e.status === 'completed' || e.progress === 100) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Learning</h1>
        <p className="text-gray-600 mt-1">
          Track your progress and continue your learning journey
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Body className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{enrollments?.length || 0}</p>
              <p className="text-sm text-gray-500">Enrolled Courses</p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completed.length}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inProgress.length}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* In Progress Section */}
      {inProgress.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Continue Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgress.map((enrollment) => (
              <Card key={enrollment.id} className="overflow-hidden">
                <div className="h-40 bg-gray-100 relative">
                  {enrollment.course?.thumbnail ? (
                    <img
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white font-medium">{enrollment.course?.title}</p>
                  </div>
                </div>
                <Card.Body>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{enrollment.progress}%</span>
                    </div>
                    <Progress value={enrollment.progress} size="sm" />
                  </div>
                  <Link to={`/learn/${enrollment.courseId}`}>
                    <Button className="w-full" leftIcon={<PlayCircle className="w-4 h-4" />}>
                      Continue
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Section */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.map((enrollment) => (
              <Card key={enrollment.id} className="overflow-hidden opacity-75">
                <div className="h-40 bg-gray-100 relative">
                  {enrollment.course?.thumbnail ? (
                    <img
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant="success">Completed</Badge>
                  </div>
                </div>
                <Card.Body>
                  <h3 className="font-medium text-gray-900 mb-2">{enrollment.course?.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Award className="w-4 h-4" />
                    <span>Certificate earned</span>
                  </div>
                  <Link to={`/learn/${enrollment.courseId}`}>
                    <Button variant="outline" className="w-full">
                      Review Course
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && enrollments?.length === 0 && (
        <Card>
          <Card.Body className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments yet</h3>
            <p className="text-gray-500 mb-6">Start your learning journey by enrolling in a course</p>
            <Link to="/courses">
              <Button leftIcon={<BookOpen className="w-4 h-4" />}>
                Browse Courses
              </Button>
            </Link>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
