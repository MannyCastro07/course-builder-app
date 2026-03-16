import mongoose, { Schema, Document } from 'mongoose';
import { IMediaFile, ContentStatus } from '../types';

export interface IMediaFileDocument extends IMediaFile, Document {
  getPublicUrl(): string;
  isProcessing(): boolean;
}

const MediaVariantSchema = new Schema({
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
    required: true
  },
  width: Number,
  height: Number
}, { _id: false });

const MediaMetadataSchema = new Schema({
  width: Number,
  height: Number,
  duration: Number,
  codec: String,
  bitrate: Number,
  fps: Number
}, { _id: false });

const MediaFileSchema = new Schema<IMediaFileDocument>(
  {
    originalName: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true,
      unique: true
    },
    path: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      index: true
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      index: true
    },
    processingStatus: {
      type: String,
      enum: Object.values(ContentStatus),
      default: ContentStatus.PENDING
    },
    variants: [MediaVariantSchema],
    metadata: {
      type: MediaMetadataSchema,
      default: {}
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual para verificar si es imagen
MediaFileSchema.virtual('isImage').get(function() {
  return this.mimetype.startsWith('image/');
});

// Virtual para verificar si es video
MediaFileSchema.virtual('isVideo').get(function() {
  return this.mimetype.startsWith('video/');
});

// Virtual para verificar si es audio
MediaFileSchema.virtual('isAudio').get(function() {
  return this.mimetype.startsWith('audio/');
});

// Virtual para verificar si es documento
MediaFileSchema.virtual('isDocument').get(function() {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  return documentTypes.includes(this.mimetype);
});

// Virtual para tamaño formateado
MediaFileSchema.virtual('formattedSize').get(function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Método: Obtener URL pública
MediaFileSchema.methods.getPublicUrl = function(): string {
  return this.url;
};

// Método: Verificar si está procesando
MediaFileSchema.methods.isProcessing = function(): boolean {
  return this.processingStatus === ContentStatus.PROCESSING;
};

// Método estático: Obtener archivos por usuario
MediaFileSchema.statics.findByUser = function(userId: string) {
  return this.find({ uploadedBy: userId }).sort({ createdAt: -1 });
};

// Método estático: Obtener archivos por curso
MediaFileSchema.statics.findByCourse = function(courseId: string) {
  return this.find({ course: courseId }).sort({ createdAt: -1 });
};

// Método estático: Obtener archivos por estado de procesamiento
MediaFileSchema.statics.findByStatus = function(status: ContentStatus) {
  return this.find({ processingStatus: status });
};

// Método estático: Calcular uso de almacenamiento por usuario
MediaFileSchema.statics.calculateStorageUsage = async function(
  userId: string
): Promise<number> {
  const result = await this.aggregate([
    { $match: { uploadedBy: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$size' } } }
  ]);
  return result[0]?.total || 0;
};

// Índices
MediaFileSchema.index({ uploadedBy: 1, createdAt: -1 });
MediaFileSchema.index({ course: 1, createdAt: -1 });
MediaFileSchema.index({ lesson: 1 });
MediaFileSchema.index({ processingStatus: 1 });
MediaFileSchema.index({ mimetype: 1 });

export const MediaFile = mongoose.model<IMediaFileDocument>('MediaFile', MediaFileSchema);
