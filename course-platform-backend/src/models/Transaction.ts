import mongoose, { Schema, Document } from 'mongoose';
import { ITransaction, PaymentStatus } from '../types';

export interface ITransactionDocument extends ITransaction, Document {
  generateInvoiceNumber(): string;
  canBeRefunded(): boolean;
}

const TransactionSchema = new Schema<ITransactionDocument>(
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
    type: {
      type: String,
      enum: ['purchase', 'refund', 'subscription', 'payout'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true
    },
    paymentMethod: {
      type: {
        type: String,
        enum: ['card', 'paypal', 'bank_transfer', 'crypto'],
        required: true
      },
      last4: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number
    },
    stripePaymentIntentId: {
      type: String,
      index: true
    },
    stripeChargeId: {
      type: String
    },
    invoiceUrl: {
      type: String
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual para monto formateado
TransactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Virtual para verificar si es compra
TransactionSchema.virtual('isPurchase').get(function() {
  return this.type === 'purchase';
});

// Middleware: Generar número de factura
TransactionSchema.pre('save', function(next) {
  if (this.isNew && !this.metadata?.invoiceNumber) {
    this.metadata = {
      ...this.metadata,
      invoiceNumber: this.generateInvoiceNumber()
    };
  }
  next();
});

// Método: Generar número de factura
TransactionSchema.methods.generateInvoiceNumber = function(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${year}${month}-${random}`;
};

// Método: Verificar si puede ser reembolsado
TransactionSchema.methods.canBeRefunded = function(): boolean {
  if (this.type !== 'purchase') return false;
  if (this.status !== PaymentStatus.COMPLETED) return false;
  
  // Verificar si ya pasaron 30 días
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.createdAt! >= thirtyDaysAgo;
};

// Método estático: Obtener transacciones de un usuario
TransactionSchema.statics.findByUser = function(userId: string) {
  return this.find({ user: userId })
    .populate('course', 'title thumbnail slug')
    .sort({ createdAt: -1 });
};

// Método estático: Obtener transacciones de un curso
TransactionSchema.statics.findByCourse = function(courseId: string) {
  return this.find({ course: courseId })
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Método estático: Calcular ingresos totales
TransactionSchema.statics.calculateRevenue = async function(
  filters: any = {}
): Promise<number> {
  const result = await this.aggregate([
    {
      $match: {
        type: 'purchase',
        status: PaymentStatus.COMPLETED,
        ...filters
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  return result[0]?.total || 0;
};

// Método estático: Calcular ingresos por mes
TransactionSchema.statics.getRevenueByMonth = async function(
  startDate: Date,
  endDate: Date
) {
  return this.aggregate([
    {
      $match: {
        type: 'purchase',
        status: PaymentStatus.COMPLETED,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1 }
    }
  ]);
};

// Índices
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ course: 1, createdAt: -1 });
TransactionSchema.index({ status: 1, type: 1 });
TransactionSchema.index({ stripePaymentIntentId: 1 });
TransactionSchema.index({ createdAt: -1 });

export const Transaction = mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);
