import dotenv from 'dotenv';

dotenv.config();

// ============================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================

export const config = {
  // Servidor
  server: {
    port: parseInt(process.env.PORT || '5000'),
    env: process.env.NODE_ENV || 'development',
    apiUrl: process.env.API_URL || 'http://localhost:5000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // Base de datos
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/course-platform',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret-key',
    accessExpiry: '15m',
    refreshExpiry: '7d'
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },

  // AWS S3
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    bucketName: process.env.AWS_S3_BUCKET || 'course-platform-media',
    cloudfrontUrl: process.env.AWS_CLOUDFRONT_URL
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
  },

  // Email
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    },
    from: process.env.SMTP_FROM || 'noreply@courseplatform.com'
  },

  // Almacenamiento
  storage: {
    maxFileSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
      document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ]
    }
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // máximo de peticiones por ventana
  },

  // Caché
  cache: {
    ttl: 60 * 60, // 1 hora en segundos
    checkPeriod: 60 * 10 // 10 minutos
  },

  // Paginación
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  },

  // Cursos
  course: {
    maxThumbnailSize: 5 * 1024 * 1024, // 5MB
    maxTrailerSize: 100 * 1024 * 1024, // 100MB
    maxVideoSize: 500 * 1024 * 1024, // 500MB
    videoQualities: ['240p', '360p', '480p', '720p', '1080p']
  },

  // Seguridad
  security: {
    bcryptRounds: 12,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    lockTime: 2 * 60 * 60 * 1000 // 2 horas
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.NODE_ENV === 'production'
  }
};

// ============================================
// VALIDACIÓN DE CONFIGURACIÓN
// ============================================

export const validateConfig = (): void => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'MONGODB_URI'
  ];

  const missing = requiredEnvVars.filter(
    envVar => !process.env[envVar]
  );

  if (missing.length > 0) {
    console.warn('⚠️  Variables de entorno faltantes:', missing.join(', '));
    console.warn('Usando valores por defecto para desarrollo');
  }

  // Validar configuración de producción
  if (config.server.env === 'production') {
    const productionRequired = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'STRIPE_SECRET_KEY'
    ];

    const productionMissing = productionRequired.filter(
      envVar => !process.env[envVar]
    );

    if (productionMissing.length > 0) {
      throw new Error(
        `Variables requeridas en producción faltantes: ${productionMissing.join(', ')}`
      );
    }
  }
};

// ============================================
// EXPORTAR CONFIGURACIÓN POR DEFECTO
// ============================================

export default config;
