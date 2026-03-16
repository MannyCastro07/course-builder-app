import mongoose, { Schema, Document } from 'mongoose';
import { ISection } from '../types';

export interface ISectionDocument extends ISection, Document {}

const SectionSchema = new Schema<ISectionDocument>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'El título de la sección es requerido'],
      trim: true,
      maxlength: [200, 'El título no puede exceder 200 caracteres']
    },
    description: {
      type: String,
      maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
    },
    order: {
      type: Number,
      required: true,
      min: 0
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    lessons: [{
      type: Schema.Types.ObjectId,
      ref: 'Lesson'
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual para duración total de la sección
SectionSchema.virtual('duration').get(function() {
  // Se calculará al popular las lecciones
  return 0;
});

// Virtual para conteo de lecciones
SectionSchema.virtual('lessonCount').get(function() {
  return this.lessons?.length || 0;
});

// Middleware: Reordenar secciones al insertar/actualizar
SectionSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('order')) {
    // Asegurar que el orden sea único dentro del curso
    const existingSection = await mongoose.model('Section').findOne({
      course: this.course,
      order: this.order,
      _id: { $ne: this._id }
    });
    
    if (existingSection) {
      // Incrementar el orden de las secciones siguientes
      await mongoose.model('Section').updateMany(
        { course: this.course, order: { $gte: this.order }, _id: { $ne: this._id } },
        { $inc: { order: 1 } }
      );
    }
  }
  next();
});

// Middleware: Actualizar curso después de guardar
SectionSchema.post('save', async function() {
  try {
    const Course = mongoose.model('Course');
    await Course.findByIdAndUpdate(this.course, {
      $addToSet: { sections: this._id }
    });
  } catch (error) {
    console.error('Error updating course sections:', error);
  }
});

// Middleware: Actualizar curso después de eliminar
SectionSchema.post('remove', async function() {
  try {
    const Course = mongoose.model('Course');
    await Course.findByIdAndUpdate(this.course, {
      $pull: { sections: this._id }
    });
  } catch (error) {
    console.error('Error removing section from course:', error);
  }
});

// Índices
SectionSchema.index({ course: 1, order: 1 });

export const Section = mongoose.model<ISectionDocument>('Section', SectionSchema);
