import { Request, Response } from 'express';
import { validationResult, body, param } from 'express-validator';
import { Section } from '../models/Section';
import { Course } from '../models/Course';
import { Lesson } from '../models/Lesson';

export class SectionController {
  // ============================================
  // VALIDACIONES
  // ============================================
  static validateCreate = [
    param('courseId')
      .isMongoId()
      .withMessage('ID de curso inválido'),
    body('title')
      .trim()
      .notEmpty()
      .withMessage('El título es requerido')
      .isLength({ max: 200 })
      .withMessage('El título no puede exceder 200 caracteres'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('El orden debe ser un número positivo')
  ];

  static validateUpdate = [
    param('id')
      .isMongoId()
      .withMessage('ID de sección inválido'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('El título no puede estar vacío')
  ];

  static validateReorder = [
    param('courseId')
      .isMongoId()
      .withMessage('ID de curso inválido'),
    body('sectionOrders')
      .isArray()
      .withMessage('sectionOrders debe ser un array')
      .notEmpty()
      .withMessage('sectionOrders no puede estar vacío')
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

      const { courseId } = req.params;
      const { title, description, order } = req.body;

      // Verificar que el curso existe
      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Si no se especifica orden, agregar al final
      let sectionOrder = order;
      if (sectionOrder === undefined) {
        const lastSection = await Section.findOne({ course: courseId })
          .sort({ order: -1 });
        sectionOrder = lastSection ? lastSection.order + 1 : 0;
      }

      const section = await Section.create({
        course: courseId,
        title,
        description,
        order: sectionOrder,
        isPublished: false,
        lessons: []
      });

      res.status(201).json({
        success: true,
        message: 'Sección creada exitosamente',
        data: section
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  getByCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId } = req.params;

      const sections = await Section.find({ course: courseId })
        .populate({
          path: 'lessons',
          options: { sort: { order: 1 } }
        })
        .sort({ order: 1 });

      res.json({
        success: true,
        data: sections
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

      const section = await Section.findById(id)
        .populate({
          path: 'lessons',
          options: { sort: { order: 1 } }
        });

      if (!section) {
        res.status(404).json({
          success: false,
          message: 'Sección no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: section
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

      const section = await Section.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!section) {
        res.status(404).json({
          success: false,
          message: 'Sección no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Sección actualizada exitosamente',
        data: section
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

      const section = await Section.findById(id);
      if (!section) {
        res.status(404).json({
          success: false,
          message: 'Sección no encontrada'
        });
        return;
      }

      // Eliminar todas las lecciones de la sección
      await Lesson.deleteMany({ section: id });

      // Eliminar la sección
      await Section.findByIdAndDelete(id);

      // Reordenar las secciones restantes
      await Section.updateMany(
        { course: section.course, order: { $gt: section.order } },
        { $inc: { order: -1 } }
      );

      res.json({
        success: true,
        message: 'Sección eliminada exitosamente'
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { courseId } = req.params;
      const { sectionOrders } = req.body;

      // sectionOrders debe ser un array de { sectionId, order }
      const updatePromises = sectionOrders.map(async (item: any) => {
        return Section.findByIdAndUpdate(
          item.sectionId,
          { order: item.order },
          { new: true }
        );
      });

      await Promise.all(updatePromises);

      // Obtener secciones actualizadas
      const sections = await Section.find({ course: courseId })
        .sort({ order: 1 });

      res.json({
        success: true,
        message: 'Secciones reordenadas exitosamente',
        data: sections
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

      const section = await Section.findByIdAndUpdate(
        id,
        { isPublished: true },
        { new: true }
      );

      if (!section) {
        res.status(404).json({
          success: false,
          message: 'Sección no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Sección publicada exitosamente',
        data: section
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

      const section = await Section.findByIdAndUpdate(
        id,
        { isPublished: false },
        { new: true }
      );

      if (!section) {
        res.status(404).json({
          success: false,
          message: 'Sección no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Sección despublicada exitosamente',
        data: section
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

      const originalSection = await Section.findById(id)
        .populate('lessons');

      if (!originalSection) {
        res.status(404).json({
          success: false,
          message: 'Sección no encontrada'
        });
        return;
      }

      // Crear copia
      const sectionData = originalSection.toObject();
      delete sectionData._id;
      delete sectionData.createdAt;
      delete sectionData.updatedAt;
      delete sectionData.lessons;

      sectionData.title = `${sectionData.title} (Copia)`;
      sectionData.isPublished = false;

      // Obtener último orden
      const lastSection = await Section.findOne({ course: sectionData.course })
        .sort({ order: -1 });
      sectionData.order = lastSection ? lastSection.order + 1 : 0;

      const newSection = await Section.create(sectionData);

      // Duplicar lecciones
      for (const lesson of originalSection.lessons as any[]) {
        const lessonData = lesson.toObject();
        delete lessonData._id;
        delete lessonData.createdAt;
        delete lessonData.updatedAt;
        lessonData.section = newSection._id;
        lessonData.isPublished = false;

        await Lesson.create(lessonData);
      }

      // Recargar sección con lecciones
      const sectionWithLessons = await Section.findById(newSection._id)
        .populate('lessons');

      res.status(201).json({
        success: true,
        message: 'Sección duplicada exitosamente',
        data: sectionWithLessons
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
}
