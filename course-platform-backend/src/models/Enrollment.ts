import mongoose, { Schema, Document } from 'mongoose';
import { IEnrollment, EnrollmentStatus } from '../types';

export interface IEnrollmentDocument extends IEnrollment, Document {
  updateProgress(lessonId: string, completed: boolean): Promise<void>;
  calculateOverallProgress(): number;
  canAccessLesson(lessonId: string): boolean;
  isCertificateEligible(): boolean;
}

const QuizResultSchema = new Schema({
  lesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  attempt: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  answers: [{
    questionId: String,
    answer: Schema.Types.Mixed,
    isCorrect: Boolean,
    points: Number
  }],
  passed: {
    type: Boolean,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number,
    default: 0
  }
}, { _id: false });

const AssignmentSubmissionSchema = new Schema({
  lesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  submission: String,
  attachments: [{
    name: String,
    type: String,
    url: String,
    size: Number,
    uploadedAt: Date
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  grade: Number,
  feedback: String,
  gradedAt: Date,
  gradedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'resubmit'],
    default: 'submitted'
  }
}, { _id: false });

const CertificateSchema = new Schema({
  issuedAt: {
    type: Date,
    default: Date.now
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String,
    required: true
  },
  template: {
    type: String,
    required: true
  }
}, { _id: false });

const EnrollmentSchema = new Schema<IEnrollmentDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.ACTIVE,
      index: true
    },
    progress: {
      overall: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      lessonsCompleted: [{
        type: Schema.Types.ObjectId,
        ref: 'Lesson'
      }],
      quizzesCompleted: [QuizResultSchema],
      assignmentsSubmitted: [AssignmentSubmissionSchema],
      lastAccessedLesson: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson'
      },
      lastAccessedAt: Date,
      timeSpent: {
        type: Number,
        default: 0
      }
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    completionDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    payment: {
      transactionId: {
        type: Schema.Types.ObjectId,
        ref: 'Transaction'
      },
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      paidAt: {
        type: Date,
        default: Date.now
      }
    },
    certificate: CertificateSchema,
    notes: {
      type: String,
      maxlength: 1000
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual para verificar si está completado
EnrollmentSchema.virtual('isCompleted').get(function() {
  return this.status === EnrollmentStatus.COMPLETED;
});

// Virtual para verificar si está activo
EnrollmentSchema.virtual('isActive').get(function() {
  return this.status === EnrollmentStatus.ACTIVE;
});

// Virtual para días desde la inscripción
EnrollmentSchema.virtual('daysSinceEnrollment').get(function() {
  return Math.floor((Date.now() - this.enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Middleware: Validar inscripción única
EnrollmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingEnrollment = await mongoose.model('Enrollment').findOne({
      user: this.user,
      course: this.course,
      status: { $nin: [EnrollmentStatus.REFUNDED, EnrollmentStatus.EXPIRED] }
    });
    
    if (existingEnrollment) {
      throw new Error('El usuario ya está inscrito en este curso');
    }
  }
  next();
});

// Middleware: Actualizar fecha de completado
EnrollmentSchema.pre('save', function(next) {
  if (this.isModified('progress.overall') && this.progress.overall >= 100 && !this.completionDate) {
    this.status = EnrollmentStatus.COMPLETED;
    this.completionDate = new Date();
  }
  next();
});

// Middleware: Actualizar contador de estudiantes del curso
EnrollmentSchema.post('save', async function() {
  try {
    if (this.isNew) {
      const Course = mongoose.model('Course');
      await Course.findByIdAndUpdate(this.course, {
        $inc: { 'stats.totalStudents': 1 }
      });
    }
  } catch (error) {
    console.error('Error updating course student count:', error);
  }
});

// Método: Actualizar progreso de una lección
EnrollmentSchema.methods.updateProgress = async function(
  lessonId: string,
  completed: boolean
): Promise<void> {
  const lessonObjectId = new mongoose.Types.ObjectId(lessonId);
  
  if (completed) {
    if (!this.progress.lessonsCompleted.some(id => id.toString() === lessonId)) {
      this.progress.lessonsCompleted.push(lessonObjectId);
    }
  } else {
    this.progress.lessonsCompleted = this.progress.lessonsCompleted.filter(
      id => id.toString() !== lessonId
    );
  }
  
  this.progress.lastAccessedLesson = lessonObjectId;
  this.progress.lastAccessedAt = new Date();
  this.progress.overall = this.calculateOverallProgress();
  
  await this.save();
};

// Método: Calcular progreso general
EnrollmentSchema.methods.calculateOverallProgress = function(): number {
  // Este método requiere conocer el total de lecciones del curso
  // Se calculará de forma más precisa en el servicio
  return this.progress.overall;
};

// Método: Verificar acceso a lección
EnrollmentSchema.methods.canAccessLesson = function(lessonId: string): boolean {
  // Verificar si el curso tiene contenido drip
  // Por ahora, permitir acceso si está inscrito
  return this.status === EnrollmentStatus.ACTIVE || this.status === EnrollmentStatus.COMPLETED;
};

// Método: Verificar elegibilidad para certificado
EnrollmentSchema.methods.isCertificateEligible = function(): boolean {
  if (!this.progress || this.progress.overall < 100) {
    return false;
  }
  return true;
};

// Método estático: Obtener inscripciones de un usuario
EnrollmentSchema.statics.findByUser = function(userId: string) {
  return this.find({ user: userId })
    .populate('course', 'title thumbnail slug instructor')
    .sort({ enrollmentDate: -1 });
};

// Método estático: Obtener inscripciones de un curso
EnrollmentSchema.statics.findByCourse = function(courseId: string) {
  return this.find({ course: courseId })
    .populate('user', 'firstName lastName email avatar')
    .sort({ enrollmentDate: -1 });
};

// Método estático: Verificar si usuario está inscrito
EnrollmentSchema.statics.isUserEnrolled = async function(
  userId: string,
  courseId: string
): Promise<boolean> {
  const enrollment = await this.findOne({
    user: userId,
    course: courseId,
    status: { $in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] }
  });
  return !!enrollment;
};

// Índices compuestos
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
EnrollmentSchema.index({ user: 1, status: 1 });
EnrollmentSchema.index({ course: 1, status: 1 });
EnrollmentSchema.index({ enrollmentDate: -1 });

export const Enrollment = mongoose.model<IEnrollmentDocument>('Enrollment', EnrollmentSchema);
