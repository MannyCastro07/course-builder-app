import { Request, Response } from 'express';
import { validationResult, body, param } from 'express-validator';
import { Lesson } from '../models/Lesson';
import { Section } from '../models/Section';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { LessonType, ContentStatus } from '../types';

export class LessonController {
  // ============================================
  // VALIDACIONES
  // ============================================
  static validateCreate = [
    param('sectionId')
      .isMongoId()
      .withMessage('ID de sección inválido'),
    body('title')
      .trim()
      .notEmpty()
      .withMessage('El título es requerido')
      .isLength({ max: 200 })
      .withMessage('El título no puede exceder 200 caracteres'),
    body('type')
      .isIn(Object.values(LessonType))
      .withMessage('Tipo de lección inválido'),
    body('content')
      .isObject()
      .withMessage('El contenido debe ser un objeto')
  ];

  static validateUpdate = [
    param('id')
      .isMongoId()
      .withMessage('ID de lección inválido'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('El título no puede estar vacío')
  ];

  static validateComplete = [
    param('id')
      .isMongoId()
      .withMessage('ID de lección inválido')
  ];

  // ============================================
  // CRUD OPERACIONES
  // ============================================
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { sectionId } = req.params;
      const { title, description, type, content, duration, isPreview } = req.body;

      // Verificar que la sección existe
      const section = await Section.findById(sectionId);
      if (!section) {
        res.status(404).json({
          success: false,
          message: 'Sección no encontrada'
        });
        return;
      }

      // Obtener último orden
      const lastLesson = await Lesson.findOne({ section: sectionId })
        .sort({ order: -1 });
      const order = lastLesson ? lastLesson.order + 1 : 0;

      const lesson = await Lesson.create({
        section: sectionId,
        course: section.course,
        title,
        description,
        type,
        content,
        order,
        duration: duration || 0,
        isPreview: isPreview || false,
        isPublished: false,
        resources: [],
        settings: {
          allowComments: true,
          requirePreviousLesson: false,
          freePreview: isPreview || false
        }
      });

      res.status(201).json({
        success: true,
        message: 'Lección creada exitosamente',
        data: lesson
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  getBySection = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sectionId } = req.params;

      const lessons = await Lesson.find({ section: sectionId })
        .sort({ order: 1 });

      res.json({
        success: true,
        data: lessons
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

      const lesson = await Lesson.findById(id);

      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      // Verificar acceso
      if (!lesson.isPreview && !lesson.isPublished) {
        // Verificar si el usuario está inscrito
        if (!req.userId) {
          res.status(401).json({
            success: false,
            message: 'Acceso no autorizado'
          });
          return;
        }

        const isEnrolled = await Enrollment.isUserEnrolled(
          req.userId,
          lesson.course.toString()
        );

        if (!isEnrolled) {
          res.status(403).json({
            success: false,
            message: 'Debes estar inscrito para ver esta lección'
          });
          return;
        }
      }

      res.json({
        success: true,
        data: lesson
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      const lesson = await Lesson.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Lección actualizada exitosamente',
        data: lesson
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const lesson = await Lesson.findById(id);
      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      await Lesson.findByIdAndDelete(id);

      // Reordenar lecciones restantes
      await Lesson.updateMany(
        { section: lesson.section, order: { $gt: lesson.order } },
        { $inc: { order: -1 } }
      );

      res.json({
        success: true,
        message: 'Lección eliminada exitosamente'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // ============================================
  // OPERACIONES ADICIONALES
  // ============================================
  reorder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sectionId } = req.params;
      const { lessonOrders } = req.body;

      const updatePromises = lessonOrders.map(async (item: any) => {
        return Lesson.findByIdAndUpdate(
          item.lessonId,
          { order: item.order },
          { new: true }
        );
      });

      await Promise.all(updatePromises);

      const lessons = await Lesson.find({ section: sectionId })
        .sort({ order: 1 });

      res.json({
        success: true,
        message: 'Lecciones reordenadas exitosamente',
        data: lessons
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  publish = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const lesson = await Lesson.findById(id);
      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      // Validar contenido según el tipo
      if (lesson.type === LessonType.VIDEO) {
        if (!lesson.content?.video?.url) {
          res.status(400).json({
            success: false,
            message: 'La lección de video debe tener una URL de video'
          });
          return;
        }
      } else if (lesson.type === LessonType.TEXT) {
        if (!lesson.content?.text?.body) {
          res.status(400).json({
            success: false,
            message: 'La lección de texto debe tener contenido'
          });
          return;
        }
      } else if (lesson.type === LessonType.QUIZ) {
        if (!lesson.content?.quiz?.questions?.length) {
          res.status(400).json({
            success: false,
            message: 'El cuestionario debe tener al menos una pregunta'
          });
          return;
        }
      }

      lesson.isPublished = true;
      await lesson.save();

      res.json({
        success: true,
        message: 'Lección publicada exitosamente',
        data: lesson
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  unpublish = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const lesson = await Lesson.findByIdAndUpdate(
        id,
        { isPublished: false },
        { new: true }
      );

      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Lección despublicada exitosamente',
        data: lesson
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  complete = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const userId = req.userId!;

      const lesson = await Lesson.findById(id);
      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      // Verificar inscripción
      const enrollment = await Enrollment.findOne({
        user: userId,
        course: lesson.course
      });

      if (!enrollment) {
        res.status(403).json({
          success: false,
          message: 'Debes estar inscrito para completar esta lección'
        });
        return;
      }

      // Marcar lección como completada
      await enrollment.updateProgress(id, true);

      res.json({
        success: true,
        message: 'Lección marcada como completada',
        data: {
          progress: enrollment.progress
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  submitQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { answers } = req.body; // Array de { questionId, answer }
      const userId = req.userId!;

      const lesson = await Lesson.findById(id);
      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      if (lesson.type !== LessonType.QUIZ) {
        res.status(400).json({
          success: false,
          message: 'Esta lección no es un cuestionario'
        });
        return;
      }

      // Verificar inscripción
      const enrollment = await Enrollment.findOne({
        user: userId,
        course: lesson.course
      });

      if (!enrollment) {
        res.status(403).json({
          success: false,
          message: 'Debes estar inscrito para realizar este cuestionario'
        });
        return;
      }

      const quiz = lesson.content!.quiz!;
      const questions = quiz.questions;

      // Calcular resultado
      let score = 0;
      let maxScore = 0;
      const processedAnswers = [];

      for (const question of questions) {
        maxScore += question.points;
        const userAnswer = answers.find(
          (a: any) => a.questionId === (question as any)._id.toString()
        );

        let isCorrect = false;
        let points = 0;

        if (userAnswer) {
          if (question.type === 'multiple_choice' || question.type === 'true_false') {
            const correctOption = question.options?.find(o => o.isCorrect);
            isCorrect = userAnswer.answer === correctOption?.id;
          } else if (question.type === 'short_answer') {
            isCorrect = userAnswer.answer.toLowerCase().trim() === 
                       (question.correctAnswer as string).toLowerCase().trim();
          }

          if (isCorrect) {
            points = question.points;
            score += points;
          }
        }

        processedAnswers.push({
          questionId: (question as any)._id.toString(),
          answer: userAnswer?.answer,
          isCorrect,
          points
        });
      }

      const passed = score >= (quiz.settings.passingScore / 100) * maxScore;

      // Guardar resultado
      const quizResult = {
        lesson: id,
        attempt: (enrollment.progress.quizzesCompleted?.length || 0) + 1,
        score,
        maxScore,
        answers: processedAnswers,
        passed,
        completedAt: new Date(),
        timeSpent: req.body.timeSpent || 0
      };

      enrollment.progress.quizzesCompleted.push(quizResult as any);
      
      if (passed) {
        await enrollment.updateProgress(id, true);
      }

      await enrollment.save();

      res.json({
        success: true,
        data: {
          score,
          maxScore,
          percentage: Math.round((score / maxScore) * 100),
          passed,
          showCorrectAnswers: quiz.settings.showCorrectAnswers,
          answers: quiz.settings.showCorrectAnswers ? processedAnswers : undefined
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  submitAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { submission, attachments } = req.body;
      const userId = req.userId!;

      const lesson = await Lesson.findById(id);
      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      if (lesson.type !== LessonType.ASSIGNMENT) {
        res.status(400).json({
          success: false,
          message: 'Esta lección no es una tarea'
        });
        return;
      }

      // Verificar inscripción
      const enrollment = await Enrollment.findOne({
        user: userId,
        course: lesson.course
      });

      if (!enrollment) {
        res.status(403).json({
          success: false,
          message: 'Debes estar inscrito para enviar esta tarea'
        });
        return;
      }

      // Verificar si ya hay una entrega
      const existingSubmission = enrollment.progress.assignmentsSubmitted?.find(
        (s: any) => s.lesson.toString() === id
      );

      if (existingSubmission && existingSubmission.status !== 'resubmit') {
        res.status(400).json({
          success: false,
          message: 'Ya has enviado esta tarea'
        });
        return;
      }

      // Guardar entrega
      const assignmentSubmission = {
        lesson: id,
        submission,
        attachments: attachments || [],
        submittedAt: new Date(),
        status: 'submitted'
      };

      if (existingSubmission) {
        // Actualizar entrega existente
        const index = enrollment.progress.assignmentsSubmitted.findIndex(
          (s: any) => s.lesson.toString() === id
        );
        enrollment.progress.assignmentsSubmitted[index] = assignmentSubmission as any;
      } else {
        enrollment.progress.assignmentsSubmitted.push(assignmentSubmission as any);
      }

      await enrollment.save();

      res.json({
        success: true,
        message: 'Tarea enviada exitosamente',
        data: assignmentSubmission
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
}
