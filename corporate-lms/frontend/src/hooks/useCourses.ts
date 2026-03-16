import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/courseService';
import { CreateCourseInput, UpdateCourseInput, CreateSectionInput, CreateLessonInput } from '@/types';

interface UseCoursesOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export function useCourses(options: UseCoursesOptions = {}) {
  const queryClient = useQueryClient();

  const coursesQuery = useQuery({
    queryKey: ['courses', options],
    queryFn: () => courseService.getAll(options),
  });

  const createMutation = useMutation({
    mutationFn: courseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseInput }) =>
      courseService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: courseService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: courseService.duplicate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: courseService.publish,
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: courseService.unpublish,
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });

  return {
    courses: coursesQuery.data?.data || [],
    meta: coursesQuery.data?.meta,
    isLoading: coursesQuery.isLoading,
    error: coursesQuery.error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    duplicate: duplicateMutation.mutateAsync,
    publish: publishMutation.mutateAsync,
    unpublish: unpublishMutation.mutateAsync,
  };
}

export function useCourse(courseId: string) {
  const queryClient = useQueryClient();

  const courseQuery = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getById(courseId),
    enabled: !!courseId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCourseInput) => courseService.update(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  return {
    course: courseQuery.data,
    isLoading: courseQuery.isLoading,
    error: courseQuery.error,
    update: updateMutation.mutateAsync,
  };
}

export function useSections(courseId: string) {
  const queryClient = useQueryClient();

  const sectionsQuery = useQuery({
    queryKey: ['sections', courseId],
    queryFn: () => courseService.getSections(courseId),
    enabled: !!courseId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSectionInput) => courseService.createSection(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (sectionIds: string[]) => courseService.reorderSections(courseId, sectionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });

  return {
    sections: sectionsQuery.data || [],
    isLoading: sectionsQuery.isLoading,
    create: createMutation.mutateAsync,
    reorder: reorderMutation.mutateAsync,
  };
}

export function useLessons(sectionId: string) {
  const queryClient = useQueryClient();

  const lessonsQuery = useQuery({
    queryKey: ['lessons', sectionId],
    queryFn: () => courseService.getLessons(sectionId),
    enabled: !!sectionId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateLessonInput) => courseService.createLesson(sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', sectionId] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (lessonIds: string[]) => courseService.reorderLessons(sectionId, lessonIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', sectionId] });
    },
  });

  return {
    lessons: lessonsQuery.data || [],
    isLoading: lessonsQuery.isLoading,
    create: createMutation.mutateAsync,
    reorder: reorderMutation.mutateAsync,
  };
}
