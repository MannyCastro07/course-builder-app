import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';
import { IWebhook, WebhookEvent } from '../types';

export interface IWebhookDocument extends IWebhook, Document {
  generateSignature(payload: any): string;
  verifySignature(payload: any, signature: string): boolean;
}

const WebhookSchema = new Schema<IWebhookDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    url: {
      type: String,
      required: [true, 'La URL del webhook es requerida'],
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'La URL debe ser una URL válida (http o https)'
      }
    },
    events: [{
      type: String,
      enum: Object.values(WebhookEvent),
      required: true
    }],
    secret: {
      type: String,
      required: true,
      select: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastTriggeredAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual para conteo de eventos
WebhookSchema.virtual('eventCount').get(function() {
  return this.events.length;
});

// Middleware: Generar secreto antes de guardar
WebhookSchema.pre('save', function(next) {
  if (this.isNew && !this.secret) {
    this.secret = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Método: Generar firma HMAC
WebhookSchema.methods.generateSignature = function(payload: any): string {
  const hmac = crypto.createHmac('sha256', this.secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
};

// Método: Verificar firma
WebhookSchema.methods.verifySignature = function(
  payload: any,
  signature: string
): boolean {
  const expectedSignature = this.generateSignature(payload);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

// Método estático: Obtener webhooks por usuario
WebhookSchema.statics.findByUser = function(userId: string) {
  return this.find({ user: userId, isActive: true });
};

// Método estático: Obtener webhooks por evento
WebhookSchema.statics.findByEvent = function(event: WebhookEvent) {
  return this.find({
    events: { $in: [event] },
    isActive: true
  });
};

// Método estático: Actualizar última ejecución
WebhookSchema.statics.updateLastTriggered = async function(
  webhookId: string
): Promise<void> {
  await this.findByIdAndUpdate(webhookId, {
    lastTriggeredAt: new Date()
  });
};

// Índices
WebhookSchema.index({ user: 1, isActive: 1 });
WebhookSchema.index({ events: 1 });

export const Webhook = mongoose.model<IWebhookDocument>('Webhook', WebhookSchema);
