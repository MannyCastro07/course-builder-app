import mongoose, { Schema, Document } from 'mongoose';
import { INotification, NotificationType } from '../types';

export interface INotificationDocument extends INotification, Document {
  markAsRead(): Promise<void>;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000
    },
    data: {
      type: Schema.Types.Mixed,
      default: {}
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual para verificar si es nueva
NotificationSchema.virtual('isNew').get(function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt! > oneDayAgo;
});

// Middleware: Actualizar readAt al marcar como leída
NotificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Método: Marcar como leída
NotificationSchema.methods.markAsRead = async function(): Promise<void> {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
};

// Método estático: Obtener notificaciones no leídas de un usuario
NotificationSchema.statics.findUnreadByUser = function(userId: string) {
  return this.find({ user: userId, isRead: false })
    .sort({ sentAt: -1 });
};

// Método estático: Obtener todas las notificaciones de un usuario
NotificationSchema.statics.findByUser = function(userId: string, limit: number = 50) {
  return this.find({ user: userId })
    .sort({ sentAt: -1 })
    .limit(limit);
};

// Método estático: Contar notificaciones no leídas
NotificationSchema.statics.countUnread = async function(userId: string): Promise<number> {
  return this.countDocuments({ user: userId, isRead: false });
};

// Método estático: Marcar todas como leídas
NotificationSchema.statics.markAllAsRead = async function(
  userId: string
): Promise<void> {
  await this.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Índices
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ user: 1, sentAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ sentAt: -1 });

export const Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
