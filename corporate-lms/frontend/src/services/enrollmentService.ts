import api from './api';
import { Enrollment, LessonProgress } from '@/types';

export const enrollmentService = {
  async getMyEnrollments(): Promise<Enrollment[]> {
    const response = await api.get<Enrollment[]>('/enrollments');
    return response.data;
  },

  async enroll(courseId: string): Promise<Enrollment> {
    const response = await api.post<Enrollment>(`/courses/${courseId}/enroll`);
    return response.data;
  },

  async unenroll(courseId: string): Promise<void> {
    await api.delete(`/courses/${courseId}/enroll`);
  },

  async getProgress(courseId: string): Promise<{
    progress: number;
    completedLessons: string[];
    totalLessons: number;
  }> {
    const response = await api.get(`/courses/${courseId}/progress`);
    return response.data;
  },

  async markLessonComplete(lessonId: string): Promise<LessonProgress> {
    const response = await api.post<LessonProgress>(`/lessons/${lessonId}/complete`);
    return response.data;
  },

  async markLessonIncomplete(lessonId: string): Promise<void> {
    await api.delete(`/lessons/${lessonId}/complete`);
  },

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    const response = await api.get<Enrollment[]>(`/courses/${courseId}/enrollments`);
    return response.data;
  },
};
