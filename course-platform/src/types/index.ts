import type { ReactNode } from 'react';
import type { AppRole } from '@/utils/auth';

// ============================================
// USER TYPES AND AUTHENTICATION
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  role: AppRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// COURSE TYPES
// ============================================

export interface CourseFilters {
  search?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StudentFilters {
  search?: string;
  courseId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCourseData {
  title: string;
  description: string;
  category: string;
  price?: number;
  currency?: string;
  slug?: string;
  keywords?: string;
  access?: string;
  coursePageTemplate?: string;
  selectedCoursePageTemplate?: string | null;
  afterPurchase?: {
    type: string;
    navigationType: string;
    settings: {
      url: string;
      page: string;
    };
  };
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  thumbnail?: string;
  status?: 'draft' | 'published' | 'archived' | 'coming_soon';
  price?: number;
  currency?: string;
  category?: string;
  tags?: string[];
  slug?: string;
  keywords?: string;
  access?: string;
  coursePageTemplate?: string;
  selectedCoursePageTemplate?: string | null;
  afterPurchase?: {
    type: string;
    navigationType: string;
    settings: {
      url: string;
      page: string;
    };
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail?: string;
  status: 'draft' | 'published' | 'archived' | 'coming_soon';
  access: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  keywords?: string;
  coursePageTemplate?: string;
  selectedCoursePageTemplate?: string | null;
  afterPurchase?: {
    type: string;
    navigationType: string;
    settings: {
      url: string;
      page: string;
    };
  };
  instructorId: string;
  instructor?: User;
  sections: Section[];
  enrolledStudents: number;
  totalLessons: number;
  totalDuration: number;
  rating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
  accessStatus: 'draft' | 'soon' | 'free' | 'paid';
  isExpanded?: boolean;
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
  content?: LessonContent;
  type: 'video' | 'text' | 'pdf' | 'image' | 'quiz' | 'assignment' | 'download';
  order: number;
  duration: number;
  isPreview: boolean;
  videoUrl?: string;
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonContent {
  type: 'rich-text' | 'video' | 'embed' | 'quiz' | 'file' | 'gallery';
  data: string | QuizData;
}

export interface QuizData {
  questions: Question[];
  passingScore: number;
  timeLimit?: number;
  attemptsAllowed: number;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

// ============================================
// STUDENT TYPES AND PROGRESS
// ============================================

export interface Student {
  id: string;
  userId: string;
  user: User;
  enrolledCourses: Enrollment[];
  totalProgress: number;
  lastActive: Date;
  createdAt: Date;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  course: Course;
  progress: number;
  completedLessons: string[];
  startedAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  status: 'active' | 'completed' | 'dropped';
}

// ============================================
// EDITOR TYPES
// ============================================

export interface DraggableItem {
  id: string;
  type: 'section' | 'lesson' | 'component';
  data: Section | Lesson | PageComponent;
}

export interface PageComponent {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  children?: PageComponent[];
}

export type ComponentType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'video'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'columns'
  | 'card'
  | 'quote'
  | 'code'
  | 'embed';

// ============================================
// REPORTS AND ANALYTICS
// ============================================

export interface DashboardMetrics {
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  activeStudents: number;
  courseCompletions: number;
  averageRating: number;
  revenueGrowth: number;
  studentGrowth: number;
}

export interface CourseAnalytics {
  courseId: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  averageProgress: number;
  revenue: number;
  ratings: RatingDistribution;
  engagementOverTime: TimeSeriesData[];
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface StudentActivity {
  studentId: string;
  studentName: string;
  action: string;
  courseId?: string;
  lessonId?: string;
  timestamp: Date;
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface SchoolSettings {
  name: string;
  description: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  timezone: string;
  language: string;
  currency: string;
  emailSettings: EmailSettings;
  paymentSettings: PaymentSettings;
  socialLinks: SocialLinks;
}

export interface EmailSettings {
  senderName: string;
  senderEmail: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
}

export interface PaymentSettings {
  stripePublicKey?: string;
  stripeSecretKey?: string;
  paypalClientId?: string;
  paypalSecret?: string;
  currency: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

// ============================================
// UI TYPES
// ============================================

export interface TableColumn<T> {
  key: string;
  title: string;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (row: T) => ReactNode;
}

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
}
