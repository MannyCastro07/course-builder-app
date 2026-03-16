import api from './api';
import { Course, CreateCourseInput, UpdateCourseInput, Section, Lesson, CreateSectionInput, CreateLessonInput } from '@/types';

interface CoursesResponse {
  data: Course[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export const courseService = {
  // Courses
  async getAll(params?: { page?: number; limit?: number; search?: string; category?: string }): Promise<CoursesResponse> {
    const response = await api.get<CoursesResponse>('/courses', { params });
    return response.data;
  },

  async getById(id: string): Promise<Course> {
    const response = await api.get<Course>(`/courses/${id}`);
    return response.data;
  },

  async create(data: CreateCourseInput): Promise<Course> {
    const response = await api.post<Course>('/courses', data);
    return response.data;
  },

  async update(id: string, data: UpdateCourseInput): Promise<Course> {
    const response = await api.put<Course>(`/courses/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  },

  async duplicate(id: string): Promise<Course> {
    const response = await api.post<Course>(`/courses/${id}/duplicate`);
    return response.data;
  },

  async publish(id: string): Promise<Course> {
    const response = await api.post<Course>(`/courses/${id}/publish`);
    return response.data;
  },

  async unpublish(id: string): Promise<Course> {
    const response = await api.post<Course>(`/courses/${id}/unpublish`);
    return response.data;
  },

  // Sections
  async getSections(courseId: string): Promise<Section[]> {
    const response = await api.get<Section[]>(`/courses/${courseId}/sections`);
    return response.data;
  },

  async createSection(courseId: string, data: CreateSectionInput): Promise<Section> {
    const response = await api.post<Section>(`/courses/${courseId}/sections`, data);
    return response.data;
  },

  async updateSection(sectionId: string, data: Partial<CreateSectionInput>): Promise<Section> {
    const response = await api.put<Section>(`/sections/${sectionId}`, data);
    return response.data;
  },

  async deleteSection(sectionId: string): Promise<void> {
    await api.delete(`/sections/${sectionId}`);
  },

  async reorderSections(courseId: string, sectionIds: string[]): Promise<void> {
    await api.post(`/courses/${courseId}/sections/reorder`, { sectionIds });
  },

  // Lessons
  async getLessons(sectionId: string): Promise<Lesson[]> {
    const response = await api.get<Lesson[]>(`/sections/${sectionId}/lessons`);
    return response.data;
  },

  async createLesson(sectionId: string, data: CreateLessonInput): Promise<Lesson> {
    const response = await api.post<Lesson>(`/sections/${sectionId}/lessons`, data);
    return response.data;
  },

  async updateLesson(lessonId: string, data: Partial<CreateLessonInput>): Promise<Lesson> {
    const response = await api.put<Lesson>(`/lessons/${lessonId}`, data);
    return response.data;
  },

  async deleteLesson(lessonId: string): Promise<void> {
    await api.delete(`/lessons/${lessonId}`);
  },

  async reorderLessons(sectionId: string, lessonIds: string[]): Promise<void> {
    await api.post(`/sections/${sectionId}/lessons/reorder`, { lessonIds });
  },
};
