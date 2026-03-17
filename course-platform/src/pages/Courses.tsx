import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores';
import { useCourses } from '@/hooks';
import { DataTable } from '@/components/common';
import { Button, Card, CardHeader, CardTitle, Input, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Grid,
  List,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatDate, formatNumber } from '@/utils';
import type { Course } from '@/types';

export function Courses() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useUIStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  React.useEffect(() => {
    setBreadcrumbs([{ label: 'Courses', href: '/admin/courses' }]);
  }, [setBreadcrumbs]);

  const { courses, total, isLoading, deleteCourse, duplicateCourse, publishCourse, unpublishCourse } = useCourses({
    filters: {
      search: searchQuery,
      status: statusFilter === 'all' ? undefined : statusFilter,
    },
    page,
    limit: 10,
  });

  const handleDelete = async (course: Course) => {
    if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
      deleteCourse(course.id);
    }
  };

  const handleDuplicate = (course: Course) => {
    duplicateCourse(course.id);
  };

  const handleTogglePublish = (course: Course) => {
    if (course.status === 'published') {
      unpublishCourse(course.id);
    } else {
      publishCourse(course.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
      draft: 'secondary',
      published: 'success',
      archived: 'destructive',
    };
    const labels: Record<string, string> = {
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const columns = [
    {
      key: 'course',
      title: 'Course',
      render: (row: Course) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
            {row.thumbnail ? (
              <img src={row.thumbnail} alt={row.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{row.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-1">{row.description}</p>
          </div>
        </div>
      ),
    },
    { key: 'price', title: 'Price', render: (row: Course) => formatCurrency(row.price, row.currency) },
    { key: 'students', title: 'Students', render: (row: Course) => formatNumber(row.enrolledStudents) },
    { key: 'lessons', title: 'Lessons', render: (row: Course) => `${row.totalLessons} lessons` },
    { key: 'status', title: 'Status', render: (row: Course) => getStatusBadge(row.status) },
    { key: 'updated', title: 'Updated', render: (row: Course) => formatDate(row.updatedAt, 'MM/dd/yyyy') },
    {
      key: 'actions',
      title: '',
      render: (row: Course) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/admin/courses/${row.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/admin/courses/${row.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicate(row)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleTogglePublish(row)}>
              {row.status === 'published' ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Publish
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(row)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage your courses and content</p>
        </div>
        <Button onClick={() => navigate('/admin/courses/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Course
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-4 w-full sm:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Course List */}
      {viewMode === 'list' ? (
        <DataTable
          data={courses}
          columns={columns}
          keyExtractor={(row) => row.id}
          loading={isLoading}
          pagination={{
            page,
            limit: 10,
            total,
            onPageChange: setPage,
          }}
          emptyMessage="No courses found"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {courses.map((course: Course) => (
            <Card key={course.id} className="overflow-hidden group cursor-pointer" onClick={() => navigate(`/admin/courses/${course.id}/edit`)}>
              <div className="aspect-video bg-muted relative overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(course.status)}
                </div>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
              </CardHeader>
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {course.totalLessons} lessons
                  </span>
                  <span className="font-medium">{formatCurrency(course.price, course.currency)}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatNumber(course.enrolledStudents)} students</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
