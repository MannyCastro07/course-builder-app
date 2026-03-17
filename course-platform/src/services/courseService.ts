import { supabase } from '@/lib/supabase';
import type { Course, Section, Lesson, PaginatedResponse, CourseFilters, CreateCourseData, UpdateCourseData } from '@/types';
import { normalizeLessonRecord, serializeLessonContent } from '@/utils/lessonContent';

const mapCourseFromSupabase = (data: any): Course => ({
  id: data.id,
  title: data.title,
  description: data.description,
  slug: data.slug,
  thumbnail: data.thumbnail_url,
  status: data.status,
  access: data.access || 'private',
  price: parseFloat(data.price || 0),
  currency: data.currency,
  category: data.category,
  tags: [],
  keywords: data.keywords,
  coursePageTemplate: data.course_page_template,
  selectedCoursePageTemplate: data.selected_course_page_template,
  afterPurchase: data.after_purchase,
  instructorId: data.instructor_id,
  instructor: data.profiles ? {
    id: data.profiles.id,
    firstName: data.profiles.first_name,
    lastName: data.profiles.last_name,
    email: '',
    role: data.profiles.role,
    avatar: data.profiles.avatar_url,
  } : undefined,
  sections: data.sections ? data.sections.map(mapSectionFromSupabase) : [],
  enrolledStudents: data.enrollments?.[0]?.count || 0,
  totalLessons: 0,
  totalDuration: 0,
  rating: 0,
  reviewsCount: 0,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
} as Course);

const mapSectionFromSupabase = (data: any): Section => ({
  id: data.id,
  courseId: data.course_id,
  title: data.title,
  order: data.order,
  accessStatus: data.access_status || 'draft',
  lessons: data.lessons ? data.lessons.map(mapLessonFromSupabase) : [],
});

const mapLessonFromSupabase = (data: any): Lesson => {
  const normalized = normalizeLessonRecord(data);

  return {
    id: data.id,
    sectionId: data.section_id,
    title: data.title,
    description: normalized.description,
    content: normalized.content,
    type: data.type as any,
    order: data.order,
    duration: data.duration,
    isPreview: data.is_free,
    videoUrl: normalized.videoUrl,
    attachments: normalized.attachments,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at || data.created_at),
  } as Lesson;
};

async function ensureUniqueSlug(slug: string, excludeCourseId?: string): Promise<boolean> {
  let query = supabase.from('courses').select('id').eq('slug', slug);
  if (excludeCourseId) query = query.neq('id', excludeCourseId);
  const { data, error } = await query.limit(1);
  if (error) throw error;
  return !data || data.length === 0;
}

export const courseService = {
  async isSlugAvailable(slug: string, excludeCourseId?: string): Promise<boolean> {
    return ensureUniqueSlug(slug, excludeCourseId);
  },

  async getCourses(filters?: CourseFilters, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Course>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('courses')
      .select('*, profiles(id, first_name, last_name, role, avatar_url), enrollments(count)', { count: 'exact' });

    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, count, error } = await query
      .order(filters?.sortBy || 'created_at', { ascending: filters?.sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    return {
      data: data.map(mapCourseFromSupabase),
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  async getCourse(id: string): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .select('*, profiles(id, first_name, last_name, role, avatar_url), sections(*, lessons(*))')
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapCourseFromSupabase(data);
  },

  async createCourse(data: CreateCourseData): Promise<Course> {
    const { data: userData } = await supabase.auth.getUser();

    if (data.slug) {
      const isAvailable = await ensureUniqueSlug(data.slug);
      if (!isAvailable) throw new Error('Course URL already exists');
    }

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        currency: data.currency || 'USD',
        slug: data.slug || data.title.toLowerCase().replace(/ /g, '-'),
        instructor_id: userData.user?.id,
        keywords: data.keywords,
        access: data.access || 'private',
        status: data.access === 'draft' ? 'draft' : 'published',
        course_page_template: data.coursePageTemplate || 'default',
        selected_course_page_template: data.selectedCoursePageTemplate,
        after_purchase: data.afterPurchase,
      })
      .select()
      .single();

    if (error) throw error;
    return mapCourseFromSupabase(course);
  },

  async updateCourse(id: string, data: UpdateCourseData): Promise<Course> {
    const updates: any = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.slug !== undefined) {
      const isAvailable = await ensureUniqueSlug(data.slug, id);
      if (!isAvailable) throw new Error('Course URL already exists');
      updates.slug = data.slug;
    }
    if (data.description !== undefined) updates.description = data.description;
    if (data.thumbnail !== undefined) updates.thumbnail_url = data.thumbnail;
    if (data.status !== undefined) updates.status = data.status;
    if (data.price !== undefined) updates.price = data.price;
    if (data.currency !== undefined) updates.currency = data.currency;
    if (data.category !== undefined) updates.category = data.category;
    if (data.keywords !== undefined) updates.keywords = data.keywords;
    if (data.access !== undefined) updates.access = data.access;
    if (data.coursePageTemplate !== undefined) updates.course_page_template = data.coursePageTemplate;
    if (data.selectedCoursePageTemplate !== undefined) updates.selected_course_page_template = data.selectedCoursePageTemplate;
    if (data.afterPurchase !== undefined) updates.after_purchase = data.afterPurchase;

    const { data: course, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapCourseFromSupabase(course);
  },

  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
  },

  async duplicateCourse(id: string): Promise<Course> {
    const { data: original, error: getError } = await supabase
      .from('courses')
      .select('*, sections(*, lessons(*))')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    const { data: newCourse, error: insertError } = await supabase
      .from('courses')
      .insert({
        title: `${original.title} (Copy)`,
        description: original.description,
        thumbnail_url: original.thumbnail_url,
        category: original.category,
        price: original.price,
        currency: original.currency,
        status: 'draft',
        instructor_id: original.instructor_id,
        slug: `${original.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    for (const section of original.sections || []) {
      const { data: newSection, error: sectionError } = await supabase
        .from('sections')
        .insert({
          course_id: newCourse.id,
          title: section.title,
          order: section.order,
        })
        .select()
        .single();

      if (sectionError) throw sectionError;

      if (section.lessons && section.lessons.length > 0) {
        const lessonsToInsert = section.lessons.map((l: any) => ({
          course_id: newCourse.id,
          section_id: newSection.id,
          title: l.title,
          content: l.content,
          type: l.type,
          order: l.order,
          is_free: l.is_free,
          duration: l.duration,
          video_url: l.video_url,
        }));

        const { error: lessonsError } = await supabase.from('lessons').insert(lessonsToInsert);
        if (lessonsError) throw lessonsError;
      }
    }

    return mapCourseFromSupabase(newCourse);
  },

  async publishCourse(id: string): Promise<void> {
    const { error } = await supabase.from('courses').update({ status: 'published' }).eq('id', id);
    if (error) throw error;
  },

  async unpublishCourse(id: string): Promise<void> {
    const { error } = await supabase.from('courses').update({ status: 'draft' }).eq('id', id);
    if (error) throw error;
  },

  async createSection(courseId: string, data: { title: string; order?: number }): Promise<Section> {
    const { data: section, error } = await supabase
      .from('sections')
      .insert({ course_id: courseId, title: data.title, order: data.order || 0 })
      .select()
      .single();

    if (error) throw error;
    return mapSectionFromSupabase(section);
  },

  async updateSection(_courseId: string, sectionId: string, data: Partial<Section>): Promise<Section> {
    const { data: section, error } = await supabase
      .from('sections')
      .update({ title: data.title, order: data.order, access_status: data.accessStatus })
      .eq('id', sectionId)
      .select()
      .single();

    if (error) throw error;
    return mapSectionFromSupabase(section);
  },

  async deleteSection(_courseId: string, sectionId: string): Promise<void> {
    const { error } = await supabase.from('sections').delete().eq('id', sectionId);
    if (error) throw error;
  },

  async createLesson(courseId: string, sectionId: string, data: Partial<Lesson>): Promise<Lesson> {
    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        section_id: sectionId,
        title: data.title,
        content: serializeLessonContent(data),
        type: data.type || 'video',
        order: data.order || 0,
        is_free: data.isPreview || false,
        duration: data.duration || 0,
        video_url: data.videoUrl || null,
      })
      .select()
      .single();

    if (error) throw error;
    return mapLessonFromSupabase(lesson);
  },

  async updateLesson(_courseId: string, _sectionId: string, lessonId: string, data: Partial<Lesson>): Promise<Lesson> {
    const updates: any = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.type !== undefined) updates.type = data.type;
    if (data.order !== undefined) updates.order = data.order;
    if (data.isPreview !== undefined) updates.is_free = data.isPreview;
    if (data.duration !== undefined) updates.duration = data.duration;
    if (data.videoUrl !== undefined) updates.video_url = data.videoUrl || null;

    if (data.content !== undefined || data.attachments !== undefined || data.description !== undefined) {
      updates.content = serializeLessonContent(data);
    }

    const { data: lesson, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', lessonId)
      .select()
      .single();

    if (error) throw error;
    return mapLessonFromSupabase(lesson);
  },

  async deleteLesson(_courseId: string, _sectionId: string, lessonId: string): Promise<void> {
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
    if (error) throw error;
  },

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase.from('courses').select('category');
    if (error) throw error;
    return [...new Set(data.map((i: any) => i.category))];
  },

  async getCourseAnalytics(_courseId: string) {
    return { enrollments: 120, completions: 45, revenue: 1200, rating: 4.8 };
  }
};
