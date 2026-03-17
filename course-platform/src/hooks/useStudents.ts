import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services';
import { showSuccessToast, showErrorToast } from '@/stores';
import type { StudentFilters } from '@/types';

const STUDENTS_KEY = 'students';
const STUDENT_KEY = 'student';

interface UseStudentsOptions {
  filters?: StudentFilters;
  page?: number;
  limit?: number;
}

export function useStudents(options: UseStudentsOptions = {}) {
  const { filters = {}, page = 1, limit = 10 } = options;
  const queryClient = useQueryClient();

  // Get all students
  const studentsQuery = useQuery({
    queryKey: [STUDENTS_KEY, filters, page, limit],
    queryFn: () => studentService.getStudents(filters, page, limit),
    staleTime: 5 * 60 * 1000,
  });

  // Update student mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Parameters<typeof studentService.updateStudent>[1]> }) =>
      studentService.updateStudent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [STUDENT_KEY, variables.id] });
      showSuccessToast('Estudiante actualizado', 'Los cambios han sido guardados');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error al actualizar',
        error.response?.data?.message || 'No se pudo actualizar el estudiante'
      );
    },
  });

  // Delete student mutation
  const deleteMutation = useMutation({
    mutationFn: studentService.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
      showSuccessToast('Estudiante eliminado', 'El estudiante ha sido eliminado exitosamente');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error al eliminar',
        error.response?.data?.message || 'No se pudo eliminar el estudiante'
      );
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation<void, Error, string[]>({
    mutationFn: studentService.bulkDeleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
      showSuccessToast('Estudiantes eliminados', 'Los estudiantes han sido eliminados exitosamente');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error al eliminar',
        error.response?.data?.message || 'No se pudieron eliminar los estudiantes'
      );
    },
  });

  // Enroll student mutation
  const enrollMutation = useMutation({
    mutationFn: studentService.enrollStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
      showSuccessToast('Estudiante inscrito', 'El estudiante ha sido inscrito exitosamente');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error al inscribir',
        error.response?.data?.message || 'No se pudo inscribir el estudiante'
      );
    },
  });

  // Bulk enroll mutation
  const bulkEnrollMutation = useMutation<void, Error, { studentIds: string[]; courseId: string }>({
    mutationFn: studentService.bulkEnroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
      showSuccessToast('Estudiantes inscritos', 'Los estudiantes han sido inscritos exitosamente');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error al inscribir',
        error.response?.data?.message || 'No se pudieron inscribir los estudiantes'
      );
    },
  });

  return {
    // Data
    students: studentsQuery.data?.data || [],
    total: studentsQuery.data?.total || 0,
    totalPages: studentsQuery.data?.totalPages || 0,
    isLoading: studentsQuery.isLoading,
    isError: studentsQuery.isError,
    error: studentsQuery.error,

    // Mutations
    updateStudent: updateMutation.mutate,
    deleteStudent: deleteMutation.mutate,
    bulkDeleteStudents: bulkDeleteMutation.mutate,
    enrollStudent: enrollMutation.mutate,
    bulkEnrollStudents: bulkEnrollMutation.mutate,

    // Loading states
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isEnrolling: enrollMutation.isPending,
    isBulkEnrolling: bulkEnrollMutation.isPending,

    // Refetch
    refetch: studentsQuery.refetch,
  };
}

// Hook to get a single student
export function useStudent(id: string | undefined) {
  const studentQuery = useQuery({
    queryKey: [STUDENT_KEY, id],
    queryFn: () => studentService.getStudent(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // Get student enrollments
  const enrollmentsQuery = useQuery({
    queryKey: [STUDENT_KEY, id, 'enrollments'],
    queryFn: () => studentService.getEnrollments(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // Get student activity
  const activityQuery = useQuery({
    queryKey: [STUDENT_KEY, id, 'activity'],
    queryFn: () => studentService.getStudentActivity(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

  return {
    student: studentQuery.data,
    enrollments: enrollmentsQuery.data || [],
    activity: activityQuery.data || [],
    isLoading: studentQuery.isLoading || enrollmentsQuery.isLoading,
    isError: studentQuery.isError || enrollmentsQuery.isError,
    error: studentQuery.error || enrollmentsQuery.error,
    refetch: () => {
      studentQuery.refetch();
      enrollmentsQuery.refetch();
    },
  };
}

// Hook to get student statistics
export function useStudentStatistics() {
  return useQuery({
    queryKey: ['studentStatistics'],
    queryFn: studentService.getStudentStatistics,
    staleTime: 5 * 60 * 1000,
  });
}
