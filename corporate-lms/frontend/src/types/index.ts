// Types for Corporate LMS

export type UserRole = 'admin' | 'instructor' | 'learner';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  createdAt: string;
}

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  instructorId: string;
  instructor?: User;
  status: CourseStatus;
  category?: string;
  duration?: number;
  sections: Section[];
  enrollmentsCount?: number;
  completionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  position: number;
  lessons: Lesson[];
  createdAt: string;
}

export type ContentType = 'text' | 'video' | 'document' | 'quiz' | 'assignment' | 'code';

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  contentType: ContentType;
  content: string;
  videoUrl?: string;
  duration?: number;
  isPreview: boolean;
  position: number;
  resources?: Resource[];
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  user?: User;
  courseId: string;
  course?: Course;
  status: 'active' | 'completed';
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  lastAccessedAt?: string;
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  passingScore: number;
  questions: Question[];
}

export interface Question {
  id: string;
  quizId: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  content: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  answers: Record<string, string>;
  passed: boolean;
  submittedAt: string;
}

export interface Assignment {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  dueDate?: string;
  maxScore: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  userId: string;
  fileUrl?: string;
  comment?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  course?: Course;
  issuedAt: string;
  certificateNumber: string;
}

// Form Inputs
export interface CreateCourseInput {
  title: string;
  description: string;
  category?: string;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  status?: CourseStatus;
}

export interface CreateSectionInput {
  title: string;
  description?: string;
}

export interface CreateLessonInput {
  title: string;
  contentType: ContentType;
  content?: string;
  videoUrl?: string;
  isPreview?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
