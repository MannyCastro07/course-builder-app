import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services';
import { showSuccessToast, showErrorToast } from '@/stores';
import type { Course, CourseFilters } from '@/types';

const COURSES_KEY = 'courses';
const COURSE_KEY = 'course';

interface UseCoursesOptions {
  filters?: CourseFilters;
  page?: number;
  limit?: number;
}

export function useCourses(options: UseCoursesOptions = {}) {
  const { filters = {}, page = 1, limit = 10 } = options;
  const queryClient = useQueryClient();

  // Get all courses
  const coursesQuery = useQuery({
    queryKey: [COURSES_KEY, filters, page, limit],
    queryFn: () => courseService.getCourses(filters, page, limit),
    staleTime: 5 * 60 * 1000,
  });

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: courseService.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY] });
      showSuccessToast('Course created', 'The course has been created successfully');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error creating course',
        error.response?.data?.message || 'Could not create course'
      );
    },
  });

  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) =>
      courseService.updateCourse(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY] });
      queryClient.invalidateQueries({ queryKey: [COURSE_KEY, variables.id] });
      showSuccessToast('Course updated', 'Changes have been saved successfully');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error updating',
        error.response?.data?.message || 'Could not update course'
      );
    },
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: courseService.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY] });
      showSuccessToast('Course deleted', 'The course has been deleted successfully');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error deleting',
        error.response?.data?.message || 'Could not delete course'
      );
    },
  });

  // Duplicate course mutation
  const duplicateMutation = useMutation({
    mutationFn: courseService.duplicateCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY] });
      showSuccessToast('Course duplicated', 'The course has been duplicated successfully');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error duplicating',
        error.response?.data?.message || 'Could not duplicate course'
      );
    },
  });

  // Publish course mutation
  const publishMutation = useMutation({
    mutationFn: courseService.publishCourse,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY] });
      queryClient.invalidateQueries({ queryKey: [COURSE_KEY, id] });
      showSuccessToast('Course published', 'The course is now visible to students');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error publishing',
        error.response?.data?.message || 'Could not publish course'
      );
    },
  });

  // Unpublish course mutation
  const unpublishMutation = useMutation({
    mutationFn: courseService.unpublishCourse,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY] });
      queryClient.invalidateQueries({ queryKey: [COURSE_KEY, id] });
      showSuccessToast('Course unpublished', 'The course is no longer visible to students');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error unpublishing',
        error.response?.data?.message || 'Could not unpublish course'
      );
    },
  });

  return {
    // Data
    courses: coursesQuery.data?.data || [],
    total: coursesQuery.data?.total || 0,
    totalPages: coursesQuery.data?.totalPages || 0,
    isLoading: coursesQuery.isLoading,
    isError: coursesQuery.isError,
    error: coursesQuery.error,

    // Mutations
    createCourse: createMutation.mutate,
    updateCourse: updateMutation.mutate,
    deleteCourse: deleteMutation.mutate,
    duplicateCourse: duplicateMutation.mutate,
    publishCourse: publishMutation.mutate,
    unpublishCourse: unpublishMutation.mutate,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
    isPublishing: publishMutation.isPending,
    isUnpublishing: unpublishMutation.isPending,

    // Refetch
    refetch: coursesQuery.refetch,
  };
}

// Hook to get a single course
export function useCourse(id: string | undefined) {
  const queryClient = useQueryClient();

  const courseQuery = useQuery({
    queryKey: [COURSE_KEY, id],
    queryFn: () => courseService.getCourse(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // Prefetch related courses
  const prefetchCourse = (courseId: string) => {
    queryClient.prefetchQuery({
      queryKey: [COURSE_KEY, courseId],
      queryFn: () => courseService.getCourse(courseId),
    });
  };

  return {
    course: courseQuery.data,
    isLoading: courseQuery.isLoading,
    isError: courseQuery.isError,
    error: courseQuery.error,
    prefetchCourse,
    refetch: courseQuery.refetch,
  };
}

// Hook to get course categories
export function useCourseCategories() {
  return useQuery({
    queryKey: ['courseCategories'],
    queryFn: courseService.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook to get course analytics
export function useCourseAnalytics(courseId: string | undefined) {
  return useQuery({
    queryKey: ['courseAnalytics', courseId],
    queryFn: () => courseService.getCourseAnalytics(courseId!),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}
