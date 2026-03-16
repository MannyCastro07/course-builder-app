import mongoose, { Schema, Document } from 'mongoose';
import { ILesson, LessonType, ContentStatus } from '../types';

export interface ILessonDocument extends ILesson, Document {
  getContentSummary(): string;
  isVideo(): boolean;
  isQuiz(): boolean;
}

const VideoResolutionSchema = new Schema({
  quality: {
    type: String,
    enum: ['240p', '360p', '480p', '720p', '1080p', '1440p', '4K'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  }
}, { _id: false });

const CaptionSchema = new Schema({
  language: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  }
}, { _id: false });

const QuizOptionSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
}, { _id: false });

const QuestionSchema = new Schema({
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'short_answer', 'essay'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [QuizOptionSchema],
  correctAnswer: Schema.Types.Mixed, // String o Array de Strings
  points: {
    type: Number,
    default: 1
  },
  explanation: String,
  order: {
    type: Number,
    required: true
  }
});

const ResourceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const LessonSchema = new Schema<ILessonDocument>(
  {
    section: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
      index: true
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'El título de la lección es requerido'],
      trim: true,
      maxlength: [200, 'El título no puede exceder 200 caracteres']
    },
    description: {
      type: String,
      maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
    },
    type: {
      type: String,
      enum: Object.values(LessonType),
      required: true
    },
    content: {
      video: {
        url: String,
        thumbnail: String,
        duration: Number,
        resolutions: [VideoResolutionSchema],
        captions: [CaptionSchema],
        processingStatus: {
          type: String,
          enum: Object.values(ContentStatus),
          default: ContentStatus.PENDING
        }
      },
      text: {
        body: String,
        formatted: {
          type: Boolean,
          default: true
        }
      },
      quiz: {
        questions: [QuestionSchema],
        settings: {
          timeLimit: Number, // en minutos
          maxAttempts: {
            type: Number,
            default: 1
          },
          passingScore: {
            type: Number,
            default: 70
          },
          shuffleQuestions: {
            type: Boolean,
            default: false
          },
          showCorrectAnswers: {
            type: Boolean,
            default: true
          },
          showExplanations: {
            type: Boolean,
            default: true
          }
        }
      },
      assignment: {
        instructions: {
          type: String,
          required: function() {
            return (this as any).type === LessonType.ASSIGNMENT;
          }
        },
        attachments: [ResourceSchema],
        submissionType: {
          type: String,
          enum: ['file', 'text', 'both'],
          default: 'both'
        },
        maxFileSize: {
          type: Number,
          default: 10 * 1024 * 1024 // 10MB
        },
        allowedFileTypes: [{
          type: String
        }],
        dueDate: Date,
        gradingCriteria: String,
        points: {
          type: Number,
          default: 100
        }
      },
      downloadable: {
        files: [ResourceSchema]
      },
      liveSession: {
        platform: {
          type: String,
          enum: ['zoom', 'teams', 'custom']
        },
        meetingUrl: String,
        meetingId: String,
        password: String,
        scheduledAt: Date,
        duration: Number,
        recordingUrl: String,
        isRecorded: {
          type: Boolean,
          default: false
        }
      }
    },
    order: {
      type: Number,
      required: true,
      min: 0
    },
    duration: {
      type: Number,
      min: 0,
      default: 0
    },
    isPreview: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    resources: [ResourceSchema],
    settings: {
      allowComments: {
        type: Boolean,
        default: true
      },
      requirePreviousLesson: {
        type: Boolean,
        default: false
      },
      freePreview: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual para verificar si tiene video
LessonSchema.virtual('hasVideo').get(function() {
  return this.type === LessonType.VIDEO && this.content?.video?.url;
});

// Virtual para verificar si es quiz
LessonSchema.virtual('hasQuiz').get(function() {
  return this.type === LessonType.QUIZ && this.content?.quiz?.questions?.length > 0;
});

// Middleware: Reordenar lecciones al insertar/actualizar
LessonSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('order')) {
    const existingLesson = await mongoose.model('Lesson').findOne({
      section: this.section,
      order: this.order,
      _id: { $ne: this._id }
    });
    
    if (existingLesson) {
      await mongoose.model('Lesson').updateMany(
        { section: this.section, order: { $gte: this.order }, _id: { $ne: this._id } },
        { $inc: { order: 1 } }
      );
    }
  }
  next();
});

// Middleware: Actualizar sección después de guardar
LessonSchema.post('save', async function() {
  try {
    const Section = mongoose.model('Section');
    await Section.findByIdAndUpdate(this.section, {
      $addToSet: { lessons: this._id }
    });
    
    // Actualizar estadísticas del curso
    const Course = mongoose.model('Course');
    const course = await Course.findById(this.course);
    if (course) {
      await course.calculateStats();
    }
  } catch (error) {
    console.error('Error updating section lessons:', error);
  }
});

// Middleware: Actualizar sección después de eliminar
LessonSchema.post('remove', async function() {
  try {
    const Section = mongoose.model('Section');
    await Section.findByIdAndUpdate(this.section, {
      $pull: { lessons: this._id }
    });
  } catch (error) {
    console.error('Error removing lesson from section:', error);
  }
});

// Método: Obtener resumen del contenido
LessonSchema.methods.getContentSummary = function(): string {
  switch (this.type) {
    case LessonType.VIDEO:
      const videoDuration = this.content?.video?.duration;
      return videoDuration 
        ? `Video de ${Math.floor(videoDuration / 60)} minutos`
        : 'Video';
    case LessonType.TEXT:
      const textLength = this.content?.text?.body?.length || 0;
      return `Lectura de ${Math.ceil(textLength / 1000)} minutos`;
    case LessonType.QUIZ:
      const questionCount = this.content?.quiz?.questions?.length || 0;
      return `Cuestionario con ${questionCount} preguntas`;
    case LessonType.ASSIGNMENT:
      return 'Tarea práctica';
    case LessonType.DOWNLOADABLE:
      const fileCount = this.content?.downloadable?.files?.length || 0;
      return `${fileCount} archivo(s) descargable(s)`;
    case LessonType.LIVE_SESSION:
      return 'Sesión en vivo';
    default:
      return 'Contenido';
  }
};

// Método: Verificar si es video
LessonSchema.methods.isVideo = function(): boolean {
  return this.type === LessonType.VIDEO;
};

// Método: Verificar si es quiz
LessonSchema.methods.isQuiz = function(): boolean {
  return this.type === LessonType.QUIZ;
};

// Método estático: Obtener lecciones de un curso ordenadas
LessonSchema.statics.findByCourse = function(courseId: string) {
  return this.find({ course: courseId }).sort({ order: 1 });
};

// Método estático: Obtener lecciones de una sección ordenadas
LessonSchema.statics.findBySection = function(sectionId: string) {
  return this.find({ section: sectionId }).sort({ order: 1 });
};

// Índices
LessonSchema.index({ course: 1, order: 1 });
LessonSchema.index({ section: 1, order: 1 });
LessonSchema.index({ type: 1 });
LessonSchema.index({ isPublished: 1 });
LessonSchema.index({ isPreview: 1 });

export const Lesson = mongoose.model<ILessonDocument>('Lesson', LessonSchema);
