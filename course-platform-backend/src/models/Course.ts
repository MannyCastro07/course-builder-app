import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';
import { ICourse, CourseStatus } from '../types';

export interface ICourseDocument extends ICourse, Document {
  calculateStats(): Promise<void>;
  getDiscountedPrice(): number;
}

const RatingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CourseSchema = new Schema<ICourseDocument>(
  {
    title: {
      type: String,
      required: [true, 'El título es requerido'],
      trim: true,
      maxlength: [200, 'El título no puede exceder 200 caracteres'],
      index: 'text'
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      maxlength: [5000, 'La descripción no puede exceder 5000 caracteres']
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'La descripción corta no puede exceder 300 caracteres']
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'La categoría es requerida'],
      index: true
    },
    subcategory: {
      type: String,
      index: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    thumbnail: {
      type: String
    },
    trailer: {
      type: String
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all_levels'],
      default: 'all_levels'
    },
    language: {
      type: String,
      default: 'es'
    },
    status: {
      type: String,
      enum: Object.values(CourseStatus),
      default: CourseStatus.DRAFT,
      index: true
    },
    pricing: {
      type: {
        type: String,
        enum: ['free', 'paid', 'subscription'],
        default: 'free'
      },
      amount: {
        type: Number,
        min: 0,
        default: 0
      },
      currency: {
        type: String,
        default: 'USD'
      },
      discount: {
        enabled: {
          type: Boolean,
          default: false
        },
        amount: {
          type: Number,
          min: 0
        },
        type: {
          type: String,
          enum: ['percentage', 'fixed']
        },
        startDate: Date,
        endDate: Date
      }
    },
    settings: {
      isLifetimeAccess: {
        type: Boolean,
        default: true
      },
      accessDuration: {
        type: Number,
        min: 1
      },
      dripContent: {
        type: Boolean,
        default: false
      },
      dripSchedule: [{
        sectionId: {
          type: Schema.Types.ObjectId,
          ref: 'Section'
        },
        daysAfterEnrollment: {
          type: Number,
          min: 0
        }
      }],
      completionCertificate: {
        type: Boolean,
        default: true
      },
      allowDiscussions: {
        type: Boolean,
        default: true
      },
      isDownloadable: {
        type: Boolean,
        default: false
      },
      prerequisites: [{
        type: String
      }]
    },
    seo: {
      metaTitle: {
        type: String,
        maxlength: 70
      },
      metaDescription: {
        type: String,
        maxlength: 160
      },
      keywords: [String]
    },
    stats: {
      totalStudents: {
        type: Number,
        default: 0
      },
      totalLessons: {
        type: Number,
        default: 0
      },
      totalDuration: {
        type: Number,
        default: 0
      },
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      totalRatings: {
        type: Number,
        default: 0
      },
      completionRate: {
        type: Number,
        default: 0
      }
    },
    sections: [{
      type: Schema.Types.ObjectId,
      ref: 'Section'
    }],
    ratings: [RatingSchema],
    certificates: {
      enabled: {
        type: Boolean,
        default: true
      },
      template: {
        type: String
      },
      completionCriteria: {
        minProgress: {
          type: Number,
          default: 100,
          min: 0,
          max: 100
        },
        minQuizScore: {
          type: Number,
          min: 0,
          max: 100
        },
        requireAllAssignments: {
          type: Boolean,
          default: true
        }
      }
    },
    publishedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual para enrollments
CourseSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course'
});

// Virtual para calcular precio con descuento
CourseSchema.virtual('currentPrice').get(function() {
  return this.getDiscountedPrice();
});

// Middleware: Generar slug antes de guardar
CourseSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  
  // Actualizar publishedAt cuando se publica
  if (this.isModified('status') && this.status === CourseStatus.PUBLISHED && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Middleware: Actualizar stats cuando se modifican ratings
CourseSchema.pre('save', function(next) {
  if (this.isModified('ratings')) {
    const totalRatings = this.ratings.length;
    const averageRating = totalRatings > 0
      ? this.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;
    
    this.stats.totalRatings = totalRatings;
    this.stats.averageRating = Math.round(averageRating * 10) / 10;
  }
  next();
});

// Método: Calcular estadísticas del curso
CourseSchema.methods.calculateStats = async function(): Promise<void> {
  const sections = await mongoose.model('Section').find({ course: this._id }).populate('lessons');
  
  let totalLessons = 0;
  let totalDuration = 0;
  
  sections.forEach(section => {
    if (section.lessons && Array.isArray(section.lessons)) {
      totalLessons += section.lessons.length;
      section.lessons.forEach((lesson: any) => {
        if (lesson.duration) {
          totalDuration += lesson.duration;
        }
      });
    }
  });
  
  this.stats.totalLessons = totalLessons;
  this.stats.totalDuration = totalDuration;
  await this.save();
};

// Método: Obtener precio con descuento
CourseSchema.methods.getDiscountedPrice = function(): number {
  const { pricing } = this;
  
  if (pricing.type === 'free' || !pricing.amount) {
    return 0;
  }
  
  if (!pricing.discount?.enabled) {
    return pricing.amount;
  }
  
  const now = new Date();
  const { startDate, endDate } = pricing.discount;
  
  // Verificar si el descuento está activo
  if (startDate && now < startDate) return pricing.amount;
  if (endDate && now > endDate) return pricing.amount;
  
  if (pricing.discount.type === 'percentage') {
    return Math.max(0, pricing.amount * (1 - (pricing.discount.amount || 0) / 100));
  } else {
    return Math.max(0, pricing.amount - (pricing.discount.amount || 0));
  }
};

// Método estático: Buscar cursos publicados
CourseSchema.statics.findPublished = function() {
  return this.find({ status: CourseStatus.PUBLISHED });
};

// Método estático: Buscar por categoría
CourseSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, status: CourseStatus.PUBLISHED });
};

// Índices
CourseSchema.index({ status: 1, createdAt: -1 });
CourseSchema.index({ category: 1, status: 1 });
CourseSchema.index({ instructor: 1, status: 1 });
CourseSchema.index({ 'pricing.amount': 1 });
CourseSchema.index({ 'stats.averageRating': -1 });
CourseSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Course = mongoose.model<ICourseDocument>('Course', CourseSchema);
