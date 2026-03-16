import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Course, Section, Lesson } from '@/types';
import { courseService } from '@/services/courseService';
import { showSuccessToast, showErrorToast } from '@/stores/uiStore';
import { supabase } from '@/lib/supabase';

interface CourseEditorState {
  // Course state in editor
  currentCourse: Course | null;
  selectedSection: Section | null;
  selectedLesson: Lesson | null;
  
  // Editor State
  isEditing: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  
  // UI State
  sidebarExpanded: boolean;
  activeTab: 'content' | 'settings' | 'seo' | 'preview';
  previewMode: 'desktop' | 'tablet' | 'mobile';
  
  // History for undo/redo
  history: Course[];
  historyIndex: number;
}

interface CourseStore extends CourseEditorState {
  // Course Actions
  setCurrentCourse: (course: Course | null) => void;
  updateCourse: (updates: Partial<Course>) => void;
  
  // Section Actions
  addSection: (section: Partial<Section>) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  deleteSection: (sectionId: string) => void;
  reorderSections: (sectionIds: string[]) => void;
  toggleSection: (sectionId: string) => void;
  selectSection: (section: Section | null) => void;
  
  // Lesson Actions
  addLesson: (sectionId: string, lesson: Partial<Lesson>) => void;
  updateLesson: (lessonId: string, updates: Partial<Lesson>) => void;
  deleteLesson: (lessonId: string) => void;
  reorderLessons: (sectionId: string, lessonIds: string[]) => void;
  selectLesson: (lesson: Lesson | null) => void;
  
  // Editor Actions
  setEditing: (editing: boolean) => void;
  setSaving: (saving: boolean) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  
  // UI Actions
  toggleSidebar: () => void;
  setActiveTab: (tab: CourseEditorState['activeTab']) => void;
  setPreviewMode: (mode: CourseEditorState['previewMode']) => void;
  
  // History
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Persistence
  saveCourse: () => Promise<void>;
}

const initialState: CourseEditorState = {
  currentCourse: null,
  selectedSection: null,
  selectedLesson: null,
  isEditing: false,
  isSaving: false,
  hasUnsavedChanges: false,
  sidebarExpanded: true,
  activeTab: 'content',
  previewMode: 'desktop',
  history: [],
  historyIndex: -1,
};

export const useCourseStore = create<CourseStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Course Actions
      setCurrentCourse: (course) => {
        set({ 
          currentCourse: course,
          history: course ? [course] : [],
          historyIndex: course ? 0 : -1,
        });
      },

      // Course Actions
      updateCourse: (updates) => {
        const { currentCourse } = get();
        if (currentCourse) {
          const updated = { ...currentCourse, ...updates, updatedAt: new Date() };
          set({ 
            currentCourse: updated,
            hasUnsavedChanges: true,
          });
        }
      },

      // Section Actions
      addSection: (sectionData) => {
        const { currentCourse } = get();
        if (!currentCourse) return;

        const newSection: Section = {
          title: sectionData.title || 'New Section',
          ...sectionData,
          id: crypto.randomUUID(),
          courseId: currentCourse.id,
          order: currentCourse.sections.length,
          lessons: [],
          accessStatus: 'draft',
          isExpanded: true,
        } as Section;

        const updated = {
          ...currentCourse,
          sections: [...currentCourse.sections, newSection],
          updatedAt: new Date(),
        };

        set({ 
          currentCourse: updated,
          hasUnsavedChanges: true,
        });
        get().saveToHistory();
      },

      updateSection: (sectionId, updates) => {
        const { currentCourse } = get();
        if (!currentCourse) return;

        const updated = {
          ...currentCourse,
          sections: currentCourse.sections.map((s) =>
            s.id === sectionId ? { ...s, ...updates } : s
          ),
          updatedAt: new Date(),
        };

        set({ 
          currentCourse: updated,
          hasUnsavedChanges: true,
          // Update selectedSection if it's the one being updated
          selectedSection: get().selectedSection?.id === sectionId 
            ? { ...get().selectedSection!, ...updates } 
            : get().selectedSection
        });
      },

      deleteSection: (sectionId) => {
        const { currentCourse } = get();
        if (!currentCourse) return;

        const updated = {
          ...currentCourse,
          sections: currentCourse.sections
            .filter((s) => s.id !== sectionId)
            .map((s, i) => ({ ...s, order: i })),
          updatedAt: new Date(),
        };

        set({ 
          currentCourse: updated,
          hasUnsavedChanges: true,
          selectedSection: null,
        });
        get().saveToHistory();
      },

      reorderSections: (sectionIds) => {
        const { currentCourse } = get();
        if (!currentCourse) return;

        const sectionMap = new Map(currentCourse.sections.map((s) => [s.id, s]));
        const reordered = sectionIds
          .map((id) => sectionMap.get(id))
          .filter((s): s is Section => s !== undefined)
          .map((s, i) => ({ ...s, order: i }));

        const updated = {
          ...currentCourse,
          sections: reordered,
          updatedAt: new Date(),
        };

        set({ 
          currentCourse: updated,
          hasUnsavedChanges: true,
        });
        get().saveToHistory();
      },

      toggleSection: (sectionId) => {
        const { currentCourse } = get();
        if (!currentCourse) return;

        const updated = {
          ...currentCourse,
          sections: currentCourse.sections.map((s) =>
            s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s
          ),
        };

        set({ currentCourse: updated });
      },

      selectSection: (section) => {
        set({ 
          selectedSection: section,
          selectedLesson: null,
        });
      },

      // Lesson Actions
      addLesson: (sectionId, lessonData) => {
        const { currentCourse } = get();
        if (!currentCourse) return;

        const newLesson: Lesson = {
          title: lessonData.title || 'New Lesson',
          type: 'video',
          duration: 0,
          isPreview: false,
          attachments: [],
          ...lessonData,
          id: crypto.randomUUID(),
          sectionId,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Lesson;

        const updated = {
          ...currentCourse,
          sections: currentCourse.sections.map((s) =>
            s.id === sectionId
              ? { 
                  ...s, 
                  lessons: [...s.lessons, { ...newLesson, order: s.lessons.length }] 
                }
              : s
          ),
          updatedAt: new Date(),
        };

        const updatedSection = updated.sections.find(s => s.id === sectionId) || null;

        set({ 
          currentCourse: updated,
          hasUnsavedChanges: true,
          selectedSection: updatedSection,
          selectedLesson: { ...newLesson, order: updatedSection?.lessons.length ? updatedSection.lessons.length - 1 : 0 }
        });
        get().saveToHistory();
      },

      updateLesson: (lessonId, updates) => {
        const { currentCourse } = get();
        if (!currentCourse) return;

        const updated = {
          ...currentCourse,
          sections: currentCourse.sections.map((s) => ({
            ...s,
            lessons: s.lessons.map((l) =>
              l.id === lessonId ? { ...l, ...updates, updatedAt: new Date() } : l
            ),
          })),
          updatedAt: new Date(),
        };

        const currentSelectedSectionId = get().selectedSection?.id;
        const updatedSelectedSection = updated.sections.find(s => s.id === currentSelectedSectionId) || null;
        const updatedSelectedLesson = updated.sections
          .flatMap(s => s.lessons)
          .find(l => l.id === lessonId) || null;

        set({ 
          currentCourse: updated,
          hasUnsavedChanges: true,
          selectedSection: updatedSelectedSection,
          selectedLesson: get().selectedLesson?.id === lessonId 
            ? updatedSelectedLesson 
            : get().selectedLesson
        });
      },

      deleteLesson: (lessonId) => {
        const { currentCourse } = get();
        if (!currentCourse) return;

        const updated = {
          ...currentCourse,
          sections: currentCourse.sections.map((s) => ({
            ...s,
            lessons: s.lessons
              .filter((l) => l.id !== lessonId)
              .map((l, i) => ({ ...l, order: i })),
          })),
          updatedAt: new Date(),
        };

        const currentSelectedSectionId = get().selectedSection?.id;
        const updatedSelectedSection = updated.sections.find(s => s.id === currentSelectedSectionId) || null;

        set({ 
          currentCourse: updated,
          hasUnsavedChanges: true,
          selectedSection: updatedSelectedSection,
          selectedLesson: null,
        });
        get().saveToHistory();
      },

      reorderLessons: (sectionId, lessonIds) => {
        const { currentCourse } = get();
        if (!currentCourse) return;

        const section = currentCourse.sections.find((s) => s.id === sectionId);
        if (!section) return;

        const lessonMap = new Map(section.lessons.map((l) => [l.id, l]));
        const reordered = lessonIds
          .map((id) => lessonMap.get(id))
          .filter((l): l is Lesson => l !== undefined)
          .map((l, i) => ({ ...l, order: i }));

        const updated = {
          ...currentCourse,
          sections: currentCourse.sections.map((s) =>
            s.id === sectionId ? { ...s, lessons: reordered } : s
          ),
          updatedAt: new Date(),
        };

        const updatedSection = updated.sections.find(s => s.id === sectionId) || null;

        set({ 
          currentCourse: updated,
          hasUnsavedChanges: true,
          selectedSection: get().selectedSection?.id === sectionId ? updatedSection : get().selectedSection
        });
        get().saveToHistory();
      },

      selectLesson: (lesson) => {
        set({ selectedLesson: lesson });
      },

      // Editor Actions
      setEditing: (editing) => set({ isEditing: editing }),
      setSaving: (saving) => set({ isSaving: saving }),
      setUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

      // UI Actions
      toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setPreviewMode: (mode) => set({ previewMode: mode }),

      // History Actions
      saveToHistory: () => {
        const { currentCourse, history, historyIndex } = get();
        if (!currentCourse) return;

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(currentCourse)));

        // Limit history to 50 states
        if (newHistory.length > 50) {
          newHistory.shift();
        }

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          set({
            currentCourse: JSON.parse(JSON.stringify(history[newIndex])),
            historyIndex: newIndex,
            hasUnsavedChanges: true,
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          set({
            currentCourse: JSON.parse(JSON.stringify(history[newIndex])),
            historyIndex: newIndex,
            hasUnsavedChanges: true,
          });
        }
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // persistence
      saveCourse: async () => {
        const { currentCourse } = get();
        if (!currentCourse) return;

        set({ isSaving: true });
        try {
          // 1. Update main course info
          await courseService.updateCourse(currentCourse.id, {
            title: currentCourse.title,
            description: currentCourse.description,
            thumbnail: currentCourse.thumbnail,
            status: currentCourse.status,
            price: currentCourse.price,
            category: currentCourse.category,
          });

          // 2. Save all sections and their lessons
          for (const section of currentCourse.sections) {
            // Upsert section
            await supabase
              .from('sections')
              .upsert({
                id: section.id,
                course_id: currentCourse.id,
                title: section.title,
                order: section.order,
                access_status: section.accessStatus || 'draft',
              });

            for (const lesson of section.lessons) {
              // Upsert lesson
                const contentData = lesson.content?.data;
                const formattedContent = typeof contentData === 'string' 
                  ? contentData 
                  : (contentData ? JSON.stringify(contentData) : '');

                await supabase
                  .from('lessons')
                  .upsert({
                    id: lesson.id,
                    section_id: section.id,
                    course_id: currentCourse.id,
                    title: lesson.title,
                    content: formattedContent,
                    type: lesson.type,
                    order: lesson.order,
                    is_free: lesson.isPreview,
                    duration: lesson.duration,
                    video_url: lesson.videoUrl,
                  });
            }
          }
          
          set({ hasUnsavedChanges: false });
          showSuccessToast('Course saved', 'Changes have been saved successfully');
        } catch (error) {
          console.error('Error saving course:', error);
          showErrorToast('Error saving', 'The course could not be saved');
        } finally {
          set({ isSaving: false });
        }
      },
    }),
    { name: 'course-store' }
  )
);
