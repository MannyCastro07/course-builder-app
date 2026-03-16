import { create } from 'zustand';
import { Course, Section, Lesson, ContentType } from '@/types';

interface CourseBuilderState {
  // Current course being edited
  currentCourse: Course | null;
  selectedSectionId: string | null;
  selectedLessonId: string | null;
  
  // UI State
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  isPreviewMode: boolean;
  
  // Actions
  setCurrentCourse: (course: Course | null) => void;
  selectSection: (sectionId: string | null) => void;
  selectLesson: (lessonId: string | null) => void;
  
  // Course actions
  updateCourse: (updates: Partial<Course>) => void;
  
  // Section actions
  addSection: (section: Section) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (sectionIds: string[]) => void;
  
  // Lesson actions
  addLesson: (sectionId: string, lesson: Lesson) => void;
  updateLesson: (lessonId: string, updates: Partial<Lesson>) => void;
  removeLesson: (lessonId: string) => void;
  reorderLessons: (sectionId: string, lessonIds: string[]) => void;
  
  // UI actions
  setIsSaving: (isSaving: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  togglePreviewMode: () => void;
  setPreviewMode: (isPreview: boolean) => void;
  
  // Reset
  reset: () => void;
}

export const useCourseBuilderStore = create<CourseBuilderState>((set, get) => ({
  currentCourse: null,
  selectedSectionId: null,
  selectedLessonId: null,
  isSaving: false,
  hasUnsavedChanges: false,
  isPreviewMode: false,

  setCurrentCourse: (course) => set({ 
    currentCourse: course, 
    selectedSectionId: null, 
    selectedLessonId: null,
    hasUnsavedChanges: false 
  }),

  selectSection: (sectionId) => set({ 
    selectedSectionId: sectionId, 
    selectedLessonId: null 
  }),

  selectLesson: (lessonId) => set({ selectedLessonId: lessonId }),

  updateCourse: (updates) => {
    const { currentCourse } = get();
    if (!currentCourse) return;
    
    set({ 
      currentCourse: { ...currentCourse, ...updates },
      hasUnsavedChanges: true 
    });
  },

  addSection: (section) => {
    const { currentCourse } = get();
    if (!currentCourse) return;
    
    const updatedSections = [...currentCourse.sections, section];
    set({ 
      currentCourse: { ...currentCourse, sections: updatedSections },
      selectedSectionId: section.id,
      selectedLessonId: null,
      hasUnsavedChanges: true 
    });
  },

  updateSection: (sectionId, updates) => {
    const { currentCourse } = get();
    if (!currentCourse) return;
    
    const updatedSections = currentCourse.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    
    set({ 
      currentCourse: { ...currentCourse, sections: updatedSections },
      hasUnsavedChanges: true 
    });
  },

  removeSection: (sectionId) => {
    const { currentCourse, selectedSectionId } = get();
    if (!currentCourse) return;
    
    const updatedSections = currentCourse.sections.filter(s => s.id !== sectionId);
    set({ 
      currentCourse: { ...currentCourse, sections: updatedSections },
      selectedSectionId: selectedSectionId === sectionId ? null : selectedSectionId,
      selectedLessonId: null,
      hasUnsavedChanges: true 
    });
  },

  reorderSections: (sectionIds) => {
    const { currentCourse } = get();
    if (!currentCourse) return;
    
    const sectionMap = new Map(currentCourse.sections.map(s => [s.id, s]));
    const reorderedSections = sectionIds
      .map(id => sectionMap.get(id))
      .filter((s): s is Section => !!s)
      .map((s, index) => ({ ...s, position: index }));
    
    set({ 
      currentCourse: { ...currentCourse, sections: reorderedSections },
      hasUnsavedChanges: true 
    });
  },

  addLesson: (sectionId, lesson) => {
    const { currentCourse } = get();
    if (!currentCourse) return;
    
    const updatedSections = currentCourse.sections.map(section =>
      section.id === sectionId
        ? { ...section, lessons: [...section.lessons, lesson] }
        : section
    );
    
    set({ 
      currentCourse: { ...currentCourse, sections: updatedSections },
      selectedSectionId: sectionId,
      selectedLessonId: lesson.id,
      hasUnsavedChanges: true 
    });
  },

  updateLesson: (lessonId, updates) => {
    const { currentCourse } = get();
    if (!currentCourse) return;
    
    const updatedSections = currentCourse.sections.map(section => ({
      ...section,
      lessons: section.lessons.map(lesson =>
        lesson.id === lessonId ? { ...lesson, ...updates } : lesson
      )
    }));
    
    set({ 
      currentCourse: { ...currentCourse, sections: updatedSections },
      hasUnsavedChanges: true 
    });
  },

  removeLesson: (lessonId) => {
    const { currentCourse, selectedLessonId } = get();
    if (!currentCourse) return;
    
    const updatedSections = currentCourse.sections.map(section => ({
      ...section,
      lessons: section.lessons.filter(l => l.id !== lessonId)
    }));
    
    set({ 
      currentCourse: { ...currentCourse, sections: updatedSections },
      selectedLessonId: selectedLessonId === lessonId ? null : selectedLessonId,
      hasUnsavedChanges: true 
    });
  },

  reorderLessons: (sectionId, lessonIds) => {
    const { currentCourse } = get();
    if (!currentCourse) return;
    
    const updatedSections = currentCourse.sections.map(section => {
      if (section.id !== sectionId) return section;
      
      const lessonMap = new Map(section.lessons.map(l => [l.id, l]));
      const reorderedLessons = lessonIds
        .map(id => lessonMap.get(id))
        .filter((l): l is Lesson => !!l)
        .map((l, index) => ({ ...l, position: index }));
      
      return { ...section, lessons: reorderedLessons };
    });
    
    set({ 
      currentCourse: { ...currentCourse, sections: updatedSections },
      hasUnsavedChanges: true 
    });
  },

  setIsSaving: (isSaving) => set({ isSaving }),
  
  setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
  
  togglePreviewMode: () => set(state => ({ isPreviewMode: !state.isPreviewMode })),
  
  setPreviewMode: (isPreviewMode) => set({ isPreviewMode }),

  reset: () => set({
    currentCourse: null,
    selectedSectionId: null,
    selectedLessonId: null,
    isSaving: false,
    hasUnsavedChanges: false,
    isPreviewMode: false,
  }),
}));
