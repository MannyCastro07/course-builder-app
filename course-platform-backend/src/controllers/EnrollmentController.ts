import { Request, Response } from 'express';
import { validationResult, body, param } from 'express-validator';
import { Enrollment } from '../models/Enrollment';
import { Course } from '../models/Course';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { EmailService } from '../services/EmailService';
import { PaymentStatus, EnrollmentStatus } from '../types';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any
});

export class EnrollmentController {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  // ============================================
  // VALIDACIONES
  // ============================================
  static validateEnroll = [
    param('courseId')
      .isMongoId()
      .withMessage('ID de curso inválido')
  ];

  static validateGradeAssignment = [
    param('enrollmentId')
      .isMongoId()
      .withMessage('ID de inscripción inválido'),
    body('lessonId')
      .isMongoId()
      .withMessage('ID de lección inválido'),
    body('grade')
      .isFloat({ min: 0, max: 100 })
      .withMessage('La calificación debe estar entre 0 y 100')
  ];

  // ============================================
  // CRUD OPERACIONES
  // ============================================
  enroll = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { courseId } = req.params;
      const userId = req.userId!;

      // Verificar si el curso existe
      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Verificar si ya está inscrito
      const existingEnrollment = await Enrollment.findOne({
        user: userId,
        course: courseId
      });

      if (existingEnrollment) {
        res.status(400).json({
          success: false,
          message: 'Ya estás inscrito en este curso',
          data: existingEnrollment
        });
        return;
      }

      // Si el curso es gratuito, inscribir directamente
      if (course.pricing.type === 'free' || course.pricing.amount === 0) {
        const enrollment = await Enrollment.create({
          user: userId,
          course: courseId,
          status: EnrollmentStatus.ACTIVE,
          progress: {
            overall: 0,
            lessonsCompleted: [],
            quizzesCompleted: [],
            assignmentsSubmitted: [],
            timeSpent: 0
          },
          enrollmentDate: new Date(),
          payment: {
            transactionId: null as any,
            amount: 0,
            currency: course.pricing.currency,
            paidAt: new Date()
          }
        });

        // Enviar email de confirmación
        const user = await User.findById(userId);
        if (user) {
          await this.emailService.sendEnrollmentConfirmation(
            user.email,
            course.title,
            `${process.env.FRONTEND_URL}/courses/${course.slug}`
          );
        }

        // Notificar al instructor
        const instructor = await User.findById(course.instructor);
        if (instructor) {
          await this.emailService.sendNewEnrollmentNotification(
            instructor.email,
            `${user?.firstName} ${user?.lastName}`,
            course.title
          );
        }

        res.status(201).json({
          success: true,
          message: 'Inscripción exitosa',
          data: enrollment
        });
        return;
      }

      // Si el curso es de pago, crear intención de pago
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(course.getDiscountedPrice() * 100), // Convertir a centavos
        currency: course.pricing.currency.toLowerCase(),
        metadata: {
          courseId: courseId,
          userId: userId
        }
      });

      res.json({
        success: true,
        message: 'Procede al pago para completar la inscripción',
        data: {
          clientSecret: paymentIntent.client_secret,
          amount: course.getDiscountedPrice(),
          currency: course.pricing.currency
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  confirmPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { paymentIntentId } = req.body;

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        res.status(400).json({
          success: false,
          message: 'El pago no ha sido completado'
        });
        return;
      }

      const { courseId, userId } = paymentIntent.metadata;

      // Crear transacción
      const transaction = await Transaction.create({
        user: userId,
        course: courseId,
        type: 'purchase',
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: PaymentStatus.COMPLETED,
        paymentMethod: {
          type: 'card',
          last4: (paymentIntent.charges.data[0]?.payment_method_details?.card as any)?.last4,
          brand: (paymentIntent.charges.data[0]?.payment_method_details?.card as any)?.brand
        },
        stripePaymentIntentId: paymentIntentId,
        stripeChargeId: paymentIntent.charges.data[0]?.id
      });

      // Crear inscripción
      const enrollment = await Enrollment.create({
        user: userId,
        course: courseId,
        status: EnrollmentStatus.ACTIVE,
        progress: {
          overall: 0,
          lessonsCompleted: [],
          quizzesCompleted: [],
          assignmentsSubmitted: [],
          timeSpent: 0
        },
        enrollmentDate: new Date(),
        payment: {
          transactionId: transaction._id,
          amount: transaction.amount,
          currency: transaction.currency,
          paidAt: new Date()
        }
      });

      // Enviar emails
      const [user, course] = await Promise.all([
        User.findById(userId),
        Course.findById(courseId)
      ]);

      if (user && course) {
        await this.emailService.sendEnrollmentConfirmation(
          user.email,
          course.title,
          `${process.env.FRONTEND_URL}/courses/${course.slug}`
        );

        const instructor = await User.findById(course.instructor);
        if (instructor) {
          await this.emailService.sendNewEnrollmentNotification(
            instructor.email,
            `${user.firstName} ${user.lastName}`,
            course.title
          );
        }
      }

      res.json({
        success: true,
        message: 'Pago confirmado e inscripción completada',
        data: enrollment
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  getMyEnrollments = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 10,
        status
      } = req.query;

      const filter: any = { user: req.userId };
      if (status) filter.status = status;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [enrollments, total] = await Promise.all([
        Enrollment.find(filter)
          .populate('course', 'title thumbnail slug instructor stats')
          .sort({ enrollmentDate: -1 })
          .skip(skip)
          .limit(parseInt(limit as string)),
        Enrollment.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          enrollments,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string))
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const enrollment = await Enrollment.findOne({
        _id: id,
        user: req.userId
      }).populate('course');

      if (!enrollment) {
        res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: enrollment
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  getCourseEnrollments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId } = req.params;
      const {
        page = 1,
        limit = 10,
        status
      } = req.query;

      const filter: any = { course: courseId };
      if (status) filter.status = status;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [enrollments, total] = await Promise.all([
        Enrollment.find(filter)
          .populate('user', 'firstName lastName email avatar')
          .sort({ enrollmentDate: -1 })
          .skip(skip)
          .limit(parseInt(limit as string)),
        Enrollment.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          enrollments,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string))
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  updateProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { lessonId, completed } = req.body;

      const enrollment = await Enrollment.findOne({
        _id: id,
        user: req.userId
      });

      if (!enrollment) {
        res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
        return;
      }

      await enrollment.updateProgress(lessonId, completed);

      res.json({
        success: true,
        message: 'Progreso actualizado',
        data: enrollment.progress
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // ============================================
  // OPERACIONES PARA INSTRUCTORES
  // ============================================
  gradeAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { enrollmentId } = req.params;
      const { lessonId, grade, feedback } = req.body;

      const enrollment = await Enrollment.findById(enrollmentId);
      if (!enrollment) {
        res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
        return;
      }

      // Buscar la entrega
      const submissionIndex = enrollment.progress.assignmentsSubmitted.findIndex(
        (s: any) => s.lesson.toString() === lessonId
      );

      if (submissionIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Entrega no encontrada'
        });
        return;
      }

      // Actualizar calificación
      enrollment.progress.assignmentsSubmitted[submissionIndex].grade = grade;
      enrollment.progress.assignmentsSubmitted[submissionIndex].feedback = feedback;
      enrollment.progress.assignmentsSubmitted[submissionIndex].status = 'graded';
      enrollment.progress.assignmentsSubmitted[submissionIndex].gradedAt = new Date();
      enrollment.progress.assignmentsSubmitted[submissionIndex].gradedBy = req.userId;

      await enrollment.save();

      // Enviar email al estudiante
      const [user, course, lesson] = await Promise.all([
        User.findById(enrollment.user),
        Course.findById(enrollment.course),
        (await import('../models/Lesson')).Lesson.findById(lessonId)
      ]);

      if (user && course && lesson) {
        await this.emailService.sendAssignmentGradedEmail(
          user.email,
          course.title,
          lesson.title,
          grade,
          feedback
        );
      }

      res.json({
        success: true,
        message: 'Tarea calificada exitosamente',
        data: enrollment.progress.assignmentsSubmitted[submissionIndex]
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  requestResubmit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { enrollmentId } = req.params;
      const { lessonId, feedback } = req.body;

      const enrollment = await Enrollment.findById(enrollmentId);
      if (!enrollment) {
        res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
        return;
      }

      const submissionIndex = enrollment.progress.assignmentsSubmitted.findIndex(
        (s: any) => s.lesson.toString() === lessonId
      );

      if (submissionIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Entrega no encontrada'
        });
        return;
      }

      enrollment.progress.assignmentsSubmitted[submissionIndex].status = 'resubmit';
      enrollment.progress.assignmentsSubmitted[submissionIndex].feedback = feedback;

      await enrollment.save();

      res.json({
        success: true,
        message: 'Se solicitó reenvío de la tarea',
        data: enrollment.progress.assignmentsSubmitted[submissionIndex]
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // ============================================
  // CERTIFICADOS
  // ============================================
  getCertificate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const enrollment = await Enrollment.findOne({
        _id: id,
        user: req.userId
      }).populate('course');

      if (!enrollment) {
        res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
        return;
      }

      if (!enrollment.isCertificateEligible()) {
        res.status(400).json({
          success: false,
          message: 'No cumples con los requisitos para obtener el certificado'
        });
        return;
      }

      if (!enrollment.certificate) {
        // Generar certificado
        const crypto = await import('crypto');
        const certificateNumber = `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        enrollment.certificate = {
          issuedAt: new Date(),
          certificateNumber,
          url: `${process.env.FRONTEND_URL}/certificates/${certificateNumber}`,
          template: (enrollment.course as any).certificates?.template || 'default'
        };

        await enrollment.save();

        // Enviar email
        const user = await User.findById(req.userId);
        if (user) {
          await this.emailService.sendCourseCompletionEmail(
            user.email,
            (enrollment.course as any).title,
            enrollment.certificate.url
          );
        }
      }

      res.json({
        success: true,
        data: enrollment.certificate
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
}
