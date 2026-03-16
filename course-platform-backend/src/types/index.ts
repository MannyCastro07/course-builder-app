// ============================================
// TIPOS Y ENUMS GLOBALES
// ============================================

export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student'
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  UNDER_REVIEW = 'under_review'
}

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  DOWNLOADABLE = 'downloadable',
  LIVE_SESSION = 'live_session'
}

export enum ContentStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error',
  PENDING = 'pending'
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
  REFUNDED = 'refunded',
  EXPIRED = 'expired'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum NotificationType {
  EMAIL = 'email',
  PUSH = 'push',
  IN_APP = 'in_app',
  SMS = 'sms'
}

// ============================================
// INTERFACES DE USUARIO
// ============================================

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  phone?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  emailVerificationToken?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  preferences: IUserPreferences;
  socialLinks?: ISocialLinks;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserPreferences {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    showProfile: boolean;
    showProgress: boolean;
  };
}

export interface ISocialLinks {
  website?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  facebook?: string;
}

// ============================================
// INTERFACES DE CURSO
// ============================================

export interface ICourse {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  instructor: string | IUser;
  category: string;
  subcategory?: string;
  tags: string[];
  thumbnail?: string;
  trailer?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  language: string;
  status: CourseStatus;
  pricing: ICoursePricing;
  settings: ICourseSettings;
  seo?: ISEO;
  stats: ICourseStats;
  sections: string[] | ISection[];
  ratings: IRating[];
  certificates: ICertificateConfig;
  createdAt?: Date;
  updatedAt?: Date;
  publishedAt?: Date;
}

export interface ICoursePricing {
  type: 'free' | 'paid' | 'subscription';
  amount?: number;
  currency: string;
  discount?: {
    enabled: boolean;
    amount?: number;
    type?: 'percentage' | 'fixed';
    startDate?: Date;
    endDate?: Date;
  };
}

export interface ICourseSettings {
  isLifetimeAccess: boolean;
  accessDuration?: number; // en días
  dripContent: boolean;
  dripSchedule?: IDripSchedule[];
  completionCertificate: boolean;
  allowDiscussions: boolean;
  isDownloadable: boolean;
  prerequisites: string[];
}

export interface IDripSchedule {
  sectionId: string;
  daysAfterEnrollment: number;
}

export interface ISEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface ICourseStats {
  totalStudents: number;
  totalLessons: number;
  totalDuration: number; // en segundos
  averageRating: number;
  totalRatings: number;
  completionRate: number;
}

export interface IRating {
  user: string | IUser;
  rating: number;
  review?: string;
  createdAt: Date;
}

export interface ICertificateConfig {
  enabled: boolean;
  template?: string;
  completionCriteria: {
    minProgress: number;
    minQuizScore?: number;
    requireAllAssignments: boolean;
  };
}

// ============================================
// INTERFACES DE SECCIÓN Y LECCIÓN
// ============================================

export interface ISection {
  _id?: string;
  course: string | ICourse;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  lessons: string[] | ILesson[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILesson {
  _id?: string;
  section: string | ISection;
  course: string | ICourse;
  title: string;
  description?: string;
  type: LessonType;
  content: ILessonContent;
  order: number;
  duration?: number; // en segundos
  isPreview: boolean;
  isPublished: boolean;
  resources: IResource[];
  settings: ILessonSettings;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILessonContent {
  video?: IVideoContent;
  text?: ITextContent;
  quiz?: IQuizContent;
  assignment?: IAssignmentContent;
  downloadable?: IDownloadableContent;
  liveSession?: ILiveSessionContent;
}

export interface IVideoContent {
  url: string;
  thumbnail?: string;
  duration: number;
  resolutions: IVideoResolution[];
  captions: ICaption[];
  processingStatus: ContentStatus;
}

export interface IVideoResolution {
  quality: '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '4K';
  url: string;
  size: number;
}

export interface ICaption {
  language: string;
  label: string;
  url: string;
}

export interface ITextContent {
  body: string;
  formatted: boolean;
}

export interface IQuizContent {
  questions: IQuestion[];
  settings: IQuizSettings;
}

export interface IQuestion {
  _id?: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  question: string;
  options?: IQuizOption[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
  order: number;
}

export interface IQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface IQuizSettings {
  timeLimit?: number; // en minutos
  maxAttempts: number;
  passingScore: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
}

export interface IAssignmentContent {
  instructions: string;
  attachments: IResource[];
  submissionType: 'file' | 'text' | 'both';
  maxFileSize?: number;
  allowedFileTypes?: string[];
  dueDate?: Date;
  gradingCriteria?: string;
  points: number;
}

export interface IDownloadableContent {
  files: IResource[];
}

export interface ILiveSessionContent {
  platform: 'zoom' | 'teams' | 'custom';
  meetingUrl?: string;
  meetingId?: string;
  password?: string;
  scheduledAt: Date;
  duration: number;
  recordingUrl?: string;
  isRecorded: boolean;
}

export interface IResource {
  _id?: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

export interface ILessonSettings {
  allowComments: boolean;
  requirePreviousLesson: boolean;
  freePreview: boolean;
}

// ============================================
// INTERFACES DE INSCRIPCIÓN Y PROGRESO
// ============================================

export interface IEnrollment {
  _id?: string;
  user: string | IUser;
  course: string | ICourse;
  status: EnrollmentStatus;
  progress: IProgress;
  enrollmentDate: Date;
  completionDate?: Date;
  expiryDate?: Date;
  payment: IPaymentReference;
  certificate?: ICertificate;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProgress {
  overall: number; // 0-100
  lessonsCompleted: string[];
  quizzesCompleted: IQuizResult[];
  assignmentsSubmitted: IAssignmentSubmission[];
  lastAccessedLesson?: string;
  lastAccessedAt?: Date;
  timeSpent: number; // en segundos
}

export interface IQuizResult {
  lesson: string;
  attempt: number;
  score: number;
  maxScore: number;
  answers: IAnswer[];
  passed: boolean;
  completedAt: Date;
  timeSpent: number;
}

export interface IAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
}

export interface IAssignmentSubmission {
  lesson: string;
  submission: string;
  attachments: IResource[];
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: string;
  status: 'submitted' | 'graded' | 'resubmit';
}

export interface IPaymentReference {
  transactionId: string;
  amount: number;
  currency: string;
  paidAt: Date;
}

export interface ICertificate {
  issuedAt: Date;
  certificateNumber: string;
  url: string;
  template: string;
}

// ============================================
// INTERFACES DE PAGO
// ============================================

export interface ITransaction {
  _id?: string;
  user: string | IUser;
  course: string | ICourse;
  type: 'purchase' | 'refund' | 'subscription' | 'payout';
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: IPaymentMethod;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  invoiceUrl?: string;
  metadata: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPaymentMethod {
  type: 'card' | 'paypal' | 'bank_transfer' | 'crypto';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

// ============================================
// INTERFACES DE NOTIFICACIÓN
// ============================================

export interface INotification {
  _id?: string;
  user: string | IUser;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  sentAt: Date;
  readAt?: Date;
}

// ============================================
// INTERFACES DE ARCHIVOS MULTIMEDIA
// ============================================

export interface IMediaFile {
  _id?: string;
  originalName: string;
  filename: string;
  path: string;
  url: string;
  mimetype: string;
  size: number;
  uploadedBy: string | IUser;
  course?: string | ICourse;
  lesson?: string | ILesson;
  processingStatus: ContentStatus;
  variants?: IMediaVariant[];
  metadata: IMediaMetadata;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMediaVariant {
  type: string;
  url: string;
  size: number;
  width?: number;
  height?: number;
}

export interface IMediaMetadata {
  width?: number;
  height?: number;
  duration?: number;
  codec?: string;
  bitrate?: number;
  fps?: number;
}

// ============================================
// INTERFACES DE WEBHOOK
// ============================================

export interface IWebhook {
  _id?: string;
  user: string | IUser;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  lastTriggeredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum WebhookEvent {
  COURSE_CREATED = 'course.created',
  COURSE_UPDATED = 'course.updated',
  COURSE_PUBLISHED = 'course.published',
  USER_ENROLLED = 'user.enrolled',
  USER_COMPLETED = 'user.completed',
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_FAILED = 'payment.failed',
  LESSON_COMPLETED = 'lesson.completed',
  CERTIFICATE_ISSUED = 'certificate.issued'
}

// ============================================
// INTERFACES DE AUTENTICACIÓN
// ============================================

export interface ITokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface IAuthResponse {
  user: Omit<IUser, 'password'>;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================
// INTERFACES DE REPORTES
// ============================================

export interface IInstructorDashboard {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  monthlyRevenue: IMonthlyData[];
  coursePerformance: ICoursePerformance[];
  recentEnrollments: IRecentEnrollment[];
}

export interface IMonthlyData {
  month: string;
  revenue: number;
  enrollments: number;
}

export interface ICoursePerformance {
  courseId: string;
  title: string;
  students: number;
  revenue: number;
  completionRate: number;
  rating: number;
}

export interface IRecentEnrollment {
  user: string;
  course: string;
  enrolledAt: Date;
  amount: number;
}

export interface IAdminDashboard {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  activeEnrollments: number;
  usersByRole: Record<UserRole, number>;
  revenueByMonth: IMonthlyData[];
  topCourses: ICoursePerformance[];
  recentTransactions: ITransaction[];
}
