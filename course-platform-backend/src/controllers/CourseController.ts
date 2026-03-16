import { Request, Response } from 'express';
import { validationResult, body, param, query } from 'express-validator';
import { Course } from '../models/Course';
import { Section } from '../models/Section';
import { Lesson } from '../models/Lesson';
import { Enrollment } from '../models/Enrollment';
import { CourseStatus, UserRole } from '../types';
import slugify from 'slugify';

export class CourseController {
  // ============================================
  // VALIDACIONES
  // ============================================
  static validateCreate = [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('El título es requerido')
      .isLength({ max: 200 })
      .withMessage('El título no puede exceder 200 caracteres'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('La descripción es requerida'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('La categoría es requerida'),
    body('level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced', 'all_levels'])
      .withMessage('Nivel inválido'),
    body('pricing.type')
      .optional()
      .isIn(['free', 'paid', 'subscription'])
      .withMessage('Tipo de precio inválido'),
    body('pricing.amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser un número positivo')
  ];

  static validateUpdate = [
    param('id')
      .isMongoId()
      .withMessage('ID de curso inválido'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('El título no puede estar vacío'),
    body('description')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('La descripción no puede estar vacía')
  ];

  static validateGetBySlug = [
    param('slug')
      .trim()
      .notEmpty()
      .withMessage('El slug es requerido')
  ];

  static validateList = [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página inválida'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Límite inválido'),
    query('category')
      .optional()
      .trim(),
    query('level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced', 'all_levels']),
    query('search')
      .optional()
      .trim(),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 }),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 }),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'price', 'rating', 'students']),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
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

      const courseData = {
        ...req.body,
        instructor: req.userId
      };

      const course = await Course.create(courseData);

      res.status(201).json({
        success: true,
        message: 'Curso creado exitosamente',
        data: course
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const {
        page = 1,
        limit = 10,
        category,
        level,
        search,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Construir filtro
      const filter: any = { status: CourseStatus.PUBLISHED };

      if (category) filter.category = category;
      if (level) filter.level = level;
      if (search) {
        filter.$text = { $search: search as string };
      }
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter['pricing.amount'] = {};
        if (minPrice !== undefined) filter['pricing.amount'].$gte = parseFloat(minPrice as string);
        if (maxPrice !== undefined) filter['pricing.amount'].$lte = parseFloat(maxPrice as string);
      }

      // Construir ordenamiento
      const sort: any = {};
      if (sortBy === 'price') {
        sort['pricing.amount'] = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'rating') {
        sort['stats.averageRating'] = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'students') {
        sort['stats.totalStudents'] = sortOrder === 'asc' ? 1 : -1;
      } else {
        sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [courses, total] = await Promise.all([
        Course.find(filter)
          .populate('instructor', 'firstName lastName avatar')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit as string))
          .lean(),
        Course.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          courses,
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

      const course = await Course.findById(id)
        .populate('instructor', 'firstName lastName avatar bio')
        .populate({
          path: 'sections',
          populate: {
            path: 'lessons',
            select: 'title description type duration order isPreview'
          }
        });

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Verificar si el usuario está inscrito
      let isEnrolled = false;
      let userProgress = null;

      if (req.userId) {
        isEnrolled = await Enrollment.isUserEnrolled(req.userId, id);
        if (isEnrolled) {
          const enrollment = await Enrollment.findOne({
            user: req.userId,
            course: id
          });
          userProgress = enrollment?.progress;
        }
      }

      res.json({
        success: true,
        data: {
          course,
          isEnrolled,
          userProgress
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  getBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { slug } = req.params;

      const course = await Course.findOne({ slug, status: CourseStatus.PUBLISHED })
        .populate('instructor', 'firstName lastName avatar bio socialLinks')
        .populate({
          path: 'sections',
          match: { isPublished: true },
          options: { sort: { order: 1 } },
          populate: {
            path: 'lessons',
            match: { isPublished: true },
            options: { sort: { order: 1 } },
            select: 'title description type duration order isPreview slug'
          }
        });

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: course
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

      // No permitir cambiar el instructor
      delete updateData.instructor;

      const course = await Course.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Curso actualizado exitosamente',
        data: course
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

      const course = await Course.findById(id);

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Verificar si hay inscripciones activas
      const activeEnrollments = await Enrollment.countDocuments({
        course: id,
        status: { $in: ['active', 'completed'] }
      });

      if (activeEnrollments > 0) {
        // Archivar en lugar de eliminar
        course.status = CourseStatus.ARCHIVED;
        await course.save();

        res.json({
          success: true,
          message: 'Curso archivado exitosamente (tiene inscripciones activas)'
        });
        return;
      }

      // Eliminar secciones y lecciones asociadas
      await Section.deleteMany({ course: id });
      await Lesson.deleteMany({ course: id });

      // Eliminar curso
      await Course.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Curso eliminado exitosamente'
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
  publish = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const course = await Course.findById(id);

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Validar requisitos para publicar
      const sections = await Section.find({ course: id });
      if (sections.length === 0) {
        res.status(400).json({
          success: false,
          message: 'El curso debe tener al menos una sección'
        });
        return;
      }

      let totalLessons = 0;
      for (const section of sections) {
        totalLessons += section.lessons.length;
      }

      if (totalLessons === 0) {
        res.status(400).json({
          success: false,
          message: 'El curso debe tener al menos una lección'
        });
        return;
      }

      course.status = CourseStatus.PUBLISHED;
      course.publishedAt = new Date();
      await course.save();

      res.json({
        success: true,
        message: 'Curso publicado exitosamente',
        data: course
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

      const course = await Course.findByIdAndUpdate(
        id,
        { status: CourseStatus.DRAFT },
        { new: true }
      );

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Curso despublicado exitosamente',
        data: course
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  duplicate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const originalCourse = await Course.findById(id)
        .populate({
          path: 'sections',
          populate: { path: 'lessons' }
        });

      if (!originalCourse) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Crear copia del curso
      const courseData = originalCourse.toObject();
      delete courseData._id;
      delete courseData.slug;
      delete courseData.createdAt;
      delete courseData.updatedAt;
      delete courseData.publishedAt;
      delete courseData.stats;
      delete courseData.ratings;
      delete courseData.sections;

      courseData.title = `${courseData.title} (Copia)`;
      courseData.status = CourseStatus.DRAFT;
      courseData.instructor = req.userId;

      const newCourse = await Course.create(courseData);

      // Duplicar secciones y lecciones
      for (const section of originalCourse.sections as any[]) {
        const sectionData = section.toObject();
        delete sectionData._id;
        delete sectionData.createdAt;
        delete sectionData.updatedAt;
        sectionData.course = newCourse._id;
        sectionData.isPublished = false;

        const newSection = await Section.create(sectionData);

        // Duplicar lecciones
        for (const lessonId of section.lessons) {
          const lesson = await Lesson.findById(lessonId);
          if (lesson) {
            const lessonData = lesson.toObject();
            delete lessonData._id;
            delete lessonData.createdAt;
            delete lessonData.updatedAt;
            lessonData.course = newCourse._id;
            lessonData.section = newSection._id;
            lessonData.isPublished = false;

            await Lesson.create(lessonData);
          }
        }
      }

      res.status(201).json({
        success: true,
        message: 'Curso duplicado exitosamente',
        data: newCourse
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  getInstructorCourses = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 10,
        status
      } = req.query;

      const filter: any = { instructor: req.userId };
      if (status) filter.status = status;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [courses, total] = await Promise.all([
        Course.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit as string))
          .lean(),
        Course.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          courses,
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

  getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await Course.distinct('category', {
        status: CourseStatus.PUBLISHED
      });

      res.json({
        success: true,
        data: categories
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  addRating = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { rating, review } = req.body;

      // Verificar inscripción
      const isEnrolled = await Enrollment.isUserEnrolled(req.userId!, id);
      if (!isEnrolled) {
        res.status(403).json({
          success: false,
          message: 'Debes estar inscrito en el curso para calificarlo'
        });
        return;
      }

      const course = await Course.findById(id);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Verificar si ya calificó
      const existingRating = course.ratings.find(
        r => r.user.toString() === req.userId
      );

      if (existingRating) {
        // Actualizar calificación existente
        existingRating.rating = rating;
        existingRating.review = review;
      } else {
        // Agregar nueva calificación
        course.ratings.push({
          user: req.userId!,
          rating,
          review,
          createdAt: new Date()
        });
      }

      await course.save();

      res.json({
        success: true,
        message: 'Calificación agregada exitosamente',
        data: course.stats
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
}
