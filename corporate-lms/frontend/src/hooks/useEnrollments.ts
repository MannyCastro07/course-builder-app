import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentService } from '@/services/enrollmentService';

export function useMyEnrollments() {
  const queryClient = useQueryClient();

  const enrollmentsQuery = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: enrollmentService.getMyEnrollments,
  });

  const enrollMutation = useMutation({
    mutationFn: enrollmentService.enroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
    },
  });

  const unenrollMutation = useMutation({
    mutationFn: enrollmentService.unenroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
    },
  });

  return {
    enrollments: enrollmentsQuery.data || [],
    isLoading: enrollmentsQuery.isLoading,
    error: enrollmentsQuery.error,
    enroll: enrollMutation.mutateAsync,
    unenroll: unenrollMutation.mutateAsync,
  };
}

export function useCourseProgress(courseId: string) {
  const queryClient = useQueryClient();

  const progressQuery = useQuery({
    queryKey: ['progress', courseId],
    queryFn: () => enrollmentService.getProgress(courseId),
    enabled: !!courseId,
  });

  const completeLessonMutation = useMutation({
    mutationFn: enrollmentService.markLessonComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
    },
  });

  const incompleteLessonMutation = useMutation({
    mutationFn: enrollmentService.markLessonIncomplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
    },
  });

  return {
    progress: progressQuery.data,
    isLoading: progressQuery.isLoading,
    completeLesson: completeLessonMutation.mutateAsync,
    incompleteLesson: incompleteLessonMutation.mutateAsync,
  };
}

export function useCourseEnrollments(courseId: string) {
  const enrollmentsQuery = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: () => enrollmentService.getCourseEnrollments(courseId),
    enabled: !!courseId,
  });

  return {
    enrollments: enrollmentsQuery.data || [],
    isLoading: enrollmentsQuery.isLoading,
    error: enrollmentsQuery.error,
  };
}
