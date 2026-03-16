import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useCourses } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { Course } from '@/types';

export function Courses() {
  const { user, isInstructor } = useAuth();
  const { addToast } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { 
    courses, 
    isLoading, 
    delete: deleteCourse,
    duplicate: duplicateCourse,
    publish: publishCourse,
    unpublish: unpublishCourse 
  } = useCourses({ search: searchTerm });

  const filteredCourses = courses.filter(course => {
    if (statusFilter === 'all') return true;
    return course.status === statusFilter;
  });

  const handleDelete = async (course: Course) => {
    if (!confirm(`Are you sure you want to delete "${course.title}"?`)) return;
    
    try {
      await deleteCourse(course.id);
      addToast('success', 'Course deleted successfully');
    } catch (error) {
      addToast('error', 'Failed to delete course');
    }
  };

  const handleDuplicate = async (course: Course) => {
    try {
      await duplicateCourse(course.id);
      addToast('success', 'Course duplicated successfully');
    } catch (error) {
      addToast('error', 'Failed to duplicate course');
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      if (course.status === 'published') {
        await unpublishCourse(course.id);
        addToast('success', 'Course unpublished');
      } else {
        await publishCourse(course.id);
        addToast('success', 'Course published successfully');
      }
    } catch (error) {
      addToast('error', 'Failed to update course status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">Published</Badge>;
      case 'draft':
        return <Badge variant="warning">Draft</Badge>;
      case 'archived':
        return <Badge variant="default">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your training courses
          </p>
        </div>
        {isInstructor && (
          <Link to="/builder">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Create Course
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <Card.Body>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-xl" />
              <Card.Body>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first course'}
            </p>
            {isInstructor && !searchTerm && (
              <Link to="/builder">
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  Create Course
                </Button>
              </Link>
            )}
          </Card.Body>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden group">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-100">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  {getStatusBadge(course.status)}
                </div>
                
                {/* Actions Overlay */}
                {isInstructor && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative">
                      <button 
                        className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"
                        onClick={(e) => {
                          const menu = e.currentTarget.nextElementSibling;
                          menu?.classList.toggle('hidden');
                        }}
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="hidden absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <Link to={`/builder/${course.id}`}>
                          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDuplicate(course)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                        >
                          <Copy className="w-4 h-4" /> Duplicate
                        </button>
                        <button 
                          onClick={() => handleTogglePublish(course)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                        >
                          {course.status === 'published' ? (
                            <><EyeOff className="w-4 h-4" /> Unpublish</>
                          ) : (
                            <><Eye className="w-4 h-4" /> Publish</>
                          )}
                        </button>
                        <hr className="my-1" />
                        <button 
                          onClick={() => handleDelete(course)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Card.Body>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {course.shortDescription || course.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{course.enrollmentsCount || 0} learners</span>
                  <span>{course.sections?.length || 0} sections</span>
                </div>

                {course.status === 'published' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link to={`/learn/${course.id}`}>
                      <Button variant="outline" className="w-full">
                        {isInstructor ? 'Preview' : 'Start Learning'}
                      </Button>
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
