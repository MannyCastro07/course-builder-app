import { supabase } from '@/lib/supabase';
import type { Student, Enrollment, PaginatedResponse, User } from '@/types';

interface StudentFilters {
  search?: string;
  courseId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UpdateStudentData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface EnrollmentData {
  studentId: string;
  courseId: string;
}

const mapStudentFromSupabase = (data: any): Student => ({
  id: data.id,
  userId: data.id,
  user: {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: '', // Not in profile by default, in auth.users
    role: data.role,
    avatar: data.avatar_url,
    bio: data.bio
  } as User,
  enrolledCourses: data.enrollments ? data.enrollments.map(mapEnrollmentFromSupabase) : [],
  totalProgress: 0,
  lastActive: new Date(data.updated_at),
  createdAt: new Date(data.created_at),
});

const mapEnrollmentFromSupabase = (data: any): Enrollment => ({
  id: data.id,
  studentId: data.user_id,
  courseId: data.course_id,
  course: data.courses ? {
      id: data.courses.id,
      title: data.courses.title,
      thumbnail: data.courses.thumbnail_url
  } as any : undefined,
  progress: data.progress,
  completedLessons: [],
  startedAt: new Date(data.created_at),
  lastAccessedAt: new Date(data.last_accessed_at),
  status: data.status as any,
});

export const studentService = {
  // Student CRUD
  async getStudents(filters?: StudentFilters, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Student>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('profiles')
      .select('*, enrollments(*, courses(id, title, thumbnail_url))', { count: 'exact' })
      .eq('role', 'student');

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
    }

    const { data, count, error } = await query
      .order(filters?.sortBy || 'created_at', { ascending: filters?.sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    return {
      data: data.map(mapStudentFromSupabase),
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  async getStudent(id: string): Promise<Student> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, enrollments(*, courses(id, title, thumbnail_url))')
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapStudentFromSupabase(data);
  },

  async updateStudent(id: string, data: UpdateStudentData): Promise<Student> {
    const { data: student, error } = await supabase
      .from('profiles')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapStudentFromSupabase(student);
  },

  async deleteStudent(id: string): Promise<void> {
    // Note: This usually requires an edge function or admin client to delete from auth.users
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Enrollments
  async getEnrollments(studentId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, courses(id, title, thumbnail_url)')
      .eq('user_id', studentId);

    if (error) throw error;
    return data.map(mapEnrollmentFromSupabase);
  },

  async enrollStudent(data: EnrollmentData): Promise<Enrollment> {
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: data.studentId,
        course_id: data.courseId,
        status: 'active'
      })
      .select('*, courses(id, title, thumbnail_url)')
      .single();

    if (error) throw error;
    return mapEnrollmentFromSupabase(enrollment);
  },

  async unenrollStudent(enrollmentId: string): Promise<void> {
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId);

    if (error) throw error;
  },

  async updateEnrollmentProgress(
    enrollmentId: string,
    data: { progress: number; completedLessons?: string[] }
  ): Promise<Enrollment> {
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .update({
        progress: data.progress,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', enrollmentId)
      .select('*, courses(id, title, thumbnail_url)')
      .single();

    if (error) throw error;
    return mapEnrollmentFromSupabase(enrollment);
  },

  // Statistics
  async getStudentStatistics(): Promise<{
    totalStudents: number;
    activeStudents: number;
    newStudentsThisMonth: number;
    averageProgress: number;
    completionRate: number;
  }> {
    const { count: total } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
    const { count: active } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'enrolled');

    return {
      totalStudents: total || 0,
      activeStudents: active || 0,
      newStudentsThisMonth: 0,
      averageProgress: 0,
      completionRate: 0,
    };
  },
};
