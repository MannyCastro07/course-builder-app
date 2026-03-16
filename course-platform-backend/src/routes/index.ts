import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { CourseController } from '../controllers/CourseController';
import { SectionController } from '../controllers/SectionController';
import { LessonController } from '../controllers/LessonController';
import { EnrollmentController } from '../controllers/EnrollmentController';
import {
  authenticate,
  authorize,
  authorizeCourseInstructor,
  requireEnrollment,
  requireVerifiedEmail
} from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// Instancias de controladores
const authController = new AuthController();
const courseController = new CourseController();
const sectionController = new SectionController();
const lessonController = new LessonController();
const enrollmentController = new EnrollmentController();

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================
const authRouter = Router();

authRouter.post('/register', AuthController.validateRegister, authController.register);
authRouter.post('/login', AuthController.validateLogin, authController.login);
authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/logout', authController.logout);
authRouter.post('/forgot-password', AuthController.validateForgotPassword, authController.forgotPassword);
authRouter.post('/reset-password', AuthController.validateResetPassword, authController.resetPassword);
authRouter.get('/verify-email', authController.verifyEmail);
authRouter.post('/resend-verification', authController.resendVerification);
authRouter.post('/change-password', authenticate, AuthController.validateChangePassword, authController.changePassword);
authRouter.get('/me', authenticate, authController.getMe);

router.use('/auth', authRouter);

// ============================================
// RUTAS DE CURSOS (PÚBLICAS)
// ============================================
router.get('/courses', CourseController.validateList, courseController.getAll);
router.get('/courses/categories', courseController.getCategories);
router.get('/courses/:slug', CourseController.validateGetBySlug, courseController.getBySlug);
router.get('/courses/:id/details', courseController.getById);

// ============================================
// RUTAS DE CURSOS (PROTEGIDAS)
// ============================================
const courseRouter = Router();
courseRouter.use(authenticate);

// Crear curso (instructores y admin)
courseRouter.post(
  '/',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN),
  CourseController.validateCreate,
  courseController.create
);

// Cursos del instructor
courseRouter.get(
  '/instructor/my-courses',
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN),
  courseController.getInstructorCourses
);

// Operaciones sobre curso específico
courseRouter.put(
  '/:id',
  authorizeCourseInstructor,
  CourseController.validateUpdate,
  courseController.update
);
courseRouter.delete('/:id', authorizeCourseInstructor, courseController.delete);
courseRouter.post('/:id/publish', authorizeCourseInstructor, courseController.publish);
courseRouter.post('/:id/unpublish', authorizeCourseInstructor, courseController.unpublish);
courseRouter.post('/:id/duplicate', authorizeCourseInstructor, courseController.duplicate);

// Calificaciones
courseRouter.post('/:id/rate', requireEnrollment, courseController.addRating);

router.use('/courses', courseRouter);

// ============================================
// RUTAS DE SECCIONES
// ============================================
const sectionRouter = Router();
sectionRouter.use(authenticate);

sectionRouter.post(
  '/:courseId',
  authorizeCourseInstructor,
  SectionController.validateCreate,
  sectionController.create
);
sectionRouter.get('/:courseId/sections', sectionController.getByCourse);
sectionRouter.get('/:id', sectionController.getById);
sectionRouter.put(
  '/:id',
  authorizeCourseInstructor,
  SectionController.validateUpdate,
  sectionController.update
);
sectionRouter.delete('/:id', authorizeCourseInstructor, sectionController.delete);
sectionRouter.post('/:courseId/reorder', authorizeCourseInstructor, sectionController.reorder);
sectionRouter.post('/:id/publish', authorizeCourseInstructor, sectionController.publish);
sectionRouter.post('/:id/unpublish', authorizeCourseInstructor, sectionController.unpublish);
sectionRouter.post('/:id/duplicate', authorizeCourseInstructor, sectionController.duplicate);

router.use('/sections', sectionRouter);

// ============================================
// RUTAS DE LECCIONES
// ============================================
const lessonRouter = Router();
lessonRouter.use(authenticate);

lessonRouter.post(
  '/:sectionId',
  authorizeCourseInstructor,
  LessonController.validateCreate,
  lessonController.create
);
lessonRouter.get('/:sectionId/lessons', lessonController.getBySection);
lessonRouter.get('/:id', lessonController.getById);
lessonRouter.put(
  '/:id',
  authorizeCourseInstructor,
  LessonController.validateUpdate,
  lessonController.update
);
lessonRouter.delete('/:id', authorizeCourseInstructor, lessonController.delete);
lessonRouter.post('/:sectionId/reorder', authorizeCourseInstructor, lessonController.reorder);
lessonRouter.post('/:id/publish', authorizeCourseInstructor, lessonController.publish);
lessonRouter.post('/:id/unpublish', authorizeCourseInstructor, lessonController.unpublish);

// Progreso del estudiante
lessonRouter.post(
  '/:id/complete',
  requireEnrollment,
  LessonController.validateComplete,
  lessonController.complete
);
lessonRouter.post('/:id/quiz/submit', requireEnrollment, lessonController.submitQuiz);
lessonRouter.post('/:id/assignment/submit', requireEnrollment, lessonController.submitAssignment);

router.use('/lessons', lessonRouter);

// ============================================
// RUTAS DE INSCRIPCIONES
// ============================================
const enrollmentRouter = Router();
enrollmentRouter.use(authenticate);

// Inscripciones del estudiante
enrollmentRouter.get('/my-enrollments', enrollmentController.getMyEnrollments);
enrollmentRouter.get('/my-enrollments/:id', enrollmentController.getById);
enrollmentRouter.put('/my-enrollments/:id/progress', enrollmentController.updateProgress);
enrollmentRouter.get('/my-enrollments/:id/certificate', enrollmentController.getCertificate);

// Inscribirse en curso
enrollmentRouter.post(
  '/:courseId/enroll',
  requireVerifiedEmail,
  EnrollmentController.validateEnroll,
  enrollmentController.enroll
);
enrollmentRouter.post('/confirm-payment', enrollmentController.confirmPayment);

// Gestión de inscripciones (instructores)
enrollmentRouter.get(
  '/:courseId/enrollments',
  authorizeCourseInstructor,
  enrollmentController.getCourseEnrollments
);
enrollmentRouter.post(
  '/:enrollmentId/grade',
  authorizeCourseInstructor,
  EnrollmentController.validateGradeAssignment,
  enrollmentController.gradeAssignment
);
enrollmentRouter.post(
  '/:enrollmentId/request-resubmit',
  authorizeCourseInstructor,
  enrollmentController.requestResubmit
);

router.use('/enrollments', enrollmentRouter);

// ============================================
// RUTAS DE ADMIN
// ============================================
const adminRouter = Router();
adminRouter.use(authenticate, authorize(UserRole.ADMIN));

// Gestión de usuarios
adminRouter.get('/users', async (req, res) => {
  const { User } = await import('../models/User');
  const users = await User.find().select('-password');
  res.json({ success: true, data: users });
});

// Estadísticas
adminRouter.get('/stats', async (req, res) => {
  const { User } = await import('../models/User');
  const { Course } = await import('../models/Course');
  const { Enrollment } = await import('../models/Enrollment');
  const { Transaction } = await import('../models/Transaction');

  const [totalUsers, totalCourses, totalEnrollments, totalRevenue] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Transaction.calculateRevenue()
  ]);

  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      usersByRole: usersByRole.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>)
    }
  });
});

router.use('/admin', adminRouter);

export default router;
